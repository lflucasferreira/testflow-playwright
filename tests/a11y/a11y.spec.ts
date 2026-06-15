import AxeBuilder from '@axe-core/playwright'
import { test, expect } from '@playwright/test'
import { loginViaApi } from '../../support/auth'

const A11Y_PAGES = [
  { path: '/web/dashboard.html', testId: 'page-dashboard', name: 'Dashboard' },
  { path: '/web/login.html', testId: 'login-email', name: 'Login' },
  { path: '/web/wizard.html', testId: 'page-wizard', name: 'Wizard' },
  { path: '/web/components.html', testId: 'page-components', name: 'Components' },
]

test.describe('Accessibility — axe scans', { tag: ['@a11y', '@regression'] }, () => {
  for (const { path, testId, name } of A11Y_PAGES) {
    test(`${name} has no critical axe violations`, async ({ page, request }) => {
      if (path.includes('login')) {
        await page.goto(path)
      } else {
        await loginViaApi(page, request)
        await page.goto(path)
      }

      await expect(page.getByTestId(testId)).toBeVisible()

      const results = await new AxeBuilder({ page })
        .disableRules(['color-contrast'])
        .analyze()

      const critical = results.violations.filter((v) => v.impact === 'critical')
      expect(critical, JSON.stringify(critical, null, 2)).toEqual([])
    })
  }
})
