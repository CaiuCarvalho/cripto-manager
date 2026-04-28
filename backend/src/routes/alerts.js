'use strict';

const { Router } = require('express');
const { wrap } = require('../utils/asyncWrapper');
const { userClient } = require('../utils/supabaseClient');

const router = Router();

const VALID_DIRECTIONS = ['ABOVE', 'BELOW'];

// ─── GET /alerts ──────────────────────────────────────────────────────────────
router.get(
  '/',
  wrap(async (req, res) => {
    const db = userClient(req);

    const { data, error } = await db
      .from('price_alerts')
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

// ─── POST /alerts ─────────────────────────────────────────────────────────────
router.post(
  '/',
  wrap(async (req, res) => {
    const { coin_symbol, target_price, direction } = req.body;

    // Validation
    if (!coin_symbol) {
      const err = new Error('coin_symbol is required');
      err.statusCode = 400;
      throw err;
    }

    if (target_price === undefined || target_price === null) {
      const err = new Error('target_price is required');
      err.statusCode = 400;
      throw err;
    }

    const parsedPrice = parseFloat(target_price);
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      const err = new Error('target_price must be a positive number');
      err.statusCode = 400;
      throw err;
    }

    if (!direction) {
      const err = new Error('direction is required');
      err.statusCode = 400;
      throw err;
    }

    const upperDirection = direction.toUpperCase();
    if (!VALID_DIRECTIONS.includes(upperDirection)) {
      const err = new Error(`direction must be one of: ${VALID_DIRECTIONS.join(', ')}`);
      err.statusCode = 400;
      throw err;
    }

    const db = userClient(req);

    const { data, error } = await db
      .from('price_alerts')
      .insert({
        user_id: req.user.id,
        coin_symbol: coin_symbol.toUpperCase(),
        target_price: parsedPrice,
        direction: upperDirection,
        active: true,
      })
      .select()
      .single();

    if (error) {
      const err = new Error(error.message);
      err.statusCode = 500;
      throw err;
    }

    res.status(201).json(data);
  })
);

// ─── DELETE /alerts/:id ───────────────────────────────────────────────────────
router.delete(
  '/:id',
  wrap(async (req, res) => {
    const db = userClient(req);

    // Verify ownership
    const { data: alert, error: findError } = await db
      .from('price_alerts')
      .select('id')
      .eq('id', req.params.id)
      .eq('user_id', req.user.id)
      .single();

    if (findError || !alert) {
      const err = new Error('Alert not found');
      err.statusCode = 404;
      throw err;
    }

    const { error: deleteError } = await db
      .from('price_alerts')
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
