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

# HTML report
npm run report
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

GitHub Actions workflow runs each project in parallel against the `qaschool/testflow:latest` Docker service (17 matrix jobs + `@smoke` grep job), including Firefox/WebKit smoke and visual regression.

**GitHub Pages** (`.github/workflows/pages.yml`): on every push to `main`, runs the full suite, builds the docs landing + Playwright HTML report, and deploys to GitHub Pages. Enable **Settings → Pages → Source: GitHub Actions** once.

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
