'use client';

import { WALLETS, NETWORKS, VENUES, type Wallet, type WalletStatus } from '@/lib/mock-data';
import { fmtBRL, fmtRelative, shortAddr } from '@/lib/formatters';

function StatusPill({ status }: { status: WalletStatus }) {
  const map: Record<WalletStatus, { label: string; fg: string; bg: string; dot: string }> = {
    ok:      { label: 'Sincronizado',  fg: 'var(--up-fg)',   bg: 'var(--up-bg)',          dot: 'var(--up-fg)' },
    syncing: { label: 'Sincronizando', fg: '#a87018',        bg: 'rgba(168,112,24,0.14)', dot: '#d8932e' },
    error:   { label: 'Falha',         fg: 'var(--down-fg)', bg: 'var(--down-bg)',        dot: 'var(--down-fg)' },
  };
  const s = map[status];
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '3px 9px', borderRadius: 999, fontSize: 11, fontWeight: 500,
      color: s.fg, background: s.bg, whiteSpace: 'nowrap',
    }}>
      <span style={{
        width: 6, height: 6, borderRadius: '50%', background: s.dot,
        animation: status === 'syncing' ? 'agon-pulse 1.2s ease-in-out infinite' : 'none',
      }} />
      {s.label}
    </span>
  );
}

function NetChip({ wallet }: { wallet: Wallet }) {
  const source = wallet.type === 'onchain' ? NETWORKS : VENUES;
  const key    = wallet.type === 'onchain' ? wallet.network : wallet.venue;
  const n      = source.find(x => x.id === key);
  if (!n) return null;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--fg-mute)' }}>
      <span style={{ width: 8, height: 8, borderRadius: 2, background: n.color, flexShrink: 0 }} />
      {n.label}
    </span>
  );
}

function WalletRow({ wallet, last }: { wallet: Wallet; last: boolean }) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '1fr auto auto auto',
      alignItems: 'center',
      gap: 16,
      padding: '14px 20px',
      borderBottom: last ? 'none' : '1px solid var(--border-soft)',
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--fg)' }}>{wallet.label}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <NetChip wallet={wallet} />
          <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--fg-mute)' }}>
            {shortAddr(wallet.address)}
          </span>
        </div>
      </div>

      <div style={{ fontSize: 12, color: 'var(--fg-mute)', textAlign: 'right', whiteSpace: 'nowrap' }}>
        {fmtRelative(wallet.last_sync)}
      </div>

      <StatusPill status={wallet.status} />

      <div style={{
        fontSize: 14, fontWeight: 600, fontFamily: 'var(--font-mono)',
        color: 'var(--fg)', textAlign: 'right', whiteSpace: 'nowrap', minWidth: 120,
      }}>
        {fmtBRL(wallet.balance_brl)}
      </div>
    </div>
  );
}

function WalletGroup({ title, items }: { title: string; items: Wallet[] }) {
  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border-soft)', borderRadius: 12, overflow: 'hidden' }}>
      <div style={{ padding: '14px 20px 12px', borderBottom: '1px solid var(--border-soft)' }}>
        <span style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--fg-mute)' }}>
          {title}
        </span>
      </div>
      {items.map((w, i) => (
        <WalletRow key={w.id} wallet={w} last={i === items.length - 1} />
      ))}
    </div>
  );
}

export default function WalletsPage() {
  const onchain  = WALLETS.filter(w => w.type === 'onchain');
  const exchange = WALLETS.filter(w => w.type === 'exchange');
  const total    = WALLETS.reduce((s, w) => s + w.balance_brl, 0);

  return (
    <div style={{ padding: '24px 32px 64px', display: 'flex', flexDirection: 'column', gap: 18 }}>

      {/* KPI total */}
      <div style={{
        background: 'var(--surface)', border: '1px solid var(--border-soft)',
        borderRadius: 12, padding: '18px 22px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div>
          <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--fg-mute)', marginBottom: 6 }}>
            Total em carteiras
          </div>
          <div style={{ fontSize: 28, fontWeight: 600, fontFamily: 'var(--font-mono)', letterSpacing: '-0.02em' }}>
            {fmtBRL(total)}
          </div>
        </div>
        <button style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '8px 14px', borderRadius: 8, border: '1px solid var(--border-soft)',
          background: 'var(--surface-2)', color: 'var(--fg)', fontSize: 13,
          cursor: 'pointer', fontFamily: 'inherit',
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 5v14M5 12l7-7 7 7" />
          </svg>
          Adicionar carteira
        </button>
      </div>

      {onchain.length  > 0 && <WalletGroup title="On-chain"  items={onchain}  />}
      {exchange.length > 0 && <WalletGroup title="Exchanges" items={exchange} />}
    </div>
  );
}
