# Settings

**Source file:** [`settings.spec.ts`](../../../../tests/settings/settings.spec.ts)

---

## Purpose

This suite validates the **Settings page** — profile, notifications, security, integrations, and danger zone. It covers:

- Profile form pre-fill, save, and timezone selection
- Notification toggles, volume slider, and digest checkbox
- Password change validation and success
- Two-factor authentication toggle
- Active session display
- API token copy/rotate with network interception
- Webhook URL save
- Delete account confirmation dialog

It demonstrates [`SettingsPage`](../../../../pages/SettingsPage.ts) and Playwright's `page.once('dialog')` handler.

---

## Prerequisites

| Item | Detail |
|------|--------|
| **TestFlow** | Running at `http://localhost:5050` |
| **Dependencies** | `npm install` at the project root |
| **Credentials** | `DEMO_EMAIL` and `DEMO_PASSWORD` in environment variables |
| **Execution** | `npm run test:settings` |

---

## Tags used

This spec has no explicit Playwright tags. It runs under the `settings` project.

---

## Playwright concepts

| Concept | Usage in this file |
|---------|-------------------|
| [`visitAuthenticated`](../../../../support/auth.ts) | API login + navigation to `/web/settings.html` |
| **Page Object** | [`SettingsPage`](../../../../pages/SettingsPage.ts) |
| **`page.once('dialog')`** | Handles native `confirm()` on delete account |
| **`page.waitForRequest` / `waitForResponse`** | Captures password change and token rotate API calls |
| **`selectOption`** | Changes timezone dropdown |

---

## Step-by-step — block by block

### Block 1 — Setup

```typescript
import { test, expect } from '@playwright/test'
import { SettingsPage } from '../../pages/SettingsPage'
import { visitAuthenticated } from '../../support/auth'

test.describe('Settings', () => {
  test.beforeEach(async ({ page, request }) => {
    await visitAuthenticated(page, request, '/web/settings.html')
    await expect(new SettingsPage(page).pageRoot()).toBeVisible()
  })
```

- **Given:** each test starts authenticated on the Settings page.
- **When:** `visitAuthenticated` injects session and navigates.
- **Then:** `page-settings` root is visible.

---

### Block 2 — Profile section

```typescript
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
  })
```

- **Given:** the profile form is pre-filled with demo data.
- **When:** the user edits and saves.
- **Then:** a success message and toast confirm the save.

---

### Block 3 — Notifications

```typescript
  test.describe('Notifications section', () => {
    test('push notifications start as Off', async ({ page }) => {
      await new SettingsPage(page).shouldShowNotificationsOff()
    })

    test('toggles notifications On', async ({ page }) => {
      const settings = new SettingsPage(page)
      await settings.toggleNotifications()
      await settings.shouldShowNotificationsOn()
    })

    test('volume slider updates the displayed value', async ({ page }) => {
      const settings = new SettingsPage(page)
      await settings.setSlider(75)
      await expect(settings.volumeValue()).toHaveText('75')
    })
  })
```

- **Given:** default notification settings.
- **When:** toggles and slider are adjusted.
- **Then:** UI reflects On/Off state and numeric volume.

---

### Block 4 — Security — password & 2FA

```typescript
  test.describe('Security — password change', () => {
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
  })
```

- **Given:** the password change form.
- **When:** invalid or valid passwords are submitted.
- **Then:** validation errors or success message appears; fields clear on success.

**2FA toggle** verifies `aria-checked` and status text change between Disabled and Enabled.

---

### Block 5 — Integrations — API token & Webhook

```typescript
  test.describe('Integrations — API token', () => {
    test('generates a new token on Rotate', async ({ page }) => {
      const settings = new SettingsPage(page)
      const original = await settings.apiKeyDisplay().innerText()
      await settings.rotateToken()
      await expect(settings.apiKeyDisplay()).not.toHaveText(original)
    })

    test('rotate token triggers a request and response contains new token', async ({ page }) => {
      const settings = new SettingsPage(page)
      const rotateRequest = page.waitForResponse(
        (res) => res.url().includes('/api/'),
        { timeout: 3000 },
      ).catch(() => null)

      await settings.rotateToken()
      const interception = await rotateRequest
      if (interception) {
        expect(interception.status()).toBe(200)
        const body = await interception.json()
        expect(typeof body.token).toBe('string')
      }
    })
  })
```

- **Given:** an existing API token is displayed.
- **When:** Rotate is clicked.
- **Then:** a new token appears and the API returns 200 with a token string.

---

### Block 6 — Danger zone

```typescript
  test.describe('Danger zone', () => {
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
```

- **Given:** the danger zone section is visible.
- **When:** Delete account is clicked.
- **Then:** a native confirm dialog appears (dismissed in test).

---

## How to run

```bash
npm run test:settings
npx playwright test tests/settings/settings.spec.ts
```

---

## Related references

- Page Object: [`pages/SettingsPage.ts`](../../../../pages/SettingsPage.ts)
- Auth helpers: [`support/auth.ts`](../../../../support/auth.ts)
