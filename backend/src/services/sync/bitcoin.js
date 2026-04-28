'use strict';

/**
 * Bitcoin Sync Engine
 * Collects transactions from Bitcoin wallets via the Blockchain.com public API.
 * Supports Legacy (1...), Script (3...), and SegWit (bc1...) address formats.
 *
 * NOTE: This module does NOT enrich with historical prices — that is the
 * orchestrator's responsibility.
 * NOTE: This module does NOT schedule syncs — it only collects when called.
 */

const axios = require('axios');
const { supabaseAdmin } = require('../../config/supabase');
const logger = require('../../utils/logger');

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const BLOCKCHAIN_API_BASE = 'https://blockchain.info';
const PAGE_LIMIT = 50;
const PAGE_DELAY_MS = 300;
const REQUEST_TIMEOUT_MS = 15000;

/** Headers required to avoid being blocked by the Blockchain.com API */
const HTTP_HEADERS = {
  'User-Agent': 'cripto-manager/1.0',
};

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
 * Validates that a Bitcoin address belongs to a supported format.
 * - Legacy  : starts with "1"  (P2PKH)
 * - Script  : starts with "3"  (P2SH)
 * - SegWit  : starts with "bc1" (Bech32)
 *
 * @param {string} address
 * @returns {boolean}
 */
function isValidBitcoinAddress(address) {
  if (typeof address !== 'string') return false;
  return (
    address.startsWith('1') ||
    address.startsWith('3') ||
    address.startsWith('bc1')
  );
}

/**
 * Fetches a single page of transactions for an address from Blockchain.com.
 *
 * @param {string} address  - Bitcoin wallet address.
 * @param {number} offset   - Pagination offset.
 * @returns {Promise<{ txs: object[], n_tx: number }>}
 */
async function fetchPage(address, offset) {
  const url = `${BLOCKCHAIN_API_BASE}/rawaddr/${encodeURIComponent(address)}`;
  const response = await axios.get(url, {
    params: { limit: PAGE_LIMIT, offset },
    headers: HTTP_HEADERS,
    timeout: REQUEST_TIMEOUT_MS,
  });
  return response.data;
}

/**
 * Determines whether the wallet address appears as a sender in the transaction.
 *
 * @param {object} tx      - Raw transaction from Blockchain.com.
 * @param {string} address - Wallet address.
 * @returns {boolean}
 */
function isSender(tx, address) {
  if (!Array.isArray(tx.inputs)) return false;
  return tx.inputs.some((input) => input.prev_out && input.prev_out.addr === address);
}

/**
 * Determines the transaction type from the wallet's perspective.
 * Returns 'SEND' if the address is found in any input's prev_out.addr,
 * otherwise 'RECEIVE'.
 *
 * @param {object} tx      - Raw transaction from Blockchain.com.
 * @param {string} address - Wallet address.
 * @returns {'SEND'|'RECEIVE'}
 */
function determineType(tx, address) {
  return isSender(tx, address) ? 'SEND' : 'RECEIVE';
}

/**
 * Calculates the net value (in satoshis) that this transaction represents
 * for the given wallet address.
 *   netValue = sum(outputs to address) - sum(inputs from address)
 *
 * @param {object} tx      - Raw transaction from Blockchain.com.
 * @param {string} address - Wallet address.
 * @returns {number} Net satoshis (can be negative for sends).
 */
function calcNetValue(tx, address) {
  const inputsTotal = Array.isArray(tx.inputs)
    ? tx.inputs.reduce((acc, input) => {
        if (input.prev_out && input.prev_out.addr === address) {
          return acc + (input.prev_out.value || 0);
        }
        return acc;
      }, 0)
    : 0;

  const outputsTotal = Array.isArray(tx.out)
    ? tx.out.reduce((acc, output) => {
        if (output.addr === address) {
          return acc + (output.value || 0);
        }
        return acc;
      }, 0)
    : 0;

  return outputsTotal - inputsTotal;
}

/**
 * Normalizes a raw Blockchain.com transaction into the DB schema format.
 *
 * @param {object} tx      - Raw tx from Blockchain.com.
 * @param {object} wallet  - Wallet record { id, user_id, address }.
 * @param {string} type    - 'SEND' | 'RECEIVE'.
 * @param {number} netValue - Net satoshis for this wallet.
 * @returns {object}
 */
