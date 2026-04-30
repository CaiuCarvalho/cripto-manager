# Handoff: AgonCripto — Portfolio Tracker de Cripto

## Overview

AgonCripto é um portfolio tracker pessoal para criptoativos. O usuário registra transações (compra/venda) em diferentes corretoras e o app mostra:
- Patrimônio total e P&L (realizado + não realizado)
- Performance histórica do portfólio (gráfico interativo)
- Posições atuais com preço médio, P&L por ativo e sparkline 7d
- Alocação percentual entre ativos (donut)
- Histórico de transações
- Mercado de criptoativos para acompanhamento e comparação

Público-alvo: investidor pessoa física intermediário (BR).

---

## About the Design Files

Os arquivos neste bundle são **referências de design criadas em HTML/React** — protótipos clicáveis demonstrando aparência e comportamento pretendidos, **não código de produção para copiar diretamente**.

A tarefa é **recriar esses designs no ambiente do codebase alvo** (React/Next.js, Vue, SwiftUI, etc.), usando os padrões, bibliotecas e design system já estabelecidos no projeto. Se ainda não houver um ambiente, escolha a stack mais apropriada (recomendação: Next.js + Tailwind + shadcn/ui ou similar) e implemente lá.

Os HTMLs usam React 18 via Babel standalone com inline JSX e CSS variables — isso é apropriado para prototipagem, mas **não para produção**. No codebase real:
- Use componentes idiomáticos da stack
- Substitua dados mock por chamadas de API reais (CoinGecko, Binance, etc.)
- Use o sistema de tema do framework (Tailwind config, CSS modules, styled-components, etc.)

---

## Fidelity

**Alta fidelidade (hifi).** As cores, tipografia, espaçamentos, bordas, sombras e estados estão definidos com precisão. Recrie pixel-perfect usando as bibliotecas do codebase. Os valores numéricos exibidos são placeholders plausíveis — substitua por dados reais.

---

## Telas / Views

### 1. Shell (App Layout)

Layout fixo de duas colunas em desktop:

- **Sidebar fixa à esquerda** — 232px de largura, altura total da viewport, `border-right: 1px solid var(--border-soft)`, padding `20px 14px`.
- **Área principal à direita** — flex 1, com TopBar fixa e área de conteúdo scrollável abaixo.

#### Sidebar
- **Logo** (topo): dois círculos sobrepostos formando um "A" (SVG inline, 22×22), label "AgonCripto" em 15px/600 + sublinha "PORTFOLIO" em 10px uppercase tracking 0.06em cor `--fg-mute`.
- **Botão CTA "Nova transação"** — full width, height 34px, `background: var(--fg)`, `color: var(--bg)`, border-radius 8px, ícone "+" 14×14 + texto 13px/500.
- **Seção "Menu"** — heading 10px uppercase tracking 0.08em, depois 5 itens de navegação:
  - Dashboard, Meus ativos, Transações, Mercado, Alertas
  - Cada item: height 34px, padding `8px 10px`, gap 11px (ícone + texto), font 13px
  - Estado ativo: `background: var(--surface-2)`, ícone na cor `--accent`, texto 500 weight
  - Hover: `background: var(--surface-2)` mais sutil
- **Toggle de privacidade** (rodapé, antes do user chip): borda 1px, padding 10px, ícone olho/olho-cortado 14×14, texto "Esconder saldo" / "Mostrar saldo" 12px.
- **User chip** (rodapé): avatar 28×28 quadrado com border-radius 8 e iniciais em `--font-mono`, nome 12px/500, plano 10px `--fg-mute`. Separador `border-top: 1px solid var(--border-soft)` acima.

#### TopBar
- Padding `24px 32px 18px`, border-bottom 1px.
- Esquerda: subtítulo 11px uppercase tracking 0.06em + título 22px/600 letter-spacing -0.02em.
- Direita: campo de busca fake (largura 220px+, height ~30, ícone lupa 13×13, texto "Buscar ativo, transação…" 12px, atalho `⌘K` num pill 10px) + botão de notificação 34×34 ícone sino.

---

### 2. Dashboard

Coluna única scrollável, padding `24px 32px 64px`, gap entre seções 18px.

**Linha 1 — KPIs (grid 2fr / 1fr / 1fr, gap 14px):**

