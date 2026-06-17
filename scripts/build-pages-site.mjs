import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const siteDir = path.join(root, 'site')
const docsSrc = path.join(root, 'docs')
const allureReport = path.join(root, 'allure-report')
const allureStaging = path.join(root, 'pages-allure-staging')
const playwrightReport = path.join(root, 'playwright-report')
const fallbackReport = path.join(docsSrc, 'report')

const NO_REPORT_HTML = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Allure Report</title>
  </head>
  <body>
    <h1>No test report generated</h1>
    <p>Check workflow logs.</p>
  </body>
</html>
`

function copyDir(src, dest) {
  fs.cpSync(src, dest, { recursive: true })
}

function writeLegacyRedirect(destFile, target) {
  fs.mkdirSync(path.dirname(destFile), { recursive: true })
  fs.writeFileSync(
    destFile,
    `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta http-equiv="refresh" content="0; url=${target}" />
    <link rel="canonical" href="${target}" />
    <title>Redirecting…</title>
    <script>location.replace('${target}')</script>
  </head>
  <body>
    <p>Moved — <a href="${target}">continue</a>.</p>
  </body>
</html>
`,
  )
}

function patchFileInPlace(filePath, replacements) {
  if (!fs.existsSync(filePath)) return

  let html = fs.readFileSync(filePath, 'utf8')
  for (const [from, to] of replacements) {
    html = html.replaceAll(from, to)
  }
  fs.writeFileSync(filePath, html)
}

function patchSlidesForPages(slidesDir) {
  patchFileInPlace(path.join(slidesDir, 'index.html'), [
    ['../../node_modules/', '../node_modules/'],
    ['data-base="../../"', 'data-base="../"'],
  ])
  console.log('Patched slides/index.html paths for GitHub Pages')
}

function patchGuideForPages(filePath) {
  patchFileInPlace(filePath, [
    ['../node_modules/', 'node_modules/'],
    ['data-base="../"', 'data-base="./"'],
  ])
}

function patchHubForPages(filePath) {
  patchFileInPlace(filePath, [['data-base="../"', 'data-base="./"']])
}

function copyPagesVendorAssets() {
  const nodeModules = path.join(root, 'node_modules')
  const revealSrc = path.join(nodeModules, 'reveal.js')
  const hljsSrc = path.join(nodeModules, 'highlight.js')
  const siteModules = path.join(siteDir, 'node_modules')

  if (!fs.existsSync(revealSrc)) {
    throw new Error('Missing reveal.js — run npm ci before pages:build')
  }
  if (!fs.existsSync(hljsSrc)) {
    throw new Error('Missing highlight.js — run npm ci before pages:build')
  }

  copyDir(path.join(revealSrc, 'dist'), path.join(siteModules, 'reveal.js', 'dist'))
  fs.mkdirSync(path.join(siteModules, 'reveal.js', 'plugin', 'highlight'), { recursive: true })
  fs.copyFileSync(
    path.join(revealSrc, 'plugin', 'highlight', 'highlight.js'),
    path.join(siteModules, 'reveal.js', 'plugin', 'highlight', 'highlight.js'),
  )

  const hlStyles = path.join(siteModules, 'highlight.js', 'styles')
  fs.mkdirSync(hlStyles, { recursive: true })
  for (const style of ['github.css', 'github-dark.css']) {
    fs.copyFileSync(path.join(hljsSrc, 'styles', style), path.join(hlStyles, style))
  }

  console.log('Copied reveal.js + highlight.js assets to site/node_modules/')
}

fs.rmSync(siteDir, { recursive: true, force: true })
fs.mkdirSync(siteDir, { recursive: true })

fs.copyFileSync(path.join(docsSrc, 'index.html'), path.join(siteDir, 'index.html'))
copyDir(path.join(docsSrc, 'slides'), path.join(siteDir, 'slides'))
patchSlidesForPages(path.join(siteDir, 'slides'))

for (const guide of ['guia-completo.html', 'complete-guide.html']) {
  const src = path.join(docsSrc, guide)
  if (fs.existsSync(src)) {
    const dest = path.join(siteDir, guide)
    fs.copyFileSync(src, dest)
    patchGuideForPages(dest)
  }
}

patchHubForPages(path.join(siteDir, 'index.html'))
copyPagesVendorAssets()

writeLegacyRedirect(path.join(siteDir, 'docs', 'index.html'), '../')
writeLegacyRedirect(path.join(siteDir, 'docs', 'complete-guide.html'), '../complete-guide.html')
writeLegacyRedirect(path.join(siteDir, 'docs', 'guia-completo.html'), '../guia-completo.html')
writeLegacyRedirect(path.join(siteDir, 'docs', 'slides', 'index.html'), '../../slides/')

const reportDest = path.join(siteDir, 'report')
if (fs.existsSync(path.join(allureStaging, 'index.html'))) {
  copyDir(allureStaging, reportDest)
  console.log('Using pages-allure-staging/ for site/report/')
} else if (fs.existsSync(path.join(allureReport, 'index.html'))) {
  copyDir(allureReport, reportDest)
  console.log('Using allure-report/ for site/report/')
} else if (fs.existsSync(path.join(playwrightReport, 'index.html'))) {
  copyDir(playwrightReport, reportDest)
  console.log('Using playwright-report/ fallback for site/report/')
} else if (fs.existsSync(path.join(fallbackReport, 'index.html'))) {
  copyDir(fallbackReport, reportDest)
  console.log('Using docs/report/ fallback for site/report/')
} else {
  fs.mkdirSync(reportDest, { recursive: true })
  fs.writeFileSync(path.join(reportDest, 'index.html'), NO_REPORT_HTML)
  console.log('No report found — wrote placeholder at site/report/')
}

fs.writeFileSync(path.join(siteDir, '.nojekyll'), '')
console.log(`GitHub Pages site ready at ${path.relative(root, siteDir)}/`)
