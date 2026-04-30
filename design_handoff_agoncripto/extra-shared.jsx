// extra-shared.jsx — primitivos compartilhados das telas Wallets/Transactions/Alerts

function Skeleton({ w = '100%', h = 14, r = 6, style }) {
  return (
    <div style={{
      width: w, height: h, borderRadius: r,
      background: 'linear-gradient(90deg, var(--surface-2) 0%, var(--border-soft) 50%, var(--surface-2) 100%)',
      backgroundSize: '200% 100%',
      animation: 'agon-shimmer 1.4s ease-in-out infinite', ...style,
    }} />
  );
}

function EmptyState({ icon, title, body, action }) {
  return (
    <div style={{ padding: '64px 24px', textAlign: 'center', display: 'flex',
      flexDirection: 'column', alignItems: 'center', gap: 14 }}>
      <div style={{ width: 56, height: 56, borderRadius: 14,
        background: 'var(--surface-2)', color: 'var(--fg-mute)',
        display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{icon}</div>
      <div style={{ maxWidth: 380 }}>
        <div style={{ fontSize: 15, fontWeight: 600 }}>{title}</div>
        <div style={{ fontSize: 13, color: 'var(--fg-mute)', lineHeight: 1.5, marginTop: 4 }}>{body}</div>
      </div>
      {action}
    </div>
  );
}

function ErrorState({ message, onRetry }) {
  return (
    <div style={{ padding: '40px 24px', textAlign: 'center', display: 'flex',
      flexDirection: 'column', alignItems: 'center', gap: 12 }}>
      <div style={{ width: 44, height: 44, borderRadius: 12,
        background: 'var(--down-bg)', color: 'var(--down-fg)',
        display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 9v4M12 17h.01"/><path d="M10.3 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/></svg>
      </div>
      <div style={{ fontSize: 14, fontWeight: 500 }}>Algo deu errado</div>
      <div style={{ fontSize: 12, color: 'var(--fg-mute)', maxWidth: 360 }}>{message}</div>
      {onRetry && <button onClick={onRetry} style={{ marginTop: 4, padding: '7px 14px',
        border: '1px solid var(--border-soft)', background: 'var(--surface)',
        borderRadius: 7, fontSize: 12, cursor: 'pointer' }}>Tentar novamente</button>}
    </div>
  );
}

function StatusPill({ status }) {
  const map = {
    ok:        { label: 'Sincronizado',  fg: 'var(--up-fg)',   bg: 'var(--up-bg)',   dot: 'var(--up-fg)' },
    syncing:   { label: 'Sincronizando', fg: '#a87018',        bg: 'rgba(168,112,24,0.14)', dot: '#d8932e' },
    error:     { label: 'Falha',         fg: 'var(--down-fg)', bg: 'var(--down-bg)', dot: 'var(--down-fg)' },
    armed:     { label: 'Ativo',         fg: 'var(--up-fg)',   bg: 'var(--up-bg)',   dot: 'var(--up-fg)' },
    triggered: { label: 'Disparado',     fg: '#a87018',        bg: 'rgba(168,112,24,0.14)', dot: '#d8932e' },
    paused:    { label: 'Pausado',       fg: 'var(--fg-mute)', bg: 'var(--surface-2)', dot: 'var(--fg-mute)' },
  };
  const s = map[status] || map.ok;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '3px 9px', borderRadius: 999, fontSize: 11, fontWeight: 500,
      color: s.fg, background: s.bg, whiteSpace: 'nowrap' }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: s.dot,
        animation: status === 'syncing' ? 'agon-pulse 1.2s ease-in-out infinite' : 'none' }} />
      {s.label}
    </span>
  );
}

function NetChip({ id }) {
  const n = (window.NETWORKS || []).find(x => x.id === id) || (window.VENUES || []).find(x => x.id === id);
  if (!n) return null;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11.5 }}>
      <span style={{ width: 8, height: 8, borderRadius: 2, background: n.color, flexShrink: 0 }} />
      <span>{n.label}</span>
    </span>
  );
}

function fmtRelative(iso) {
  const d = (Date.now() - new Date(iso).getTime()) / 1000;
  if (d < 60) return 'agora';
  if (d < 3600) return Math.floor(d / 60) + ' min atrás';
  if (d < 86400) return Math.floor(d / 3600) + 'h atrás';
  return Math.floor(d / 86400) + 'd atrás';
}

function shortAddr(a) {
  if (!a) return '—';
  if (a.startsWith('••••')) return a;
  return a.slice(0, 6) + '…' + a.slice(-6);
}

function StateSwitch({ value, onChange }) {
  const opts = [['list', 'Dados'], ['loading', 'Loading'], ['empty', 'Empty'], ['error', 'Error']];
  return (
    <div style={{ display: 'inline-flex', gap: 2, padding: 3, background: 'var(--surface-2)', borderRadius: 7 }}>
      {opts.map(([v, l]) => (
        <button key={v} onClick={() => onChange(v)} style={{
          padding: '4px 10px', border: 0, borderRadius: 5, fontSize: 11,
          background: value === v ? 'var(--surface)' : 'transparent',
          color: value === v ? 'var(--fg)' : 'var(--fg-mute)',
          cursor: 'pointer', fontFamily: 'var(--font-mono)',
        }}>{l}</button>
      ))}
    </div>
  );
}

Object.assign(window, { Skeleton, EmptyState, ErrorState, StatusPill, NetChip, fmtRelative, shortAddr, StateSwitch });
