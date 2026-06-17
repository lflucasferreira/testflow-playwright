# Authentication — Login

**Source file:** [`login.spec.ts`](../../../../tests/auth/login.spec.ts)

---

## Purpose

This suite validates the **full authentication flow** of the TestFlow application through the login screen. It covers:

- Form structure and field attributes
- Successful login (pure UI and with API toggle)
- Session persistence in `sessionStorage`
- Rejection of invalid credentials
- HTML5 validation and "Remember me" checkbox behavior
- Route protection and post-login redirect
- Logout from an authenticated session

It is the foundation for understanding how [`LoginPage`](../../../../pages/LoginPage.ts) encapsulates reusable selectors and actions.

---

## Prerequisites

| Item | Detail |
|------|--------|
| **TestFlow** | Running at `http://localhost:5050` |
| **Dependencies** | `npm install` at the project root |
| **DEMO credentials** | `DEMO_EMAIL` and `DEMO_PASSWORD` in environment variables |
| **Fixture** | [`credentials.json`](../../../../fixtures/credentials.json) with valid/invalid pairs for negative tests |
| **Execution** | `npm run test:auth` |

---

## Tags used

This spec has no explicit Playwright tags. It runs under the `auth` project in `playwright.config.ts`.

---

## Playwright concepts

| Concept | Usage in this file |
|---------|-------------------|
| **Page Object** | [`LoginPage`](../../../../pages/LoginPage.ts) — fluent methods (`loginWith`, `shouldRedirectToDashboard`) |
| **`test.describe` nesting** | Groups tests by theme (structure, valid credentials, invalid, etc.) |
| **`page.waitForRequest`** | Spies on `POST /api/auth/login` when "Use API" toggle is active |
| **`page.evaluate()`** | Inspects `sessionStorage` after login |
| **`credentials.json` fixture** | Loads valid/invalid email/password pairs for negative tests |
| **`storageState`** | Auth project uses pre-saved state from `globalSetup`, but login tests start unauthenticated via `LoginPage.visit()` |

---

## Step-by-step — block by block

### Block 1 — Setup and Page Object

```typescript
import { test, expect } from '@playwright/test'
import { LoginPage } from '../../pages/LoginPage'
import { DEMO_EMAIL, DEMO_PASSWORD } from '../../support/helpers'
import credentials from '../../fixtures/credentials.json'

test.describe('Authentication', () => {
  test.beforeEach(async ({ page }) => {
    await new LoginPage(page).visit()
  })
```

- **Given:** each test starts on the login page.
- **When:** `LoginPage.visit()` navigates to `/web/login.html`.
- **Then:** clean state — no prior session assumed (except where the test creates one).

---

### Block 2 — Page structure

```typescript
  test.describe('Page structure', () => {
    test('renders all form elements', async ({ page }) => {
      const login = new LoginPage(page)
      await expect(login.emailInput()).toBeVisible()
      await expect(login.passwordInput()).toBeVisible()
      await expect(login.submitBtn()).toBeVisible()
      await expect(login.submitBtn()).toBeEnabled()
      await expect(login.rememberCheckbox()).toBeAttached()
      await expect(login.useApiCheckbox()).toBeAttached()
    })
```

- **Given:** the login page is loaded.
- **When:** form elements are queried via Page Object methods.
- **Then:** email, password, submit, remember-me, and API toggle are present and interactive.

---

### Block 3 — Valid credentials

```typescript
  test.describe('Valid credentials', () => {
    test('logs in via UI and redirects to dashboard', async ({ page }) => {
      const login = new LoginPage(page)
      await login.loginWith(DEMO_EMAIL, DEMO_PASSWORD)
      await login.shouldRedirectToDashboard()
    })
```

- **Given:** valid DEMO credentials.
- **When:** the user submits the login form.
- **Then:** the browser navigates to the dashboard.

**API toggle test:**

```typescript
    test('logs in with API toggle enabled', async ({ page }) => {
      const login = new LoginPage(page)
      const loginRequest = page.waitForRequest((req) =>
        req.url().includes('/api/auth/login') && req.method() === 'POST',
      )

      await login.toggleUseApi()
      await login.loginWith(DEMO_EMAIL, DEMO_PASSWORD)

      const request = await loginRequest
      const response = await request.response()
      expect(response?.status()).toBe(200)
      await login.shouldRedirectToDashboard()
    })
```

- **Given:** "Use API" checkbox is enabled.
- **When:** login is submitted.
- **Then:** a POST to `/api/auth/login` returns 200 and the user reaches the dashboard.

**Session storage:**

```typescript
    test('sets auth data in sessionStorage after login', async ({ page }) => {
      await new LoginPage(page).loginWith(DEMO_EMAIL, DEMO_PASSWORD)
      const auth = await page.evaluate(() => {
        const raw = sessionStorage.getItem('sandbox-auth')
        return raw ? JSON.parse(raw) : null
      })
      expect(auth).not.toBeNull()
      expect(auth.email).toBe(DEMO_EMAIL)
    })
```

- **Given:** a successful UI login.
- **When:** `sessionStorage` is read via `page.evaluate`.
- **Then:** `sandbox-auth` contains the user's email.

---

### Block 4 — Invalid credentials

```typescript
  test.describe('Invalid credentials', () => {
    test('shows error for wrong password', async ({ page }) => {
      const login = new LoginPage(page)
      await login.loginWith(credentials.valid.email, credentials.invalid.password)
      await login.shouldShowError('Invalid credentials')
    })
```

- **Given:** a valid email with wrong password from the fixture.
- **When:** login is attempted.
- **Then:** an error message is displayed and the user stays on the login page.

---

### Block 5 — Form validation & Remember me

```typescript
  test.describe('Form validation', () => {
    test('requires email to not be empty (HTML5 validation)', async ({ page }) => {
      const login = new LoginPage(page)
      await login.fillPassword(DEMO_PASSWORD)
      await login.submit()
      const isValid = await login.emailInput().evaluate((el) => (el as HTMLInputElement).validity.valid)
      expect(isValid).toBe(false)
    })
  })
```

- **Given:** email field is empty.
- **When:** submit is clicked with only password filled.
- **Then:** HTML5 constraint validation fails on the email field.

---

### Block 6 — Redirect & Logout

```typescript
  test.describe('Redirect after login', () => {
    test('redirects to login when accessing a protected page unauthenticated', async ({ page }) => {
      await page.goto('/web/team.html')
      await expect(page).toHaveURL(/\/web\/login\.html/)

      await new LoginPage(page).loginWith(DEMO_EMAIL, DEMO_PASSWORD)
      await expect(page).not.toHaveURL(/\/web\/login\.html/)
    })
  })
```

- **Given:** an unauthenticated user tries to open `/web/team.html`.
- **When:** the app redirects to login and the user authenticates.
- **Then:** they are no longer on the login page.

---

## How to run

```bash
# Auth project
npm run test:auth

# This file only
npx playwright test tests/auth/login.spec.ts

# Interactive UI mode
npm run test:ui -- tests/auth/login.spec.ts
```

---

## Related references

- Page Object: [`pages/LoginPage.ts`](../../../../pages/LoginPage.ts)
- Credentials fixture: [`fixtures/credentials.json`](../../../../fixtures/credentials.json)
- Auth helpers: [`support/auth.ts`](../../../../support/auth.ts)
