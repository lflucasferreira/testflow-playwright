import { expect } from '@playwright/test'

export const DEMO_EMAIL = process.env.DEMO_EMAIL ?? 'demo@automation.io'
export const DEMO_PASSWORD = process.env.DEMO_PASSWORD ?? 'Demo123!'

export type Schema = Record<string, 'string' | 'number' | 'boolean' | 'array' | 'object'>

export function validateSchema(obj: Record<string, unknown>, schema: Schema): void {
  for (const [key, type] of Object.entries(schema)) {
    expect(obj, 'response body').toHaveProperty(key)
    if (type === 'array') {
      expect(Array.isArray(obj[key]), `"${key}"`).toBe(true)
    } else {
      expect(typeof obj[key], `"${key}" should be ${type}`).toBe(type)
    }
  }
}

export function getTableRows(page: import('@playwright/test').Page, tableTestId = 'users-table') {
  return page.getByTestId(tableTestId).locator('tbody tr')
}

export function getCell(page: import('@playwright/test').Page, rowId: number, field: string) {
  return page.getByTestId(`cell-${field}-${rowId}`)
}
