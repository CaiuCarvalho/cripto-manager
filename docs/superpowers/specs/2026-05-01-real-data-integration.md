# AgonCripto — Real Data Integration Spec

**Date:** 2026-05-01
**Scope:** Replace all mock data with real Supabase + backend API calls across the four main pages. Add manual BUY/SELL transaction recording.

---

## 1. Goal

Remove `mock-data.ts` dependencies from every dashboard page and wire each screen to live data. Users track their crypto portfolio by recording manual buy/sell transactions (CEX trades) and/or connecting on-chain wallets. System must be simple, consistent, and easy to evolve — not perfect.

---

## 2. Data Layer

### 2.1 New Supabase table: `manual_transactions`

```sql
CREATE TABLE IF NOT EXISTS manual_transactions (
  id          UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID           NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  side        TEXT           NOT NULL CHECK (side IN ('BUY', 'SELL')),
  coin_id     TEXT           NOT NULL,
  coin_symbol TEXT           NOT NULL,
  amount      NUMERIC(36,18) NOT NULL CHECK (amount > 0),
  price_usd   NUMERIC(18,6)  NOT NULL CHECK (price_usd > 0),
  fee_usd     NUMERIC(18,6)  NOT NULL DEFAULT 0,
  venue       TEXT,
  source      TEXT           NOT NULL DEFAULT 'manual',
  traded_at   TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
  created_at  TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

ALTER TABLE manual_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "manual_tx_select_own" ON manual_transactions
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "manual_tx_insert_own" ON manual_transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "manual_tx_delete_own" ON manual_transactions
  FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_manual_tx_user_traded
  ON manual_transactions (user_id, traded_at DESC);
```

Key decisions:
- `coin_id` is the CoinGecko identifier (e.g. `"bitcoin"`, `"ethereum"`) — used for price fetching
- `coin_symbol` is display-only (e.g. `"BTC"`, `"ETH"`)
- `side` replaces `type` to avoid collision with SQL reserved word and align with trading terminology
- `fee_usd` defaults to 0 — optional but stored for future P&L accuracy
- `source` defaults to `'manual'` — reserved for future import sources
- `user_id` is set server-side from the JWT — never trusted from frontend payload

Applied via Supabase SQL Editor. No migration tooling required.

---

## 3. Backend Changes

### 3.1 Unified Transaction type

All endpoints that return transactions use this shape:

```ts
type Transaction = {
  id: string
  source: 'manual' | 'onchain'
  side: 'BUY' | 'SELL'
  coin_id: string
  coin_symbol: string
  amount: number
  price_usd: number
  value_usd: number        // calculated on backend: amount * price_usd
  fee_usd?: number
  venue?: string
  traded_at: string        // ISO 8601
}
```

`value_usd` is always computed server-side. On-chain transactions are mapped to this format before being returned (RECEIVE → BUY, SEND → SELL as closest equivalent).

### 3.2 `POST /api/transactions` — new endpoint

**File:** `backend/src/routes/transactions.js`

Payload:
```json
{
  "side": "BUY",
  "coin_id": "bitcoin",
  "coin_symbol": "BTC",
  "amount": 0.042,
  "price_usd": 70180.00,
  "fee_usd": 0,
  "venue": "Binance",
  "traded_at": "2026-04-26T14:32:00"
}
```

Validation:
- `side`: required, must be `'BUY'` or `'SELL'`
- `coin_id`: required, non-empty string
- `coin_symbol`: required, non-empty string, stored uppercased
- `amount`: required, number > 0
- `price_usd`: required, number > 0
- `fee_usd`: optional, number >= 0, defaults to 0
- `venue`: optional string
- `traded_at`: optional ISO date, defaults to NOW()

`user_id` extracted from `req.user.id` (JWT middleware) — never from body.

Returns the created row mapped to the unified Transaction type.

### 3.3 `GET /api/transactions` — updated

Merges results from `transactions` (on-chain) and `manual_transactions`. Both sets are mapped to the unified Transaction type. Existing filters (`type`/`side`, `token_symbol`/`coin_symbol`, `limit`, `offset`) applied across the merged set, sorted by `traded_at DESC`.

