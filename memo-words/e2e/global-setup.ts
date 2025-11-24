/// <reference types="node" />
import 'dotenv/config'
import { chromium, request, type FullConfig, expect } from '@playwright/test'
import { spawn } from 'child_process'
import * as fs from 'fs'
import * as path from 'path'
import { fileURLToPath } from 'url'

async function wait(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function ensureDevServer(baseURL: string, projectRoot: string): Promise<void> {
  // Try quick probe
  const ctx = await request.newContext()
  try {
    const res = await ctx.get(`${baseURL}/`, { timeout: 2000 })
    if (res.ok()) {
      await ctx.dispose()
      return
    }
  } catch {
    // fallthrough
  } finally {
    await ctx.dispose()
  }

  // Start Vite dev server (npm run dev) and wait until it's reachable
  const child = spawn('npm', ['run', 'dev'], {
    cwd: projectRoot,
    shell: true,
    stdio: 'ignore',
    env: { ...process.env },
  })
  // Poll until server responds
  const maxWaitMs = 120_000
  const start = Date.now()
  const probeCtx = await request.newContext()
  try {
    while (Date.now() - start < maxWaitMs) {
      try {
        const res = await probeCtx.get(`${baseURL}/login`, { timeout: 2000 })
        if (res.ok() || res.status() === 404) break
      } catch {
        // not ready yet
      }
      await wait(500)
    }
  } finally {
    await probeCtx.dispose()
  }
}

function ensureDir(dirPath: string): void {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true })
  }
}

async function fetchSupabaseAccessToken(email: string, password: string): Promise<string> {
  const supabaseUrl = process.env.VITE_SUPABASE_URL
  const anonKey = process.env.VITE_SUPABASE_ANON_KEY
  if (!supabaseUrl || !anonKey) {
    throw new Error('Brak VITE_SUPABASE_URL lub VITE_SUPABASE_ANON_KEY w .env – nie można pobrać tokena z Supabase.')
  }
  const ctx = await request.newContext({
    baseURL: supabaseUrl,
    extraHTTPHeaders: {
      apikey: anonKey,
      'Content-Type': 'application/json',
    },
  })
  try {
    const res = await ctx.post('/auth/v1/token?grant_type=password', { data: { email, password } })
    if (!res.ok()) {
      const body = await res.text()
      throw new Error(`Supabase auth failed: ${res.status()} ${body}`)
    }
    const json = await res.json() as { access_token?: string }
    if (!json.access_token) {
      throw new Error('Supabase response missing access_token')
    }
    return json.access_token
  } finally {
    await ctx.dispose()
  }
}

async function performUiLoginAndSaveState(baseURL: string, storagePath: string): Promise<void> {
  const email = process.env.VITE_E2E_USERNAME || process.env.E2E_USERNAME || process.env.E2E_EMAIL
  const password = process.env.VITE_E2E_PASSWORD || process.env.E2E_PASSWORD
  if (!email || !password) {
    throw new Error('Brak VITE_E2E_USERNAME/E2E_USERNAME i/lub VITE_E2E_PASSWORD/E2E_PASSWORD w zmiennych środowiskowych.')
  }

  const browser = await chromium.launch()
  const context = await browser.newContext()
  const page = await context.newPage()

  await page.goto(`${baseURL}/login`)
  await page.getByLabel('E-mail').fill(email)
  await page.getByLabel('Hasło').fill(password)
  await page.getByRole('button', { name: 'Zaloguj się' }).click()
  // Poczekaj aż Supabase zapisze sesję w localStorage (klucz 'sb-*-auth-token')
  await page.waitForFunction(() => {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i) || ''
      if (key.startsWith('sb-') && key.includes('auth-token')) {
        try {
          const raw = localStorage.getItem(key)
          if (!raw) continue
          const parsed = JSON.parse(raw)
          if (parsed?.access_token) return true
          if (parsed?.currentSession?.access_token) return true
          if (parsed?.session?.access_token) return true
        } catch {}
      }
    }
    return false
  }, { timeout: 15000 })

  // Po zalogowaniu przejdź na listę kart, aby upewnić się, że sesja działa
  await page.goto(`${baseURL}/cards`)
  // Czekaj na finalny URL i widoczność elementów strony listy
  await page.waitForURL('**/cards', { timeout: 15000 })
  await expect(page.getByRole('button', { name: 'Dodaj kartę' })).toBeVisible({ timeout: 15000 })
  // Stabilizacja i zapis storage state (bez 'networkidle' z uwagi na HMR Vite)
  ensureDir(path.dirname(storagePath))
  await context.storageState({ path: storagePath })

  await browser.close()
  return
}

