import type { Page } from '@playwright/test'
import { BasePage } from './base.page'
import { CardFormPO } from './card-form.po'

export class AddCardPagePO extends BasePage {
  readonly form: CardFormPO

  constructor(page: Page) {
    super(page)
    this.form = new CardFormPO(page)
  }

  async goto(): Promise<void> {
    await super.goto('/cards/add')
  }

  async createCardViaAI(sourceText: string): Promise<void> {
    await this.form.typeSource(sourceText)
    await this.form.clickGenerate()
    await this.form.submitForm()
  }

  async createCardManual(sourceText: string, targetText: string): Promise<void> {
    await this.form.typeSource(sourceText)
    await this.form.typeTarget(targetText)
    await this.form.submitForm()
  }

  async cancel(): Promise<void> {
    await this.form.cancelForm()
  }
}


