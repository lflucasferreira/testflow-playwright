import { test, expect } from '@playwright/test'
import { ShellPage } from '../../pages/ShellPage'
import { loginViaApi } from '../../support/auth'
import { VIEWPORTS } from '../../support/constants/viewports'

test.describe('App shell — layout, navigation & notifications', { tag: '@regression' }, () => {
  test.beforeEach(async ({ page, request }) => {
    await loginViaApi(page, request)
    await new ShellPage(page).shouldShowAppShell()
  })

  test.describe('Layout landmarks', () => {
    test('sidebar, topbar and breadcrumb are visible on dashboard', async ({ page }) => {
      const shell = new ShellPage(page)
      await shell.shouldShowAppShell()
      await expect(shell.breadcrumb()).toBeVisible()
      await expect(shell.userName()).toContainText('Demo User')
    })

    test('skip-to-content link is focusable', async ({ page }) => {
      await page.getByTestId('skip-to-content').focus()
      await expect(page.getByTestId('skip-to-content')).toBeFocused()
    })

    test('main content region is reachable after skip link', async ({ page }) => {
      const shell = new ShellPage(page)
      await shell.skipToMainContent()
      await expect(page).toHaveURL(/#main-content$/)
      await expect(page.locator('#main-content')).toBeInViewport()
    })
  })

  test.describe('Sidebar navigation', () => {
    for (const { testId, path, pageTestId } of ShellPage.navItems()) {
      test(`navigates to ${path} via ${testId}`, async ({ page }) => {
        const shell = new ShellPage(page)
        await shell.navigateViaSidebar(testId)
        await expect(page).toHaveURL(new RegExp(path.replace('.', '\\.')))
        await expect(page.getByTestId(pageTestId)).toBeVisible()
        await shell.shouldHighlightNav(testId)
      })
    }
  })

  test.describe('Notifications', () => {
    test('opens notification dropdown on bell click', async ({ page }) => {
      const shell = new ShellPage(page)
      await shell.openNotifications()
      await expect(shell.notifList()).toBeVisible()
    })

    test('shows notification badge count', async ({ page }) => {
      const badge = new ShellPage(page).notifBadge()
      await expect(badge).toBeVisible()
      const count = parseInt(await badge.innerText(), 10)
      expect(count).toBeGreaterThanOrEqual(0)
    })

    test('mark all read clears or reduces badge', async ({ page }) => {
      const shell = new ShellPage(page)
      await shell.openNotifications()
      const before = await shell.getUnreadCount()
      expect(before).toBeGreaterThan(0)

      await shell.markAllNotificationsRead()
      await expect.poll(() => shell.getUnreadCount()).toBe(0)
      await expect(shell.notifBadge()).toBeHidden()
    })
  })

  test.describe('Theme toggle', () => {
    test('theme toggle switches data-theme and persists in localStorage', async ({ page }) => {
      const shell = new ShellPage(page)
      await expect(shell.themeToggle()).toBeVisible()
      const before = await shell.getTheme()

      await shell.toggleTheme()
      const after = await shell.getTheme()
      expect(after).not.toBe(before)

      const stored = await page.evaluate(() => localStorage.getItem('sandbox-theme'))
      expect(stored).toBe(after)
    })
  })

  test.describe('Responsive shell', () => {
    test('sidebar logo is visible', async ({ page }) => {
      await expect(page.getByTestId('sidebar-logo')).toBeVisible()
    })

    test('topbar persists across navigation', async ({ page }) => {
      const shell = new ShellPage(page)
      await shell.navigateViaSidebar('nav-team')
      await expect(shell.topbar()).toBeVisible()
      await expect(shell.userName()).toBeVisible()
    })

    test('shell remains usable at mobile viewport', async ({ page }) => {
      await page.setViewportSize(VIEWPORTS.MOBILE)
      const shell = new ShellPage(page)
      await shell.shouldShowAppShell()
      await expect(shell.sidebar()).toBeVisible()
      await shell.navigateViaSidebar('nav-team')
      await expect(page.getByTestId('page-team')).toBeVisible()
    })
  })
})
