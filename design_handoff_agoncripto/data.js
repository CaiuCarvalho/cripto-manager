// data.js — dados mock para AgonCripto. Preços plausíveis abr/2026.

const COINS = [
  { id: 'btc', symbol: 'BTC', name: 'Bitcoin',   price: 71240.55, change24h:  1.42, change7d:  4.81, color: '#f2a23a' },
  { id: 'eth', symbol: 'ETH', name: 'Ethereum',  price:  3812.10, change24h:  0.78, change7d:  2.05, color: '#7b8aff' },
  { id: 'sol', symbol: 'SOL', name: 'Solana',    price:   178.32, change24h: -2.14, change7d:  6.92, color: '#9b6bd6' },
  { id: 'usdc',symbol: 'USDC',name: 'USD Coin',  price:     1.00, change24h:  0.00, change7d: -0.01, color: '#3b6dd6' },
  { id: 'link',symbol: 'LINK',name: 'Chainlink', price:    18.04, change24h:  3.21, change7d: -1.18, color: '#3a6cb3' },
  { id: 'avax',symbol: 'AVAX',name: 'Avalanche', price:    42.18, change24h: -0.95, change7d:  3.40, color: '#c94a4a' },
];

// Holdings do usuário
const HOLDINGS = [
  { coin: 'btc',  amount: 0.4128,  costBasis: 58400.00 },
  { coin: 'eth',  amount: 6.2150,  costBasis:  2890.30 },
  { coin: 'sol',  amount: 84.500,  costBasis:   142.10 },
  { coin: 'link', amount: 240.00,  costBasis:    14.85 },
  { coin: 'usdc', amount: 4200.00, costBasis:     1.00 },
];

// Transações recentes
const TRANSACTIONS = [
  { id: 't1', type: 'buy',  coin: 'btc',  amount: 0.0420, price: 70180.00, date: '2026-04-26T14:32:00', venue: 'Binance' },
  { id: 't2', type: 'buy',  coin: 'sol',  amount: 12.500, price: 165.40,   date: '2026-04-25T09:11:00', venue: 'Coinbase' },
  { id: 't3', type: 'sell', coin: 'eth',  amount: 0.8000, price: 3795.20,  date: '2026-04-22T18:04:00', venue: 'Binance' },
  { id: 't4', type: 'buy',  coin: 'link', amount: 60.000, price: 17.20,    date: '2026-04-20T11:48:00', venue: 'Kraken' },
  { id: 't5', type: 'buy',  coin: 'eth',  amount: 1.5000, price: 3680.00,  date: '2026-04-15T08:22:00', venue: 'Binance' },
  { id: 't6', type: 'sell', coin: 'sol',  amount: 5.0000, price: 188.10,   date: '2026-04-12T16:55:00', venue: 'Coinbase' },
  { id: 't7', type: 'buy',  coin: 'btc',  amount: 0.1100, price: 64250.00, date: '2026-04-08T10:01:00', venue: 'Kraken' },
];

// Gera uma série de preços determinística e plausível para um coin
function genSeries(seed, points, base, vol) {
  let x = seed;
  const arr = [];
  let v = base;
  for (let i = 0; i < points; i++) {
    x = (x * 9301 + 49297) % 233280;
    const r = (x / 233280 - 0.5) * 2; // -1..1
    v = v * (1 + r * vol);
    arr.push(v);
  }
  // Normaliza pro último ponto bater com price atual
  return arr;
}

function rescaleToEnd(arr, end) {
  const last = arr[arr.length - 1];
  return arr.map(v => v * (end / last));
}

const SERIES = {};
COINS.forEach((c, i) => {
  SERIES[c.id] = {
    '1D': rescaleToEnd(genSeries(11 + i,  60, c.price, 0.012), c.price),
    '1S': rescaleToEnd(genSeries(31 + i,  84, c.price, 0.018), c.price),
    '1M': rescaleToEnd(genSeries(53 + i, 120, c.price, 0.025), c.price),
    '3M': rescaleToEnd(genSeries(71 + i, 150, c.price, 0.035), c.price),
    '1A': rescaleToEnd(genSeries(97 + i, 180, c.price, 0.055), c.price),
    'Tudo': rescaleToEnd(genSeries(113+ i, 220, c.price, 0.080), c.price),
  };
});

// Série do portfólio total = soma ponderada das séries
function buildPortfolioSeries(range) {
  const lengths = HOLDINGS.map(h => SERIES[h.coin][range].length);
  const n = Math.min(...lengths);
  const out = new Array(n).fill(0);
  HOLDINGS.forEach(h => {
    const s = SERIES[h.coin][range];
    for (let i = 0; i < n; i++) out[i] += s[i] * h.amount;
  });
  return out;
}

const PORTFOLIO_SERIES = {
  '1D':   buildPortfolioSeries('1D'),
  '1S':   buildPortfolioSeries('1S'),
  '1M':   buildPortfolioSeries('1M'),
  '3M':   buildPortfolioSeries('3M'),
  '1A':   buildPortfolioSeries('1A'),
  'Tudo': buildPortfolioSeries('Tudo'),
};

// Watchlist: moedas que NÃO estão nos holdings
const WATCHLIST = ['avax'];

Object.assign(window, {
  COINS, HOLDINGS, TRANSACTIONS, SERIES, PORTFOLIO_SERIES, WATCHLIST,
});
