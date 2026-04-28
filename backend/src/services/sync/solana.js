'use strict';

/**
 * Solana Sync Engine
 * Collects transactions from Solana wallets via the Solscan Pro API v2.
 * Supports native SOL transfers and SPL token transfers.
 *
 * NOTE: This module does NOT enrich with historical prices — that is the
 * orchestrator's responsibility.
 * NOTE: This module does NOT schedule syncs — it only collects when called.
 */

const axios = require('axios');
const { supabaseAdmin } = require('../../config/supabase');
const env = require('../../config/env');
const logger = require('../../utils/logger');

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const SOLSCAN_API_BASE = 'https://pro-api.solscan.io/v2.0';
const PAGE_SIZE = 50;
const PAGE_DELAY_MS = 200;
const REQUEST_TIMEOUT_MS = 15000;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Sleeps for the given number of milliseconds.
 * @param {number} ms
 */
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Builds the HTTP headers for the Solscan API request.
 * If an API key is configured, it is included; otherwise requests proceed
 * without authentication (lower rate limits apply).
 *
 * @returns {object}
 */
function buildHeaders() {
  const headers = {
    'Content-Type': 'application/json',
  };
  if (env.solscanApiKey) {
    headers['token'] = env.solscanApiKey;
  }
  return headers;
}

/**
 * Fetches one page of transfers (SOL native or SPL token) from Solscan.
 *
 * @param {'account/transfer'|'account/token/transfer'} endpoint - API path segment.
 * @param {string} address - Solana wallet address (base58).
 * @param {number} page    - 1-based page number.
 * @returns {Promise<{ success: boolean, data: object[] }>}
 */
async function fetchPage(endpoint, address, page) {
  const url = `${SOLSCAN_API_BASE}/${endpoint}`;
  const response = await axios.get(url, {
    params: {
      address,
      page,
      page_size: PAGE_SIZE,
      sort_by: 'block_time',
      sort_order: 'asc',
    },
    headers: buildHeaders(),
    timeout: REQUEST_TIMEOUT_MS,
  });
  return response.data;
}

/**
 * Normalizes a raw Solscan transfer into the DB schema format.
 *
 * @param {object} transfer - Raw transfer object from Solscan API.
 * @param {object} wallet   - Wallet record { id, user_id, address }.
 * @returns {object}
 */
function normalizeTransfer(transfer, wallet) {
  const decimals = transfer.token_decimals != null ? transfer.token_decimals : 9;
  const amount = transfer.amount / Math.pow(10, decimals);
  const type = transfer.flow === 'out' ? 'SEND' : 'RECEIVE';

  return {
    wallet_id:         wallet.id,
    user_id:           wallet.user_id,
    tx_hash:           transfer.trans_id,
    type,
    token_symbol:      transfer.token_symbol || 'SOL',
    token_address:     transfer.token_address || null,
    amount,
    from_address:      transfer.from_address || (transfer.flow === 'out' ? wallet.address : null),
    to_address:        transfer.to_address   || (transfer.flow === 'in'  ? wallet.address : null),
    fee_native:        null,   // not provided by Solscan transfer endpoint
    fee_usd:           null,   // enriched by orchestrator
    price_usd_at_time: null,   // enriched by orchestrator
    value_usd:         null,   // enriched by orchestrator
    block_number:      transfer.block || null,
    confirmed_at:      transfer.block_time
      ? new Date(transfer.block_time * 1000).toISOString()
      : null,
    raw_data: {
      trans_id:   transfer.trans_id,
      block:      transfer.block,
      block_time: transfer.block_time,
    },
  };
}

/**
 * Fetches all pages of transfers for a given endpoint, stopping when:
 *  - The API returns success: false or an empty data array.
 *  - A transfer's block_time is older than lastSyncedTs.
 *
 * Invalid or spam transfers are filtered out and logged as warnings.
 *
 * @param {'account/transfer'|'account/token/transfer'} endpoint
 * @param {string} address      - Wallet address.
 * @param {number} lastSyncedTs - Unix timestamp (seconds); 0 means fetch all.
 * @param {string} walletId     - Wallet ID (for log messages).
 * @param {object} wallet       - Full wallet record for normalization.
 * @returns {Promise<object[]>} Normalized transaction rows.
 */
