// app.jsx — root do AgonCripto

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "dark": false,
  "accent": "teal",
  "density": "regular",
  "chartStyle": "area",
  "hideValues": false
}/*EDITMODE-END*/;

const ACCENT_PRESETS = {
  teal:    { fg: '#0e7d77', soft: '#daefee' },
  cobalt:  { fg: '#2a4eb8', soft: '#dde4f6' },
  bitcoin: { fg: '#c4791b', soft: '#f5e6d0' },
};

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [screen, setScreen] = React.useState('dashboard');
  const [selectedAsset, setSelectedAsset] = React.useState(null);
  const [showAddTx, setShowAddTx] = React.useState(false);

  // Build CSS vars from tweaks
  const accent = ACCENT_PRESETS[t.accent] || ACCENT_PRESETS.teal;
  const dark = t.dark;

  const cssVars = dark ? {
    '--bg':           '#0f1216',
    '--surface':      '#161a20',
    '--surface-2':    '#1d2128',
    '--surface-elev': '#22272f',
    '--fg':           '#e8eaee',
    '--fg-soft':      '#c4c8d0',
    '--fg-mute':      '#7d8590',
    '--border':       '#2a2f37',
    '--border-soft':  '#22262d',
    '--accent':       accent.fg,
    '--accent-soft':  'rgba(14,125,119,0.18)',
    '--up-fg':        '#3ec28b',
    '--up-bg':        'rgba(62,194,139,0.13)',
    '--down-fg':      '#e07171',
    '--down-bg':      'rgba(224,113,113,0.13)',
    '--shadow-xs':    '0 1px 2px rgba(0,0,0,0.3)',
    '--shadow-sm':    '0 4px 12px rgba(0,0,0,0.35)',
    '--shadow-lg':    '0 24px 60px rgba(0,0,0,0.5)',
  } : {
    '--bg':           '#f7f6f3',
    '--surface':      '#ffffff',
    '--surface-2':    '#f1f0ec',
    '--surface-elev': '#ffffff',
    '--fg':           '#1a1d22',
    '--fg-soft':      '#3d424a',
    '--fg-mute':      '#838790',
    '--border':       '#dedcd5',
    '--border-soft':  '#ebe9e3',
    '--accent':       accent.fg,
    '--accent-soft':  accent.soft,
    '--up-fg':        '#1c8a5a',
    '--up-bg':        'rgba(28,138,90,0.10)',
    '--down-fg':      '#b5443e',
    '--down-bg':      'rgba(181,68,62,0.10)',
    '--shadow-xs':    '0 1px 2px rgba(20,22,26,0.06)',
    '--shadow-sm':    '0 4px 14px rgba(20,22,26,0.08)',
    '--shadow-lg':    '0 24px 60px rgba(20,22,26,0.18)',
  };
  cssVars['--font-sans'] = '"Inter Tight", ui-sans-serif, system-ui, -apple-system, sans-serif';
  cssVars['--font-mono'] = '"JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, monospace';

  const handleSelectAsset = (id) => {
    setSelectedAsset(id);
    setScreen('asset');
  };

  let title = 'Dashboard', subtitle = 'Visão geral do seu portfólio';
  if (screen === 'holdings')     { title = 'Meus ativos';   subtitle = 'Posições atuais'; }
  if (screen === 'transactions') { title = 'Transações';    subtitle = 'Histórico completo'; }
  if (screen === 'market')       { title = 'Mercado';       subtitle = 'Top criptoativos'; }
  if (screen === 'alerts')       { title = 'Alertas';       subtitle = 'Gatilhos de preço'; }
  if (screen === 'asset') {
    const c = window.COINS.find(x => x.id === selectedAsset);
    title = c.name; subtitle = 'Detalhe do ativo';
  }

  return (
    <div style={{ ...cssVars, background: 'var(--bg)', color: 'var(--fg)',
      fontFamily: 'var(--font-sans)', minHeight: '100vh',
      display: 'flex', fontSize: 14, fontFeatureSettings: '"ss01", "cv11"' }}>
      <Sidebar
        current={screen === 'asset' ? 'holdings' : screen}
        onNav={(id) => { setScreen(id); setSelectedAsset(null); }}
        onAddTx={() => setShowAddTx(true)}
        hideValues={t.hideValues}
        onTogglePrivacy={() => setTweak('hideValues', !t.hideValues)}
      />
      <main style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        <TopBar title={title} subtitle={subtitle} />
        <div style={{ flex: 1, overflow: 'auto' }}>
          {screen === 'dashboard' && (
            <Dashboard hideValues={t.hideValues} density={t.density}
              chartStyle={t.chartStyle}
              onSelectAsset={handleSelectAsset}
              onAddTx={() => setShowAddTx(true)} />
          )}
          {screen === 'asset' && (
            <AssetDetail assetId={selectedAsset} hideValues={t.hideValues}
              chartStyle={t.chartStyle}
              onBack={() => { setScreen('dashboard'); setSelectedAsset(null); }} />
          )}
          {screen === 'holdings'     && <StubScreen title="Meus ativos" />}
          {screen === 'transactions' && <StubScreen title="Transações" />}
          {screen === 'market'       && <StubScreen title="Mercado" />}
          {screen === 'alerts'       && <StubScreen title="Alertas" />}
        </div>
      </main>

      <AddTransactionModal open={showAddTx} onClose={() => setShowAddTx(false)} />

      <TweaksPanel title="Tweaks · AgonCripto">
        <TweakSection label="Tema" />
        <TweakToggle label="Modo escuro" value={t.dark} onChange={v => setTweak('dark', v)} />
        <TweakRadio label="Cor de destaque" value={t.accent}
          options={[{ value: 'teal', label: 'Teal' }, { value: 'cobalt', label: 'Cobalt' }, { value: 'bitcoin', label: 'BTC' }]}
          onChange={v => setTweak('accent', v)} />
        <TweakSection label="Layout" />
        <TweakRadio label="Densidade" value={t.density}
          options={[{ value: 'compact', label: 'Compacto' }, { value: 'regular', label: 'Regular' }, { value: 'comfy', label: 'Confort.' }]}
          onChange={v => setTweak('density', v)} />
        <TweakRadio label="Estilo de gráfico" value={t.chartStyle}
          options={[{ value: 'area', label: 'Área' }, { value: 'line', label: 'Linha' }]}
          onChange={v => setTweak('chartStyle', v)} />
        <TweakSection label="Privacidade" />
        <TweakToggle label="Esconder saldos" value={t.hideValues} onChange={v => setTweak('hideValues', v)} />
      </TweaksPanel>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
