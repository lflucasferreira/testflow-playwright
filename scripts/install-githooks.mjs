import { execSync } from 'node:child_process'
import { chmodSync, existsSync } from 'node:fs'
import { join } from 'node:path'

if (process.env.CI) {
  console.log('Skipping git hooks install in CI')
  process.exit(0)
}

const root = process.cwd()
const hooksDir = join(root, '.githooks')
const hookNames = ['pre-commit', 'commit-msg', 'prepare-commit-msg', 'pre-push']

if (!existsSync(hooksDir)) {
  console.error('Missing .githooks directory')
  process.exit(1)
}

for (const hook of hookNames) {
  chmodSync(join(hooksDir, hook), 0o755)
}

chmodSync(join(hooksDir, 'lib', 'author-policy.sh'), 0o755)

execSync('git config core.hooksPath .githooks', {
  cwd: root,
  stdio: 'inherit',
})

console.log('Git hooks installed (.githooks -> core.hooksPath)')
