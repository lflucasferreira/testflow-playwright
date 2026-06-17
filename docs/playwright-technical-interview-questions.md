# Playwright — Perguntas Técnicas para Entrevistas

> Banco de perguntas para entrevistas com recrutadores técnicos, QA leads, SDETs e engenheiros de software.  
> Cobertura baseada no conteúdo dos slides (`docs/slides/index.html`), na suíte **testflow-playwright** e em tópicos frequentes em empresas brasileiras e internacionais.  
> **Legenda:** `[SLIDE]` = abordado na apresentação · `[PROJETO]` = presente na suíte TestFlow · `[EXTRA]` = comum em entrevistas, fora dos slides/projeto.

---

## Índice

1. [Conceitos Fundamentais](#1-conceitos-fundamentais)
2. [Arquitetura Interna do Playwright](#2-arquitetura-interna-do-playwright)
3. [Instalação e Configuração](#3-instalação-e-configuração)
4. [Estrutura de Projeto e Organização](#4-estrutura-de-projeto-e-organização)
5. [Fixtures, test() e Runner](#5-fixtures-test-e-runner)
6. [Locators e Estratégias de Seletores](#6-locators-e-estratégias-de-seletores)
7. [Interações e Navegação](#7-interações-e-navegação)
8. [Assertions, Auto-wait e Retry](#8-assertions-auto-wait-e-retry)
9. [page.route, Mock, Spy e Network](#9-pageroute-mock-spy-e-network)
10. [API Testing com request](#10-api-testing-com-request)
11. [Autenticação e Sessão](#11-autenticação-e-sessão)
12. [Page Object Model (POM)](#12-page-object-model-pom)
13. [Fixtures JSON, Factories e Dados de Teste](#13-fixtures-json-factories-e-dados-de-teste)
14. [Organização de Specs e test.step](#14-organização-de-specs-e-teststep)
15. [Shadow DOM, Iframe e Casos Especiais](#15-shadow-dom-iframe-e-casos-especiais)
16. [UI States, Wizard, Activity e Shell](#16-ui-states-wizard-activity-e-shell)
17. [Component Testing](#17-component-testing)
18. [Trace, Debug, UI Mode e Inspector](#18-trace-debug-ui-mode-e-inspector)
19. [Multi-ambiente, CI/CD e Projects](#19-multi-ambiente-cicd-e-projects)
20. [Relatórios, Tags e Observabilidade](#20-relatórios-tags-e-observabilidade)
21. [Flakiness, Debugging e Estabilidade](#21-flakiness-debugging-e-estabilidade)
22. [Acessibilidade e Qualidade](#22-acessibilidade-e-qualidade)
23. [Comparações e Migração Cypress → Playwright](#23-comparações-e-migração-cypress--playwright)
24. [Padrões Enterprise e API Avançada](#24-padrões-enterprise-e-api-avançada)
25. [Segurança e Boas Práticas](#25-segurança-e-boas-práticas)
26. [Cenários Comportamentais e Situação-Problema](#26-cenários-comportamentais-e-situação-problema)
27. [Perguntas de Recrutador / Screening](#27-perguntas-de-recrutador--screening)

---

## 1. Conceitos Fundamentais

| # | Pergunta | Tag |
|---|----------|-----|
| 1.1 | O que é o Playwright e quem o mantém? | `[SLIDE]` |
| 1.2 | Para que tipos de teste o Playwright foi projetado (E2E, API, component)? | `[SLIDE]` |
| 1.3 | Quais browsers o Playwright suporta nativamente? | `[SLIDE]` `[EXTRA]` |
| 1.4 | Qual a diferença entre teste E2E, teste de integração e teste de API no contexto Playwright? | `[SLIDE]` |
| 1.5 | O Playwright substitui testes unitários? Por quê? | `[EXTRA]` |
| 1.6 | Quais linguagens o Playwright suporta oficialmente? | `[SLIDE]` |
| 1.7 | O Playwright funciona com aplicações mobile nativas (iOS/Android)? | `[EXTRA]` |
| 1.8 | O Playwright suporta múltiplas abas e pop-ups nativamente? | `[EXTRA]` |
| 1.9 | O Playwright consegue testar aplicações cross-origin e iframes? | `[SLIDE]` `[PROJETO]` |
| 1.10 | Qual a diferença entre `playwright test`, `playwright test --ui` e `playwright test --headed`? | `[SLIDE]` `[PROJETO]` |
| 1.11 | O que significa **auto-wait** no Playwright? | `[SLIDE]` |
| 1.12 | Por que o Playwright tende a ser menos flaky que ferramentas baseadas em WebDriver? | `[EXTRA]` |
| 1.13 | O Playwright grava vídeo, screenshot e trace automaticamente? Em quais condições? | `[SLIDE]` `[PROJETO]` |
| 1.14 | Qual a diferença entre `@playwright/test` e `playwright` (library)? | `[EXTRA]` |
| 1.15 | O Playwright é open source? Existe Playwright Test Agents / Cloud comercial? | `[EXTRA]` |
| 1.16 | Em que cenário você escolheria Playwright em vez de Cypress ou Selenium? | `[EXTRA]` |
| 1.17 | O Playwright usa WebDriver ou outro protocolo? | `[EXTRA]` |
| 1.18 | O que é um **browser context** no Playwright? | `[EXTRA]` |
| 1.19 | Qual a diferença entre `page`, `context` e `browser`? | `[EXTRA]` |
| 1.20 | O Playwright pode rodar testes sem abrir browser (API-only)? | `[SLIDE]` `[PROJETO]` |

---

## 2. Arquitetura Interna do Playwright

| # | Pergunta | Tag |
|---|----------|-----|
| 2.1 | Explique a arquitetura: Test Runner, Browser Server, Browser Context, Page. | `[EXTRA]` |
| 2.2 | O que é o **Chrome DevTools Protocol (CDP)** e como o Playwright o utiliza? | `[EXTRA]` |
| 2.3 | Por que o Playwright usa `async/await` nativamente em vez de command queue? | `[EXTRA]` |
| 2.4 | O que acontece se você esquecer `await` em `page.click()`? | `[EXTRA]` |
| 2.5 | Como funciona o isolamento entre testes paralelos (workers)? | `[SLIDE]` |
| 2.6 | O que são **workers** no Playwright Test? | `[SLIDE]` `[PROJETO]` |
| 2.7 | Qual a diferença entre execução serial e paralela (`fullyParallel`, `workers`)? | `[SLIDE]` `[PROJETO]` |
| 2.8 | O Playwright injeta código na aplicação como o Cypress? | `[EXTRA]` |
| 2.9 | Como o Playwright implementa auto-retry nas assertions? | `[SLIDE]` |
| 2.10 | O que é **strict mode** nos locators? | `[EXTRA]` |
| 2.11 | Por que `locator.click()` falha quando há dois elementos matching? | `[EXTRA]` |
| 2.12 | O que é **actionability** check antes de clicar? | `[EXTRA]` |
| 2.13 | Como o Playwright lida com navigation e race conditions? | `[EXTRA]` |
| 2.14 | O que é out-of-process browser automation vs in-browser? | `[EXTRA]` |
| 2.15 | Como funciona o mecanismo de **expect** com polling interno? | `[SLIDE]` |

---

## 3. Instalação e Configuração

| # | Pergunta | Tag |
|---|----------|-----|
| 3.1 | Quais são os pré-requisitos para instalar o Playwright? | `[SLIDE]` |
| 3.2 | Qual a diferença entre `npm init playwright@latest` e adicionar `@playwright/test` manualmente? | `[EXTRA]` |
| 3.3 | O que faz `npx playwright install` vs `playwright install chromium`? | `[SLIDE]` `[PROJETO]` |
| 3.4 | Como resolver `UNABLE_TO_GET_ISSUER_CERT_LOCALLY` em proxy corporativo (Zscaler)? | `[SLIDE]` `[PROJETO]` |
| 3.5 | Para que serve `NODE_EXTRA_CA_CERTS` vs `NODE_TLS_REJECT_UNAUTHORIZED=0`? | `[SLIDE]` `[PROJETO]` |
| 3.6 | O que é `playwright.config.ts` e quais opções são essenciais? | `[SLIDE]` `[PROJETO]` |
| 3.7 | Para que serve `baseURL` na config? | `[SLIDE]` `[PROJETO]` |
| 3.8 | Qual a função de `testDir` e `testMatch`? | `[SLIDE]` |
| 3.9 | Como configurar `viewport` global vs por teste? | `[SLIDE]` `[PROJETO]` |
| 3.10 | O que faz `timeout` global vs `expect.timeout` vs `actionTimeout`? | `[SLIDE]` `[PROJETO]` |
| 3.11 | Como configurar `retries` em CI vs local? | `[SLIDE]` `[PROJETO]` |
| 3.12 | O que faz `forbidOnly: !!process.env.CI`? | `[PROJETO]` |
| 3.13 | Como configurar `trace`, `screenshot` e `video`? | `[SLIDE]` `[PROJETO]` |
| 3.14 | O que significa `trace: 'on-first-retry'`? | `[SLIDE]` `[PROJETO]` |
| 3.15 | Como passar variáveis via `process.env` (ex.: `BASE_URL`, `DEMO_PASSWORD`)? | `[SLIDE]` `[PROJETO]` |
| 3.16 | Como configurar múltiplos ambientes (dev, staging, prod) em um único projeto? | `[SLIDE]` `[EXTRA]` |
| 3.17 | O que são **projects** no `playwright.config.ts`? | `[SLIDE]` `[PROJETO]` |
| 3.18 | Como mapear cada suite (smoke, auth, api…) a um project separado? | `[SLIDE]` `[PROJETO]` |
| 3.19 | Como configurar `globalSetup` e `globalTeardown`? | `[SLIDE]` |
| 3.20 | O que faz `PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1`? | `[SLIDE]` |
| 3.21 | Como definir browser específico por project (`use: { browserName: 'firefox' }`)? | `[EXTRA]` |
| 3.22 | Como configurar `reporter` (list, html, json, junit)? | `[SLIDE]` `[PROJETO]` |
| 3.23 | Qual a diferença entre `defineConfig` e export default manual? | `[EXTRA]` |
| 3.24 | Como usar `dotenv` para carregar `.env` no config? | `[EXTRA]` |

---

## 4. Estrutura de Projeto e Organização

| # | Pergunta | Tag |
|---|----------|-----|
| 4.1 | Descreva a estrutura do **testflow-playwright** (`pages/`, `support/`, `tests/`, `fixtures/`). | `[SLIDE]` `[PROJETO]` |
| 4.2 | Qual a diferença entre `pages/` (POM) e `support/` (helpers)? | `[SLIDE]` `[PROJETO]` |
| 4.3 | Onde colocar fixtures JSON estáticas vs factories TypeScript? | `[SLIDE]` `[PROJETO]` |
| 4.4 | Como organizar specs por feature vs por tipo (smoke, regression)? | `[SLIDE]` `[PROJETO]` |
| 4.5 | Qual convenção de nomenclatura para arquivos `.spec.ts`? | `[SLIDE]` `[PROJETO]` |
| 4.6 | Um arquivo de spec deve testar uma feature ou múltiplas? Justifique. | `[SLIDE]` `[PROJETO]` |
| 4.7 | Como separar testes API (`tests/api/`) de E2E UI? | `[SLIDE]` `[PROJETO]` |
| 4.8 | Onde colocar enums, timeouts e constantes compartilhadas? | `[SLIDE]` |
| 4.9 | Como versionar credenciais sem commitar secrets? | `[SLIDE]` `[PROJETO]` |
| 4.10 | Qual estratégia para monorepos com múltiplos frontends? | `[EXTRA]` |
| 4.11 | Como espelhar estrutura Cypress (`testflow-cypress`) em Playwright? | `[SLIDE]` `[PROJETO]` |
| 4.12 | Quando criar subpastas por área (`tests/wizard/`, `tests/layout/`)? | `[PROJETO]` |
| 4.13 | Como organizar intercept helpers vs auth helpers? | `[SLIDE]` `[PROJETO]` |
| 4.14 | O que colocar em `scripts/` (ex.: export PDF de slides)? | `[PROJETO]` |

---

## 5. Fixtures, test() e Runner

| # | Pergunta | Tag |
|---|----------|-----|
| 5.1 | O que são fixtures built-in (`page`, `context`, `browser`, `request`)? | `[SLIDE]` |
| 5.2 | Qual a diferença entre `page` fixture e `request` fixture? | `[SLIDE]` |
| 5.3 | Como criar fixture customizada com `test.extend()`? | `[SLIDE]` |
| 5.4 | Como injetar `authToken` em todo teste via fixture? | `[SLIDE]` |
| 5.5 | O que faz `test.use({ ... })` para override por arquivo/suite? | `[SLIDE]` |
| 5.6 | Como implementar `afterEach` que anexa detalhes em falha? | `[SLIDE]` |
| 5.7 | Qual a diferença entre fixture de teste e fixture JSON estática? | `[SLIDE]` `[PROJETO]` |
| 5.8 | Como passar opções tipadas para fixtures (`{ option: true }`)? | `[SLIDE]` |
| 5.9 | O que é `testInfo` e para que serve? | `[SLIDE]` |
| 5.10 | Como usar `testInfo.attach()` para anexar JSON/curl ao report? | `[SLIDE]` |
| 5.11 | Como implementar worker-scoped vs test-scoped fixtures? | `[EXTRA]` |
| 5.12 | O que acontece se uma fixture falhar no setup? | `[EXTRA]` |
| 5.13 | Como compartilhar estado entre testes de forma segura (evitar)? | `[EXTRA]` |
| 5.14 | Qual a diferença entre `test`, `test.only`, `test.skip` e `test.fixme`? | `[EXTRA]` |
| 5.15 | Como condicionar skip com `test.skip(condition, 'reason')`? | `[SLIDE]` |

---

## 6. Locators e Estratégias de Seletores

| # | Pergunta | Tag |
|---|----------|-----|
| 6.1 | Por que `data-testid` é preferível a classes CSS? | `[SLIDE]` `[PROJETO]` |
| 6.2 | Como usar `page.getByTestId('login-email')`? | `[SLIDE]` `[PROJETO]` |
| 6.3 | Qual a hierarquia recomendada: role → testid → text → CSS? | `[SLIDE]` `[EXTRA]` |
| 6.4 | Quando usar `getByRole('button', { name: 'Submit' })`? | `[SLIDE]` |
| 6.5 | Quando usar `getByText()` vs `getByLabel()`? | `[SLIDE]` |
| 6.6 | Qual a diferença entre `locator` e `page.locator('css')`? | `[EXTRA]` |
| 6.7 | Como encadear locators com `.locator()` (ex.: `tbody tr`)? | `[SLIDE]` `[PROJETO]` |
| 6.8 | Como selecionar o n-ésimo elemento com `.nth(i)`? | `[SLIDE]` `[PROJETO]` |
| 6.9 | O que é um locator "strict" e como resolver ambiguidade? | `[EXTRA]` |
| 6.10 | Como selecionar células de tabela por `data-row-id` (`cell-name-{id}`)? | `[SLIDE]` `[PROJETO]` |
| 6.11 | Como evitar seletores acoplados a texto que muda com i18n? | `[SLIDE]` `[EXTRA]` |
| 6.12 | O Playwright suporta XPath? Quando usar? | `[EXTRA]` |
| 6.13 | O que é `getByPlaceholder`, `getByAltText`, `getByTitle`? | `[EXTRA]` |
| 6.14 | Como filtrar locators com `.filter({ hasText: '...' })`? | `[EXTRA]` |
| 6.15 | Como usar `.or()` para fallback entre locators? | `[EXTRA]` |
| 6.16 | O que é um seletor brittle? Dê exemplos do TestFlow. | `[PROJETO]` |
| 6.17 | Como lidar com elementos duplicados no DOM? | `[EXTRA]` |
| 6.18 | Como configurar `testIdAttribute` se a app usa `data-cy`? | `[EXTRA]` |

---

## 7. Interações e Navegação

| # | Pergunta | Tag |
|---|----------|-----|
| 7.1 | Para que serve `page.goto(path)` com `baseURL`? | `[SLIDE]` `[PROJETO]` |
| 7.2 | Qual a diferença entre `.fill()`, `.type()` e `.pressSequentially()`? | `[SLIDE]` `[EXTRA]` |
| 7.3 | Quando usar `.clear()` antes de `.fill()`? | `[SLIDE]` `[PROJETO]` |
| 7.4 | O que faz `.click()` e quando usar `{ force: true }`? | `[SLIDE]` `[PROJETO]` |
| 7.5 | Quais os riscos de `{ force: true }`? | `[EXTRA]` |
| 7.6 | Como interagir com `<select>` usando `.selectOption()`? | `[SLIDE]` `[PROJETO]` |
| 7.7 | Como marcar checkbox/radio com `.check()` / `.uncheck()`? | `[SLIDE]` `[PROJETO]` |
| 7.8 | Quando usar `.check({ force: true })` em radios cobertos por label custom? | `[PROJETO]` |
| 7.9 | Como simular teclas com `page.keyboard.press('Enter')`? | `[SLIDE]` `[PROJETO]` |
| 7.10 | Como fechar modal com `Escape`? | `[SLIDE]` `[PROJETO]` |
| 7.11 | Para que serve `.scrollIntoViewIfNeeded()`? | `[EXTRA]` |
| 7.12 | Como usar `page.evaluate()` para sessionStorage? | `[SLIDE]` `[PROJETO]` |
| 7.13 | Como usar `page.addInitScript()` para injetar token antes do goto? | `[SLIDE]` `[PROJETO]` |
| 7.14 | Para que serve `page.reload()` após mock de rota? | `[SLIDE]` `[PROJETO]` |
| 7.15 | Como fazer upload de arquivo com `setInputFiles()`? | `[EXTRA]` |
| 7.16 | Como testar download com `page.waitForEvent('download')`? | `[EXTRA]` |
| 7.17 | Como interagir com hover usando `.hover()`? | `[EXTRA]` |
| 7.18 | Como testar drag-and-drop com `.dragTo()`? | `[EXTRA]` |
| 7.19 | Como lidar com skip link fora do viewport (`focus()` + Enter)? | `[PROJETO]` |
| 7.20 | Como abrir link em nova aba com `page.waitForEvent('popup')`? | `[EXTRA]` |
| 7.21 | Como usar `page.goBack()` e `page.goForward()`? | `[EXTRA]` |
| 7.22 | Como interagir com elementos `contenteditable`? | `[EXTRA]` |

---

## 8. Assertions, Auto-wait e Retry

| # | Pergunta | Tag |
|---|----------|-----|
| 8.1 | Qual a diferença entre assertion web (`expect(locator)`) e genérica (`expect(value)`)? | `[SLIDE]` |
| 8.2 | Quando usar `toBeVisible()` vs `toBeHidden()`? | `[SLIDE]` `[PROJETO]` |
| 8.3 | Como validar URL com `toHaveURL(/regex/)`? | `[SLIDE]` `[PROJETO]` |
| 8.4 | Como validar texto parcial com `toContainText()`? | `[SLIDE]` `[PROJETO]` |
| 8.5 | Como contar elementos com `toHaveCount(n)`? | `[SLIDE]` `[PROJETO]` |
| 8.6 | Como validar atributos com `toHaveAttribute()`? | `[SLIDE]` `[PROJETO]` |
| 8.7 | Como validar classes com `toHaveClass(/active/)`? | `[SLIDE]` `[PROJETO]` |
| 8.8 | Como usar regex em `toHaveText(/^\d+%$/)`? | `[SLIDE]` `[PROJETO]` |
| 8.9 | Como validar valor de input com `toHaveValue()`? | `[SLIDE]` `[PROJETO]` |
| 8.10 | Como validar foco com `toBeFocused()`? Quando não funciona? | `[PROJETO]` |
| 8.11 | O que faz `toBeInViewport()` e quando preferir a `toBeFocused()`? | `[PROJETO]` |
| 8.12 | O que é `expect.poll()` e quando usar? | `[SLIDE]` `[PROJETO]` |
| 8.13 | Como usar `expect.poll` para aguardar progresso async (pipeline 0% → N%)? | `[PROJETO]` |
| 8.14 | Como validar payload com `toMatchObject({ email: '...' })`? | `[SLIDE]` |
| 8.15 | Como fazer soft assertions com `expect.soft()`? | `[EXTRA]` |
| 8.16 | Por que Playwright não precisa de `wait(5000)` na maioria dos casos? | `[SLIDE]` |
| 8.17 | Quando `expect` falha, quanto tempo ele retenta? | `[SLIDE]` `[PROJETO]` |
| 8.18 | Como configurar timeout por assertion específica? | `[EXTRA]` |
| 8.19 | Como validar que elemento desapareceu após ação async? | `[SLIDE]` `[PROJETO]` |
| 8.20 | Como usar `not` em assertions (`not.toHaveURL`, `not.toBeVisible`)? | `[SLIDE]` `[PROJETO]` |

---

## 9. page.route, Mock, Spy e Network

| # | Pergunta | Tag |
|---|----------|-----|
| 9.1 | O que é `page.route()` e como substitui intercepts de outras ferramentas? | `[SLIDE]` `[PROJETO]` |
| 9.2 | Qual a diferença entre spy (observar) e mock (simular resposta)? | `[SLIDE]` |
| 9.3 | Como mockar resposta com `route.fulfill({ status, body })`? | `[SLIDE]` `[PROJETO]` |
| 9.4 | Como deixar request passar com `route.continue()`? | `[SLIDE]` `[PROJETO]` |
| 9.5 | Como simular latência antes de `route.continue()`? | `[SLIDE]` `[PROJETO]` |
| 9.6 | Como interceptar URL com regex (`/\/api\/users/`)? | `[SLIDE]` `[PROJETO]` |
| 9.7 | Como mockar erro 500 e validar UI de erro? | `[PROJETO]` |
| 9.8 | Como usar `page.waitForRequest()` para spy de POST login? | `[SLIDE]` `[PROJETO]` |
| 9.9 | Como usar `page.waitForResponse()` para validar status após clique? | `[SLIDE]` `[PROJETO]` |
| 9.10 | Como inspecionar body com `req.postDataJSON()`? | `[SLIDE]` |
| 9.11 | O que acontece se a route for registrada depois do request? | `[EXTRA]` |
| 9.12 | Como garantir ordem de múltiplas routes no mesmo fluxo? | `[EXTRA]` |
| 9.13 | Como mockar GraphQL com `page.route`? | `[EXTRA]` |
| 9.14 | Como interceptar WebSocket no Playwright? | `[EXTRA]` |
| 9.15 | Qual a diferença entre route de rede e stub de função via `evaluate`? | `[EXTRA]` |
| 9.16 | Como usar `Promise.race` entre PUT e PATCH no spy? | `[SLIDE]` |
| 9.17 | Como alterar headers no route handler? | `[EXTRA]` |
| 9.18 | Route funciona em API tests com `request` fixture? | `[EXTRA]` |
| 9.19 | Como abortar request com `route.abort()`? | `[EXTRA]` |
| 9.20 | Como testar retry de API na UI com mocks sequenciais? | `[EXTRA]` |

---

## 10. API Testing com request

| # | Pergunta | Tag |
|---|----------|-----|
| 10.1 | Qual a diferença entre testar API com `request` vs Postman/Newman? | `[SLIDE]` `[EXTRA]` |
| 10.2 | O `request` fixture passa pelo browser ou é HTTP direto? | `[SLIDE]` |
| 10.3 | Como fazer POST login e validar token na resposta? | `[SLIDE]` `[PROJETO]` |
| 10.4 | Como validar status code e shape do body em API tests? | `[SLIDE]` `[PROJETO]` |
| 10.5 | Como implementar `validateSchema(obj, schema)` para contratos REST? | `[SLIDE]` `[PROJETO]` |
| 10.6 | Como medir SLA com `Date.now()` e `toBeLessThan(ms)`? | `[SLIDE]` `[PROJETO]` |
| 10.7 | Como usar `beforeAll` para compartilhar response entre testes API? | `[SLIDE]` `[PROJETO]` |
| 10.8 | Qual a arquitetura "write API + read API" para validar persistência? | `[SLIDE]` |
| 10.9 | Como testar endpoints de erro (`/api/errors/404`, `/api/errors/422`)? | `[SLIDE]` `[PROJETO]` |
| 10.10 | Como implementar `authenticatedRequest()` com Bearer token? | `[SLIDE]` `[PROJETO]` |
| 10.11 | Como criar contexto HTTP sem Authorization para testes negativos? | `[SLIDE]` |
| 10.12 | O que é JSON Patch (RFC 6902) e `application/json-patch+json`? | `[SLIDE]` |
| 10.13 | Como testar idempotência de endpoints? | `[SLIDE]` |
| 10.14 | Como usar `Correlation-Id` para rastreabilidade? | `[SLIDE]` |
| 10.15 | Como validar contrato com JSON Schema vs golden fixtures? | `[SLIDE]` |
| 10.16 | Como testar rate limiting e headers de segurança? | `[EXTRA]` |
| 10.17 | Como testar upload multipart com `request`? | `[EXTRA]` |
| 10.18 | Como encadear criar → ler → deletar em API tests? | `[EXTRA]` |
| 10.19 | Quando API tests são suficientes sem E2E UI? | `[SLIDE]` `[EXTRA]` |
| 10.20 | Como usar `playwright.request.newContext()` isolado? | `[SLIDE]` |

---

## 11. Autenticação e Sessão

| # | Pergunta | Tag |
|---|----------|-----|
| 11.1 | Como fazer login via UI vs via API no Playwright? | `[SLIDE]` `[PROJETO]` |
| 11.2 | O que faz `loginViaApi(page, request)` no testflow-playwright? | `[SLIDE]` `[PROJETO]` |
| 11.3 | Como injetar token com `addInitScript` + sessionStorage? | `[SLIDE]` `[PROJETO]` |
| 11.4 | Qual a diferença entre `loginViaApi`, `visitAuthenticated` e `visitWithToken`? | `[PROJETO]` |
| 11.5 | O que é `storageState` e como acelera login? | `[EXTRA]` |
| 11.6 | Como gerar `storageState` uma vez e reutilizar em projects? | `[EXTRA]` |
| 11.7 | Qual a diferença entre `storageState` e `globalSetup` com cache de token? | `[SLIDE]` |
| 11.8 | Como implementar cache JWT em Map com refresh? | `[SLIDE]` |
| 11.9 | Como testar fluxos MFA/2FA? | `[EXTRA]` |
| 11.10 | Como testar SSO/OAuth (Auth0, Okta, PKCE)? | `[SLIDE]` `[EXTRA]` |
| 11.11 | Como usar diferentes perfis de usuário (admin, viewer) por suite? | `[SLIDE]` |
| 11.12 | O que acontece quando a sessão expira no meio da suíte? | `[EXTRA]` |
| 11.13 | Como bypassar auth total via `process.env.AUTH_TOKEN`? | `[SLIDE]` |
| 11.14 | Como validar sessionStorage após login UI? | `[PROJETO]` |
| 11.15 | `storageState` funciona para localStorage vs sessionStorage? | `[EXTRA]` |
| 11.16 | Como limpar cookies/storage entre testes? | `[EXTRA]` |

---

## 12. Page Object Model (POM)

| # | Pergunta | Tag |
|---|----------|-----|
| 12.1 | O que é Page Object Model e quais problemas resolve? | `[SLIDE]` |
| 12.2 | O que deve ir no Page Object: locators, actions ou assertions? | `[SLIDE]` `[PROJETO]` |
| 12.3 | Page Object deve ser classe instanciada — por quê? | `[SLIDE]` `[PROJETO]` |
| 12.4 | Como estruturar métodos que retornam `this` para fluent API? | `[SLIDE]` |
| 12.5 | Como o spec fica legível com POM + Given/When/Then? | `[SLIDE]` `[PROJETO]` |
| 12.6 | Qual a diferença entre POM (UI) e Service Objects (API)? | `[SLIDE]` |
| 12.7 | Como lidar com componentes compartilhados (ShellPage, sidebar)? | `[PROJETO]` |
| 12.8 | Como testar wizard multi-step com WizardPage? | `[PROJETO]` |
| 12.9 | Como encapsular tabela com `getTableRows()` e `getCell()`? | `[SLIDE]` `[PROJETO]` |
| 12.10 | O POM viola DRY se dois pages compartilham o mesmo modal? | `[EXTRA]` |
| 12.11 | Screenplay Pattern vs POM — quando migrar? | `[EXTRA]` |
| 12.12 | Como versionar Page Objects quando a UI muda? | `[EXTRA]` |
| 12.13 | Quais Page Objects existem no testflow-playwright? | `[PROJETO]` |
| 12.14 | Como expor locators como métodos (`emailInput()`) vs propriedades? | `[PROJETO]` |
| 12.15 | Assertions devem ficar no POM (`shouldShowStep1Error`) ou no spec? | `[PROJETO]` |

---

## 13. Fixtures JSON, Factories e Dados de Teste

| # | Pergunta | Tag |
|---|----------|-----|
| 13.1 | O que são fixtures JSON em `fixtures/`? | `[SLIDE]` `[PROJETO]` |
| 13.2 | Como importar `credentials.json` e `wizard.json` nos specs? | `[PROJETO]` |
| 13.3 | Qual a diferença entre fixture estática e factory dinâmica? | `[SLIDE]` `[PROJETO]` |
| 13.4 | Como criar `createPersonalStep()` em `support/factories/wizard.ts`? | `[PROJETO]` |
| 13.5 | Quando usar dados fixos vs Faker/random? | `[SLIDE]` `[EXTRA]` |
| 13.6 | Como evitar PII real em fixtures? | `[SLIDE]` `[EXTRA]` |
| 13.7 | Como combinar fixture + route mock? | `[SLIDE]` `[PROJETO]` |
| 13.8 | Como resetar estado de dados entre testes? | `[SLIDE]` `[EXTRA]` |
| 13.9 | Como lidar com dados compartilhados que causam dependência entre testes? | `[EXTRA]` |
| 13.10 | Como organizar fixtures por domínio (`team-member.json`)? | `[SLIDE]` `[PROJETO]` |
| 13.11 | Como usar golden fixtures para contratos API? | `[SLIDE]` |
| 13.12 | O que faz `withoutId()` para ignorar campos dinâmicos? | `[SLIDE]` |

---

## 14. Organização de Specs e test.step

| # | Pergunta | Tag |
|---|----------|-----|
| 14.1 | Como estruturar `test.describe` aninhados por feature? | `[SLIDE]` `[PROJETO]` |
| 14.2 | Quando usar `beforeEach` vs `beforeAll`? | `[SLIDE]` `[PROJETO]` |
| 14.3 | Por que `beforeAll` é útil em API tests com response compartilhada? | `[SLIDE]` `[PROJETO]` |
| 14.4 | Como gerar testes data-driven com `for...of` sobre array? | `[SLIDE]` `[PROJETO]` |
| 14.5 | Como parametrizar smoke de todas as rotas (PAGES array)? | `[SLIDE]` `[PROJETO]` |
| 14.6 | O que é `test.step()` e como melhora o HTML report? | `[SLIDE]` `[PROJETO]` |
| 14.7 | Qual a diferença entre `test.step` e comentários Given/When/Then? | `[PROJETO]` |
| 14.8 | Como configurar timeout por suite (`test.describe.configure`)? | `[PROJETO]` |
| 14.9 | O que faz `test.describe.configure({ mode: 'serial' })`? | `[SLIDE]` |
| 14.10 | Quando usar modo serial vs paralelo? | `[SLIDE]` `[EXTRA]` |
| 14.11 | Um cenário por `test()` — por que essa regra? | `[SLIDE]` `[PROJETO]` |
| 14.12 | Como nomear testes de forma rastreável (`[TC-0001]`)? | `[SLIDE]` |
| 14.13 | Como usar tags nativas (`{ tag: '@smoke' }`)? | `[SLIDE]` |
| 14.14 | Como filtrar com `--grep` e `--grep-invert`? | `[SLIDE]` |

---

## 15. Shadow DOM, Iframe e Casos Especiais

| # | Pergunta | Tag |
|---|----------|-----|
| 15.1 | Como acessar Shadow DOM no Playwright? | `[PROJETO]` |
| 15.2 | Por que `page.evaluate` + `shadowRoot` é comum para Web Components? | `[PROJETO]` |
| 15.3 | O Playwright pierce Shadow DOM automaticamente com locators? | `[EXTRA]` |
| 15.4 | Como usar `locator.locator(':scope >>> selector')`? | `[EXTRA]` |
| 15.5 | Como testar iframe com `frameLocator()`? | `[EXTRA]` |
| 15.6 | Como validar atributo `src` e `title` de iframe? | `[PROJETO]` |
| 15.7 | Como testar link externo com `target="_blank"`? | `[PROJETO]` |
| 15.8 | Por que validar `rel="noopener"` em links externos? | `[PROJETO]` |
| 15.9 | Como testar canvas, charts (Chart.js, D3)? | `[EXTRA]` |
| 15.10 | Como testar editores rich text (TinyMCE, Quill)? | `[EXTRA]` |
| 15.11 | Como testar date pickers de terceiros? | `[EXTRA]` |
| 15.12 | Como testar infinite scroll e lazy loading? | `[EXTRA]` |
| 15.13 | Como testar SSR (Next.js, Nuxt)? | `[EXTRA]` |
| 15.14 | Como lidar com CAPTCHA em E2E? | `[EXTRA]` |
| 15.15 | Como testar Web Workers? | `[EXTRA]` |
| 15.16 | Como testar aplicações com Service Workers / PWA? | `[EXTRA]` |

---

## 16. UI States, Wizard, Activity e Shell

| # | Pergunta | Tag |
|---|----------|-----|
| 16.1 | Como testar estados skeleton, empty, error e success? | `[PROJETO]` |
| 16.2 | Como validar que empty state some após limpar busca? | `[PROJETO]` |
| 16.3 | Como testar loading parcial (partial loading)? | `[PROJETO]` |
| 16.4 | Como testar wizard multi-step com validação por etapa? | `[PROJETO]` |
| 16.5 | Como verificar preservação de dados ao voltar step no wizard? | `[PROJETO]` |
| 16.6 | Como testar review step com dados preenchidos? | `[PROJETO]` |
| 16.7 | Como testar restart/reset do wizard? | `[PROJETO]` |
| 16.8 | Como testar fetch API via botão na UI (activity page)? | `[PROJETO]` |
| 16.9 | Como testar counter increment/decrement/reset? | `[PROJETO]` |
| 16.10 | Como testar pipeline async com progress bar? | `[PROJETO]` |
| 16.11 | Como testar conteúdo dinâmico carregado após delay? | `[PROJETO]` |
| 16.12 | Como testar navegação da sidebar (8 rotas) data-driven? | `[PROJETO]` |
| 16.13 | Como testar dropdown de notificações e badge count? | `[PROJETO]` |
| 16.14 | Como testar "mark all read" quando badge some? | `[PROJETO]` |
| 16.15 | Como testar skip link e `#main-content` in viewport? | `[PROJETO]` |
| 16.16 | Como testar landmarks (sidebar, topbar, breadcrumb)? | `[PROJETO]` |
| 16.17 | Como testar highlight de nav item ativo (`.active`)? | `[PROJETO]` |
| 16.18 | Como testar modal new run no dashboard? | `[PROJETO]` |
| 16.19 | Como testar inline edit e invite modal no team? | `[PROJETO]` |
| 16.20 | Como testar toggles de settings (push notifications)? | `[PROJETO]` |

---

## 17. Component Testing

| # | Pergunta | Tag |
|---|----------|-----|
| 17.1 | O Playwright suporta Component Testing? Como difere de E2E? | `[EXTRA]` |
| 17.2 | Como configurar CT para React/Vue/Svelte? | `[EXTRA]` |
| 17.3 | O que faz `mount(<Component />)` no Playwright CT? | `[EXTRA]` |
| 17.4 | Como injetar providers (theme, Redux) no mount? | `[EXTRA]` |
| 17.5 | Quando Component Test substitui E2E? | `[EXTRA]` |
| 17.6 | Component tests rodam mais rápido — quantifique o ganho. | `[EXTRA]` |
| 17.7 | Como mockar API em component test? | `[EXTRA]` |
| 17.8 | Playwright CT vs Testing Library + Vitest — prós e contras? | `[EXTRA]` |
| 17.9 | Como integrar CT com Storybook? | `[EXTRA]` |
| 17.10 | O testflow-playwright tem component tests hoje? | `[PROJETO]` |

---

## 18. Trace, Debug, UI Mode e Inspector

| # | Pergunta | Tag |
|---|----------|-----|
| 18.1 | O que é Playwright **UI Mode**? | `[SLIDE]` `[PROJETO]` |
| 18.2 | Como abrir UI Mode com `npm run test:ui`? | `[PROJETO]` |
| 18.3 | O que é **Trace Viewer** e como abrir trace de falha? | `[SLIDE]` |
| 18.4 | O que você vê no trace (network, snapshots, actions)? | `[EXTRA]` |
| 18.5 | Como usar `--debug` para pausar no Inspector? | `[EXTRA]` |
| 18.6 | Como usar `page.pause()` durante desenvolvimento? | `[EXTRA]` |
| 18.7 | Qual a diferença entre headed, headless e UI mode? | `[SLIDE]` `[PROJETO]` |
| 18.8 | Como debugar teste que passa headed mas falha headless? | `[EXTRA]` |
| 18.9 | Como usar `show-report` para HTML report local? | `[PROJETO]` |
| 18.10 | Como usar Playwright VS Code extension (record, pick locator)? | `[EXTRA]` |
| 18.11 | O que é codegen (`playwright codegen`)? | `[EXTRA]` |
| 18.12 | Quando codegen ajuda vs atrapalha (testes frágeis)? | `[EXTRA]` |

---

## 19. Multi-ambiente, CI/CD e Projects

| # | Pergunta | Tag |
|---|----------|-----|
| 19.1 | Como rodar project específico (`--project=smoke`)? | `[SLIDE]` `[PROJETO]` |
| 19.2 | Como o CI executa a suite completa em um job único (`npm test`)? | `[SLIDE]` `[PROJETO]` |
| 19.3 | Como configurar GitHub Actions com cache e artifacts? | `[SLIDE]` `[PROJETO]` |
| 19.4 | O que publicar como artifact em falha (report, test-results)? | `[SLIDE]` `[PROJETO]` |
| 19.5 | Como rodar Playwright com Docker service (TestFlow container)? | `[PROJETO]` |
| 19.6 | Como configurar health check antes dos testes (`curl /health`)? | `[PROJETO]` |
| 19.7 | Como passar secrets do CI (`DEMO_PASSWORD`) sem expor em logs? | `[SLIDE]` `[PROJETO]` |
| 19.8 | Como executar smoke vs regression em pipelines diferentes? | `[SLIDE]` `[EXTRA]` |
| 19.9 | Como usar `concurrency` para cancelar runs duplicados? | `[PROJETO]` |
| 19.10 | Por que `workers: 1` no CI em alguns projetos? | `[PROJETO]` |
| 19.11 | Como rodar testes contra ambiente remoto (`BASE_URL`)? | `[SLIDE]` |
| 19.12 | Como integrar com GitLab CI / Azure DevOps / Jenkins? | `[EXTRA]` |
| 19.13 | Qual estratégia de gate: bloquear merge se smoke falhar? | `[EXTRA]` |
| 19.14 | Como usar sharding (`--shard=1/4`) para paralelismo horizontal? | `[EXTRA]` |
| 19.15 | Como estruturar jobs `test` → `publish` → `deploy` no GitHub Pages? | `[PROJETO]` |
| 19.16 | Quando usar sharding ou matrix em vez de um job único? | `[PROJETO]` |
| 19.17 | Como instalar browsers com deps no Ubuntu CI (`--with-deps`)? | `[PROJETO]` |

---

## 20. Relatórios, Tags e Observabilidade

| # | Pergunta | Tag |
|---|----------|-----|
| 20.1 | Quais reporters o testflow-playwright usa (list, html, json)? | `[PROJETO]` |
| 20.2 | Qual a diferença entre report HTML e JSON no CI? | `[SLIDE]` |
| 20.3 | O que faz `test.step` no relatório HTML? | `[SLIDE]` `[PROJETO]` |
| 20.4 | Como filtrar specs por tags com `--grep '@smoke'`? | `[SLIDE]` |
| 20.5 | Como combinar tags (`@smoke` + `@critical`)? | `[EXTRA]` |
| 20.6 | Como integrar resultados com Jira/Xray ou TestRail? | `[EXTRA]` |
| 20.7 | Como anexar curl reproduzível ao report (`testInfo.attach`)? | `[SLIDE]` |
| 20.8 | Como adicionar contexto customizado (build ID, ambiente)? | `[EXTRA]` |
| 20.9 | Como medir duração e identificar testes mais lentos? | `[EXTRA]` |
| 20.10 | Como configurar notificação Slack/Teams em falha? | `[EXTRA]` |
| 20.11 | O que é `attachHttpExchangeReport`? | `[SLIDE]` |
| 20.12 | Como mascarar Authorization e passwords nos attachments? | `[SLIDE]` |

---

## 21. Flakiness, Debugging e Estabilidade

| # | Pergunta | Tag |
|---|----------|-----|
| 21.1 | O que é test flakiness e por que E2E é suscetível? | `[EXTRA]` |
| 21.2 | Quais causas comuns de flaky no Playwright? | `[EXTRA]` |
| 21.3 | Por que evitar `page.waitForTimeout(5000)`? | `[EXTRA]` |
| 21.4 | O que usar no lugar de wait fixo? | `[SLIDE]` `[PROJETO]` |
| 21.5 | Como debugar "element is outside of viewport"? | `[PROJETO]` |
| 21.6 | Como debugar "strict mode violation: resolved to 2 elements"? | `[EXTRA]` |
| 21.7 | Como isolar teste flaky com `test.only` (e remover depois)? | `[EXTRA]` |
| 21.8 | Como `retries: 2` no CI ajuda vs mascara bugs? | `[SLIDE]` `[PROJETO]` |
| 21.9 | Como lidar com race condition entre UI e API? | `[SLIDE]` `[PROJETO]` |
| 21.10 | Como estabilizar testes dependentes de data/hora? | `[EXTRA]` |
| 21.11 | Como investigar "element was detached from DOM"? | `[EXTRA]` |
| 21.12 | Como usar trace on-first-retry para diagnóstico? | `[PROJETO]` |
| 21.13 | Qual estratégia quando 10% da suíte é flaky antes de release? | `[EXTRA]` |
| 21.14 | Como `expect.poll` reduz flakiness em estados async? | `[PROJETO]` |
| 21.15 | Como lidar com animações que impedem click? | `[EXTRA]` |

---

## 22. Acessibilidade e Qualidade

| # | Pergunta | Tag |
|---|----------|-----|
| 22.1 | Como integrar `@axe-core/playwright` para a11y? | `[EXTRA]` |
| 22.2 | Quando rodar scan a11y — todo teste ou smoke dedicado? | `[EXTRA]` |
| 22.3 | Como testar navegação por teclado (Tab, Enter, Escape)? | `[SLIDE]` `[PROJETO]` |
| 22.4 | Como validar skip link e foco em `#main-content`? | `[PROJETO]` |
| 22.5 | Como validar roles ARIA e labels? | `[SLIDE]` |
| 22.6 | Qual a diferença entre teste funcional e a11y automatizado? | `[EXTRA]` |
| 22.7 | O que o axe não detecta? | `[EXTRA]` |
| 22.8 | Como configurar regras axe para falsos positivos? | `[EXTRA]` |
| 22.9 | Como incluir a11y no Definition of Done? | `[EXTRA]` |
| 22.10 | Por que `toBeInViewport` pode ser melhor que `toBeFocused` para skip links? | `[PROJETO]` |

---

## 23. Comparações e Migração Cypress → Playwright

| # | Pergunta | Tag |
|---|----------|-----|
| 23.1 | Playwright vs Selenium WebDriver — prós e contras? | `[EXTRA]` |
| 23.2 | Playwright vs Cypress — quando cada um é melhor? | `[SLIDE]` `[EXTRA]` |
| 23.3 | Por que empresas migram de Cypress para Playwright? | `[EXTRA]` |
| 23.4 | Qual o equivalente a `cy.intercept` no Playwright? | `[SLIDE]` |
| 23.5 | Qual o equivalente a `cy.session` no Playwright? | `[SLIDE]` |
| 23.6 | Qual o equivalente a `cy.request` no Playwright? | `[SLIDE]` |
| 23.7 | Qual o equivalente a `cy.get('[data-cy=…]')` no Playwright? | `[SLIDE]` `[PROJETO]` |
| 23.8 | Como migrar `cy.wrap().as('alias')` para Playwright? | `[EXTRA]` |
| 23.9 | Como migrar `beforeEach` + `restoreLocalStorage` para Playwright? | `[SLIDE]` |
| 23.10 | É possível usar Cypress e Playwright no mesmo repo? | `[EXTRA]` |
| 23.11 | Como mapear projects Cypress (`cy:run:team`) para npm scripts Playwright? | `[PROJETO]` |
| 23.12 | O que muda na mentalidade: command queue vs async/await? | `[EXTRA]` |
| 23.13 | Playwright vs TestCafe / WebdriverIO? | `[EXTRA]` |
| 23.14 | Como migrar coleção Postman para Playwright API tests? | `[SLIDE]` |
| 23.15 | Como migrar Service Objects Cypress para helpers Playwright? | `[SLIDE]` |

---

## 24. Padrões Enterprise e API Avançada

| # | Pergunta | Tag |
|---|----------|-----|
| 24.1 | O que é `EXPECT` constant object para status codes? | `[SLIDE]` |
| 24.2 | Como centralizar paths em `core/routes.ts`? | `[SLIDE]` |
| 24.3 | O que faz `attachHttpExchangeReport` com curl replay? | `[SLIDE]` |
| 24.4 | Como implementar `runPatchTests()` data-driven? | `[SLIDE]` |
| 24.5 | Como fazer poll GET após PATCH (eventual consistency)? | `[SLIDE]` |
| 24.6 | Como validar sync dual write + read entre dois serviços? | `[SLIDE]` |
| 24.7 | O que são golden fixtures e `expectSameMembers()`? | `[SLIDE]` |
| 24.8 | Como gerar diff legível em falha de `toMatchObject`? | `[SLIDE]` |
| 24.9 | Como implementar headers de contexto (`Correlation-Id`, `X-Profile-Context`)? | `[SLIDE]` |
| 24.10 | Como usar `test-users.json` com communities diferentes? | `[SLIDE]` |
| 24.11 | Como validar JWT com `isTokenValid(token, claims)`? | `[SLIDE]` |
| 24.12 | Como fazer env diagnostics spec no CI? | `[SLIDE]` |
| 24.13 | Como aplicar pirâmide de testes com Playwright? | `[EXTRA]` |
| 24.14 | Como decidir o que automatizar primeiro (risk-based)? | `[EXTRA]` |
| 24.15 | Como testar feature flags em E2E? | `[EXTRA]` |
| 24.16 | Como estruturar suíte com 500+ specs? | `[EXTRA]` |
| 24.17 | Como fazer visual regression (Percy, Argos)? | `[EXTRA]` |
| 24.18 | Como testar microfrontends com Playwright? | `[EXTRA]` |
| 24.19 | Como lidar com multi-tenant em E2E? | `[EXTRA]` |
| 24.20 | Como implementar contract testing (Pact) além de API tests? | `[EXTRA]` |

---

## 25. Segurança e Boas Práticas

| # | Pergunta | Tag |
|---|----------|-----|
| 25.1 | Como evitar expor senhas nos logs e reports? | `[SLIDE]` |
| 25.2 | Como gerenciar secrets em CI (GitHub Secrets, Vault)? | `[SLIDE]` `[PROJETO]` |
| 25.3 | É seguro rodar E2E contra produção? | `[EXTRA]` |
| 25.4 | Como sanitizar fixtures para não conter PII real? | `[SLIDE]` |
| 25.5 | Como mascarar Bearer token em attachments? | `[SLIDE]` |
| 25.6 | Quais dados nunca commitar (`.env`, tokens)? | `[EXTRA]` |
| 25.7 | Como auditar dependências `@playwright/test` por CVEs? | `[EXTRA]` |
| 25.8 | Por que validar `rel=noopener` em links externos? | `[PROJETO]` |
| 25.9 | Como evitar `{ force: true }` como muleta? | `[EXTRA]` |
| 25.10 | Quais anti-patterns você evita em Page Objects? | `[EXTRA]` |

---

## 26. Cenários Comportamentais e Situação-Problema

> Perguntas abertas frequentes em entrevistas sênior/lead — sem resposta única.

| # | Cenário |
|---|---------|
| 26.1 | Um teste de login passa localmente mas falha no CI com timeout em `getByTestId('login-submit')`. Como você investiga? |
| 26.2 | O time quer rodar 300 E2E em 15 minutos. Qual sua estratégia com Playwright? |
| 26.3 | O frontend migrou de REST para GraphQL. Como adaptar os testes Playwright existentes? |
| 26.4 | Um dev removeu todos os `data-testid`. Como você reage? |
| 26.5 | Testes dependem de estado criado por outro módulo. Como refatorar para isolamento? |
| 26.6 | O PO pede cobertura E2E de 100%. Como negociar escopo? |
| 26.7 | Você herda suíte Playwright com 40% flakiness. Primeiros 30 dias? |
| 26.8 | Como testar pagamento Stripe sem cobrança real? |
| 26.9 | Como validar PATCH assíncrono se read API demora até 30s? |
| 26.10 | Dois QAs criaram POMs duplicados para o mesmo modal. Como padronizar? |
| 26.11 | CI quebrou: Playwright não alcança app em `localhost:5050`. Como corrigir? |
| 26.12 | Como migrar 150 specs Cypress para Playwright incrementalmente? |
| 26.13 | Wizard com 12 steps é difícil de manter. Como simplificar? |
| 26.14 | Como testar perda de rede no meio do fluxo? |
| 26.15 | Mock de API está mascarando bug real. Como equilibrar mock vs integração? |
| 26.16 | App white-label com múltiplos clientes — como estruturar tests? |
| 26.17 | Mesmo spec em 3 idiomas (pt, en, es). Qual abordagem? |
| 26.18 | Badge de notificação some após "mark all read" — como assertar sem flaky? |
| 26.19 | Skip link está off-screen e click falha. Qual estratégia de teste a11y? |
| 26.20 | Chromium não encontrado no UI Mode após install. Como resolver? |
| 26.21 | Proxy Zscaler bloqueia download de browsers. O que fazer? |
| 26.22 | Como introduzir `expect.poll` em suite legada cheia de `waitForTimeout`? |
| 26.23 | Matrix CI com 12 projects — quando usar sharding vs mais jobs? |
| 26.24 | Activity test navega para outra página após ação — assert correto? |
| 26.25 | Como documentar convenções Playwright para onboarding de QAs? |

---

## 27. Perguntas de Recrutador / Screening

> Perguntas iniciais de triagem — recrutadores e tech recruiters.

| # | Pergunta |
|---|----------|
| 27.1 | Você já trabalhou com Playwright? Em qual versão e contexto (E2E, API)? |
| 27.2 | Quantos anos de experiência com automação de testes você tem? |
| 27.3 | Qual foi o maior projeto de automação que participou (specs, time)? |
| 27.4 | Já integrou Playwright em CI/CD? Qual ferramenta? |
| 27.5 | Conhece Page Object Model? Já implementou do zero? |
| 27.6 | Qual a diferença entre QA manual e SDET na sua visão? |
| 27.7 | Você programa em TypeScript/JavaScript? Qual nível (1–5)? |
| 27.8 | Já usou mock de rede (`page.route`) em testes? |
| 27.9 | Já escreveu testes de API com Playwright ou Postman? |
| 27.10 | Conhece Trace Viewer e UI Mode? |
| 27.11 | Como lida com testes instáveis (flaky)? |
| 27.12 | Já trabalhou com BDD (Cucumber/Gherkin)? |
| 27.13 | Tem experiência com Docker em testes (app containerizado)? |
| 27.14 | Já usou relatório HTML do Playwright ou Allure/JUnit? |
| 27.15 | Qual ferramenta domina além do Playwright (Cypress, Selenium)? |
| 27.16 | Já migrou suite de Cypress para Playwright (ou vice-versa)? |
| 27.17 | Já mentorou QAs em automação? |
| 27.18 | Acompanha changelog do Playwright (GitHub, blog Microsoft)? |
| 27.19 | Tem certificação ou curso (CTFL, Test Automation University)? |
| 27.20 | Por que Playwright nesta vaga especificamente? |
| 27.21 | Conhece `async/await` e Promises em JavaScript? |
| 27.22 | Já trabalhou com GitHub Actions ou pipelines similares? |
| 27.23 | Confortável em code review de testes automatizados? |
| 27.24 | Já usou `data-testid` convencionado com devs frontend? |
| 27.25 | Disponibilidade para pair programming com desenvolvedores? |

---

## Mapa rápido — testflow-playwright

| Project | Spec | Tópicos para entrevista |
|---------|------|-------------------------|
| `smoke` | `navigation.spec.ts` | Data-driven pages, health API, token smoke |
| `auth` | `login.spec.ts` | UI login, sessionStorage, validação, Enter key |
| `dashboard` | `dashboard.spec.ts` | KPIs regex, activity feed, new run modal |
| `team` | `team.spec.ts` | Tabela, search, filter, pagination, invite, inline edit |
| `settings` | `settings.spec.ts` | Form, toggles, save feedback |
| `components` | `components.spec.ts` | Toast, tabs, accordion, modal a11y |
| `widgets` | `widgets.spec.ts` | Select2, SweetAlert2, dragenter, iframes, new tab |
| `a11y` | `a11y.spec.ts` | axe-core, scope por página, modal aberto |
| `visual` | `visual.spec.ts` | toHaveScreenshot baselines |
| `setup` | `auth.setup.ts` | storageState, session.json, project dependencies |
| `smoke-firefox` / `smoke-webkit` | `navigation.spec.ts` | Cross-browser smoke |
| `api` | `api/*.spec.ts` | REST, golden roles, runPatchTests(), expectSameMembers |
| `wizard` | `wizard/wizard.spec.ts` | Multi-step, validação, review, factory |
| `activity` | `activity/activity.spec.ts` | route mock, expect.poll, countries fixture |
| `advanced` | `advanced/advanced.spec.ts` | Shadow DOM, iframe, external links |
| `states` | `states/states.spec.ts` | Skeleton, empty, error, partial loading |
| `layout` | `layout/shell.spec.ts` | Sidebar nav, notifications, skip link, landmarks |

---

## Estatísticas

| Métrica | Valor |
|---------|-------|
| Total de perguntas | **320+** |
| Cobertas nos slides `[SLIDE]` | ~140 |
| Presentes no projeto `[PROJETO]` | ~80 |
| Complementares `[EXTRA]` | ~100 |
| Cenários situacionais | 25 |
| Perguntas de screening | 25 |

---

## Como usar este material

1. **Preparação para entrevista:** escolha 3–5 categorias alinhadas à vaga (ex.: locators + route + CI + migração Cypress).
2. **Mock interview:** sorteie 10 perguntas de categorias diferentes + 1 cenário situacional.
3. **Gap analysis:** marque `[ ]` nas perguntas que não sabe responder e estude nos slides ou na doc oficial.
4. **Evolução dos slides:** perguntas `[EXTRA]` e `[PROJETO]` sem slide são candidatas a novos tópicos na apresentação.
5. **Pair com a suíte:** rode `npm run test:<project>` e relate cada pergunta `[PROJETO]` ao spec correspondente.

---

## Referências sugeridas para estudo

- [Documentação oficial Playwright](https://playwright.dev/docs/intro)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Playwright API Testing](https://playwright.dev/docs/api-testing)
- [Trace Viewer](https://playwright.dev/docs/trace-viewer)
- [Migrating from Cypress (guia community)](https://playwright.dev/docs/ci-intro)
- Slides do projeto: `docs/slides/index.html`
- Espelho Cypress: `testflow-cypress` + `docs/cypress-technical-interview-questions.md`
- Suíte local: `README.md`, `playwright.config.ts`, `pages/`, `tests/`

---

*Gerado para o projeto TestFlow Playwright — Junho 2026*
