import { test, expect } from '@playwright/test'
import { loginViaApi } from '../../support/auth'

test.describe('Visual regression — stable UI regions', { tag: ['@visual', '@regression'] }, () => {
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
  })

  test('login form matches baseline', async ({ page }) => {
    await page.goto('/web/login.html')
    await expect(page.getByTestId('login-email')).toBeVisible()

    const loginCard = page.getByTestId('login-card')
    await expect(loginCard).toHaveScreenshot('login-form.png', {
      animations: 'disabled',
      maxDiffPixelRatio: 0.02,
    })
  })

  test('sidebar navigation matches baseline when authenticated', async ({ page, request }) => {
    await loginViaApi(page, request)
    await expect(page.getByTestId('site-sidebar')).toBeVisible()

    await expect(page.getByTestId('site-sidebar')).toHaveScreenshot('sidebar-nav.png', {
      animations: 'disabled',
      maxDiffPixelRatio: 0.02,
    })
  })

  test('components primary buttons match baseline', async ({ page, request }) => {
    await loginViaApi(page, request)
    await page.goto('/web/components.html')
    await expect(page.getByTestId('page-components')).toBeVisible()

    const buttonRow = page.getByTestId('section-buttons')
    await expect(buttonRow).toHaveScreenshot('components-buttons.png', {
      animations: 'disabled',
      maxDiffPixelRatio: 0.03,
    })
  })
})
