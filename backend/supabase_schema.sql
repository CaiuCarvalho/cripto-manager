-- =============================================================================
-- Supabase Database Schema — Crypto Account Management System
-- =============================================================================
-- Description : Complete schema with tables, indexes, RLS policies and comments
-- Target      : Supabase (PostgreSQL 15+)
-- Auth        : Relies on auth.users managed by Supabase Auth
-- Run order   : Execute once on a clean Supabase project
-- =============================================================================

BEGIN;

-- ---------------------------------------------------------------------------
-- 1. TABLE: wallets
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS wallets (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name           TEXT        NOT NULL,
  address        TEXT        NOT NULL,
  network        TEXT        NOT NULL,
  last_synced_at TIMESTAMPTZ,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE (user_id, address, network),

  CONSTRAINT wallets_network_check CHECK (
    network IN ('ETH', 'BTC', 'SOL', 'BSC', 'MATIC', 'AVAX', 'ARB', 'OP')
  )
);

COMMENT ON TABLE wallets IS
  'Blockchain wallets owned by users. Each row represents one address on one network.';

COMMENT ON COLUMN wallets.name           IS 'Human-readable alias given by the user (e.g. "My Main ETH Wallet").';
COMMENT ON COLUMN wallets.address        IS 'Public blockchain address (case-sensitive for some networks such as SOL).';
COMMENT ON COLUMN wallets.network        IS 'Blockchain network identifier. Allowed values: ETH, BTC, SOL, BSC, MATIC, AVAX, ARB, OP.';
COMMENT ON COLUMN wallets.last_synced_at IS 'Timestamp of the most recent successful transaction sync. NULL means never synced.';

-- ---------------------------------------------------------------------------
-- 2. TABLE: transactions
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS transactions (
  id                 UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_id          UUID           NOT NULL REFERENCES wallets(id) ON DELETE CASCADE,
  user_id            UUID           NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tx_hash            TEXT           NOT NULL,
  type               TEXT           NOT NULL,
  token_symbol       TEXT           NOT NULL,
  token_address      TEXT,
  amount             NUMERIC(36,18) NOT NULL,
  from_address       TEXT,
  to_address         TEXT,
  fee_native         NUMERIC(36,18),
  fee_usd            NUMERIC(18,6),
  price_usd_at_time  NUMERIC(18,6),
  value_usd          NUMERIC(18,6),
  block_number       BIGINT,
  confirmed_at       TIMESTAMPTZ,
  raw_data           JSONB,
  created_at         TIMESTAMPTZ    NOT NULL DEFAULT NOW(),

  UNIQUE (tx_hash, wallet_id),

  CONSTRAINT transactions_type_check CHECK (
    type IN ('SEND', 'RECEIVE', 'SWAP', 'CONTRACT', 'STAKE')
  )
);

COMMENT ON TABLE transactions IS
  'On-chain transactions imported from blockchain APIs (Etherscan, Moralis, Solscan, Blockchain.com).';

COMMENT ON COLUMN transactions.type              IS 'Transaction category. Allowed values: SEND, RECEIVE, SWAP, CONTRACT, STAKE.';
COMMENT ON COLUMN transactions.token_address     IS 'Smart-contract address of the token. NULL for native coins (ETH, BTC, SOL, etc.).';
COMMENT ON COLUMN transactions.amount            IS 'Token amount transferred, stored with full 18-decimal precision.';
COMMENT ON COLUMN transactions.fee_native        IS 'Network fee paid in the native coin (gas for ETH, lamports for SOL, etc.).';
COMMENT ON COLUMN transactions.fee_usd           IS 'Network fee converted to USD at the time of the transaction.';
COMMENT ON COLUMN transactions.price_usd_at_time IS 'Historical USD price of the token at the moment the transaction was confirmed.';
COMMENT ON COLUMN transactions.value_usd         IS 'USD value of the transfer: amount * price_usd_at_time.';
COMMENT ON COLUMN transactions.block_number      IS 'Block height at which the transaction was confirmed on-chain.';
COMMENT ON COLUMN transactions.confirmed_at      IS 'Block timestamp when the transaction reached finality.';
COMMENT ON COLUMN transactions.raw_data          IS 'Raw JSON payload from the originating API. Retained for reprocessing or auditing.';

-- ---------------------------------------------------------------------------
-- 3. TABLE: price_alerts
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS price_alerts (
  id           UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID           NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  coin_symbol  TEXT           NOT NULL,
  target_price NUMERIC(18,6)  NOT NULL,
  direction    TEXT           NOT NULL,
  active       BOOLEAN        NOT NULL DEFAULT TRUE,
  triggered_at TIMESTAMPTZ,
  created_at   TIMESTAMPTZ    NOT NULL DEFAULT NOW(),

  CONSTRAINT price_alerts_direction_check CHECK (
    direction IN ('ABOVE', 'BELOW')
  )
);

COMMENT ON TABLE price_alerts IS
  'User-defined price alert rules that fire when a coin crosses a target price threshold.';

