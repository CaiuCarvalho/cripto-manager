'use strict';

/**
 * EVM Sync Engine
 * Collects transactions from EVM-compatible wallets via Etherscan-compatible APIs.
 * Supports: Ethereum, BSC, Polygon, Avalanche, Arbitrum, Optimism.
 *
 * NOTE: This module does NOT enrich with historical prices — that is the
 * orchestrator's responsibility (Task 8).
 * NOTE: This module does NOT schedule syncs — it only collects when called.
 */

const axios = require('axios');
const { supabaseAdmin } = require('../../config/supabase');
const env = require('../../config/env');
const logger = require('../../utils/logger');

// ---------------------------------------------------------------------------
// Network configuration
// ---------------------------------------------------------------------------

const NETWORKS = {
  ETH:  { apiUrl: 'https://api.etherscan.io/api',            nativeSymbol: 'ETH',   chainId: 1 },
  BSC:  { apiUrl: 'https://api.bscscan.com/api',             nativeSymbol: 'BNB',   chainId: 56 },
  MATIC:{ apiUrl: 'https://api.polygonscan.com/api',         nativeSymbol: 'MATIC', chainId: 137 },
  AVAX: { apiUrl: 'https://api.snowtrace.io/api',            nativeSymbol: 'AVAX',  chainId: 43114 },
  ARB:  { apiUrl: 'https://api.arbiscan.io/api',             nativeSymbol: 'ETH',   chainId: 42161 },
  OP:   { apiUrl: 'https://api-optimistic.etherscan.io/api', nativeSymbol: 'ETH',   chainId: 10 },
};

// Moralis chain identifiers for each network
const MORALIS_CHAIN_IDS = {
  ETH: '0x1', BSC: '0x38', MATIC: '0x89',
  AVAX: '0xa86a', ARB: '0xa4b1', OP: '0xa',
};

const MORALIS_API_BASE = 'https://deep-index.moralis.io/api/v2.2';

const RATE_LIMIT_MESSAGE = 'Max rate limit reached';
const RETRY_DELAY_MS = 1000;

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
 * Fetches a page of transactions from an Etherscan-compatible API.
 * Retries once if the API returns a rate-limit error.
 *
 * @param {string} apiUrl  - Base API URL for the network.
 * @param {string} action  - 'txlist' for native txs, 'tokentx' for ERC-20.
 * @param {string} address - Wallet address.
 * @param {number} startBlock - Block to start fetching from.
 * @returns {Promise<{ status: string, message: string, result: any[] }>}
 */
async function fetchEtherscan(apiUrl, action, address, startBlock) {
  const params = {
    module: 'account',
    action,
    address,
    startblock: startBlock,
    sort: 'asc',
    apikey: env.etherscanApiKey,
  };

  const makeRequest = () => axios.get(apiUrl, { params, timeout: 15000 });

  let response = await makeRequest();
  const data = response.data;

  // Single retry on rate-limit
  if (
    data.status === '0' &&
    typeof data.message === 'string' &&
    data.message.includes(RATE_LIMIT_MESSAGE)
  ) {
    logger.warn(`[EVM Sync] Rate limit hit on ${action} for ${address} — retrying after ${RETRY_DELAY_MS}ms`);
    await sleep(RETRY_DELAY_MS);
    response = await makeRequest();
    return response.data;
  }

  return data;
}

/**
 * Determines transaction type based on wallet address and input data.
 *
 * @param {object} tx          - Raw transaction object from Etherscan.
 * @param {string} walletAddr  - Lowercase wallet address.
 * @returns {'SEND'|'RECEIVE'|'CONTRACT'}
 */
function determineType(tx, walletAddr) {
  const from = (tx.from || '').toLowerCase();
  const to   = (tx.to   || '').toLowerCase();

  if (from === walletAddr) {
    // Contract interaction: outgoing tx with non-empty input data
    if (tx.input && tx.input !== '0x') {
      return 'CONTRACT';
    }
    return 'SEND';
  }

  if (to === walletAddr) {
    return 'RECEIVE';
  }

  // Edge case: wallet is neither from nor to (e.g. internal tx — treat as RECEIVE)
  return 'RECEIVE';
}

