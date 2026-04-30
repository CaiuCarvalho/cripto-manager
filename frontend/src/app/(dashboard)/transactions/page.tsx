'use client';

import { useState } from 'react';
import { TX_EXTENDED, WALLETS, COINS, type TxExtended, type TxType } from '@/lib/mock-data';
import { fmtBRL, fmtDate, fmtAmount } from '@/lib/formatters';

const TYPE_LABELS: Record<TxType, string> = {
  buy:      'Compra',
  sell:     'Venda',
  reward:   'Reward',
  transfer: 'Transferência',
};

const TYPE_COLORS: Record<TxType, { fg: string; bg: string }> = {
  buy:      { fg: 'var(--up-fg)',   bg: 'var(--up-bg)' },
  sell:     { fg: 'var(--down-fg)', bg: 'var(--down-bg)' },
  reward:   { fg: '#7b8aff',        bg: 'rgba(123,138,255,0.12)' },
  transfer: { fg: 'var(--fg-mute)', bg: 'var(--surface-2)' },
};

function TypeBadge({ type }: { type: TxType }) {
  const c = TYPE_COLORS[type];
  return (
    <span style={{
      display: 'inline-block', padding: '2px 8px', borderRadius: 6,
      fontSize: 11, fontWeight: 500, color: c.fg, background: c.bg,
      whiteSpace: 'nowrap',
    }}>
      {TYPE_LABELS[type]}
    </span>
  );
}

function SourceDot({ source }: { source: 'onchain' | 'manual' }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      fontSize: 11, color: 'var(--fg-mute)',
    }}>
      <span style={{
        width: 5, height: 5, borderRadius: '50%',
        background: source === 'onchain' ? '#7b8aff' : 'var(--fg-mute)',
      }} />
      {source === 'onchain' ? 'on-chain' : 'manual'}
    </span>
  );
}

function TxRow({ tx }: { tx: TxExtended }) {
  const coin   = COINS.find(c => c.id === tx.coin);
  const wallet = WALLETS.find(w => w.id === tx.wallet);
  const total  = tx.amount * tx.price;

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '80px 1fr auto auto auto',
      alignItems: 'center',
      gap: 14,
      padding: '13px 20px',
      borderBottom: '1px solid var(--border-soft)',
    }}>
      {/* Tipo */}
      <TypeBadge type={tx.type} />

      {/* Ativo + carteira */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 3, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {coin && (
            <span style={{
              width: 8, height: 8, borderRadius: '50%',
              background: coin.color, flexShrink: 0,
            }} />
          )}
          <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--fg)' }}>
            {fmtAmount(tx.amount, 4)} {coin?.symbol ?? tx.coin.toUpperCase()}
          </span>
          <span style={{ fontSize: 12, color: 'var(--fg-mute)', fontFamily: 'var(--font-mono)' }}>
            @ {fmtBRL(tx.price)}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {wallet && (
            <span style={{ fontSize: 11, color: 'var(--fg-mute)' }}>{wallet.label}</span>
          )}
          <SourceDot source={tx.source} />
          {tx.hash && (
            <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--fg-mute)' }}>
              {tx.hash}
            </span>
          )}
        </div>
      </div>

      {/* Data */}
      <div style={{ fontSize: 12, color: 'var(--fg-mute)', whiteSpace: 'nowrap' }}>
        {fmtDate(tx.date)}
      </div>

      {/* Total BRL */}
      <div style={{
        fontSize: 14, fontWeight: 600, fontFamily: 'var(--font-mono)',
        color: tx.type === 'sell' ? 'var(--up-fg)' : 'var(--fg)',
        textAlign: 'right', whiteSpace: 'nowrap', minWidth: 110,
      }}>
        {tx.type === 'sell' ? '+' : ''}{fmtBRL(total)}
      </div>
    </div>
  );
}

const ALL_TYPES: Array<TxType | 'all'> = ['all', 'buy', 'sell', 'reward', 'transfer'];
const TYPE_FILTER_LABELS: Record<string, string> = {
  all: 'Todos', buy: 'Compras', sell: 'Vendas', reward: 'Rewards', transfer: 'Transferências',
};

export default function TransactionsPage() {
  const [filter, setFilter] = useState<TxType | 'all'>('all');

  const sorted = [...TX_EXTENDED].sort((a, b) => b.date.localeCompare(a.date));
  const visible = filter === 'all' ? sorted : sorted.filter(tx => tx.type === filter);

  const totalBuy  = sorted.filter(t => t.type === 'buy').reduce((s, t) => s + t.amount * t.price, 0);
  const totalSell = sorted.filter(t => t.type === 'sell').reduce((s, t) => s + t.amount * t.price, 0);

  return (
    <div style={{ padding: '24px 32px 64px', display: 'flex', flexDirection: 'column', gap: 18 }}>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
        {[
          { label: 'Total comprado', value: fmtBRL(totalBuy),  color: 'var(--fg)' },
          { label: 'Total vendido',  value: fmtBRL(totalSell), color: 'var(--up-fg)' },
          { label: 'Transações',     value: String(sorted.length), color: 'var(--fg)' },
        ].map(k => (
          <div key={k.label} style={{
            background: 'var(--surface)', border: '1px solid var(--border-soft)',
            borderRadius: 12, padding: '16px 20px',
          }}>
            <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--fg-mute)', marginBottom: 6 }}>
              {k.label}
            </div>
            <div style={{ fontSize: 22, fontWeight: 600, fontFamily: 'var(--font-mono)', color: k.color }}>
              {k.value}
            </div>
          </div>
        ))}
      </div>

      {/* Tabela */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border-soft)', borderRadius: 12, overflow: 'hidden' }}>

        {/* Filtros */}
        <div style={{
          padding: '12px 20px', borderBottom: '1px solid var(--border-soft)',
          display: 'flex', alignItems: 'center', gap: 4,
        }}>
          {ALL_TYPES.map(t => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              style={{
                padding: '5px 12px', borderRadius: 7, border: 0, fontSize: 12,
                background: filter === t ? 'var(--accent-soft)' : 'transparent',
                color: filter === t ? 'var(--accent)' : 'var(--fg-mute)',
                fontWeight: filter === t ? 600 : 400,
                cursor: 'pointer', fontFamily: 'inherit',
              }}
            >
              {TYPE_FILTER_LABELS[t]}
            </button>
          ))}
        </div>

        {/* Header */}
        <div style={{
          display: 'grid', gridTemplateColumns: '80px 1fr auto auto auto',
          gap: 14, padding: '10px 20px',
          borderBottom: '1px solid var(--border-soft)',
          fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--fg-mute)',
        }}>
          <span>Tipo</span>
          <span>Ativo</span>
          <span>Data</span>
          <span style={{ textAlign: 'right' }}>Total</span>
        </div>

        {visible.length === 0 ? (
          <div style={{ padding: '48px 24px', textAlign: 'center', color: 'var(--fg-mute)', fontSize: 13 }}>
            Nenhuma transação encontrada.
          </div>
        ) : (
          visible.map((tx, i) => (
            <div key={tx.id} style={i === visible.length - 1 ? { borderBottom: 'none' } : {}}>
              <TxRow tx={tx} />
            </div>
          ))
        )}
      </div>
    </div>
  );
}
