import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const source = path.join(root, 'playwright-report')
const target = path.join(root, 'docs/report')

if (!fs.existsSync(path.join(source, 'index.html'))) {
  console.error('No playwright-report/index.html found. Run tests first: npm test')
  process.exit(1)
}

fs.rmSync(target, { recursive: true, force: true })
fs.cpSync(source, target, { recursive: true })
console.log(`Published report to ${path.relative(root, target)}/`)