### 3.4 `DELETE /api/transactions/:id?source=manual|onchain` — updated

`source` query param is **required**. Returns 400 if omitted.

- `source=manual` → deletes from `manual_transactions` where `id` AND `user_id` match
- `source=onchain` → deletes from `transactions` where `id` AND `user_id` match

Returns 404 if not found, 403 if user_id mismatch. Does not guess or try both tables.

### 3.5 `GET /api/portfolio/summary` — updated

**Balance calculation using average cost method:**

1. Fetch all `manual_transactions` for the user sorted by `traded_at ASC`
2. Fetch all on-chain `transactions` (RECEIVE/SEND) for the user
3. Build per-`coin_id` position:
   - BUY / RECEIVE: `quantity += amount`, `total_cost += amount * price_usd`
   - SELL / SEND: `quantity -= amount`, `avg_cost` stays the same (average cost method)
4. Skip coins with `quantity <= 0`
5. Fetch current prices from CoinGecko using `coin_id` list (see §3.6)
6. Per asset return:
   - `coin_id`, `coin_symbol`, `quantity`
   - `current_price_usd`, `current_value_usd`
   - `avg_cost_usd`, `cost_basis_usd` (quantity * avg_cost)
   - `pnl_usd`, `pnl_pct`
7. Totals: sum of all `current_value_usd`, `cost_basis_usd`, `pnl_usd`
8. Include `usd_brl` rate (from CoinGecko `ids=tether` quote or hardcoded fallback `5.10`)

### 3.6 CoinGecko cache

Simple in-memory cache module at `backend/src/services/priceCache.js`:

```js
const cache = {}  // { [coin_ids_key]: { data, expires_at } }

async function getPrices(coinIds) {
  const key = coinIds.sort().join(',')
  const now = Date.now()
  if (cache[key] && cache[key].expires_at > now) return cache[key].data
  const data = await fetchFromCoinGecko(coinIds)
  cache[key] = { data, expires_at: now + 45_000 }  // 45s TTL
  return data
}
```

Uses `coin_id` (CoinGecko IDs) — not symbols — for price lookups. No external cache dependency (Redis, etc.).

### 3.7 `GET /api/portfolio/history?days=30` — updated

Calculates on-demand. For each day in the range:
1. Take all transactions (manual + on-chain) up to that day's end
2. Calculate quantity per coin using average cost
3. Multiply by that day's price (use current price as proxy — no historical price API needed for MVP)

Returns array of `{ date: string, value_usd: number }` sorted ASC.

Note: Using current prices as proxy for all historical points is a simplification — acceptable for MVP. Historical price accuracy can be added later.

---

## 4. Frontend Changes

### 4.1 Data fetching: SWR

Use `swr` package for all data fetching in client components. Provides cache, deduplication, revalidation on focus, and consistent loading/error states without custom hook complexity.

Install: `npm install swr`

Pattern per page:
```ts
const { data, error, isLoading, mutate } = useSWR('/api/portfolio/summary', fetcher)
```

`fetcher` uses `lib/api.ts` (axios with JWT injection already configured).

### 4.2 New shared components

**`src/components/ui/modal.tsx`** — overlay + card wrapper, accepts `open`, `onClose`, `title`, `children`. Used by all three form dialogs.

**`src/components/ui/loading-skeleton.tsx`** — animated pulse rows. Props: `rows`, `height`.

**`src/components/ui/empty-state.tsx`** — centered message + optional CTA button.

### 4.3 Dashboard (`/dashboard`)

| Data | Source |
|------|--------|
| KPIs (patrimônio, P&L, custo) | `GET /api/portfolio/summary` |
| Gráfico de área | `GET /api/portfolio/history?days=<N>` |
| Donut + holdings table | derived from `summary.assets` |
| Transações recentes | `GET /api/transactions?limit=5` |
| Mercado em destaque | derived from `summary.assets` (prices) |

Range tabs → days mapping: `1D→1`, `1S→7`, `1M→30`, `3M→90`, `1A→365`, `Tudo→1825`.

