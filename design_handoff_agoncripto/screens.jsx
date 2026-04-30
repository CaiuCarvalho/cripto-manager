// screens.jsx — telas do AgonCripto

// === Sidebar ================================================================
function Sidebar({ current, onNav, onAddTx, hideValues, onTogglePrivacy }) {
  const items = [
    { id: 'dashboard',    label: 'Dashboard' },
    { id: 'holdings',     label: 'Meus ativos' },
    { id: 'transactions', label: 'Transações' },
    { id: 'market',       label: 'Mercado' },
    { id: 'alerts',       label: 'Alertas' },
  ];
  const navIcon = (id) => {
    const props = { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none',
      stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round', strokeLinejoin: 'round' };
    if (id === 'dashboard')    return <svg {...props}><rect x="3" y="3" width="7" height="9"/><rect x="14" y="3" width="7" height="5"/><rect x="14" y="12" width="7" height="9"/><rect x="3" y="16" width="7" height="5"/></svg>;
    if (id === 'holdings')     return <svg {...props}><circle cx="9" cy="9" r="6"/><circle cx="15" cy="15" r="6"/></svg>;
    if (id === 'transactions') return <svg {...props}><path d="M4 8h13l-3-3"/><path d="M20 16H7l3 3"/></svg>;
    if (id === 'market')       return <svg {...props}><path d="M3 17l5-5 4 4 8-9"/><path d="M14 7h6v6"/></svg>;
    if (id === 'alerts')       return <svg {...props}><path d="M6 8a6 6 0 0 1 12 0c0 7 3 7 3 9H3c0-2 3-2 3-9"/><path d="M10 21h4"/></svg>;
    return null;
  };

  return (
    <aside style={{
      width: 232, flexShrink: 0, height: '100%',
      borderRight: '1px solid var(--border-soft)',
      background: 'var(--surface)',
      display: 'flex', flexDirection: 'column', padding: '20px 14px',
    }}>
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '4px 6px 24px' }}>
        <svg width="22" height="22" viewBox="0 0 22 22">
          <circle cx="8"  cy="11" r="6.5" fill="none" stroke="var(--accent)" strokeWidth="1.6" />
          <circle cx="14" cy="11" r="6.5" fill="none" stroke="var(--fg)"     strokeWidth="1.6" />
        </svg>
        <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.05 }}>
          <span style={{ fontWeight: 600, fontSize: 15, letterSpacing: '-0.01em' }}>AgonCripto</span>
          <span style={{ fontSize: 10, color: 'var(--fg-mute)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>portfolio</span>
        </div>
      </div>

      <button onClick={onAddTx} style={{
        margin: '0 0 18px', height: 34, borderRadius: 8,
        background: 'var(--fg)', color: 'var(--bg)', border: 0,
        fontWeight: 500, fontSize: 13, cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
      }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
        Nova transação
      </button>

      <div style={{ fontSize: 10, color: 'var(--fg-mute)', letterSpacing: '0.08em',
        textTransform: 'uppercase', padding: '4px 8px 8px' }}>Menu</div>
      <nav style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {items.map(it => {
          const active = current === it.id;
          return (
            <button key={it.id} onClick={() => onNav(it.id)} style={{
              display: 'flex', alignItems: 'center', gap: 11,
              padding: '8px 10px', height: 34, borderRadius: 7,
              border: 0, cursor: 'pointer',
              background: active ? 'var(--surface-2)' : 'transparent',
              color: active ? 'var(--fg)' : 'var(--fg-soft)',
              fontSize: 13, fontWeight: active ? 500 : 400, textAlign: 'left',
            }}>
              <span style={{ color: active ? 'var(--accent)' : 'var(--fg-mute)' }}>{navIcon(it.id)}</span>
              {it.label}
            </button>
          );
        })}
      </nav>

      <div style={{ flex: 1 }} />

      {/* Privacy toggle */}
      <button onClick={onTogglePrivacy} style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '10px', borderRadius: 8, border: '1px solid var(--border-soft)',
        background: 'transparent', cursor: 'pointer', marginBottom: 10,
      }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--fg-mute)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          {hideValues
            ? <><path d="M3 3l18 18"/><path d="M10.6 6.1a10 10 0 0 1 10.4 5.9 12 12 0 0 1-2.7 3.5"/><path d="M6.6 6.6A12 12 0 0 0 3 12s4 7 9 7a9 9 0 0 0 4-1"/></>
            : <><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></>}
        </svg>
        <span style={{ fontSize: 12, color: 'var(--fg-soft)', flex: 1, textAlign: 'left' }}>
          {hideValues ? 'Mostrar saldo' : 'Esconder saldo'}
        </span>
      </button>

      {/* User chip */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10,
        padding: '8px 8px', borderTop: '1px solid var(--border-soft)', paddingTop: 14 }}>
        <div style={{ width: 28, height: 28, borderRadius: 8, background: 'var(--accent-soft)',
          color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: 600, fontSize: 11, fontFamily: 'var(--font-mono)' }}>CC</div>
        <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.15, flex: 1, minWidth: 0 }}>
          <span style={{ fontSize: 12, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Caiu Carvalho</span>
          <span style={{ fontSize: 10, color: 'var(--fg-mute)' }}>Plano pessoal</span>
        </div>
      </div>
    </aside>
  );
}

