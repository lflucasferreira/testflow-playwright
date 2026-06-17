# Dashboard

**Source file:** [`dashboard.spec.ts`](../../../../tests/dashboard/dashboard.spec.ts)

---

## Purpose

This suite validates the **Dashboard page** — the primary landing screen after authentication. It covers:

- Time-based greeting and subtitle
- KPI cards with numeric values, percentages, and trend indicators
- Recent activity feed and "See all" navigation
- Suite health status bars
- "New test run" modal (open, close, confirm)
- Quick-access navigation links

It demonstrates the [`DashboardPage`](../../../../pages/DashboardPage.ts) Page Object and `loginViaApi` for fast authenticated setup.

---

## Prerequisites

| Item | Detail |
|------|--------|
| **TestFlow** | Running at `http://localhost:5050` |
| **Dependencies** | `npm install` at the project root |
| **Credentials** | `DEMO_EMAIL` and `DEMO_PASSWORD` in environment variables |
| **Execution** | `npm run test:dashboard` |

---

## Tags used

This spec has no explicit Playwright tags. It runs under the `dashboard` project.

---

## Playwright concepts

| Concept | Usage in this file |
|---------|-------------------|
| [`loginViaApi`](../../../../support/auth.ts) | Authenticates via API before each test |
| **Page Object** | [`DashboardPage`](../../../../pages/DashboardPage.ts) — KPI, modal, and activity helpers |
| **`page.keyboard.press('Escape')`** | Closes modal via keyboard |
| **`click({ force: true })`** | Clicks modal overlay to dismiss |
| **Parameterized tests** | `for...of` loop generates quick-access link tests |

---

## Step-by-step — block by block

### Block 1 — Setup

```typescript
import { test, expect } from '@playwright/test'
import { DashboardPage } from '../../pages/DashboardPage'
import { loginViaApi } from '../../support/auth'

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page, request }) => {
    await loginViaApi(page, request)
    await new DashboardPage(page).shouldBeLoaded()
  })
```

- **Given:** each test starts authenticated on the dashboard.
- **When:** `loginViaApi` injects session and navigates to `/web/dashboard.html`.
- **Then:** `page-dashboard` root is visible.

---

### Block 2 — Greeting & KPI cards

```typescript
  test.describe('Greeting', () => {
    test('shows time-based greeting with the user name', async ({ page }) => {
      const dashboard = new DashboardPage(page)
      await dashboard.shouldShowGreeting()
      await expect(dashboard.greeting()).toContainText('Demo User')
    })
  })

  test.describe('KPI cards', () => {
    test('renders all four KPI cards', async ({ page }) => {
      await new DashboardPage(page).shouldHaveAllKpiCards()
    })

    test('shows a numeric value in the runs card', async ({ page }) => {
      const text = await new DashboardPage(page).kpiValue('runs').innerText()
      expect(parseInt(text, 10)).toBeGreaterThan(0)
    })
  })
```

- **Given:** the dashboard is loaded with demo user data.
- **When:** greeting and KPI elements are inspected.
- **Then:** greeting contains "Demo User" and KPI cards show numeric/percentage values with trend indicators.

---

### Block 3 — Recent activity & Suite health

```typescript
  test.describe('Recent activity', () => {
    test('shows 5 activity items', async ({ page }) => {
      await new DashboardPage(page).shouldHaveActivityItems(5)
    })

    test('"See all" link navigates to activity page', async ({ page }) => {
      await new DashboardPage(page).quickAction('team')
      await page.getByTestId('activity-see-all').click()
      await expect(page).toHaveURL(/\/web\/activity\.html/)
    })
  })
```

- **Given:** the activity section is rendered.
- **When:** "See all" is clicked.
- **Then:** the browser navigates to the Activity page.

---

### Block 4 — "New test run" modal

```typescript
  test.describe('"New test run" modal', () => {
    test('opens modal on button click', async ({ page }) => {
      await new DashboardPage(page).openNewRunModal()
      await new DashboardPage(page).shouldShowRunModalOpen()
    })

    test('confirms a run and shows toast', async ({ page }) => {
      const dashboard = new DashboardPage(page)
      await dashboard.openNewRunModal()
      await dashboard.selectSuite('smoke')
      await dashboard.selectEnvironment('staging')
      await dashboard.confirmRun()
      await dashboard.shouldShowRunModalClosed()
      await expect(page.getByTestId('toast-message')).toContainText('smoke')
    })
  })
```

- **Given:** the dashboard is loaded.
- **When:** the user opens the modal, selects suite/environment, and confirms.
- **Then:** the modal closes and a toast confirms the run.

**Close behaviors tested:** Cancel button, Escape key, overlay click.

---

### Block 5 — Quick access navigation

```typescript
  test.describe('Quick access navigation', () => {
    const links = [
      { testId: 'qa-team', path: '/web/team.html' },
      { testId: 'qa-settings', path: '/web/settings.html' },
      { testId: 'qa-wizard', path: '/web/wizard.html' },
    ]

    for (const { testId, path } of links) {
      test(`"${testId}" navigates to ${path}`, async ({ page }) => {
        await page.getByTestId(testId).click()
        await expect(page).toHaveURL(new RegExp(path.replace('.', '\\.')))
        await page.goBack()
      })
    }
  })
```

- **Given:** quick-access cards are visible on the dashboard.
- **When:** each card is clicked.
- **Then:** the URL matches the expected page and the test navigates back.

---

## How to run

```bash
npm run test:dashboard
npx playwright test tests/dashboard/dashboard.spec.ts
```

---

## Related references

- Page Object: [`pages/DashboardPage.ts`](../../../../pages/DashboardPage.ts)
- Auth helpers: [`support/auth.ts`](../../../../support/auth.ts)
