import { test, expect } from '@playwright/test'
import { LoginPage } from '../../pages/LoginPage'
import { DEMO_EMAIL, DEMO_PASSWORD } from '../../support/helpers'
import credentials from '../../fixtures/credentials.json'

test.describe('Authentication', () => {
  test.beforeEach(async ({ page }) => {
    await new LoginPage(page).visit()
  })

  test.describe('Page structure', () => {
    test('renders all form elements', async ({ page }) => {
      const login = new LoginPage(page)
      await expect(login.emailInput()).toBeVisible()
      await expect(login.passwordInput()).toBeVisible()
      await expect(login.submitBtn()).toBeVisible()
      await expect(login.submitBtn()).toBeEnabled()
      await expect(login.rememberCheckbox()).toBeAttached()
      await expect(login.useApiCheckbox()).toBeAttached()
    })

    test('has correct placeholder text on email field', async ({ page }) => {
      await expect(new LoginPage(page).emailInput()).toHaveAttribute('placeholder', 'demo@automation.io')
    })

    test('password field masks input', async ({ page }) => {
      await expect(new LoginPage(page).passwordInput()).toHaveAttribute('type', 'password')
    })
  })

  test.describe('Valid credentials', () => {
    test('logs in via UI and redirects to dashboard', async ({ page }) => {
      const login = new LoginPage(page)
      await login.loginWith(DEMO_EMAIL, DEMO_PASSWORD)
      await login.shouldRedirectToDashboard()
    })

    test('logs in with API toggle enabled', async ({ page }) => {
      const login = new LoginPage(page)
      const loginRequest = page.waitForRequest((req) =>
        req.url().includes('/api/auth/login') && req.method() === 'POST',
      )

      await login.toggleUseApi()
      await login.loginWith(DEMO_EMAIL, DEMO_PASSWORD)

      const request = await loginRequest
      const response = await request.response()
      expect(response?.status()).toBe(200)
      await login.shouldRedirectToDashboard()
    })

    test('sets auth data in sessionStorage after login', async ({ page }) => {
      await new LoginPage(page).loginWith(DEMO_EMAIL, DEMO_PASSWORD)
      const auth = await page.evaluate(() => {
        const raw = sessionStorage.getItem('sandbox-auth')
        return raw ? JSON.parse(raw) : null
      })
      expect(auth).not.toBeNull()
      expect(auth.email).toBe(DEMO_EMAIL)
    })

    test('shows success message before redirect', async ({ page }) => {
      const login = new LoginPage(page)
      await login.loginWith(DEMO_EMAIL, DEMO_PASSWORD)

      const result = page.getByTestId('login-result')
      if (await result.isVisible()) {
        await expect(result).toContainText('Login successful')
      }
      await login.shouldRedirectToDashboard()
    })

    test('submits login form with Enter key', async ({ page }) => {
      const login = new LoginPage(page)
      await login.fillEmail(DEMO_EMAIL)
      await login.fillPassword(DEMO_PASSWORD)
      await login.passwordInput().press('Enter')
      await login.shouldRedirectToDashboard()
    })
  })

  test.describe('Invalid credentials', () => {
    test('shows error for wrong password', async ({ page }) => {
      const login = new LoginPage(page)
      await login.loginWith(credentials.valid.email, credentials.invalid.password)
      await login.shouldShowError('Invalid credentials')
    })

    test('shows error for unknown email', async ({ page }) => {
      const login = new LoginPage(page)
      await login.loginWith(credentials.invalid.email, credentials.valid.password)
      await login.shouldShowError('Invalid credentials')
    })

    test('does not navigate away on failed login', async ({ page }) => {
      await new LoginPage(page).loginWith(credentials.invalid.email, credentials.invalid.password)
      await expect(page).toHaveURL(/\/web\/login\.html/)
    })
  })

  test.describe('Form validation', () => {
    test('requires email to not be empty (HTML5 validation)', async ({ page }) => {
      const login = new LoginPage(page)
      await login.fillPassword(DEMO_PASSWORD)
      await login.submit()
      const isValid = await login.emailInput().evaluate((el) => (el as HTMLInputElement).validity.valid)
      expect(isValid).toBe(false)
    })
  })

  test.describe('Remember me', () => {
    test('checkbox can be checked and unchecked', async ({ page }) => {
      const login = new LoginPage(page)
      await expect(login.rememberCheckbox()).not.toBeChecked()
      await login.toggleRememberMe()
      await expect(login.rememberCheckbox()).toBeChecked()
      await login.toggleRememberMe()
      await expect(login.rememberCheckbox()).not.toBeChecked()
    })
  })

  test.describe('Redirect after login', () => {
    test('redirects to login when accessing a protected page unauthenticated', async ({ page }) => {
      await page.goto('/web/team.html')
      await expect(page).toHaveURL(/\/web\/login\.html/)

      await new LoginPage(page).loginWith(DEMO_EMAIL, DEMO_PASSWORD)
      await expect(page).not.toHaveURL(/\/web\/login\.html/)
    })
  })

  test.describe('Logout', () => {
    test('clears session and redirects to home after logout', async ({ page }) => {
      const login = new LoginPage(page)
      await login.loginWith(DEMO_EMAIL, DEMO_PASSWORD)
      await login.shouldRedirectToDashboard()

      await page.getByTestId('nav-logout').click()
      await expect(page).toHaveURL(/\/web\/index\.html/)
      expect(await page.evaluate(() => sessionStorage.getItem('sandbox-auth'))).toBeNull()
    })
  })
})
