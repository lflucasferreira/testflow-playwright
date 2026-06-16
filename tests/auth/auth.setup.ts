import fs from 'node:fs'
import path from 'node:path'
import { test as setup, expect } from '@playwright/test'
import { DEMO_EMAIL, DEMO_PASSWORD } from '../../support/helpers'
import { writeSession } from '../../support/sessionStore'

const AUTH_DIR = path.join(__dirname, '../../.playwright/.auth')
const STORAGE_STATE = path.join(AUTH_DIR, 'user.json')

setup('authenticate via API and persist session', async ({ request }) => {
  const response = await request.post('/api/auth/login', {
    data: { email: DEMO_EMAIL, password: DEMO_PASSWORD },
  })
  expect(response.status()).toBe(200)

  const body = await response.json()
  writeSession({
    email: DEMO_EMAIL,
    name: body.user?.name ?? 'Demo User',
    token: body.token as string,
  })

  fs.mkdirSync(AUTH_DIR, { recursive: true })
  fs.writeFileSync(
    STORAGE_STATE,
    JSON.stringify({ cookies: [], origins: [] }, null, 2),
  )
})
