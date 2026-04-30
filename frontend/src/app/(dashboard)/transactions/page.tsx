'use client';

import { useState, useEffect } from 'react';
import { fmtBRL, fmtDate, fmtAmount } from '@/lib/formatters';
import api from '@/lib/api';

type TxType = 'RECEIVE' | 'SEND' | 'CONTRACT' | 'SWAP' | 'STAKE';

interface Transaction {
  id: string;
  type: TxType;
  token_symbol: string;
  amount: number;
  value_usd: number | null;
  confirmed_at: string | null;
  tx_hash: string | null;
}

interface TransactionsResponse {
  transactions: Transaction[];
  total: number;
  limit: number;
  offset: number;
}

const TYPE_LABELS: Record<string, string> = {
  RECEIVE: 'Entrada', SEND: 'Saída', CONTRACT: 'Contrato', SWAP: 'Swap', STAKE: 'Stake',
};

const TYPE_COLORS: Record<string, { fg: string; bg: string }> = {
  RECEIVE:  { fg: 'var(--up-fg)',   bg: 'var(--up-bg)' },
  SEND:     { fg: 'var(--down-fg)', bg: 'var(--down-bg)' },
  CONTRACT: { fg: '#7b8aff',        bg: 'rgba(123,138,255,0.12)' },
  SWAP:     { fg: '#7b8aff',        bg: 'rgba(123,138,255,0.12)' },
  STAKE:    { fg: 'var(--fg-mute)', bg: 'var(--surface-2)' },
};

const FILTER_OPTIONS: Array<{ value: string; label: string }> = [
  { value: 'all',      label: 'Todos' },
  { value: 'RECEIVE',  label: 'Entradas' },
  { value: 'SEND',     label: 'Saídas' },
  { value: 'CONTRACT', label: 'Contratos' },
  { value: 'SWAP',     label: 'Swaps' },
  { value: 'STAKE',    label: 'Stakes' },
];

const USD_BRL = 5.10;
const PAGE_SIZE = 50;

function TypeBadge({ type }: { type: string }) {
  const c = TYPE_COLORS[type] ?? { fg: 'var(--fg-mute)', bg: 'var(--surface-2)' };
  return (
    <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: 6, fontSize: 11, fontWeight: 500, color: c.fg, background: c.bg, whiteSpace: 'nowrap' }}>
      {TYPE_LABELS[type] ?? type}
    </span>
  );
}