When `summary.assets` is empty: show `EmptyState` with CTA "Adicionar transação" linking to `/transactions`.

### 4.4 Wallets (`/wallets`)

| Action | Implementation |
|--------|---------------|
| List | `GET /api/wallets` via SWR |
| Add | Modal → `POST /api/wallets` → `mutate()` |
| Delete | `DELETE /api/wallets/:id` → optimistic remove via `mutate()` |

Modal fields: `address` (text, required), `network` (select: ETH/BTC/SOL/BSC/MATIC/AVAX/ARB/OP, required).

### 4.5 Transactions (`/transactions`)

| Action | Implementation |
|--------|---------------|
| List | `GET /api/transactions` via SWR |
| Add | Modal → `POST /api/transactions` → `mutate()` |
| Delete | `DELETE /api/transactions/:id?source=<source>` → optimistic remove |

Modal fields (all validated client-side before submit):
- `side`: BUY / SELL (required)
- `coin_id`: text (required) — user types CoinGecko ID e.g. "bitcoin"
- `coin_symbol`: text (required) — display symbol e.g. "BTC"
- `amount`: number > 0 (required)
- `price_usd`: number > 0 (required)
- `fee_usd`: number >= 0 (optional, default 0)
- `venue`: text (optional)
- `traded_at`: datetime (optional, defaults to now)

`source` badge shown on each row: pill "Manual" or "On-chain".

### 4.6 Alerts (`/alerts`)

| Action | Implementation |
|--------|---------------|
| List | `GET /api/alerts` via SWR |
| Add | Modal → `POST /api/alerts` → `mutate()` |
| Delete | `DELETE /api/alerts/:id` → optimistic remove |

Modal fields: `coin_symbol` (required), `target_price` number > 0 (required), `direction` ABOVE/BELOW (required).

---

## 5. Error Handling

- API errors shown as inline message within the affected section
- 401 → redirect to `/login` (handled by existing axios interceptor)
- Empty list → `EmptyState` component with context-appropriate message
- Form submit → button disabled + spinner while in-flight
- Optimistic deletes revert on API error via SWR `mutate()`
- CoinGecko unavailable → portfolio/summary returns last cached prices if within 5min, otherwise returns error to client

---

## 6. Validations

**Frontend (modal):**
- `amount > 0`
- `price_usd > 0`
- `coin_id` and `coin_symbol` non-empty
- `traded_at` defaults to current datetime if blank

**Backend (all POST endpoints):**
- Re-validate all fields (never trust frontend)
- Return 422 with field-level error messages on validation failure

---

## 7. Files Changed

| File | Change |
|------|--------|
| `backend/src/services/priceCache.js` | New — CoinGecko in-memory cache |
| `backend/src/routes/transactions.js` | Add POST, update GET + DELETE |
| `backend/src/routes/portfolio.js` | Update summary + history |
| `frontend/package.json` | Add `swr` |
| `frontend/src/components/ui/modal.tsx` | New |
| `frontend/src/components/ui/loading-skeleton.tsx` | New |
| `frontend/src/components/ui/empty-state.tsx` | New |
| `frontend/src/app/(dashboard)/dashboard/page.tsx` | Replace mock with SWR calls |
| `frontend/src/app/(dashboard)/wallets/page.tsx` | Replace mock + add forms |
| `frontend/src/app/(dashboard)/transactions/page.tsx` | Replace mock + add forms |
| `frontend/src/app/(dashboard)/alerts/page.tsx` | Replace mock + add forms |

`mock-data.ts` and `formatters.ts` remain (used by existing tests). No page imports them after this change.

---

## 8. Out of Scope

- Edit transaction / edit alert (add + delete only)
- Pagination UI (backend supports it; frontend shows first 50 results)
- Historical prices from CoinGecko (current price used as proxy for history chart)
- Dark mode toggle UI
- GitHub Actions CD pipeline
- On-chain sync API keys (cron runs but blockchain APIs are optional)
- FIFO or tax-lot cost basis methods