// === Top Bar (header da área de conteúdo) ===================================
function TopBar({ title, subtitle }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
      padding: '24px 32px 18px', borderBottom: '1px solid var(--border-soft)',
    }}>
      <div>
        <div style={{ fontSize: 11, color: 'var(--fg-mute)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 4 }}>
          {subtitle}
        </div>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 600, letterSpacing: '-0.02em' }}>{title}</h1>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '7px 11px', borderRadius: 8,
          border: '1px solid var(--border-soft)', background: 'var(--surface)',
          fontSize: 12, color: 'var(--fg-soft)', minWidth: 220,
        }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>
          Buscar ativo, transação…
          <span style={{ marginLeft: 'auto', fontFamily: 'var(--font-mono)', fontSize: 10,
            color: 'var(--fg-mute)', border: '1px solid var(--border-soft)', borderRadius: 4, padding: '1px 5px' }}>⌘K</span>
        </div>
        <button style={{
          width: 34, height: 34, borderRadius: 8,
          border: '1px solid var(--border-soft)', background: 'var(--surface)',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
          color: 'var(--fg-soft)',
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 7 3 9H3c0-2 3-2 3-9"/><path d="M10 21h4"/></svg>
        </button>
      </div>
    </div>
  );
}

// === Card primitive =========================================================
function Card({ children, style, padding = 20 }) {
  return (
    <div style={{
      background: 'var(--surface)', border: '1px solid var(--border-soft)',
      borderRadius: 12, padding, ...style,
    }}>{children}</div>
  );
}

// === Range tabs (1D, 1S, 1M…) ==============================================
function RangeTabs({ value, onChange }) {
  const ranges = ['1D', '1S', '1M', '3M', '1A', 'Tudo'];
  return (
    <div style={{ display: 'inline-flex', gap: 2, padding: 3,
      background: 'var(--surface-2)', borderRadius: 7 }}>
      {ranges.map(r => (
        <button key={r} onClick={() => onChange(r)} style={{
          padding: '5px 11px', borderRadius: 5, border: 0,
          background: value === r ? 'var(--surface)' : 'transparent',
          color: value === r ? 'var(--fg)' : 'var(--fg-mute)',
          fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 500,
          cursor: 'pointer',
          boxShadow: value === r ? 'var(--shadow-xs)' : 'none',
        }}>{r}</button>
      ))}
    </div>
  );
}

