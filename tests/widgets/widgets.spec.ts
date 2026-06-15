import { test, expect } from '@playwright/test'
import { WidgetsPage } from '../../pages/WidgetsPage'
import { visitAuthenticated } from '../../support/auth'

test.describe('Classic Widgets — QA School patterns', { tag: '@regression' }, () => {
  test.beforeEach(async ({ page, request }) => {
    await visitAuthenticated(page, request, '/web/widgets.html')
    await new WidgetsPage(page).shouldShowPage()
  })

  test.describe('Checkboxes & radios', () => {
    test('shows pre-checked Ruby and PHP', async ({ page }) => {
      await expect(page.getByTestId('cb-ruby')).toBeChecked()
      await expect(page.getByTestId('cb-php')).toBeChecked()
      await expect(page.getByTestId('cb-java')).not.toBeChecked()
    })

    test('selects experience radio option', async ({ page }) => {
      await page.getByTestId('radio-pleno').check({ force: true })
      await expect(page.getByTestId('radio-pleno')).toBeChecked()
    })
  })

  test.describe('File upload', () => {
    test('enables upload after selecting a file', async ({ page }) => {
      const widgets = new WidgetsPage(page)
      await expect(widgets.uploadBtn()).toBeDisabled()
      await widgets.uploadSampleFile()
      await expect(page.getByTestId('file-label')).toContainText('sample-upload.txt')
      await expect(page.getByTestId('toast-message')).toContainText(/upload/i)
    })
  })

  test.describe('Jobs table & modal', () => {
    test('opens job detail modal for Amazon row', async ({ page }) => {
      const widgets = new WidgetsPage(page)
      await widgets.openJobDetails('job-detail-amazon')
      await expect(widgets.jobModalContent()).toContainText(/Amazon|QA/i)
      await widgets.jobModalClose().click()
      await expect(widgets.jobModalOverlay()).not.toBeVisible()
    })

    test('jobs table lists three companies', async ({ page }) => {
      await expect(new WidgetsPage(page).jobsTable().locator('tbody tr')).toHaveCount(3)
    })
  })

  test.describe('Native select', () => {
    test('selects company from dropdown', async ({ page }) => {
      const widgets = new WidgetsPage(page)
      await widgets.companyDropdown().selectOption({ index: 1 })
      await expect(widgets.companyDropdown()).not.toHaveValue('')
    })

    test('toggle enables and disables company select', async ({ page }) => {
      const widgets = new WidgetsPage(page)
      await widgets.companiesToggle().click()
      await expect(widgets.companyDropdown()).toBeDisabled()
      await widgets.companiesToggle().click()
      await expect(widgets.companyDropdown()).toBeEnabled()
    })
  })

  test.describe('Alerts & cadastro', () => {
    test('native alert can be accepted', async ({ page }) => {
      page.once('dialog', (dialog) => dialog.accept())
      await page.getByTestId('alert-native').click()
      await expect(page.getByTestId('alert-result')).toContainText(/ok|accepted|alert/i)
    })

    test('cadastro form submits with valid data', async ({ page }) => {
      const widgets = new WidgetsPage(page)
      await widgets.cadastroNome().fill('QA')
      await widgets.cadastroSobrenome().fill('Engineer')
      await widgets.cadastroEmail().fill('qa.widgets@testflow.io')
      await widgets.cadastrarBtn().click()
      await expect(widgets.cadastroResult()).not.toBeEmpty()
    })
  })

  test.describe('Hover & keyboard', () => {
    test('hover reveals Ruby caption', async ({ page }) => {
      await page.getByTestId('hover-ruby').hover()
      await expect(page.getByTestId('hover-ruby-caption')).toBeVisible()
    })

    test('keyboard shortcut populates result field', async ({ page }) => {
      const widgets = new WidgetsPage(page)
      await widgets.keyboardField().click()
      await widgets.keyboardField().press('a')
      await expect(widgets.keyboardResult()).not.toBeEmpty()
    })
  })

  test.describe('Random field', () => {
    test('random ok accepts numeric input for day/month/year prompt', async ({ page }) => {
      const widgets = new WidgetsPage(page)
      await widgets.randomField().fill('1990')
      await expect(widgets.randomOk()).toBeEnabled()
      await widgets.randomOk().click()
      await expect(widgets.randomResult()).toContainText('You entered: 1990')
    })
  })

  test.describe('Page sections', () => {
    test('renders all major widget sections', async ({ page }) => {
      const widgets = new WidgetsPage(page)
      for (const section of [
        widgets.sectionCheckboxes(),
        widgets.sectionRadios(),
        widgets.sectionFileUpload(),
        widgets.sectionJobs(),
        widgets.sectionNativeSelect(),
        widgets.sectionAlerts(),
        widgets.sectionCadastro(),
        widgets.sectionHover(),
        widgets.sectionKeyboard(),
        widgets.sectionRandom(),
      ]) {
        await expect(section).toBeVisible()
      }
    })
  })
})
