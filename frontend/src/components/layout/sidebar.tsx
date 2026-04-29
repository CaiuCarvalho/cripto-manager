'use client';

interface SidebarProps {
  current: string;
  onNav: (screen: string) => void;
  onAddTx: () => void;
  hideValues: boolean;
  onTogglePrivacy: () => void;
  userName?: string;
}

const NAV_ITEMS = [
  { id: 'dashboard',    label: 'Dashboard' },
  { id: 'holdings',     label: 'Meus ativos' },
  { id: 'transactions', label: 'Transações' },
  { id: 'market',       label: 'Mercado' },
  { id: 'alerts',       label: 'Alertas' },
  { id: 'private-keys', label: 'Chaves privadas' },
];

function NavIcon({ id }: { id: string }) {
  const props = {
    width: 16, height: 16, viewBox: '0 0 24 24',
    fill: 'none', stroke: 'currentColor',
    strokeWidth: 1.6, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const,
  };
  if (id === 'dashboard')
    return <svg {...props}><rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/></svg>;
  if (id === 'holdings')
    return <svg {...props}><circle cx="9" cy="9" r="6"/><circle cx="15" cy="15" r="6"/></svg>;
  if (id === 'transactions')
    return <svg {...props}><path d="M4 8h13l-3-3"/><path d="M20 16H7l3 3"/></svg>;
  if (id === 'market')
    return <svg {...props}><path d="M3 17l5-5 4 4 8-9"/><path d="M14 7h6v6"/></svg>;
  if (id === 'alerts')
    return <svg {...props}><path d="M6 8a6 6 0 0 1 12 0c0 7 3 7 3 9H3c0-2 3-2 3-9"/><path d="M10 21h4"/></svg>;
  if (id === 'private-keys')
    return <svg {...props}><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>;
  return null;
}

export function Sidebar({ current, onNav, onAddTx, hideValues, onTogglePrivacy, userName = 'Usuário' }: SidebarProps) {
  const initials = userName.split(' ').map((w: string) => w[0]).slice(0, 2).join('').toUpperCase();

  return (
    <aside
      style={{
        width: 232,
        flexShrink: 0,
        height: '100vh',
        position: 'sticky',
        top: 0,
        borderRight: '1px solid var(--border-soft)',
        background: 'var(--surface)',
        display: 'flex',
        flexDirection: 'column',
        padding: '20px 14px',
        overflow: 'hidden',
      }}
    >
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '4px 6px 24px' }}>
        <svg width="22" height="22" viewBox="0 0 22 22">
          <circle cx="8"  cy="11" r="6.5" fill="none" stroke="var(--accent)" strokeWidth="1.6" />
          <circle cx="14" cy="11" r="6.5" fill="none" stroke="var(--fg)"     strokeWidth="1.6" />
        </svg>
        <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.05 }}>
          <span style={{ fontWeight: 600, fontSize: 15, letterSpacing: '-0.01em', color: 'var(--fg)' }}>AgonCripto</span>
          <span style={{ fontSize: 10, color: 'var(--fg-mute)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>portfolio</span>
        </div>
      </div>

      {/* Nova transação */}
      <button
        onClick={onAddTx}
        style={{
          margin: '0 0 18px',
          height: 34,
          borderRadius: 8,
          background: 'var(--fg)',
          color: 'var(--bg)',
          border: 0,
          fontWeight: 500,
          fontSize: 13,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 7,
          fontFamily: 'var(--font-sans)',
        }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M12 5v14M5 12h14"/>
        </svg>
        Nova transação
      </button>

      {/* Heading Menu */}
      <div style={{ fontSize: 10, color: 'var(--fg-mute)', letterSpacing: '0.08em', textTransform: 'uppercase', padding: '4px 8px 8px' }}>
        Menu
      </div>

      {/* Nav items */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {NAV_ITEMS.map(item => {
          const active = current === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNav(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 11,
                padding: '8px 10px',
                height: 34,
                borderRadius: 7,
                border: 0,
                cursor: 'pointer',
                background: active ? 'var(--surface-2)' : 'transparent',
                color: active ? 'var(--fg)' : 'var(--fg-soft)',
                fontSize: 13,
                fontWeight: active ? 500 : 400,
                textAlign: 'left',
                fontFamily: 'var(--font-sans)',
              }}
            >
              <span style={{ color: active ? 'var(--accent)' : 'var(--fg-mute)', display: 'flex' }}>
                <NavIcon id={item.id} />
              </span>
              {item.label}
            </button>
          );
        })}
      </nav>

      <div style={{ flex: 1 }} />

      {/* Toggle de privacidade */}
      <button
        onClick={onTogglePrivacy}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '10px',
          borderRadius: 8,
          border: '1px solid var(--border-soft)',
          background: 'transparent',
          cursor: 'pointer',
          marginBottom: 10,
          width: '100%',
        }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--fg-mute)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          {hideValues
            ? <><path d="M3 3l18 18"/><path d="M10.6 6.1a10 10 0 0 1 10.4 5.9"/><path d="M6.6 6.6A12 12 0 0 0 3 12s4 7 9 7a9 9 0 0 0 4-1"/></>
            : <><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></>
          }
        </svg>
        <span style={{ fontSize: 12, color: 'var(--fg-soft)', flex: 1, textAlign: 'left' }}>
          {hideValues ? 'Mostrar saldo' : 'Esconder saldo'}
        </span>
      </button>

      {/* User chip */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 8px 0', borderTop: '1px solid var(--border-soft)' }}>
        <div style={{
          width: 28, height: 28, borderRadius: 8,
          background: 'var(--accent-soft)',
          color: 'var(--accent)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: 600, fontSize: 11, fontFamily: 'var(--font-mono)',
          flexShrink: 0,
        }}>
          {initials}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.15, flex: 1, minWidth: 0 }}>
          <span style={{ fontSize: 12, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--fg)' }}>
            {userName}
          </span>
          <span style={{ fontSize: 10, color: 'var(--fg-mute)' }}>Plano pessoal</span>
        </div>
      </div>
    </aside>
  );
}
