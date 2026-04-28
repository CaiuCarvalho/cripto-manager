const { Router } = require('express');
const { getCurrentPrices, SYMBOL_TO_ID } = require('../services/coinGecko');
const logger = require('../utils/logger');

const router = Router();

/**
 * GET /api/prices/:symbol
 *
 * Public endpoint — no auth required.
 * Returns current USD, BRL and 24h change for the requested symbol.
 */
router.get('/:symbol', async (req, res) => {
  const symbol = req.params.symbol.toUpperCase();

  // Reject unknown symbols immediately without hitting the API
  if (!SYMBOL_TO_ID[symbol]) {
    return res.status(404).json({
      error: 'Not Found',
      message: `Symbol "${symbol}" is not supported. Supported symbols: ${Object.keys(SYMBOL_TO_ID).join(', ')}`,
    });
  }

  try {
    const prices = await getCurrentPrices([symbol]);
    const data = prices[symbol];

    if (!data) {
      return res.status(404).json({
        error: 'Not Found',
        message: `Could not retrieve price for symbol "${symbol}"`,
      });
    }

    return res.json({
      symbol,
      usd: data.usd,
      brl: data.brl,
      change24h: data.change24h,
    });
  } catch (err) {
    logger.error(`GET /prices/${symbol} — unexpected error: ${err.message}`);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to fetch price data',
    });
  }
});

module.exports = router;
