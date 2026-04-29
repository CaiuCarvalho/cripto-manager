const { Router } = require('express');
const rateLimit = require('express-rate-limit');
const { wrap } = require('../utils/asyncWrapper');
const { userClient } = require('../utils/supabaseClient');
const { encrypt, decrypt } = require('../utils/crypto');
const logger = require('../utils/logger');

const router = Router();

const VALID_NETWORKS = ['ETH', 'BTC', 'SOL', 'BSC', 'MATIC', 'AVAX', 'ARB', 'OP'];

// Stricter limiter for all private-key routes
const keyLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests', message: 'Rate limit exceeded for key operations.' },
});

// Even stricter limiter for the reveal (decrypt) endpoint
const revealLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests', message: 'Rate limit exceeded for key reveal.' },
});

router.use(keyLimiter);

// ─── POST /private-keys ───────────────────────────────────────────────────────
// Accepts { label, network, privateKey, wallet_id? }, encrypts and persists.
// Never echoes the private key back.
router.post(
  '/',
  wrap(async (req, res) => {
    const { label, network, privateKey, wallet_id } = req.body;

    if (!label || !network || !privateKey) {
      const err = new Error('label, network and privateKey are required');
      err.statusCode = 400;
      throw err;
    }

    const normalizedNetwork = network.toUpperCase();
    if (!VALID_NETWORKS.includes(normalizedNetwork)) {
      const err = new Error(`Invalid network. Must be one of: ${VALID_NETWORKS.join(', ')}`);
      err.statusCode = 400;
      throw err;
    }

    const { encrypted, iv, authTag } = encrypt(privateKey);

    const db = userClient(req);

    const { data, error } = await db
      .from('private_keys')
      .insert({
        user_id: req.user.id,
        wallet_id: wallet_id || null,
        label,
        network: normalizedNetwork,
        encrypted_key: encrypted,
        iv,
        auth_tag: authTag,
      })
      .select('id, label, network, wallet_id, enc_version, created_at')
      .single();

    if (error) {
      const err = new Error(error.message);
      err.statusCode = 500;
      throw err;
    }

    logger.info(`Private key stored: id=${data.id} user=${req.user.id} network=${normalizedNetwork}`);
    res.status(201).json(data);
  })
);

// ─── GET /private-keys ────────────────────────────────────────────────────────
// Returns metadata only — no encrypted blobs, no plaintext.
router.get(
  '/',
  wrap(async (req, res) => {
    const db = userClient(req);

    const { data, error } = await db
      .from('private_keys')
      .select('id, label, network, wallet_id, enc_version, last_accessed_at, created_at')
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

// ─── GET /private-keys/:id ────────────────────────────────────────────────────
// Decrypts and returns the private key. Heavily rate-limited.
router.get(
  '/:id',
  revealLimiter,
  wrap(async (req, res) => {
    const db = userClient(req);

    const { data: record, error } = await db
      .from('private_keys')
      .select('id, user_id, encrypted_key, iv, auth_tag, label, network')
      .eq('id', req.params.id)
      .eq('user_id', req.user.id)
      .single();

    if (error || !record) {
      const err = new Error('Private key not found');
      err.statusCode = 404;
      throw err;
    }

    const plaintext = decrypt(record.encrypted_key, record.iv, record.auth_tag);

    // Update last_accessed_at without blocking the response
    db.from('private_keys')
      .update({ last_accessed_at: new Date().toISOString() })
      .eq('id', record.id)
      .then(({ error: updateError }) => {
        if (updateError) logger.warn(`Failed to update last_accessed_at for key ${record.id}: ${updateError.message}`);
      });

    logger.info(`Private key revealed: id=${record.id} user=${req.user.id}`);

    res.json({
      id: record.id,
      label: record.label,
      network: record.network,
      privateKey: plaintext,
    });
  })
);

// ─── DELETE /private-keys/:id ─────────────────────────────────────────────────
router.delete(
  '/:id',
  wrap(async (req, res) => {
    const db = userClient(req);

    const { data: record, error: findError } = await db
      .from('private_keys')
      .select('id')
      .eq('id', req.params.id)
      .eq('user_id', req.user.id)
      .single();

    if (findError || !record) {
      const err = new Error('Private key not found');
      err.statusCode = 404;
      throw err;
    }

    const { error: deleteError } = await db
      .from('private_keys')
      .delete()
      .eq('id', req.params.id)
      .eq('user_id', req.user.id);

    if (deleteError) {
      const err = new Error(deleteError.message);
      err.statusCode = 500;
      throw err;
    }

    logger.info(`Private key deleted: id=${req.params.id} user=${req.user.id}`);
    res.status(204).end();
  })
);

module.exports = router;
