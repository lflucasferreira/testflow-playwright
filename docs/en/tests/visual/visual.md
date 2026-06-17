# Visual Regression — Stable UI Regions

**Source file:** [`visual.spec.ts`](../../../../tests/visual/visual.spec.ts)

---

## Purpose

This suite validates **visual regression** using Playwright's built-in screenshot comparison (`toHaveScreenshot`). It covers three stable UI regions:

1. **Login form** — unauthenticated card layout
2. **Sidebar navigation** — authenticated sidebar links
3. **Components buttons** — primary button variants section

Snapshots are stored alongside the spec in `-snapshots/` folders and compared with a 5% max diff pixel ratio.

---

## Prerequisites

| Item | Detail |
|------|--------|
| **TestFlow** | Running at `http://localhost:5050` |
| **Dependencies** | `npm install` at the project root |
| **Credentials** | `DEMO_EMAIL` and `DEMO_PASSWORD` for authenticated screenshots |
| **Baselines** | Snapshot PNGs in `tests/visual/visual.spec.ts-snapshots/` |
| **Execution** | `npm run test:visual` |

---

## Tags used

| Tag | Where it appears | Meaning |
|-----|------------------|---------|
| `@visual` | Top-level `test.describe` | Visual regression suite |
| `@regression` | Top-level `test.describe` | Included in full regression grep |

---

## Playwright concepts

| Concept | Usage in this file |
|---------|-------------------|
| [`toHaveScreenshot`](https://playwright.dev/docs/test-snapshots) | Compares element screenshot to baseline PNG |
| **`page.emulateMedia({ reducedMotion: 'reduce' })`** | Disables animations for stable captures |
| **`document.fonts.ready`** | Waits for web fonts before screenshot |
| **`loginViaApi`](../../../../support/auth.ts) | Authenticates for sidebar/components shots |
| **`SCREENSHOT_OPTS`** | Shared `{ animations: 'disabled', maxDiffPixelRatio: 0.05 }` |
| **`snapshotPathTemplate`** | Configured in [`playwright.config.ts`](../../../../playwright.config.ts) |

---

## Step-by-step — block by block

### Block 1 — Shared options and setup

```typescript
import { test, expect } from '@playwright/test'
import { loginViaApi } from '../../support/auth'

const SCREENSHOT_OPTS = {
  animations: 'disabled' as const,
  maxDiffPixelRatio: 0.05,
}

test.describe('Visual regression — stable UI regions', { tag: ['@visual', '@regression'] }, () => {
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
  })
```

- **Given:** each test disables motion for deterministic rendering.
- **When:** `beforeEach` runs before every screenshot test.
- **Then:** CSS animations and transitions are minimized.

---

### Block 2 — Login form baseline

```typescript
  test('login form matches baseline', async ({ page }) => {
    await page.goto('/web/login.html', { waitUntil: 'networkidle' })
    await expect(page.getByTestId('login-email')).toBeVisible()
    await page.evaluate(() => document.fonts.ready)

    await expect(page.getByTestId('login-card')).toHaveScreenshot('login-form.png', SCREENSHOT_OPTS)
  })
```

- **Given:** the login page is fully loaded with fonts ready.
- **When:** `toHaveScreenshot` captures `login-card`.
- **Then:** pixel diff against `login-form.png` baseline is ≤ 5%.

---

### Block 3 — Sidebar navigation baseline

```typescript
  test('sidebar navigation matches baseline when authenticated', async ({ page, request }) => {
    await loginViaApi(page, request)
    await expect(page.getByTestId('site-sidebar')).toBeVisible()
    await page.evaluate(() => document.fonts.ready)

    await expect(page.getByTestId('site-sidebar')).toHaveScreenshot('sidebar-nav.png', SCREENSHOT_OPTS)
  })
```

- **Given:** an authenticated session on the dashboard.
- **When:** the sidebar element is captured.
- **Then:** navigation links match the stored baseline.

---

### Block 4 — Components buttons baseline

```typescript
  test('components primary buttons match baseline', async ({ page, request }) => {
    await loginViaApi(page, request)
    await page.goto('/web/components.html', { waitUntil: 'networkidle' })
    await expect(page.getByTestId('page-components')).toBeVisible()
    await page.evaluate(() => document.fonts.ready)

    await expect(page.getByTestId('section-buttons')).toHaveScreenshot(
      'components-buttons.png',
      SCREENSHOT_OPTS,
    )
  })
```

- **Given:** the Components page buttons section is visible.
- **When:** `section-buttons` is captured.
- **Then:** button variants match the stored baseline.

---

## How to run

```bash
# Run visual regression
npm run test:visual

# Update baselines after intentional UI changes
npm run test:visual:update

# Single test
npx playwright test tests/visual/visual.spec.ts --project=visual
```

---

## Related references

- Playwright config snapshots: [`playwright.config.ts`](../../../../playwright.config.ts)
- Components suite (functional): [`tests/components/components.spec.ts`](../../../../tests/components/components.spec.ts)
