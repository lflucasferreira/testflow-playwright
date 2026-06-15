import { expect, Page } from '@playwright/test'

export class LoginPage {
  constructor(private readonly page: Page) {}

  emailInput() { return this.page.getByTestId('login-email') }
  passwordInput() { return this.page.getByTestId('login-password') }
  rememberCheckbox() { return this.page.getByTestId('login-remember') }
  useApiCheckbox() { return this.page.getByTestId('login-use-api') }
  submitBtn() { return this.page.getByTestId('login-submit') }
  resultMsg() { return this.page.getByTestId('login-result') }

  async visit() {
    await this.page.goto('/web/login.html')
    return this
  }

  async fillEmail(email: string) {
    await this.emailInput().clear()
    await this.emailInput().fill(email)
    return this
  }

  async fillPassword(password: string) {
    await this.passwordInput().clear()
    await this.passwordInput().fill(password)
    return this
  }

  async submit() {
    await this.submitBtn().click()
    return this
  }

  async loginWith(email: string, password: string) {
    await this.fillEmail(email)
    await this.fillPassword(password)
    await this.submit()
    return this
  }

  async toggleUseApi() {
    await this.useApiCheckbox().evaluate((el) => (el as HTMLInputElement).click())
    return this
  }

  async toggleRememberMe() {
    await this.rememberCheckbox().click()
    return this
  }

  async shouldBeOnLoginPage() {
    await expect(this.page).toHaveURL(/\/web\/login\.html/)
    return this
  }

  async shouldShowError(text: string) {
    await expect(this.resultMsg()).toBeVisible()
    await expect(this.resultMsg()).toContainText(text)
    return this
  }

  async shouldRedirectToDashboard() {
    await expect(this.page.getByTestId('page-dashboard')).toBeVisible()
    await expect(this.page).toHaveURL(/\/web\/dashboard\.html/)
    return this
  }
}
