# Smoke — Navigation and API Health

**Source file:** [`navigation.spec.ts`](../../../../tests/smoke/navigation.spec.ts)

---

## Purpose

This **smoke** suite verifies that the TestFlow application is operational after authentication. It covers four complementary dimensions:

1. **Page loading** — each authenticated route opens without error and exposes the expected root element.
2. **Sidebar navigation** — links and active state behave according to the UI contract.
3. **Logout** — session is cleared and the user is redirected to login.
4. **API health** — critical endpoints respond with the correct status and payload.

The suite is designed to be **fast**: it uses API login (`getAuthToken` / `loginViaApi`) to avoid repeating UI auth in every test and checks only the root of each page, without deep flows.

---

## Prerequisites

| Item | Detail |
|------|--------|
| **TestFlow** | Application running at `http://localhost:5050` (or the `BASE_URL` configured in `playwright.config.ts`) |
| **Dependencies** | `npm install` executed at the project root |
| **Credentials** | `DEMO_EMAIL` and `DEMO_PASSWORD` defined in environment variables or `.env` |
| **Execution** | `npm run test:smoke` or `npx playwright test tests/smoke/navigation.spec.ts` |

---

## Tags used

| Tag | Where it appears | Meaning |
|-----|------------------|---------|
| `@smoke` | Page navigation, sidebar, logout, API health blocks | Fast post-deploy sanity checks |
| `@api` | "Smoke — API health" block | HTTP tests via `request` fixture, no browser UI |

---

## Playwright concepts

| Concept | Usage in this file |
|---------|-------------------|
| [`getAuthToken`](../../../../support/auth.ts) | Fetches Bearer token once in `beforeAll` for page-load tests |
| [`visitWithToken`](../../../../support/auth.ts) | Injects token into `sessionStorage` and navigates to a path |
| [`loginViaApi`](../../../../support/auth.ts) | Full API login + dashboard visit for sidebar tests |
| [`page.getByTestId`](../../../../docs/selector-strategy.md) | Stable selectors via `data-testid` |
| [`request` fixture](https://playwright.dev/docs/api-testing) | Direct HTTP calls without opening a page |
| `{ tag: '@smoke' }` | Playwright native test tags for grep filtering |
| `page.evaluate()` | Reads `sessionStorage` after logout |

---

## Step-by-step — block by block

### Block 1 — Imports and page list

```typescript
import { test, expect } from '@playwright/test'
import { DEMO_EMAIL, DEMO_PASSWORD } from '../../support/helpers'
import { getAuthToken, loginViaApi, visitWithToken } from '../../support/auth'

const PAGES = [
  { path: '/web/dashboard.html', testId: 'page-dashboard', title: 'Dashboard' },
  // ... remaining pages
]
```

- **Given:** the project imports auth helpers and demo credentials.
- **When:** `PAGES` defines the contract for each route — path, root `testId`, and expected `<title>`.
- **Then:** adding a new page requires only one array entry, without duplicating logic.

**Pages covered:** Dashboard, Team, Settings, Classic Widgets, Components, Activity, Advanced, Wizard, UI States.

---

### Block 2 — Smoke: page navigation

```typescript
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
```

- **Given:** a valid auth token is obtained once via API in `beforeAll`.
- **When:** each test visits a path with pre-injected session data.
- **Then:** the page root is visible and the browser title matches — minimal proof of rendering.

---

### Block 3 — Smoke: sidebar navigation

```typescript
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
```

- **Given:** an authenticated user is on the dashboard with the sidebar visible.
- **When:** they click the `nav-team` link.
- **Then:** the URL changes to `/web/team.html` and `page-team` appears.

**Active link test:**

```typescript
  test('highlights the active nav link', async ({ page }) => {
    await expect(page.getByTestId('nav-dashboard')).toHaveClass(/active/)
  })
```

- **Given:** the dashboard is the current route.
- **When:** the corresponding menu item is inspected.
- **Then:** it has the CSS class `active` — visual navigation feedback.

---

### Block 4 — Smoke: logout

```typescript
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
```

- **Given:** an active session created via UI login.
- **When:** the user clicks logout.
- **Then:** they are redirected to the home page and `sandbox-auth` is removed from `sessionStorage`.

---

### Block 5 — Smoke: API health

```typescript
test.describe('Smoke — API health', { tag: ['@smoke', '@api'] }, () => {
  test('GET /health returns 200', async ({ request }) => {
    const response = await request.get('/health')
    expect(response.status()).toBe(200)
  })
```

- **Given:** the TestFlow backend is reachable.
- **When:** `GET /health` is executed.
- **Then:** the HTTP status is 200.

**Login via API:**

```typescript
  test('POST /api/auth/login returns token', async ({ request }) => {
    const response = await request.post('/api/auth/login', {
      data: { email: DEMO_EMAIL, password: DEMO_PASSWORD },
    })
    expect(response.status()).toBe(200)
    const body = await response.json()
    expect(body.token).toBeTruthy()
    expect(body.user.email).toBe(DEMO_EMAIL)
  })
```

- **Given:** valid DEMO credentials.
- **When:** `POST /api/auth/login` with a JSON body.
- **Then:** response is 200, token is present, and user email matches.

**Error endpoints:**

```typescript
  test('GET /api/errors/404 returns 404 status', async ({ request }) => {
    const response = await request.get('/api/errors/404')
    expect(response.status()).toBe(404)
  })
```

- **Given:** simulated error routes exist on the backend.
- **When:** request is made to `/api/errors/404` or `/api/errors/422`.
- **Then:** the asserted status matches (404 or 422).

---

## How to run

```bash
# Full smoke project
npm run test:smoke

# This file only
npx playwright test tests/smoke/navigation.spec.ts

# @smoke tag across smoke + api projects
npm run test:grep:smoke

# Cross-browser smoke (Firefox / WebKit)
npm run test:smoke-firefox
npm run test:smoke-webkit
```

---

## Related references

- Auth helpers: [`support/auth.ts`](../../../../support/auth.ts)
- Playwright config projects: [`playwright.config.ts`](../../../../playwright.config.ts)
- Selector strategy: [`docs/selector-strategy.md`](../../../../selector-strategy.md)
