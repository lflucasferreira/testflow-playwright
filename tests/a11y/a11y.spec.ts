import AxeBuilder from '@axe-core/playwright'
import { test, expect } from '@playwright/test'
import { loginViaApi, visitAuthenticated } from '../../support/auth'
import { ComponentsPage } from '../../pages/ComponentsPage'

const A11Y_PAGES: Array<{
  path: string
  testId: string
  name: string
  scope?: string
}> = [
  { path: '/web/dashboard.html', testId: 'page-dashboard', name: 'Dashboard' },
  { path: '/web/login.html', testId: 'login-email', name: 'Login' },
  { path: '/web/wizard.html', testId: 'page-wizard', name: 'Wizard' },
  { path: '/web/components.html', testId: 'page-components', name: 'Components' },
  {
    path: '/web/settings.html',
    testId: 'page-settings',
    name: 'Settings',
    scope: '[data-testid="settings-form"]',
  },
  { path: '/web/states.html', testId: 'page-states', name: 'UI States' },
]

async function assertNoCriticalViolations(page: import('@playwright/test').Page, scope?: string) {
  let builder = new AxeBuilder({ page }).disableRules(['color-contrast'])
  if (scope) builder = builder.include(scope)

  const results = await builder.analyze()
  const critical = results.violations.filter((v) => v.impact === 'critical')
  expect(critical, JSON.stringify(critical, null, 2)).toEqual([])
}

test.describe('Accessibility — axe scans', { tag: ['@a11y', '@regression'] }, () => {
  for (const { path, testId, name, scope } of A11Y_PAGES) {
    test(`${name} has no critical axe violations`, async ({ page, request }) => {
      if (path.includes('login')) {
        await page.goto(path)
      } else {
        await loginViaApi(page, request)
        await page.goto(path)
      }

      await expect(page.getByTestId(testId)).toBeVisible()
      await assertNoCriticalViolations(page, scope)
    })
  }

  test('Components modal has no critical axe violations when open', async ({ page, request }) => {
    await visitAuthenticated(page, request, '/web/components.html')
    const components = new ComponentsPage(page)
    await components.openModal()
    await assertNoCriticalViolations(page, '[data-testid="modal-overlay"]')
  })
})
