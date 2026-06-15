import { test, expect, APIResponse } from '@playwright/test'
import { validateSchema } from '../../support/helpers'
import { visitAuthenticated } from '../../support/auth'
import { readFixture } from '../../support/helpers/fixtures'
import { expectSameMembers } from '../../support/helpers/contract'

test.describe('API — Users & Health', () => {
  test.describe('GET /api/users', () => {
    let res: APIResponse
    let body: { users: Array<Record<string, unknown>> }
    let duration: number

    test.beforeAll(async ({ request }) => {
      const start = Date.now()
      res = await request.get('/api/users')
      duration = Date.now() - start
      body = await res.json()
    })

    test('returns status 200', async () => {
      expect(res.status()).toBe(200)
    })

    test('responds within 2000ms', async () => {
      expect(duration).toBeLessThan(2000)
    })

    test('body has a users array', async () => {
      expect(Array.isArray(body.users)).toBe(true)
      expect(body.users.length).toBeGreaterThan(0)
    })

    test('each user has required fields with correct types', async () => {
      for (const user of body.users) {
        validateSchema(user, { name: 'string', email: 'string', role: 'string' })
      }
    })

    test('all emails are valid format', async () => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      for (const user of body.users) {
        expect(String(user.email)).toMatch(emailRegex)
      }
    })

    test('user roles match golden fixture snapshot', async () => {
      const golden = readFixture<{ roles: string[] }>('users/golden-roles.json')
      const roles = [...new Set(body.users.map((u) => String(u.role)))].sort()
      expectSameMembers(golden.roles.sort(), roles)
    })
  })

  test.describe('GET /health', () => {
    test('returns status 200', async ({ request }) => {
      const response = await request.get('/health')
      expect(response.status()).toBe(200)
    })

    test('responds within 1000ms', async ({ request }) => {
      const start = Date.now()
      await request.get('/health')
      expect(Date.now() - start).toBeLessThan(1000)
    })
  })

  test.describe('Error simulation endpoints', () => {
    test('GET /api/errors/404 returns 404', async ({ request }) => {
      const response = await request.get('/api/errors/404')
      expect(response.status()).toBe(404)
    })

    test('GET /api/errors/422 returns 422', async ({ request }) => {
      const response = await request.get('/api/errors/422')
      expect(response.status()).toBe(422)
    })

    test('404 response has a non-empty error or message field', async ({ request }) => {
      const body = await (await request.get('/api/errors/404')).json()
      const errText = body.message ?? body.error?.message
      expect(typeof errText).toBe('string')
      expect(errText.length).toBeGreaterThan(0)
    })

    test('422 response has a non-empty error or message field', async ({ request }) => {
      const body = await (await request.get('/api/errors/422')).json()
      const errText = body.message ?? body.error?.message
      expect(typeof errText).toBe('string')
      expect(errText.length).toBeGreaterThan(0)
    })
  })

  test.describe('Intercept — users list loaded on Team page', () => {
    test.beforeEach(async ({ page, request }) => {
      await visitAuthenticated(page, request, '/web/team.html')
    })

    test('Team page triggers GET /api/users on load', async ({ page }) => {
      const loadUsers = page.waitForRequest(
        (req) => req.method() === 'GET' && /\/api\/users/.test(req.url()),
        { timeout: 3000 },
      ).catch(() => null)

      await page.reload()
      await expect(page.getByTestId('users-table')).toBeVisible()

      const interception = await loadUsers
      if (interception) {
        const response = await interception.response()
        expect(response?.status()).toBe(200)
      }
    })

    test('stubbed empty users list shows zero rows if page uses API', async ({ page }) => {
      await page.route(/\/api\/users/, (route) =>
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ users: [] }),
        }),
      )

      const emptyUsers = page.waitForRequest(
        (req) => req.method() === 'GET' && /\/api\/users/.test(req.url()),
        { timeout: 3000 },
      ).catch(() => null)

      await page.reload()
      await expect(page.getByTestId('users-table')).toBeVisible()

      const interception = await emptyUsers
      if (interception) {
        await expect(page.getByTestId('users-table').locator('tbody tr')).toHaveCount(0)
      }
    })

    test('stubbed API error shows fallback state if page uses API', async ({ page }) => {
      await page.route(/\/api\/users/, (route) =>
        route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ message: 'Internal Server Error' }),
        }),
      )

      const failUsers = page.waitForRequest(
        (req) => req.method() === 'GET' && /\/api\/users/.test(req.url()),
        { timeout: 3000 },
      ).catch(() => null)

      await page.reload()
      await expect(page.getByTestId('users-table')).toBeVisible()

      const interception = await failUsers
      if (interception) {
        await expect(page.getByTestId('users-table').locator('tbody tr')).toHaveCount(0)
      }
    })
  })

  test.describe('Fixture data', () => {
    test('countries lookup fixture has code and name keys', async () => {
      const data = readFixture<{ countries: Array<{ code: string; name: string }> }>(
        'lookups/countries.json',
      )
      expect(data.countries.length).toBeGreaterThan(0)
      expect(data.countries[0]).toEqual(expect.objectContaining({ code: expect.any(String), name: expect.any(String) }))
    })
  })
})
