import { expect, Page } from '@playwright/test'

export class SettingsPage {
  constructor(private readonly page: Page) {}

  pageRoot() { return this.page.getByTestId('page-settings') }
  settingsForm() { return this.page.getByTestId('settings-form') }
  nameInput() { return this.page.getByTestId('settings-name') }
  emailInput() { return this.page.getByTestId('settings-email') }
  titleInput() { return this.page.getByTestId('settings-title') }
  timezoneSelect() { return this.page.getByTestId('settings-timezone') }
  bioTextarea() { return this.page.getByTestId('settings-bio') }
  saveBtn() { return this.page.getByTestId('settings-save') }
  formResult() { return this.page.getByTestId('form-result') }
  fileUpload() { return this.page.getByTestId('file-upload') }
  uploadResult() { return this.page.getByTestId('upload-result') }
  notifSwitch() { return this.page.getByTestId('notifications-switch') }
  switchStatus() { return this.page.getByTestId('switch-status') }
  volumeSlider() { return this.page.getByTestId('volume-slider') }
  volumeValue() { return this.page.getByTestId('volume-value') }
  digestCheckbox() { return this.page.getByTestId('settings-digest') }
  dateInput() { return this.page.getByTestId('settings-date') }
  passwordForm() { return this.page.getByTestId('password-form') }
  currentPassword() { return this.page.getByTestId('password-current') }
  newPassword() { return this.page.getByTestId('password-new') }
  passwordSaveBtn() { return this.page.getByTestId('password-save') }
  passwordResult() { return this.page.getByTestId('password-result') }
  twofaSwitch() { return this.page.getByTestId('twofa-switch') }
  twofaStatus() { return this.page.getByTestId('twofa-status') }
  sessionBadge() { return this.page.getByTestId('session-badge') }
  copyTokenBtn() { return this.page.getByTestId('copy-token-btn') }
  rotateTokenBtn() { return this.page.getByTestId('rotate-token-btn') }
  apiKeyDisplay() { return this.page.getByTestId('api-key-display') }
  tokenResult() { return this.page.getByTestId('token-result') }
  webhookInput() { return this.page.getByTestId('webhook-url') }
  saveWebhookBtn() { return this.page.getByTestId('save-webhook-btn') }
  webhookResult() { return this.page.getByTestId('webhook-result') }
  deleteAccountBtn() { return this.page.getByTestId('delete-account-btn') }

  async fillName(name: string) {
    await this.nameInput().clear()
    await this.nameInput().fill(name)
    return this
  }

  async fillEmail(email: string) {
    await this.emailInput().clear()
    await this.emailInput().fill(email)
    return this
  }

  async saveProfile() {
    await this.saveBtn().click()
    return this
  }

  async toggleNotifications() {
    await this.notifSwitch().click()
    return this
  }

  async setSlider(value: number) {
    await this.volumeSlider().evaluate((el, v) => {
      const input = el as HTMLInputElement
      input.value = String(v)
      input.dispatchEvent(new Event('input', { bubbles: true }))
    }, value)
    return this
  }

  async submitPasswordChange(current: string, next: string) {
    await this.currentPassword().fill(current)
    await this.newPassword().fill(next)
    await this.passwordSaveBtn().click()
    return this
  }

  async toggle2FA() {
    await this.twofaSwitch().click()
    return this
  }

  async copyToken() {
    await this.copyTokenBtn().click()
    return this
  }

  async rotateToken() {
    await this.rotateTokenBtn().click()
    return this
  }

  async saveWebhook(url: string) {
    await this.webhookInput().clear()
    await this.webhookInput().fill(url)
    await this.saveWebhookBtn().click()
    return this
  }

  async shouldShowSaveSuccess() {
    await expect(this.formResult()).toBeVisible()
    await expect(this.formResult()).toContainText('saved')
    return this
  }

  async shouldShowNotificationsOn() {
    await expect(this.switchStatus()).toHaveText('On')
    await expect(this.notifSwitch()).toHaveAttribute('aria-checked', 'true')
    return this
  }

  async shouldShowNotificationsOff() {
    await expect(this.switchStatus()).toHaveText('Off')
    await expect(this.notifSwitch()).toHaveAttribute('aria-checked', 'false')
    return this
  }

  async shouldShowPasswordError(text: string) {
    await expect(this.passwordResult()).toBeVisible()
    await expect(this.passwordResult()).toContainText(text)
    return this
  }

  async shouldShow2FAEnabled() {
    await expect(this.twofaStatus()).toHaveText('Enabled')
    await expect(this.twofaSwitch()).toHaveAttribute('aria-checked', 'true')
    return this
  }

  async shouldShowTokenResult(text: string) {
    await expect(this.tokenResult()).toContainText(text)
    return this
  }

  async shouldShowWebhookSaved() {
    await expect(this.webhookResult()).toBeVisible()
    await expect(this.webhookResult()).toContainText('Webhook saved')
    return this
  }
}
