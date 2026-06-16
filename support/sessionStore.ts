import fs from 'node:fs'
import path from 'node:path'

export interface StoredSession {
  email: string
  name: string
  token: string
}

const AUTH_DIR = path.join(__dirname, '../.playwright/.auth')
export const SESSION_FILE = path.join(AUTH_DIR, 'session.json')
export const STORAGE_STATE_FILE = path.join(AUTH_DIR, 'user.json')

export function writeSession(session: StoredSession): void {
  fs.mkdirSync(AUTH_DIR, { recursive: true })
  fs.writeFileSync(SESSION_FILE, JSON.stringify({ ...session, cachedAt: Date.now() }))
}

export function writeStorageState(): void {
  fs.mkdirSync(AUTH_DIR, { recursive: true })
  fs.writeFileSync(
    STORAGE_STATE_FILE,
    JSON.stringify({ cookies: [], origins: [] }, null, 2),
  )
}

export function readSession(): StoredSession | null {
  try {
    const parsed = JSON.parse(fs.readFileSync(SESSION_FILE, 'utf8')) as StoredSession
    if (!parsed.token) return null
    return parsed
  } catch {
    return null
  }
}

export async function applySessionInitScript(
  page: import('@playwright/test').Page,
  session: StoredSession,
): Promise<void> {
  await page.addInitScript((auth) => {
    sessionStorage.setItem('sandbox-auth', JSON.stringify(auth))
    sessionStorage.setItem('sandbox-token', auth.token)
  }, session)
}
