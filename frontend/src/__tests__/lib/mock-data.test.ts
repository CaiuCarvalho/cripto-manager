import { describe, it, expect } from 'vitest';
import {
  COINS, HOLDINGS, TRANSACTIONS, WALLETS, TX_EXTENDED, ALERTS,
  NETWORKS, VENUES,
} from '@/lib/mock-data';

describe('COINS', () => {
  it('tem pelo menos 4 moedas', () => {
    expect(COINS.length).toBeGreaterThanOrEqual(4);
  });
  it('cada moeda tem campos obrigatórios', () => {
    COINS.forEach(c => {
      expect(c.id).toBeTruthy();
      expect(c.symbol).toBeTruthy();
      expect(c.price).toBeGreaterThan(0);
      expect(c.color).toMatch(/^#[0-9a-f]{6}$/i);
    });
  });
  it('IDs são únicos', () => {
    const ids = COINS.map(c => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe('HOLDINGS', () => {
  it('cada holding referencia uma moeda existente', () => {
    const coinIds = new Set(COINS.map(c => c.id));
    HOLDINGS.forEach(h => {
      expect(coinIds.has(h.coin)).toBe(true);
    });
  });
  it('amount e costBasis são positivos', () => {
    HOLDINGS.forEach(h => {
      expect(h.amount).toBeGreaterThan(0);
      expect(h.costBasis).toBeGreaterThan(0);
    });
  });
});

describe('TRANSACTIONS', () => {
  it('type é buy ou sell', () => {
    TRANSACTIONS.forEach(t => {
      expect(['buy', 'sell']).toContain(t.type);
    });
  });
  it('IDs são únicos', () => {
    const ids = TRANSACTIONS.map(t => t.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe('WALLETS', () => {
  it('status é ok, syncing ou error', () => {
    WALLETS.forEach(w => {
      expect(['ok', 'syncing', 'error']).toContain(w.status);
    });
  });
  it('type é onchain ou exchange', () => {
    WALLETS.forEach(w => {
      expect(['onchain', 'exchange']).toContain(w.type);
    });
  });
  it('saldo é número não-negativo', () => {
    WALLETS.forEach(w => {
      expect(w.balance_brl).toBeGreaterThanOrEqual(0);
    });
  });
  it('IDs são únicos', () => {
    const ids = WALLETS.map(w => w.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe('TX_EXTENDED', () => {
  it('type é buy, sell, reward ou transfer', () => {
    TX_EXTENDED.forEach(t => {
      expect(['buy', 'sell', 'reward', 'transfer']).toContain(t.type);
    });
  });
  it('wallet referencia wallet existente', () => {
    const walletIds = new Set(WALLETS.map(w => w.id));
    TX_EXTENDED.forEach(t => {
      expect(walletIds.has(t.wallet)).toBe(true);
    });
  });
  it('IDs são únicos', () => {
    const ids = TX_EXTENDED.map(t => t.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe('ALERTS', () => {
  it('status é armed, triggered ou paused', () => {
    ALERTS.forEach(a => {
      expect(['armed', 'triggered', 'paused']).toContain(a.status);
    });
  });
  it('kind é above, below, change ou wallet', () => {
    ALERTS.forEach(a => {
      expect(['above', 'below', 'change', 'wallet']).toContain(a.kind);
    });
  });
  it('IDs são únicos', () => {
    const ids = ALERTS.map(a => a.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe('NETWORKS e VENUES', () => {
  it('networks têm id, label e color', () => {
    NETWORKS.forEach(n => {
      expect(n.id).toBeTruthy();
      expect(n.label).toBeTruthy();
      expect(n.color).toMatch(/^#/);
    });
  });
  it('venues têm id, label e color', () => {
    VENUES.forEach(v => {
      expect(v.id).toBeTruthy();
      expect(v.label).toBeTruthy();
      expect(v.color).toMatch(/^#/);
    });
  });
});
