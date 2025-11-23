import { expect, type Locator, type Page } from '@playwright/test'

export class CardFormPO {
  constructor(private readonly page: Page) {}

  get root(): Locator { return this.page.getByTestId('cardform') }
  get source(): Locator { return this.page.getByTestId('cardform-source') }
  get sourceError(): Locator { return this.page.getByTestId('cardform-source-error') }
  get sourceCount(): Locator { return this.page.getByTestId('cardform-source-count') }
  get target(): Locator { return this.page.getByTestId('cardform-target') }
  get targetError(): Locator { return this.page.getByTestId('cardform-target-error') }
  get targetCount(): Locator { return this.page.getByTestId('cardform-target-count') }
  get generate(): Locator { return this.page.getByTestId('cardform-generate') }
  get generateSpinner(): Locator { return this.page.getByTestId('cardform-generate-spinner') }
  get submit(): Locator { return this.page.getByTestId('cardform-submit') }
  get cancel(): Locator { return this.page.getByTestId('cardform-cancel') }

  async typeSource(text: string): Promise<void> {
    await this.source.fill('')
    await this.source.type(text)
  }

  async typeTarget(text: string): Promise<void> {
    await this.target.fill('')
    await this.target.type(text)
  }

  async clickGenerate(): Promise<void> {
    await this.generate.click()
    await this.generateSpinner.waitFor({ state: 'detached' })
  }

  async submitForm(): Promise<void> {
    await this.submit.click()
  }

  async cancelForm(): Promise<void> {
    await this.cancel.click()
  }

  async expectSourceError(message: RegExp | string): Promise<void> {
    await expect(this.sourceError).toBeVisible()
    await expect(this.sourceError).toHaveText(message)
  }

  async expectTargetError(message: RegExp | string): Promise<void> {
    await expect(this.targetError).toBeVisible()
    await expect(this.targetError).toHaveText(message)
  }

  async expectCounts(sourceCount: number | string, targetCount: number | string): Promise<void> {
    await expect(this.sourceCount).toHaveText(String(sourceCount))
    await expect(this.targetCount).toHaveText(String(targetCount))
  }
}


