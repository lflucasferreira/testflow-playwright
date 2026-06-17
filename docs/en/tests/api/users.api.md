# API — Users & Health

**Source file:** [`users.api.spec.ts`](../../../../tests/api/users.api.spec.ts)

---

## Purpose

This module covers **contract tests** for user listing and health endpoints, plus **UI integration** tests that stub the users API on the Team page. It validates:

- `GET /api/users` response contract (status, timing, schema, emails, roles)
- Golden fixture comparison for user roles
- `GET /health` availability and performance
- Error simulation endpoints (404, 422) with message bodies
- Team page network interception (real load, empty stub, 500 stub)
- Offline fixture validation for countries lookup

---

## Prerequisites

| Item | Detail |
|------|--------|
| **TestFlow** | Backend responding on `/api/users` and `/health` |
| **Credentials** | `DEMO_EMAIL` and `DEMO_PASSWORD` for UI intercept tests |
| **Fixtures** | [`users/golden-roles.json`](../../../../fixtures/users/golden-roles.json), [`lookups/countries.json`](../../../../fixtures/lookups/countries.json) |
| **Execution** | `npm run test:api` |

---

## Tags used

This spec has no explicit Playwright tags. It runs under the `api` project.

---

## Playwright concepts

| Concept | Usage in this file |
|---------|-------------------|
| **`request` fixture** | Pure HTTP tests without browser |
| **`test.beforeAll`** | Single GET `/api/users` shared across contract tests |
| [`validateSchema`](../../../../support/helpers.ts) | Lightweight field type validation |
| [`expectSameMembers`](../../../../support/helpers/contract.ts) | Order-independent array comparison |
| [`readFixture`](../../../../support/helpers/fixtures.ts) | Loads golden role snapshot |
| **`page.route` + `route.fulfill`** | Stubs users API on Team page reload |
| **`page.waitForRequest`** | Captures GET `/api/users` on page reload |

---

## Step-by-step — block by block

### Block 1 — GET /api/users contract

```typescript
import { test, expect, APIResponse } from '@playwright/test'
import { validateSchema } from '../../support/helpers'
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

    test('each user has required fields with correct types', async () => {
      for (const user of body.users) {
        validateSchema(user, { name: 'string', email: 'string', role: 'string' })
      }
    })
```

- **Given:** a single GET `/api/users` in `beforeAll`.
- **When:** each test inspects a contract aspect.
- **Then:** 200 status, fast response, non-empty users array with typed fields and valid emails.

**Golden roles:**

```typescript
    test('user roles match golden fixture snapshot', async () => {
      const golden = readFixture<{ roles: string[] }>('users/golden-roles.json')
      const roles = [...new Set(body.users.map((u) => String(u.role)))].sort()
      expectSameMembers(golden.roles.sort(), roles)
    })
```

- **Given:** a committed golden fixture of expected roles.
- **When:** live API roles are extracted and sorted.
- **Then:** they match the fixture regardless of order.

---

### Block 2 — Health & error endpoints

```typescript
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
  })
```

- **Given:** health and error simulation routes.
- **When:** GET requests are made.
- **Then:** correct status codes and non-empty error messages.

---

### Block 3 — Intercept on Team page

```typescript
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
        expect((await interception.response())?.status()).toBe(200)
      }
    })
```

- **Given:** authenticated Team page.
- **When:** page reloads and optionally triggers API fetch.
- **Then:** GET `/api/users` returns 200 if the page is API-driven.

**Empty stub:**

```typescript
    test('stubbed empty users list shows zero rows if page uses API', async ({ page }) => {
      await page.route(/\/api\/users/, (route) =>
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ users: [] }),
        }),
      )

      await page.reload()
      const interception = await page.waitForRequest(/* ... */).catch(() => null)
      if (interception) {
        await expect(page.getByTestId('users-table').locator('tbody tr')).toHaveCount(0)
      }
    })
```

- **Given:** API stubbed to return empty users array.
- **When:** Team page reloads.
- **Then:** table shows zero rows if API-driven.

---

## How to run

```bash
npm run test:api
npx playwright test tests/api/users.api.spec.ts
```

---

## Related references

- Team UI suite: [`tests/team/team.spec.ts`](../../../../tests/team/team.spec.ts)
- Smoke API health: [`tests/smoke/navigation.spec.ts`](../../../../tests/smoke/navigation.spec.ts)
- Golden roles fixture: [`fixtures/users/golden-roles.json`](../../../../fixtures/users/golden-roles.json)