// === Dashboard ==============================================================
function Dashboard({ hideValues, density, chartStyle, onSelectAsset, onAddTx }) {
  const [range, setRange] = React.useState('1M');
  const series = window.PORTFOLIO_SERIES[range];
  const total = series[series.length - 1];
  const start = series[0];
  const change = total - start;
  const changePct = (change / start) * 100;

  // Allocation
  const allocation = window.HOLDINGS.map(h => {
    const c = window.COINS.find(x => x.id === h.coin);
    return { coin: c, value: c.price * h.amount };
  }).sort((a, b) => b.value - a.value);

  const totalNow = allocation.reduce((a, s) => a + s.value, 0);

  // P&L total
  const totalCost = window.HOLDINGS.reduce((acc, h) => acc + h.costBasis * h.amount, 0);
  const totalPnL = totalNow - totalCost;
  const totalPnLPct = (totalPnL / totalCost) * 100;

  const rowH = density === 'compact' ? 44 : density === 'comfy' ? 60 : 52;

  return (
    <div style={{ padding: '24px 32px 64px', display: 'flex', flexDirection: 'column', gap: 18 }}>
      {/* KPI row */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 14 }}>
        <Card padding={22}>
          <div style={{ fontSize: 11, color: 'var(--fg-mute)', letterSpacing: '0.06em',
            textTransform: 'uppercase', marginBottom: 10 }}>Patrimônio total</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, flexWrap: 'wrap' }}>
            <div style={{
              fontFamily: 'var(--font-mono)', fontSize: 38, fontWeight: 600,
              letterSpacing: '-0.02em', lineHeight: 1,
            }}>{fmtBRL(totalNow, { hide: hideValues, decimals: 2 })}</div>
            <Pill value={changePct} />
            <span style={{
              fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--fg-mute)',
            }}>{change >= 0 ? '+' : ''}{fmtBRL(change, { hide: hideValues })} · {range}</span>
          </div>
        </Card>
        <Card padding={22}>
          <div style={{ fontSize: 11, color: 'var(--fg-mute)', letterSpacing: '0.06em',
            textTransform: 'uppercase', marginBottom: 10 }}>P&L realizado + não realizado</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 22, fontWeight: 600, letterSpacing: '-0.01em' }}>
            {totalPnL >= 0 ? '+' : ''}{fmtBRL(totalPnL, { hide: hideValues })}
          </div>
          <div style={{ marginTop: 6 }}><Pill value={totalPnLPct} size="sm" /></div>
        </Card>
        <Card padding={22}>
          <div style={{ fontSize: 11, color: 'var(--fg-mute)', letterSpacing: '0.06em',
            textTransform: 'uppercase', marginBottom: 10 }}>Custo médio total</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 22, fontWeight: 600, letterSpacing: '-0.01em' }}>
            {fmtBRL(totalCost, { hide: hideValues })}
          </div>
          <div style={{ marginTop: 6, fontSize: 11, color: 'var(--fg-mute)' }}>
            {window.HOLDINGS.length} ativos · {window.TRANSACTIONS.length} transações
          </div>
        </Card>
      </div>

      {/* Chart card */}
      <Card padding={22}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 500 }}>Performance do portfólio</div>
            <div style={{ fontSize: 11, color: 'var(--fg-mute)', marginTop: 2 }}>
              Soma ponderada das posições · cotação em BRL
            </div>
          </div>
          <RangeTabs value={range} onChange={setRange} />
        </div>
        <BigChart data={series} height={260} style={chartStyle}
                  accent={changePct >= 0 ? 'var(--up-fg)' : 'var(--down-fg)'} />
      </Card>

      {/* Holdings table + allocation donut */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.7fr 1fr', gap: 14 }}>
        <Card padding={0}>
          <div style={{ padding: '18px 22px 12px', display: 'flex',
            justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: 13, fontWeight: 500 }}>Meus ativos</div>
            <span style={{ fontSize: 11, color: 'var(--fg-mute)' }}>
              {allocation.length} posições
            </span>
          </div>
          <div style={{ display: 'grid',
            gridTemplateColumns: '28px 1.4fr 1fr 1fr 1fr 90px',
            padding: '0 22px 8px', fontSize: 10,
            color: 'var(--fg-mute)', letterSpacing: '0.06em', textTransform: 'uppercase',
            columnGap: 16, alignItems: 'center',
          }}>
            <span></span><span>Ativo</span><span style={{ textAlign: 'right' }}>Saldo</span>
            <span style={{ textAlign: 'right' }}>Preço</span>
            <span style={{ textAlign: 'right' }}>P&L</span>
            <span style={{ textAlign: 'right' }}>7d</span>
          </div>
          {allocation.map((a, i) => {
            const h = window.HOLDINGS.find(x => x.coin === a.coin.id);
            const pnl = (a.coin.price - h.costBasis) * h.amount;
            const pnlPct = ((a.coin.price - h.costBasis) / h.costBasis) * 100;
            return (
              <button key={a.coin.id} onClick={() => onSelectAsset(a.coin.id)}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '28px 1.4fr 1fr 1fr 1fr 90px',
                  width: '100%', alignItems: 'center', columnGap: 16,
                  padding: '0 22px', height: rowH,
                  border: 0, background: 'transparent', cursor: 'pointer',
                  borderTop: '1px solid var(--border-soft)',
                  textAlign: 'left',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-2)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <CoinMark coin={a.coin} size={26} />
                <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.2 }}>
                  <span style={{ fontSize: 13, fontWeight: 500 }}>{a.coin.name}</span>
                  <span style={{ fontSize: 11, color: 'var(--fg-mute)', fontFamily: 'var(--font-mono)' }}>{a.coin.symbol}</span>
                </div>
                <div style={{ textAlign: 'right', fontFamily: 'var(--font-mono)' }}>
                  <div style={{ fontSize: 13 }}>{fmtBRL(a.value, { hide: hideValues })}</div>
                  <div style={{ fontSize: 11, color: 'var(--fg-mute)' }}>
                    {hideValues ? '••••' : fmtAmount(h.amount, 4)} {a.coin.symbol}
                  </div>
                </div>
                <div style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: 13 }}>
                  {fmtBRL(a.coin.price, { decimals: a.coin.price < 10 ? 2 : 0 })}
                </div>
                <div style={{ textAlign: 'right', fontFamily: 'var(--font-mono)' }}>
                  <div style={{ fontSize: 13, color: pnl >= 0 ? 'var(--up-fg)' : 'var(--down-fg)' }}>
                    {pnl >= 0 ? '+' : ''}{fmtBRL(pnl, { hide: hideValues })}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--fg-mute)' }}>{fmtPct(pnlPct)}</div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Sparkline data={window.SERIES[a.coin.id]['1S']} width={84} height={26} />
                </div>
              </button>
            );
          })}
        </Card>

        <Card padding={22}>
          <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 14 }}>Alocação</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
            <div style={{ position: 'relative', width: 140, height: 140, flexShrink: 0 }}>
              <AllocationDonut size={140}
                slices={allocation.map(a => ({ value: a.value, color: a.coin.color }))} />
              <div style={{ position: 'absolute', inset: 0, display: 'flex',
                flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'var(--font-mono)' }}>
                <span style={{ fontSize: 10, color: 'var(--fg-mute)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Total</span>
                <span style={{ fontSize: 14, fontWeight: 600 }}>
                  {hideValues ? '•••' : (totalNow / 1000).toFixed(1) + 'k'}
                </span>
              </div>
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {allocation.map(a => {
                const pct = (a.value / totalNow) * 100;
                return (
                  <div key={a.coin.id} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
                    <span style={{ width: 8, height: 8, borderRadius: 2, background: a.coin.color, flexShrink: 0 }}/>
                    <span style={{ flex: 1 }}>{a.coin.symbol}</span>
                    <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--fg-mute)' }}>{pct.toFixed(1)}%</span>
                  </div>
                );
              })}
            </div>
          </div>
        </Card>
      </div>

      {/* Recent transactions + watchlist */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.7fr 1fr', gap: 14 }}>
        <Card padding={0}>
          <div style={{ padding: '18px 22px 14px', display: 'flex',
            justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: 13, fontWeight: 500 }}>Transações recentes</div>
            <button onClick={onAddTx} style={{
              border: '1px solid var(--border-soft)', background: 'transparent',
              padding: '5px 10px', borderRadius: 6, fontSize: 11,
              color: 'var(--fg-soft)', cursor: 'pointer',
            }}>+ Adicionar</button>
          </div>
          {window.TRANSACTIONS.slice(0, 6).map((tx, i) => {
            const c = window.COINS.find(x => x.id === tx.coin);
            const total = tx.amount * tx.price;
            return (
              <div key={tx.id} style={{
                display: 'grid', gridTemplateColumns: '32px 1.2fr 1fr 1fr 1fr',
                alignItems: 'center', columnGap: 14, padding: '0 22px',
                height: rowH, borderTop: '1px solid var(--border-soft)',
              }}>
                <div style={{
                  width: 28, height: 28, borderRadius: 7,
                  background: tx.type === 'buy' ? 'var(--up-bg)' : 'var(--down-bg)',
                  color: tx.type === 'buy' ? 'var(--up-fg)' : 'var(--down-fg)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    {tx.type === 'buy' ? <path d="M12 19V5M5 12l7-7 7 7"/> : <path d="M12 5v14M19 12l-7 7-7-7"/>}
                  </svg>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.2 }}>
                  <span style={{ fontSize: 13, fontWeight: 500 }}>
                    {tx.type === 'buy' ? 'Compra' : 'Venda'} de {c.symbol}
                  </span>
                  <span style={{ fontSize: 11, color: 'var(--fg-mute)' }}>
                    {tx.venue} · {fmtDate(tx.date)}
                  </span>
                </div>
                <div style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: 12 }}>
                  {fmtAmount(tx.amount, 4)} {c.symbol}
                </div>
                <div style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--fg-mute)' }}>
                  @ {fmtBRL(tx.price, { decimals: tx.price < 100 ? 2 : 0 })}
                </div>
                <div style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 500 }}>
                  {fmtBRL(total, { hide: hideValues })}
                </div>
              </div>
            );
          })}
        </Card>

        <Card padding={22}>
          <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 14 }}>Mercado em destaque</div>
          {window.COINS.slice(0, 5).map(c => (
            <button key={c.id} onClick={() => onSelectAsset(c.id)} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '10px 6px', borderTop: '1px solid var(--border-soft)',
              border: 0, borderTop: '1px solid var(--border-soft)',
              width: '100%', background: 'transparent', cursor: 'pointer', textAlign: 'left',
            }}>
              <CoinMark coin={c} size={26} />
              <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.2, flex: 1, minWidth: 0 }}>
                <span style={{ fontSize: 12.5, fontWeight: 500 }}>{c.symbol}</span>
                <span style={{ fontSize: 10.5, color: 'var(--fg-mute)' }}>{c.name}</span>
              </div>
              <div style={{ textAlign: 'right', fontFamily: 'var(--font-mono)' }}>
                <div style={{ fontSize: 12 }}>{fmtBRL(c.price, { decimals: c.price < 10 ? 2 : 0 })}</div>
                <div style={{ fontSize: 10, color: c.change24h >= 0 ? 'var(--up-fg)' : 'var(--down-fg)' }}>
                  {fmtPct(c.change24h)}
                </div>
              </div>
            </button>
          ))}
        </Card>
      </div>
    </div>
  );
}

