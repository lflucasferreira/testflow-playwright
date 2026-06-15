import fs from 'node:fs'
import path from 'node:path'

export function readFixture<T>(relativePath: string): T {
  const filePath = path.join(__dirname, '../../fixtures', relativePath)
  return JSON.parse(fs.readFileSync(filePath, 'utf8')) as T
}
