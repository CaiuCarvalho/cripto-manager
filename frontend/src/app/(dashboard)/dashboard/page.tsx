'use client';

import { useState } from 'react';
import { BigChart } from '@/components/ui/big-chart';
import { CoinMark } from '@/components/ui/coin-mark';
import { Pill } from '@/components/ui/pill';
import { Sparkline } from '@/components/ui/sparkline';
import { AllocationDonut } from '@/components/ui/allocation-donut';
import { RangeTabs } from '@/components/ui/range-tabs';
import {
  COINS,
  HOLDINGS,
  TRANSACTIONS,
  PORTFOLIO_SERIES,
  SERIES,
  USD_BRL,
  type Range,
} from '@/lib/mock-data';
import { fmtBRL, fmtPct, fmtAmount, fmtDate, fmtAbrev } from '@/lib/formatters';

const coinMap = Object.fromEntries(COINS.map(c => [c.id, c]));

function buildPortfolioStats() {
  let totalValue = 0;
  let totalCost = 0;

  const enriched = HOLDINGS.map(h => {
    const coin = coinMap[h.coin];
    const currentValue = coin.price * h.amount * USD_BRL;
    const cost = h.costBasis * h.amount * USD_BRL;
    totalValue += currentValue;
    totalCost += cost;
    return { ...h, coin, currentValue, cost };
  });

  const totalPnL = totalValue - totalCost;
  const totalPnLPct = (totalPnL / totalCost) * 100;

  return { enriched, totalValue, totalCost, totalPnL, totalPnLPct };
}

const { enriched, totalValue, totalCost, totalPnL, totalPnLPct } = buildPortfolioStats();

