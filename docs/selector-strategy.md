# Selector Strategy — TestFlow E2E

This Playwright project interacts with the TestFlow sandbox app exclusively through **`data-testid`** attributes. There are **no component tests** in this repository — all specs are E2E or API.

## E2E (TestFlow app)

TestFlow renders UI with `data-testid`. Use Playwright's built-in locator:

```ts
page.getByTestId('login-email')
// equivalent: page.locator('[data-testid="login-email"]')
```

Page Objects and E2E specs should prefer `getByTestId` when interacting with the real application.

## Page Objects

Page Object classes in [`pages/`](../pages/) expose locators as methods that wrap `page.getByTestId(...)`:

```ts
// pages/LoginPage.ts
emailInput() {
  return this.page.getByTestId('login-email')
}
```

This keeps selectors centralized and readable in spec files.

## When to use other locators

| Context | Preferred locator | Notes |
|---------|-------------------|-------|
| TestFlow UI elements | `page.getByTestId(...)` | Primary strategy — stable, app-defined |
| ARIA roles (modals, tabs) | `page.getByRole(...)` | Complements test IDs for accessibility checks |
| CSS classes (internal state) | `page.locator('.class')` | Only when no test ID exists (e.g. `.spinner`, `.tab-panel.active`) |
| Shadow DOM / iframes | `page.getByTestId(...)` + `frameLocator()` | See [`advanced.spec.ts`](../tests/advanced/advanced.spec.ts) |
| Third-party widgets (Select2, SweetAlert2) | CSS selectors on vendor DOM | `.select2-container`, `.swal2-popup` — last resort |

## What this repo does not use

- **`data-cy-hook`** — Cypress component-test convention; not used here.
- **Component test mount helpers** — no isolated component specs; all tests run against the full app at `http://localhost:5050`.

## Hook / test ID maps

Page Objects in [`pages/`](../pages/) are the single source of truth for element locators. When the app adds a new interactive element, add a method to the relevant Page Object rather than inlining selectors in specs.
