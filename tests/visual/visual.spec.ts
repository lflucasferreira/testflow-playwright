import { test, expect } from '@playwright/test'
import { loginViaApi } from '../../support/auth'

const SCREENSHOT_OPTS = {
  animations: 'disabled' as const,
  maxDiffPixelRatio: 0.05,
}

test.describe('Visual regression — stable UI regions', { tag: ['@visual', '@regression'] }, () => {
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
  })

  test('login form matches baseline', async ({ page }) => {
    await page.goto('/web/login.html', { waitUntil: 'networkidle' })
    await expect(page.getByTestId('login-email')).toBeVisible()
    await page.evaluate(() => document.fonts.ready)

    await expect(page.getByTestId('login-card')).toHaveScreenshot('login-form.png', SCREENSHOT_OPTS)
  })

  test('sidebar navigation matches baseline when authenticated', async ({ page, request }) => {
    await loginViaApi(page, request)
    await expect(page.getByTestId('site-sidebar')).toBeVisible()
    await page.evaluate(() => document.fonts.ready)

    await expect(page.getByTestId('site-sidebar')).toHaveScreenshot('sidebar-nav.png', SCREENSHOT_OPTS)
  })

  test('components primary buttons match baseline', async ({ page, request }) => {
    await loginViaApi(page, request)
    await page.goto('/web/components.html', { waitUntil: 'networkidle' })
    await expect(page.getByTestId('page-components')).toBeVisible()
    await page.evaluate(() => document.fonts.ready)

    await expect(page.getByTestId('section-buttons')).toHaveScreenshot(
      'components-buttons.png',
      SCREENSHOT_OPTS,
    )
  })
})
