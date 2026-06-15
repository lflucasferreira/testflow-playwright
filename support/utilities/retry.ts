import { APIRequestContext, expect } from '@playwright/test'

const DEFAULT_MAX_MS = 10_000
const DEFAULT_INTERVAL_MS = 500

export async function pollGetUsersField(
  request: APIRequestContext,
  field: string,
  expectedValue: unknown,
  options: { headers?: Record<string, string>; deadlineMs?: number } = {},
): Promise<Record<string, unknown>> {
  const deadline = options.deadlineMs ?? DEFAULT_MAX_MS
  const start = Date.now()

  while (Date.now() - start < deadline) {
    const response = await request.get('/api/users', { headers: options.headers })
    if (response.status() === 200) {
      const body = await response.json() as { users: Array<Record<string, unknown>> }
      const match = body.users.find((user) => user[field] === expectedValue)
      if (match) return match
    }
    await new Promise((resolve) => setTimeout(resolve, DEFAULT_INTERVAL_MS))
  }

  throw new Error(`GET /api/users did not return user with ${field}=${String(expectedValue)} within ${deadline}ms`)
}

export async function pollUntil<T>(
  fn: () => Promise<T>,
  predicate: (value: T) => boolean,
  deadlineMs = DEFAULT_MAX_MS,
): Promise<T> {
  const start = Date.now()
  let last: T

  while (Date.now() - start < deadlineMs) {
    last = await fn()
    if (predicate(last)) return last
    await new Promise((resolve) => setTimeout(resolve, DEFAULT_INTERVAL_MS))
  }

  expect(predicate(last!)).toBe(true)
  return last!
}
