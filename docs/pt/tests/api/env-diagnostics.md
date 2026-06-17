# CI — Diagnóstico de ambiente

**Arquivo fonte:** [`env-diagnostics.spec.ts`](../../../../tests/api/env-diagnostics.spec.ts)

---

## Objetivo

Esta suite leve valida **pré-requisitos de CI/CD** antes da suite completa rodar. Verifica:

1. Variáveis de ambiente de credenciais demo estão configuradas
2. `BASE_URL` resolve para uma URL HTTP(S) válida
3. Endpoint de health do TestFlow está acessível

Falha rápido em pipelines quando o ambiente está mal configurado, economizando tempo em falhas downstream.

---

## Pré-requisitos

| Item | Detalhe |
|------|---------|
| **TestFlow** | Idealmente rodando em `http://localhost:5050` (ou `BASE_URL` configurado) |
| **Ambiente** | `DEMO_EMAIL`, `DEMO_PASSWORD`, `BASE_URL` opcional |
| **Execução** | `npm run test:api` (incluído no projeto `api`) |

---

## Tags utilizadas

| Tag | Onde aparece | Significado |
|-----|--------------|-------------|
| `@api` | `test.describe` de nível superior | Roda com projeto API; grep-friendly |

---

## Conceitos do Playwright

| Conceito | Uso neste arquivo |
|----------|-------------------|
| **Fixtures customizadas** | Importa `test` de [`fixtures.ts`](../../../../fixtures.ts) |
| **`test.step`** | Rotula sub-ações nos testes de diagnóstico |
| **`process.env.BASE_URL`** | Lê override opcional de URL |
| [`DEMO_EMAIL`, `DEMO_PASSWORD`](../../../../support/helpers.ts) | Resolvidos do ambiente |
| **Fixture `request`** | Verifica `/health` sem browser |

---

## Passo a passo — bloco a bloco

### Bloco 1 — Credenciais demo

```typescript
import { test, expect } from '../../fixtures'
import { DEMO_EMAIL, DEMO_PASSWORD } from '../../support/helpers'

test.describe('CI — environment diagnostics', { tag: '@api' }, () => {
  test('demo credentials env vars are configured', async () => {
    await test.step('Validate demo credentials', async () => {
      expect(DEMO_EMAIL, 'DEMO_EMAIL').toBeTruthy()
      expect(DEMO_PASSWORD, 'DEMO_PASSWORD').toBeTruthy()
    })
  })
```

- **Dado:** o runner CI ou shell local tem variáveis de ambiente definidas.
- **Quando:** `DEMO_EMAIL` e `DEMO_PASSWORD` são lidos dos helpers.
- **Então:** ambos são strings não vazias (mensagem customizada do expect ajuda no debug).

---

### Bloco 2 — Validação de BASE_URL

```typescript
  test('BASE_URL resolves to TestFlow default or override', async () => {
    const baseUrl = process.env.BASE_URL ?? 'http://localhost:5050'
    expect(baseUrl).toMatch(/^https?:\/\//)
  })
```

- **Dado:** variável de ambiente `BASE_URL` opcional ou localhost padrão.
- **Quando:** a string de URL é inspecionada.
- **Então:** começa com `http://` ou `https://` — captura typos como scheme ausente.

---

### Bloco 3 — Endpoint de health

```typescript
  test('TestFlow health endpoint is reachable', async ({ request }) => {
    await test.step('GET /health', async () => {
      const response = await request.get('/health')
      expect(response.status()).toBe(200)
    })
  })
})
```

- **Dado:** `baseURL` do Playwright config aponta para o TestFlow.
- **Quando:** `GET /health` é executado via fixture `request`.
- **Então:** status é 200 — confirma que o app está no ar antes de suites mais pesadas.

---

## Como executar

```bash
# Roda com todos os specs de API
npm run test:api

# Apenas este arquivo
npx playwright test tests/api/env-diagnostics.spec.ts

# Com BASE_URL explícito
BASE_URL=http://localhost:5050 npx playwright test tests/api/env-diagnostics.spec.ts
```

---

## Referências relacionadas

- Playwright config: [`playwright.config.ts`](../../../../playwright.config.ts)
- Global setup (cache de auth): [`globalSetup.ts`](../../../../globalSetup.ts)
- Health check smoke: [`tests/smoke/navigation.spec.ts`](../../../../tests/smoke/navigation.spec.ts)
