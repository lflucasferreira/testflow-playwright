# Components

**Source file:** [`components.spec.ts`](../../../../tests/components/components.spec.ts)

---

## Purpose

This suite validates the **Components showcase page** — reusable UI patterns including buttons, modals, tabs, and accordions. It covers:

- Button variants, disabled state, loading spinner, and toast
- Native alert/confirm dialog handling
- Modal open/close behaviors and ARIA attributes
- Tab navigation with `aria-selected` and panel visibility
- Accordion expand/collapse with `aria-expanded`

It demonstrates [`ComponentsPage`](../../../../pages/ComponentsPage.ts) and Playwright dialog handling.

---

## Prerequisites

| Item | Detail |
|------|--------|
| **TestFlow** | Running at `http://localhost:5050` |
| **Dependencies** | `npm install` at the project root |
| **Credentials** | `DEMO_EMAIL` and `DEMO_PASSWORD` in environment variables |
| **Execution** | `npm run test:components` |

---

## Tags used

| Tag | Where it appears | Meaning |
|-----|------------------|---------|
| `@regression` | Top-level `test.describe` | Included in full regression grep |

---

## Playwright concepts

| Concept | Usage in this file |
|---------|-------------------|
| [`visitAuthenticated`](../../../../support/auth.ts) | API login + navigation to `/web/components.html` |
| **Page Object** | [`ComponentsPage`](../../../../pages/ComponentsPage.ts) |
| **`page.once('dialog')`** | Handles native `alert()` and `confirm()` |
| **`toHaveAttribute('role', 'dialog')`** | Accessibility checks on modal |
| **`page.keyboard.press('Escape')`** | Closes modal via keyboard |

---

## Step-by-step — block by block

### Block 1 — Setup

```typescript
import { test, expect } from '@playwright/test'
import { ComponentsPage } from '../../pages/ComponentsPage'
import { visitAuthenticated } from '../../support/auth'

test.describe('Components', { tag: '@regression' }, () => {
  test.beforeEach(async ({ page, request }) => {
    await visitAuthenticated(page, request, '/web/components.html')
    await new ComponentsPage(page).shouldShowPage()
  })
```

- **Given:** each test starts authenticated on the Components page.
- **When:** `visitAuthenticated` injects session and navigates.
- **Then:** `page-components` root is visible.

---

### Block 2 — Buttons

```typescript
  test.describe('Buttons', () => {
    test('all button variants are visible', async ({ page }) => {
      const components = new ComponentsPage(page)
      for (const id of ['btn-primary', 'btn-secondary', 'btn-success', 'btn-danger']) {
        const btn = components.button(id)
        await expect(btn).toBeVisible()
        await expect(btn).toBeEnabled()
      }
    })

    test('loading button shows spinner during simulated load', async ({ page }) => {
      await new ComponentsPage(page).button('btn-loading').click()
      await expect(page.getByTestId('btn-loading')).toBeDisabled()
      await expect(page.locator('.spinner')).toBeVisible()
      await expect(page.getByTestId('btn-loading')).toBeEnabled({ timeout: 5000 })
    })
  })
```

- **Given:** the buttons section is rendered.
- **When:** variants are inspected or the loading button is clicked.
- **Then:** all variants are enabled; loading button shows spinner then re-enables.

**Native dialogs:**

```typescript
    test('native confirm returns true on accept', async ({ page }) => {
      page.once('dialog', (dialog) => dialog.accept())
      await new ComponentsPage(page).button('btn-confirm').click()
      await expect(new ComponentsPage(page).dialogResult()).toContainText('Confirmed')
    })
```

- **Given:** a confirm button triggers `window.confirm`.
- **When:** Playwright accepts the dialog.
- **Then:** the result area shows "Confirmed".

---

### Block 3 — Modal

```typescript
  test.describe('Modal', () => {
    test.beforeEach(async ({ page }) => {
      await new ComponentsPage(page).openModal()
    })

    test('has accessible role dialog', async ({ page }) => {
      const modal = new ComponentsPage(page).modalOverlay()
      await expect(modal).toHaveAttribute('role', 'dialog')
      await expect(modal).toHaveAttribute('aria-modal', 'true')
    })

    test('closes on Escape key', async ({ page }) => {
      await page.keyboard.press('Escape')
      await expect(new ComponentsPage(page).modalOverlay()).not.toBeVisible()
    })
  })
```

- **Given:** the modal is open (via `beforeEach`).
- **When:** accessibility attributes or close actions are tested.
- **Then:** modal has correct ARIA roles; closes via Confirm, Cancel, ✕, Escape, or overlay click.

---

### Block 4 — Tabs

```typescript
  test.describe('Tabs', () => {
    test('Overview tab is active by default', async ({ page }) => {
      const components = new ComponentsPage(page)
      await expect(components.tabOverview()).toHaveAttribute('aria-selected', 'true')
      await expect(components.tabPanelOverview()).toBeVisible()
    })

    test('clicking Playwright tab activates it and shows its panel', async ({ page }) => {
      const components = new ComponentsPage(page)
      await components.tabPlaywright().click()
      await expect(components.tabPlaywright()).toHaveAttribute('aria-selected', 'true')
      await expect(components.tabPanelPlaywright()).toBeVisible()
    })
  })
```

- **Given:** three tabs with associated panels.
- **When:** a tab is clicked.
- **Then:** only that tab is `aria-selected="true"` and its panel is visible.

---

### Block 5 — Accordion

```typescript
  test.describe('Accordion', () => {
    test('all panels are collapsed by default', async ({ page }) => {
      const components = new ComponentsPage(page)
      for (const n of [1, 2, 3]) {
        await expect(components.accordionTrigger(n)).toHaveAttribute('aria-expanded', 'false')
        await expect(components.accordionPanel(n)).not.toBeVisible()
      }
    })

    test('multiple panels can be open simultaneously', async ({ page }) => {
      const components = new ComponentsPage(page)
      await components.accordionTrigger(1).click()
      await components.accordionTrigger(2).click()
      await expect(components.accordionPanel(1)).toBeVisible()
      await expect(components.accordionPanel(2)).toBeVisible()
    })
  })
```

- **Given:** three accordion panels, all collapsed.
- **When:** triggers are clicked.
- **Then:** panels expand independently (not exclusive).

---

## How to run

```bash
npm run test:components
npx playwright test tests/components/components.spec.ts
npm run test:grep:regression -- tests/components/components.spec.ts
```

---

## Related references

- Page Object: [`pages/ComponentsPage.ts`](../../../../pages/ComponentsPage.ts)
- A11y suite (modal scan): [`tests/a11y/a11y.spec.ts`](../../../../tests/a11y/a11y.spec.ts)
