import { expect, Page } from '@playwright/test'
import type { WizardPersonalStep, WizardPreferencesStep } from '../support/factories/wizard'

export class WizardPage {
  constructor(private readonly page: Page) {}

  pageRoot() { return this.page.getByTestId('page-wizard') }
  nameInput() { return this.page.getByTestId('wizard-name') }
  emailInput() { return this.page.getByTestId('wizard-email') }
  dobInput() { return this.page.getByTestId('wizard-dob') }
  countrySelect() { return this.page.getByTestId('wizard-country') }
  nextBtn() { return this.page.getByTestId('wizard-next') }
  backBtn() { return this.page.getByTestId('wizard-back') }
  restartBtn() { return this.page.getByTestId('wizard-restart') }
  step(n: 1 | 2 | 3) { return this.page.getByTestId(`wizard-step-${n}`) }
  panel(n: 1 | 2 | 3) { return this.page.getByTestId(`wizard-panel-${n}`) }
  step1Error() { return this.page.getByTestId('wizard-step1-error') }
  step2Error() { return this.page.getByTestId('wizard-step2-error') }
  review() { return this.page.getByTestId('wizard-review') }
  success() { return this.page.getByTestId('wizard-success') }
  successMessage() { return this.page.getByTestId('wizard-success-message') }
  reviewName() { return this.page.getByTestId('review-name') }
  reviewEmail() { return this.page.getByTestId('review-email') }
  experienceSlider() { return this.page.getByTestId('wizard-experience') }
  termsCheckbox() { return this.page.getByTestId('wizard-terms') }
  newsletterCheckbox() { return this.page.getByTestId('wizard-newsletter') }

  frameworkRadio(name: string) { return this.page.getByTestId(`wizard-fw-${name}`) }
  roleRadio(role: string) { return this.page.getByTestId(`wizard-role-${role}`) }

  async advance() {
    await this.nextBtn().click()
    return this
  }

  async goBack() {
    await this.backBtn().click()
    return this
  }

  async completeStep1(data: WizardPersonalStep) {
    await this.nameInput().fill(data.name)
    await this.emailInput().fill(data.email)
    await this.dobInput().fill(data.dob)
    await this.countrySelect().selectOption(data.country)
    return this
  }

  async completeStep2(data: WizardPreferencesStep) {
    await this.frameworkRadio(data.framework).check({ force: true })
    await this.roleRadio(data.role).check({ force: true })
    await this.experienceSlider().fill(data.experience)
    await this.termsCheckbox().check({ force: true })
    await this.newsletterCheckbox().check({ force: true })
    return this
  }

  async completeStep3() {
    await expect(this.review()).toBeVisible()
    return this
  }

  async completeFullFlow(personal: WizardPersonalStep, preferences: WizardPreferencesStep) {
    await this.completeStep1(personal)
    await this.advance()
    await this.completeStep2(preferences)
    await this.advance()
    await this.completeStep3()
    await this.advance()
    return this
  }

  async shouldShowStep1Active() {
    await expect(this.panel(1)).toBeVisible()
    await expect(this.step(1)).toHaveClass(/active/)
    return this
  }

  async shouldShowStep1Error() {
    await expect(this.step1Error()).toBeVisible()
    return this
  }

  async shouldShowStep2Error() {
    await expect(this.step2Error()).toBeVisible()
    return this
  }

  async shouldShowSuccess() {
    await expect(this.success()).toBeVisible()
    await expect(this.successMessage()).not.toBeEmpty()
    return this
  }

  async shouldShowReviewName(name: string) {
    await expect(this.reviewName()).toContainText(name)
    return this
  }

  async shouldMarkStepDone(n: 1 | 2 | 3) {
    await expect(this.step(n)).toHaveClass(/done/)
    return this
  }
}
