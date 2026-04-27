const axios = require('axios');
const env = require('../config/env');
const logger = require('../utils/logger');

// ─── Symbol → CoinGecko ID map ───────────────────────────────────────────────
const SYMBOL_TO_ID = {
  BTC: 'bitcoin',
  ETH: 'ethereum',
  SOL: 'solana',
  BNB: 'binancecoin',
  MATIC: 'matic-network',
  AVAX: 'avalanche-2',
  ARB: 'arbitrum',
  OP: 'optimism',
  USDT: 'tether',
  USDC: 'usd-coin',
};

// ─── Base URL ─────────────────────────────────────────────────────────────────
const BASE_URL = env.coingeckoApiKey
  ? 'https://pro-api.coingecko.com/api/v3'
  : 'https://api.coingecko.com/api/v3';

// ─── Cache ────────────────────────────────────────────────────────────────────
const CURRENT_PRICE_TTL = 60 * 1000;        // 60 seconds
const HISTORICAL_PRICE_TTL = 60 * 60 * 1000; // 1 hour

const currentPriceCache = new Map();   // key: sorted ids string → { data, expiresAt }
const historicalPriceCache = new Map(); // key: "SYMBOL_dd-mm-yyyy" → { data, expiresAt }

// ─── Rate limiting ────────────────────────────────────────────────────────────
let lastRequestAt = 0;
const MIN_REQUEST_INTERVAL = 200; // ms between requests (free tier: ~10-30 req/min)

async function enforceRateLimit() {
  const now = Date.now();
  const elapsed = now - lastRequestAt;
  if (elapsed < MIN_REQUEST_INTERVAL) {
    await new Promise((resolve) => setTimeout(resolve, MIN_REQUEST_INTERVAL - elapsed));
  }
  lastRequestAt = Date.now();
}

// ─── Axios instance ───────────────────────────────────────────────────────────
function buildHeaders() {
  const headers = { Accept: 'application/json' };
  if (env.coingeckoApiKey) {
    headers['x-cg-demo-api-key'] = env.coingeckoApiKey;
  }
  return headers;
}

async function cgGet(path, params = {}) {
  await enforceRateLimit();
  const response = await axios.get(`${BASE_URL}${path}`, {
    params,
    headers: buildHeaders(),
    timeout: 10000,
  });
  return response.data;
}

// ─── getCurrentPrices ─────────────────────────────────────────────────────────
/**
 * Fetch current USD and BRL prices plus 24h change for a list of symbols.
 *
 * @param {string[]} symbols - e.g. ['BTC', 'ETH']
 * @returns {Object} - e.g. { BTC: { usd: 45000, brl: 225000, change24h: 2.5 } }
 */
async function getCurrentPrices(symbols) {
  const upperSymbols = symbols.map((s) => s.toUpperCase());

  // Map symbols to CoinGecko IDs (skip unknown symbols)
  const idToSymbol = {};
  const ids = [];
  for (const sym of upperSymbols) {
    const id = SYMBOL_TO_ID[sym];
    if (id) {
      idToSymbol[id] = sym;
      ids.push(id);
    } else {
      logger.warn(`CoinGecko: unknown symbol "${sym}", skipping`);
    }
  }

  if (ids.length === 0) return {};

  // Build a stable cache key from sorted ids
  const cacheKey = ids.slice().sort().join(',');
  const cached = currentPriceCache.get(cacheKey);
  if (cached && Date.now() < cached.expiresAt) {
    logger.debug(`CoinGecko: cache hit for current prices [${cacheKey}]`);
    return cached.data;
  }

  try {
    const raw = await cgGet('/simple/price', {
      ids: ids.join(','),
      vs_currencies: 'usd,brl',
      include_24hr_change: true,
    });

    const result = {};
    for (const [id, prices] of Object.entries(raw)) {
      const sym = idToSymbol[id];
      if (!sym) continue;
      result[sym] = {
        usd: prices.usd ?? null,
        brl: prices.brl ?? null,
        change24h: prices.usd_24h_change ?? null,
      };
    }

    currentPriceCache.set(cacheKey, { data: result, expiresAt: Date.now() + CURRENT_PRICE_TTL });
    logger.debug(`CoinGecko: fetched current prices for [${cacheKey}]`);
    return result;
  } catch (err) {
    logger.warn(`CoinGecko: failed to fetch current prices — ${err.message}`);
    return {};
  }
}

// ─── getHistoricalPrice ───────────────────────────────────────────────────────
/**
 * Fetch the USD price of a symbol on a specific historical date.
 *
 * @param {string} symbol - e.g. 'BTC'
 * @param {Date}   date   - the target date
 * @returns {number|null} - USD price or null on error / unknown symbol
 */
async function getHistoricalPrice(symbol, date) {
  const sym = symbol.toUpperCase();
  const id = SYMBOL_TO_ID[sym];
  if (!id) {
    logger.warn(`CoinGecko: unknown symbol "${sym}" for historical price`);
    return null;
  }

  // Format date as dd-mm-yyyy (CoinGecko requirement)
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const yyyy = date.getFullYear();
  const dateStr = `${dd}-${mm}-${yyyy}`;

  const cacheKey = `${sym}_${dateStr}`;
  const cached = historicalPriceCache.get(cacheKey);
  if (cached && Date.now() < cached.expiresAt) {
    logger.debug(`CoinGecko: cache hit for historical price [${cacheKey}]`);
    return cached.data;
  }

  try {
    const raw = await cgGet(`/coins/${id}/history`, {
      date: dateStr,
      localization: false,
    });

    const price = raw?.market_data?.current_price?.usd ?? null;
    historicalPriceCache.set(cacheKey, { data: price, expiresAt: Date.now() + HISTORICAL_PRICE_TTL });
    logger.debug(`CoinGecko: historical price for ${sym} on ${dateStr} = ${price}`);
    return price;
  } catch (err) {
    logger.warn(`CoinGecko: failed to fetch historical price for ${sym} on ${dateStr} — ${err.message}`);
    return null;
  }
}

// ─── getPriceAtTimestamp ──────────────────────────────────────────────────────
/**
 * Wrapper around getHistoricalPrice that accepts a Unix timestamp (ms or s).
 *
 * @param {string} symbol    - e.g. 'ETH'
 * @param {number} timestamp - Unix timestamp in milliseconds or seconds
 * @returns {number|null}
 */
async function getPriceAtTimestamp(symbol, timestamp) {
  // Normalise: if timestamp looks like seconds (< year 3000 in ms), convert to ms
  const ms = timestamp < 1e12 ? timestamp * 1000 : timestamp;
  const date = new Date(ms);
  return getHistoricalPrice(symbol, date);
}

module.exports = {
  getCurrentPrices,
  getHistoricalPrice,
  getPriceAtTimestamp,
  SYMBOL_TO_ID,
};
