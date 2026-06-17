# TestFlow Playwright — Documentação de Treinamento

Material didático que explica **bloco a bloco** cada arquivo de teste do projeto. Ideal para novos alunos que estão aprendendo Playwright, Page Objects e automação E2E/API.

Cada documento aponta para o arquivo de spec correspondente com um link relativo.

**Idioma:** Português · [English](../en/README.md)

---

## Como usar este material

1. Leia o doc da suite que você vai executar ou manter.
2. Abra o [arquivo de spec](..) linkado no topo do documento.
3. Siga a explicação seção por seção enquanto lê o código.
4. Execute a suite localmente:

```bash
npx playwright test --ui                          # runner interativo
npx playwright test tests/smoke/navigation.spec.ts
npm run test:smoke                                # projeto smoke
npm run test:api                                  # projeto API
npm run test:grep:smoke                           # tag @smoke em todos os projetos
```

---

## Índice por suite

### Smoke & Auth

| Suite | Documentação | Arquivo de teste |
|-------|--------------|------------------|
| Smoke — navegação | [navigation.md](tests/smoke/navigation.md) | [`tests/smoke/navigation.spec.ts`](../../tests/smoke/navigation.spec.ts) |
| Auth — login | [login.md](tests/auth/login.md) | [`tests/auth/login.spec.ts`](../../tests/auth/login.spec.ts) |

### Páginas autenticadas

| Suite | Documentação | Arquivo de teste |
|-------|--------------|------------------|
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

### Visual, Acessibilidade & API

| Suite | Documentação | Arquivo de teste |
|-------|--------------|------------------|
| Visual regression | [visual.md](tests/visual/visual.md) | [`tests/visual/visual.spec.ts`](../../tests/visual/visual.spec.ts) |
| Accessibility (axe) | [a11y.md](tests/a11y/a11y.md) | [`tests/a11y/a11y.spec.ts`](../../tests/a11y/a11y.spec.ts) |
| API — auth | [auth.api.md](tests/api/auth.api.md) | [`tests/api/auth.api.spec.ts`](../../tests/api/auth.api.spec.ts) |
| API — users & health | [users.api.md](tests/api/users.api.md) | [`tests/api/users.api.spec.ts`](../../tests/api/users.api.spec.ts) |
| API — rules / JSON Patch | [rules.api.md](tests/api/rules.api.md) | [`tests/api/rules.api.spec.ts`](../../tests/api/rules.api.spec.ts) |
| CI — env diagnostics | [env-diagnostics.md](tests/api/env-diagnostics.md) | [`tests/api/env-diagnostics.spec.ts`](../../tests/api/env-diagnostics.spec.ts) |

---

## Conceitos transversais

Os documentos cobrem, entre outros:

- **Playwright:** `test.describe`, `test.beforeEach`/`beforeAll`, tags via `{ tag: '@smoke' }`, auto-waiting do `expect`
- **Autenticação:** `loginViaApi`, `visitAuthenticated`, `getAuthToken`, `storageState` via [`globalSetup.ts`](../../globalSetup.ts)
- **Page Object Model:** classes em [`pages/`](../../pages/)
- **Testes de API:** fixture `request`, [`fixtures.ts`](../../fixtures.ts) customizado com `authToken`
- **Rede:** `page.route`, `page.waitForRequest`, `page.waitForResponse`
- **Dados de teste:** fixtures JSON em [`fixtures/`](../../fixtures/), factories em [`support/factories/`](../../support/factories/)
- **Acessibilidade:** `@axe-core/playwright` com `AxeBuilder`
- **Visual regression:** `toHaveScreenshot` com baselines de snapshot
- **Seletores:** `page.getByTestId` — veja [`selector-strategy.md`](../selector-strategy.md)

---

## Outros materiais em `docs/`

| Recurso | Descrição |
|---------|-----------|
| [`slides/`](../slides/) | Apresentação introdutória Playwright (HTML/PDF) |
| [`guia-completo.html`](../guia-completo.html) | Guia passo a passo em português (página única) |
| [`complete-guide.html`](../complete-guide.html) | Step-by-step guide in English (single page) |
| [`selector-strategy.md`](../selector-strategy.md) | `data-testid` via `page.getByTestId` |
| [`playwright-technical-interview-questions.md`](../playwright-technical-interview-questions.md) | Banco de perguntas técnicas para entrevistas (Português) |

---

## Estrutura de pastas

```
docs/
├── README.md                          ← seletor de idioma
├── guia-completo.html                 ← guia completo (PT)
├── complete-guide.html                ← complete guide (EN)
├── playwright-technical-interview-questions.md
├── selector-strategy.md
├── pt/
│   ├── README.md                      ← índice (Português)
│   └── tests/                         ← walkthroughs por spec
├── en/
│   ├── README.md                      ← index (English)
│   └── tests/
└── slides/                            ← apresentação Reveal.js
```

Cada `.md` em `docs/pt/tests/` espelha o spec homônimo em `tests/`.
