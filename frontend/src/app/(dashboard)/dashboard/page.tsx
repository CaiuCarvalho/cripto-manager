'use client';

import { useState, useEffect, useRef } from 'react';
import { BigChart } from '@/components/ui/big-chart';
import { CoinMark } from '@/components/ui/coin-mark';
import { Pill } from '@/components/ui/pill';
import { AllocationDonut } from '@/components/ui/allocation-donut';
import { RangeTabs } from '@/components/ui/range-tabs';
import { fmtBRL, fmtPct, fmtAmount, fmtDate, fmtAbrev } from '@/lib/formatters';
import type { Range } from '@/lib/mock-data';
import api from '@/lib/api';

const COIN_COLORS: Record<string, string> = {
  BTC: '#f7931a', ETH: '#627eea', SOL: '#9945ff',
  BNB: '#f3ba2f', MATIC: '#8247e5', AVAX: '#e84142',
  ARB: '#28a0f0', OP: '#ff0420', USDT: '#26a17b',
  USDC: '#2775ca', LINK: '#2a5ada', DOT: '#e6007a',
};

function getCoinColor(symbol: string): string {
  return COIN_COLORS[symbol.toUpperCase()] ?? '#888';
}

const RANGE_DAYS: Record<Range, number> = {
  '1D': 1, '1S': 7, '1M': 30, '3M': 90, '1A': 365, 'Tudo': 1000,
};

const TX_TYPE_LABELS: Record<string, string> = {
  RECEIVE: 'Entrada', SEND: 'Saída', CONTRACT: 'Contrato', SWAP: 'Swap', STAKE: 'Stake',
};

interface Asset {
  symbol: string;
  amount: number;
  priceUsd: number;
  valueUsd: number;
  valueBrl: number;
  change24h: number | null;
}

interface Summary {
  totalUsd: number;
  totalBrl: number;
  assets: Asset[];
}

interface HistoryPoint {
  date: string;
  valueUsd: number;
}

interface Transaction {
  id: string;
  type: string;
  token_symbol: string;
  amount: number;
  value_usd: number | null;
  confirmed_at: string | null;
}

function Card({ children, style = {} }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border-soft)', borderRadius: 12, ...style }}>
      {children}
    </div>
  );
}

function Skeleton({ height, style = {} }: { height: number; style?: React.CSSProperties }) {
  return (
    <div style={{ height, borderRadius: 6, background: 'var(--surface-2)', animation: 'agon-pulse 1.5s ease-in-out infinite', ...style }} />
  );
}

