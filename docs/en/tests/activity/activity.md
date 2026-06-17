# Activity — Dynamic UI & API Interactions

**Source file:** [`activity.spec.ts`](../../../../tests/activity/activity.spec.ts)

---

## Purpose

This suite validates the **Activity page** — dynamic UI patterns including API fetch buttons, network stubbing, live counters, CI pipeline simulation, file upload, and fixture data. It covers:

- Fetch users via API with `waitForResponse`
- Slow API simulation with `page.route` delay
- Stubbed empty list and 500 error responses
- Live counter increment/decrement/reset
- CI pipeline progress polling with `expect.poll`
- Dynamic content loading
- File drop zone via `setInputFiles`
- Page navigation and fixture validation

It demonstrates [`ActivityPage`](../../../../pages/ActivityPage.ts) and advanced network interception.

---

## Prerequisites

| Item | Detail |
|------|--------|
| **TestFlow** | Running at `http://localhost:5050` |
| **Dependencies** | `npm install` at the project root |
| **Credentials** | `DEMO_EMAIL` and `DEMO_PASSWORD` in environment variables |
| **Fixtures** | [`fixtures/sample-upload.txt`](../../../../fixtures/sample-upload.txt), [`lookups/countries.json`](../../../../fixtures/lookups/countries.json) |
| **Execution** | `npm run test:activity` |

---

## Tags used

This spec has no explicit Playwright tags. Suite timeout is extended to 15 seconds via `test.describe.configure({ timeout: 15_000 })`.

---

## Playwright concepts

| Concept | Usage in this file |
|---------|-------------------|
| [`visitAuthenticated`](../../../../support/auth.ts) | API login + navigation to `/web/activity.html` |
| **Page Object** | [`ActivityPage`](../../../../pages/ActivityPage.ts) |
| **`page.route`** | Stubs, delays, and fulfills API responses |
| **`page.waitForResponse`** | Asserts GET `/api/users` status |
| **`expect.poll`** | Polls pipeline percentage until it increases |
| **`test.step`** | Labels sub-actions in fetch users test |
| **`setInputFiles`** | Simulates file upload in drop zone |
| **`readFixture`](../../../../support/helpers/fixtures.ts) | Loads JSON fixture for offline assertion |

---

## Step-by-step — block by block

### Block 1 — Setup

```typescript
import { test, expect } from '@playwright/test'
import { ActivityPage } from '../../pages/ActivityPage'
import { visitAuthenticated } from '../../support/auth'
import { readFixture } from '../../support/helpers/fixtures'

test.describe('Activity — dynamic UI & API interactions', () => {
  test.describe.configure({ timeout: 15_000 })

  test.beforeEach(async ({ page, request }) => {
    await visitAuthenticated(page, request, '/web/activity.html')
    await expect(new ActivityPage(page).pageRoot()).toBeVisible()
  })
```

- **Given:** each test starts authenticated on the Activity page.
- **When:** `visitAuthenticated` injects session and navigates.
- **Then:** `page-activity` root is visible.

---

### Block 2 — API interactions

```typescript
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
```

- **Given:** the Activity page with a "Fetch users" button.
- **When:** the button is clicked.
- **Then:** GET `/api/users` returns 200 and the result area is populated.

**Slow API stub:**

```typescript
    test('handles slow API with delayed response', async ({ page }) => {
      await page.route(/\/api\/users/, async (route) => {
        await new Promise((resolve) => setTimeout(resolve, 1200))
        await route.continue()
      })

      const activity = new ActivityPage(page)
      await activity.fetchSlowBtn().click()
      await activity.shouldShowApiResult()
    })
```

- **Given:** a route handler adds 1.2s delay to `/api/users`.
- **When:** the slow-fetch button is clicked.
- **Then:** the UI still shows a result after the delay.

**Empty list stub:**

```typescript
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
```

- **Given:** API is stubbed to return an empty users array.
- **When:** fetch is triggered.
- **Then:** result shows "Fetched 0 users".

---

### Block 3 — Live counter

```typescript
  test.describe('Live counter', () => {
    test('increments and decrements counter value', async ({ page }) => {
      const activity = new ActivityPage(page)
      await activity.incrementCounter(2)
      await activity.shouldShowCounter(2)
      await activity.counterDecrement().click()
      await activity.shouldShowCounter(1)
    })
  })
```

- **Given:** counter starts at 0.
- **When:** increment is clicked twice then decrement once.
- **Then:** counter displays 1 with a visible session badge.

---

### Block 4 — CI pipeline simulation

```typescript
  test.describe('CI pipeline simulation', () => {
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
```

- **Given:** pipeline is idle.
- **When:** Start is clicked.
- **Then:** badge changes from Idle and percentage increases over time via polling.

---

### Block 5 — File drop zone & fixtures

```typescript
  test.describe('File drop zone', () => {
    test('drop zone accepts file via setInputFiles', async ({ page }) => {
      const activity = new ActivityPage(page)
      const fileInput = page.locator('[data-testid="drop-zone"] input[type="file"]')
      if (await fileInput.count()) {
        await fileInput.setInputFiles('fixtures/sample-upload.txt')
      }
      await expect(activity.pageRoot()).toBeVisible()
    })
  })
```

- **Given:** a file input inside the drop zone.
- **When:** `setInputFiles` attaches a sample file.
- **Then:** the page remains stable (no crash).

```typescript
  test.describe('Fixture data', () => {
    test('countries lookup fixture exposes expected codes', async () => {
      const data = readFixture<{ countries: Array<{ code: string; name: string }> }>(
        'lookups/countries.json',
      )
      expect(data.countries.map((c) => c.code)).toEqual(expect.arrayContaining(['CA', 'US', 'BR']))
    })
  })
```

- **Given:** a JSON fixture on disk.
- **When:** `readFixture` loads it without browser.
- **Then:** expected country codes are present.

---

## How to run

```bash
npm run test:activity
npx playwright test tests/activity/activity.spec.ts
```

---

## Related references

- Page Object: [`pages/ActivityPage.ts`](../../../../pages/ActivityPage.ts)
- API rules suite (response mutation): [`tests/api/rules.api.spec.ts`](../../../../tests/api/rules.api.spec.ts)
