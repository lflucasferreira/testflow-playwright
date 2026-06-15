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
        widgets.sectionSelect2(),
        widgets.sectionSelect2Multi(),
        widgets.sectionNewTab(),
        widgets.sectionAlerts(),
        widgets.sectionCadastro(),
        widgets.sectionDragSwap(),
        widgets.sectionHover(),
        widgets.sectionKeyboard(),
        widgets.sectionRandom(),
        widgets.sectionListGroup(),
        widgets.sectionIframes(),
      ]) {
        await expect(section).toBeVisible()
      }
    })
  })

  test.describe('Select2', () => {
    test('selects OS via Select2 dropdown', async ({ page }) => {
      const widgets = new WidgetsPage(page)
      await widgets.selectOsOption('Linux')
      await expect(widgets.select2Os()).toHaveValue('LINUX')
    })

    test('disable toggle disables Select2 control', async ({ page }) => {
      const widgets = new WidgetsPage(page)
      await widgets.osToggle().click()
      await expect(page.locator('.select2-container').first()).toHaveClass(/select2-container--disabled/)
    })

    test('multi-select accepts multiple OS values', async ({ page }) => {
      const widgets = new WidgetsPage(page)
      await page.locator('[data-testid="section-select2-multi"] .select2-container').click()
      await page.locator('.select2-results__option', { hasText: 'Linux' }).click()
      await page.locator('[data-testid="section-select2-multi"] .select2-container').click()
      await page.locator('.select2-results__option', { hasText: 'MacOS' }).click()
      await expect(page.locator('[data-testid="section-select2-multi"] .select2-selection__choice')).toHaveCount(2)
      const selected = await widgets.select2OsMulti().evaluate((el) =>
        Array.from((el as HTMLSelectElement).selectedOptions).map((o) => o.value),
      )
      expect(selected).toEqual(expect.arrayContaining(['LINUX', 'MACOS']))
    })
  })

  test.describe('SweetAlert2', () => {
    test('shows success dialog after click', async ({ page }) => {
      const widgets = new WidgetsPage(page)
      await widgets.sweetAlertBtn().click()
      await expect(page.locator('.swal2-popup')).toBeVisible()
      await expect(page.locator('.swal2-title')).toContainText('Congratulations!')
      await page.locator('.swal2-confirm').click()
      await expect(page.locator('.swal2-popup')).toBeHidden()
    })
  })

  test.describe('Drag & drop swap', () => {
    test('drag boxes are draggable and show hover state on dragenter', async ({ page }) => {
      const widgets = new WidgetsPage(page)
      await expect(widgets.dragBox1()).toHaveAttribute('draggable', 'true')
      await expect(widgets.dragBox2()).toHaveAttribute('draggable', 'true')

      await widgets.dragBox2().dispatchEvent('dragenter')
      await expect(widgets.dragBox2()).toHaveClass(/over/)

      await widgets.dragBox2().dispatchEvent('dragleave')
      await expect(widgets.dragBox2()).not.toHaveClass(/over/)
    })

    test('swaps content between drag boxes (HTML5 drop with empty getData)', async ({ page }) => {
      const widgets = new WidgetsPage(page)
      await expect(widgets.dragBox2().locator('img')).toBeVisible()

      await widgets.swapDragBoxesComplete()

      await expect(widgets.dragBox2()).toHaveText('Drag me')
      await expect(widgets.dragBox1().locator('img[alt="loader"]')).toBeVisible()
    })
  })

  test.describe('New tab', () => {
    test('opens example.com in a new tab', async ({ page, context }) => {
      const widgets = new WidgetsPage(page)
      const popupPromise = context.waitForEvent('page')
      await widgets.openNewTabBtn().click()
      const popup = await popupPromise
      await expect(popup).toHaveURL(/example\.com/)
      await popup.close()
    })
  })

  test.describe('List group', () => {
    test('renders automation library links', async ({ page }) => {
      const widgets = new WidgetsPage(page)
      await expect(widgets.listCapybara()).toHaveAttribute('href', /capybara/)
      await expect(page.getByTestId('list-siteprism')).toHaveAttribute('href', /site_prism/)
      await expect(page.getByTestId('list-postgres')).toHaveAttribute('href', /ruby-pg/)
    })
  })

  test.describe('Cross-origin iframes', () => {
    test('YouTube embeds load with valid src and title', async ({ page }) => {
      const widgets = new WidgetsPage(page)
      await expect(widgets.iframeYoutubeEasy()).toHaveAttribute('src', /youtube\.com\/embed/)
      await expect(widgets.iframeYoutubeEasy()).toHaveAttribute('title', 'YouTube easy')
      await expect(widgets.iframeYoutubeHard()).toHaveAttribute('src', /youtube\.com\/embed/)
      await expect(widgets.iframeYoutubeHard()).toHaveAttribute('title', 'YouTube hard')
    })
  })
})
