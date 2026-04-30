'use client';

import { useState, useEffect } from 'react';
import { fmtBRL, fmtRelative, shortAddr } from '@/lib/formatters';
import api from '@/lib/api';

type WalletNetwork = 'ETH' | 'BTC' | 'SOL' | 'BSC' | 'MATIC' | 'AVAX' | 'ARB' | 'OP';

interface Wallet {
  id: string;
  name: string;
  address: string;
  network: WalletNetwork;
  last_synced_at: string | null;
  created_at: string;
}

const VALID_NETWORKS: WalletNetwork[] = ['ETH', 'BTC', 'SOL', 'BSC', 'MATIC', 'AVAX', 'ARB', 'OP'];

const NET_COLORS: Record<string, string> = {
  ETH: '#627eea', BTC: '#f7931a', SOL: '#9945ff',
  BSC: '#f3ba2f', MATIC: '#8247e5', AVAX: '#e84142',
  ARB: '#28a0f0', OP: '#ff0420',
};

function SyncStatusPill({ lastSyncedAt }: { lastSyncedAt: string | null }) {
  if (!lastSyncedAt) {
    return (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '3px 9px', borderRadius: 999, fontSize: 11, fontWeight: 500, color: 'var(--fg-mute)', background: 'var(--surface-2)', whiteSpace: 'nowrap' }}>
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--fg-mute)' }} />
        Nunca sincronizado
      </span>
    );
  }
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '3px 9px', borderRadius: 999, fontSize: 11, fontWeight: 500, color: 'var(--up-fg)', background: 'var(--up-bg)', whiteSpace: 'nowrap' }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--up-fg)' }} />
      Sincronizado
    </span>
  );
}

function WalletRow({ wallet, syncing, onSync, onDelete }: {
  wallet: Wallet;
  syncing: boolean;
  onSync: () => void;
  onDelete: () => void;
}) {
  const netColor = NET_COLORS[wallet.network] ?? '#888';
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto auto auto', alignItems: 'center', gap: 14, padding: '14px 20px', borderBottom: '1px solid var(--border-soft)' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--fg)' }}>{wallet.name}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--fg-mute)' }}>
            <span style={{ width: 8, height: 8, borderRadius: 2, background: netColor, flexShrink: 0 }} />
            {wallet.network}
          </span>
          <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--fg-mute)' }}>
            {shortAddr(wallet.address)}
          </span>
        </div>
      </div>
      <div style={{ fontSize: 12, color: 'var(--fg-mute)', whiteSpace: 'nowrap' }}>
        {wallet.last_synced_at ? fmtRelative(wallet.last_synced_at) : '—'}
      </div>
      <SyncStatusPill lastSyncedAt={wallet.last_synced_at} />
      <button
        onClick={onSync}
        disabled={syncing}
        style={{ padding: '5px 10px', borderRadius: 6, border: '1px solid var(--border-soft)', background: 'var(--surface-2)', color: 'var(--fg)', fontSize: 11, cursor: syncing ? 'not-allowed' : 'pointer', fontFamily: 'inherit', opacity: syncing ? 0.5 : 1, whiteSpace: 'nowrap' }}
      >
        {syncing ? 'Sincronizando…' : 'Sincronizar'}
      </button>
      <button
        onClick={onDelete}
        style={{ padding: '5px 10px', borderRadius: 6, border: '1px solid var(--border-soft)', background: 'var(--surface-2)', color: 'var(--down-fg)', fontSize: 11, cursor: 'pointer', fontFamily: 'inherit' }}
      >
        Remover
      </button>
    </div>
  );
}