/**
 * Normalizes a raw Etherscan transaction into the DB schema format.
 *
 * @param {object} tx      - Raw tx from Etherscan (native or ERC-20).
 * @param {object} wallet  - Wallet record { id, user_id, address, network }.
 * @param {object} network - Network config { nativeSymbol, ... }.
 * @param {string} type    - 'SEND' | 'RECEIVE' | 'CONTRACT'.
 * @returns {object}
 */
function normalizeTx(tx, wallet, network, type) {
  const blockNum = parseInt(tx.blockNumber, 10);
  const timestamp = parseInt(tx.timeStamp, 10);

  if (isNaN(blockNum) || isNaN(timestamp)) {
    throw new Error(`Invalid tx data: blockNumber=${tx.blockNumber} timeStamp=${tx.timeStamp} hash=${tx.hash}`);
  }

  return {
    wallet_id:          wallet.id,
    user_id:            wallet.user_id,
    tx_hash:            tx.hash,
    type,
    token_symbol:       tx.tokenSymbol || network.nativeSymbol,
    token_address:      tx.contractAddress || null,
    amount:             parseFloat(tx.value) / 1e18,
    from_address:       tx.from,
    to_address:         tx.to,
    fee_native:         (parseFloat(tx.gasUsed) * parseFloat(tx.gasPrice)) / 1e18,
    fee_usd:            null,   // enriched by orchestrator
    price_usd_at_time:  null,   // enriched by orchestrator
    value_usd:          null,   // enriched by orchestrator
    block_number:       blockNum,
    confirmed_at:       new Date(timestamp * 1000).toISOString(),
    raw_data:           tx,
  };
}

/**
 * Returns true if the transaction should be ignored (zero-value spam token transfers).
 * Native transactions with value=0 are valid (contract calls), so they are never filtered.
 *
 * @param {object} tx - Raw tx from Etherscan.
 * @param {boolean} isToken - True if this is a token transfer (tokentx), false for native (txlist).
 * @returns {boolean}
 */
function isSpam(tx, isToken = false) {
  if (isToken && tx.value === '0') return true;
  return false;
}

// ---------------------------------------------------------------------------
// Moralis fallback
// ---------------------------------------------------------------------------

/**
 * Normalizes a raw Moralis transaction into the DB schema format.
 * Moralis uses ISO timestamps and decimal value strings (in wei).
 */
function normalizeMoralisTx(tx, wallet, network) {
  const blockNum = parseInt(tx.block_number, 10);
  const timestamp = tx.block_timestamp
    ? Math.floor(new Date(tx.block_timestamp).getTime() / 1000)
    : 0;

  if (isNaN(blockNum) || !timestamp) {
    throw new Error(`Invalid Moralis tx: block_number=${tx.block_number} hash=${tx.hash}`);
  }

  const walletAddr = wallet.address.toLowerCase();
  const type = determineType(
    { from: tx.from_address, to: tx.to_address, input: tx.input },
    walletAddr
  );

  return {
    wallet_id:          wallet.id,
    user_id:            wallet.user_id,
    tx_hash:            tx.hash,
    type,
    token_symbol:       network.nativeSymbol,
    token_address:      null,
    amount:             parseFloat(tx.value) / 1e18,
    from_address:       tx.from_address,
    to_address:         tx.to_address,
    fee_native:         tx.receipt_gas_used && tx.gas_price
      ? (parseFloat(tx.receipt_gas_used) * parseFloat(tx.gas_price)) / 1e18
      : null,
    fee_usd:            null,
    price_usd_at_time:  null,
    value_usd:          null,
    block_number:       blockNum,
    confirmed_at:       new Date(timestamp * 1000).toISOString(),
    raw_data:           tx,
  };
}

/**
 * Fetches native transactions from Moralis as a fallback when Etherscan fails.
 * Returns normalized tx rows or null if Moralis is not configured or also fails.
 *
 * @param {string} walletAddr - Lowercase wallet address.
 * @param {string} networkKey - e.g. 'ETH'
 * @param {object} network    - Network config { nativeSymbol, ... }
 * @param {object} wallet     - Full wallet record.
 * @param {number} startBlock - Starting block number.
 * @returns {Promise<object[]|null>}
 */