function normalizeTx(tx, wallet, type, netValue) {
  const fee = typeof tx.fee === 'number' ? tx.fee : 0;

  // For RECEIVE: to_address is the wallet itself; find the first non-wallet output for SEND
  const toAddress =
    type === 'SEND'
      ? (Array.isArray(tx.out) ? tx.out.find((o) => o.addr !== wallet.address)?.addr || null : null)
      : wallet.address;

  return {
    wallet_id:         wallet.id,
    user_id:           wallet.user_id,
    tx_hash:           tx.hash,
    type,
    token_symbol:      'BTC',
    token_address:     null,
    amount:            Math.abs(netValue) / 1e8,   // satoshis → BTC
    from_address:      type === 'SEND'
      ? wallet.address
      : (Array.isArray(tx.inputs) && tx.inputs[0]?.prev_out?.addr
        ? tx.inputs[0].prev_out.addr
        : null),
    to_address:        toAddress,
    fee_native:        fee / 1e8,
    fee_usd:           null,   // enriched by orchestrator
    price_usd_at_time: null,   // enriched by orchestrator
    value_usd:         null,   // enriched by orchestrator
    block_number:      tx.block_height,
    confirmed_at:      new Date(tx.time * 1000).toISOString(),
    raw_data:          {
      hash:         tx.hash,
      block_height: tx.block_height,
      time:         tx.time,
    },
  };
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

/**
 * Syncs a single Bitcoin wallet: fetches transactions via Blockchain.com and
 * upserts them into the `transactions` table. Updates `wallets.last_synced_at`.
 *
 * @param {{ id: string, user_id: string, address: string, network: string, last_synced_at: string|null }} wallet
 * @returns {Promise<{ txsFound: number }>}
 */
async function syncWallet(wallet) {
  // --- Validation ---
  if (!wallet || !wallet.id || !wallet.user_id || !wallet.address) {
    throw new Error(
      `[BTC Sync] Invalid wallet object: missing required fields. Got: ${JSON.stringify(Object.keys(wallet || {}))}`
    );
  }

  const { id: walletId, user_id: userId, address, last_synced_at } = wallet;

  if (!isValidBitcoinAddress(address)) {
    logger.warn(`[BTC Sync] Unsupported Bitcoin address format "${address}" for wallet ${walletId} — skipping.`);
    return { txsFound: 0 };
  }

  // Convert last_synced_at to a Unix timestamp (seconds) for comparison
  let lastSyncedTs = null;
  if (last_synced_at) {
    const parsed = new Date(last_synced_at);
    if (!isNaN(parsed.getTime())) {
      lastSyncedTs = Math.floor(parsed.getTime() / 1000);
    } else {
      logger.warn(`[BTC Sync] Invalid last_synced_at "${last_synced_at}" for wallet ${walletId} — fetching all txs.`);
    }
  }

  logger.info(
    `[BTC Sync] Starting sync — wallet=${walletId} address=${address} last_synced_at=${last_synced_at || 'never'}`
  );

  // --- Pagination loop ---
  const allNormalized = [];
  let offset = 0;
  let totalTxs = null;     // filled after first response
  let reachedOldTx = false;

  while (true) {
    let data;
    try {
      data = await fetchPage(address, offset);
    } catch (err) {
      const status = err.response?.status;
      logger.error(
        `[BTC Sync] Blockchain.com API error for wallet ${walletId} at offset ${offset}: ` +
        `HTTP ${status || 'N/A'} — ${err.message}`
      );
      if (allNormalized.length === 0) {
        return { txsFound: 0 };
      }
      // Partial data: stop paginating and persist what we have
      break;
    }

    if (totalTxs === null) {
      totalTxs = typeof data.n_tx === 'number' ? data.n_tx : 0;
      logger.info(`[BTC Sync] Wallet ${walletId}: total declared txs = ${totalTxs}`);
    }

    const txs = Array.isArray(data.txs) ? data.txs : [];

    if (txs.length === 0) {
      break; // no more pages
    }

    for (const tx of txs) {
      // 1. Skip unconfirmed transactions
      if (!tx.block_height || tx.block_height <= 0) {
        // Silently skip unconfirmed
        continue;
      }

      // 2. Validate tx.time
      if (typeof tx.time !== 'number' || tx.time <= 0 || !isFinite(tx.time)) {
        logger.warn(
          `[BTC Sync] Wallet ${walletId}: tx ${tx.hash} has invalid time=${tx.time} — skipping.`
        );
        continue;
      }

      // 3. Stop if we've gone past last_synced_at
      if (lastSyncedTs !== null && tx.time < lastSyncedTs) {
        reachedOldTx = true;
        break;
      }

      // 4. Determine type and net value
      const type = determineType(tx, address);
      const netValue = calcNetValue(tx, address);

      // 5. Normalize
      const normalized = normalizeTx(tx, wallet, type, netValue);
      allNormalized.push(normalized);
    }

    if (reachedOldTx) {
      logger.info(`[BTC Sync] Wallet ${walletId}: reached already-synced txs at offset ${offset} — stopping.`);
      break;
    }

    offset += txs.length;

    // Stop if we've retrieved all declared transactions
    if (totalTxs !== null && offset >= totalTxs) {
      break;
    }

    // Stop if this page returned fewer results than the limit (last page)
    if (txs.length < PAGE_LIMIT) {
      break;
    }

    // Rate-limit delay between pages
    await sleep(PAGE_DELAY_MS);
  }

  logger.info(`[BTC Sync] Wallet ${walletId}: ${allNormalized.length} confirmed txs collected.`);

  // --- Upsert into Supabase ---
  if (allNormalized.length > 0) {
    const { error: upsertError } = await supabaseAdmin
      .from('transactions')
      .upsert(allNormalized, { onConflict: 'tx_hash,wallet_id', ignoreDuplicates: false });

    if (upsertError) {
      logger.error(
        `[BTC Sync] Supabase upsert failed for wallet ${walletId}: ${upsertError.message}`
      );
      throw upsertError;
    }
  }

  // --- Update last_synced_at ---
  const { error: updateError } = await supabaseAdmin
    .from('wallets')
    .update({ last_synced_at: new Date().toISOString() })
    .eq('id', walletId);

  if (updateError) {
    logger.warn(
      `[BTC Sync] Could not update last_synced_at for wallet ${walletId}: ${updateError.message}`
    );
    // Non-critical: don't throw
  }

  logger.info(`[BTC Sync] Done — wallet=${walletId} txsFound=${allNormalized.length}`);

  return { txsFound: allNormalized.length };
}

module.exports = { syncWallet };
