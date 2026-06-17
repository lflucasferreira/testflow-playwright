# Classic Widgets — QA School Patterns

**Source file:** [`widgets.spec.ts`](../../../../tests/widgets/widgets.spec.ts)

---

## Purpose

This suite validates the **Classic Widgets page** — legacy QA-school UI patterns including checkboxes, file upload, modals, Select2, SweetAlert2, drag-and-drop, and cross-origin iframes. It covers:

- Pre-checked checkboxes and radio selection
- File upload with toast feedback
- Jobs table and detail modal
- Native select and enable/disable toggle
- Native alert handling and cadastro form
- Hover captions and keyboard shortcuts
- Select2 single/multi select and disable toggle
- SweetAlert2 dialog
- HTML5 drag-and-drop swap
- New tab popup via `context.waitForEvent('page')`
- YouTube iframe embeds

It demonstrates [`WidgetsPage`](../../../../pages/WidgetsPage.ts) and third-party widget interaction.

---

## Prerequisites

| Item | Detail |
|------|--------|
| **TestFlow** | Running at `http://localhost:5050` |
| **Dependencies** | `npm install` at the project root |
| **Credentials** | `DEMO_EMAIL` and `DEMO_PASSWORD` in environment variables |
| **Fixtures** | [`fixtures/sample-upload.txt`](../../../../fixtures/sample-upload.txt) |
| **Execution** | `npm run test:widgets` |

---

## Tags used

| Tag | Where it appears | Meaning |
|-----|------------------|---------|
| `@regression` | Top-level `test.describe` | Included in full regression grep |

---

## Playwright concepts

| Concept | Usage in this file |
|---------|-------------------|
| [`visitAuthenticated`](../../../../support/auth.ts) | API login + navigation to `/web/widgets.html` |
| **Page Object** | [`WidgetsPage`](../../../../pages/WidgetsPage.ts) |
| **`check({ force: true })`** | Checks hidden radio inputs |
| **`setInputFiles` / `uploadSampleFile()`** | File upload simulation |
| **`page.once('dialog')`** | Native alert acceptance |
| **`context.waitForEvent('page')`** | Captures new tab popup |
| **`dispatchEvent('dragenter')`** | Simulates drag hover state |
| **CSS locators** | `.select2-container`, `.swal2-popup` for vendor widgets |

---

## Step-by-step — block by block

### Block 1 — Setup

```typescript
import { test, expect } from '@playwright/test'
import { WidgetsPage } from '../../pages/WidgetsPage'
import { visitAuthenticated } from '../../support/auth'

test.describe('Classic Widgets — QA School patterns', { tag: '@regression' }, () => {
  test.beforeEach(async ({ page, request }) => {
    await visitAuthenticated(page, request, '/web/widgets.html')
    await new WidgetsPage(page).shouldShowPage()
  })
```

- **Given:** each test starts authenticated on the Widgets page.
- **When:** `visitAuthenticated` injects session and navigates.
- **Then:** `page-widgets` root is visible.

---

### Block 2 — Checkboxes, radios & file upload

```typescript
  test.describe('Checkboxes & radios', () => {
    test('shows pre-checked Ruby and PHP', async ({ page }) => {
      await expect(page.getByTestId('cb-ruby')).toBeChecked()
      await expect(page.getByTestId('cb-php')).toBeChecked()
      await expect(page.getByTestId('cb-java')).not.toBeChecked()
    })
  })

  test.describe('File upload', () => {
    test('enables upload after selecting a file', async ({ page }) => {
      const widgets = new WidgetsPage(page)
      await expect(widgets.uploadBtn()).toBeDisabled()
      await widgets.uploadSampleFile()
      await expect(page.getByTestId('file-label')).toContainText('sample-upload.txt')
      await expect(page.getByTestId('toast-message')).toContainText(/upload/i)
    })
  })
```

- **Given:** default checkbox states and a disabled upload button.
- **When:** a file is selected via Page Object helper.
- **Then:** label updates and upload toast appears.

---

### Block 3 — Jobs table & modal

