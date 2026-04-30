'use strict';

const cron = require('node-cron');
const { syncAllWallets } = require('./sync');
const { checkAlerts } = require('./alertChecker');
const logger = require('../utils/logger');

/**
 * Retries an async function with exponential backoff.
 * @param {Function} fn - Async function to execute.
 * @param {number} maxAttempts - Maximum number of attempts.
 * @param {number} baseDelayMs - Base delay in ms; doubles on each retry.
 * @returns {Promise<any>}
 */
async function withRetry(fn, maxAttempts = 3, baseDelayMs = 2000) {
  let lastError;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      if (attempt < maxAttempts) {
        const delay = baseDelayMs * Math.pow(2, attempt - 1);
        logger.warn(`[Cron] Attempt ${attempt}/${maxAttempts} failed: ${err.message}. Retrying in ${delay}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }
  throw lastError;
}

function startCronJobs() {
  // Sync de carteiras a cada 5 minutos
  cron.schedule('*/5 * * * *', async () => {
    logger.info('[Cron] Starting scheduled wallet sync...');
    try {
      const result = await withRetry(() => syncAllWallets());
      logger.info(`[Cron] Sync complete: ${result.synced} synced, ${result.errors} errors`);
    } catch (err) {
      logger.error(`[Cron] Sync failed after all retries: ${err.message}`);
    }
  });

  // Verificação de alertas de preço a cada 2 minutos
  cron.schedule('*/2 * * * *', async () => {
    logger.info('[Cron] Checking price alerts...');
    try {
      await withRetry(() => checkAlerts());
    } catch (err) {
      logger.error(`[Cron] Alert check failed after all retries: ${err.message}`);
    }
  });

  logger.info('[Cron] Cron jobs scheduled: wallet sync every 5 minutes, alert check every 2 minutes');
}

module.exports = { startCronJobs };