function AddWalletModal({ onClose, onAdded }: { onClose: () => void; onAdded: (w: Wallet) => void }) {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [network, setNetwork] = useState<WalletNetwork>('ETH');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await api.post<Wallet>('/wallets', { name, address, network });
      onAdded(res.data);
      onClose();
    } catch (err: unknown) {
      const apiErr = err as { response?: { data?: { message?: string } } };
      setError(apiErr.response?.data?.message ?? 'Erro ao adicionar carteira.');
    } finally {
      setLoading(false);
    }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '9px 12px', borderRadius: 8,
    border: '1px solid var(--border-soft)', background: 'var(--bg)',
    color: 'var(--fg)', fontSize: 14, boxSizing: 'border-box',
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border-soft)', borderRadius: 14, padding: 28, width: 420, maxWidth: '95vw' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--fg)' }}>Adicionar carteira</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--fg-mute)', fontSize: 20, lineHeight: 1 }}>×</button>
        </div>
        {error && (
          <div style={{ marginBottom: 14, padding: '10px 14px', borderRadius: 8, background: 'var(--down-bg)', color: 'var(--down-fg)', fontSize: 13 }}>
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ display: 'block', fontSize: 12, color: 'var(--fg-mute)', marginBottom: 6 }}>Nome</label>
            <input value={name} onChange={e => setName(e.target.value)} required placeholder="Minha carteira ETH" style={inputStyle} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 12, color: 'var(--fg-mute)', marginBottom: 6 }}>Endereço</label>
            <input value={address} onChange={e => setAddress(e.target.value)} required placeholder="0x… ou bc1… ou endereço Solana" style={{ ...inputStyle, fontFamily: 'var(--font-mono)' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 12, color: 'var(--fg-mute)', marginBottom: 6 }}>Rede</label>
            <select value={network} onChange={e => setNetwork(e.target.value as WalletNetwork)} style={inputStyle}>
              {VALID_NETWORKS.map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
            <button type="button" onClick={onClose} style={{ flex: 1, padding: '9px', borderRadius: 8, border: '1px solid var(--border-soft)', background: 'var(--surface-2)', color: 'var(--fg)', fontSize: 14, cursor: 'pointer' }}>
              Cancelar
            </button>
            <button type="submit" disabled={loading} style={{ flex: 1, padding: '9px', borderRadius: 8, border: 'none', background: 'var(--accent)', color: '#fff', fontSize: 14, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1 }}>
              {loading ? 'Adicionando…' : 'Adicionar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function WalletsPage() {
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [totalBrl, setTotalBrl] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [syncingIds, setSyncingIds] = useState<Set<string>>(new Set());

  function loadData() {
    setLoading(true);
    Promise.all([
      api.get<Wallet[]>('/wallets'),
      api.get<{ totalBrl: number }>('/portfolio/summary'),
    ])
      .then(([walletsRes, summaryRes]) => {
        setWallets(walletsRes.data);
        setTotalBrl(summaryRes.data.totalBrl);
      })
      .catch(err => setError(err.response?.data?.message ?? err.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => { loadData(); }, []);

  async function handleSync(walletId: string) {
    setSyncingIds(prev => new Set(prev).add(walletId));
    try {
      await api.post(`/sync/wallet/${walletId}`);
      // Refresh wallets so last_synced_at updates
      const res = await api.get<Wallet[]>('/wallets');
      setWallets(res.data);
    } catch {
      // sync error is non-critical; the cron will retry
    } finally {
      setSyncingIds(prev => { const s = new Set(prev); s.delete(walletId); return s; });
    }
  }

  async function handleDelete(walletId: string) {
    if (!confirm('Remover esta carteira? As transações sincronizadas serão mantidas.')) return;
    try {
      await api.delete(`/wallets/${walletId}`);
      setWallets(prev => prev.filter(w => w.id !== walletId));
    } catch {
      alert('Erro ao remover carteira. Tente novamente.');
    }
  }

  if (loading) {
    return (
      <div style={{ padding: '24px 32px 64px', display: 'flex', flexDirection: 'column', gap: 18 }}>
        {[80, 220, 150].map((h, i) => (
          <div key={i} style={{ background: 'var(--surface)', border: '1px solid var(--border-soft)', borderRadius: 12, padding: 22 }}>
            <div style={{ height: h, borderRadius: 6, background: 'var(--surface-2)', animation: 'agon-pulse 1.5s ease-in-out infinite' }} />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '24px 32px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, marginTop: 64 }}>
        <div style={{ fontSize: 15, color: 'var(--down-fg)' }}>Erro ao carregar carteiras</div>
        <div style={{ fontSize: 13, color: 'var(--fg-mute)' }}>{error}</div>
        <button onClick={loadData} style={{ padding: '8px 20px', borderRadius: 8, background: 'var(--accent)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 13 }}>
          Tentar novamente
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px 32px 64px', display: 'flex', flexDirection: 'column', gap: 18 }}>
      {showAddModal && (
        <AddWalletModal
          onClose={() => setShowAddModal(false)}
          onAdded={w => setWallets(prev => [w, ...prev])}
        />
      )}

      {/* KPI + Add button */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border-soft)', borderRadius: 12, padding: '18px 22px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--fg-mute)', marginBottom: 6 }}>
            Portfólio total
          </div>
          <div style={{ fontSize: 28, fontWeight: 600, fontFamily: 'var(--font-mono)', letterSpacing: '-0.02em' }}>
            {fmtBRL(totalBrl)}
          </div>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 8, border: '1px solid var(--border-soft)', background: 'var(--surface-2)', color: 'var(--fg)', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 5v14M5 12l7-7 7 7" />
          </svg>
          Adicionar carteira
        </button>
      </div>

      {/* Wallet list */}
      {wallets.length === 0 ? (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border-soft)', borderRadius: 12, padding: '64px 24px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--fg-mute)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 12V22H4V12" /><path d="M22 7H2v5h20V7z" /><path d="M12 22V7" />
          </svg>
          <div style={{ fontSize: 15, fontWeight: 600 }}>Nenhuma carteira adicionada</div>
          <div style={{ fontSize: 13, color: 'var(--fg-mute)' }}>Adicione uma carteira para rastrear seu portfólio on-chain.</div>
          <button onClick={() => setShowAddModal(true)} style={{ marginTop: 4, padding: '8px 20px', borderRadius: 8, background: 'var(--accent)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 13 }}>
            Adicionar carteira
          </button>
        </div>
      ) : (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border-soft)', borderRadius: 12, overflow: 'hidden' }}>
          <div style={{ padding: '14px 20px 12px', borderBottom: '1px solid var(--border-soft)' }}>
            <span style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--fg-mute)' }}>
              Carteiras ({wallets.length})
            </span>
          </div>
          {wallets.map(w => (
            <WalletRow
              key={w.id}
              wallet={w}
              syncing={syncingIds.has(w.id)}
              onSync={() => handleSync(w.id)}
              onDelete={() => handleDelete(w.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