export default function TransactionsPage() {
  const [filter, setFilter] = useState('all');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    const params: Record<string, string | number> = { limit: PAGE_SIZE, offset };
    if (filter !== 'all') params.type = filter;

    api.get<TransactionsResponse>('/transactions', { params })
      .then(res => {
        setTransactions(res.data.transactions ?? []);
        setTotal(res.data.total ?? 0);
      })
      .catch(err => setError(err.response?.data?.message ?? err.message))
      .finally(() => setLoading(false));
  }, [filter, offset]);

  function handleFilterChange(f: string) {
    setFilter(f);
    setOffset(0);
  }

  const totalReceive = transactions.filter(t => t.type === 'RECEIVE').reduce((s, t) => s + (t.value_usd ?? 0) * USD_BRL, 0);
  const totalSend    = transactions.filter(t => t.type === 'SEND').reduce((s, t) => s + (t.value_usd ?? 0) * USD_BRL, 0);

  if (error) {
    return (
      <div style={{ padding: '24px 32px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, marginTop: 64 }}>
        <div style={{ fontSize: 15, color: 'var(--down-fg)' }}>Erro ao carregar transações</div>
        <div style={{ fontSize: 13, color: 'var(--fg-mute)' }}>{error}</div>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px 32px 64px', display: 'flex', flexDirection: 'column', gap: 18 }}>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
        {[
          { label: 'Total entradas', value: fmtBRL(totalReceive), color: 'var(--up-fg)' },
          { label: 'Total saídas',   value: fmtBRL(totalSend),    color: 'var(--down-fg)' },
          { label: 'Transações',     value: String(total),        color: 'var(--fg)' },
        ].map(k => (
          <div key={k.label} style={{ background: 'var(--surface)', border: '1px solid var(--border-soft)', borderRadius: 12, padding: '16px 20px' }}>
            <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--fg-mute)', marginBottom: 6 }}>{k.label}</div>
            <div style={{ fontSize: 22, fontWeight: 600, fontFamily: 'var(--font-mono)', color: k.color }}>{k.value}</div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border-soft)', borderRadius: 12, overflow: 'hidden' }}>
        {/* Filters */}
        <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--border-soft)', display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap' }}>
          {FILTER_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => handleFilterChange(opt.value)}
              style={{
                padding: '5px 12px', borderRadius: 7, border: 0, fontSize: 12,
                background: filter === opt.value ? 'var(--accent-soft)' : 'transparent',
                color: filter === opt.value ? 'var(--accent)' : 'var(--fg-mute)',
                fontWeight: filter === opt.value ? 600 : 400,
                cursor: 'pointer', fontFamily: 'inherit',
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Header */}
        <div style={{ display: 'grid', gridTemplateColumns: '90px 1fr auto auto', gap: 14, padding: '10px 20px', borderBottom: '1px solid var(--border-soft)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--fg-mute)' }}>
          <span>Tipo</span><span>Ativo</span><span>Data</span><span style={{ textAlign: 'right' }}>Total</span>
        </div>

        {loading ? (
          <div style={{ padding: '48px', textAlign: 'center', color: 'var(--fg-mute)', fontSize: 13 }}>
            Carregando…
          </div>
        ) : transactions.length === 0 ? (
          <div style={{ padding: '48px 24px', textAlign: 'center', color: 'var(--fg-mute)', fontSize: 13 }}>
            Nenhuma transação encontrada.
          </div>
        ) : (
          <>
            {transactions.map(tx => {
              const rowTotal = (tx.value_usd ?? 0) * USD_BRL;
              return (
                <div
                  key={tx.id}
                  style={{ display: 'grid', gridTemplateColumns: '90px 1fr auto auto', alignItems: 'center', gap: 14, padding: '13px 20px', borderBottom: '1px solid var(--border-soft)', transition: 'background 0.1s' }}
                  onMouseEnter={ev => (ev.currentTarget.style.background = 'var(--surface-2)')}
                  onMouseLeave={ev => (ev.currentTarget.style.background = 'transparent')}
                >
                  <TypeBadge type={tx.type} />
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 3, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--fg)' }}>
                      {fmtAmount(tx.amount, 4)} {tx.token_symbol}
                    </div>
                    {tx.tx_hash && (
                      <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--fg-mute)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 220 }}>
                        {tx.tx_hash.slice(0, 14)}…
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--fg-mute)', whiteSpace: 'nowrap' }}>
                    {tx.confirmed_at ? fmtDate(tx.confirmed_at) : '—'}
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 600, fontFamily: 'var(--font-mono)', color: tx.type === 'RECEIVE' ? 'var(--up-fg)' : 'var(--fg)', textAlign: 'right', whiteSpace: 'nowrap', minWidth: 110 }}>
                    {tx.type === 'RECEIVE' ? '+' : ''}{fmtBRL(rowTotal)}
                  </div>
                </div>
              );
            })}

            {/* Pagination */}
            {total > PAGE_SIZE && (
              <div style={{ padding: '12px 20px', borderTop: '1px solid var(--border-soft)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 12, color: 'var(--fg-mute)' }}>
                  {offset + 1}–{Math.min(offset + PAGE_SIZE, total)} de {total}
                </span>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    onClick={() => setOffset(Math.max(0, offset - PAGE_SIZE))}
                    disabled={offset === 0}
                    style={{ padding: '5px 12px', borderRadius: 6, border: '1px solid var(--border-soft)', background: 'var(--surface-2)', color: offset === 0 ? 'var(--fg-mute)' : 'var(--fg)', cursor: offset === 0 ? 'default' : 'pointer', fontSize: 12 }}
                  >
                    Anterior
                  </button>
                  <button
                    onClick={() => setOffset(offset + PAGE_SIZE)}
                    disabled={offset + PAGE_SIZE >= total}
                    style={{ padding: '5px 12px', borderRadius: 6, border: '1px solid var(--border-soft)', background: 'var(--surface-2)', color: offset + PAGE_SIZE >= total ? 'var(--fg-mute)' : 'var(--fg)', cursor: offset + PAGE_SIZE >= total ? 'default' : 'pointer', fontSize: 12 }}
                  >
                    Próxima
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
