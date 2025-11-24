import { test, expect } from '@playwright/test'
import { AddCardPagePO } from '../page-objects/add-card.page'

test.describe('Cards - validation', () => {
  test('Walidacja pustego źródła', async ({ page }) => {
    const add = new AddCardPagePO(page)
    await add.goto()
    await add.form.submitForm()
    await expect(add.form.sourceError).toBeVisible()
  })

  test('Generate disabled bez źródła', async ({ page }) => {
    const add = new AddCardPagePO(page)
    await add.goto()
    await expect(add.form.generate).toBeDisabled()
  })

  test('Liczniki znaków', async ({ page }) => {
    const add = new AddCardPagePO(page)
    await add.goto()
    await add.form.typeSource('abc')
    await add.form.typeTarget('xyz')
    await add.form.expectCounts(3, 3)
  })
})


