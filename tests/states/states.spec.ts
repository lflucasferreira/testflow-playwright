import { test, expect } from '@playwright/test'
import { StatesPage } from '../../pages/StatesPage'
import { visitAuthenticated } from '../../support/auth'

test.describe('UI States — loading, empty, error & partial', () => {
  test.describe.configure({ timeout: 12_000 })

  test.beforeEach(async ({ page, request }) => {
    await visitAuthenticated(page, request, '/web/states.html')
    await expect(new StatesPage(page).pageRoot()).toBeVisible()
  })

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

  test.describe('Partial loading', () => {
    test('loads partial grid on trigger', async ({ page }) => {
      const states = new StatesPage(page)
      await states.loadPartialGrid()
      await states.shouldShowPartialGrid()
    })

    test('resets partial grid', async ({ page }) => {
      const states = new StatesPage(page)
      await states.loadPartialGrid()
      await states.resetPartialGrid()
      await expect(states.partialGrid()).not.toBeVisible()
    })
  })

  test.describe('Section visibility', () => {
    test('all UI state sections are present', async ({ page }) => {
      for (const id of ['section-skeleton', 'section-empty', 'section-error', 'section-partial']) {
        await expect(page.getByTestId(id)).toBeVisible()
      }
    })
  })
})
