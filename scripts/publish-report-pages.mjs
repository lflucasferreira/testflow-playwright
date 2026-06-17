import fs from 'node:fs'
import path from 'node:path'
import { execSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const target = path.join(root, 'docs/report')

execSync('node scripts/generate-allure-report.mjs', { cwd: root, stdio: 'inherit' })

const source = path.join(root, 'allure-report')
if (!fs.existsSync(path.join(source, 'index.html'))) {
  console.error('No allure-report/index.html found after generation.')
  process.exit(1)
}

fs.rmSync(target, { recursive: true, force: true })
fs.cpSync(source, target, { recursive: true })
console.log(`Published Allure report to ${path.relative(root, target)}/`)