1. **Patrimônio total** (card grande)
   - Label uppercase 11px tracking 0.06em
   - Valor: `--font-mono` 38px/600 letter-spacing -0.02em, formatado em BRL
   - Pill de variação % (ver componente Pill abaixo)
   - Subtexto 13px `--font-mono` cor `--fg-mute` mostrando delta absoluto + range

2. **P&L realizado + não realizado**
   - Valor 22px/600 mono, com sinal "+/-"
   - Pill % abaixo

3. **Custo médio total**
   - Valor 22px/600 mono em BRL
   - Subtexto: "5 ativos · 7 transações"

Todos os cards: `background: var(--surface)`, border 1px `--border-soft`, border-radius 12px, padding 22px.

**Linha 2 — Performance Chart card:**
- Header com título 13px/500 + subtítulo 11px `--fg-mute` + RangeTabs alinhado à direita (1D, 1S, 1M, 3M, 1A, Tudo)
- Chart: 260px de altura, gradient fill (cor up/down baseada no delta total do range), linha 1.75px, gridlines tracejadas (4 linhas), valores Y à direita 10px mono `--fg-mute`
- Crosshair vertical no hover + bolinha 5px com border 2px `--bg`, tooltip flutuante 11px mono

**Linha 3 — Holdings table + Allocation donut (grid 1.7fr / 1fr):**

*Holdings table:*
- Card padding 0
- Header padding `18px 22px 12px`, título "Meus ativos" + contagem
- Header row de colunas (10px uppercase tracking 0.06em): `[avatar] Ativo | Saldo | Preço | P&L | 7d`
- Cada linha (height 52px regular, 44px compact, 60px comfy):
  - Avatar circular 26px com 2 letras do símbolo em `--font-mono` (ver CoinMark)
  - Nome 13px/500 + símbolo 11px mono `--fg-mute`
  - Saldo: BRL 13px mono + quantidade 11px mono `--fg-mute`
  - Preço: BRL 13px mono
  - P&L: valor com sinal cor up/down + % cor `--fg-mute` 11px
  - Sparkline 84×26 da série 1S
- Hover row: `background: var(--surface-2)`
- Border-top 1px `--border-soft` entre linhas

*Allocation donut card:*
- Donut 140×140, stroke-width 14, gap entre segmentos zero
- Centro: "TOTAL" + valor abreviado (ex: "187.4k") em mono
- Lista vertical à direita: bullet 8×8 (border-radius 2) + símbolo + % mono `--fg-mute`

**Linha 4 — Transações recentes + Mercado em destaque (grid 1.7fr / 1fr):**

*Transações recentes:*
- Header com botão "+ Adicionar" pequeno (border 1px, padding `5px 10px`)
- Cada linha: ícone 28×28 quadrado border-radius 7 com fundo up-bg/down-bg e seta pra cima/baixo + tipo+símbolo 13px/500 + corretora+data 11px `--fg-mute` + qtd mono + preço unitário "@" mono `--fg-mute` + total mono 13px/500

*Mercado em destaque:*
- Lista de 5 moedas: CoinMark + símbolo 12.5/500 + nome 10.5 mute + preço mono + variação 24h em up/down

---

### 3. Asset Detail

Acessada clicando em qualquer linha de Holdings.

- Botão "← Voltar" no topo, 12px `--fg-mute`
- **Header card:** CoinMark 48px + nome 22px/600 + símbolo 12px mono mute + preço 30px mono/600 + Pill 24h + botões "Vender" (outline) e "Comprar" (sólido `--fg`/`--bg`)
- **Chart card:** mesmo BigChart, 300px, com RangeTabs
- **Grid 1fr/1fr:**
  - **Sua posição:** valor 26px mono + Pill, depois grid 2×2 com Saldo / Preço médio / Custo total / P&L não realizado (cada item: label 10px uppercase + valor 12px mono)
  - **Estatísticas de mercado:** grid 2×2 com Variação 24h, 7d, Máxima período, Mínima período
- **Suas transações em [SYMBOL]:** lista padrão (compra/venda em uppercase tracking 0.06em + data+venue + qtd + preço + total)

---

### 4. AddTransactionModal

Overlay fixed inset 0, `background: rgba(15,18,22,0.45)`, `backdrop-filter: blur(4px)`, z-index 50.

Painel: 460px largura, `background: var(--surface)`, border 1px `--border-soft`, border-radius 14px, shadow `--shadow-lg`.

