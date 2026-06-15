import { expect, Page } from '@playwright/test'

export class ComponentsPage {
  constructor(private readonly page: Page) {}

  pageRoot() { return this.page.getByTestId('page-components') }
  openModalBtn() { return this.page.getByTestId('open-modal-btn') }
  modalOverlay() { return this.page.getByTestId('modal-overlay') }
  modalConfirmBtn() { return this.page.getByTestId('modal-confirm-btn') }
  modalCancelBtn() { return this.page.getByTestId('modal-cancel-btn') }
  modalCloseBtn() { return this.page.getByTestId('modal-close-btn') }
  toastMessage() { return this.page.getByTestId('toast-message') }
  dialogResult() { return this.page.getByTestId('dialog-result') }
  tabOverview() { return this.page.getByTestId('tab-overview') }
  tabCypress() { return this.page.getByTestId('tab-cypress') }
  tabPlaywright() { return this.page.getByTestId('tab-playwright') }
  tabPanelOverview() { return this.page.getByTestId('tab-panel-overview') }
  tabPanelCypress() { return this.page.getByTestId('tab-panel-cypress') }
  tabPanelPlaywright() { return this.page.getByTestId('tab-panel-playwright') }
  accordionTrigger(n: number) { return this.page.getByTestId(`accordion-trigger-${n}`) }
  accordionPanel(n: number) { return this.page.getByTestId(`accordion-panel-${n}`) }

  button(testId: string) { return this.page.getByTestId(testId) }

  async openModal() {
    await this.openModalBtn().click()
    await expect(this.modalOverlay()).toBeVisible()
    return this
  }

  async shouldShowPage() {
    await expect(this.pageRoot()).toBeVisible()
    return this
  }
}
