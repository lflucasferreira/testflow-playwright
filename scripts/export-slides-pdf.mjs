import { spawn } from 'node:child_process'
import { setTimeout as sleep } from 'node:timers/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import fs from 'node:fs'
import os from 'node:os'
import net from 'node:net'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const outputPath = path.join(root, 'docs/slides/playwright-intro-slides.pdf')
const SLIDES_MARKER = 'Playwright — Introdução'

const CHROME_CANDIDATES = [
  process.env.CHROME_PATH,
  process.env.PUPPETEER_EXECUTABLE_PATH,
  process.platform === 'darwin'
    ? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
    : null,
  process.platform === 'darwin'
    ? '/Applications/Chromium.app/Contents/MacOS/Chromium'
    : null,
  process.platform === 'linux' ? '/usr/bin/google-chrome' : null,
  process.platform === 'linux' ? '/usr/bin/chromium-browser' : null,
  process.platform === 'win32'
    ? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
    : null,
].filter(Boolean)

function resolveChromePath() {
  for (const candidate of CHROME_CANDIDATES) {
    if (fs.existsSync(candidate)) return candidate
  }
  return null
}

function run(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: root,
      stdio: options.inherit ? 'inherit' : 'pipe',
      ...options,
    })

    let stderr = ''

    if (!options.inherit) {
      child.stderr?.on('data', (chunk) => {
        stderr += chunk
      })
    }

    child.on('error', reject)
    child.on('close', (code) => {
      if (code === 0) {
        resolve()
        return
      }
      reject(new Error(`${command} ${args.join(' ')} exited with code ${code}\n${stderr}`))
    })
  })
}

async function findFreePort(preferredPort) {
  if (preferredPort) {
    const available = await isPortAvailable(Number(preferredPort))
    if (available) return Number(preferredPort)
  }

  return new Promise((resolve, reject) => {
    const server = net.createServer()
    server.unref()
    server.on('error', reject)
    server.listen(0, '127.0.0.1', () => {
      const { port } = server.address()
      server.close(() => resolve(port))
    })
  })
}

function isPortAvailable(port) {
  return new Promise((resolve) => {
    const server = net.createServer()
    server.unref()
    server.once('error', () => resolve(false))
    server.listen(port, '127.0.0.1', () => {
      server.close(() => resolve(true))
    })
  })
}

async function waitForSlidesServer(url, attempts = 30) {
  for (let i = 0; i < attempts; i += 1) {
    try {
      const response = await fetch(url)
      const html = await response.text()
      if (response.ok && html.includes(SLIDES_MARKER)) {
        return
      }
    } catch {
      // server not ready yet
    }
    await sleep(500)
  }
  throw new Error(
    `Playwright slides were not served at ${url}. ` +
      'Another project may be using the same port — set SLIDES_PORT to a free port.',
  )
}

async function main() {
  const port = await findFreePort(process.env.SLIDES_PORT)
  const slidesUrl = `http://127.0.0.1:${port}/docs/slides/`

  console.log(`Starting local server for slides export on port ${port}...`)
  const serve = spawn('npx', ['serve', '.', '-l', String(port), '--no-clipboard'], {
    cwd: root,
    stdio: 'pipe',
  })

  const cleanup = () => {
    if (!serve.killed) {
      serve.kill('SIGTERM')
    }
  }

  process.on('SIGINT', () => {
    cleanup()
    process.exit(130)
  })
  process.on('SIGTERM', cleanup)

  try {
    await waitForSlidesServer(slidesUrl)
    console.log(`Verified Playwright slides at ${slidesUrl}`)
    console.log(`Exporting slides to ${path.relative(root, outputPath)}...`)

    const chromePath = resolveChromePath()
    const decktapeArgs = [
      'decktape',
      '--chrome-arg=--disable-web-security',
      'reveal',
      slidesUrl,
      outputPath,
      '-s',
      '1280x720',
      '--pause',
      '800',
    ]

    if (chromePath) {
      console.log(`Using Chrome: ${chromePath}`)
      decktapeArgs.splice(1, 0, `--chrome-path=${chromePath}`)
    } else {
      console.warn(
        `System Chrome not found (${os.platform()}). Install Chrome or set CHROME_PATH.`,
      )
    }

    await run('npx', decktapeArgs, { inherit: true })

    const stats = fs.statSync(outputPath)
    console.log(`PDF created (${Math.round(stats.size / 1024)} KB): ${outputPath}`)
  } finally {
    cleanup()
  }
}

main().catch((error) => {
  console.error(error.message)
  process.exit(1)
})
