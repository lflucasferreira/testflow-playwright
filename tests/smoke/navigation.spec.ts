import { test, expect } from '@playwright/test'
import { DEMO_EMAIL, DEMO_PASSWORD } from '../../support/helpers'
import { getAuthToken, loginViaApi, visitWithToken } from '../../support/auth'

const PAGES = [
  { path: '/web/dashboard.html', testId: 'page-dashboard', title: 'Dashboard' },
  { path: '/web/team.html', testId: 'page-team', title: 'Team' },
  { path: '/web/settings.html', testId: 'page-settings', title: 'Settings' },
  { path: '/web/widgets.html', testId: 'page-widgets', title: 'Classic Widgets' },
  { path: '/web/components.html', testId: 'page-components', title: 'Components' },
  { path: '/web/activity.html', testId: 'page-activity', title: 'Activity' },
  { path: '/web/advanced.html', testId: 'page-advanced', title: 'Advanced' },
  { path: '/web/wizard.html', testId: 'page-wizard', title: 'Wizard' },
  { path: '/web/states.html', testId: 'page-states', title: 'UI States' },
]

test.describe('Smoke — page navigation', { tag: '@smoke' }, () => {
  let authToken: string

  test.beforeAll(async ({ request }) => {
    authToken = await getAuthToken(request)
  })

  for (const { path, testId, title } of PAGES) {
    test(`${title} page loads without error`, async ({ page }) => {
      await visitWithToken(page, path, authToken)
      await expect(page.getByTestId(testId)).toBeVisible()
      await expect(page).toHaveTitle(new RegExp(title))
    })
  }
})

test.describe('Smoke — sidebar navigation', { tag: '@smoke' }, () => {
  test.beforeEach(async ({ page, request }) => {
    await loginViaApi(page, request)
    await expect(page.getByTestId('page-dashboard')).toBeVisible()
  })

  test('navigates from dashboard to team via sidebar', async ({ page }) => {
    await page.getByTestId('nav-team').click()
    await expect(page.getByTestId('page-team')).toBeVisible()
    await expect(page).toHaveURL(/\/web\/team\.html/)
  })

  test('highlights the active nav link', async ({ page }) => {
    await expect(page.getByTestId('nav-dashboard')).toHaveClass(/active/)
  })
})

test.describe('Smoke — logout', { tag: '@smoke' }, () => {
  test('logout clears session and redirects to login', async ({ page }) => {
    await page.goto('/web/login.html')
    await page.getByTestId('login-email').fill(DEMO_EMAIL)
    await page.getByTestId('login-password').fill(DEMO_PASSWORD)
    await page.getByTestId('login-submit').click()
    await page.getByTestId('page-dashboard').waitFor()

    await page.getByTestId('nav-logout').click()
    await expect(page).toHaveURL(/\/web\/index\.html/)
    expect(await page.evaluate(() => sessionStorage.getItem('sandbox-auth'))).toBeNull()
  })
})

test.describe('Smoke — API health', { tag: ['@smoke', '@api'] }, () => {
  test('GET /health returns 200', async ({ request }) => {
    const response = await request.get('/health')
    expect(response.status()).toBe(200)
  })

  test('POST /api/auth/login returns token', async ({ request }) => {
    const response = await request.post('/api/auth/login', {
      data: { email: DEMO_EMAIL, password: DEMO_PASSWORD },
    })
    expect(response.status()).toBe(200)
    const body = await response.json()
    expect(body.token).toBeTruthy()
    expect(body.user.email).toBe(DEMO_EMAIL)
  })

  test('GET /api/users returns user array', async ({ request }) => {
    const response = await request.get('/api/users')
    expect(response.status()).toBe(200)
    const body = await response.json()
    expect(Array.isArray(body.users)).toBe(true)
    expect(body.users.length).toBeGreaterThan(0)
  })

  test('GET /api/errors/404 returns 404 status', async ({ request }) => {
    const response = await request.get('/api/errors/404')
    expect(response.status()).toBe(404)
  })

  test('GET /api/errors/422 returns 422 status', async ({ request }) => {
    const response = await request.get('/api/errors/422')
    expect(response.status()).toBe(422)
  })
})
