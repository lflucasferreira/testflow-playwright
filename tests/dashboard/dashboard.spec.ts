import { test, expect } from '@playwright/test'
import { DashboardPage } from '../../pages/DashboardPage'
import { loginViaApi } from '../../support/auth'

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page, request }) => {
    await loginViaApi(page, request)
    await new DashboardPage(page).shouldBeLoaded()
  })

  test.describe('Greeting', () => {
    test('shows time-based greeting with the user name', async ({ page }) => {
      const dashboard = new DashboardPage(page)
      await dashboard.shouldShowGreeting()
      await expect(dashboard.greeting()).toContainText('Demo User')
    })

    test('shows a non-empty subtitle', async ({ page }) => {
      const subtitle = new DashboardPage(page).subtitle()
      await expect(subtitle).toBeVisible()
      await expect(subtitle).not.toBeEmpty()
    })
  })

  test.describe('KPI cards', () => {
    test('renders all four KPI cards', async ({ page }) => {
      await new DashboardPage(page).shouldHaveAllKpiCards()
    })

    test('shows a numeric value in the runs card', async ({ page }) => {
      const text = await new DashboardPage(page).kpiValue('runs').innerText()
      expect(parseInt(text, 10)).toBeGreaterThan(0)
    })

    test('shows a percentage in the pass rate card', async ({ page }) => {
      await expect(new DashboardPage(page).kpiValue('passrate')).toHaveText(/^\d+(\.\d+)?%$/)
    })

    test('shows trend indicators on each card', async ({ page }) => {
      const dashboard = new DashboardPage(page)
      for (const key of ['runs', 'passrate', 'members', 'issues']) {
        await expect(dashboard.kpiTrend(key)).toBeVisible()
        await expect(dashboard.kpiTrend(key)).not.toBeEmpty()
      }
    })
  })

  test.describe('Recent activity', () => {
    test('shows 5 activity items', async ({ page }) => {
      await new DashboardPage(page).shouldHaveActivityItems(5)
    })

    test('each activity item has text and a timestamp', async ({ page }) => {
      const item = new DashboardPage(page).activityItem(1)
      await expect(item.locator('.activity-text')).not.toBeEmpty()
      await expect(item.locator('.activity-time')).not.toBeEmpty()
    })

    test('"See all" link navigates to activity page', async ({ page }) => {
      await new DashboardPage(page).quickAction('team')
      await page.getByTestId('activity-see-all').click()
      await expect(page).toHaveURL(/\/web\/activity\.html/)
    })
  })

  test.describe('Suite health', () => {
    test('shows Healthy status badge', async ({ page }) => {
      await expect(new DashboardPage(page).healthStatus()).toBeVisible()
      await expect(new DashboardPage(page).healthStatus()).toContainText('Healthy')
    })

    test('renders three suite health bars', async ({ page }) => {
      const dashboard = new DashboardPage(page)
      for (const suite of ['regression', 'smoke', 'e2e']) {
        await expect(dashboard.healthBar(suite)).toBeVisible()
        await expect(dashboard.healthPct(suite)).toHaveText(/^\d+%$/)
      }
    })

    test('regression bar fill width reflects its percentage', async ({ page }) => {
      await expect(new DashboardPage(page).healthBar('regression')).toHaveAttribute('style', /width:97%/)
    })
  })

  test.describe('"New test run" modal', () => {
    test('opens modal on button click', async ({ page }) => {
      await new DashboardPage(page).openNewRunModal()
      await new DashboardPage(page).shouldShowRunModalOpen()
    })

    test('modal has suite and environment selects', async ({ page }) => {
      const dashboard = new DashboardPage(page)
      await dashboard.openNewRunModal()
      await expect(dashboard.runSuiteSelect()).toBeVisible()
      await expect(dashboard.runEnvSelect()).toBeVisible()
    })

    test('closes modal on Cancel', async ({ page }) => {
      const dashboard = new DashboardPage(page)
      await dashboard.openNewRunModal()
      await dashboard.cancelRun()
      await dashboard.shouldShowRunModalClosed()
    })

    test('closes modal on Escape key', async ({ page }) => {
      const dashboard = new DashboardPage(page)
      await dashboard.openNewRunModal()
      await page.keyboard.press('Escape')
      await dashboard.shouldShowRunModalClosed()
    })

    test('closes modal on overlay click', async ({ page }) => {
      const dashboard = new DashboardPage(page)
      await dashboard.openNewRunModal()
      await page.getByTestId('run-modal-overlay').click({ position: { x: 10, y: 10 }, force: true })
      await dashboard.shouldShowRunModalClosed()
    })

    test('confirms a run and shows toast', async ({ page }) => {
      const dashboard = new DashboardPage(page)
      await dashboard.openNewRunModal()
      await dashboard.selectSuite('smoke')
      await dashboard.selectEnvironment('staging')
      await dashboard.confirmRun()
      await dashboard.shouldShowRunModalClosed()
      await expect(page.getByTestId('toast-message')).toContainText('smoke')
    })
  })

  test.describe('Quick access navigation', () => {
    const links = [
      { testId: 'qa-team', path: '/web/team.html' },
      { testId: 'qa-settings', path: '/web/settings.html' },
      { testId: 'qa-wizard', path: '/web/wizard.html' },
    ]

    for (const { testId, path } of links) {
      test(`"${testId}" navigates to ${path}`, async ({ page }) => {
        await page.getByTestId(testId).click()
        await expect(page).toHaveURL(new RegExp(path.replace('.', '\\.')))
        await page.goBack()
      })
    }
  })
})
