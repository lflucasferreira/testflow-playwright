# Team

**Source file:** [`team.spec.ts`](../../../../tests/team/team.spec.ts)

---

## Purpose

This suite validates the **Team page** — a data-rich table with search, filters, sorting, pagination, inline editing, and an invite-member modal. It covers:

- Table structure and row counts
- Search by name and email
- Role and status filters
- Column sorting (ascending/descending)
- Pagination controls
- Invite member modal with validation
- Inline row editing with optional API interception
- Framework list filter

It demonstrates [`TeamPage`](../../../../pages/TeamPage.ts) and network spying with `page.waitForRequest`.

---

## Prerequisites

| Item | Detail |
|------|--------|
| **TestFlow** | Running at `http://localhost:5050` |
| **Dependencies** | `npm install` at the project root |
| **Credentials** | `DEMO_EMAIL` and `DEMO_PASSWORD` in environment variables |
| **Fixture** | [`team-member.json`](../../../../fixtures/team-member.json) for invite form data |
| **Execution** | `npm run test:team` |

---

## Tags used

This spec has no explicit Playwright tags. It runs under the `team` project.

---

## Playwright concepts

| Concept | Usage in this file |
|---------|-------------------|
| [`visitAuthenticated`](../../../../support/auth.ts) | API login + direct navigation to `/web/team.html` |
| **Page Object** | [`TeamPage`](../../../../pages/TeamPage.ts) — table, search, modal, edit helpers |
| **`page.waitForRequest`** | Captures POST/PUT/PATCH on invite and edit save |
| **`locator.evaluateAll`** | Reads cell text for sort order assertions |
| **`postDataJSON()`** | Inspects request payload from intercepted calls |

---

## Step-by-step — block by block

### Block 1 — Setup

```typescript
import { test, expect } from '@playwright/test'
import { TeamPage } from '../../pages/TeamPage'
import { visitAuthenticated } from '../../support/auth'
import teamMember from '../../fixtures/team-member.json'

test.describe('Team', () => {
  test.beforeEach(async ({ page, request }) => {
    await visitAuthenticated(page, request, '/web/team.html')
    await expect(new TeamPage(page).pageRoot()).toBeVisible()
  })
```

- **Given:** each test starts authenticated on the Team page.
- **When:** `visitAuthenticated` injects session and navigates.
- **Then:** `page-team` root is visible.

---

### Block 2 — Page structure

```typescript
  test.describe('Page structure', () => {
    test('shows the page header with member count', async ({ page }) => {
      await expect(new TeamPage(page).teamSummary()).toContainText('6 members')
    })

    test('renders the correct number of rows on page 1', async ({ page }) => {
      await new TeamPage(page).shouldHaveRowCount(4)
    })
  })
```

- **Given:** the team table is loaded with demo data.
- **When:** header and row counts are inspected.
- **Then:** 6 total members, 4 visible on page 1.

---

### Block 3 — Search & filters

```typescript
  test.describe('Search', () => {
    test('filters rows by member name', async ({ page }) => {
      const team = new TeamPage(page)
      await team.search('Alice')
      await team.shouldHaveRowCount(1)
      await expect(team.nameCell(1)).toContainText('Alice QA')
    })

    test('returns all rows when search is cleared', async ({ page }) => {
      const team = new TeamPage(page)
      await team.search('Alice')
      await team.shouldHaveRowCount(1)
      await team.clearSearch()
      await team.shouldHaveRowCount(4)
    })
  })
```

- **Given:** the full team table is displayed.
- **When:** the user types in the search box.
- **Then:** rows filter in real time; clearing restores all rows.

**Role and status filters** use `filterByRole()` and `filterByStatus()` and verify each visible row matches the selected attribute.

---

### Block 4 — Sorting & Pagination

```typescript
  test.describe('Sorting', () => {
    test('sorts rows by name descending on first click', async ({ page }) => {
      const team = new TeamPage(page)
      await team.sortByName()
      const names = await team.tableRows().evaluateAll((rows) =>
        rows.map((row) =>
          (row.querySelector('[data-testid^="cell-name-"]')?.textContent ?? '').trim(),
        ),
      )
      expect(names).toEqual([...names].sort((a, b) => b.localeCompare(a)))
    })
  })
```

- **Given:** default sort order.
- **When:** the name column header is clicked.
- **Then:** rows reorder descending; second click sorts ascending.

```typescript
  test.describe('Pagination', () => {
    test('navigates to page 2 showing remaining rows', async ({ page }) => {
      const team = new TeamPage(page)
      await team.goToNextPage()
      await expect(team.pageInfo()).toContainText('Page 2')
      await team.shouldHaveRowCount(2)
    })
  })
```

- **Given:** page 1 with 4 rows and "Next" enabled.
- **When:** Next is clicked.
- **Then:** page 2 shows the remaining 2 rows.

---

### Block 5 — Invite member modal

```typescript
  test.describe('Invite member modal', () => {
    test('shows validation error when name is empty', async ({ page }) => {
      const team = new TeamPage(page)
      await team.openInviteModal()
      await team.fillInviteForm({ email: teamMember.new.email })
      await team.submitInvite()
      await team.shouldShowInviteError('required')
    })

    test('adds a new row after successful invite', async ({ page }) => {
      const team = new TeamPage(page)
      await team.openInviteModal()
      await team.fillInviteForm(teamMember.new)
      await team.submitInvite()
      await team.shouldHaveInviteModalClosed()
      await expect(page.getByTestId('toast-message')).toContainText(teamMember.new.email)
    })
  })
```

- **Given:** the invite modal is open.
- **When:** the user submits with invalid or valid data.
- **Then:** validation errors appear or a new member is added with a success toast.

---

### Block 6 — Inline editing

```typescript
  test.describe('Inline editing', () => {
    test('updates the row after saving a new name', async ({ page }) => {
      const team = new TeamPage(page)
      await team.startEdit(1)
      await team.editName(1, 'Alice QA Updated')
      await team.saveEdit(1)
      await expect(team.nameCell(1)).toContainText('Alice QA Updated')
    })

    test('discards changes on Cancel', async ({ page }) => {
      const team = new TeamPage(page)
      await team.startEdit(1)
      await team.editName(1, 'Should Not Save')
      await team.cancelEdit(1)
      await expect(team.nameCell(1)).not.toContainText('Should Not Save')
    })
  })
```

- **Given:** a row in view mode.
- **When:** Edit is clicked, name is changed, and Save or Cancel is pressed.
- **Then:** the row reflects the saved name or reverts on cancel.

---

## How to run

```bash
npm run test:team
npx playwright test tests/team/team.spec.ts
```

---

## Related references

- Page Object: [`pages/TeamPage.ts`](../../../../pages/TeamPage.ts)
- Fixture: [`fixtures/team-member.json`](../../../../fixtures/team-member.json)
- Auth helpers: [`support/auth.ts`](../../../../support/auth.ts)
