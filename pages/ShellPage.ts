import { expect, Page } from '@playwright/test'

const NAV_ITEMS = [
  { testId: 'nav-dashboard', path: '/web/dashboard.html', pageTestId: 'page-dashboard' },
  { testId: 'nav-team', path: '/web/team.html', pageTestId: 'page-team' },
  { testId: 'nav-settings', path: '/web/settings.html', pageTestId: 'page-settings' },
  { testId: 'nav-widgets', path: '/web/widgets.html', pageTestId: 'page-widgets' },
  { testId: 'nav-components', path: '/web/components.html', pageTestId: 'page-components' },
  { testId: 'nav-activity', path: '/web/activity.html', pageTestId: 'page-activity' },
  { testId: 'nav-advanced', path: '/web/advanced.html', pageTestId: 'page-advanced' },
  { testId: 'nav-wizard', path: '/web/wizard.html', pageTestId: 'page-wizard' },
  { testId: 'nav-states', path: '/web/states.html', pageTestId: 'page-states' },
] as const

export class ShellPage {
  constructor(private readonly page: Page) {}

  sidebar() { return this.page.getByTestId('site-sidebar') }
  topbar() { return this.page.getByTestId('site-topbar') }
  breadcrumb() { return this.page.getByTestId('breadcrumb') }
  skipToContent() { return this.page.getByTestId('skip-to-content') }
  notifBell() { return this.page.getByTestId('notif-bell') }
  notifDropdown() { return this.page.getByTestId('notif-dropdown') }
  notifList() { return this.page.getByTestId('notif-list') }
  notifMarkAll() { return this.page.getByTestId('notif-mark-all') }
  notifBadge() { return this.page.getByTestId('notif-badge') }
  userName() { return this.page.getByTestId('topbar-user-name') }
  themeToggle() { return this.page.getByTestId('theme-toggle') }

  nav(testId: string) { return this.page.getByTestId(testId) }

  static navItems() {
    return NAV_ITEMS
  }

  async openNotifications() {
    await this.notifBell().click()
    await expect(this.notifDropdown()).toBeVisible()
    return this
  }

  async markAllNotificationsRead() {
    await this.notifMarkAll().click()
    return this
  }

  async getUnreadCount(): Promise<number> {
    if (!(await this.notifBadge().isVisible())) return 0
    return parseInt(await this.notifBadge().innerText(), 10)
  }

  async skipToMainContent() {
    await this.skipToContent().focus()
    await this.page.keyboard.press('Enter')
    return this
  }

  async toggleTheme() {
    await expect(this.themeToggle()).toBeVisible()
    await this.themeToggle().click()
    return this
  }

  async getTheme(): Promise<string> {
    return this.page.evaluate(() => document.documentElement.getAttribute('data-theme') ?? 'dark')
  }

  async navigateViaSidebar(testId: string) {
    await this.page.getByTestId(testId).click()
    return this
  }

  async shouldShowAppShell() {
    await expect(this.sidebar()).toBeVisible()
    await expect(this.topbar()).toBeVisible()
    return this
  }

  async shouldHighlightNav(testId: string) {
    await expect(this.nav(testId)).toHaveClass(/active/)
    return this
  }
}
