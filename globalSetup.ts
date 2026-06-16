import fs from 'node:fs'
import path from 'node:path'
import { request, type FullConfig } from '@playwright/test'
import { DEMO_EMAIL, DEMO_PASSWORD } from './support/helpers'
import { writeSession, writeStorageState } from './support/sessionStore'

const CACHE_DIR = path.join(__dirname, '.playwright')
const CACHE_FILE = path.join(CACHE_DIR, 'token-cache.json')

async function globalSetup(config: FullConfig): Promise<void> {
  const baseURL =
    config.projects[0]?.use?.baseURL ??
    process.env.BASE_URL ??
    'http://localhost:5050'

  const api = await request.newContext({ baseURL })
  try {
    const response = await api.post('/api/auth/login', {
      data: { email: DEMO_EMAIL, password: DEMO_PASSWORD },
    })
    const body = await response.json()
    fs.mkdirSync(CACHE_DIR, { recursive: true })
    fs.writeFileSync(
      CACHE_FILE,
      JSON.stringify({ token: body.token, email: DEMO_EMAIL, cachedAt: Date.now() }),
    )
    writeSession({
      email: DEMO_EMAIL,
      name: body.user?.name ?? 'Demo User',
      token: body.token,
    })
    writeStorageState()
  } finally {
    await api.dispose()
  }
}

export default globalSetup

export function readCachedAuthToken(): string | null {
  try {
    const raw = fs.readFileSync(CACHE_FILE, 'utf8')
    const parsed = JSON.parse(raw) as { token?: string }
    return parsed.token ?? null
  } catch {
    return null
  }
}
