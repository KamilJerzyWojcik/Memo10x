import type { Page } from '@playwright/test'
import { BasePage } from './base.page'
import { CardFormPO } from './card-form.po'

export class EditCardPagePO extends BasePage {
  readonly form: CardFormPO

  constructor(page: Page) {
    super(page)
    this.form = new CardFormPO(page)
  }

  async goto(id: string): Promise<void> {
    await super.goto(`/cards/${encodeURIComponent(id)}/edit`)
  }

  async updateTarget(newText: string): Promise<void> {
    await this.form.typeTarget(newText)
    await this.form.submitForm()
  }

  async generateAndUpdate(): Promise<void> {
    await this.form.clickGenerate()
    await this.form.submitForm()
  }
}


