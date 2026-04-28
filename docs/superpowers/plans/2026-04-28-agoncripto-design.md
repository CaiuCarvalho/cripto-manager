# AgonCripto Design Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implementar o design fiel do AgonCripto (shell + dashboard) usando dados mock no frontend Next.js 14 já existente.

**Architecture:** Tokens de design como CSS custom properties no `globals.css` + extensão do Tailwind. Componentes primitivos isolados em `src/components/ui/`. Shell (Sidebar + TopBar) em `src/components/layout/`. Dashboard reescrito com dados mock puros — zero chamadas de API.

**Tech Stack:** Next.js 14, Tailwind CSS 3, Recharts 2, TypeScript, Google Fonts (Inter Tight + JetBrains Mono), SVG inline para ícones e donut.

---

## Mapa de arquivos

| Arquivo | Ação | Responsabilidade |
|---|---|---|
| `frontend/src/app/globals.css` | Modificar | CSS custom properties light/dark, reset de fonte |
| `frontend/tailwind.config.js` | Modificar | Tokens de cor mapeados às CSS vars, font families |
| `frontend/src/app/layout.tsx` | Modificar | Carregar Inter Tight + JetBrains Mono via next/font |
| `frontend/src/lib/mock-data.ts` | Criar | COINS, HOLDINGS, TRANSACTIONS, SERIES, PORTFOLIO_SERIES |
| `frontend/src/lib/formatters.ts` | Criar | fmtBRL, fmtPct, fmtAmount, fmtDate |
| `frontend/src/components/ui/coin-mark.tsx` | Criar | Avatar circular colorido com iniciais mono |
| `frontend/src/components/ui/pill.tsx` | Criar | Badge ▲/▼ com cor up/down |
| `frontend/src/components/ui/sparkline.tsx` | Criar | Mini gráfico SVG da série 7d |
| `frontend/src/components/ui/big-chart.tsx` | Criar | AreaChart Recharts com crosshair + tooltip custom |
| `frontend/src/components/ui/allocation-donut.tsx` | Criar | Donut SVG com strokeDasharray |
| `frontend/src/components/ui/range-tabs.tsx` | Criar | Segmented control 1D/1S/1M/3M/1A/Tudo |
| `frontend/src/components/layout/sidebar.tsx` | Criar | Sidebar 232px completa |
| `frontend/src/components/layout/top-bar.tsx` | Criar | TopBar com busca fake + notificações |
| `frontend/src/app/(dashboard)/layout.tsx` | Reescrever | Shell: Sidebar + TopBar + área de conteúdo |
| `frontend/src/app/(dashboard)/dashboard/page.tsx` | Reescrever | Dashboard completo com dados mock |

---

## Task 1: Tokens de design (CSS vars + Tailwind)

**Arquivos:**
- Modificar: `frontend/src/app/globals.css`
- Modificar: `frontend/tailwind.config.js`

- [ ] **Step 1: Substituir globals.css**

```css
/* frontend/src/app/globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

@import url('https://fonts.googleapis.com/css2?family=Inter+Tight:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap');

:root {
  --bg: #f7f6f3;
  --surface: #ffffff;
  --surface-2: #f1f0ec;
  --surface-elev: #ffffff;
  --fg: #1a1d22;
  --fg-soft: #3d424a;
  --fg-mute: #838790;
  --border: #dedcd5;
  --border-soft: #ebe9e3;
  --up-fg: #1c8a5a;
  --up-bg: rgba(28,138,90,0.10);
  --down-fg: #b5443e;
  --down-bg: rgba(181,68,62,0.10);
  --accent: #0e7d77;
  --accent-soft: #daefee;
  --shadow-xs: 0 1px 2px rgba(20,22,26,0.06);
  --shadow-sm: 0 4px 14px rgba(20,22,26,0.08);
  --shadow-lg: 0 24px 60px rgba(20,22,26,0.18);
  --font-sans: 'Inter Tight', sans-serif;
  --font-mono: 'JetBrains Mono', monospace;
}

.dark {
  --bg: #0f1216;
  --surface: #161a20;
  --surface-2: #1d2128;
  --surface-elev: #22272f;
  --fg: #e8eaee;
  --fg-soft: #c4c8d0;
  --fg-mute: #7d8590;
  --border: #2a2f37;
  --border-soft: #22262d;
  --up-fg: #3ec28b;
  --up-bg: rgba(62,194,139,0.13);
  --down-fg: #e07171;
  --down-bg: rgba(224,113,113,0.13);
  --accent: #0e7d77;
  --accent-soft: rgba(14,125,119,0.20);
  --shadow-xs: 0 1px 2px rgba(0,0,0,0.3);
  --shadow-sm: 0 4px 12px rgba(0,0,0,0.35);
  --shadow-lg: 0 24px 60px rgba(0,0,0,0.5);
}

* { box-sizing: border-box; }

body {
  background: var(--bg);
  color: var(--fg);
  font-family: var(--font-sans);
  font-feature-settings: "ss01", "cv11";
  -webkit-font-smoothing: antialiased;
}
```

- [ ] **Step 2: Substituir tailwind.config.js**

```js
// frontend/tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-sans)', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      colors: {
        bg: 'var(--bg)',
        surface: 'var(--surface)',
        'surface-2': 'var(--surface-2)',
        'surface-elev': 'var(--surface-elev)',
        fg: 'var(--fg)',
        'fg-soft': 'var(--fg-soft)',
        'fg-mute': 'var(--fg-mute)',
        border: 'var(--border)',
        'border-soft': 'var(--border-soft)',
        'up-fg': 'var(--up-fg)',
        'up-bg': 'var(--up-bg)',
        'down-fg': 'var(--down-fg)',
        'down-bg': 'var(--down-bg)',
        accent: 'var(--accent)',
        'accent-soft': 'var(--accent-soft)',
      },
      borderRadius: {
        card: '12px',
        modal: '14px',
      },
      boxShadow: {
        xs: 'var(--shadow-xs)',
        sm: 'var(--shadow-sm)',
        lg: 'var(--shadow-lg)',
      },
    },
  },
  plugins: [],
};
```

