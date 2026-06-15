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

  async shouldShowPage() {
    await expect(this.pageRoot()).toBeVisible()
    return this
  }
}
