# AgonCripto — Testing Design

**Date:** 2026-04-30
**Scope:** frontend Next.js app (`frontend/`)
**Stack:** Vitest + @testing-library/react + jsdom

---

## Goals

- Cover all pure functions in `lib/` with unit tests
- Cover UI primitive components with render + behavior tests
- Cover all four pages with smoke tests (renders without crash, key content visible)
- Provide a `npm run test` command and a pre-commit hook that blocks broken commits

---

## Test Stack

| Package | Role |
|---|---|
| `vitest` | Test runner (fast, native TS/ESM) |
| `@testing-library/react` | Component rendering |
| `@testing-library/jest-dom` | DOM matchers (`toBeInTheDocument`, etc.) |
| `@testing-library/user-event` | User interaction simulation |
| `jsdom` | DOM environment |
| `@vitejs/plugin-react` | JSX transform for Vitest |

---

## File Structure

```
frontend/
  vitest.config.ts
  vitest.setup.ts
  src/
    __tests__/
      lib/
        formatters.test.ts   — fmtBRL, fmtPct, fmtAmount, fmtDate, fmtAbrev, fmtRelative, shortAddr
        mock-data.test.ts    — data integrity: unique IDs, required fields, numeric ranges
      components/
        pill.test.tsx        — positive/negative color, value display
        coin-mark.test.tsx   — symbol render, color dot
        sparkline.test.tsx   — renders SVG path
        allocation-donut.test.tsx — renders slices, labels
      pages/
        dashboard.test.tsx   — smoke: KPIs visible, chart present, holdings list
        wallets.test.tsx     — smoke: wallet rows, total balance, status pills
        transactions.test.tsx — smoke: tx rows, filter buttons, KPI values
        alerts.test.tsx      — smoke: alert rows grouped by status
```

---

## Coverage Targets

| Layer | What | Target |
|---|---|---|
| `lib/formatters.ts` | All 7 exported functions | 100% branch coverage |
| `lib/mock-data.ts` | Data shape invariants | Key fields present, no NaN |
| UI components | Pill, CoinMark, Sparkline, AllocationDonut | Render + key props |
| Pages | Dashboard, Wallets, Transactions, Alerts | No crash + key text visible |

---

## Pre-commit Hook

A `.git/hooks/pre-commit` shell script that runs `npm run test --run` inside `frontend/`. Blocks the commit if any test fails. No Husky dependency — pure Git hook.

```sh
#!/bin/sh
cd frontend && npm run test -- --run
```

---

## `package.json` Scripts

```json
"test":       "vitest",
"test:run":   "vitest run",
"test:cover": "vitest run --coverage"
```

---

## Testing Rules (for new implementations)

1. **New pure function** → add cases to the relevant `lib/*.test.ts`
2. **New UI component** → add `components/<name>.test.tsx` with render + key prop tests
3. **New page** → add `pages/<name>.test.tsx` with smoke test (renders, key headings/values visible)
4. **Pre-commit hook** enforces: all tests green before any commit lands
