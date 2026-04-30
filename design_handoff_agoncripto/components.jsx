// components.jsx — primitivos visuais para AgonCripto

// === Formatadores ===========================================================
const fmtBRL = (n, opts = {}) => {
  const { hide = false, decimals = 2 } = opts;
  if (hide) return 'R$ •••••';
  return n.toLocaleString('pt-BR', {
    style: 'currency', currency: 'BRL',
    minimumFractionDigits: decimals, maximumFractionDigits: decimals,
  });
};
const fmtUSD = (n, opts = {}) => {
  const { hide = false, decimals = 2 } = opts;
  if (hide) return '$•••••';
  return '$' + n.toLocaleString('en-US', {
    minimumFractionDigits: decimals, maximumFractionDigits: decimals,
  });
};
const fmtPct = (n) => (n >= 0 ? '+' : '') + n.toFixed(2) + '%';
const fmtAmount = (n, decimals = 4) => n.toLocaleString('pt-BR', {
  minimumFractionDigits: 0, maximumFractionDigits: decimals,
});
const fmtDate = (iso) => {
  const d = new Date(iso);
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }) +
    ' · ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
};

// === Coin chip / mark =======================================================
function CoinMark({ coin, size = 28 }) {
  const sym = coin.symbol;
  const initials = sym.slice(0, 2);
  return (
    <div style={{
      width: size, height: size, borderRadius: size / 2,
      background: coin.color, color: '#fff',
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'var(--font-mono)', fontSize: size * 0.36, fontWeight: 600,
      letterSpacing: '0.02em', flexShrink: 0,
    }}>{initials}</div>
  );
}

// === Pill (badge de variação %) ============================================
function Pill({ value, size = 'md' }) {
  const up = value >= 0;
  const pad = size === 'sm' ? '2px 7px' : '3px 9px';
  const fs = size === 'sm' ? 11 : 12;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: pad, borderRadius: 999,
      fontFamily: 'var(--font-mono)', fontSize: fs, fontWeight: 500,
      background: up ? 'var(--up-bg)' : 'var(--down-bg)',
      color: up ? 'var(--up-fg)' : 'var(--down-fg)',
      fontVariantNumeric: 'tabular-nums',
    }}>
      <span style={{ fontSize: fs - 2 }}>{up ? '▲' : '▼'}</span>
      {Math.abs(value).toFixed(2)}%
    </span>
  );
}

