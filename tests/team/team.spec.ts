import { test, expect } from '@playwright/test'
import { TeamPage } from '../../pages/TeamPage'
import { visitAuthenticated } from '../../support/auth'
import teamMember from '../../fixtures/team-member.json'

test.describe('Team', () => {
  test.beforeEach(async ({ page, request }) => {
    await visitAuthenticated(page, request, '/web/team.html')
    await expect(new TeamPage(page).pageRoot()).toBeVisible()
  })

  test.describe('Page structure', () => {
    test('shows the page header with member count', async ({ page }) => {
      await expect(new TeamPage(page).teamSummary()).toContainText('6 members')
    })

    test('renders all table columns', async ({ page }) => {
      await expect(page.getByTestId('users-table').locator('thead th')).toHaveCount(7)
    })

    test('renders the correct number of rows on page 1', async ({ page }) => {
      await new TeamPage(page).shouldHaveRowCount(4)
    })

    test('row count label matches visible rows', async ({ page }) => {
      await expect(new TeamPage(page).rowCount()).toContainText('6 row(s)')
    })
  })

  test.describe('Search', () => {
    test('filters rows by member name', async ({ page }) => {
      const team = new TeamPage(page)
      await team.search('Alice')
      await team.shouldHaveRowCount(1)
      await expect(team.nameCell(1)).toContainText('Alice QA')
    })

    test('filters rows by email', async ({ page }) => {
      const team = new TeamPage(page)
      await team.search('carol')
      await team.shouldHaveRowCount(1)
    })

    test('returns all rows when search is cleared', async ({ page }) => {
      const team = new TeamPage(page)
      await team.search('Alice')
      await team.shouldHaveRowCount(1)
      await team.clearSearch()
      await team.shouldHaveRowCount(4)
    })

    test('shows zero rows for a term with no match', async ({ page }) => {
      const team = new TeamPage(page)
      await team.search('zzznoresult')
      await expect(team.tableRows()).toHaveCount(0)
    })
  })

  test.describe('Role filter', () => {
    test('filters to Admin rows only', async ({ page }) => {
      const team = new TeamPage(page)
      await team.filterByRole('admin')
      const rows = team.tableRows()
      const count = await rows.count()
      for (let i = 0; i < count; i += 1) {
        await expect(rows.nth(i).locator('[data-role="admin"]')).toBeVisible()
      }
    })

    test('shows all rows when filter is reset', async ({ page }) => {
      const team = new TeamPage(page)
      await team.filterByRole('admin')
      await team.filterByRole('')
      await team.shouldHaveRowCount(4)
    })
  })

  test.describe('Status filter', () => {
    test('filters to active members only', async ({ page }) => {
      const team = new TeamPage(page)
      await team.filterByStatus('active')
      const rows = team.tableRows()
      const count = await rows.count()
      for (let i = 0; i < count; i += 1) {
        await expect(rows.nth(i).locator('[data-status="active"]')).toBeVisible()
      }
    })

    test('filters to inactive members only', async ({ page }) => {
      const team = new TeamPage(page)
      await team.filterByStatus('inactive')
      const rows = team.tableRows()
      const count = await rows.count()
      for (let i = 0; i < count; i += 1) {
        await expect(rows.nth(i).locator('[data-status="inactive"]')).toBeVisible()
      }
    })
  })

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

    test('second click sorts rows by name ascending', async ({ page }) => {
      const team = new TeamPage(page)
      await team.sortByName()
      await team.sortByName()
      const names = await team.tableRows().evaluateAll((rows) =>
        rows.map((row) =>
          (row.querySelector('[data-testid^="cell-name-"]')?.textContent ?? '').trim(),
        ),
      )
      expect(names).toEqual([...names].sort((a, b) => a.localeCompare(b)))
    })
  })

  test.describe('Pagination', () => {
    test('"Prev" button is disabled on page 1', async ({ page }) => {
      await expect(new TeamPage(page).prevPage()).toBeDisabled()
    })

    test('navigates to page 2 showing remaining rows', async ({ page }) => {
      const team = new TeamPage(page)
      await team.goToNextPage()
      await expect(team.pageInfo()).toContainText('Page 2')
      await team.shouldHaveRowCount(2)
    })

    test('"Next" button is disabled on last page', async ({ page }) => {
      const team = new TeamPage(page)
      await team.goToNextPage()
      await expect(team.nextPage()).toBeDisabled()
    })

    test('navigating back to page 1 restores row count', async ({ page }) => {
      const team = new TeamPage(page)
      await team.goToNextPage()
      await team.goToPrevPage()
      await team.shouldHaveRowCount(4)
    })
  })

  test.describe('Invite member modal', () => {
    test('opens modal on "Invite member" click', async ({ page }) => {
      await new TeamPage(page).openInviteModal()
      await new TeamPage(page).shouldHaveInviteModalOpen()
    })

    test('closes modal on Cancel', async ({ page }) => {
      const team = new TeamPage(page)
      await team.openInviteModal()
      await team.cancelInvite()
      await team.shouldHaveInviteModalClosed()
    })

    test('closes modal on Escape key', async ({ page }) => {
      const team = new TeamPage(page)
      await team.openInviteModal()
      await page.keyboard.press('Escape')
      await team.shouldHaveInviteModalClosed()
    })

    test('shows validation error when name is empty', async ({ page }) => {
      const team = new TeamPage(page)
      await team.openInviteModal()
      await team.fillInviteForm({ email: teamMember.new.email })
      await team.submitInvite()
      await team.shouldShowInviteError('required')
    })

    test('shows validation error for invalid email', async ({ page }) => {
      const team = new TeamPage(page)
      await team.openInviteModal()
      await team.fillInviteForm({ name: teamMember.new.name, email: 'notanemail' })
      await team.submitInvite()
      await team.shouldShowInviteError('valid email')
    })

    test('adds a new row after successful invite', async ({ page }) => {
      const team = new TeamPage(page)
      await team.openInviteModal()
      await team.fillInviteForm(teamMember.new)
      await team.submitInvite()
      await team.shouldHaveInviteModalClosed()
      await expect(page.getByTestId('toast-message')).toContainText(teamMember.new.email)
      const label = await team.rowCount().innerText()
      expect(parseInt(label, 10)).toBeGreaterThan(6)
    })

    test('invite request contains name and email in the payload', async ({ page }) => {
      const team = new TeamPage(page)
      const inviteRequest = page.waitForRequest(
        (req) => req.method() === 'POST' && req.url().includes('/api/'),
        { timeout: 2000 },
      ).catch(() => null)

      await team.openInviteModal()
      await team.fillInviteForm(teamMember.new)
      await team.submitInvite()
      await team.shouldHaveInviteModalClosed()
      await expect(page.getByTestId('toast-message')).toContainText(teamMember.new.email)

      const request = await inviteRequest
      if (request) {
        const body = request.postDataJSON()
        expect(body).toMatchObject({ name: expect.any(String), email: expect.any(String) })
        expect(body.email).toBe(teamMember.new.email)
      }
    })
  })

  test.describe('Inline editing', () => {
    test('shows name and role inputs when Edit is clicked', async ({ page }) => {
      const team = new TeamPage(page)
      await team.startEdit(1)
      await team.shouldShowEditInputs(1)
    })

    test('updates the row after saving a new name', async ({ page }) => {
      const team = new TeamPage(page)
      await team.startEdit(1)
      await team.editName(1, 'Alice QA Updated')
      await team.saveEdit(1)
      await expect(team.nameCell(1)).toContainText('Alice QA Updated')
    })

    test('shows a success toast after saving', async ({ page }) => {
      const team = new TeamPage(page)
      await team.startEdit(2)
      await team.saveEdit(2)
      await expect(page.getByTestId('toast-message')).toContainText('updated')
    })

    test('edit save updates the row and triggers a write request if API-driven', async ({ page }) => {
      const team = new TeamPage(page)
      const putRequest = page.waitForRequest(
        (req) => req.method() === 'PUT' && req.url().includes('/api/'),
        { timeout: 3000 },
      ).catch(() => null)
      const patchRequest = page.waitForRequest(
        (req) => req.method() === 'PATCH' && req.url().includes('/api/'),
        { timeout: 3000 },
      ).catch(() => null)

      await team.startEdit(1)
      await team.editName(1, 'Alice QA Intercepted')
      await team.saveEdit(1)
      await expect(team.nameCell(1)).toContainText('Alice QA Intercepted')

      const interception = await Promise.race([putRequest, patchRequest])
      if (interception) {
        const body = interception.postDataJSON()
        expect(body).toHaveProperty('name')
      }
    })

    test('discards changes on Cancel', async ({ page }) => {
      const team = new TeamPage(page)
      await team.startEdit(1)
      await team.editName(1, 'Should Not Save')
      await team.cancelEdit(1)
      await expect(team.nameCell(1)).not.toContainText('Should Not Save')
    })

    test('restores normal row after Cancel', async ({ page }) => {
      const team = new TeamPage(page)
      await team.startEdit(1)
      await team.cancelEdit(1)
      await expect(team.editBtn(1)).toBeVisible()
    })
  })

  test.describe('Framework list filter', () => {
    test('filters the framework list', async ({ page }) => {
      const team = new TeamPage(page)
      await team.frameworkSearch().fill('play')
      const items = team.frameworkList().locator('li')
      const count = await items.count()
      for (let i = 0; i < count; i += 1) {
        const text = await items.nth(i).innerText()
        expect(text.toLowerCase()).toContain('play')
      }
    })

    test('shows all frameworks when filter is cleared', async ({ page }) => {
      const team = new TeamPage(page)
      await team.frameworkSearch().fill('cypress')
      await team.frameworkSearch().clear()
      expect(await team.frameworkList().locator('li').count()).toBeGreaterThan(1)
    })
  })
})