COMMENT ON COLUMN price_alerts.coin_symbol  IS 'Ticker symbol of the cryptocurrency to monitor (e.g. BTC, ETH, SOL).';
COMMENT ON COLUMN price_alerts.target_price IS 'Price level in USD that triggers the alert.';
COMMENT ON COLUMN price_alerts.direction    IS 'Alert fires when price goes ABOVE or BELOW the target. Allowed values: ABOVE, BELOW.';
COMMENT ON COLUMN price_alerts.active       IS 'FALSE after the alert has been triggered or manually disabled by the user.';
COMMENT ON COLUMN price_alerts.triggered_at IS 'Timestamp when the alert condition was first met. NULL while still pending.';

-- ---------------------------------------------------------------------------
-- 4. TABLE: sync_logs
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS sync_logs (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_id     UUID        NOT NULL REFERENCES wallets(id) ON DELETE CASCADE,
  status        TEXT        NOT NULL,
  txs_found     INTEGER     NOT NULL DEFAULT 0,
  error_message TEXT,
  synced_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT sync_logs_status_check CHECK (
    status IN ('SUCCESS', 'ERROR', 'PARTIAL')
  )
);

COMMENT ON TABLE sync_logs IS
  'Audit trail of every synchronization job run against a wallet by the backend service.';

COMMENT ON COLUMN sync_logs.status        IS 'Outcome of the sync job. Allowed values: SUCCESS, ERROR, PARTIAL.';
COMMENT ON COLUMN sync_logs.txs_found     IS 'Number of new transactions discovered and persisted in this sync run.';
COMMENT ON COLUMN sync_logs.error_message IS 'Human-readable error description when status is ERROR or PARTIAL.';
COMMENT ON COLUMN sync_logs.synced_at     IS 'Wall-clock time when the sync job completed (success or failure).';

-- ---------------------------------------------------------------------------
-- 5. INDEXES
-- ---------------------------------------------------------------------------

-- wallets
CREATE INDEX IF NOT EXISTS idx_wallets_user_id
  ON wallets (user_id);

-- transactions
CREATE INDEX IF NOT EXISTS idx_transactions_wallet_id
  ON transactions (wallet_id);

CREATE INDEX IF NOT EXISTS idx_transactions_user_id
  ON transactions (user_id);

CREATE INDEX IF NOT EXISTS idx_transactions_confirmed_at
  ON transactions (confirmed_at DESC);

CREATE INDEX IF NOT EXISTS idx_transactions_type
  ON transactions (type);

CREATE INDEX IF NOT EXISTS idx_transactions_token_symbol
  ON transactions (token_symbol);

-- price_alerts
CREATE INDEX IF NOT EXISTS idx_price_alerts_user_id_active
  ON price_alerts (user_id, active);

-- sync_logs
CREATE INDEX IF NOT EXISTS idx_sync_logs_wallet_id_synced_at
  ON sync_logs (wallet_id, synced_at DESC);

-- ---------------------------------------------------------------------------
-- 6. ROW LEVEL SECURITY
-- ---------------------------------------------------------------------------

-- ---- wallets ---------------------------------------------------------------
ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "wallets_select_own" ON wallets
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "wallets_insert_own" ON wallets
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "wallets_update_own" ON wallets
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "wallets_delete_own" ON wallets
  FOR DELETE USING (auth.uid() = user_id);

-- ---- transactions ----------------------------------------------------------
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "transactions_select_own" ON transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "transactions_insert_own" ON transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "transactions_update_own" ON transactions
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "transactions_delete_own" ON transactions
  FOR DELETE USING (auth.uid() = user_id);

-- ---- price_alerts ----------------------------------------------------------
ALTER TABLE price_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "price_alerts_select_own" ON price_alerts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "price_alerts_insert_own" ON price_alerts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "price_alerts_update_own" ON price_alerts
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "price_alerts_delete_own" ON price_alerts
  FOR DELETE USING (auth.uid() = user_id);

-- ---- sync_logs -------------------------------------------------------------
-- sync_logs are written exclusively by the backend service_role.
-- Regular authenticated users can only read logs for their own wallets.
-- No INSERT / UPDATE / DELETE policies for the anon or authenticated roles.
ALTER TABLE sync_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "sync_logs_select_own" ON sync_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM wallets w
      WHERE w.id = sync_logs.wallet_id
        AND w.user_id = auth.uid()
    )
  );

-- service_role bypasses RLS automatically in Supabase, so no explicit
-- INSERT/UPDATE/DELETE policies are needed for the backend admin client.

COMMIT;

-- =============================================================================
-- ROLLBACK / CLEANUP  (commented out — uncomment only in development)
-- =============================================================================
--
-- BEGIN;
--
-- DROP TABLE IF EXISTS sync_logs      CASCADE;
-- DROP TABLE IF EXISTS price_alerts   CASCADE;
-- DROP TABLE IF EXISTS transactions   CASCADE;
-- DROP TABLE IF EXISTS wallets        CASCADE;
--
-- COMMIT;