- [ ] **Step 3: Commit**

```bash
git add frontend/src/app/globals.css frontend/tailwind.config.js
git commit -m "feat: add AgonCripto design tokens (CSS vars + Tailwind)"
```

---

## Task 2: Mock data e formatadores

**Arquivos:**
- Criar: `frontend/src/lib/mock-data.ts`
- Criar: `frontend/src/lib/formatters.ts`

- [ ] **Step 1: Criar mock-data.ts**

```ts
// frontend/src/lib/mock-data.ts

export interface Coin {
  id: string;
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  change7d: number;
  color: string;
}

export interface Holding {
  coin: string;
  amount: number;
  costBasis: number;
}

export interface Transaction {
  id: string;
  type: 'buy' | 'sell';
  coin: string;
  amount: number;
  price: number;
  date: string;
  venue: string;
}

export type Range = '1D' | '1S' | '1M' | '3M' | '1A' | 'Tudo';

export const COINS: Coin[] = [
  { id: 'btc',  symbol: 'BTC',  name: 'Bitcoin',    price: 71240.55, change24h:  1.42, change7d:  4.81, color: '#f2a23a' },
  { id: 'eth',  symbol: 'ETH',  name: 'Ethereum',   price:  3812.10, change24h:  0.78, change7d:  2.05, color: '#7b8aff' },
  { id: 'sol',  symbol: 'SOL',  name: 'Solana',     price:   178.32, change24h: -2.14, change7d:  6.92, color: '#9b6bd6' },
  { id: 'usdc', symbol: 'USDC', name: 'USD Coin',   price:     1.00, change24h:  0.00, change7d: -0.01, color: '#3b6dd6' },
  { id: 'link', symbol: 'LINK', name: 'Chainlink',  price:    18.04, change24h:  3.21, change7d: -1.18, color: '#3a6cb3' },
  { id: 'avax', symbol: 'AVAX', name: 'Avalanche',  price:    42.18, change24h: -0.95, change7d:  3.40, color: '#c94a4a' },
];

export const HOLDINGS: Holding[] = [
  { coin: 'btc',  amount: 0.4128,  costBasis: 58400.00 },
  { coin: 'eth',  amount: 6.2150,  costBasis:  2890.30 },
  { coin: 'sol',  amount: 84.500,  costBasis:   142.10 },
  { coin: 'link', amount: 240.00,  costBasis:    14.85 },
  { coin: 'usdc', amount: 4200.00, costBasis:     1.00 },
];

export const TRANSACTIONS: Transaction[] = [
  { id: 't1', type: 'buy',  coin: 'btc',  amount: 0.0420, price: 70180.00, date: '2026-04-26T14:32:00', venue: 'Binance' },
  { id: 't2', type: 'buy',  coin: 'sol',  amount: 12.500, price: 165.40,   date: '2026-04-25T09:11:00', venue: 'Coinbase' },
  { id: 't3', type: 'sell', coin: 'eth',  amount: 0.8000, price: 3795.20,  date: '2026-04-22T18:04:00', venue: 'Binance' },
  { id: 't4', type: 'buy',  coin: 'link', amount: 60.000, price: 17.20,    date: '2026-04-20T11:48:00', venue: 'Kraken' },
  { id: 't5', type: 'buy',  coin: 'eth',  amount: 1.5000, price: 3680.00,  date: '2026-04-15T08:22:00', venue: 'Binance' },
];

export const WATCHLIST = ['avax'];

function genSeries(seed: number, points: number, base: number, vol: number): number[] {
  let x = seed;
  const arr: number[] = [];
  let v = base;
  for (let i = 0; i < points; i++) {
    x = (x * 9301 + 49297) % 233280;
    const r = (x / 233280 - 0.5) * 2;
    v = v * (1 + r * vol);
    arr.push(v);
  }
  return arr;
}

function rescaleToEnd(arr: number[], end: number): number[] {
  const last = arr[arr.length - 1];
  return arr.map(v => v * (end / last));
}

export const SERIES: Record<string, Record<Range, number[]>> = {};
COINS.forEach((c, i) => {
  SERIES[c.id] = {
    '1D':   rescaleToEnd(genSeries(11 + i,  60, c.price, 0.012), c.price),
    '1S':   rescaleToEnd(genSeries(31 + i,  84, c.price, 0.018), c.price),
    '1M':   rescaleToEnd(genSeries(53 + i, 120, c.price, 0.025), c.price),
    '3M':   rescaleToEnd(genSeries(71 + i, 150, c.price, 0.035), c.price),
    '1A':   rescaleToEnd(genSeries(97 + i, 180, c.price, 0.055), c.price),
    'Tudo': rescaleToEnd(genSeries(113 + i, 220, c.price, 0.080), c.price),
  };
});

function buildPortfolioSeries(range: Range): number[] {
  const n = Math.min(...HOLDINGS.map(h => SERIES[h.coin][range].length));
  const out = new Array(n).fill(0);
  HOLDINGS.forEach(h => {
    const s = SERIES[h.coin][range];
    for (let i = 0; i < n; i++) out[i] += s[i] * h.amount;
  });
  return out;
}

export const PORTFOLIO_SERIES: Record<Range, number[]> = {
  '1D':   buildPortfolioSeries('1D'),
  '1S':   buildPortfolioSeries('1S'),
  '1M':   buildPortfolioSeries('1M'),
  '3M':   buildPortfolioSeries('3M'),
  '1A':   buildPortfolioSeries('1A'),
  'Tudo': buildPortfolioSeries('Tudo'),
};

export const USD_BRL = 5.10;
```

- [ ] **Step 2: Criar formatters.ts**

