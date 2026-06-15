import { expect, Page } from '@playwright/test'

export class ActivityPage {
  constructor(private readonly page: Page) {}

  pageRoot() { return this.page.getByTestId('page-activity') }
  fetchUsersBtn() { return this.page.getByTestId('fetch-users-btn') }
  fetchSlowBtn() { return this.page.getByTestId('fetch-slow-btn') }
  apiResult() { return this.page.getByTestId('api-result') }
  counterValue() { return this.page.getByTestId('counter-value') }
  counterIncrement() { return this.page.getByTestId('counter-increment') }
  counterDecrement() { return this.page.getByTestId('counter-decrement') }
  counterReset() { return this.page.getByTestId('counter-reset') }
  counterBadge() { return this.page.getByTestId('counter-badge') }
  progressStart() { return this.page.getByTestId('progress-start') }
  downloadProgress() { return this.page.getByTestId('download-progress') }
  pipelinePct() { return this.page.getByTestId('pipeline-pct') }
  pipelineBadge() { return this.page.getByTestId('pipeline-status-badge') }
  loadDynamicBtn() { return this.page.getByTestId('load-dynamic-btn') }
  dynamicContent() { return this.page.getByTestId('dynamic-content') }
  dropZone() { return this.page.getByTestId('drop-zone') }
  pageNextBtn() { return this.page.getByTestId('page-next-btn') }
  pageBackBtn() { return this.page.getByTestId('page-back-btn') }

  async fetchUsers() {
    await this.fetchUsersBtn().click()
    return this
  }

  async incrementCounter(times = 1) {
    for (let i = 0; i < times; i += 1) {
      await this.counterIncrement().click()
    }
    return this
  }

  async startPipeline() {
    await this.progressStart().click()
    return this
  }

  async loadDynamicContent() {
    await this.loadDynamicBtn().click()
    return this
  }

  async shouldShowApiResult() {
    await expect(this.apiResult()).toBeVisible()
    await expect(this.apiResult()).not.toBeEmpty()
    return this
  }

  async shouldShowCounter(value: string | number) {
    await expect(this.counterValue()).toContainText(String(value))
    return this
  }

  async shouldShowDynamicContent() {
    await expect(this.dynamicContent()).toBeVisible()
    await expect(this.dynamicContent()).not.toBeEmpty()
    return this
  }

  async shouldShowPipelineProgress(minPct = 1) {
    const text = await this.pipelinePct().innerText()
    const pct = parseInt(text.replace('%', ''), 10)
    expect(pct).toBeGreaterThanOrEqual(minPct)
    return this
  }
}
