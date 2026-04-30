// frontend/src/lib/mock-data.ts

export interface Coin {
  id: string;
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  change7d: number;
  color: string;
}

export interface Holding {
  coin: string;
  amount: number;
  costBasis: number;
}

export interface Transaction {
  id: string;
  type: 'buy' | 'sell';
  coin: string;
  amount: number;
  price: number;
  date: string;
  venue: string;
}

export type Range = '1D' | '1S' | '1M' | '3M' | '1A' | 'Tudo';

export const COINS: Coin[] = [
  { id: 'btc',  symbol: 'BTC',  name: 'Bitcoin',    price: 71240.55, change24h:  1.42, change7d:  4.81, color: '#f2a23a' },
  { id: 'eth',  symbol: 'ETH',  name: 'Ethereum',   price:  3812.10, change24h:  0.78, change7d:  2.05, color: '#7b8aff' },
  { id: 'sol',  symbol: 'SOL',  name: 'Solana',     price:   178.32, change24h: -2.14, change7d:  6.92, color: '#9b6bd6' },
  { id: 'usdc', symbol: 'USDC', name: 'USD Coin',   price:     1.00, change24h:  0.00, change7d: -0.01, color: '#3b6dd6' },
  { id: 'link', symbol: 'LINK', name: 'Chainlink',  price:    18.04, change24h:  3.21, change7d: -1.18, color: '#3a6cb3' },
  { id: 'avax', symbol: 'AVAX', name: 'Avalanche',  price:    42.18, change24h: -0.95, change7d:  3.40, color: '#c94a4a' },
];

export const HOLDINGS: Holding[] = [
  { coin: 'btc',  amount: 0.4128,  costBasis: 58400.00 },
  { coin: 'eth',  amount: 6.2150,  costBasis:  2890.30 },
  { coin: 'sol',  amount: 84.500,  costBasis:   142.10 },
  { coin: 'link', amount: 240.00,  costBasis:    14.85 },
  { coin: 'usdc', amount: 4200.00, costBasis:     1.00 },
];

export const TRANSACTIONS: Transaction[] = [
  { id: 't1', type: 'buy',  coin: 'btc',  amount: 0.0420, price: 70180.00, date: '2026-04-26T14:32:00', venue: 'Binance' },
  { id: 't2', type: 'buy',  coin: 'sol',  amount: 12.500, price: 165.40,   date: '2026-04-25T09:11:00', venue: 'Coinbase' },
  { id: 't3', type: 'sell', coin: 'eth',  amount: 0.8000, price: 3795.20,  date: '2026-04-22T18:04:00', venue: 'Binance' },
  { id: 't4', type: 'buy',  coin: 'link', amount: 60.000, price: 17.20,    date: '2026-04-20T11:48:00', venue: 'Kraken' },
  { id: 't5', type: 'buy',  coin: 'eth',  amount: 1.5000, price: 3680.00,  date: '2026-04-15T08:22:00', venue: 'Binance' },
];

export const WATCHLIST = ['avax'];

export const USD_BRL = 5.10;

// --- Wallets ----------------------------------------------------------------

export type WalletStatus = 'ok' | 'syncing' | 'error';
export type WalletType = 'onchain' | 'exchange';

export interface Network {
  id: string;
  label: string;
  color: string;
}

export interface Wallet {
  id: string;
  type: WalletType;
  label: string;
  network?: string;
  venue?: string;
  address: string;
  balance_brl: number;
  last_sync: string;
  status: WalletStatus;
}

export const NETWORKS: Network[] = [
  { id: 'bitcoin',  label: 'Bitcoin',   color: '#f2a23a' },
  { id: 'ethereum', label: 'Ethereum',  color: '#7b8aff' },
  { id: 'solana',   label: 'Solana',    color: '#9b6bd6' },
  { id: 'polygon',  label: 'Polygon',   color: '#7b3fe4' },
  { id: 'base',     label: 'Base',      color: '#0052ff' },
  { id: 'arbitrum', label: 'Arbitrum',  color: '#28a0f0' },
];

export const VENUES: Network[] = [
  { id: 'binance',  label: 'Binance',  color: '#f0b90b' },
  { id: 'coinbase', label: 'Coinbase', color: '#1a55f7' },
  { id: 'kraken',   label: 'Kraken',   color: '#5841d8' },
];

