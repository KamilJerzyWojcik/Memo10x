import type { Page, Locator } from '@playwright/test'
import { BasePage } from './base.page'

export class CardsListPagePO extends BasePage {
  constructor(page: Page) {
    super(page)
  }

  async goto(): Promise<void> {
    await super.goto('/cards')
    await this.page.getByRole('button', { name: 'Dodaj kartę' }).waitFor({ state: 'visible' })
    // Poczekaj aż ewentualny overlay ładowania zniknie
    await this.page.locator('text=Trwa ładowanie…').waitFor({ state: 'detached' }).catch(() => {})
  }

  private itemBySource(sourceText: string): Locator {
    // Każdy element to <li> zawierający sourceText
    return this.page.locator('li', { hasText: sourceText })
  }

  async expectCardVisible(sourceText: string): Promise<void> {
    await this.itemBySource(sourceText).first().waitFor({ state: 'visible' })
  }

  async openEditFor(sourceText: string): Promise<void> {
    const row = this.itemBySource(sourceText).first()
    await row.getByRole('button', { name: 'Edytuj' }).click()
  }

  async deleteCard(sourceText: string): Promise<void> {
    const row = this.itemBySource(sourceText).first()
    await row.getByRole('button', { name: 'Usuń' }).click()
    // Poczekaj aż pojawi się globalny alertdialog potwierdzenia i dopiero kliknij "Tak"
    const confirm = this.page.getByRole('alertdialog', { name: 'Potwierdzenie usunięcia' })
    await confirm.waitFor({ state: 'visible' })
    await confirm.getByRole('button', { name: 'Tak' }).click()
  }
}


