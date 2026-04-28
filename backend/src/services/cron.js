'use strict';

const cron = require('node-cron');
const { syncAllWallets } = require('./sync');
const logger = require('../utils/logger');

function startCronJobs() {
  // Sync de carteiras a cada 5 minutos
  cron.schedule('*/5 * * * *', async () => {
    logger.info('[Cron] Starting scheduled wallet sync...');
    try {
      const result = await syncAllWallets();
      logger.info(`[Cron] Sync complete: ${result.synced} synced, ${result.errors} errors`);
    } catch (err) {
      logger.error(`[Cron] Sync failed: ${err.message}`);
    }
  });

  logger.info('[Cron] Cron jobs scheduled: wallet sync every 5 minutes');
}

module.exports = { startCronJobs };
