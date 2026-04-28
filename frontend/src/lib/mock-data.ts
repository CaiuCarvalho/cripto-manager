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
