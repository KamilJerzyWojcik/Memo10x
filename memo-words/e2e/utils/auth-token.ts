/// <reference types="node" />
import * as fs from 'fs'
import * as path from 'path'
import { request } from '@playwright/test'

async function fetchSupabaseAccessToken(email: string, password: string): Promise<string> {
  const supabaseUrl = process.env.VITE_SUPABASE_URL
  const anonKey = process.env.VITE_SUPABASE_ANON_KEY
  if (!supabaseUrl || !anonKey) {
    throw new Error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY for token fallback.')
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
    if (!res.ok()) throw new Error(`Supabase auth failed: ${res.status()} ${await res.text()}`)
    const json = await res.json() as { access_token?: string }
    if (!json.access_token) throw new Error('Supabase response missing access_token')
    return json.access_token
  } finally {
    await ctx.dispose()
  }
}

export async function readAuthTokenFromStorage(storageStatePath: string, originBaseUrl: string): Promise<string> {
  const fullPath = path.resolve(storageStatePath)
  const json = JSON.parse(fs.readFileSync(fullPath, 'utf-8')) as {
    origins?: Array<{ origin: string; localStorage?: Array<{ name: string; value: string }> }>
  }
  const originUrl = new URL(originBaseUrl)
  const origin = `${originUrl.protocol}//${originUrl.host}`
  const entry = json.origins?.find(o => o.origin === origin)
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
      // ignore
    }
  }
  // Fallback: fetch directly from Supabase using credentials from .env
  const email = process.env.VITE_E2E_USERNAME || process.env.E2E_USERNAME || process.env.E2E_EMAIL
  const password = process.env.VITE_E2E_PASSWORD || process.env.E2E_PASSWORD
  if (!email || !password) {
    throw new Error('Access token not found in storage state. Missing E2E credentials for fallback.')
  }
  return await fetchSupabaseAccessToken(email, password)
}


