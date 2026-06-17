# App Shell — Layout, Navigation & Notifications

**Source file:** [`shell.spec.ts`](../../../../tests/layout/shell.spec.ts)

---

## Purpose

This suite validates the **application shell** — persistent layout elements shared across authenticated pages. It covers:

- Sidebar, topbar, breadcrumb, and user name display
- Skip-to-content accessibility link
- Sidebar navigation to all main routes with active highlight
- Notification dropdown, badge count, and mark-all-read
- Theme toggle with `localStorage` persistence
- Responsive shell at mobile viewport

It demonstrates [`ShellPage`](../../../../pages/ShellPage.ts) and parameterized navigation tests.

---

## Prerequisites

| Item | Detail |
|------|--------|
| **TestFlow** | Running at `http://localhost:5050` |
| **Dependencies** | `npm install` at the project root |
| **Credentials** | `DEMO_EMAIL` and `DEMO_PASSWORD` in environment variables |
| **Execution** | `npm run test:layout` |

---

## Tags used

| Tag | Where it appears | Meaning |
|-----|------------------|---------|
| `@regression` | Top-level `test.describe` | Included in full regression grep |

---

## Playwright concepts

| Concept | Usage in this file |
|---------|-------------------|
| [`loginViaApi`](../../../../support/auth.ts) | Authenticates and lands on dashboard |
| **Page Object** | [`ShellPage`](../../../../pages/ShellPage.ts) — shell landmarks and nav helpers |
| **`ShellPage.navItems()`** | Static method returns nav link metadata for parameterized tests |
| **`expect.poll`** | Polls unread notification count until zero |
| **`toBeInViewport()`** | Verifies main content after skip link |
| **`page.setViewportSize`** | Mobile shell test via [`VIEWPORTS`](../../../../support/constants/viewports.ts) |

---

## Step-by-step — block by block

### Block 1 — Setup

```typescript
import { test, expect } from '@playwright/test'
import { ShellPage } from '../../pages/ShellPage'
import { loginViaApi } from '../../support/auth'
import { VIEWPORTS } from '../../support/constants/viewports'

test.describe('App shell — layout, navigation & notifications', { tag: '@regression' }, () => {
  test.beforeEach(async ({ page, request }) => {
    await loginViaApi(page, request)
    await new ShellPage(page).shouldShowAppShell()
  })
```

- **Given:** each test starts authenticated on the dashboard with the app shell visible.
- **When:** `loginViaApi` injects session and navigates.
- **Then:** sidebar and topbar are present.

---

### Block 2 — Layout landmarks

```typescript
  test.describe('Layout landmarks', () => {
    test('sidebar, topbar and breadcrumb are visible on dashboard', async ({ page }) => {
      const shell = new ShellPage(page)
      await shell.shouldShowAppShell()
      await expect(shell.breadcrumb()).toBeVisible()
      await expect(shell.userName()).toContainText('Demo User')
    })

    test('main content region is reachable after skip link', async ({ page }) => {
      const shell = new ShellPage(page)
      await shell.skipToMainContent()
      await expect(page).toHaveURL(/#main-content$/)
      await expect(page.locator('#main-content')).toBeInViewport()
    })
  })
```

- **Given:** the dashboard shell is rendered.
- **When:** skip-to-content is activated.
- **Then:** URL hash is `#main-content` and the main region is in viewport.

---

### Block 3 — Sidebar navigation (parameterized)

```typescript
  test.describe('Sidebar navigation', () => {
    for (const { testId, path, pageTestId } of ShellPage.navItems()) {
      test(`navigates to ${path} via ${testId}`, async ({ page }) => {
        const shell = new ShellPage(page)
        await shell.navigateViaSidebar(testId)
        await expect(page).toHaveURL(new RegExp(path.replace('.', '\\.')))
        await expect(page.getByTestId(pageTestId)).toBeVisible()
        await shell.shouldHighlightNav(testId)
      })
    }
  })
```

- **Given:** sidebar nav items defined in the Page Object.
- **When:** each link is clicked programmatically.
- **Then:** URL, page root, and active nav highlight all match.

---

### Block 4 — Notifications

```typescript
  test.describe('Notifications', () => {
    test('mark all read clears or reduces badge', async ({ page }) => {
      const shell = new ShellPage(page)
      await shell.openNotifications()
      const before = await shell.getUnreadCount()
      expect(before).toBeGreaterThan(0)

      await shell.markAllNotificationsRead()
      await expect.poll(() => shell.getUnreadCount()).toBe(0)
      await expect(shell.notifBadge()).toBeHidden()
    })
  })
```

- **Given:** unread notifications with a badge count.
- **When:** "Mark all read" is clicked.
- **Then:** unread count drops to 0 and badge hides.

---

### Block 5 — Theme toggle

```typescript
  test.describe('Theme toggle', () => {
    test('theme toggle switches data-theme and persists in localStorage', async ({ page }) => {
      const shell = new ShellPage(page)
      const before = await shell.getTheme()

      await shell.toggleTheme()
      const after = await shell.getTheme()
      expect(after).not.toBe(before)

      const stored = await page.evaluate(() => localStorage.getItem('sandbox-theme'))
      expect(stored).toBe(after)
    })
  })
```

- **Given:** a theme (light or dark) is active.
- **When:** the theme toggle is clicked.
- **Then:** `data-theme` changes and `sandbox-theme` is saved in `localStorage`.

---

### Block 6 — Responsive shell

```typescript
  test.describe('Responsive shell', () => {
    test('shell remains usable at mobile viewport', async ({ page }) => {
      await page.setViewportSize(VIEWPORTS.MOBILE)
      const shell = new ShellPage(page)
      await shell.shouldShowAppShell()
      await shell.navigateViaSidebar('nav-team')
      await expect(page.getByTestId('page-team')).toBeVisible()
    })
  })
```

- **Given:** mobile viewport (375×667).
- **When:** sidebar navigation to Team is attempted.
- **Then:** shell and target page remain functional.

---

## How to run

```bash
npm run test:layout
npx playwright test tests/layout/shell.spec.ts
```

---

## Related references

- Page Object: [`pages/ShellPage.ts`](../../../../pages/ShellPage.ts)
- Smoke navigation (sidebar subset): [`tests/smoke/navigation.spec.ts`](../../../../tests/smoke/navigation.spec.ts)
