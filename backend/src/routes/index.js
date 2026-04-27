const { Router } = require('express');

const pricesRouter = require('./prices');
const walletsRouter = require('./wallets');
const transactionsRouter = require('./transactions');

const router = Router();

// Public routes (no auth required)
router.use('/prices', pricesRouter);

// Authenticated routes
router.use('/wallets', walletsRouter);
router.use('/transactions', transactionsRouter);

module.exports = router;