async function fetchMoralisFallback(walletAddr, networkKey, network, wallet, startBlock) {
  if (!env.moralisApiKey) {
    logger.warn(`[EVM Sync] Moralis fallback skipped — MORALIS_API_KEY not set`);
    return null;
  }

  const chain = MORALIS_CHAIN_IDS[networkKey];
  if (!chain) {
    logger.warn(`[EVM Sync] Moralis fallback: no chain mapping for network ${networkKey}`);
    return null;
  }

  try {
    logger.info(`[EVM Sync] Trying Moralis fallback for ${walletAddr} on ${networkKey}`);

    const response = await axios.get(`${MORALIS_API_BASE}/${walletAddr}`, {
      params: { chain, order: 'ASC', from_block: startBlock || 0 },
      headers: { 'X-API-Key': env.moralisApiKey },
      timeout: 15000,
    });

    const txs = response.data?.result || [];
    const normalized = [];

    for (const tx of txs) {
      if (!tx.value || tx.value === '0') continue; // skip zero-value
      try {
        normalized.push(normalizeMoralisTx(tx, wallet, network));
      } catch (normErr) {
        logger.warn(`[EVM Sync] Moralis normalization skipped tx ${tx.hash}: ${normErr.message}`);
      }
    }

    logger.info(`[EVM Sync] Moralis fallback returned ${normalized.length} txs for ${walletAddr}`);
    return normalized;
  } catch (err) {
    logger.warn(`[EVM Sync] Moralis fallback failed for ${walletAddr}: ${err.message}`);
    return null;
  }
}

// ---------------------------------------------------------------------------
// Block-number estimation from timestamp
// ---------------------------------------------------------------------------

/**
 * Estimates a starting block number from a timestamp using the Etherscan
 * "block by timestamp" endpoint. Falls back to block 0 on any error.
 *
 * @param {string} apiUrl    - Base API URL.
 * @param {string} timestamp - ISO timestamp string.
 * @returns {Promise<number>}
 */