// === Sparkline (mini) =======================================================
function Sparkline({ data, width = 80, height = 28, stroke }) {
  if (!data || data.length < 2) return null;
  const min = Math.min(...data), max = Math.max(...data);
  const span = max - min || 1;
  const step = width / (data.length - 1);
  const pts = data.map((v, i) => [i * step, height - ((v - min) / span) * height]);
  const d = pts.map((p, i) => (i === 0 ? 'M' : 'L') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' ');
  const up = data[data.length - 1] >= data[0];
  const color = stroke || (up ? 'var(--up-fg)' : 'var(--down-fg)');
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <path d={d} fill="none" stroke={color} strokeWidth="1.5"
            strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// === Big chart (área + linha + crosshair) ==================================
function BigChart({ data, height = 280, style = 'area', accent }) {
  const wrapRef = React.useRef(null);
  const [hoverIdx, setHoverIdx] = React.useState(null);
  const [width, setWidth] = React.useState(800);

  React.useEffect(() => {
    if (!wrapRef.current) return;
    const ro = new ResizeObserver(entries => {
      for (const e of entries) setWidth(e.contentRect.width);
    });
    ro.observe(wrapRef.current);
    return () => ro.disconnect();
  }, []);

  if (!data || data.length < 2) return <div ref={wrapRef} style={{ height }} />;

  const padX = 8, padY = 18;
  const min = Math.min(...data), max = Math.max(...data);
  const span = max - min || 1;
  const step = (width - padX * 2) / (data.length - 1);
  const xy = (i) => [padX + i * step, padY + (1 - (data[i] - min) / span) * (height - padY * 2)];
  const pts = data.map((_, i) => xy(i));
  const linePath = pts.map((p, i) => (i === 0 ? 'M' : 'L') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' ');
  const areaPath = linePath + ` L ${pts[pts.length - 1][0].toFixed(1)} ${height - padY} L ${pts[0][0].toFixed(1)} ${height - padY} Z`;

  const up = data[data.length - 1] >= data[0];
  const color = accent || (up ? 'var(--up-fg)' : 'var(--down-fg)');

  // gridlines
  const gridLines = 4;
  const grids = [];
  for (let i = 0; i <= gridLines; i++) {
    const y = padY + (i / gridLines) * (height - padY * 2);
    const v = max - (i / gridLines) * span;
    grids.push({ y, v });
  }

  const onMove = (e) => {
    const r = wrapRef.current.getBoundingClientRect();
    const x = e.clientX - r.left;
    const i = Math.round((x - padX) / step);
    if (i >= 0 && i < data.length) setHoverIdx(i);
  };
  const onLeave = () => setHoverIdx(null);

  const hover = hoverIdx != null ? xy(hoverIdx) : null;

  return (
    <div ref={wrapRef} style={{ position: 'relative', width: '100%', height }}
         onMouseMove={onMove} onMouseLeave={onLeave}>
      <svg width={width} height={height} style={{ display: 'block' }}>
        <defs>
          <linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.18" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        {grids.map((g, i) => (
          <line key={i} x1={padX} x2={width - padX} y1={g.y} y2={g.y}
                stroke="var(--border-soft)" strokeDasharray="2 4" strokeWidth="1" />
        ))}
        {style !== 'line' && <path d={areaPath} fill="url(#chartFill)" />}
        <path d={linePath} fill="none" stroke={color} strokeWidth="1.75"
              strokeLinecap="round" strokeLinejoin="round" />
        {hover && (
          <>
            <line x1={hover[0]} x2={hover[0]} y1={padY} y2={height - padY}
                  stroke="var(--border)" strokeWidth="1" />
            <circle cx={hover[0]} cy={hover[1]} r="5" fill={color}
                    stroke="var(--bg)" strokeWidth="2" />
          </>
        )}
        {grids.map((g, i) => (
          <text key={'t' + i} x={width - padX} y={g.y - 3} textAnchor="end"
                fill="var(--fg-mute)" fontSize="10" fontFamily="var(--font-mono)">
            {g.v.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
          </text>
        ))}
      </svg>
      {hover && (
        <div style={{
          position: 'absolute', left: Math.min(hover[0] + 12, width - 140),
          top: 12, padding: '8px 10px',
          background: 'var(--surface-elev)', border: '1px solid var(--border)',
          borderRadius: 8, fontSize: 11, fontFamily: 'var(--font-mono)',
          color: 'var(--fg)', boxShadow: 'var(--shadow-sm)', pointerEvents: 'none',
          minWidth: 120,
        }}>
          <div style={{ color: 'var(--fg-mute)', fontSize: 10, marginBottom: 2 }}>
            Ponto {hoverIdx + 1}/{data.length}
          </div>
          <div style={{ fontWeight: 600 }}>
            {data[hoverIdx].toLocaleString('pt-BR', { maximumFractionDigits: 2 })}
          </div>
        </div>
      )}
    </div>
  );
}

// === Donut allocation =======================================================
function AllocationDonut({ slices, size = 140 }) {
  const total = slices.reduce((a, s) => a + s.value, 0);
  const r = size / 2 - 10;
  const cx = size / 2, cy = size / 2;
  const circumference = 2 * Math.PI * r;
  let offset = 0;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={cx} cy={cy} r={r} fill="none"
              stroke="var(--surface-2)" strokeWidth="14" />
      {slices.map((s, i) => {
        const len = (s.value / total) * circumference;
        const dash = `${len} ${circumference - len}`;
        const el = (
          <circle key={i} cx={cx} cy={cy} r={r} fill="none"
                  stroke={s.color} strokeWidth="14" strokeLinecap="butt"
                  strokeDasharray={dash} strokeDashoffset={-offset}
                  transform={`rotate(-90 ${cx} ${cy})`} />
        );
        offset += len;
        return el;
      })}
    </svg>
  );
}

Object.assign(window, {
  fmtBRL, fmtUSD, fmtPct, fmtAmount, fmtDate,
  CoinMark, Pill, Sparkline, BigChart, AllocationDonut,
});
