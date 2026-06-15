import { expect } from '@playwright/test'

export function withoutId<T extends { id?: unknown }>(items: T[]): Omit<T, 'id'>[] {
  return items.map(({ id: _id, ...rest }) => rest)
}

export function expectSameMembers<T>(expected: T[], received: T[]): void {
  expect(received).toHaveLength(expected.length)
  for (const item of expected) {
    expect(received).toContainEqual(item)
  }
}

export function diffForMatchObject(
  expected: Record<string, unknown>,
  received: Record<string, unknown>,
  path = '',
): string[] {
  const lines: string[] = []
  for (const [key, exp] of Object.entries(expected)) {
    const recv = received[key]
    const fullPath = path ? `${path}.${key}` : key
    if (JSON.stringify(exp) !== JSON.stringify(recv)) {
      lines.push(`- ${fullPath}: expected ${JSON.stringify(exp)}, got ${JSON.stringify(recv)}`)
    }
  }
  return lines
}
