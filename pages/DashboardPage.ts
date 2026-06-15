import { expect, Page } from '@playwright/test'

export class DashboardPage {
  constructor(private readonly page: Page) {}

  pageRoot() { return this.page.getByTestId('page-dashboard') }
  greeting() { return this.page.getByTestId('dash-greeting') }
  subtitle() { return this.page.getByTestId('dash-subtitle') }
  kpiGrid() { return this.page.getByTestId('kpi-grid') }
  kpiCard(name: string) { return this.page.getByTestId(`kpi-${name}`) }
  kpiValue(name: string) { return this.page.getByTestId(`kpi-${name}-value`) }
  kpiTrend(name: string) { return this.page.getByTestId(`kpi-${name}-trend`) }
  activityList() { return this.page.getByTestId('activity-list') }
  activityItem(n: number) { return this.page.getByTestId(`activity-item-${n}`) }
  healthStatus() { return this.page.getByTestId('health-status') }
  healthBar(suite: string) { return this.page.getByTestId(`health-${suite}`) }
  healthPct(suite: string) { return this.page.getByTestId(`health-${suite}-pct`) }
  newRunBtn() { return this.page.getByTestId('btn-new-run') }
  runModal() { return this.page.getByTestId('run-modal-overlay') }
  runSuiteSelect() { return this.page.getByTestId('run-suite') }
  runEnvSelect() { return this.page.getByTestId('run-env') }
  runConfirmBtn() { return this.page.getByTestId('run-modal-confirm') }
  runCancelBtn() { return this.page.getByTestId('run-modal-cancel') }
  quickAction(name: string) { return this.page.getByTestId(`qa-${name}`) }

  async openNewRunModal() {
    await this.newRunBtn().click()
    await expect(this.runModal()).toBeVisible()
    return this
  }

  async selectSuite(suite: string) {
    await this.runSuiteSelect().selectOption(suite)
    return this
  }

  async selectEnvironment(env: string) {
    await this.runEnvSelect().selectOption(env)
    return this
  }

  async confirmRun() {
    await this.runConfirmBtn().click()
    return this
  }

  async cancelRun() {
    await this.runCancelBtn().click()
    return this
  }

  async shouldBeLoaded() {
    await expect(this.pageRoot()).toBeVisible()
    return this
  }

  async shouldShowGreeting() {
    await expect(this.greeting()).toBeVisible()
    await expect(this.greeting()).toHaveText(/Good (morning|afternoon|evening),/)
    return this
  }

  async shouldHaveAllKpiCards() {
    for (const key of ['runs', 'passrate', 'members', 'issues']) {
      await expect(this.kpiCard(key)).toBeVisible()
      await expect(this.kpiValue(key)).not.toBeEmpty()
    }
    return this
  }

  async shouldHaveActivityItems(count = 5) {
    await expect(this.activityList().locator('[data-testid^="activity-item-"]')).toHaveCount(count)
    return this
  }

  async shouldShowRunModalOpen() {
    await expect(this.runModal()).toBeVisible()
    return this
  }

  async shouldShowRunModalClosed() {
    await expect(this.runModal()).not.toBeVisible()
    return this
  }
}