```ts
// frontend/src/lib/formatters.ts

export function fmtBRL(n: number, opts: { hide?: boolean; decimals?: number } = {}): string {
  const { hide = false, decimals = 2 } = opts;
  if (hide) return 'R$ •••••';
  return n.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export function fmtPct(n: number): string {
  return (n >= 0 ? '+' : '') + n.toFixed(2) + '%';
}

export function fmtAmount(n: number, decimals = 4): string {
  return n.toLocaleString('pt-BR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  });
}

export function fmtDate(iso: string): string {
  const d = new Date(iso);
  return (
    d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }) +
    ' · ' +
    d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  );
}

export function fmtAbrev(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'k';
  return n.toFixed(0);
}
```

- [ ] **Step 3: Commit**

```bash
git add frontend/src/lib/mock-data.ts frontend/src/lib/formatters.ts
git commit -m "feat: add mock data and formatters for AgonCripto"
```

---

## Task 3: Componentes primitivos — CoinMark, Pill, Sparkline

**Arquivos:**
- Criar: `frontend/src/components/ui/coin-mark.tsx`
- Criar: `frontend/src/components/ui/pill.tsx`
- Criar: `frontend/src/components/ui/sparkline.tsx`

- [ ] **Step 1: Criar coin-mark.tsx**

```tsx
// frontend/src/components/ui/coin-mark.tsx
interface CoinMarkProps {
  symbol: string;
  color: string;
  size?: number;
}

export function CoinMark({ symbol, color, size = 28 }: CoinMarkProps) {
  const initials = symbol.slice(0, 2);
  const fontSize = Math.round(size * 0.36);
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: color,
        color: '#fff',
        flexShrink: 0,
        fontSize,
        fontWeight: 600,
        letterSpacing: '0.02em',
        fontFamily: 'var(--font-mono)',
      }}
      className="inline-flex items-center justify-center"
    >
      {initials}
    </div>
  );
}
```

- [ ] **Step 2: Criar pill.tsx**

```tsx
// frontend/src/components/ui/pill.tsx
interface PillProps {
  value: number;
  size?: 'sm' | 'md';
}

export function Pill({ value, size = 'md' }: PillProps) {
  const up = value >= 0;
  const fs = size === 'sm' ? 11 : 12;
  const padding = size === 'sm' ? '2px 7px' : '3px 9px';
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        padding,
        borderRadius: 999,
        fontFamily: 'var(--font-mono)',
        fontSize: fs,
        fontWeight: 500,
        background: up ? 'var(--up-bg)' : 'var(--down-bg)',
        color: up ? 'var(--up-fg)' : 'var(--down-fg)',
        fontVariantNumeric: 'tabular-nums',
        whiteSpace: 'nowrap',
      }}
    >
      <span style={{ fontSize: fs - 2 }}>{up ? '▲' : '▼'}</span>
      {Math.abs(value).toFixed(2)}%
    </span>
  );
}
```

- [ ] **Step 3: Criar sparkline.tsx**

```tsx
// frontend/src/components/ui/sparkline.tsx
interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
}

export function Sparkline({ data, width = 84, height = 26 }: SparklineProps) {
  if (!data || data.length < 2) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const span = max - min || 1;
  const step = width / (data.length - 1);
  const pts = data.map((v, i) => [
    i * step,
    height - ((v - min) / span) * height,
  ]);
  const d = pts
    .map((p, i) => `${i === 0 ? 'M' : 'L'}${p[0].toFixed(1)} ${p[1].toFixed(1)}`)
    .join(' ');
  const up = data[data.length - 1] >= data[0];
  const color = up ? 'var(--up-fg)' : 'var(--down-fg)';
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <path
        d={d}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add frontend/src/components/ui/coin-mark.tsx frontend/src/components/ui/pill.tsx frontend/src/components/ui/sparkline.tsx
git commit -m "feat: add CoinMark, Pill, Sparkline primitive components"
```

---

## Task 4: BigChart (Recharts AreaChart)

**Arquivos:**
- Criar: `frontend/src/components/ui/big-chart.tsx`

- [ ] **Step 1: Criar big-chart.tsx**