export default function DashboardPage() {
  const [range, setRange] = useState<Range>('1M');
  const [summary, setSummary] = useState<Summary | null>(null);
  const [chartData, setChartData] = useState<number[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [chartLoading, setChartLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dataReadyRef = useRef(false);

  // Initial load: summary + transactions + default chart (1M)
  useEffect(() => {
    Promise.all([
      api.get<Summary>('/portfolio/summary'),
      api.get<{ transactions: Transaction[] }>('/transactions', { params: { limit: 5 } }),
      api.get<HistoryPoint[]>('/portfolio/history', { params: { days: 30 } }),
    ])
      .then(([summaryRes, txRes, historyRes]) => {
        const s = summaryRes.data;
        const rate = s.totalUsd > 0 ? s.totalBrl / s.totalUsd : 5.10;
        setSummary(s);
        setTransactions(txRes.data.transactions ?? []);
        setChartData(historyRes.data.map(h => h.valueUsd * rate));
        dataReadyRef.current = true;
      })
      .catch(err => setError(err.response?.data?.message ?? err.message))
      .finally(() => setLoading(false));
  }, []);

  // Re-fetch chart when range changes (skip initial run)
  useEffect(() => {
    if (!dataReadyRef.current) return;
    setChartLoading(true);
    const rate = summary ? (summary.totalBrl / summary.totalUsd || 5.10) : 5.10;
    api.get<HistoryPoint[]>('/portfolio/history', { params: { days: RANGE_DAYS[range] } })
      .then(res => setChartData(res.data.map(h => h.valueUsd * rate)))
      .catch(() => {})
      .finally(() => setChartLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [range]);

  if (loading) {
    return (
      <div style={{ padding: '24px 32px 64px', display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 14 }}>
          {[0, 1, 2].map(i => <Card key={i} style={{ padding: 22 }}><Skeleton height={i === 0 ? 80 : 60} /></Card>)}
        </div>
        <Card style={{ padding: 22 }}><Skeleton height={300} /></Card>
        <div style={{ display: 'grid', gridTemplateColumns: '1.7fr 1fr', gap: 14 }}>
          <Card style={{ padding: 22 }}><Skeleton height={200} /></Card>
          <Card style={{ padding: 22 }}><Skeleton height={200} /></Card>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '24px 32px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, marginTop: 64 }}>
        <div style={{ fontSize: 15, color: 'var(--down-fg)' }}>Erro ao carregar dados</div>
        <div style={{ fontSize: 13, color: 'var(--fg-mute)' }}>{error}</div>
        <button
          onClick={() => { setError(null); setLoading(true); dataReadyRef.current = false; }}
          style={{ padding: '8px 20px', borderRadius: 8, background: 'var(--accent)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 13 }}
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  const assets = summary?.assets ?? [];
  const totalBrl = summary?.totalBrl ?? 0;
  const totalUsd = summary?.totalUsd ?? 0;
  const usdBrl = totalUsd > 0 ? totalBrl / totalUsd : 5.10;

  // Weighted average 24h change across portfolio
  const totalChange24h = assets.length > 0 && totalUsd > 0
    ? assets.reduce((s, a) => s + (a.change24h ?? 0) * (a.valueUsd / totalUsd), 0)
    : 0;

  const seriesDelta = chartData.length >= 2
    ? ((chartData[chartData.length - 1] - chartData[0]) / (chartData[0] || 1)) * 100
    : 0;
  const seriesDeltaAbs = chartData.length >= 2 ? chartData[chartData.length - 1] - chartData[0] : 0;

  const donutSlices = assets.map(a => ({ color: getCoinColor(a.symbol), value: a.valueBrl, symbol: a.symbol }));

  return (
    <div style={{ padding: '24px 32px 64px', display: 'flex', flexDirection: 'column', gap: 18 }}>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 14 }}>
        <Card style={{ padding: 22 }}>
          <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--fg-mute)', marginBottom: 10 }}>
            Patrimônio total
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <span style={{ fontSize: 38, fontWeight: 600, fontFamily: 'var(--font-mono)', letterSpacing: '-0.02em', color: 'var(--fg)', lineHeight: 1 }}>
              {fmtBRL(totalBrl)}
            </span>
            <Pill value={totalChange24h} />
          </div>
          <div style={{ fontSize: 13, fontFamily: 'var(--font-mono)', color: 'var(--fg-mute)' }}>
            {assets.length} {assets.length === 1 ? 'ativo' : 'ativos'}
          </div>
        </Card>

        <Card style={{ padding: 22 }}>
          <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--fg-mute)', marginBottom: 10 }}>
            Variação 24h
          </div>
          <div style={{ fontSize: 22, fontWeight: 600, fontFamily: 'var(--font-mono)', color: totalChange24h >= 0 ? 'var(--up-fg)' : 'var(--down-fg)', marginBottom: 6 }}>
            {totalChange24h >= 0 ? '+' : ''}{fmtPct(totalChange24h)}
          </div>
          <Pill value={totalChange24h} size="sm" />
        </Card>

        <Card style={{ padding: 22 }}>
          <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--fg-mute)', marginBottom: 10 }}>
            Total USD
          </div>
          <div style={{ fontSize: 22, fontWeight: 600, fontFamily: 'var(--font-mono)', color: 'var(--fg)', marginBottom: 6 }}>
            ${totalUsd.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
          </div>
          <div style={{ fontSize: 11, color: 'var(--fg-mute)' }}>
            {transactions.length > 0 ? `${transactions.length} recentes` : 'Sem transações'}
          </div>
        </Card>
      </div>

      {/* Chart */}
      <Card style={{ padding: 0 }}>
        <div style={{ padding: '18px 22px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--fg)' }}>Performance do portfólio</div>
            <div style={{ fontSize: 11, color: 'var(--fg-mute)', marginTop: 2 }}>
              {chartData.length > 1
                ? `${fmtPct(seriesDelta)} · ${seriesDeltaAbs >= 0 ? '+' : ''}${fmtBRL(seriesDeltaAbs)} no período`
                : 'Sem dados suficientes para o período'
              }
            </div>
          </div>
          <RangeTabs value={range} onChange={setRange} />
        </div>
        <div style={{ paddingBottom: 8, opacity: chartLoading ? 0.4 : 1, transition: 'opacity 0.2s' }}>
          <BigChart data={chartData.length > 0 ? chartData : [totalBrl, totalBrl]} height={260} />
        </div>
      </Card>

      {/* Holdings + Donut */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.7fr 1fr', gap: 14 }}>
        <Card style={{ padding: 0 }}>
          <div style={{ padding: '18px 22px 12px', borderBottom: '1px solid var(--border-soft)' }}>
            <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--fg)' }}>
              Meus ativos{' '}
              <span style={{ color: 'var(--fg-mute)', fontWeight: 400 }}>({assets.length})</span>
            </span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 120px 120px 90px', padding: '0 22px 8px', borderBottom: '1px solid var(--border-soft)' }}>
            {['Ativo', 'Saldo', 'Preço', '24h'].map(h => (
              <div key={h} style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--fg-mute)' }}>{h}</div>
            ))}
          </div>
          {assets.length === 0 ? (
            <div style={{ padding: '32px', textAlign: 'center', color: 'var(--fg-mute)', fontSize: 13 }}>
              Nenhum ativo. Adicione carteiras e sincronize para ver seus ativos.
            </div>
          ) : assets.map(a => (
            <div
              key={a.symbol}
              style={{ display: 'grid', gridTemplateColumns: '1fr 120px 120px 90px', padding: '0 22px', height: 52, alignItems: 'center', borderTop: '1px solid var(--border-soft)' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <CoinMark symbol={a.symbol} color={getCoinColor(a.symbol)} size={26} />
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--fg)' }}>{a.symbol}</div>
                  <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--fg-mute)' }}>
                    {fmtAmount(a.amount)} {a.symbol}
                  </div>
                </div>
              </div>
              <div style={{ fontSize: 13, fontFamily: 'var(--font-mono)', color: 'var(--fg)' }}>
                {fmtBRL(a.valueBrl)}
              </div>
              <div style={{ fontSize: 13, fontFamily: 'var(--font-mono)', color: 'var(--fg)' }}>
                {fmtBRL(a.priceUsd * usdBrl)}
              </div>
              <div>
                <Pill value={a.change24h ?? 0} size="sm" />
              </div>
            </div>
          ))}
        </Card>

        <Card style={{ padding: 22 }}>
          <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--fg)', marginBottom: 18 }}>Alocação</div>
          {assets.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--fg-mute)', fontSize: 13, paddingTop: 40 }}>Sem ativos</div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
              <AllocationDonut slices={donutSlices} size={140} totalLabel={fmtAbrev(totalBrl)} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
                {assets.map(a => {
                  const pct = totalBrl > 0 ? (a.valueBrl / totalBrl) * 100 : 0;
                  return (
                    <div key={a.symbol} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 8, height: 8, borderRadius: 2, background: getCoinColor(a.symbol), flexShrink: 0 }} />
                      <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--fg)' }}>{a.symbol}</span>
                      <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--fg-mute)', marginLeft: 'auto' }}>
                        {pct.toFixed(1)}%
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Recent transactions + Market */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.7fr 1fr', gap: 14 }}>
        <Card style={{ padding: 0 }}>
          <div style={{ padding: '18px 22px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-soft)' }}>
            <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--fg)' }}>Transações recentes</span>
          </div>
          {transactions.length === 0 ? (
            <div style={{ padding: '32px', textAlign: 'center', color: 'var(--fg-mute)', fontSize: 13 }}>
              Nenhuma transação ainda.
            </div>
          ) : transactions.map(tx => {
            const isSend = tx.type === 'SEND';
            const total = (tx.value_usd ?? 0) * usdBrl;
            return (
              <div key={tx.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 22px', borderTop: '1px solid var(--border-soft)' }}>
                <div style={{ width: 28, height: 28, borderRadius: 7, flexShrink: 0, background: isSend ? 'var(--down-bg)' : 'var(--up-bg)', color: isSend ? 'var(--down-fg)' : 'var(--up-fg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    {isSend
                      ? (<><path d="M12 5v14" /><path d="M19 12l-7 7-7-7" /></>)
                      : (<><path d="M12 19V5" /><path d="M5 12l7-7 7 7" /></>)}
                  </svg>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--fg)' }}>
                    {TX_TYPE_LABELS[tx.type] ?? tx.type} · {tx.token_symbol}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--fg-mute)' }}>
                    {tx.confirmed_at ? fmtDate(tx.confirmed_at) : '—'}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 13, fontFamily: 'var(--font-mono)', color: 'var(--fg)', fontWeight: 500 }}>
                    {fmtBRL(total)}
                  </div>
                  <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--fg-mute)' }}>
                    {fmtAmount(tx.amount)} {tx.token_symbol}
                  </div>
                </div>
              </div>
            );
          })}
        </Card>

        <Card style={{ padding: 0 }}>
          <div style={{ padding: '18px 22px 12px', borderBottom: '1px solid var(--border-soft)' }}>
            <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--fg)' }}>Mercado em destaque</span>
          </div>
          {assets.length === 0 ? (
            <div style={{ padding: '32px', textAlign: 'center', color: 'var(--fg-mute)', fontSize: 13 }}>
              Sem dados de mercado.
            </div>
          ) : assets.slice(0, 5).map(a => (
            <div key={a.symbol} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 22px', borderTop: '1px solid var(--border-soft)' }}>
              <CoinMark symbol={a.symbol} color={getCoinColor(a.symbol)} size={26} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12.5, fontWeight: 500, color: 'var(--fg)' }}>{a.symbol}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 13, fontFamily: 'var(--font-mono)', color: 'var(--fg)' }}>
                  {fmtBRL(a.priceUsd * usdBrl)}
                </div>
                <Pill value={a.change24h ?? 0} size="sm" />
              </div>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}