// === Asset detail ===========================================================
function AssetDetail({ assetId, hideValues, chartStyle, onBack }) {
  const [range, setRange] = React.useState('1M');
  const c = window.COINS.find(x => x.id === assetId);
  const series = window.SERIES[c.id][range];
  const start = series[0], end = series[series.length - 1];
  const change = end - start;
  const changePct = (change / start) * 100;

  const holding = window.HOLDINGS.find(h => h.coin === c.id);
  const myAmount = holding ? holding.amount : 0;
  const myValue = myAmount * c.price;
  const myCost = holding ? holding.costBasis * holding.amount : 0;
  const myPnL = myValue - myCost;
  const myPnLPct = myCost > 0 ? (myPnL / myCost) * 100 : 0;

  const txOfCoin = window.TRANSACTIONS.filter(t => t.coin === c.id);

  return (
    <div style={{ padding: '24px 32px 64px', display: 'flex', flexDirection: 'column', gap: 18 }}>
      <button onClick={onBack} style={{
        alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: 6,
        padding: '4px 10px 4px 6px', border: 0, borderRadius: 6,
        background: 'transparent', color: 'var(--fg-mute)', fontSize: 12, cursor: 'pointer',
      }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
        Voltar
      </button>

      <Card padding={24}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <CoinMark coin={c} size={48} />
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
              <h2 style={{ margin: 0, fontSize: 22, fontWeight: 600, letterSpacing: '-0.02em' }}>{c.name}</h2>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--fg-mute)' }}>{c.symbol}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginTop: 6 }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 30, fontWeight: 600, letterSpacing: '-0.02em' }}>
                {fmtBRL(c.price, { decimals: c.price < 10 ? 4 : 2 })}
              </span>
              <Pill value={c.change24h} />
              <span style={{ fontSize: 11, color: 'var(--fg-mute)' }}>24h</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid var(--border-soft)',
              background: 'var(--surface)', cursor: 'pointer', fontSize: 13 }}>Vender</button>
            <button style={{ padding: '8px 16px', borderRadius: 8, border: 0,
              background: 'var(--fg)', color: 'var(--bg)', cursor: 'pointer', fontSize: 13, fontWeight: 500 }}>Comprar</button>
          </div>
        </div>
      </Card>

      <Card padding={22}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 500 }}>Histórico de preço</div>
            <div style={{ fontSize: 11, color: 'var(--fg-mute)', marginTop: 2 }}>
              {change >= 0 ? '+' : ''}{fmtBRL(change, { decimals: c.price < 10 ? 4 : 2 })} no período
            </div>
          </div>
          <RangeTabs value={range} onChange={setRange} />
        </div>
        <BigChart data={series} height={300} style={chartStyle}
                  accent={changePct >= 0 ? 'var(--up-fg)' : 'var(--down-fg)'} />
      </Card>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <Card padding={22}>
          <div style={{ fontSize: 11, color: 'var(--fg-mute)', letterSpacing: '0.06em',
            textTransform: 'uppercase', marginBottom: 14 }}>Sua posição</div>
          {myAmount > 0 ? (
            <>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 10 }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 26, fontWeight: 600, letterSpacing: '-0.01em' }}>
                  {fmtBRL(myValue, { hide: hideValues })}
                </span>
                <Pill value={myPnLPct} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, fontFamily: 'var(--font-mono)', fontSize: 12 }}>
                <div>
                  <div style={{ color: 'var(--fg-mute)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Saldo</div>
                  <div style={{ marginTop: 4 }}>{hideValues ? '••••' : fmtAmount(myAmount, 4)} {c.symbol}</div>
                </div>
                <div>
                  <div style={{ color: 'var(--fg-mute)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Preço médio</div>
                  <div style={{ marginTop: 4 }}>{fmtBRL(holding.costBasis)}</div>
                </div>
                <div>
                  <div style={{ color: 'var(--fg-mute)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Custo total</div>
                  <div style={{ marginTop: 4 }}>{fmtBRL(myCost, { hide: hideValues })}</div>
                </div>
                <div>
                  <div style={{ color: 'var(--fg-mute)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.06em' }}>P&L não realizado</div>
                  <div style={{ marginTop: 4, color: myPnL >= 0 ? 'var(--up-fg)' : 'var(--down-fg)' }}>
                    {myPnL >= 0 ? '+' : ''}{fmtBRL(myPnL, { hide: hideValues })}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div style={{ fontSize: 13, color: 'var(--fg-mute)' }}>Você ainda não tem {c.symbol}.</div>
          )}
        </Card>

        <Card padding={22}>
          <div style={{ fontSize: 11, color: 'var(--fg-mute)', letterSpacing: '0.06em',
            textTransform: 'uppercase', marginBottom: 14 }}>Estatísticas de mercado</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, fontFamily: 'var(--font-mono)', fontSize: 12 }}>
            <Stat label="Variação 24h" value={fmtPct(c.change24h)} accent={c.change24h >= 0 ? 'up' : 'down'} />
            <Stat label="Variação 7d"  value={fmtPct(c.change7d)}  accent={c.change7d  >= 0 ? 'up' : 'down'} />
            <Stat label="Máxima período" value={fmtBRL(Math.max(...series), { decimals: c.price < 10 ? 4 : 0 })} />
            <Stat label="Mínima período" value={fmtBRL(Math.min(...series), { decimals: c.price < 10 ? 4 : 0 })} />
          </div>
        </Card>
      </div>

      <Card padding={0}>
        <div style={{ padding: '18px 22px 14px', fontSize: 13, fontWeight: 500 }}>
          Suas transações em {c.symbol}
        </div>
        {txOfCoin.length === 0 && (
          <div style={{ padding: '0 22px 22px', fontSize: 12, color: 'var(--fg-mute)' }}>
            Nenhuma transação registrada.
          </div>
        )}
        {txOfCoin.map(tx => (
          <div key={tx.id} style={{
            display: 'grid', gridTemplateColumns: '70px 1fr 1fr 1fr 1fr',
            alignItems: 'center', columnGap: 14, padding: '14px 22px',
            borderTop: '1px solid var(--border-soft)', fontSize: 12,
          }}>
            <span style={{ fontSize: 11, fontWeight: 500,
              color: tx.type === 'buy' ? 'var(--up-fg)' : 'var(--down-fg)',
              textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              {tx.type === 'buy' ? 'Compra' : 'Venda'}
            </span>
            <span style={{ color: 'var(--fg-mute)' }}>{fmtDate(tx.date)} · {tx.venue}</span>
            <span style={{ textAlign: 'right', fontFamily: 'var(--font-mono)' }}>
              {fmtAmount(tx.amount, 4)} {c.symbol}
            </span>
            <span style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', color: 'var(--fg-mute)' }}>
              @ {fmtBRL(tx.price, { decimals: c.price < 100 ? 2 : 0 })}
            </span>
            <span style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: 500 }}>
              {fmtBRL(tx.amount * tx.price, { hide: hideValues })}
            </span>
          </div>
        ))}
      </Card>
    </div>
  );
}