function Card({ children, style = {} }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border-soft)',
        borderRadius: 12,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export default function DashboardPage() {
  const [range, setRange] = useState<Range>('1M');

  const series = PORTFOLIO_SERIES[range];
  const seriesDelta =
    series.length >= 2
      ? ((series[series.length - 1] - series[0]) / series[0]) * 100
      : 0;
  const seriesDeltaAbs =
    series.length >= 2 ? (series[series.length - 1] - series[0]) * USD_BRL : 0;

  const donutSlices = enriched.map(e => ({
    color: e.coin.color,
    value: e.currentValue,
    symbol: e.coin.symbol,
  }));

  return (
    <div style={{ padding: '24px 32px 64px', display: 'flex', flexDirection: 'column', gap: 18 }}>

      {/* Linha 1 — KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 14 }}>
        {/* Patrimônio total */}
        <Card style={{ padding: 22 }}>
          <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--fg-mute)', marginBottom: 10 }}>
            Patrimônio total
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <span style={{ fontSize: 38, fontWeight: 600, fontFamily: 'var(--font-mono)', letterSpacing: '-0.02em', color: 'var(--fg)', lineHeight: 1 }}>
              {fmtBRL(totalValue)}
            </span>
            <Pill value={totalPnLPct} />
          </div>
          <div style={{ fontSize: 13, fontFamily: 'var(--font-mono)', color: 'var(--fg-mute)' }}>
            {totalPnL >= 0 ? '+' : ''}{fmtBRL(totalPnL)} · todos os ativos
          </div>
        </Card>

        {/* P&L */}
        <Card style={{ padding: 22 }}>
          <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--fg-mute)', marginBottom: 10 }}>
            P&amp;L total
          </div>
          <div
            style={{
              fontSize: 22,
              fontWeight: 600,
              fontFamily: 'var(--font-mono)',
              color: totalPnL >= 0 ? 'var(--up-fg)' : 'var(--down-fg)',
              marginBottom: 6,
            }}
          >
            {totalPnL >= 0 ? '+' : ''}{fmtBRL(totalPnL)}
          </div>
          <Pill value={totalPnLPct} size="sm" />
        </Card>

        {/* Custo total */}
        <Card style={{ padding: 22 }}>
          <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--fg-mute)', marginBottom: 10 }}>
            Custo total
          </div>
          <div style={{ fontSize: 22, fontWeight: 600, fontFamily: 'var(--font-mono)', color: 'var(--fg)', marginBottom: 6 }}>
            {fmtBRL(totalCost)}
          </div>
          <div style={{ fontSize: 11, color: 'var(--fg-mute)' }}>
            {enriched.length} ativos · {TRANSACTIONS.length} transações
          </div>
        </Card>
      </div>

      {/* Linha 2 — Gráfico de performance */}
      <Card style={{ padding: 0 }}>
        <div style={{ padding: '18px 22px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--fg)' }}>Performance do portfólio</div>
            <div style={{ fontSize: 11, color: 'var(--fg-mute)', marginTop: 2 }}>
              {fmtPct(seriesDelta)} · {seriesDeltaAbs >= 0 ? '+' : ''}{fmtBRL(seriesDeltaAbs)} no período
            </div>
          </div>
          <RangeTabs value={range} onChange={setRange} />
        </div>
        <div style={{ paddingBottom: 8 }}>
          <BigChart data={series} height={260} />
        </div>
      </Card>

      {/* Linha 3 — Holdings + Donut */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.7fr 1fr', gap: 14 }}>
        {/* Holdings table */}
        <Card style={{ padding: 0 }}>
          <div style={{ padding: '18px 22px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--fg)' }}>
              Meus ativos{' '}
              <span style={{ color: 'var(--fg-mute)', fontWeight: 400 }}>({enriched.length})</span>
            </span>
          </div>
          {/* Header row */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 100px 100px 90px 84px',
              padding: '0 22px 8px',
              borderBottom: '1px solid var(--border-soft)',
            }}
          >
            {['Ativo', 'Saldo', 'Preço', 'P&L', '7d'].map(h => (
              <div key={h} style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--fg-mute)' }}>
                {h}
              </div>
            ))}
          </div>
          {enriched.map(e => {
            const pnl = e.currentValue - e.cost;
            const pnlPct = (pnl / e.cost) * 100;
            const s7d = SERIES[e.coin.id]['1S'];
            return (
              <div
                key={e.coin.id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 100px 100px 90px 84px',
                  padding: '0 22px',
                  height: 52,
                  alignItems: 'center',
                  borderTop: '1px solid var(--border-soft)',
                  cursor: 'pointer',
                  transition: 'background 0.1s',
                }}
                onMouseEnter={ev => (ev.currentTarget.style.background = 'var(--surface-2)')}
                onMouseLeave={ev => (ev.currentTarget.style.background = 'transparent')}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <CoinMark symbol={e.coin.symbol} color={e.coin.color} size={26} />
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--fg)' }}>{e.coin.name}</div>
                    <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--fg-mute)' }}>{e.coin.symbol}</div>
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 13, fontFamily: 'var(--font-mono)', color: 'var(--fg)' }}>{fmtBRL(e.currentValue)}</div>
                  <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--fg-mute)' }}>
                    {fmtAmount(e.amount)} {e.coin.symbol}
                  </div>
                </div>
                <div style={{ fontSize: 13, fontFamily: 'var(--font-mono)', color: 'var(--fg)' }}>
                  {fmtBRL(e.coin.price * USD_BRL)}
                </div>
                <div>
                  <div
                    style={{
                      fontSize: 13,
                      fontFamily: 'var(--font-mono)',
                      color: pnl >= 0 ? 'var(--up-fg)' : 'var(--down-fg)',
                    }}
                  >
                    {pnl >= 0 ? '+' : ''}{fmtBRL(pnl)}
                  </div>
                  <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--fg-mute)' }}>
                    {fmtPct(pnlPct)}
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Sparkline data={s7d} width={84} height={26} />
                </div>
              </div>
            );
          })}
        </Card>

        {/* Allocation Donut */}
        <Card style={{ padding: 22 }}>
          <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--fg)', marginBottom: 18 }}>Alocação</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
            <AllocationDonut slices={donutSlices} size={140} totalLabel={fmtAbrev(totalValue)} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
              {enriched.map(e => {
                const pct = (e.currentValue / totalValue) * 100;
                return (
                  <div key={e.coin.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 8, height: 8, borderRadius: 2, background: e.coin.color, flexShrink: 0 }} />
                    <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--fg)' }}>{e.coin.symbol}</span>
                    <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--fg-mute)', marginLeft: 'auto' }}>
                      {pct.toFixed(1)}%
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </Card>
      </div>

      {/* Linha 4 — Transações recentes + Mercado */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.7fr 1fr', gap: 14 }}>
        {/* Transações recentes */}
        <Card style={{ padding: 0 }}>
          <div
            style={{
              padding: '18px 22px 12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: '1px solid var(--border-soft)',
            }}
          >
            <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--fg)' }}>Transações recentes</span>
            <button
              style={{
                border: '1px solid var(--border-soft)',
                background: 'transparent',
                borderRadius: 6,
                padding: '5px 10px',
                fontSize: 12,
                color: 'var(--fg-soft)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 5,
              }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M12 5v14M5 12h14" />
              </svg>
              Adicionar
            </button>
          </div>
          {TRANSACTIONS.map(tx => {
            const coin = coinMap[tx.coin];
            const buy = tx.type === 'buy';
            const total = tx.amount * tx.price * USD_BRL;
            return (
              <div
                key={tx.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '12px 22px',
                  borderTop: '1px solid var(--border-soft)',
                  transition: 'background 0.1s',
                }}
                onMouseEnter={ev => (ev.currentTarget.style.background = 'var(--surface-2)')}
                onMouseLeave={ev => (ev.currentTarget.style.background = 'transparent')}
              >
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 7,
                    background: buy ? 'var(--up-bg)' : 'var(--down-bg)',
                    color: buy ? 'var(--up-fg)' : 'var(--down-fg)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    {buy ? (
                      <><path d="M12 19V5" /><path d="M5 12l7-7 7 7" /></>
                    ) : (
                      <><path d="M12 5v14" /><path d="M19 12l-7 7-7-7" /></>
                    )}
                  </svg>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--fg)' }}>
                    {buy ? 'Compra' : 'Venda'} · {coin?.symbol}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--fg-mute)' }}>
                    {tx.venue} · {fmtDate(tx.date)}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 13, fontFamily: 'var(--font-mono)', color: 'var(--fg)', fontWeight: 500 }}>
                    {fmtBRL(total)}
                  </div>
                  <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--fg-mute)' }}>
                    {fmtAmount(tx.amount)} @ {fmtBRL(tx.price * USD_BRL)}
                  </div>
                </div>
              </div>
            );
          })}
        </Card>

        {/* Mercado em destaque */}
        <Card style={{ padding: 0 }}>
          <div style={{ padding: '18px 22px 12px', borderBottom: '1px solid var(--border-soft)' }}>
            <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--fg)' }}>Mercado em destaque</span>
          </div>
          {COINS.slice(0, 5).map(coin => (
            <div
              key={coin.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '10px 22px',
                borderTop: '1px solid var(--border-soft)',
                cursor: 'pointer',
                transition: 'background 0.1s',
              }}
              onMouseEnter={ev => (ev.currentTarget.style.background = 'var(--surface-2)')}
              onMouseLeave={ev => (ev.currentTarget.style.background = 'transparent')}
            >
              <CoinMark symbol={coin.symbol} color={coin.color} size={26} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12.5, fontWeight: 500, color: 'var(--fg)' }}>{coin.symbol}</div>
                <div style={{ fontSize: 10.5, color: 'var(--fg-mute)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {coin.name}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 13, fontFamily: 'var(--font-mono)', color: 'var(--fg)' }}>
                  {fmtBRL(coin.price * USD_BRL)}
                </div>
                <Pill value={coin.change24h} size="sm" />
              </div>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}
