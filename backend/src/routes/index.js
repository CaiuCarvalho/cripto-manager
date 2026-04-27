const { Router } = require('express');

const walletsRouter = require('./wallets');
const transactionsRouter = require('./transactions');

const router = Router();

// Authenticated routes
router.use('/wallets', walletsRouter);
router.use('/transactions', transactionsRouter);

module.exports = router;
