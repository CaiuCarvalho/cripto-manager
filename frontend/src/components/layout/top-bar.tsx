const PAGE_TITLES: Record<string, { subtitle: string; title: string }> = {
  dashboard:    { subtitle: 'Visão geral', title: 'Dashboard' },
  holdings:     { subtitle: 'Posições abertas', title: 'Meus ativos' },
  transactions: { subtitle: 'Histórico', title: 'Transações' },
  market:       { subtitle: 'Acompanhamento', title: 'Mercado' },
  alerts:       { subtitle: 'Configurações', title: 'Alertas' },
  'private-keys': { subtitle: 'Armazenamento seguro', title: 'Chaves Privadas' },
};

interface TopBarProps {
  screen: string;
}

export function TopBar({ screen }: TopBarProps) {
  const { subtitle, title } = PAGE_TITLES[screen] ?? PAGE_TITLES.dashboard;

  return (
    <header
      style={{
        padding: '24px 32px 18px',
        borderBottom: '1px solid var(--border-soft)',
        background: 'var(--bg)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 10,
      }}
    >
      {/* Título */}
      <div>
        <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--fg-mute)', marginBottom: 2 }}>
          {subtitle}
        </div>
        <div style={{ fontSize: 22, fontWeight: 600, letterSpacing: '-0.02em', color: 'var(--fg)', lineHeight: 1 }}>
          {title}
        </div>
      </div>

      {/* Direita: busca + sino */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {/* Busca fake */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          height: 30,
          padding: '0 10px',
          borderRadius: 7,
          border: '1px solid var(--border-soft)',
          background: 'var(--surface)',
          minWidth: 220,
          cursor: 'text',
        }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--fg-mute)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
          </svg>
          <span style={{ fontSize: 12, color: 'var(--fg-mute)', flex: 1, userSelect: 'none' }}>
            Buscar ativo, transação…
          </span>
          <span style={{
            fontSize: 10,
            color: 'var(--fg-mute)',
            background: 'var(--surface-2)',
            border: '1px solid var(--border-soft)',
            borderRadius: 4,
            padding: '1px 5px',
            fontFamily: 'var(--font-mono)',
          }}>
            ⌘K
          </span>
        </div>

        {/* Sino */}
        <button style={{
          width: 34, height: 34,
          borderRadius: 8,
          border: '1px solid var(--border-soft)',
          background: 'var(--surface)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--fg-mute)',
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 8a6 6 0 0 1 12 0c0 7 3 7 3 9H3c0-2 3-2 3-9"/>
            <path d="M10 21h4"/>
          </svg>
        </button>
      </div>
    </header>
  );
}
