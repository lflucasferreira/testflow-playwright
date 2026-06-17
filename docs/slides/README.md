# Playwright — Slides

Apresentação Reveal.js sobre Playwright (E2E, API, POM, testflow-playwright).

## Arquivos

| Arquivo | Descrição |
|---------|-----------|
| `index.html` | Apresentação interativa (Reveal.js) |
| `guia-completo.html` | Guia passo a passo em português (instalação + todos os comandos) |
| `complete-guide.html` | Step-by-step guide in English (setup + all commands) |
| `playwright-intro-slides.pdf` | Versão PDF (~58 slides) |
| `css/theme-playwright.css` | Tema visual Playwright |
| `assets/playwright-logo.svg` | Logo |

## Other materials

Training walkthroughs (block-by-block per spec): [`docs/`](../) · [English](../en/README.md) · [Português](../pt/README.md)

## Visualizar no browser

```bash
npm run slides
# http://localhost:3335/docs/slides/                        ← slides Reveal.js
# http://localhost:3335/docs/slides/guia-completo.html      ← guia PT
# http://localhost:3335/docs/slides/complete-guide.html     ← guide EN
```

Abrir direto:

```bash
npm run slides:open
```

## Regenerar PDF

```bash
npm run slides:pdf
```

Gera `docs/slides/playwright-intro-slides.pdf` via [decktape](https://github.com/astefanutti/decktape) (1280×720, todos os fragments visíveis).

## Export manual (Chrome)

1. Abra `http://localhost:3335/docs/slides/?print-pdf`
2. `Cmd+P` → Destino: **Salvar como PDF**
3. Layout: **Paisagem**, Margens: **Nenhuma**, **Gráficos de fundo** ativado