export const WALLETS: Wallet[] = [
  { id: 'w1', type: 'onchain',  label: 'Cold Storage BTC',  network: 'bitcoin',  address: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh', balance_brl: 29410.00, last_sync: '2026-04-29T12:14:00', status: 'ok' },
  { id: 'w2', type: 'onchain',  label: 'Hot ETH',           network: 'ethereum', address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb1',  balance_brl: 23685.40, last_sync: '2026-04-29T12:18:00', status: 'ok' },
  { id: 'w3', type: 'onchain',  label: 'Solana farming',    network: 'solana',   address: '7vfCXTUXx5WJV5JADk17DUJ4ksgau7utNKj4b963voxs', balance_brl: 15078.95, last_sync: '2026-04-29T11:02:00', status: 'syncing' },
  { id: 'w4', type: 'exchange', label: 'Binance principal', venue:   'binance',  address: '••••3829', balance_brl: 18420.00, last_sync: '2026-04-29T12:21:00', status: 'ok' },
  { id: 'w5', type: 'exchange', label: 'Coinbase reserva',  venue:   'coinbase', address: '••••7110', balance_brl:  4200.30, last_sync: '2026-04-28T22:55:00', status: 'error' },
];

// --- Extended Transactions --------------------------------------------------

export type TxType = 'buy' | 'sell' | 'reward' | 'transfer';
export type TxSource = 'onchain' | 'manual';

export interface TxExtended {
  id: string;
  source: TxSource;
  wallet: string;
  type: TxType;
  coin: string;
  amount: number;
  price: number;
  date: string;
  hash?: string;
}

export const TX_EXTENDED: TxExtended[] = [
  { id: 'tx1', source: 'onchain', wallet: 'w1', type: 'buy',      coin: 'btc',  amount: 0.0420, price: 70180.00, date: '2026-04-26T14:32:00', hash: '4e3a…b0c1' },
  { id: 'tx2', source: 'manual',  wallet: 'w4', type: 'buy',      coin: 'sol',  amount: 12.500, price:   165.40, date: '2026-04-25T09:11:00' },
  { id: 'tx3', source: 'onchain', wallet: 'w2', type: 'sell',     coin: 'eth',  amount:  0.800, price:  3795.20, date: '2026-04-22T18:04:00', hash: '9a72…ff42' },
  { id: 'tx4', source: 'onchain', wallet: 'w3', type: 'reward',   coin: 'sol',  amount:  0.142, price:   178.30, date: '2026-04-21T03:00:00', hash: '6c19…4ad8' },
  { id: 'tx5', source: 'manual',  wallet: 'w4', type: 'buy',      coin: 'link', amount: 60.000, price:    17.20, date: '2026-04-20T11:48:00' },
  { id: 'tx6', source: 'onchain', wallet: 'w2', type: 'transfer', coin: 'eth',  amount:  1.500, price:  3680.00, date: '2026-04-15T08:22:00', hash: '1d54…9e21' },
  { id: 'tx7', source: 'manual',  wallet: 'w5', type: 'sell',     coin: 'sol',  amount:  5.000, price:   188.10, date: '2026-04-12T16:55:00' },
  { id: 'tx8', source: 'onchain', wallet: 'w1', type: 'buy',      coin: 'btc',  amount:  0.110, price: 64250.00, date: '2026-04-08T10:01:00', hash: 'af20…7b3c' },
];

// --- Alerts -----------------------------------------------------------------

export type AlertKind = 'above' | 'below' | 'change' | 'wallet';
export type AlertStatus = 'armed' | 'triggered' | 'paused';

export interface Alert {
  id: string;
  coin: string;
  kind: AlertKind;
  threshold: number;
  window?: string;
  wallet?: string;
  status: AlertStatus;
  last_check: string;
  triggered_at?: string;
}

export const ALERTS: Alert[] = [
  { id: 'a1', coin: 'btc',  kind: 'above',  threshold:  75000,            status: 'armed',     last_check: '2026-04-29T12:20:00' },
  { id: 'a2', coin: 'eth',  kind: 'below',  threshold:   3500,            status: 'armed',     last_check: '2026-04-29T12:20:00' },
  { id: 'a3', coin: 'sol',  kind: 'change', threshold:    -10, window: '24h', status: 'armed', last_check: '2026-04-29T12:20:00' },
  { id: 'a4', coin: 'link', kind: 'above',  threshold:     22,            status: 'triggered', last_check: '2026-04-29T08:14:00', triggered_at: '2026-04-28T19:30:00' },
  { id: 'a5', coin: 'btc',  kind: 'wallet', threshold:      0, wallet: 'w1', status: 'armed',  last_check: '2026-04-29T12:18:00' },
];

function genSeries(seed: number, points: number, base: number, vol: number): number[] {
  let x = seed;
  const arr: number[] = [];
  let v = base;
  for (let i = 0; i < points; i++) {
    x = (x * 9301 + 49297) % 233280;
    const r = (x / 233280 - 0.5) * 2;
    v = v * (1 + r * vol);
    arr.push(v);
  }
  return arr;
}

function rescaleToEnd(arr: number[], end: number): number[] {
  const last = arr[arr.length - 1];
  return arr.map(v => v * (end / last));
}

export const SERIES: Record<string, Record<Range, number[]>> = {};
COINS.forEach((c, i) => {
  SERIES[c.id] = {
    '1D':   rescaleToEnd(genSeries(11 + i,  60, c.price, 0.012), c.price),
    '1S':   rescaleToEnd(genSeries(31 + i,  84, c.price, 0.018), c.price),
    '1M':   rescaleToEnd(genSeries(53 + i, 120, c.price, 0.025), c.price),
    '3M':   rescaleToEnd(genSeries(71 + i, 150, c.price, 0.035), c.price),
    '1A':   rescaleToEnd(genSeries(97 + i, 180, c.price, 0.055), c.price),
    'Tudo': rescaleToEnd(genSeries(113 + i, 220, c.price, 0.080), c.price),
  };
});

function buildPortfolioSeries(range: Range): number[] {
  const n = Math.min(...HOLDINGS.map(h => SERIES[h.coin][range].length));
  const out = new Array(n).fill(0);
  HOLDINGS.forEach(h => {
    const s = SERIES[h.coin][range];
    for (let i = 0; i < n; i++) out[i] += s[i] * h.amount;
  });
  return out;
}

export const PORTFOLIO_SERIES: Record<Range, number[]> = {
  '1D':   buildPortfolioSeries('1D'),
  '1S':   buildPortfolioSeries('1S'),
  '1M':   buildPortfolioSeries('1M'),
  '3M':   buildPortfolioSeries('3M'),
  '1A':   buildPortfolioSeries('1A'),
  'Tudo': buildPortfolioSeries('Tudo'),
};
