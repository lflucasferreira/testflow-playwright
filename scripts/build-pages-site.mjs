import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const siteDir = path.join(root, 'site')
const docsSrc = path.join(root, 'docs')
const docsDest = path.join(siteDir, 'docs')
const allureReport = path.join(root, 'allure-report')
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

const ROOT_REDIRECT_HTML = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta http-equiv="refresh" content="0; url=docs/" />
    <link rel="canonical" href="docs/" />
    <title>testflow-playwright</title>
    <script>location.replace('docs/')</script>
  </head>
  <body>
    <p><a href="docs/">testflow-playwright documentation</a></p>
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
    <p>Moved — <a href="${target}">open the guide</a>.</p>
  </body>
</html>
`,
  )
}

fs.rmSync(siteDir, { recursive: true, force: true })
fs.mkdirSync(docsDest, { recursive: true })

fs.copyFileSync(path.join(docsSrc, 'index.html'), path.join(docsDest, 'index.html'))
copyDir(path.join(docsSrc, 'slides'), path.join(docsDest, 'slides'))

for (const guide of ['guia-completo.html', 'complete-guide.html']) {
  const src = path.join(docsSrc, guide)
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, path.join(docsDest, guide))
  }
}

fs.writeFileSync(path.join(siteDir, 'index.html'), ROOT_REDIRECT_HTML)

writeLegacyRedirect(path.join(siteDir, 'slides', 'complete-guide.html'), '../docs/complete-guide.html')
writeLegacyRedirect(path.join(siteDir, 'slides', 'guia-completo.html'), '../docs/guia-completo.html')

const reportDest = path.join(siteDir, 'report')
if (fs.existsSync(path.join(allureReport, 'index.html'))) {
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
