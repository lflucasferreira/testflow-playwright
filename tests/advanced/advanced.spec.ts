import { test, expect } from '@playwright/test'
import { AdvancedPage } from '../../pages/AdvancedPage'
import { visitAuthenticated } from '../../support/auth'
import { VIEWPORTS } from '../../support/constants/viewports'

test.describe('Advanced — iframe, shadow DOM & external links', { tag: '@regression' }, () => {
  test.beforeEach(async ({ page, request }) => {
    await visitAuthenticated(page, request, '/web/advanced.html')
    await expect(new AdvancedPage(page).pageRoot()).toBeVisible()
  })

  test.describe('Shadow DOM', () => {
    test('renders shadow DOM section and host element', async ({ page }) => {
      await new AdvancedPage(page).shouldShowShadowSection()
    })

    test('accesses content inside shadow root', async ({ page }) => {
      const advanced = new AdvancedPage(page)
      const count = await advanced.shadowContentCount()
      expect(count).toBeGreaterThanOrEqual(1)
    })

    test('shadow host is attached to the document', async ({ page }) => {
      const attached = await page.getByTestId('shadow-host').evaluate((el) => el.isConnected)
      expect(attached).toBe(true)
    })
  })

  test.describe('Iframe', () => {
    test('loads demo iframe with a valid src', async ({ page }) => {
      await new AdvancedPage(page).shouldHaveIframeSrc()
    })

    test('iframe is accessible in the DOM tree', async ({ page }) => {
      const iframe = page.getByTestId('demo-iframe')
      await expect(iframe).toHaveAttribute('title', /.*/)
    })

    test('iframe document body is reachable via frameLocator', async ({ page }) => {
      const advanced = new AdvancedPage(page)
      await expect(advanced.demoIframe()).toBeVisible()
      const frameBody = advanced.iframeFrame().locator('body')
      await expect(frameBody).toBeAttached({ timeout: 10_000 })
    })
  })

  test.describe('Responsive', () => {
    test('shadow section renders at mobile viewport', async ({ page }) => {
      await page.setViewportSize(VIEWPORTS.MOBILE)
      await new AdvancedPage(page).shouldShowShadowSection()
      await page.setViewportSize(VIEWPORTS.DESKTOP)
    })
  })

  test.describe('External links', () => {
    test('external link opens in new tab with http(s) href', async ({ page }) => {
      await new AdvancedPage(page).shouldHaveExternalLink()
    })

    test('external link has rel noopener for security', async ({ page }) => {
      const rel = await page.getByTestId('external-link').getAttribute('rel')
      expect(rel ?? '').toMatch(/noopener/)
    })
  })

  test.describe('Navigation', () => {
    test('Finish button navigates away from advanced page', async ({ page }) => {
      await page.getByTestId('page-finish-btn').click()
      await expect(page).not.toHaveURL(/\/web\/advanced\.html/)
    })

    test('Back button returns to previous page in app', async ({ page }) => {
      const back = page.getByTestId('page-back-btn')
      if (await back.isVisible()) {
        await back.click()
        await expect(page).not.toHaveURL(/\/web\/advanced\.html/)
      }
    })
  })

  test.describe('Page structure', () => {
    test('all advanced sections are visible', async ({ page }) => {
      for (const id of ['section-shadow', 'section-iframe', 'section-external']) {
        await expect(page.getByTestId(id)).toBeVisible()
      }
    })
  })
})