async function fetchAllTransfers(endpoint, address, lastSyncedTs, walletId, wallet) {
  const normalized = [];
  let page = 1;
  let reachedCutoff = false;

  while (true) {
    let data;
    try {
      data = await fetchPage(endpoint, address, page);
    } catch (err) {
      const status = err.response?.status;
      logger.error(
        `[SOL Sync] Solscan API error for wallet ${walletId} endpoint=${endpoint} page=${page}: ` +
        `HTTP ${status || 'N/A'} — ${err.message}`
      );
      // Return what we have so far; caller decides criticality
      break;
    }

    // API-level failure
    if (!data || data.success === false) {
      logger.warn(
        `[SOL Sync] Solscan returned success=false for wallet ${walletId} endpoint=${endpoint} page=${page}. ` +
        `Stopping pagination for this category.`
      );
      break;
    }

    const transfers = Array.isArray(data.data) ? data.data : [];

    if (transfers.length === 0) {
      break; // no more pages
    }

    for (const transfer of transfers) {
      // Filter 1: missing trans_id
      if (!transfer.trans_id) {
        logger.warn(
          `[SOL Sync] Wallet ${walletId}: transfer missing trans_id — skipping. ` +
          `block=${transfer.block} block_time=${transfer.block_time}`
        );
        continue;
      }

      // Filter 2: invalid block_time
      if (!transfer.block_time || transfer.block_time <= 0) {
        logger.warn(
          `[SOL Sync] Wallet ${walletId}: transfer ${transfer.trans_id} has invalid block_time=${transfer.block_time} — skipping.`
        );
        continue;
      }

      // Filter 3: reached last-sync cutoff
      if (lastSyncedTs > 0 && transfer.block_time < lastSyncedTs) {
        reachedCutoff = true;
        break;
      }

      // Filter 4: zero-amount spam
      if (!transfer.amount || transfer.amount === 0) {
        continue;
      }

      normalized.push(normalizeTransfer(transfer, wallet));
    }

    if (reachedCutoff) {
      logger.info(
        `[SOL Sync] Wallet ${walletId} (${endpoint}): reached already-synced block_time at page ${page} — stopping.`
      );
      break;
    }

    // Stop if this page was the last one
    if (transfers.length < PAGE_SIZE) {
      break;
    }

    page += 1;
    await sleep(PAGE_DELAY_MS);
  }

  return normalized;
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

/**
 * Syncs a single Solana wallet: fetches native SOL + SPL token transfers and
 * upserts them into the `transactions` table. Updates `wallets.last_synced_at`.
 *
 * @param {{ id: string, user_id: string, address: string, network: string, last_synced_at: string|null }} wallet
 * @returns {Promise<{ txsFound: number }>}
 */
async function syncWallet(wallet) {
  // 1. Validate required fields
  if (!wallet || !wallet.id || !wallet.user_id || !wallet.address || !wallet.network) {
    throw new Error(
      `[SOL Sync] Invalid wallet object: missing required fields. Got: ${JSON.stringify(Object.keys(wallet || {}))}`
    );
  }

  const { id: walletId, address, last_synced_at } = wallet;

  // 2. Convert last_synced_at to Unix timestamp (seconds), default 0
  let lastSyncedTs = 0;
  if (last_synced_at) {
    const parsed = new Date(last_synced_at);
    if (!isNaN(parsed.getTime())) {
      lastSyncedTs = Math.floor(parsed.getTime() / 1000);
    } else {
      logger.warn(
        `[SOL Sync] Invalid last_synced_at "${last_synced_at}" for wallet ${walletId} — fetching all transfers.`
      );
    }
  }

  logger.info(
    `[SOL Sync] Starting sync — wallet=${walletId} address=${address} last_synced_at=${last_synced_at || 'never'}`
  );

  // 3. Fetch native SOL transfers
  let solTransfers = [];
  try {
    solTransfers = await fetchAllTransfers(
      'account/transfer',
      address,
      lastSyncedTs,
      walletId,
      wallet
    );
  } catch (err) {
    logger.error(`[SOL Sync] Fatal error fetching SOL transfers for wallet ${walletId}: ${err.message}`);
    return { txsFound: 0 };
  }

  logger.info(`[SOL Sync] Wallet ${walletId}: ${solTransfers.length} SOL transfers collected.`);

  // 4. Fetch SPL token transfers
  let splTransfers = [];
  try {
    splTransfers = await fetchAllTransfers(
      'account/token/transfer',
      address,
      lastSyncedTs,
      walletId,
      wallet
    );
  } catch (err) {
    logger.error(`[SOL Sync] Fatal error fetching SPL transfers for wallet ${walletId}: ${err.message}`);
    // Non-fatal: continue with SOL transfers only
  }

  logger.info(`[SOL Sync] Wallet ${walletId}: ${splTransfers.length} SPL token transfers collected.`);

  // 5. Merge and deduplicate by tx_hash (prefer first occurrence)
  const allNormalized = [...solTransfers, ...splTransfers];

  logger.info(
    `[SOL Sync] Wallet ${walletId}: ${allNormalized.length} total transfers after merge ` +
    `(${solTransfers.length} SOL + ${splTransfers.length} SPL).`
  );

  // 9. Upsert into Supabase
  if (allNormalized.length > 0) {
    const { error: upsertError } = await supabaseAdmin
      .from('transactions')
      .upsert(allNormalized, { onConflict: 'tx_hash,wallet_id', ignoreDuplicates: false });

    if (upsertError) {
      logger.error(
        `[SOL Sync] Supabase upsert failed for wallet ${walletId}: ${upsertError.message}`
      );
      throw upsertError; // critical — propagate
    }
  }

  // 10. Update last_synced_at on the wallet record
  const { error: updateError } = await supabaseAdmin
    .from('wallets')
    .update({ last_synced_at: new Date().toISOString() })
    .eq('id', walletId);

  if (updateError) {
    logger.warn(
      `[SOL Sync] Could not update last_synced_at for wallet ${walletId}: ${updateError.message}`
    );
    // Non-critical: don't throw
  }

  logger.info(`[SOL Sync] Done — wallet=${walletId} txsFound=${allNormalized.length}`);

  // 11. Return result
  return { txsFound: allNormalized.length };
}

module.exports = { syncWallet };
