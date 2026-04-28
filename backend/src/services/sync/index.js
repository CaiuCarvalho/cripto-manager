'use strict';

/**
 * Sync Orchestrator
 * Selects the correct sync engine per wallet network, runs the sync,
 * then enriches collected transactions with historical USD prices from CoinGecko.
 */

const { supabaseAdmin } = require('../../config/supabase');
const { getPriceAtTimestamp } = require('../coinGecko');
const logger = require('../../utils/logger');

const ethereum = require('./ethereum');
const bitcoin = require('./bitcoin');
const solana = require('./solana');

// ─── Engine map ───────────────────────────────────────────────────────────────

const SYNC_ENGINES = {
  ETH:   ethereum,
  BSC:   ethereum,
  MATIC: ethereum,
  AVAX:  ethereum,
  ARB:   ethereum,
  OP:    ethereum,
  BTC:   bitcoin,
  SOL:   solana,
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ─── syncWalletWithEnrichment ────────────────────────────────────────────────

/**
 * Syncs a single wallet and enriches its unenriched transactions with
 * historical USD prices from CoinGecko.
 *
 * @param {{ id: string, user_id: string, address: string, network: string, last_synced_at: string|null }} wallet
 * @returns {Promise<{ walletId: string, txsFound: number }>}
 */
async function syncWalletWithEnrichment(wallet) {
  const { id: walletId, network } = wallet;

  const engine = SYNC_ENGINES[network];
  if (!engine) {
    const msg = `[Orchestrator] No sync engine for network "${network}" (wallet ${walletId})`;
    logger.warn(msg);
    throw new Error(msg);
  }

  // 1. Insert sync_log with status PARTIAL
  const { data: syncLog, error: logInsertError } = await supabaseAdmin
    .from('sync_logs')
    .insert({
      wallet_id: walletId,
      status: 'PARTIAL',
      txs_found: 0,
    })
    .select()
    .single();

  if (logInsertError) {
    // Non-critical: log and continue without a sync log row
    logger.warn(`[Orchestrator] Could not insert sync_log for wallet ${walletId}: ${logInsertError.message}`);
  }

  const syncLogId = syncLog?.id ?? null;

  // 2. Run the sync engine
  let txsFound = 0;
  try {
    const result = await engine.syncWallet(wallet);
    txsFound = result?.txsFound ?? 0;
  } catch (err) {
    logger.error(`[Orchestrator] Sync engine failed for wallet ${walletId}: ${err.message}`);

    if (syncLogId) {
      await supabaseAdmin
        .from('sync_logs')
        .update({ status: 'ERROR', error_message: err.message, synced_at: new Date().toISOString() })
        .eq('id', syncLogId);
    }

    throw err;
  }

  // 3. Enrich transactions that still have no price
  try {
    await enrichTransactions(walletId);
  } catch (err) {
    // Enrichment failure is non-critical: log and continue
    logger.warn(`[Orchestrator] Price enrichment failed for wallet ${walletId}: ${err.message}`);
  }

  // 4. Update sync_log to SUCCESS
  if (syncLogId) {
    const { error: logUpdateError } = await supabaseAdmin
      .from('sync_logs')
      .update({
        status: 'SUCCESS',
        txs_found: txsFound,
        synced_at: new Date().toISOString(),
      })
      .eq('id', syncLogId);

    if (logUpdateError) {
      logger.warn(`[Orchestrator] Could not update sync_log ${syncLogId}: ${logUpdateError.message}`);
    }
  }

  logger.info(`[Orchestrator] Done — wallet=${walletId} txsFound=${txsFound}`);
  return { walletId, txsFound };
}

// ─── enrichTransactions ───────────────────────────────────────────────────────

/**
 * Fetches all transactions for a wallet that still lack a USD price and
 * enriches them in batches of 10 (with 500 ms delay between batches).
 *
 * @param {string} walletId
 */
async function enrichTransactions(walletId) {
  const { data: txs, error } = await supabaseAdmin
    .from('transactions')
    .select('id, token_symbol, confirmed_at, amount')
    .eq('wallet_id', walletId)
    .is('price_usd_at_time', null);

  if (error) {
    throw new Error(`Failed to fetch unenriched transactions: ${error.message}`);
  }

  if (!txs || txs.length === 0) {
    logger.debug(`[Orchestrator] No unenriched transactions for wallet ${walletId}`);
    return;
  }

  logger.info(`[Orchestrator] Enriching ${txs.length} transaction(s) for wallet ${walletId}`);

  const BATCH_SIZE = 10;
  const BATCH_DELAY_MS = 500;

  for (let i = 0; i < txs.length; i += BATCH_SIZE) {
    const batch = txs.slice(i, i + BATCH_SIZE);

    await Promise.all(
      batch.map(async (tx) => {
        try {
          if (!tx.confirmed_at) {
            logger.warn(`[Sync Orchestrator] Skipping price enrichment for tx ${tx.id}: no confirmed_at`);
            return;
          }
          const timestamp = new Date(tx.confirmed_at).getTime();
          if (isNaN(timestamp)) {
            logger.warn(`[Sync Orchestrator] Invalid confirmed_at for tx ${tx.id}: ${tx.confirmed_at}`);
            return;
          }
          const price = await getPriceAtTimestamp(tx.token_symbol, timestamp);

          if (price == null) {
            logger.debug(`[Orchestrator] No price found for ${tx.token_symbol} at ${tx.confirmed_at} (tx ${tx.id})`);
            return;
          }

          const value_usd = tx.amount * price;

          const { error: updateError } = await supabaseAdmin
            .from('transactions')
            .update({ price_usd_at_time: price, value_usd })
            .eq('id', tx.id);

          if (updateError) {
            logger.warn(`[Orchestrator] Could not update price for tx ${tx.id}: ${updateError.message}`);
          } else {
            logger.debug(`[Orchestrator] Enriched tx ${tx.id}: price=${price} value_usd=${value_usd}`);
          }
        } catch (err) {
          logger.warn(`[Orchestrator] Price enrichment failed for tx ${tx.id}: ${err.message}`);
        }
      })
    );

    // Delay between batches to respect CoinGecko rate limits
    if (i + BATCH_SIZE < txs.length) {
      await sleep(BATCH_DELAY_MS);
    }
  }

  logger.info(`[Orchestrator] Enrichment complete for wallet ${walletId}`);
}

// ─── syncAllWallets ───────────────────────────────────────────────────────────

/**
 * Fetches all wallets from the DB and syncs them sequentially (no parallelism,
 * to avoid blowing through API rate limits).
 *
 * @returns {Promise<{ synced: number, errors: number }>}
 */
async function syncAllWallets() {
  const { data: wallets, error } = await supabaseAdmin
    .from('wallets')
    .select('*');

  if (error) {
    logger.error(`[Orchestrator] Failed to fetch wallets: ${error.message}`);
    throw new Error(`Failed to fetch wallets: ${error.message}`);
  }

  if (!wallets || wallets.length === 0) {
    logger.info('[Orchestrator] No wallets found — nothing to sync');
    return { synced: 0, errors: 0 };
  }

  logger.info(`[Orchestrator] Syncing ${wallets.length} wallet(s) sequentially...`);

  let synced = 0;
  let errors = 0;

  for (const wallet of wallets) {
    try {
      await syncWalletWithEnrichment(wallet);
      synced++;
    } catch (err) {
      logger.error(`[Orchestrator] Failed to sync wallet ${wallet.id} (${wallet.network}): ${err.message}`);
      errors++;
    }
  }

  logger.info(`[Orchestrator] All wallets processed — synced=${synced} errors=${errors}`);
  return { synced, errors };
}

module.exports = { syncWalletWithEnrichment, syncAllWallets };