- **Header** (padding `20px 24px`, border-bottom): label uppercase "ADICIONAR" + título "Nova transação" 18px/600 + botão fechar ✕ 30×30
- **Body** (padding 24, gap 16):
  - Segmented control Comprar/Vender (largura total, padding 3, background `--surface-2`, border-radius 8). Tab ativa: cor `--up-fg` ou `--down-fg`
  - Grid 2 col: select Ativo + select Corretora (height 38, border 1px `--border`, border-radius 8, mono 13px)
  - Grid 2 col: input Quantidade (sufixo símbolo) + input Preço unitário (sufixo BRL)
  - Total card: `background: var(--surface-2)`, padding `14px 16px`, label uppercase + valor mono 18px/600
- **Footer** (border-top): botão Cancelar (outline) + botão "Registrar transação" (`--fg`/`--bg`)

---

## Interactions & Behavior

- **Sidebar nav** → muda screen, reseta selectedAsset
- **Click numa linha de holdings** → abre AssetDetail dessa moeda
- **Click numa linha de "Mercado em destaque"** → abre AssetDetail
- **Botão "Nova transação"** (sidebar e dashboard) → abre AddTransactionModal
- **Modal:** click no overlay ou no ✕ fecha; "Registrar transação" deve persistir (no protótipo só fecha)
- **Toggle privacidade** → todos os valores monetários e saldos viram `R$ •••••` / `••••`
- **RangeTabs** → re-renderiza chart e KPI de delta com a série do range escolhido
- **Hover no chart** → mostra crosshair vertical + bolinha + tooltip com índice/valor
- **Hover row holdings/transactions** → `background: var(--surface-2)`

---

## State Management

Estados no root (`App`):
- `screen`: `'dashboard' | 'holdings' | 'transactions' | 'market' | 'alerts' | 'asset'`
- `selectedAsset`: id da moeda quando screen === 'asset'
- `showAddTx`: boolean

Tweaks (persistidos):
- `dark`, `accent` (`'teal'|'cobalt'|'bitcoin'`), `density` (`'compact'|'regular'|'comfy'`), `chartStyle` (`'area'|'line'`), `hideValues`

Estados locais:
- Dashboard / AssetDetail: `range` (default '1M')
- AddTransactionModal: `type`, `coin`, `amount`, `price`, `venue`

**No codebase real:**
- Use Zustand / Redux / Context para portfolio + transações
- Persistência em backend (Postgres/SQLite) ou localStorage
- Server state via React Query / SWR para cotações
- Polling ou WebSocket para preços (CoinGecko free tier funciona pra começar)

---

## Design Tokens

### Cores — Light (default)
| Token | Valor |
|---|---|
| `--bg` | `#f7f6f3` |
| `--surface` | `#ffffff` |
| `--surface-2` | `#f1f0ec` |
| `--surface-elev` | `#ffffff` |
| `--fg` | `#1a1d22` |
| `--fg-soft` | `#3d424a` |
| `--fg-mute` | `#838790` |
| `--border` | `#dedcd5` |
| `--border-soft` | `#ebe9e3` |
| `--up-fg` | `#1c8a5a` |
| `--up-bg` | `rgba(28,138,90,0.10)` |
| `--down-fg` | `#b5443e` |
| `--down-bg` | `rgba(181,68,62,0.10)` |

### Cores — Dark
| Token | Valor |
|---|---|
| `--bg` | `#0f1216` |
| `--surface` | `#161a20` |
| `--surface-2` | `#1d2128` |
| `--surface-elev` | `#22272f` |
| `--fg` | `#e8eaee` |
| `--fg-soft` | `#c4c8d0` |
| `--fg-mute` | `#7d8590` |
| `--border` | `#2a2f37` |
| `--border-soft` | `#22262d` |
| `--up-fg` | `#3ec28b` |
| `--up-bg` | `rgba(62,194,139,0.13)` |
| `--down-fg` | `#e07171` |
| `--down-bg` | `rgba(224,113,113,0.13)` |

### Accents
- **Teal** (default): `#0e7d77` / soft `#daefee`
- **Cobalt**: `#2a4eb8` / soft `#dde4f6`
- **Bitcoin**: `#c4791b` / soft `#f5e6d0`

### Cores de moedas (avatares)
| Símbolo | Cor |
|---|---|
| BTC | `#f2a23a` |
| ETH | `#7b8aff` |
| SOL | `#9b6bd6` |
| USDC | `#3b6dd6` |
| LINK | `#3a6cb3` |
| AVAX | `#c94a4a` |

