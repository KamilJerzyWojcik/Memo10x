/// <reference types="node" />
import { test, expect } from '@playwright/test'
import { AddCardPagePO } from '../page-objects/add-card.page'
import { withTs } from '../utils/timestamp'
import { readAuthTokenFromStorage } from '../utils/auth-token'
import { createApi } from '../utils/api'

test.describe('Cards - cancel', () => {
  const storagePath = 'e2e/.auth/storageState.json'
  const appBaseUrl = 'http://localhost:5173'
  const apiBaseUrl = process.env.VITE_API_BASE_URL || 'https://localhost:7048'

  test('Anulowanie nie tworzy karty', async ({ page, request }) => {
    const token = await readAuthTokenFromStorage(storagePath, appBaseUrl)
    const api = createApi(request, apiBaseUrl, token)

    const before = (await api.listAllCards()).length

    const add = new AddCardPagePO(page)
    await add.goto()
    await add.form.typeSource(withTs('Cancel Source'))
    await add.form.typeTarget(withTs('Cancel Target'))
    await add.cancel()

    const after = (await api.listAllCards()).length
    expect(after).toBe(before)
  })
})