```tsx
// frontend/src/components/ui/big-chart.tsx
'use client';

import { useState, useCallback } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  type TooltipProps,
} from 'recharts';

interface BigChartProps {
  data: number[];
  height?: number;
}

interface ChartPoint {
  index: number;
  value: number;
}

function CustomTooltip({ active, payload }: TooltipProps<number, string>) {
  if (!active || !payload?.length) return null;
  const val: number = payload[0].value as number;
  return (
    <div
      style={{
        padding: '8px 10px',
        background: 'var(--surface-elev)',
        border: '1px solid var(--border)',
        borderRadius: 8,
        fontSize: 11,
        fontFamily: 'var(--font-mono)',
        color: 'var(--fg)',
        boxShadow: 'var(--shadow-sm)',
        minWidth: 120,
        pointerEvents: 'none',
      }}
    >
      <div style={{ color: 'var(--fg-mute)', fontSize: 10, marginBottom: 2 }}>
        Ponto {(payload[0].payload as ChartPoint).index + 1}
      </div>
      <div style={{ fontWeight: 600 }}>
        {val.toLocaleString('pt-BR', { maximumFractionDigits: 2 })}
      </div>
    </div>
  );
}

export function BigChart({ data, height = 260 }: BigChartProps) {
  const chartData: ChartPoint[] = data.map((value, index) => ({ index, value }));
  const up = data.length >= 2 && data[data.length - 1] >= data[0];
  const color = up ? 'var(--up-fg)' : 'var(--down-fg)';
  const gradientId = `chartFill-${up ? 'up' : 'down'}`;

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={chartData} margin={{ top: 18, right: 8, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.18} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid
          strokeDasharray="2 4"
          stroke="var(--border-soft)"
          vertical={false}
        />
        <XAxis dataKey="index" hide />
        <YAxis
          orientation="right"
          axisLine={false}
          tickLine={false}
          tick={{ fill: 'var(--fg-mute)', fontSize: 10, fontFamily: 'var(--font-mono)' }}
          tickFormatter={(v: number) => v.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
          width={72}
          tickCount={5}
        />
        <Tooltip
          content={<CustomTooltip />}
          cursor={{ stroke: 'var(--border)', strokeWidth: 1 }}
        />
        <Area
          type="monotone"
          dataKey="value"
          stroke={color}
          strokeWidth={1.75}
          fill={`url(#${gradientId})`}
          dot={false}
          activeDot={{ r: 5, fill: color, stroke: 'var(--bg)', strokeWidth: 2 }}
          strokeLinecap="round"
          strokeLinejoin="round"
          isAnimationActive={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/components/ui/big-chart.tsx
git commit -m "feat: add BigChart Recharts area chart with crosshair and tooltip"
```

---

## Task 5: AllocationDonut e RangeTabs

**Arquivos:**
- Criar: `frontend/src/components/ui/allocation-donut.tsx`
- Criar: `frontend/src/components/ui/range-tabs.tsx`

- [ ] **Step 1: Criar allocation-donut.tsx**

```tsx
// frontend/src/components/ui/allocation-donut.tsx
interface DonutSlice {
  color: string;
  value: number;
  symbol: string;
}

interface AllocationDonutProps {
  slices: DonutSlice[];
  size?: number;
  totalLabel?: string;
}

export function AllocationDonut({ slices, size = 140, totalLabel = '' }: AllocationDonutProps) {
  const total = slices.reduce((a, s) => a + s.value, 0);
  const r = size / 2 - 10;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * r;
  let offset = 0;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle
        cx={cx} cy={cy} r={r}
        fill="none"
        stroke="var(--surface-2)"
        strokeWidth="14"
      />
      {slices.map((s, i) => {
        const len = (s.value / total) * circumference;
        const dash = `${len} ${circumference - len}`;
        const el = (
          <circle
            key={i}
            cx={cx} cy={cy} r={r}
            fill="none"
            stroke={s.color}
            strokeWidth="14"
            strokeLinecap="butt"
            strokeDasharray={dash}
            strokeDashoffset={-offset}
            transform={`rotate(-90 ${cx} ${cy})`}
          />
        );
        offset += len;
        return el;
      })}
      <text
        x={cx} y={cy - 6}
        textAnchor="middle"
        fill="var(--fg-mute)"
        fontSize="9"
        fontFamily="var(--font-mono)"
        letterSpacing="0.06em"
      >
        TOTAL
      </text>
      <text
        x={cx} y={cy + 8}
        textAnchor="middle"
        fill="var(--fg)"
        fontSize="13"
        fontWeight="600"
        fontFamily="var(--font-mono)"
      >
        {totalLabel}
      </text>
    </svg>
  );
}
```

- [ ] **Step 2: Criar range-tabs.tsx**

```tsx
// frontend/src/components/ui/range-tabs.tsx
'use client';

import type { Range } from '@/lib/mock-data';

const RANGES: Range[] = ['1D', '1S', '1M', '3M', '1A', 'Tudo'];

interface RangeTabsProps {
  value: Range;
  onChange: (r: Range) => void;
}

export function RangeTabs({ value, onChange }: RangeTabsProps) {
  return (
    <div className="flex gap-0.5">
      {RANGES.map((r) => {
        const active = r === value;
        return (
          <button
            key={r}
            onClick={() => onChange(r)}
            style={{
              padding: '3px 9px',
              borderRadius: 6,
              border: 0,
              fontSize: 11,
              fontFamily: 'var(--font-mono)',
              fontWeight: active ? 600 : 400,
              cursor: 'pointer',
              background: active ? 'var(--surface-2)' : 'transparent',
              color: active ? 'var(--fg)' : 'var(--fg-mute)',
              transition: 'background 0.1s, color 0.1s',
            }}
          >
            {r}
          </button>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add frontend/src/components/ui/allocation-donut.tsx frontend/src/components/ui/range-tabs.tsx
git commit -m "feat: add AllocationDonut and RangeTabs components"
```

---

## Task 6: Sidebar

**Arquivos:**
- Criar: `frontend/src/components/layout/sidebar.tsx`

- [ ] **Step 1: Criar sidebar.tsx**

```tsx
// frontend/src/components/layout/sidebar.tsx
'use client';

interface SidebarProps {
  current: string;
  onNav: (screen: string) => void;
  onAddTx: () => void;
  hideValues: boolean;
  onTogglePrivacy: () => void;
  userName?: string;
}

const NAV_ITEMS = [
  { id: 'dashboard',    label: 'Dashboard' },
  { id: 'holdings',     label: 'Meus ativos' },
  { id: 'transactions', label: 'Transações' },
  { id: 'market',       label: 'Mercado' },
  { id: 'alerts',       label: 'Alertas' },
];

function NavIcon({ id }: { id: string }) {
  const props = {
    width: 16, height: 16, viewBox: '0 0 24 24',
    fill: 'none', stroke: 'currentColor',
    strokeWidth: 1.6, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const,
  };
  if (id === 'dashboard')
    return <svg {...props}><rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/></svg>;
  if (id === 'holdings')
    return <svg {...props}><circle cx="9" cy="9" r="6"/><circle cx="15" cy="15" r="6"/></svg>;
  if (id === 'transactions')
    return <svg {...props}><path d="M4 8h13l-3-3"/><path d="M20 16H7l3 3"/></svg>;
  if (id === 'market')
    return <svg {...props}><path d="M3 17l5-5 4 4 8-9"/><path d="M14 7h6v6"/></svg>;
  if (id === 'alerts')
    return <svg {...props}><path d="M6 8a6 6 0 0 1 12 0c0 7 3 7 3 9H3c0-2 3-2 3-9"/><path d="M10 21h4"/></svg>;
  return null;
}

export function Sidebar({ current, onNav, onAddTx, hideValues, onTogglePrivacy, userName = 'Usuário' }: SidebarProps) {
  const initials = userName.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();

  return (
    <aside
      style={{
        width: 232,
        flexShrink: 0,
        height: '100vh',
        position: 'sticky',
        top: 0,
        borderRight: '1px solid var(--border-soft)',
        background: 'var(--surface)',
        display: 'flex',
        flexDirection: 'column',
        padding: '20px 14px',
        overflow: 'hidden',
      }}
    >
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '4px 6px 24px' }}>
        <svg width="22" height="22" viewBox="0 0 22 22">
          <circle cx="8"  cy="11" r="6.5" fill="none" stroke="var(--accent)" strokeWidth="1.6" />
          <circle cx="14" cy="11" r="6.5" fill="none" stroke="var(--fg)"     strokeWidth="1.6" />
        </svg>
        <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.05 }}>
          <span style={{ fontWeight: 600, fontSize: 15, letterSpacing: '-0.01em', color: 'var(--fg)' }}>AgonCripto</span>
          <span style={{ fontSize: 10, color: 'var(--fg-mute)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>portfolio</span>
        </div>
      </div>

      {/* Nova transação */}
      <button
        onClick={onAddTx}
        style={{
          margin: '0 0 18px',
          height: 34,
          borderRadius: 8,
          background: 'var(--fg)',
          color: 'var(--bg)',
          border: 0,
          fontWeight: 500,
          fontSize: 13,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 7,
          fontFamily: 'var(--font-sans)',
        }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M12 5v14M5 12h14"/>
        </svg>
        Nova transação
      </button>

      {/* Heading Menu */}
      <div style={{ fontSize: 10, color: 'var(--fg-mute)', letterSpacing: '0.08em', textTransform: 'uppercase', padding: '4px 8px 8px' }}>
        Menu
      </div>

      {/* Nav items */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {NAV_ITEMS.map(item => {
          const active = current === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNav(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 11,
                padding: '8px 10px',
                height: 34,
                borderRadius: 7,
                border: 0,
                cursor: 'pointer',
                background: active ? 'var(--surface-2)' : 'transparent',
                color: active ? 'var(--fg)' : 'var(--fg-soft)',
                fontSize: 13,
                fontWeight: active ? 500 : 400,
                textAlign: 'left',
                fontFamily: 'var(--font-sans)',
              }}
            >
              <span style={{ color: active ? 'var(--accent)' : 'var(--fg-mute)', display: 'flex' }}>
                <NavIcon id={item.id} />
              </span>
              {item.label}
            </button>
          );
        })}
      </nav>

      <div style={{ flex: 1 }} />

      {/* Toggle de privacidade */}
      <button
        onClick={onTogglePrivacy}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '10px',
          borderRadius: 8,
          border: '1px solid var(--border-soft)',
          background: 'transparent',
          cursor: 'pointer',
          marginBottom: 10,
          width: '100%',
        }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--fg-mute)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          {hideValues
            ? <><path d="M3 3l18 18"/><path d="M10.6 6.1a10 10 0 0 1 10.4 5.9 12 12 0 0 1-2.7 3.5"/><path d="M6.6 6.6A12 12 0 0 0 3 12s4 7 9 7a9 9 0 0 0 4-1"/></>
            : <><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></>
          }
        </svg>
        <span style={{ fontSize: 12, color: 'var(--fg-soft)', flex: 1, textAlign: 'left' }}>
          {hideValues ? 'Mostrar saldo' : 'Esconder saldo'}
        </span>
      </button>

      {/* User chip */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 8px 0', borderTop: '1px solid var(--border-soft)' }}>
        <div style={{
          width: 28, height: 28, borderRadius: 8,
          background: 'var(--accent-soft)',
          color: 'var(--accent)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: 600, fontSize: 11, fontFamily: 'var(--font-mono)',
          flexShrink: 0,
        }}>
          {initials}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.15, flex: 1, minWidth: 0 }}>
          <span style={{ fontSize: 12, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--fg)' }}>
            {userName}
          </span>
          <span style={{ fontSize: 10, color: 'var(--fg-mute)' }}>Plano pessoal</span>
        </div>
      </div>
    </aside>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/components/layout/sidebar.tsx
git commit -m "feat: add Sidebar component with nav, privacy toggle, and user chip"
```

---

## Task 7: TopBar

**Arquivos:**
- Criar: `frontend/src/components/layout/top-bar.tsx`

- [ ] **Step 1: Criar top-bar.tsx**

```tsx
// frontend/src/components/layout/top-bar.tsx

const PAGE_TITLES: Record<string, { subtitle: string; title: string }> = {
  dashboard:    { subtitle: 'Visão geral', title: 'Dashboard' },
  holdings:     { subtitle: 'Posições abertas', title: 'Meus ativos' },
  transactions: { subtitle: 'Histórico', title: 'Transações' },
  market:       { subtitle: 'Acompanhamento', title: 'Mercado' },
  alerts:       { subtitle: 'Configurações', title: 'Alertas' },
};

interface TopBarProps {
  screen: string;
}

export function TopBar({ screen }: TopBarProps) {
  const { subtitle, title } = PAGE_TITLES[screen] ?? PAGE_TITLES.dashboard;

  return (
    <header
      style={{
        padding: '24px 32px 18px',
        borderBottom: '1px solid var(--border-soft)',
        background: 'var(--bg)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 10,
      }}
    >
      {/* Título */}
      <div>
        <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--fg-mute)', marginBottom: 2 }}>
          {subtitle}
        </div>
        <div style={{ fontSize: 22, fontWeight: 600, letterSpacing: '-0.02em', color: 'var(--fg)', lineHeight: 1 }}>
          {title}
        </div>
      </div>

      {/* Direita: busca + sino */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {/* Busca fake */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          height: 30,
          padding: '0 10px',
          borderRadius: 7,
          border: '1px solid var(--border-soft)',
          background: 'var(--surface)',
          minWidth: 220,
          cursor: 'text',
        }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--fg-mute)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
          </svg>
          <span style={{ fontSize: 12, color: 'var(--fg-mute)', flex: 1, userSelect: 'none' }}>
            Buscar ativo, transação…
          </span>
          <span style={{
            fontSize: 10,
            color: 'var(--fg-mute)',
            background: 'var(--surface-2)',
            border: '1px solid var(--border-soft)',
            borderRadius: 4,
            padding: '1px 5px',
            fontFamily: 'var(--font-mono)',
          }}>
            ⌘K
          </span>
        </div>

        {/* Sino */}
        <button style={{
          width: 34, height: 34,
          borderRadius: 8,
          border: '1px solid var(--border-soft)',
          background: 'var(--surface)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--fg-mute)',
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 8a6 6 0 0 1 12 0c0 7 3 7 3 9H3c0-2 3-2 3-9"/>
            <path d="M10 21h4"/>
          </svg>
        </button>
      </div>
    </header>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/components/layout/top-bar.tsx
git commit -m "feat: add TopBar component with page title and fake search"
```

---

## Task 8: Reescrever o shell (dashboard layout)

**Arquivos:**
- Modificar: `frontend/src/app/(dashboard)/layout.tsx`
- Modificar: `frontend/src/app/layout.tsx`

- [ ] **Step 1: Atualizar app/layout.tsx para remover import de fonte inline (já está no CSS)**

```tsx
// frontend/src/app/layout.tsx
import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'AgonCripto',
  description: 'Portfolio tracker pessoal de criptoativos',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
```

- [ ] **Step 2: Reescrever (dashboard)/layout.tsx**

```tsx
// frontend/src/app/(dashboard)/layout.tsx
'use client';

import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Sidebar } from '@/components/layout/sidebar';
import { TopBar } from '@/components/layout/top-bar';

function pathnameToScreen(pathname: string): string {
  if (pathname.startsWith('/wallets'))      return 'holdings';
  if (pathname.startsWith('/transactions')) return 'transactions';
  if (pathname.startsWith('/alerts'))       return 'alerts';
  if (pathname.startsWith('/market'))       return 'market';
  return 'dashboard';
}

const SCREEN_ROUTES: Record<string, string> = {
  dashboard:    '/dashboard',
  holdings:     '/wallets',
  transactions: '/transactions',
  market:       '/market',
  alerts:       '/alerts',
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [hideValues, setHideValues] = useState(false);

  const screen = pathnameToScreen(pathname);

  function handleNav(id: string) {
    const route = SCREEN_ROUTES[id];
    if (route) router.push(route);
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>
      <Sidebar
        current={screen}
        onNav={handleNav}
        onAddTx={() => {}}
        hideValues={hideValues}
        onTogglePrivacy={() => setHideValues(v => !v)}
        userName="Caio Carvalho"
      />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>
        <TopBar screen={screen} />
        <main style={{ flex: 1, overflowY: 'auto' }}>
          {children}
        </main>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add frontend/src/app/layout.tsx frontend/src/app/(dashboard)/layout.tsx
git commit -m "feat: rewrite dashboard shell with Sidebar and TopBar"
```

---

## Task 9: Dashboard page

**Arquivos:**
- Reescrever: `frontend/src/app/(dashboard)/dashboard/page.tsx`

- [ ] **Step 1: Reescrever dashboard/page.tsx**

```tsx
// frontend/src/app/(dashboard)/dashboard/page.tsx
'use client';

import { useState } from 'react';
import { BigChart } from '@/components/ui/big-chart';
import { CoinMark } from '@/components/ui/coin-mark';
import { Pill } from '@/components/ui/pill';
import { Sparkline } from '@/components/ui/sparkline';
import { AllocationDonut } from '@/components/ui/allocation-donut';
import { RangeTabs } from '@/components/ui/range-tabs';
import { COINS, HOLDINGS, TRANSACTIONS, PORTFOLIO_SERIES, SERIES, USD_BRL, type Range } from '@/lib/mock-data';
import { fmtBRL, fmtPct, fmtAmount, fmtDate, fmtAbrev } from '@/lib/formatters';

// Derivar valores do portfólio a partir dos holdings e coins mock
function buildPortfolioStats() {
  const coinMap = Object.fromEntries(COINS.map(c => [c.id, c]));
  let totalValue = 0;
  let totalCost = 0;

  const enriched = HOLDINGS.map(h => {
    const coin = coinMap[h.coin];
    const currentValue = coin.price * h.amount * USD_BRL;
    const cost = h.costBasis * h.amount * USD_BRL;
    totalValue += currentValue;
    totalCost += cost;
    return { ...h, coin, currentValue, cost };
  });

  const totalPnL = totalValue - totalCost;
  const totalPnLPct = (totalPnL / totalCost) * 100;

  return { enriched, totalValue, totalCost, totalPnL, totalPnLPct };
}

const { enriched, totalValue, totalCost, totalPnL, totalPnLPct } = buildPortfolioStats();
const coinMap = Object.fromEntries(COINS.map(c => [c.id, c]));

function Card({ children, style = {} }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{
      background: 'var(--surface)',
      border: '1px solid var(--border-soft)',
      borderRadius: 12,
      ...style,
    }}>
      {children}
    </div>
  );
}

export default function DashboardPage() {
  const [range, setRange] = useState<Range>('1M');

  const series = PORTFOLIO_SERIES[range];
  const seriesDelta = series.length >= 2
    ? ((series[series.length - 1] - series[0]) / series[0]) * 100
    : 0;
  const seriesDeltaAbs = series.length >= 2
    ? (series[series.length - 1] - series[0]) * USD_BRL
    : 0;

  const donutSlices = enriched.map(e => ({
    color: e.coin.color,
    value: e.currentValue,
    symbol: e.coin.symbol,
  }));

  return (
    <div style={{ padding: '24px 32px 64px', display: 'flex', flexDirection: 'column', gap: 18 }}>

      {/* Linha 1 — KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 14 }}>

        {/* Patrimônio total */}
        <Card style={{ padding: 22 }}>
          <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--fg-mute)', marginBottom: 10 }}>
            Patrimônio total
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <span style={{ fontSize: 38, fontWeight: 600, fontFamily: 'var(--font-mono)', letterSpacing: '-0.02em', color: 'var(--fg)', lineHeight: 1 }}>
              {fmtBRL(totalValue)}
            </span>
            <Pill value={totalPnLPct} />
          </div>
          <div style={{ fontSize: 13, fontFamily: 'var(--font-mono)', color: 'var(--fg-mute)' }}>
            {totalPnL >= 0 ? '+' : ''}{fmtBRL(totalPnL)} · todos os ativos
          </div>
        </Card>

        {/* P&L */}
        <Card style={{ padding: 22 }}>
          <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--fg-mute)', marginBottom: 10 }}>
            P&amp;L total
          </div>
          <div style={{ fontSize: 22, fontWeight: 600, fontFamily: 'var(--font-mono)', color: totalPnL >= 0 ? 'var(--up-fg)' : 'var(--down-fg)', marginBottom: 6 }}>
            {totalPnL >= 0 ? '+' : ''}{fmtBRL(totalPnL)}
          </div>
          <Pill value={totalPnLPct} size="sm" />
        </Card>

        {/* Custo médio */}
        <Card style={{ padding: 22 }}>
          <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--fg-mute)', marginBottom: 10 }}>
            Custo total
          </div>
          <div style={{ fontSize: 22, fontWeight: 600, fontFamily: 'var(--font-mono)', color: 'var(--fg)', marginBottom: 6 }}>
            {fmtBRL(totalCost)}
          </div>
          <div style={{ fontSize: 11, color: 'var(--fg-mute)' }}>
            {enriched.length} ativos · {TRANSACTIONS.length} transações
          </div>
        </Card>
      </div>

      {/* Linha 2 — Gráfico de performance */}
      <Card style={{ padding: 0 }}>
        <div style={{ padding: '18px 22px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--fg)' }}>Performance do portfólio</div>
            <div style={{ fontSize: 11, color: 'var(--fg-mute)', marginTop: 2 }}>
              {fmtPct(seriesDelta)} · {seriesDeltaAbs >= 0 ? '+' : ''}{fmtBRL(seriesDeltaAbs)} no período
            </div>
          </div>
          <RangeTabs value={range} onChange={setRange} />
        </div>
        <div style={{ paddingBottom: 8 }}>
          <BigChart data={series} height={260} />
        </div>
      </Card>

      {/* Linha 3 — Holdings + Donut */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.7fr 1fr', gap: 14 }}>

        {/* Holdings table */}
        <Card style={{ padding: 0 }}>
          <div style={{ padding: '18px 22px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--fg)' }}>
              Meus ativos <span style={{ color: 'var(--fg-mute)', fontWeight: 400 }}>({enriched.length})</span>
            </span>
          </div>
          {/* Header row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 100px 100px 90px 84px', gap: 0, padding: '0 22px 8px', borderBottom: '1px solid var(--border-soft)' }}>
            {['Ativo', 'Saldo', 'Preço', 'P&L', '7d'].map(h => (
              <div key={h} style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--fg-mute)' }}>{h}</div>
            ))}
          </div>
          {enriched.map(e => {
            const pnl = e.currentValue - e.cost;
            const pnlPct = (pnl / e.cost) * 100;
            const s7d = SERIES[e.coin.id]['1S'];
            return (
              <div
                key={e.coin}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 100px 100px 90px 84px',
                  gap: 0,
                  padding: '0 22px',
                  height: 52,
                  alignItems: 'center',
                  borderTop: '1px solid var(--border-soft)',
                  cursor: 'pointer',
                  transition: 'background 0.1s',
                }}
                onMouseEnter={ev => (ev.currentTarget.style.background = 'var(--surface-2)')}
                onMouseLeave={ev => (ev.currentTarget.style.background = 'transparent')}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <CoinMark symbol={e.coin.symbol} color={e.coin.color} size={26} />
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--fg)' }}>{e.coin.name}</div>
                    <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--fg-mute)' }}>{e.coin.symbol}</div>
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 13, fontFamily: 'var(--font-mono)', color: 'var(--fg)' }}>{fmtBRL(e.currentValue)}</div>
                  <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--fg-mute)' }}>{fmtAmount(e.amount)} {e.coin.symbol}</div>
                </div>
                <div style={{ fontSize: 13, fontFamily: 'var(--font-mono)', color: 'var(--fg)' }}>
                  {fmtBRL(e.coin.price * USD_BRL)}
                </div>
                <div>
                  <div style={{ fontSize: 13, fontFamily: 'var(--font-mono)', color: pnl >= 0 ? 'var(--up-fg)' : 'var(--down-fg)' }}>
                    {pnl >= 0 ? '+' : ''}{fmtBRL(pnl)}
                  </div>
                  <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--fg-mute)' }}>
                    {fmtPct(pnlPct)}
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Sparkline data={s7d} width={84} height={26} />
                </div>
              </div>
            );
          })}
        </Card>

        {/* Allocation Donut */}
        <Card style={{ padding: 22 }}>
          <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--fg)', marginBottom: 18 }}>Alocação</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
            <div style={{ position: 'relative' }}>
              <AllocationDonut
                slices={donutSlices}
                size={140}
                totalLabel={fmtAbrev(totalValue)}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
              {enriched.map(e => {
                const pct = (e.currentValue / totalValue) * 100;
                return (
                  <div key={e.coin.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 8, height: 8, borderRadius: 2, background: e.coin.color, flexShrink: 0 }} />
                    <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--fg)' }}>{e.coin.symbol}</span>
                    <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--fg-mute)', marginLeft: 'auto' }}>
                      {pct.toFixed(1)}%
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </Card>
      </div>

      {/* Linha 4 — Transações recentes + Mercado */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.7fr 1fr', gap: 14 }}>

        {/* Transações recentes */}
        <Card style={{ padding: 0 }}>
          <div style={{ padding: '18px 22px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-soft)' }}>
            <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--fg)' }}>Transações recentes</span>
            <button style={{
              border: '1px solid var(--border-soft)',
              background: 'transparent',
              borderRadius: 6,
              padding: '5px 10px',
              fontSize: 12,
              color: 'var(--fg-soft)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 5,
            }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M12 5v14M5 12h14"/>
              </svg>
              Adicionar
            </button>
          </div>
          {TRANSACTIONS.map(tx => {
            const coin = coinMap[tx.coin];
            const buy = tx.type === 'buy';
            const total = tx.amount * tx.price * USD_BRL;
            return (
              <div
                key={tx.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '12px 22px',
                  borderTop: '1px solid var(--border-soft)',
                  transition: 'background 0.1s',
                }}
                onMouseEnter={ev => (ev.currentTarget.style.background = 'var(--surface-2)')}
                onMouseLeave={ev => (ev.currentTarget.style.background = 'transparent')}
              >
                {/* Ícone */}
                <div style={{
                  width: 28, height: 28, borderRadius: 7,
                  background: buy ? 'var(--up-bg)' : 'var(--down-bg)',
                  color: buy ? 'var(--up-fg)' : 'var(--down-fg)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    {buy
                      ? <><path d="M12 19V5"/><path d="M5 12l7-7 7 7"/></>
                      : <><path d="M12 5v14"/><path d="M19 12l-7 7-7-7"/></>
                    }
                  </svg>
                </div>
                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--fg)' }}>
                    {buy ? 'Compra' : 'Venda'} · {coin?.symbol}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--fg-mute)' }}>{tx.venue} · {fmtDate(tx.date)}</div>
                </div>
                {/* Valores */}
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 13, fontFamily: 'var(--font-mono)', color: 'var(--fg)', fontWeight: 500 }}>
                    {fmtBRL(total)}
                  </div>
                  <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--fg-mute)' }}>
                    {fmtAmount(tx.amount)} @ {fmtBRL(tx.price * USD_BRL)}
                  </div>
                </div>
              </div>
            );
          })}
        </Card>

        {/* Mercado em destaque */}
        <Card style={{ padding: 0 }}>
          <div style={{ padding: '18px 22px 12px', borderBottom: '1px solid var(--border-soft)' }}>
            <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--fg)' }}>Mercado em destaque</span>
          </div>
          {COINS.slice(0, 5).map(coin => (
            <div
              key={coin.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '10px 22px',
                borderTop: '1px solid var(--border-soft)',
                cursor: 'pointer',
                transition: 'background 0.1s',
              }}
              onMouseEnter={ev => (ev.currentTarget.style.background = 'var(--surface-2)')}
              onMouseLeave={ev => (ev.currentTarget.style.background = 'transparent')}
            >
              <CoinMark symbol={coin.symbol} color={coin.color} size={26} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12.5, fontWeight: 500, color: 'var(--fg)' }}>{coin.symbol}</div>
                <div style={{ fontSize: 10.5, color: 'var(--fg-mute)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{coin.name}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 13, fontFamily: 'var(--font-mono)', color: 'var(--fg)' }}>
                  {fmtBRL(coin.price * USD_BRL)}
                </div>
                <Pill value={coin.change24h} size="sm" />
              </div>
            </div>
          ))}
        </Card>
      </div>

    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/app/(dashboard)/dashboard/page.tsx
git commit -m "feat: implement Dashboard page with mock data, charts, holdings, and market"
```

---

## Task 10: Verificação visual

- [ ] **Step 1: Iniciar o servidor de desenvolvimento**

```bash
cd frontend && npm run dev
```

Esperado: servidor rodando em `http://localhost:3000`

- [ ] **Step 2: Verificar cada seção no browser**

Abrir `http://localhost:3000/dashboard` e checar:
- [ ] Shell: Sidebar 232px visível com logo, nav, privacy toggle, user chip
- [ ] TopBar: subtítulo + título "Dashboard" + busca fake + sino
- [ ] KPI row: 3 cards em grid 2fr/1fr/1fr com valores em BRL mono
- [ ] Gráfico: área colorida com RangeTabs funcionando (trocar range re-renderiza)
- [ ] Holdings table: 5 linhas com CoinMark, sparklines, P&L colorido
- [ ] Donut: segmentos coloridos com legenda
- [ ] Transações: ícones ▲/▼ coloridos, valores formatados
- [ ] Mercado: 5 moedas com Pill 24h
- [ ] Privacy toggle: clicar deve esconder/mostrar valores (ainda não conectado ao dashboard — ok por agora)

- [ ] **Step 3: Commit final**

```bash
git add -A
git commit -m "feat: AgonCripto shell + dashboard completo com dados mock"
```

---

## Self-Review

**Cobertura do spec:**
- ✅ Sidebar: logo, CTA, nav (5 itens), privacy toggle, user chip — Task 6
- ✅ TopBar: subtítulo, título, busca fake, sino — Task 7
- ✅ KPI row: patrimônio (38px mono), P&L, custo — Task 9
- ✅ Performance chart: área Recharts, RangeTabs, delta no header — Tasks 4 + 9
- ✅ Holdings table: CoinMark, saldo, preço, P&L, sparkline 7d — Task 9
- ✅ Allocation donut: SVG strokeDasharray, legenda — Tasks 5 + 9
- ✅ Transações recentes: ícone ▲/▼ colorido, venue, data, total — Task 9
- ✅ Mercado: 5 moedas, preço, Pill 24h — Task 9
- ✅ Design tokens light mode — Task 1
- ✅ Dark mode tokens (CSS vars prontas, toggle de UI fica para depois) — Task 1
- ✅ Hover states nas linhas — Task 9
- ✅ RangeTabs funcional — Tasks 5 + 9
- ⚠️ Privacy toggle não propaga para o dashboard ainda (hideValues passado pela sidebar mas não usado no page) — aceitável nesta iteração; a próxima iteração move para Context

**Placeholder scan:** nenhum TBD/TODO no plano. Código completo em todos os steps.

**Consistência de tipos:**
- `Range` exportado de `mock-data.ts` e importado em `range-tabs.tsx` e `dashboard/page.tsx` ✅
- `fmtAbrev` definido em `formatters.ts` e usado no dashboard ✅
- `USD_BRL` exportado de `mock-data.ts` e usado no dashboard ✅