### Tipografia
- **Sans:** Inter Tight (400, 500, 600, 700)
- **Mono:** JetBrains Mono (400, 500, 600) — usar em todos os números, símbolos de moeda, datas, preços
- Font feature settings: `"ss01", "cv11"` no body
- Tamanhos: 10/11/12/13/14 (corpo), 18/22 (títulos), 26/30/38 (display)
- Letter-spacing -0.02em em headlines, 0.06em em uppercase labels

### Spacing scale
4 / 6 / 8 / 10 / 14 / 18 / 22 / 24 / 32 px — usar consistente.

### Border radius
- Pills/badges: 999px (full)
- Inputs/buttons: 7-8px
- Cards: 12px
- Modal: 14px
- Avatar quadrado pequeno: 7-8px
- CoinMark circular: 50%

### Shadows
- `--shadow-xs`: `0 1px 2px rgba(20,22,26,0.06)` (light) / `0 1px 2px rgba(0,0,0,0.3)` (dark)
- `--shadow-sm`: `0 4px 14px rgba(20,22,26,0.08)` / `0 4px 12px rgba(0,0,0,0.35)`
- `--shadow-lg`: `0 24px 60px rgba(20,22,26,0.18)` / `0 24px 60px rgba(0,0,0,0.5)`

---

## Componentes reutilizáveis

- **CoinMark** — avatar circular colorido com 2 primeiras letras do símbolo em mono. Tamanhos: 26 (linha), 28 (default), 48 (header detail).
- **Pill** — badge de variação % com seta ▲/▼ e cor up/down. Sizes: sm (11px) / md (12px).
- **Sparkline** — SVG path mini, stroke 1.5px, cor automática baseada em up/down.
- **BigChart** — area chart responsivo (ResizeObserver), com gridlines tracejadas, crosshair, tooltip, gradient fill.
- **AllocationDonut** — donut SVG com strokeDasharray.
- **RangeTabs** — segmented control de períodos.
- **Card** — container padrão, surface + border-soft + radius 12.

---

## Assets

- **Fontes:** Inter Tight + JetBrains Mono (Google Fonts)
- **Ícones:** todos SVG inline stroke-1.5/1.6, cor `currentColor`. Substitua pela biblioteca do codebase (Lucide, Heroicons, Phosphor — Lucide é o match estilístico mais próximo).
- **Logo AgonCripto:** dois círculos sobrepostos (SVG inline em `screens.jsx`).
- Sem imagens raster.

---

## Files

- `AgonCripto.html` — entry HTML, monta React + carrega fontes + scripts
- `data.js` — dados mock (COINS, HOLDINGS, TRANSACTIONS, SERIES, PORTFOLIO_SERIES) + gerador determinístico de séries de preço
- `components.jsx` — primitivos (CoinMark, Pill, Sparkline, BigChart, AllocationDonut) + formatadores (fmtBRL, fmtUSD, fmtPct, fmtAmount, fmtDate)
- `screens.jsx` — Sidebar, TopBar, Card, RangeTabs, Dashboard, AssetDetail, AddTransactionModal, StubScreen
- `app.jsx` — App root, roteamento por estado, tweaks (dark/accent/density/chartStyle/hideValues), CSS variables
- `tweaks-panel.jsx` — painel de tweaks (pode ignorar no port — é específico do ambiente de prototipagem)

---

## Recomendações para implementação

1. **Stack sugerida** se começando do zero: Next.js 14 + Tailwind + shadcn/ui + Lucide + Recharts (ou Visx) para o chart + Zustand para estado + React Query para cotações.
2. **Mapeamento das CSS vars** → estender o `tailwind.config.ts` com os tokens em `theme.extend.colors`.
3. **Chart real:** Recharts `<AreaChart>` com gradient. Para crosshair + tooltip custom, usar `<Tooltip content={...} />`.
4. **Cotações reais:** CoinGecko API `/coins/markets` (gratuito, rate-limited). Cache 60s.
5. **Persistência de transações:** começar com localStorage; depois migrar para backend.
6. **Acessibilidade:** os botões custom (segmented controls, range tabs) precisam de `role`, `aria-checked`, navegação por teclado. shadcn/ui já cobre isso.
7. **Responsivo:** o protótipo é desktop-only. Para mobile, sidebar vira drawer, grids viram coluna única, KPI row vira carrossel ou stack.
