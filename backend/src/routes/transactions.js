const { Router } = require('express');
const { createClient } = require('@supabase/supabase-js');
const { wrap } = require('../utils/asyncWrapper');
const env = require('../config/env');

const router = Router();

const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 200;

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

// ─── GET /transactions ────────────────────────────────────────────────────────
router.get(
  '/',
  wrap(async (req, res) => {
    const db = userClient(req);

    const limit = Math.min(parseInt(req.query.limit, 10) || DEFAULT_LIMIT, MAX_LIMIT);
    const offset = parseInt(req.query.offset, 10) || 0;

    let query = db
      .from('transactions')
      .select('*', { count: 'exact' })
      .eq('user_id', req.user.id)
      .order('confirmed_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (req.query.wallet_id) {
      query = query.eq('wallet_id', req.query.wallet_id);
    }

    if (req.query.type) {
      query = query.eq('type', req.query.type);
    }

    if (req.query.token_symbol) {
      query = query.eq('token_symbol', req.query.token_symbol);
    }

    const { data, error, count } = await query;

    if (error) {
      const err = new Error(error.message);
      err.statusCode = 500;
      throw err;
    }

    res.json({
      transactions: data,
      total: count,
      limit,
      offset,
    });
  })
);

// ─── DELETE /transactions/:id ─────────────────────────────────────────────────
router.delete(
  '/:id',
  wrap(async (req, res) => {
    const db = userClient(req);

    // Verify ownership first
    const { data: tx, error: findError } = await db
      .from('transactions')
      .select('id')
      .eq('id', req.params.id)
      .eq('user_id', req.user.id)
      .single();

    if (findError || !tx) {
      const err = new Error('Transaction not found');
      err.statusCode = 404;
      throw err;
    }

    const { error: deleteError } = await db
      .from('transactions')
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
