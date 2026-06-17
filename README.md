# testflow-playwright

Playwright E2E automation suite for [TestFlow](https://github.com/qaschoolbr/testflow) — mirror of the Cypress suite in `testflow-cypress`.

## Test coverage

| Project | Spec | What it covers |
|---|---|---|
| `smoke` | `tests/smoke/navigation.spec.ts` | All pages load, sidebar nav, logout, health API |
| `auth` | `tests/auth/login.spec.ts` | Login UI/API, validation, sessionStorage, redirect, logout |
| `dashboard` | `tests/dashboard/dashboard.spec.ts` | KPIs, activity feed, suite health, new run modal |
| `team` | `tests/team/team.spec.ts` | Table search, filters, sort, pagination, invite, inline edit |
| `settings` | `tests/settings/settings.spec.ts` | Settings form and toggles |
| `components` | `tests/components/components.spec.ts` | Buttons, modal, tabs, accordion |
| `widgets` | `tests/widgets/widgets.spec.ts` | Select2, SweetAlert, drag, iframes, upload, jobs modal |
| `wizard` | `tests/wizard/wizard.spec.ts` | Multi-step flow, validation, review, a11y |
| `activity` | `tests/activity/activity.spec.ts` | API mocks, counter, pipeline, countries fixture |
| `advanced` | `tests/advanced/advanced.spec.ts` | Shadow DOM, iframe, external links, mobile |
| `states` | `tests/states/states.spec.ts` | Skeleton, empty, error, partial loading |
| `layout` | `tests/layout/shell.spec.ts` | Sidebar nav, notifications, skip link, theme, mobile |
| `a11y` | `tests/a11y/a11y.spec.ts` | axe-core on dashboard, login, wizard, components, settings, states, modal |
| `visual` | `tests/visual/visual.spec.ts` | `toHaveScreenshot()` baselines (login, sidebar, components) |
| `api` | `tests/api/*.spec.ts` | REST, golden roles, `runPatchTests()`, rules/PATCH |
| `smoke-firefox` | `tests/smoke/navigation.spec.ts` | Smoke suite on Firefox |
| `smoke-webkit` | `tests/smoke/navigation.spec.ts` | Smoke suite on WebKit |

## Prerequisites

- Node.js 20+
- TestFlow app running locally on port `5050`

## Setup

```bash
npm install
npm run install:browsers
```

### Corporate proxy (Zscaler / SSL errors)

If `npx playwright install chromium` fails with `UNABLE_TO_GET_ISSUER_CERT_LOCALLY`, Node.js does not trust your corporate CA (macOS Keychain does, Node does not).

**Recommended** — export the Zscaler root CA and point Node at it:

```bash
security find-certificate -c "Zscaler Root CA" -p > ~/.zscaler-root.pem
export NODE_EXTRA_CA_CERTS=~/.zscaler-root.pem
npm run install:browsers
```

Add the `export` line to your `~/.zshrc` so it applies to all Node/npm commands.

**Quick workaround** — `npm run install:browsers` already sets `NODE_TLS_REJECT_UNAUTHORIZED=0` for the download. Use the `NODE_EXTRA_CA_CERTS` approach above if you prefer not to disable TLS verification globally.

## Running the app

```bash
docker run --rm -p 5050:5050 qaschool/testflow:latest
```

Or clone and start TestFlow from source — see the [TestFlow repo](https://github.com/qaschoolbr/testflow).

## Running tests

```bash
# All suites
npm test

# Interactive UI mode
npm run test:ui

# Headed browser
npm run test:headed

# By project
npm run test:smoke
npm run test:auth
npm run test:dashboard
npm run test:team
npm run test:settings
npm run test:components
npm run test:widgets
npm run test:wizard
npm run test:activity
npm run test:advanced
npm run test:states
npm run test:layout
npm run test:a11y
npm run test:visual
npm run test:visual:update
npm run test:smoke-firefox
npm run test:smoke-webkit
npm run test:api

# Filter by tag
npm run test:grep:smoke
npm run test:grep:regression

# Reports
npm run report              # Playwright HTML report (local)
npm run report:allure         # Generate Allure report from allure-results/
npm run report:allure:open    # Open Allure report in browser
npm run report:allure:serve   # Generate + open Allure report
```

## Project structure

```
testflow-playwright/
├── fixtures/              # JSON fixtures + sample upload file
├── fixtures.ts            # Custom test fixture (authToken)
├── globalSetup.ts         # Auth token, session + storageState (API only, no browser)
├── pages/                 # Page Object Model
├── support/
│   ├── api/               # Rules API client
│   ├── constants/         # EXPECT status codes, viewports
│   ├── factories/         # Test data factories
│   ├── helpers/           # API exchange, headers, contract, readFixture
│   ├── sessionStore.ts    # Persisted session + storageState paths
│   └── utilities/         # JSON Patch, retry/poll, runPatchTests()
├── tests/
│   ├── visual/            # toHaveScreenshot baselines
│   ├── components/
│   ├── dashboard/
│   ├── layout/
│   ├── settings/
│   ├── smoke/
│   ├── team/
│   ├── widgets/
│   └── …
└── playwright.config.ts
```

## CI

GitHub Actions (`.github/workflows/playwright.yml`) on push to `main`:

| Job | When | What it does |
|-----|------|----------------|
| `test` | PR + `main` | Matrix **chromium / firefox / webkit** — 3 parallel jobs (`test:ci:*`) |
| `publish-pages` | `main` only | Builds docs site (slides, guides) and deploys to GitHub Pages immediately |
| `deploy-pages` | `main` only | Deploys the docs site |
| `publish-allure` | `main` only | After tests (`if: always()`), merges Allure results, rebuilds site with report |
| `deploy-allure` | `main` only | Redeploys GitHub Pages with the Allure report when available |

| Browser job | Projects | Timeout |
|-------------|----------|---------|
| `chromium` | api + 14 UI suites (smoke, auth, widgets, visual, a11y, …) | 40 min |
| `firefox` | `smoke-firefox` | 20 min |
| `webkit` | `smoke-webkit` | 20 min |

Each runner starts `qaschool/testflow:latest`, installs **one browser**, and runs with `workers: 1` in CI. Wall-clock time ≈ duration of the chromium job (~30–40 min), not the sum of all three.

**GitHub Pages:** enable **Settings → Pages → Source: GitHub Actions** once.

- Hub: `https://lflucasferreira.github.io/testflow-playwright/docs/`
- Complete guide (EN): `https://lflucasferreira.github.io/testflow-playwright/docs/complete-guide.html`
- Guia completo (PT): `https://lflucasferreira.github.io/testflow-playwright/docs/guia-completo.html`
- Slides: `https://lflucasferreira.github.io/testflow-playwright/docs/slides/`
- Allure report: `https://lflucasferreira.github.io/testflow-playwright/report/`

Locally, use `npm run test:<project>` to run a single project (e.g. `test:widgets`, `test:smoke-webkit`).

## Slides & interview prep

- **Docs hub:** `npm run slides` → http://localhost:3335/docs/ (guides, slides, light/dark theme)
- Slides only: http://localhost:3335/docs/slides/
- Interview questions: [`docs/playwright-technical-interview-questions.md`](docs/playwright-technical-interview-questions.md)

## Technologies

- [Playwright](https://playwright.dev/)
- [@axe-core/playwright](https://github.com/dequelabs/axe-core-npm)
- TypeScript
- Page Object Model with `data-testid` selectors

## License

Same as TestFlow / parent automation projects.
