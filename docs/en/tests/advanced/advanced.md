# Advanced — iframe, Shadow DOM & External Links

**Source file:** [`advanced.spec.ts`](../../../../tests/advanced/advanced.spec.ts)

---

## Purpose

This suite validates the **Advanced page** — challenging DOM scenarios including Shadow DOM, iframes, responsive viewports, and external links. It covers:

- Shadow host attachment and content access
- Demo iframe loading and `frameLocator` navigation
- Mobile viewport rendering
- External link security attributes (`rel="noopener"`)
- Page navigation (Finish/Back buttons)
- Section visibility

It demonstrates [`AdvancedPage`](../../../../pages/AdvancedPage.ts) and Playwright's iframe/shadow DOM APIs.

---

## Prerequisites

| Item | Detail |
|------|--------|
| **TestFlow** | Running at `http://localhost:5050` |
| **Dependencies** | `npm install` at the project root |
| **Credentials** | `DEMO_EMAIL` and `DEMO_PASSWORD` in environment variables |
| **Execution** | `npm run test:advanced` |

---

## Tags used

| Tag | Where it appears | Meaning |
|-----|------------------|---------|
| `@regression` | Top-level `test.describe` | Included in full regression grep |

---

## Playwright concepts

| Concept | Usage in this file |
|---------|-------------------|
| [`visitAuthenticated`](../../../../support/auth.ts) | API login + navigation to `/web/advanced.html` |
| **Page Object** | [`AdvancedPage`](../../../../pages/AdvancedPage.ts) — shadow and iframe helpers |
| **`frameLocator()`** | Reaches iframe document body |
| **`page.setViewportSize`** | Tests mobile layout via [`VIEWPORTS`](../../../../support/constants/viewports.ts) |
| **`element.evaluate()`** | Checks `isConnected` on shadow host |

---

## Step-by-step — block by block

### Block 1 — Setup

```typescript
import { test, expect } from '@playwright/test'
import { AdvancedPage } from '../../pages/AdvancedPage'
import { visitAuthenticated } from '../../support/auth'
import { VIEWPORTS } from '../../support/constants/viewports'

test.describe('Advanced — iframe, shadow DOM & external links', { tag: '@regression' }, () => {
  test.beforeEach(async ({ page, request }) => {
    await visitAuthenticated(page, request, '/web/advanced.html')
    await expect(new AdvancedPage(page).pageRoot()).toBeVisible()
  })
```

- **Given:** each test starts authenticated on the Advanced page.
- **When:** `visitAuthenticated` injects session and navigates.
- **Then:** `page-advanced` root is visible.

---

### Block 2 — Shadow DOM

```typescript
  test.describe('Shadow DOM', () => {
    test('renders shadow DOM section and host element', async ({ page }) => {
      await new AdvancedPage(page).shouldShowShadowSection()
    })

    test('accesses content inside shadow root', async ({ page }) => {
      const advanced = new AdvancedPage(page)
      const count = await advanced.shadowContentCount()
      expect(count).toBeGreaterThanOrEqual(1)
    })

    test('shadow host is attached to the document', async ({ page }) => {
      const attached = await page.getByTestId('shadow-host').evaluate((el) => el.isConnected)
      expect(attached).toBe(true)
    })
  })
```

- **Given:** a custom element with an open shadow root.
- **When:** the Page Object pierces the shadow boundary.
- **Then:** shadow content is reachable and the host is connected to the DOM.

---

### Block 3 — Iframe

```typescript
  test.describe('Iframe', () => {
    test('loads demo iframe with a valid src', async ({ page }) => {
      await new AdvancedPage(page).shouldHaveIframeSrc()
    })

    test('iframe document body is reachable via frameLocator', async ({ page }) => {
      const advanced = new AdvancedPage(page)
      await expect(advanced.demoIframe()).toBeVisible()
      const frameBody = advanced.iframeFrame().locator('body')
      await expect(frameBody).toBeAttached({ timeout: 10_000 })
    })
  })
```

- **Given:** an embedded demo iframe with a title attribute.
- **When:** `frameLocator` targets the iframe.
- **Then:** the inner document body is attached and accessible.

---

### Block 4 — Responsive & External links

```typescript
  test.describe('Responsive', () => {
    test('shadow section renders at mobile viewport', async ({ page }) => {
      await page.setViewportSize(VIEWPORTS.MOBILE)
      await new AdvancedPage(page).shouldShowShadowSection()
      await page.setViewportSize(VIEWPORTS.DESKTOP)
    })
  })

  test.describe('External links', () => {
    test('external link has rel noopener for security', async ({ page }) => {
      const rel = await page.getByTestId('external-link').getAttribute('rel')
      expect(rel ?? '').toMatch(/noopener/)
    })
  })
```

- **Given:** viewport constants for mobile (375×667) and desktop (1280×800).
- **When:** viewport is resized to mobile.
- **Then:** shadow section remains visible; external links include `noopener`.

---

### Block 5 — Navigation & structure

```typescript
  test.describe('Navigation', () => {
    test('Finish button navigates away from advanced page', async ({ page }) => {
      await page.getByTestId('page-finish-btn').click()
      await expect(page).not.toHaveURL(/\/web\/advanced\.html/)
    })
  })

  test.describe('Page structure', () => {
    test('all advanced sections are visible', async ({ page }) => {
      for (const id of ['section-shadow', 'section-iframe', 'section-external']) {
        await expect(page.getByTestId(id)).toBeVisible()
      }
    })
  })
```

- **Given:** Finish and Back buttons on the page.
- **When:** Finish is clicked.
- **Then:** URL no longer contains `/web/advanced.html`.

---

## How to run

```bash
npm run test:advanced
npx playwright test tests/advanced/advanced.spec.ts
```

---

## Related references

- Page Object: [`pages/AdvancedPage.ts`](../../../../pages/AdvancedPage.ts)
- Viewport constants: [`support/constants/viewports.ts`](../../../../support/constants/viewports.ts)
