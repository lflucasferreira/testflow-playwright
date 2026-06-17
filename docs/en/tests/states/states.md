# UI States — Loading, Empty, Error & Partial

**Source file:** [`states.spec.ts`](../../../../tests/states/states.spec.ts)

---

## Purpose

This suite validates the **UI States page** — async UI patterns including skeleton loading, empty states, error/success transitions, and partial grid loading. It covers:

- Skeleton card loading and reset
- Empty state when search has no matches
- Error trigger and success recovery
- Partial grid load and reset
- Section visibility

It demonstrates [`StatesPage`](../../../../pages/StatesPage.ts) for state-driven UI assertions.

---

## Prerequisites

| Item | Detail |
|------|--------|
| **TestFlow** | Running at `http://localhost:5050` |
| **Dependencies** | `npm install` at the project root |
| **Credentials** | `DEMO_EMAIL` and `DEMO_PASSWORD` in environment variables |
| **Execution** | `npm run test:states` |

---

## Tags used

This spec has no explicit Playwright tags. Suite timeout is extended to 12 seconds via `test.describe.configure({ timeout: 12_000 })`.

---

## Playwright concepts

| Concept | Usage in this file |
|---------|-------------------|
| [`visitAuthenticated`](../../../../support/auth.ts) | API login + navigation to `/web/states.html` |
| **Page Object** | [`StatesPage`](../../../../pages/StatesPage.ts) — trigger and assert helpers |
| **`not.toBeVisible()`** | Confirms empty/hidden states |
| **`not.toContainText(/500|fail/i)`** | Verifies error message is replaced after success |

---

## Step-by-step — block by block

### Block 1 — Setup

```typescript
import { test, expect } from '@playwright/test'
import { StatesPage } from '../../pages/StatesPage'
import { visitAuthenticated } from '../../support/auth'

test.describe('UI States — loading, empty, error & partial', () => {
  test.describe.configure({ timeout: 12_000 })

  test.beforeEach(async ({ page, request }) => {
    await visitAuthenticated(page, request, '/web/states.html')
    await expect(new StatesPage(page).pageRoot()).toBeVisible()
  })
```

- **Given:** each test starts authenticated on the UI States page.
- **When:** `visitAuthenticated` injects session and navigates.
- **Then:** `page-states` root is visible.

---

### Block 2 — Skeleton loading

```typescript
  test.describe('Skeleton loading', () => {
    test('shows skeleton cards on trigger', async ({ page }) => {
      const states = new StatesPage(page)
      await states.loadSkeletonCards()
      await states.shouldShowSkeletonLoading()
    })

    test('resets skeleton to idle state', async ({ page }) => {
      const states = new StatesPage(page)
      await states.loadSkeletonCards()
      await states.resetSkeleton()
      await expect(states.skeletonIdle()).toBeVisible()
    })
  })
```

- **Given:** skeleton section in idle state.
- **When:** Load is triggered.
- **Then:** skeleton placeholders appear; Reset returns to idle.

---

### Block 3 — Empty state

```typescript
  test.describe('Empty state', () => {
    test('shows empty state when search has no matches', async ({ page }) => {
      const states = new StatesPage(page)
      await states.searchEmpty('xyz')
      await states.shouldShowEmptyState()
    })

    test('clears empty state when search is reset', async ({ page }) => {
      const states = new StatesPage(page)
      await states.searchEmpty('xyz')
      await states.shouldShowEmptyState()
      await states.emptySearch().clear()
      await expect(states.emptyState()).not.toBeVisible()
    })
  })
```

- **Given:** a searchable list with demo items.
- **When:** a term with no matches is entered.
- **Then:** empty state illustration/message appears; clearing search hides it.

---

### Block 4 — Error & success async

```typescript
  test.describe('Error & success async', () => {
    test('error trigger shows error container with message', async ({ page }) => {
      const states = new StatesPage(page)
      await states.triggerErrorFetch()
      await states.shouldShowErrorState()
    })

    test('success trigger replaces error with success content', async ({ page }) => {
      const states = new StatesPage(page)
      await states.triggerErrorFetch()
      await states.triggerSuccessFetch()
      await expect(states.errorContainer()).not.toBeEmpty()
      await expect(states.errorContainer()).not.toContainText(/500|fail/i)
    })
  })
```

- **Given:** async fetch triggers for error and success.
- **When:** error is triggered then success.
- **Then:** container shows success content without error keywords.

---

### Block 5 — Partial loading & sections

```typescript
  test.describe('Partial loading', () => {
    test('loads partial grid on trigger', async ({ page }) => {
      const states = new StatesPage(page)
      await states.loadPartialGrid()
      await states.shouldShowPartialGrid()
    })
  })

  test.describe('Section visibility', () => {
    test('all UI state sections are present', async ({ page }) => {
      for (const id of ['section-skeleton', 'section-empty', 'section-error', 'section-partial']) {
        await expect(page.getByTestId(id)).toBeVisible()
      }
    })
  })
```

- **Given:** partial grid section in initial hidden state.
- **When:** Load partial is triggered.
- **Then:** grid cells appear; all four state sections are visible on page load.

---

## How to run

```bash
npm run test:states
npx playwright test tests/states/states.spec.ts
```

---

## Related references

- Page Object: [`pages/StatesPage.ts`](../../../../pages/StatesPage.ts)
- A11y suite includes UI States scan: [`tests/a11y/a11y.spec.ts`](../../../../tests/a11y/a11y.spec.ts)
