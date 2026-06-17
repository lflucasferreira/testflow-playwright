# API — Authentication (POST /api/auth/login)

**Source file:** [`auth.api.spec.ts`](../../../../tests/api/auth.api.spec.ts)

---

## Purpose

This module covers **contract and integration tests** for the login endpoint. It validates:

- Success response contract (status, content-type, timing, token, user)
- Token usability on subsequent authenticated requests
- 401 responses for invalid credentials
- 4xx responses for malformed payloads
- UI + network integration with API toggle and stubbed 500 error

It combines pure API tests via the `request` fixture with browser-based interception tests.

---

## Prerequisites

| Item | Detail |
|------|--------|
| **TestFlow** | Backend responding on `POST /api/auth/login` |
| **Credentials** | `DEMO_EMAIL` and `DEMO_PASSWORD` in environment variables |
| **Execution** | `npm run test:api` (runs all API specs) |

---

## Tags used

This spec has no explicit Playwright tags. It runs under the `api` project.

---

## Playwright concepts

| Concept | Usage in this file |
|---------|-------------------|
| **`request` fixture** | HTTP client without browser |
| **`test.beforeAll`** | Single login request shared across valid-credential tests |
| **`APIResponse`** | Typed response stored in describe-scoped variables |
| **`page.waitForRequest`** | Captures login POST from UI flow |
| **`page.route` + `route.fulfill`** | Stubs 500 error on login endpoint |
| **Page Object** | [`LoginPage`](../../../../pages/LoginPage.ts) for intercept block |

---

## Step-by-step — block by block

### Block 1 — Constants and valid credentials setup

```typescript
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
```

- **Given:** valid DEMO credentials.
- **When:** a single POST runs in `beforeAll`.
- **Then:** response, body, and duration are shared across multiple assertions — reduces server load.

---

### Block 2 — Valid credentials assertions

```typescript
    test('returns status 200', async () => {
      expect(res.status()).toBe(200)
    })

    test('responds within 2000ms', async () => {
      expect(duration).toBeLessThan(2000)
    })

    test('body has token as non-empty string', async () => {
      expect(typeof body.token).toBe('string')
      expect((body.token as string).length).toBeGreaterThan(0)
    })

    test('token can authenticate a subsequent request', async ({ request }) => {
      const response = await request.get('/api/users', {
        headers: { Authorization: `Bearer ${body.token}` },
      })
      expect(response.status()).toBe(200)
    })
```

- **Given:** the shared login response.
- **When:** each test inspects a different contract aspect.
- **Then:** status 200, JSON content-type, fast response, valid token, and Bearer auth on `/api/users` all pass.

---

### Block 3 — Invalid credentials

```typescript
  test.describe('Invalid credentials', () => {
    test('returns 401 for wrong password', async ({ request }) => {
      const response = await request.post(ENDPOINT, {
        data: { email: VALID.email, password: 'wrongpassword' },
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
```

- **Given:** invalid password or unknown email.
- **When:** POST is sent with bad credentials.
- **Then:** status is 401 and error body contains a message.

---

### Block 4 — Malformed request

```typescript
  test.describe('Malformed request', () => {
    test('returns 4xx when body is empty', async ({ request }) => {
      const response = await request.post(ENDPOINT, { data: {} })
      expect(response.status()).toBeGreaterThanOrEqual(400)
      expect(response.status()).toBeLessThanOrEqual(422)
    })
  })
```

- **Given:** incomplete login payloads (empty body, missing email, missing password).
- **When:** POST is sent.
- **Then:** status is in the 400–422 range.

---

### Block 5 — Intercept — login flow

```typescript
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
      expect(request.postDataJSON().email).toBe(VALID.email)
      expect(response!.status()).toBe(200)
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
      await login.loginWith(VALID.email, VALID.password)

      await expect(page).toHaveURL(/\/web\/login\.html/)
    })
  })
```

- **Given:** login page with API toggle or stubbed 500.
- **When:** user submits credentials.
- **Then:** network contract is verified or error is handled gracefully without navigation.

---

## How to run

```bash
npm run test:api
npx playwright test tests/api/auth.api.spec.ts
```

---

## Related references

- Auth helpers: [`support/auth.ts`](../../../../support/auth.ts)
- Smoke API health (subset): [`tests/smoke/navigation.spec.ts`](../../../../tests/smoke/navigation.spec.ts)
- Login UI suite: [`tests/auth/login.spec.ts`](../../../../tests/auth/login.spec.ts)
