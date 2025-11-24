/// <reference types="node" />
import { test, expect } from '@playwright/test'
import { AddCardPagePO } from '../page-objects/add-card.page'
import { CardsListPagePO } from '../page-objects/cards-list.page'
import { withTs } from '../utils/timestamp'
import { readAuthTokenFromStorage } from '../utils/auth-token'
import { createApi, type CardDto } from '../utils/api'

test.describe.configure({ mode: 'serial' })

test.describe('Cards - add', () => {
  let token: string
  const storagePath = 'e2e/.auth/storageState.json'
  const appBaseUrl = 'http://localhost:5173'
  const apiBaseUrl = process.env.VITE_API_BASE_URL || 'https://localhost:7048'

  test.beforeAll(async () => {
    token = await readAuthTokenFromStorage(storagePath, appBaseUrl)
  })

  test('Dodanie karty manualnie', async ({ page, request }) => {
    const add = new AddCardPagePO(page)
    const list = new CardsListPagePO(page)
    const api = createApi(request, apiBaseUrl, token)

    const source = withTs('Hello')
    const target = withTs('Cześć')

    await add.goto()
    await add.form.typeSource(source)
    await add.form.typeTarget(target)
    await add.form.submitForm()

    await list.expectCardVisible(source)
    const all: CardDto[] = await api.listAllCards()
    expect(all.some(c => c.sourceText === source && c.targetText === target)).toBeTruthy()
  })

  test('Dodanie karty przez AI', async ({ page, request }) => {
    const add = new AddCardPagePO(page)
    const list = new CardsListPagePO(page)
    const api = createApi(request, apiBaseUrl, token)

    const source = withTs('Planet')

    await add.goto()
    await add.form.typeSource(source)
    await add.form.clickGenerate()
    await expect(add.form.target).not.toHaveValue('')
    await add.form.submitForm()

    await list.expectCardVisible(source)
    const all: CardDto[] = await api.listAllCards()
    expect(all.some(c => c.sourceText === source && (c.targetText?.length ?? 0) > 0)).toBeTruthy()
  })
})


