import { test, expect } from '@playwright/test'
import { WizardPage } from '../../pages/WizardPage'
import { visitAuthenticated } from '../../support/auth'
import { createPersonalStep, createPreferencesStep } from '../../support/factories/wizard'
import wizardFixture from '../../fixtures/wizard.json'

test.describe('Wizard — multi-step flow', () => {
  test.describe.configure({ timeout: 15_000 })

  test.beforeEach(async ({ page, request }) => {
    await visitAuthenticated(page, request, '/web/wizard.html')
    await expect(new WizardPage(page).pageRoot()).toBeVisible()
  })

  test.describe('Step 1 — Personal info', () => {
    test('shows step 1 panel and active indicator by default', async ({ page }) => {
      const wizard = new WizardPage(page)
      await wizard.shouldShowStep1Active()
      await expect(wizard.panel(2)).not.toBeVisible()
    })

    test('shows validation error when advancing with empty required fields', async ({ page }) => {
      const wizard = new WizardPage(page)
      await wizard.advance()
      await wizard.shouldShowStep1Error()
      await wizard.shouldShowStep1Active()
    })

    test('accepts valid personal data and advances to step 2', async ({ page }) => {
      const wizard = new WizardPage(page)
      await wizard.completeStep1(wizardFixture.personal)
      await wizard.advance()
      await expect(wizard.panel(2)).toBeVisible()
      await wizard.shouldMarkStepDone(1)
    })

    test('preserves entered data when navigating back from step 2', async ({ page }) => {
      const wizard = new WizardPage(page)
      await wizard.completeStep1(wizardFixture.personal)
      await wizard.advance()
      await wizard.goBack()
      await expect(wizard.nameInput()).toHaveValue(wizardFixture.personal.name)
      await expect(wizard.emailInput()).toHaveValue(wizardFixture.personal.email)
    })
  })

  test.describe('Step 2 — Preferences', () => {
    test.beforeEach(async ({ page }) => {
      const wizard = new WizardPage(page)
      await wizard.completeStep1(wizardFixture.personal)
      await wizard.advance()
    })

    test('shows validation error when terms are not accepted', async ({ page }) => {
      const wizard = new WizardPage(page)
      await wizard.frameworkRadio('playwright').check({ force: true })
      await wizard.roleRadio('qa').check({ force: true })
      await wizard.advance()
      await wizard.shouldShowStep2Error()
    })

    test('requires framework and role selection before advancing', async ({ page }) => {
      const wizard = new WizardPage(page)
      await wizard.termsCheckbox().check({ force: true })
      await wizard.advance()
      await wizard.shouldShowStep2Error()
    })
  })

  test.describe('Step 3 — Review & success', () => {
    test('completes full wizard and shows success with review data', async ({ page }) => {
      const personal = createPersonalStep({ name: 'Senior QA Engineer' })
      const preferences = createPreferencesStep(wizardFixture.preferences)

      await test.step('Fill all wizard steps', async () => {
        const wizard = new WizardPage(page)
        await wizard.completeFullFlow(personal, preferences)
      })

      const wizard = new WizardPage(page)
      await wizard.shouldShowSuccess()
      await wizard.shouldShowReviewName(personal.name)
      await expect(wizard.reviewEmail()).toContainText(personal.email)
    })

    test('review panel displays selected framework and role', async ({ page }) => {
      const wizard = new WizardPage(page)
      await wizard.completeStep1(wizardFixture.personal)
      await wizard.advance()
      await wizard.completeStep2(createPreferencesStep({ framework: 'playwright', role: 'sdet' }))
      await wizard.advance()
      await expect(wizard.review()).toBeVisible()
      await expect(page.getByTestId('review-framework')).toContainText(/playwright/i)
      await expect(page.getByTestId('review-role')).toContainText(/sdet/i)
    })
  })

  test.describe('Navigation & restart', () => {
    test('navigates back from step 2 to step 1', async ({ page }) => {
      const wizard = new WizardPage(page)
      await wizard.completeStep1(wizardFixture.personal)
      await wizard.advance()
      await wizard.goBack()
      await wizard.shouldShowStep1Active()
    })

    test('restarts wizard after completion', async ({ page }) => {
      const wizard = new WizardPage(page)
      await wizard.completeFullFlow(
        createPersonalStep(),
        createPreferencesStep(),
      )
      await wizard.restartBtn().click()
      await wizard.shouldShowStep1Active()
      await expect(wizard.nameInput()).toHaveValue('')
    })

    test('progress indicator shows step count', async ({ page }) => {
      await expect(page.getByTestId('wizard-step-count')).toContainText(/1/)
      const wizard = new WizardPage(page)
      await wizard.completeStep1(wizardFixture.personal)
      await wizard.advance()
      await expect(page.getByTestId('wizard-step-count')).toContainText(/2/)
    })
  })

  test.describe('Accessibility', () => {
    test('wizard panels have role group and step nav is present', async ({ page }) => {
      await expect(page.getByTestId('wizard-nav')).toBeVisible()
      await expect(page.getByTestId('wizard-panel-1')).toHaveAttribute('role', 'group')
      await expect(page.getByTestId('wizard-step-1')).toHaveAttribute('aria-current', 'step')
    })

    test('keyboard can activate Next after filling step 1', async ({ page }) => {
      const wizard = new WizardPage(page)
      await wizard.completeStep1(wizardFixture.personal)
      await wizard.nextBtn().focus()
      await page.keyboard.press('Enter')
      await expect(wizard.panel(2)).toBeVisible()
    })
  })
})
