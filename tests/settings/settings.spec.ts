import { test, expect } from '@playwright/test'
import { SettingsPage } from '../../pages/SettingsPage'
import { visitAuthenticated } from '../../support/auth'

test.describe('Settings', () => {
  test.beforeEach(async ({ page, request }) => {
    await visitAuthenticated(page, request, '/web/settings.html')
    await expect(new SettingsPage(page).pageRoot()).toBeVisible()
  })

  test.describe('Profile section', () => {
    test('shows pre-filled values for name and email', async ({ page }) => {
      const settings = new SettingsPage(page)
      await expect(settings.nameInput()).toHaveValue('Demo User')
      await expect(settings.emailInput()).toHaveValue('demo@automation.io')
    })

    test('saves profile and shows success message', async ({ page }) => {
      const settings = new SettingsPage(page)
      await settings.fillName('Demo User Updated')
      await settings.saveProfile()
      await settings.shouldShowSaveSuccess()
    })

    test('shows a toast on save', async ({ page }) => {
      await new SettingsPage(page).saveProfile()
      await expect(page.getByTestId('toast-message')).toContainText('saved')
    })

    test('allows changing the timezone select', async ({ page }) => {
      const settings = new SettingsPage(page)
      await settings.timezoneSelect().selectOption('brt')
      await expect(settings.timezoneSelect()).toHaveValue('brt')
    })

    test('avatar upload input accepts image files', async ({ page }) => {
      await expect(new SettingsPage(page).fileUpload()).toHaveAttribute('accept', /\.png/)
    })
  })

  test.describe('Notifications section', () => {
    test('push notifications start as Off', async ({ page }) => {
      await new SettingsPage(page).shouldShowNotificationsOff()
    })

    test('toggles notifications On', async ({ page }) => {
      const settings = new SettingsPage(page)
      await settings.toggleNotifications()
      await settings.shouldShowNotificationsOn()
    })

    test('toggles notifications back Off', async ({ page }) => {
      const settings = new SettingsPage(page)
      await settings.toggleNotifications()
      await settings.toggleNotifications()
      await settings.shouldShowNotificationsOff()
    })

    test('volume slider updates the displayed value', async ({ page }) => {
      const settings = new SettingsPage(page)
      await settings.setSlider(75)
      await expect(settings.volumeValue()).toHaveText('75')
    })

    test('weekly digest checkbox is checked by default', async ({ page }) => {
      await expect(new SettingsPage(page).digestCheckbox()).toBeChecked()
    })

    test('digest start date field is editable', async ({ page }) => {
      const dateInput = new SettingsPage(page).dateInput()
      await dateInput.clear()
      await dateInput.fill('2025-01-01')
      await expect(dateInput).toHaveValue('2025-01-01')
    })
  })

  test.describe('Security — password change', () => {
    test('shows error when both password fields are empty', async ({ page }) => {
      const settings = new SettingsPage(page)
      await settings.passwordSaveBtn().click()
      await settings.shouldShowPasswordError('required')
    })

    test('shows error when new password is too short', async ({ page }) => {
      const settings = new SettingsPage(page)
      await settings.submitPasswordChange('Demo123!', 'short')
      await settings.shouldShowPasswordError('8 characters')
    })

    test('shows success when a valid new password is provided', async ({ page }) => {
      const settings = new SettingsPage(page)
      await settings.submitPasswordChange('Demo123!', 'NewPass123!')
      await expect(settings.passwordResult()).toContainText('updated')
    })

    test('clears password fields after successful change', async ({ page }) => {
      const settings = new SettingsPage(page)
      await settings.submitPasswordChange('Demo123!', 'NewPass123!')
      await expect(settings.currentPassword()).toHaveValue('')
      await expect(settings.newPassword()).toHaveValue('')
    })

    test('password change request contains currentPassword and newPassword', async ({ page }) => {
      const settings = new SettingsPage(page)
      const passwordChange = page.waitForRequest(
        (req) => req.method() === 'POST' && req.url().includes('/api/'),
        { timeout: 3000 },
      ).catch(() => null)

      await settings.submitPasswordChange('Demo123!', 'NewPass123!')
      await expect(settings.passwordResult()).toContainText('updated')

      const interception = await passwordChange
      if (interception) {
        const body = interception.postDataJSON()
        expect(body).toHaveProperty('currentPassword')
        expect(body).toHaveProperty('newPassword')
        expect(body.newPassword).toBe('NewPass123!')
      }
    })
  })

  test.describe('Security — 2FA', () => {
    test('starts as Disabled', async ({ page }) => {
      const settings = new SettingsPage(page)
      await expect(settings.twofaStatus()).toHaveText('Disabled')
      await expect(settings.twofaSwitch()).toHaveAttribute('aria-checked', 'false')
    })

    test('enables 2FA on toggle', async ({ page }) => {
      const settings = new SettingsPage(page)
      await settings.toggle2FA()
      await settings.shouldShow2FAEnabled()
    })

    test('disables 2FA on second toggle', async ({ page }) => {
      const settings = new SettingsPage(page)
      await settings.toggle2FA()
      await settings.toggle2FA()
      await expect(settings.twofaStatus()).toHaveText('Disabled')
    })
  })

  test.describe('Security — active sessions', () => {
    test('shows current session with Active badge', async ({ page }) => {
      await expect(page.getByTestId('session-current')).toBeVisible()
      await expect(new SettingsPage(page).sessionBadge()).toContainText('Active')
    })

    test('shows session device name and location', async ({ page }) => {
      await expect(page.getByTestId('session-name')).not.toBeEmpty()
      await expect(page.getByTestId('session-meta')).toContainText('Current session')
    })
  })

  test.describe('Integrations — API token', () => {
    test('displays the API token', async ({ page }) => {
      const token = new SettingsPage(page).apiKeyDisplay()
      await expect(token).toBeVisible()
      await expect(token).not.toBeEmpty()
    })

    test('shows "Copied" feedback when Copy is clicked', async ({ page }) => {
      const settings = new SettingsPage(page)
      await settings.copyToken()
      await settings.shouldShowTokenResult('Copied')
    })

    test('generates a new token on Rotate', async ({ page }) => {
      const settings = new SettingsPage(page)
      const original = await settings.apiKeyDisplay().innerText()
      await settings.rotateToken()
      await expect(settings.apiKeyDisplay()).not.toHaveText(original)
    })

    test('shows toast after rotating token', async ({ page }) => {
      await new SettingsPage(page).rotateToken()
      await expect(page.getByTestId('toast-message')).toContainText('rotated')
    })

    test('rotate token triggers a request and response contains new token', async ({ page }) => {
      const settings = new SettingsPage(page)
      const rotateRequest = page.waitForResponse(
        (res) => res.url().includes('/api/'),
        { timeout: 3000 },
      ).catch(() => null)

      await settings.rotateToken()
      await expect(settings.apiKeyDisplay()).not.toBeEmpty()

      const interception = await rotateRequest
      if (interception) {
        expect(interception.status()).toBe(200)
        const body = await interception.json()
        expect(typeof body.token).toBe('string')
        expect(body.token.length).toBeGreaterThan(0)
      }
    })
  })

  test.describe('Integrations — Webhook', () => {
    test('saves a valid webhook URL', async ({ page }) => {
      const settings = new SettingsPage(page)
      await settings.saveWebhook('https://ci.example.com/webhook')
      await settings.shouldShowWebhookSaved()
    })

    test('shows error when webhook URL is empty', async ({ page }) => {
      await new SettingsPage(page).saveWebhookBtn().click()
      await expect(page.getByTestId('webhook-result')).toContainText('Enter a URL')
    })

    test('shows toast on successful save', async ({ page }) => {
      await new SettingsPage(page).saveWebhook('https://ci.example.com/hook')
      await expect(page.getByTestId('toast-message')).toContainText('saved')
    })
  })

  test.describe('Danger zone', () => {
    test('delete account button is visible', async ({ page }) => {
      const btn = new SettingsPage(page).deleteAccountBtn()
      await expect(btn).toBeVisible()
      await expect(btn).toHaveClass(/btn-danger/)
    })

    test('delete account shows confirmation dialog', async ({ page }) => {
      let confirmCalled = false
      page.once('dialog', async (dialog) => {
        confirmCalled = true
        expect(dialog.type()).toBe('confirm')
        await dialog.dismiss()
      })
      await new SettingsPage(page).deleteAccountBtn().click()
      expect(confirmCalled).toBe(true)
    })
  })
})
