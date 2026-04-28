const { Router } = require('express');

const walletsRouter = require('./wallets');
const transactionsRouter = require('./transactions');
const syncRouter = require('./sync');
const portfolioRouter = require('./portfolio');
const alertsRouter = require('./alerts');

const router = Router();

// Authenticated routes
router.use('/wallets', walletsRouter);
router.use('/transactions', transactionsRouter);
router.use('/sync', syncRouter);
router.use('/portfolio', portfolioRouter);
router.use('/alerts', alertsRouter);

module.exports = router;
