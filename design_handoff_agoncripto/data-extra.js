// data-extra.js — mock estruturado como resposta de API para Wallets, Transactions, Alerts

const NETWORKS = [
  { id: 'bitcoin',  label: 'Bitcoin',   color: '#f2a23a' },
  { id: 'ethereum', label: 'Ethereum',  color: '#7b8aff' },
  { id: 'solana',   label: 'Solana',    color: '#9b6bd6' },
  { id: 'polygon',  label: 'Polygon',   color: '#7b3fe4' },
  { id: 'base',     label: 'Base',      color: '#0052ff' },
  { id: 'arbitrum', label: 'Arbitrum',  color: '#28a0f0' },
];

const VENUES = [
  { id: 'binance',   label: 'Binance',   color: '#f0b90b' },
  { id: 'coinbase',  label: 'Coinbase',  color: '#1a55f7' },
  { id: 'kraken',    label: 'Kraken',    color: '#5841d8' },
];

// Mock walletas. shape: { id, type, label, network|venue, address, balance_brl, last_sync, status }
const WALLETS = [
  { id: 'w1', type: 'onchain',  label: 'Cold Storage BTC', network: 'bitcoin',  address: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh', balance_brl: 29410.00, last_sync: '2026-04-29T12:14:00', status: 'ok' },
  { id: 'w2', type: 'onchain',  label: 'Hot ETH',          network: 'ethereum', address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb1', balance_brl: 23685.40, last_sync: '2026-04-29T12:18:00', status: 'ok' },
  { id: 'w3', type: 'onchain',  label: 'Solana farming',   network: 'solana',   address: '7vfCXTUXx5WJV5JADk17DUJ4ksgau7utNKj4b963voxs',                       balance_brl: 15078.95, last_sync: '2026-04-29T11:02:00', status: 'syncing' },
  { id: 'w4', type: 'exchange', label: 'Binance principal',venue:   'binance',  address: '••••3829', balance_brl: 18420.00, last_sync: '2026-04-29T12:21:00', status: 'ok' },
  { id: 'w5', type: 'exchange', label: 'Coinbase reserva', venue:   'coinbase', address: '••••7110', balance_brl:  4200.30, last_sync: '2026-04-28T22:55:00', status: 'error' },
];

// Transações estendidas (on-chain + manual)
const TX_EXTENDED = [
  { id: 'tx1', source: 'onchain', wallet: 'w1', type: 'buy',      coin: 'btc',  amount: 0.0420, price: 70180.00, date: '2026-04-26T14:32:00', hash: '4e3a…b0c1' },
  { id: 'tx2', source: 'manual',  wallet: 'w4', type: 'buy',      coin: 'sol',  amount: 12.500, price:   165.40, date: '2026-04-25T09:11:00' },
  { id: 'tx3', source: 'onchain', wallet: 'w2', type: 'sell',     coin: 'eth',  amount:  0.800, price:  3795.20, date: '2026-04-22T18:04:00', hash: '9a72…ff42' },
  { id: 'tx4', source: 'onchain', wallet: 'w3', type: 'reward',   coin: 'sol',  amount:  0.142, price:   178.30, date: '2026-04-21T03:00:00', hash: '6c19…4ad8' },
  { id: 'tx5', source: 'manual',  wallet: 'w4', type: 'buy',      coin: 'link', amount: 60.000, price:    17.20, date: '2026-04-20T11:48:00' },
  { id: 'tx6', source: 'onchain', wallet: 'w2', type: 'transfer', coin: 'eth',  amount:  1.500, price:  3680.00, date: '2026-04-15T08:22:00', hash: '1d54…9e21' },
  { id: 'tx7', source: 'manual',  wallet: 'w5', type: 'sell',     coin: 'sol',  amount:  5.000, price:   188.10, date: '2026-04-12T16:55:00' },
  { id: 'tx8', source: 'onchain', wallet: 'w1', type: 'buy',      coin: 'btc',  amount:  0.110, price: 64250.00, date: '2026-04-08T10:01:00', hash: 'af20…7b3c' },
];

// Alertas
const ALERTS = [
  { id: 'a1', coin: 'btc',  kind: 'above',   threshold:  75000, status: 'armed',     last_check: '2026-04-29T12:20:00' },
  { id: 'a2', coin: 'eth',  kind: 'below',   threshold:   3500, status: 'armed',     last_check: '2026-04-29T12:20:00' },
  { id: 'a3', coin: 'sol',  kind: 'change',  threshold:    -10, window: '24h', status: 'armed', last_check: '2026-04-29T12:20:00' },
  { id: 'a4', coin: 'link', kind: 'above',   threshold:     22, status: 'triggered', last_check: '2026-04-29T08:14:00', triggered_at: '2026-04-28T19:30:00' },
  { id: 'a5', coin: 'btc',  kind: 'wallet',  wallet: 'w1', status: 'armed', last_check: '2026-04-29T12:18:00' },
];

Object.assign(window, { NETWORKS, VENUES, WALLETS, TX_EXTENDED, ALERTS });
