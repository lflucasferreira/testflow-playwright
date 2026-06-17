# TestFlow Playwright — Training Documentation

Instructional material that explains **block by block** each test file in the project. Ideal for new students learning Playwright, Page Objects, and E2E/API automation.

Each document links to the corresponding spec file with a relative path.

**Language:** English · [Português](../pt/README.md)

---

## How to use this material

1. Read the doc for the suite you will run or maintain.
2. Open the [spec file](..) linked at the top of the document.
3. Follow the explanation section by section while reading the code.
4. Run the suite locally:

```bash
npx playwright test --ui                          # interactive runner
npx playwright test tests/smoke/navigation.spec.ts
npm run test:smoke                                # smoke project
npm run test:api                                  # API project
npm run test:grep:smoke                           # @smoke tag across projects
```

---

## Index by suite

### Smoke & Auth

| Suite | Documentation | Spec file |
|-------|---------------|-----------|
| Smoke — navigation | [navigation.md](tests/smoke/navigation.md) | [`tests/smoke/navigation.spec.ts`](../../tests/smoke/navigation.spec.ts) |
| Auth — login | [login.md](tests/auth/login.md) | [`tests/auth/login.spec.ts`](../../tests/auth/login.spec.ts) |

### Authenticated pages

| Suite | Documentation | Spec file |
|-------|---------------|-----------|
| Dashboard | [dashboard.md](tests/dashboard/dashboard.md) | [`tests/dashboard/dashboard.spec.ts`](../../tests/dashboard/dashboard.spec.ts) |
| Team | [team.md](tests/team/team.md) | [`tests/team/team.spec.ts`](../../tests/team/team.spec.ts) |
| Settings | [settings.md](tests/settings/settings.md) | [`tests/settings/settings.spec.ts`](../../tests/settings/settings.spec.ts) |
| Components | [components.md](tests/components/components.md) | [`tests/components/components.spec.ts`](../../tests/components/components.spec.ts) |
| Wizard | [wizard.md](tests/wizard/wizard.md) | [`tests/wizard/wizard.spec.ts`](../../tests/wizard/wizard.spec.ts) |
| Activity | [activity.md](tests/activity/activity.md) | [`tests/activity/activity.spec.ts`](../../tests/activity/activity.spec.ts) |
| Advanced | [advanced.md](tests/advanced/advanced.md) | [`tests/advanced/advanced.spec.ts`](../../tests/advanced/advanced.spec.ts) |
| UI States | [states.md](tests/states/states.md) | [`tests/states/states.spec.ts`](../../tests/states/states.spec.ts) |
| App shell / layout | [shell.md](tests/layout/shell.md) | [`tests/layout/shell.spec.ts`](../../tests/layout/shell.spec.ts) |
| Classic Widgets | [widgets.md](tests/widgets/widgets.md) | [`tests/widgets/widgets.spec.ts`](../../tests/widgets/widgets.spec.ts) |

### Visual, Accessibility & API

| Suite | Documentation | Spec file |
|-------|---------------|-----------|
| Visual regression | [visual.md](tests/visual/visual.md) | [`tests/visual/visual.spec.ts`](../../tests/visual/visual.spec.ts) |
| Accessibility (axe) | [a11y.md](tests/a11y/a11y.md) | [`tests/a11y/a11y.spec.ts`](../../tests/a11y/a11y.spec.ts) |
| API — auth | [auth.api.md](tests/api/auth.api.md) | [`tests/api/auth.api.spec.ts`](../../tests/api/auth.api.spec.ts) |
| API — users & health | [users.api.md](tests/api/users.api.md) | [`tests/api/users.api.spec.ts`](../../tests/api/users.api.spec.ts) |
| API — rules / JSON Patch | [rules.api.md](tests/api/rules.api.md) | [`tests/api/rules.api.spec.ts`](../../tests/api/rules.api.spec.ts) |
| CI — env diagnostics | [env-diagnostics.md](tests/api/env-diagnostics.md) | [`tests/api/env-diagnostics.spec.ts`](../../tests/api/env-diagnostics.spec.ts) |

---

## Cross-cutting concepts

The docs cover, among other topics:

- **Playwright:** `test.describe`, `test.beforeEach`/`beforeAll`, tags via `{ tag: '@smoke' }`, `expect` auto-waiting
- **Authentication:** `loginViaApi`, `visitAuthenticated`, `getAuthToken`, `storageState` via [`globalSetup.ts`](../../globalSetup.ts)
- **Page Object Model:** classes in [`pages/`](../../pages/)
- **API testing:** `request` fixture, custom [`fixtures.ts`](../../fixtures.ts) with `authToken`
- **Network:** `page.route`, `page.waitForRequest`, `page.waitForResponse`
- **Test data:** JSON fixtures in [`fixtures/`](../../fixtures/), factories in [`support/factories/`](../../support/factories/)
- **Accessibility:** `@axe-core/playwright` with `AxeBuilder`
- **Visual regression:** `toHaveScreenshot` with snapshot baselines
- **Selectors:** `page.getByTestId` — see [`selector-strategy.md`](../selector-strategy.md)

---

## Other materials in `docs/`

| Resource | Description |
|----------|-------------|
| [`slides/`](../slides/) | Introductory Playwright presentation (HTML/PDF) |
| [`slides/guia-completo.html`](../slides/guia-completo.html) | Step-by-step guide in Portuguese (single page) |
| [`slides/complete-guide.html`](../slides/complete-guide.html) | Step-by-step guide in English (single page) |
| [`selector-strategy.md`](../selector-strategy.md) | `data-testid` via `page.getByTestId` |
| [`playwright-technical-interview-questions.md`](../playwright-technical-interview-questions.md) | Technical interview question bank (Portuguese) |

---

## Folder structure

```
docs/
├── README.md                          ← language selector
├── playwright-technical-interview-questions.md
├── selector-strategy.md
├── en/
│   ├── README.md                      ← this index (English)
│   └── tests/                         ← walkthroughs per spec
├── pt/
│   ├── README.md                      ← índice (Português)
│   └── tests/
└── slides/                            ← presentation
```

Each `.md` in `docs/en/tests/` mirrors the homonymous spec under `tests/`.