function Stat({ label, value, accent }) {
  const color = accent === 'up' ? 'var(--up-fg)' : accent === 'down' ? 'var(--down-fg)' : 'var(--fg)';
  return (
    <div>
      <div style={{ color: 'var(--fg-mute)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</div>
      <div style={{ marginTop: 4, color }}>{value}</div>
    </div>
  );
}

// === Add Transaction Modal ==================================================
function AddTransactionModal({ open, onClose }) {
  const [type, setType] = React.useState('buy');
  const [coin, setCoin] = React.useState('btc');
  const [amount, setAmount] = React.useState('0.05');
  const c = window.COINS.find(x => x.id === coin);
  const [price, setPrice] = React.useState(c.price.toFixed(2));
  const [venue, setVenue] = React.useState('Binance');

  React.useEffect(() => {
    setPrice(window.COINS.find(x => x.id === coin).price.toFixed(2));
  }, [coin]);

  if (!open) return null;
  const total = (parseFloat(amount) || 0) * (parseFloat(price) || 0);

  const inputStyle = {
    width: '100%', height: 38, padding: '0 12px', fontSize: 13,
    fontFamily: 'var(--font-mono)',
    border: '1px solid var(--border)', borderRadius: 8,
    background: 'var(--surface)', color: 'var(--fg)', outline: 'none',
    boxSizing: 'border-box',
  };
  const labelStyle = { fontSize: 11, color: 'var(--fg-mute)',
    letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 6, display: 'block' };

  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, background: 'rgba(15, 18, 22, 0.45)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50,
      backdropFilter: 'blur(4px)',
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        width: 460, background: 'var(--surface)',
        border: '1px solid var(--border-soft)', borderRadius: 14,
        boxShadow: 'var(--shadow-lg)', overflow: 'hidden',
      }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-soft)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 11, color: 'var(--fg-mute)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Adicionar</div>
            <h3 style={{ margin: 0, fontSize: 18, fontWeight: 600, letterSpacing: '-0.02em' }}>Nova transação</h3>
          </div>
          <button onClick={onClose} style={{ width: 30, height: 30, borderRadius: 8,
            border: 0, background: 'var(--surface-2)', cursor: 'pointer', color: 'var(--fg-mute)' }}>✕</button>
        </div>

        <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Type segment */}
          <div style={{ display: 'inline-flex', padding: 3, background: 'var(--surface-2)',
            borderRadius: 8, position: 'relative' }}>
            {['buy', 'sell'].map(t => (
              <button key={t} onClick={() => setType(t)} style={{
                flex: 1, padding: '8px 14px', border: 0, borderRadius: 6,
                background: type === t ? 'var(--surface)' : 'transparent',
                color: type === t
                  ? (t === 'buy' ? 'var(--up-fg)' : 'var(--down-fg)')
                  : 'var(--fg-mute)',
                fontSize: 13, fontWeight: 500, cursor: 'pointer',
                boxShadow: type === t ? 'var(--shadow-xs)' : 'none',
              }}>{t === 'buy' ? 'Comprar' : 'Vender'}</button>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={labelStyle}>Ativo</label>
              <select value={coin} onChange={e => setCoin(e.target.value)} style={inputStyle}>
                {window.COINS.map(c => <option key={c.id} value={c.id}>{c.symbol} · {c.name}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Corretora</label>
              <select value={venue} onChange={e => setVenue(e.target.value)} style={inputStyle}>
                <option>Binance</option><option>Coinbase</option><option>Kraken</option><option>Mercado Bitcoin</option><option>Carteira self-custody</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={labelStyle}>Quantidade</label>
              <div style={{ position: 'relative' }}>
                <input value={amount} onChange={e => setAmount(e.target.value)} style={inputStyle} />
                <span style={{ position: 'absolute', right: 12, top: 0, height: '100%',
                  display: 'flex', alignItems: 'center', fontSize: 11,
                  color: 'var(--fg-mute)', fontFamily: 'var(--font-mono)' }}>{c.symbol}</span>
              </div>
            </div>
            <div>
              <label style={labelStyle}>Preço unitário</label>
              <div style={{ position: 'relative' }}>
                <input value={price} onChange={e => setPrice(e.target.value)} style={inputStyle} />
                <span style={{ position: 'absolute', right: 12, top: 0, height: '100%',
                  display: 'flex', alignItems: 'center', fontSize: 11,
                  color: 'var(--fg-mute)', fontFamily: 'var(--font-mono)' }}>BRL</span>
              </div>
            </div>
          </div>

          <div style={{ padding: '14px 16px', background: 'var(--surface-2)',
            borderRadius: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 11, color: 'var(--fg-mute)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Total</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 18, fontWeight: 600 }}>
              {fmtBRL(total)}
            </span>
          </div>
        </div>

        <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border-soft)',
          display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <button onClick={onClose} style={{ padding: '9px 16px', borderRadius: 8,
            border: '1px solid var(--border-soft)', background: 'var(--surface)',
            cursor: 'pointer', fontSize: 13 }}>Cancelar</button>
          <button onClick={onClose} style={{ padding: '9px 18px', borderRadius: 8,
            border: 0, background: 'var(--fg)', color: 'var(--bg)',
            cursor: 'pointer', fontSize: 13, fontWeight: 500 }}>
            Registrar transação
          </button>
        </div>
      </div>
    </div>
  );
}

// === Stub screens (Holdings/Transactions/Market/Alerts) =====================
function StubScreen({ title }) {
  return (
    <div style={{ padding: '24px 32px' }}>
      <Card padding={48} style={{ textAlign: 'center', color: 'var(--fg-mute)' }}>
        <div style={{ fontSize: 13 }}>Tela "{title}" — placeholder. Volte ao Dashboard.</div>
      </Card>
    </div>
  );
}

Object.assign(window, {
  Sidebar, TopBar, Card, Dashboard, AssetDetail, AddTransactionModal, StubScreen,
});