```typescript
  test.describe('Jobs table & modal', () => {
    test('opens job detail modal for Amazon row', async ({ page }) => {
      const widgets = new WidgetsPage(page)
      await widgets.openJobDetails('job-detail-amazon')
      await expect(widgets.jobModalContent()).toContainText(/Amazon|QA/i)
      await widgets.jobModalClose().click()
      await expect(widgets.jobModalOverlay()).not.toBeVisible()
    })
  })
```

- **Given:** a jobs table with three company rows.
- **When:** a job detail link is clicked.
- **Then:** modal opens with company info and closes on ✕.

---

### Block 4 — Select2

```typescript
  test.describe('Select2', () => {
    test('selects OS via Select2 dropdown', async ({ page }) => {
      const widgets = new WidgetsPage(page)
      await widgets.selectOsOption('Linux')
      await expect(widgets.select2Os()).toHaveValue('LINUX')
    })

    test('multi-select accepts multiple OS values', async ({ page }) => {
      const widgets = new WidgetsPage(page)
      await page.locator('[data-testid="section-select2-multi"] .select2-container').click()
      await page.locator('.select2-results__option', { hasText: 'Linux' }).click()
      await page.locator('[data-testid="section-select2-multi"] .select2-container').click()
      await page.locator('.select2-results__option', { hasText: 'MacOS' }).click()
      await expect(page.locator('[data-testid="section-select2-multi"] .select2-selection__choice')).toHaveCount(2)
    })
  })
```

- **Given:** Select2-enhanced dropdowns.
- **When:** options are selected via the vendor UI.
- **Then:** underlying `<select>` values reflect LINUX/MACOS.

---

### Block 5 — SweetAlert2 & Drag-and-drop

```typescript
  test.describe('SweetAlert2', () => {
    test('shows success dialog after click', async ({ page }) => {
      const widgets = new WidgetsPage(page)
      await widgets.sweetAlertBtn().click()
      await expect(page.locator('.swal2-popup')).toBeVisible()
      await expect(page.locator('.swal2-title')).toContainText('Congratulations!')
      await page.locator('.swal2-confirm').click()
      await expect(page.locator('.swal2-popup')).toBeHidden()
    })
  })

  test.describe('Drag & drop swap', () => {
    test('swaps content between drag boxes (HTML5 drop with empty getData)', async ({ page }) => {
      const widgets = new WidgetsPage(page)
      await widgets.swapDragBoxesComplete()
      await expect(widgets.dragBox2()).toHaveText('Drag me')
      await expect(widgets.dragBox1().locator('img[alt="loader"]')).toBeVisible()
    })
  })
```

- **Given:** SweetAlert trigger and two draggable boxes.
- **When:** alert is confirmed or drag swap completes.
- **Then:** popup closes; box contents are exchanged.

---

### Block 6 — New tab & iframes

```typescript
  test.describe('New tab', () => {
    test('opens example.com in a new tab', async ({ page, context }) => {
      const widgets = new WidgetsPage(page)
      const popupPromise = context.waitForEvent('page')
      await widgets.openNewTabBtn().click()
      const popup = await popupPromise
      await expect(popup).toHaveURL(/example\.com/)
      await popup.close()
    })
  })

  test.describe('Cross-origin iframes', () => {
    test('YouTube embeds load with valid src and title', async ({ page }) => {
      const widgets = new WidgetsPage(page)
      await expect(widgets.iframeYoutubeEasy()).toHaveAttribute('src', /youtube\.com\/embed/)
      await expect(widgets.iframeYoutubeEasy()).toHaveAttribute('title', 'YouTube easy')
    })
  })
```

- **Given:** a link with `target="_blank"`.
- **When:** clicked, Playwright waits for the popup event.
- **Then:** new page URL matches example.com; YouTube iframes have valid embed URLs.

---

## How to run

```bash
npm run test:widgets
npx playwright test tests/widgets/widgets.spec.ts
```

---

## Related references

- Page Object: [`pages/WidgetsPage.ts`](../../../../pages/WidgetsPage.ts)
- Sample upload fixture: [`fixtures/sample-upload.txt`](../../../../fixtures/sample-upload.txt)
