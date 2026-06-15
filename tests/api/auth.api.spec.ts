import { test, expect, APIResponse } from '@playwright/test'
import { LoginPage } from '../../pages/LoginPage'
import { DEMO_EMAIL, DEMO_PASSWORD } from '../../support/helpers'

const ENDPOINT = '/api/auth/login'
const VALID = { email: DEMO_EMAIL, password: DEMO_PASSWORD }

test.describe('API — POST /api/auth/login', () => {
  test.describe('Valid credentials', () => {
    let res: APIResponse
    let body: Record<string, unknown>
    let duration: number

    test.beforeAll(async ({ request }) => {
      const start = Date.now()
      res = await request.post(ENDPOINT, { data: VALID })
      duration = Date.now() - start
      body = await res.json()
    })

    test('returns status 200', async () => {
      expect(res.status()).toBe(200)
    })

    test('content-type is application/json', async () => {
      expect(res.headers()['content-type']).toContain('application/json')
    })

    test('responds within 2000ms', async () => {
      expect(duration).toBeLessThan(2000)
    })

    test('body has token as non-empty string', async () => {
      expect(typeof body.token).toBe('string')
      expect((body.token as string).length).toBeGreaterThan(0)
    })

    test('body has user object or token-only response', async () => {
      if (body.user) {
        expect(typeof (body.user as { email: string }).email).toBe('string')
        expect((body.user as { email: string }).email.length).toBeGreaterThan(0)
      } else {
        expect(typeof body.token).toBe('string')
        expect((body.token as string).length).toBeGreaterThan(0)
      }
    })

    test('user.email matches the login email when user is present', async () => {
      if (body.user && (body.user as { email?: string }).email) {
        expect((body.user as { email: string }).email).toBe(VALID.email)
      }
    })

    test('token can authenticate a subsequent request', async ({ request }) => {
      const response = await request.get('/api/users', {
        headers: { Authorization: `Bearer ${body.token}` },
      })
      expect(response.status()).toBe(200)
    })
  })

  test.describe('Invalid credentials', () => {
    test('returns 401 for wrong password', async ({ request }) => {
      const response = await request.post(ENDPOINT, {
        data: { email: VALID.email, password: 'wrongpassword' },
      })
      expect(response.status()).toBe(401)
    })

    test('returns 401 for unknown email', async ({ request }) => {
      const response = await request.post(ENDPOINT, {
        data: { email: 'nobody@example.com', password: VALID.password },
      })
      expect(response.status()).toBe(401)
    })

    test('error response has a non-empty error or message field', async ({ request }) => {
      const response = await request.post(ENDPOINT, {
        data: { email: VALID.email, password: 'wrong' },
      })
      const body = await response.json()
      const errText = (body.message as string) ?? (body.error as { message?: string })?.message
      expect(typeof errText).toBe('string')
      expect(errText.length).toBeGreaterThan(0)
    })
  })

  test.describe('Malformed request', () => {
    test('returns 4xx when body is empty', async ({ request }) => {
      const response = await request.post(ENDPOINT, { data: {} })
      expect(response.status()).toBeGreaterThanOrEqual(400)
      expect(response.status()).toBeLessThanOrEqual(422)
    })

    test('returns 4xx when email is missing', async ({ request }) => {
      const response = await request.post(ENDPOINT, { data: { password: VALID.password } })
      expect(response.status()).toBeGreaterThanOrEqual(400)
      expect(response.status()).toBeLessThanOrEqual(422)
    })

    test('returns 4xx when password is missing', async ({ request }) => {
      const response = await request.post(ENDPOINT, { data: { email: VALID.email } })
      expect(response.status()).toBeGreaterThanOrEqual(400)
      expect(response.status()).toBeLessThanOrEqual(422)
    })
  })

  test.describe('Intercept — login flow validates network contract', () => {
    test('API toggle sends POST with correct payload and token response', async ({ page }) => {
      const login = new LoginPage(page)
      const loginCall = page.waitForRequest(
        (req) => req.url().includes(ENDPOINT) && req.method() === 'POST',
      )

      await login.visit()
      await login.toggleUseApi()
      await login.fillEmail(VALID.email)
      await login.fillPassword(VALID.password)
      await login.submit()

      const request = await loginCall
      const response = await request.response()
      const requestBody = request.postDataJSON()
      const responseBody = await response!.json()

      expect(requestBody.email).toBe(VALID.email)
      expect(response!.status()).toBe(200)
      expect(typeof responseBody.token).toBe('string')
      expect(responseBody.token.length).toBeGreaterThan(0)
    })

    test('stubbed 500 keeps user on login page without crashing', async ({ page }) => {
      await page.route('**/api/auth/login', (route) =>
        route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Internal Server Error' }),
        }),
      )

      const login = new LoginPage(page)
      await login.visit()
      await login.toggleUseApi()
      await login.fillEmail(VALID.email)
      await login.fillPassword(VALID.password)
      await login.submit()

      await expect(page).toHaveURL(/\/web\/login\.html/)
      const result = page.getByTestId('login-result')
      if (await result.isVisible()) {
        await expect(result).not.toBeEmpty()
      }
    })
  })
})
