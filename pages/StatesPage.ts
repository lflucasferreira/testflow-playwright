import { expect, Page } from '@playwright/test'

export class StatesPage {
  constructor(private readonly page: Page) {}

  pageRoot() { return this.page.getByTestId('page-states') }
  skeletonTrigger() { return this.page.getByTestId('skeleton-trigger') }
  skeletonReset() { return this.page.getByTestId('skeleton-reset') }
  skeletonContainer() { return this.page.getByTestId('skeleton-container') }
  skeletonIdle() { return this.page.getByTestId('skeleton-idle') }
  emptySearch() { return this.page.getByTestId('empty-search') }
  emptyState() { return this.page.getByTestId('empty-state') }
  resultList() { return this.page.getByTestId('result-list') }
  errorTrigger() { return this.page.getByTestId('error-trigger') }
  successTrigger() { return this.page.getByTestId('success-trigger') }
  errorContainer() { return this.page.getByTestId('error-container') }
  partialTrigger() { return this.page.getByTestId('partial-trigger') }
  partialReset() { return this.page.getByTestId('partial-reset') }
  partialGrid() { return this.page.getByTestId('partial-grid') }

  async loadSkeletonCards() {
    await this.skeletonTrigger().click()
    return this
  }

  async resetSkeleton() {
    await this.skeletonReset().click()
    return this
  }

  async searchEmpty(term: string) {
    await this.emptySearch().fill(term)
    return this
  }

  async triggerErrorFetch() {
    await this.errorTrigger().click()
    return this
  }

  async triggerSuccessFetch() {
    await this.successTrigger().click()
    return this
  }

  async loadPartialGrid() {
    await this.partialTrigger().click()
    return this
  }

  async resetPartialGrid() {
    await this.partialReset().click()
    return this
  }

  async shouldShowSkeletonLoading() {
    await expect(this.skeletonContainer()).toBeVisible()
    return this
  }

  async shouldShowEmptyState() {
    await expect(this.emptyState()).toBeVisible()
    await expect(this.resultList()).not.toBeVisible()
    return this
  }

  async shouldShowErrorState() {
    await expect(this.errorContainer()).toBeVisible()
    await expect(this.errorContainer()).not.toBeEmpty()
    return this
  }

  async shouldShowPartialGrid() {
    await expect(this.partialGrid()).toBeVisible()
    return this
  }
}
