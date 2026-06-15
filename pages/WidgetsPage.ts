import { expect, Page } from '@playwright/test'
import path from 'node:path'

export class WidgetsPage {
  constructor(private readonly page: Page) {}

  pageRoot() { return this.page.getByTestId('page-widgets') }
  sectionCheckboxes() { return this.page.getByTestId('section-checkboxes') }
  sectionRadios() { return this.page.getByTestId('section-radios') }
  sectionFileUpload() { return this.page.getByTestId('section-file-upload') }
  sectionJobs() { return this.page.getByTestId('section-jobs-table') }
  sectionNativeSelect() { return this.page.getByTestId('section-native-select') }
  sectionAlerts() { return this.page.getByTestId('section-alerts') }
  sectionCadastro() { return this.page.getByTestId('section-cadastro') }
  sectionHover() { return this.page.getByTestId('section-hover') }
  sectionKeyboard() { return this.page.getByTestId('section-keyboard') }
  sectionRandom() { return this.page.getByTestId('section-random') }
  sectionSelect2() { return this.page.getByTestId('section-select2') }
  sectionSelect2Multi() { return this.page.getByTestId('section-select2-multi') }
  sectionNewTab() { return this.page.getByTestId('section-new-tab') }
  sectionDragSwap() { return this.page.getByTestId('section-drag-swap') }
  sectionListGroup() { return this.page.getByTestId('section-list-group') }
  sectionIframes() { return this.page.getByTestId('section-iframes') }
  select2Os() { return this.page.getByTestId('select2-os') }
  select2OsMulti() { return this.page.getByTestId('select2-os-multi') }
  osToggle() { return this.page.getByTestId('os-toggle') }
  osMultiToggle() { return this.page.getByTestId('os-multi-toggle') }
  openNewTabBtn() { return this.page.getByTestId('open-new-tab-btn') }
  dragBox1() { return this.page.getByTestId('drag-box-1') }
  dragBox2() { return this.page.getByTestId('drag-box-2') }
  listCapybara() { return this.page.getByTestId('list-capybara') }
  iframeYoutubeEasy() { return this.page.getByTestId('iframe-youtube-easy') }
  iframeYoutubeHard() { return this.page.getByTestId('iframe-youtube-hard') }
  jobsTable() { return this.page.getByTestId('jobs-table') }
  companyDropdown() { return this.page.getByTestId('company-dropdown') }
  companiesToggle() { return this.page.getByTestId('companies-toggle') }
  customFile() { return this.page.getByTestId('custom-file') }
  uploadBtn() { return this.page.getByTestId('upload-btn') }
  uploadResult() { return this.page.getByTestId('upload-widget-result') }
  jobModalOverlay() { return this.page.getByTestId('job-modal-overlay') }
  jobModalContent() { return this.page.getByTestId('job-modal-content') }
  jobModalClose() { return this.page.getByTestId('job-modal-close') }
  sweetAlertBtn() { return this.page.getByTestId('sweet-alert') }
  keyboardField() { return this.page.getByTestId('keyboard-field') }
  keyboardResult() { return this.page.getByTestId('keyboard-result') }
  randomField() { return this.page.getByTestId('random-field') }
  randomLabel() { return this.page.getByTestId('random-label') }
  randomOk() { return this.page.getByTestId('random-ok') }
  randomResult() { return this.page.getByTestId('random-result') }
  cadastroNome() { return this.page.getByTestId('cadastro-nome') }
  cadastroSobrenome() { return this.page.getByTestId('cadastro-sobrenome') }
  cadastroEmail() { return this.page.getByTestId('cadastro-email') }
  cadastrarBtn() { return this.page.getByTestId('cadastrar-btn') }
  cadastroResult() { return this.page.getByTestId('cadastro-result') }

  async openJobDetails(jobTestId: string) {
    await this.page.getByTestId(jobTestId).click()
    await expect(this.jobModalOverlay()).toBeVisible()
    return this
  }

  async uploadSampleFile() {
    const filePath = path.join(__dirname, '../fixtures/sample-upload.txt')
    await this.customFile().setInputFiles(filePath)
    await expect(this.uploadBtn()).toBeEnabled()
    await this.uploadBtn().click()
    return this
  }

  async selectOsOption(label: string) {
    await this.page.locator('.select2-container').first().click()
    await this.page.locator('.select2-results__option', { hasText: label }).click()
    return this
  }

  async swapDragBoxesComplete() {
    await this.page.evaluate(() => {
      const src = document.querySelector('[data-testid="drag-box-1"]') as HTMLElement
      const dst = document.querySelector('[data-testid="drag-box-2"]') as HTMLElement
      const dragStartData = new DataTransfer()
      dragStartData.setData('text/html', src.innerHTML)
      src.dispatchEvent(
        new DragEvent('dragstart', { bubbles: true, cancelable: true, dataTransfer: dragStartData }),
      )

      const dropData = new DataTransfer()
      dst.dispatchEvent(
        new DragEvent('dragover', { bubbles: true, cancelable: true, dataTransfer: dropData }),
      )
      dst.dispatchEvent(
        new DragEvent('drop', { bubbles: true, cancelable: true, dataTransfer: dropData }),
      )
    })
    return this
  }

  async shouldShowPage() {
    await expect(this.pageRoot()).toBeVisible()
    return this
  }
}
