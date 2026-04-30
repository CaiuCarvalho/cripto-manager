'use strict';

const { Router } = require('express');
const { wrap } = require('../utils/asyncWrapper');
const { userClient } = require('../utils/supabaseClient');
const { getCurrentPrices } = require('../services/coinGecko');

const router = Router();

// ─── GET /portfolio/summary ───────────────────────────────────────────────────
router.get(
  '/summary',
  wrap(async (req, res) => {
    const db = userClient(req);

    // 1. Fetch all wallets for the user
    const { data: wallets, error: walletsError } = await db
      .from('wallets')
      .select('id')
      .eq('user_id', req.user.id);

    if (walletsError) {
      const err = new Error(walletsError.message);
      err.statusCode = 500;
      throw err;
    }

    if (!wallets || wallets.length === 0) {
      return res.json({
        totalUsd: 0,
        totalBrl: 0,
        assets: [],
        updatedAt: new Date().toISOString(),
      });
    }

    const walletIds = wallets.map((w) => w.id);

    // 2. Fetch all transactions for those wallets
    const { data: transactions, error: txError } = await db
      .from('transactions')
      .select('token_symbol, type, amount')
      .eq('user_id', req.user.id)
      .in('wallet_id', walletIds);

    if (txError) {
      const err = new Error(txError.message);
      err.statusCode = 500;
      throw err;
    }

    // 3. Aggregate balances per token: RECEIVE adds, SEND subtracts
    const balances = {};
    for (const tx of transactions || []) {
      const sym = tx.token_symbol?.toUpperCase();
      if (!sym) continue;
      if (!balances[sym]) balances[sym] = 0;
      const amt = parseFloat(tx.amount) || 0;
      if (tx.type === 'RECEIVE') {
        balances[sym] += amt;
      } else if (tx.type === 'SEND') {
        balances[sym] -= amt;
      }
    }

    // Filter out zero or negative balances
    const symbols = Object.keys(balances).filter((s) => balances[s] > 0);

    if (symbols.length === 0) {
      return res.json({
        totalUsd: 0,
        totalBrl: 0,
        assets: [],
        updatedAt: new Date().toISOString(),
      });
    }

    // 4. Fetch current prices for all tokens
    const prices = await getCurrentPrices(symbols);

    // 5. Build assets array and totals
    let totalUsd = 0;
    let totalBrl = 0;
    const assets = [];

    for (const symbol of symbols) {
      const amount = balances[symbol];
      const priceData = prices[symbol] || {};
      const priceUsd = priceData.usd ?? 0;
      const priceBrl = priceData.brl ?? 0;
      const valueUsd = amount * priceUsd;
      const valueBrl = amount * priceBrl;

      totalUsd += valueUsd;
      totalBrl += valueBrl;

      assets.push({
        symbol,
        amount,
        priceUsd,
        valueUsd,
        valueBrl,
        change24h: priceData.change24h ?? null,
      });
    }

    // Sort by valueUsd descending
    assets.sort((a, b) => b.valueUsd - a.valueUsd);

    res.json({
      totalUsd,
      totalBrl,
      assets,
      updatedAt: new Date().toISOString(),
    });
  })
);

// ─── GET /portfolio/history ───────────────────────────────────────────────────
router.get(
  '/history',
  wrap(async (req, res) => {
    const db = userClient(req);

    const days = Math.min(parseInt(req.query.days, 10) || 30, 365);
    const since = new Date();
    since.setDate(since.getDate() - days);

    // Calculate portfolio value that existed before the requested window
    // so that the chart starts from the correct baseline, not zero.
    const { data: baseTxs, error: baseError } = await db
      .from('transactions')
      .select('type, value_usd')
      .eq('user_id', req.user.id)
      .lt('confirmed_at', since.toISOString());

    if (baseError) {
      const err = new Error(baseError.message);
      err.statusCode = 500;
      throw err;
    }

    let baseValue = 0;
    for (const tx of baseTxs || []) {
      const val = parseFloat(tx.value_usd) || 0;
      if (tx.type === 'RECEIVE') baseValue += val;
      else if (tx.type === 'SEND') baseValue -= val;
    }

    // Fetch transactions ordered by confirmed_at ASC within the time window
    const { data: transactions, error: txError } = await db
      .from('transactions')
      .select('confirmed_at, type, value_usd')
      .eq('user_id', req.user.id)
      .gte('confirmed_at', since.toISOString())
      .order('confirmed_at', { ascending: true });

    if (txError) {
      const err = new Error(txError.message);
      err.statusCode = 500;
      throw err;
    }

    // Group by day and accumulate value_usd
    // RECEIVE adds value, SEND subtracts value
    const dailyDelta = {};

    for (const tx of transactions || []) {
      if (!tx.confirmed_at) continue;
      const date = tx.confirmed_at.slice(0, 10); // "YYYY-MM-DD"
      if (!dailyDelta[date]) dailyDelta[date] = 0;
      const val = parseFloat(tx.value_usd) || 0;
      if (tx.type === 'RECEIVE') {
        dailyDelta[date] += val;
      } else if (tx.type === 'SEND') {
        dailyDelta[date] -= val;
      }
    }

    // Build cumulative history sorted by date, starting from the pre-window baseline
    const sortedDates = Object.keys(dailyDelta).sort();
    let cumulative = baseValue;
    const history = sortedDates.map((date) => {
      cumulative += dailyDelta[date];
      return { date, valueUsd: cumulative };
    });

    res.json(history);
  })
);

module.exports = router;
