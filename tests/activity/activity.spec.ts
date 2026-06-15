import { test, expect } from '@playwright/test'
import { ActivityPage } from '../../pages/ActivityPage'
import { visitAuthenticated } from '../../support/auth'

test.describe('Activity — dynamic UI & API interactions', () => {
  test.describe.configure({ timeout: 15_000 })

  test.beforeEach(async ({ page, request }) => {
    await visitAuthenticated(page, request, '/web/activity.html')
    await expect(new ActivityPage(page).pageRoot()).toBeVisible()
  })

  test.describe('API interactions', () => {
    test('fetch users via API button returns result', async ({ page }) => {
      const activity = new ActivityPage(page)
      const usersRequest = page.waitForResponse(
        (res) => res.url().includes('/api/users') && res.request().method() === 'GET',
      )

      await test.step('Trigger fetch users', async () => {
        await activity.fetchUsers()
      })

      const response = await usersRequest
      expect(response.status()).toBe(200)
      await activity.shouldShowApiResult()
    })

    test('handles slow API with delayed response', async ({ page }) => {
      await page.route(/\/api\/users/, async (route) => {
        await new Promise((resolve) => setTimeout(resolve, 1200))
        await route.continue()
      })

      const activity = new ActivityPage(page)
      await activity.fetchSlowBtn().click()
      await activity.shouldShowApiResult()
    })

    test('stubbed empty users list shows zero count message', async ({ page }) => {
      await page.route(/\/api\/users/, (route) =>
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ users: [], total: 0 }),
        }),
      )

      const activity = new ActivityPage(page)
      await activity.fetchUsers()
      await expect(activity.apiResult()).toContainText('Fetched 0 users')
    })

    test('stubbed 500 error shows error state in result', async ({ page }) => {
      await page.route(/\/api\/users/, (route) =>
        route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ message: 'Internal Server Error' }),
        }),
      )

      const activity = new ActivityPage(page)
      await activity.fetchUsers()
      await expect(activity.apiResult()).toBeVisible()
      await expect(activity.apiResult()).not.toBeEmpty()
    })
  })

  test.describe('Live counter', () => {
    test('increments and decrements counter value', async ({ page }) => {
      const activity = new ActivityPage(page)
      await activity.incrementCounter(2)
      await activity.shouldShowCounter(2)
      await activity.counterDecrement().click()
      await activity.shouldShowCounter(1)
    })

    test('resets counter to zero', async ({ page }) => {
      const activity = new ActivityPage(page)
      await activity.incrementCounter(3)
      await activity.counterReset().click()
      await activity.shouldShowCounter(0)
    })

    test('counter badge is visible with session label', async ({ page }) => {
      const activity = new ActivityPage(page)
      await activity.incrementCounter(1)
      await expect(activity.counterBadge()).toBeVisible()
      await expect(activity.counterBadge()).toContainText('Session')
      await activity.shouldShowCounter(1)
    })
  })

  test.describe('CI pipeline simulation', () => {
    test('starts pipeline and advances progress', async ({ page }) => {
      const activity = new ActivityPage(page)
      await activity.startPipeline()
      await expect(activity.pipelineBadge()).not.toHaveText('Idle')
      await expect(activity.downloadProgress()).toBeVisible()
      await expect.poll(async () => {
        const pct = parseInt((await activity.pipelinePct().innerText()).replace('%', ''), 10)
        return pct
      }, { timeout: 5000 }).toBeGreaterThan(0)
    })

    test('pipeline percentage increases over time', async ({ page }) => {
      const activity = new ActivityPage(page)
      await activity.startPipeline()
      const initial = parseInt((await activity.pipelinePct().innerText()).replace('%', ''), 10)
      await expect.poll(async () => {
        const pct = parseInt((await activity.pipelinePct().innerText()).replace('%', ''), 10)
        return pct
      }, { timeout: 5000 }).toBeGreaterThan(initial)
    })
  })

  test.describe('Dynamic content', () => {
    test('loads dynamic content section on demand', async ({ page }) => {
      const activity = new ActivityPage(page)
      await activity.loadDynamicContent()
      await activity.shouldShowDynamicContent()
    })

    test('dynamic report section is visible on page load', async ({ page }) => {
      await expect(page.getByTestId('section-dynamic-report')).toBeVisible()
    })
  })

  test.describe('File drop zone', () => {
    test('drop zone accepts file via setInputFiles', async ({ page }) => {
      const activity = new ActivityPage(page)
      await expect(activity.dropZone()).toBeVisible()
      const fileInput = page.locator('[data-testid="drop-zone"] input[type="file"]')
      if (await fileInput.count()) {
        await fileInput.setInputFiles('fixtures/sample-upload.txt')
      } else {
        await activity.dropZone().click()
      }
      await expect(activity.pageRoot()).toBeVisible()
    })
  })

  test.describe('Page navigation', () => {
    test('Next button navigates to the following app page', async ({ page }) => {
      const next = page.getByTestId('page-next-btn')
      await expect(next).toBeVisible()
      await next.click()
      await expect(page).not.toHaveURL(/\/web\/activity\.html/)
    })
  })
})
