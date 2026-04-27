const { Router } = require('express');
const { createClient } = require('@supabase/supabase-js');
const { wrap } = require('../utils/asyncWrapper');
const env = require('../config/env');

const router = Router();

const VALID_NETWORKS = ['ETH', 'BTC', 'SOL', 'BSC', 'MATIC', 'AVAX', 'ARB', 'OP'];

/**
 * Returns a Supabase client authenticated with the user's bearer token so that
 * row-level security policies are enforced correctly.
 */
function userClient(req) {
  const token = req.headers['authorization'].slice(7);
  return createClient(env.supabaseUrl, env.supabaseAnonKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false },
  });
}

/**
 * Attempts to guess the network from the wallet address format when the caller
 * did not supply one explicitly.
 */
function detectNetwork(address) {
  if (!address) return null;
  if (address.startsWith('0x')) return 'ETH';
  if (address.startsWith('bc1') || address.startsWith('1') || address.startsWith('3')) return 'BTC';
  // Base58 addresses are 25-34 chars for BTC legacy, but Solana uses 32-44 chars
  if (/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address)) return 'SOL';
  return null;
}

// ─── GET /wallets ─────────────────────────────────────────────────────────────
router.get(
  '/',
  wrap(async (req, res) => {
    const db = userClient(req);

    const { data, error } = await db
      .from('wallets')
      .select('*')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) {
      const err = new Error(error.message);
      err.statusCode = 500;
      throw err;
    }

    res.json(data);
  })
);

// ─── POST /wallets ────────────────────────────────────────────────────────────
router.post(
  '/',
  wrap(async (req, res) => {
    let { name, address, network } = req.body;

    if (!name || !address) {
      const err = new Error('name and address are required');
      err.statusCode = 400;
      throw err;
    }

    // Auto-detect network if not supplied
    if (!network) {
      network = detectNetwork(address);
    }

    if (!network) {
      const err = new Error('network is required and could not be detected from the address');
      err.statusCode = 400;
      throw err;
    }

    network = network.toUpperCase();

    if (!VALID_NETWORKS.includes(network)) {
      const err = new Error(
        `Invalid network. Must be one of: ${VALID_NETWORKS.join(', ')}`
      );
      err.statusCode = 400;
      throw err;
    }

    const db = userClient(req);

    const { data, error } = await db
      .from('wallets')
      .insert({ user_id: req.user.id, name, address, network })
      .select()
      .single();

    if (error) {
      const err = new Error(error.message);
      err.statusCode = error.code === '23505' ? 409 : 500;
      throw err;
    }

    res.status(201).json(data);
  })
);

// ─── DELETE /wallets/:id ──────────────────────────────────────────────────────
router.delete(
  '/:id',
  wrap(async (req, res) => {
    const db = userClient(req);

    // Verify ownership first
    const { data: wallet, error: findError } = await db
      .from('wallets')
      .select('id')
      .eq('id', req.params.id)
      .eq('user_id', req.user.id)
      .single();

    if (findError || !wallet) {
      const err = new Error('Wallet not found');
      err.statusCode = 404;
      throw err;
    }

    const { error: deleteError } = await db
      .from('wallets')
      .delete()
      .eq('id', req.params.id)
      .eq('user_id', req.user.id);

    if (deleteError) {
      const err = new Error(deleteError.message);
      err.statusCode = 500;
      throw err;
    }

    res.status(204).end();
  })
);

module.exports = router;