// Lekko tolerancyjna ekstrakcja tokena z storageState
function extractAccessTokenFromStorageState(storageStatePath: string, origin: string): string {
  const raw = fs.readFileSync(storageStatePath, 'utf-8')
  const state = JSON.parse(raw) as {
    origins?: Array<{ origin: string; localStorage?: Array<{ name: string; value: string }> }>
  }
  const entry = state.origins?.find(o => o.origin === origin)
  const store = entry?.localStorage ?? []
  for (const kv of store) {
    if (kv.name === 'sb-access-token' || kv.name === 'access_token') {
      if (kv.value && kv.value.trim().length > 0) return kv.value
    }
    try {
      const parsed = JSON.parse(kv.value)
      if (typeof parsed?.access_token === 'string') return parsed.access_token
      if (typeof parsed?.currentSession?.access_token === 'string') return parsed.currentSession.access_token
      if (typeof parsed?.session?.access_token === 'string') return parsed.session.access_token
    } catch {
      // not JSON, ignore
    }
  }
  throw new Error('Nie znaleziono access_token w storageState.')
}

async function cleanupUserData(baseApiUrl: string, token: string): Promise<void> {
  const ctx = await request.newContext({
    baseURL: baseApiUrl,
    ignoreHTTPSErrors: true,
    extraHTTPHeaders: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  })
  try {
    // Pobierz i usuń wszystkie karty (stronicowanie defensywnie do kilku stron)
    const pageSize = 100
    for (let page = 1; page <= 10; page++) {
      const res = await ctx.get(`/api/v1/cards?page=${page}&pageSize=${pageSize}`)
      if (!res.ok()) break
      const data = (await res.json()) as { items: Array<{ id: string }> }
      const items = data?.items ?? []
      if (items.length === 0) break
      await Promise.all(items.map(x => ctx.delete(`/api/v1/cards/${encodeURIComponent(x.id)}`)))
      if (items.length < pageSize) break
    }
  } finally {
    await ctx.dispose()
  }
}

export default async function globalSetup(config: FullConfig): Promise<void> {
  const baseURL = (config.projects?.[0]?.use as any)?.baseURL || 'http://localhost:5173'
  // Ścieżki
  const __filename = fileURLToPath(import.meta.url)
  const __dirname = path.dirname(__filename)
  const repoRoot = path.resolve(__dirname, '..') // memo-words/
  const projectRoot = repoRoot
  const storagePath = path.resolve(repoRoot, 'e2e/.auth/storageState.json')

  // Upewnij się, że dev server działa, zanim zalogujemy się przez UI
  await ensureDevServer(baseURL, projectRoot)

  // Login i zapis storageState
  await performUiLoginAndSaveState(baseURL, storagePath)

  // Token do czyszczenia danych – spróbuj z storageState, w razie potrzeby fallback do Supabase REST
  let token: string
  try {
    const originUrl = new URL(baseURL)
    const origin = `${originUrl.protocol}//${originUrl.host}`
    token = extractAccessTokenFromStorageState(storagePath, origin)
  } catch {
    const email = process.env.VITE_E2E_USERNAME || process.env.E2E_USERNAME || process.env.E2E_EMAIL
    const password = process.env.VITE_E2E_PASSWORD || process.env.E2E_PASSWORD
    if (!email || !password) {
      throw new Error('Brak danych do pobrania tokenu (fallback) – ustaw VITE_E2E_USERNAME i VITE_E2E_PASSWORD.')
    }
    token = await fetchSupabaseAccessToken(email, password)
  }

  const apiBase = process.env.VITE_API_BASE_URL || 'https://localhost:7048'
  await cleanupUserData(apiBase, token)
}


