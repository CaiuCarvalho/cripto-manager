'use strict';

const { Router } = require('express');
const { wrap } = require('../utils/asyncWrapper');
const { userClient } = require('../utils/supabaseClient');
const { syncWalletWithEnrichment } = require('../services/sync');
const logger = require('../utils/logger');

const router = Router();

const MANUAL_SYNC_TIMEOUT_MS = 30_000;

// ─── POST /sync/wallet/:walletId ──────────────────────────────────────────────
/**
 * Manually trigger a sync for a specific wallet belonging to the authenticated user.
 * If the sync takes longer than 30 s the response is 202 Accepted immediately.
 */
router.post(
  '/wallet/:walletId',
  wrap(async (req, res) => {
    const { walletId } = req.params;
    const db = userClient(req);

    // Verify wallet belongs to the authenticated user
    const { data: wallet, error: findError } = await db
      .from('wallets')
      .select('*')
      .eq('id', walletId)
      .eq('user_id', req.user.id)
      .single();

    if (findError || !wallet) {
      const err = new Error('Wallet not found');
      err.statusCode = 404;
      throw err;
    }

    // Race the sync against a 30-second timeout
    let timedOut = false;
    const timeoutPromise = new Promise((resolve) =>
      setTimeout(() => {
        timedOut = true;
        resolve(null);
      }, MANUAL_SYNC_TIMEOUT_MS)
    );

    const syncPromise = syncWalletWithEnrichment(wallet);

    const result = await Promise.race([syncPromise, timeoutPromise]);

    if (timedOut) {
      logger.info(`[Sync Route] Sync for wallet ${walletId} started but exceeded 30s — returning 202`);
      // Let the sync finish in the background
      syncPromise.catch((err) =>
        logger.error(`[Sync Route] Background sync failed for wallet ${walletId}: ${err.message}`)
      );
      return res.status(202).json({ message: 'Sync started' });
    }

    return res.json({ walletId: result.walletId, txsFound: result.txsFound });
  })
);

// ─── POST /sync/all ───────────────────────────────────────────────────────────
/**
 * Manually trigger a sync for ALL wallets belonging to the authenticated user.
 * Always returns 202 Accepted immediately (syncing all wallets is expected to
 * take longer than 30 s).
 */
router.post(
  '/all',
  wrap(async (req, res) => {
    const db = userClient(req);

    // Fetch only wallets belonging to the current user
    const { data: wallets, error: fetchError } = await db
      .from('wallets')
      .select('*')
      .eq('user_id', req.user.id);

    if (fetchError) {
      const err = new Error(fetchError.message);
      err.statusCode = 500;
      throw err;
    }

    if (!wallets || wallets.length === 0) {
      return res.json({ message: 'No wallets to sync', synced: 0, errors: 0 });
    }

    // Kick off sequential sync in the background
    (async () => {
      let synced = 0;
      let errors = 0;
      for (const wallet of wallets) {
        try {
          await syncWalletWithEnrichment(wallet);
          synced++;
        } catch (err) {
          logger.error(`[Sync Route] Failed to sync wallet ${wallet.id}: ${err.message}`);
          errors++;
        }
      }
      logger.info(`[Sync Route] User ${req.user.id} bulk sync done — synced=${synced} errors=${errors}`);
    })().catch((err) =>
      logger.error(`[Sync Route] Bulk sync crashed for user ${req.user.id}: ${err.message}`)
    );

    return res.status(202).json({ message: 'Sync started' });
  })
);

module.exports = router;
