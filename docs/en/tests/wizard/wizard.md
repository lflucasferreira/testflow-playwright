# Wizard — Multi-step Flow

**Source file:** [`wizard.spec.ts`](../../../../tests/wizard/wizard.spec.ts)

---

## Purpose

This suite validates the **Wizard page** — a three-step onboarding flow with validation, navigation, and review. It covers:

- Step 1 personal info validation and advancement
- Step 2 preferences (framework, role, terms checkbox)
- Step 3 review panel and success state
- Back navigation and data preservation
- Wizard restart after completion
- Progress indicator and accessibility attributes
- Keyboard navigation (Enter on Next)

It demonstrates [`WizardPage`](../../../../pages/WizardPage.ts), test factories, and `test.step` for readable reports.

---

## Prerequisites

| Item | Detail |
|------|--------|
| **TestFlow** | Running at `http://localhost:5050` |
| **Dependencies** | `npm install` at the project root |
| **Credentials** | `DEMO_EMAIL` and `DEMO_PASSWORD` in environment variables |
| **Fixtures** | [`wizard.json`](../../../../fixtures/wizard.json), factories in [`support/factories/wizard.ts`](../../../../support/factories/wizard.ts) |
| **Execution** | `npm run test:wizard` |

---

## Tags used

This spec has no explicit Playwright tags. It runs under the `wizard` project. Suite timeout is extended to 15 seconds via `test.describe.configure({ timeout: 15_000 })`.

---

## Playwright concepts

| Concept | Usage in this file |
|---------|-------------------|
| [`visitAuthenticated`](../../../../support/auth.ts) | API login + navigation to `/web/wizard.html` |
| **Page Object** | [`WizardPage`](../../../../pages/WizardPage.ts) |
| **Factories** | `createPersonalStep`, `createPreferencesStep` — override fixture defaults |
| **`test.step`** | Groups sub-actions in the full-flow test for HTML report readability |
| **`check({ force: true })`** | Checks hidden radio/checkbox inputs |
| **`test.describe.configure`** | Extends timeout for slow wizard transitions |

---

## Step-by-step — block by block

### Block 1 — Setup

```typescript
import { test, expect } from '@playwright/test'
import { WizardPage } from '../../pages/WizardPage'
import { visitAuthenticated } from '../../support/auth'
import { createPersonalStep, createPreferencesStep } from '../../support/factories/wizard'
import wizardFixture from '../../fixtures/wizard.json'

test.describe('Wizard — multi-step flow', () => {
  test.describe.configure({ timeout: 15_000 })

  test.beforeEach(async ({ page, request }) => {
    await visitAuthenticated(page, request, '/web/wizard.html')
    await expect(new WizardPage(page).pageRoot()).toBeVisible()
  })
```

- **Given:** each test starts authenticated on the Wizard page.
- **When:** `visitAuthenticated` injects session and navigates.
- **Then:** `page-wizard` root is visible with a 15s timeout budget.

---

### Block 2 — Step 1 — Personal info

```typescript
  test.describe('Step 1 — Personal info', () => {
    test('shows validation error when advancing with empty required fields', async ({ page }) => {
      const wizard = new WizardPage(page)
      await wizard.advance()
      await wizard.shouldShowStep1Error()
      await wizard.shouldShowStep1Active()
    })

    test('accepts valid personal data and advances to step 2', async ({ page }) => {
      const wizard = new WizardPage(page)
      await wizard.completeStep1(wizardFixture.personal)
      await wizard.advance()
      await expect(wizard.panel(2)).toBeVisible()
      await wizard.shouldMarkStepDone(1)
    })
  })
```

- **Given:** step 1 is active with empty fields.
- **When:** Next is clicked without filling required fields.
- **Then:** validation error appears and the user stays on step 1.

- **Given:** valid personal data from the fixture.
- **When:** fields are filled and Next is clicked.
- **Then:** step 2 panel appears and step 1 is marked done.

**Data preservation:**

```typescript
    test('preserves entered data when navigating back from step 2', async ({ page }) => {
      const wizard = new WizardPage(page)
      await wizard.completeStep1(wizardFixture.personal)
      await wizard.advance()
      await wizard.goBack()
      await expect(wizard.nameInput()).toHaveValue(wizardFixture.personal.name)
    })
```

---

### Block 3 — Step 2 — Preferences

```typescript
  test.describe('Step 2 — Preferences', () => {
    test.beforeEach(async ({ page }) => {
      const wizard = new WizardPage(page)
      await wizard.completeStep1(wizardFixture.personal)
      await wizard.advance()
    })

    test('shows validation error when terms are not accepted', async ({ page }) => {
      const wizard = new WizardPage(page)
      await wizard.frameworkRadio('playwright').check({ force: true })
      await wizard.roleRadio('qa').check({ force: true })
      await wizard.advance()
      await wizard.shouldShowStep2Error()
    })
  })
```

- **Given:** step 2 is active (via nested `beforeEach`).
- **When:** framework/role are selected but terms checkbox is unchecked.
- **Then:** validation error prevents advancement.

---

### Block 4 — Step 3 — Review & success

```typescript
  test.describe('Step 3 — Review & success', () => {
    test('completes full wizard and shows success with review data', async ({ page }) => {
      const personal = createPersonalStep({ name: 'Senior QA Engineer' })
      const preferences = createPreferencesStep(wizardFixture.preferences)

      await test.step('Fill all wizard steps', async () => {
        const wizard = new WizardPage(page)
        await wizard.completeFullFlow(personal, preferences)
      })

      const wizard = new WizardPage(page)
      await wizard.shouldShowSuccess()
      await wizard.shouldShowReviewName(personal.name)
    })
  })
```

- **Given:** factory-generated personal and preference data.
- **When:** the full wizard flow completes via Page Object helper.
- **Then:** success screen shows with the entered name in the review panel.

---

### Block 5 — Navigation & restart

```typescript
  test.describe('Navigation & restart', () => {
    test('restarts wizard after completion', async ({ page }) => {
      const wizard = new WizardPage(page)
      await wizard.completeFullFlow(createPersonalStep(), createPreferencesStep())
      await wizard.restartBtn().click()
      await wizard.shouldShowStep1Active()
      await expect(wizard.nameInput()).toHaveValue('')
    })
  })
```

- **Given:** a completed wizard.
- **When:** Restart is clicked.
- **Then:** step 1 is active with empty fields.

---

### Block 6 — Accessibility

```typescript
  test.describe('Accessibility', () => {
    test('wizard panels have role group and step nav is present', async ({ page }) => {
      await expect(page.getByTestId('wizard-nav')).toBeVisible()
      await expect(page.getByTestId('wizard-panel-1')).toHaveAttribute('role', 'group')
      await expect(page.getByTestId('wizard-step-1')).toHaveAttribute('aria-current', 'step')
    })
  })
```

- **Given:** the wizard is on step 1.
- **When:** ARIA attributes are inspected.
- **Then:** step nav, panel groups, and `aria-current="step"` are correct.

---

## How to run

```bash
npm run test:wizard
npx playwright test tests/wizard/wizard.spec.ts
```

---

## Related references

- Page Object: [`pages/WizardPage.ts`](../../../../pages/WizardPage.ts)
- Factories: [`support/factories/wizard.ts`](../../../../support/factories/wizard.ts)
- Fixture: [`fixtures/wizard.json`](../../../../fixtures/wizard.json)
