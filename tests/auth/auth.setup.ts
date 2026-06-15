import { test as setup, expect } from '@playwright/test'
import { DEMO_EMAIL, DEMO_PASSWORD } from '../../support/helpers'
import { writeSession } from '../../support/sessionStore'

const STORAGE_STATE = '.playwright/.auth/user.json'

setup('authenticate via API and persist session', async ({ page, request }) => {
  const response = await request.post('/api/auth/login', {
    data: { email: DEMO_EMAIL, password: DEMO_PASSWORD },
  })
  expect(response.status()).toBe(200)

  const body = await response.json()
  const session = {
    email: DEMO_EMAIL,
    name: body.user?.name ?? 'Demo User',
    token: body.token as string,
  }

  writeSession(session)

  await page.addInitScript((auth) => {
    sessionStorage.setItem('sandbox-auth', JSON.stringify(auth))
    sessionStorage.setItem('sandbox-token', auth.token)
  }, session)

  await page.goto('/web/dashboard.html')
  await expect(page.getByTestId('page-dashboard')).toBeVisible()
  await page.context().storageState({ path: STORAGE_STATE })
})