async function getStartBlock(apiUrl, timestamp) {
  if (!timestamp) return 0;

  const parsed = new Date(timestamp);
  if (isNaN(parsed.getTime())) {
    logger.warn(`[EVM Sync] Invalid timestamp "${timestamp}" — defaulting to block 0`);
    return 0;
  }
  const unixTs = Math.floor(parsed.getTime() / 1000);

  try {
    const response = await axios.get(apiUrl, {
      params: {
        module: 'block',
        action: 'getblocknobytime',
        timestamp: unixTs,
        closest: 'before',
        apikey: env.etherscanApiKey,
      },
      timeout: 10000,
    });

    const blockNum = parseInt(response.data.result, 10);
    return isNaN(blockNum) ? 0 : blockNum;
  } catch (err) {
    logger.warn(`[EVM Sync] Could not fetch start block for timestamp ${timestamp}: ${err.message}. Defaulting to 0.`);
    return 0;
  }
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

/**
 * Syncs a single EVM wallet: fetches native + ERC-20 transactions and
 * upserts them into the `transactions` table. Updates `wallets.last_synced_at`.
 *
 * @param {{ id: string, user_id: string, address: string, network: string, last_synced_at: string|null }} wallet
 * @returns {Promise<{ txsFound: number, lastBlock: number }>}
 */
async function syncWallet(wallet) {
  if (!wallet || !wallet.id || !wallet.address || !wallet.network || !wallet.user_id) {
    throw new Error(`Invalid wallet object: missing required fields. Got: ${JSON.stringify(Object.keys(wallet || {}))}`);
  }

  const { id: walletId, user_id: userId, address, network: networkKey, last_synced_at } = wallet;
  const network = NETWORKS[networkKey];

  if (!network) {
    logger.warn(`[EVM Sync] Unsupported network "${networkKey}" for wallet ${walletId} — skipping.`);
    return { txsFound: 0, lastBlock: 0 };
  }

  const walletAddr = address.toLowerCase();

  logger.info(`[EVM Sync] Starting sync — wallet=${walletId} network=${networkKey} address=${walletAddr}`);

  // 1. Determine starting block
  const startBlock = await getStartBlock(network.apiUrl, last_synced_at);
  logger.info(`[EVM Sync] Start block: ${startBlock} (last_synced_at=${last_synced_at || 'never'})`);

  // 2. Fetch native transactions
  const nativeData = await fetchEtherscan(network.apiUrl, 'txlist', walletAddr, startBlock);

  if (nativeData.status === '0') {
    // "No transactions found" is not a real error
    const isNoTxs = nativeData.message === 'No transactions found' ||
                    (Array.isArray(nativeData.result) && nativeData.result.length === 0);

    if (!isNoTxs) {
      logger.warn(`[EVM Sync] Etherscan txlist error for wallet ${walletId}: ${nativeData.message}`);

      const moralisNormalized = await fetchMoralisFallback(
        walletAddr, networkKey, network, wallet, startBlock
      );

      if (!moralisNormalized) {
        return { txsFound: 0, lastBlock: 0 };
      }

      if (moralisNormalized.length > 0) {
        const { error: upsertError } = await supabaseAdmin
          .from('transactions')
          .upsert(moralisNormalized, { onConflict: 'tx_hash,wallet_id', ignoreDuplicates: false });

        if (upsertError) {
          logger.error(`[EVM Sync] Supabase upsert (Moralis) failed for wallet ${walletId}: ${upsertError.message}`);
          throw upsertError;
        }
      }

      const { error: updateError } = await supabaseAdmin
        .from('wallets')
        .update({ last_synced_at: new Date().toISOString() })
        .eq('id', walletId);

      if (updateError) {
        logger.warn(`[EVM Sync] Could not update last_synced_at for wallet ${walletId}: ${updateError.message}`);
      }

      return { txsFound: moralisNormalized.length, lastBlock: 0 };
    }
  }

  const nativeTxs = Array.isArray(nativeData.result) ? nativeData.result : [];

  // 3. Fetch ERC-20 token transfers
  const tokenData = await fetchEtherscan(network.apiUrl, 'tokentx', walletAddr, startBlock);

  if (tokenData.status === '0') {
    const isNoTxs = tokenData.message === 'No transactions found' ||
                    (Array.isArray(tokenData.result) && tokenData.result.length === 0);

    if (!isNoTxs) {
      logger.warn(`[EVM Sync] Etherscan tokentx error for wallet ${walletId}: ${tokenData.message}`);
      // Non-critical: continue with native txs only
    }
  }

  const tokenTxs = Array.isArray(tokenData.result) ? tokenData.result : [];

  // 4. Normalise and filter all transactions
  const normalized = [];
  let lastBlock = startBlock;

  for (const tx of nativeTxs) {
    if (isSpam(tx, false)) continue;

    const type = determineType(tx, walletAddr);
    normalized.push(normalizeTx(tx, wallet, network, type));

    const blockNum = parseInt(tx.blockNumber, 10);
    if (blockNum > lastBlock) lastBlock = blockNum;
  }

  for (const tx of tokenTxs) {
    if (isSpam(tx, true)) continue;

    const type = determineType(tx, walletAddr);
    normalized.push(normalizeTx(tx, wallet, network, type));

    const blockNum = parseInt(tx.blockNumber, 10);
    if (blockNum > lastBlock) lastBlock = blockNum;
  }

  logger.info(`[EVM Sync] Wallet ${walletId}: ${nativeTxs.length} native + ${tokenTxs.length} token txs fetched, ${normalized.length} after filtering.`);

  // 5. Upsert into Supabase
  if (normalized.length > 0) {
    const { error: upsertError } = await supabaseAdmin
      .from('transactions')
      .upsert(normalized, { onConflict: 'tx_hash,wallet_id', ignoreDuplicates: false });

    if (upsertError) {
      // Critical: propagate so the orchestrator can handle / retry
      logger.error(`[EVM Sync] Supabase upsert failed for wallet ${walletId}: ${upsertError.message}`);
      throw upsertError;
    }
  }

  // 6. Update last_synced_at on the wallet record
  const { error: updateError } = await supabaseAdmin
    .from('wallets')
    .update({ last_synced_at: new Date().toISOString() })
    .eq('id', walletId);

  if (updateError) {
    logger.warn(`[EVM Sync] Could not update last_synced_at for wallet ${walletId}: ${updateError.message}`);
    // Non-critical: don't throw
  }

  logger.info(`[EVM Sync] Done — wallet=${walletId} txsFound=${normalized.length} lastBlock=${lastBlock}`);

  return { txsFound: normalized.length, lastBlock };
}

module.exports = { syncWallet, NETWORKS };
