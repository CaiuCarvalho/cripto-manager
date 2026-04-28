export default function WalletsPage() {
  return (
    <div style={{ padding: '24px 32px 64px' }}>
      <div style={{
        background: 'var(--surface)',
        border: '1px solid var(--border-soft)',
        borderRadius: 12,
        padding: '48px 32px',
        textAlign: 'center',
      }}>
        <div style={{ fontSize: 13, color: 'var(--fg-mute)', fontFamily: 'var(--font-mono)' }}>
          Em breve
        </div>
        <div style={{ fontSize: 18, fontWeight: 600, color: 'var(--fg)', marginTop: 8 }}>
          Meus ativos
        </div>
        <div style={{ fontSize: 13, color: 'var(--fg-mute)', marginTop: 6 }}>
          Integração com API em desenvolvimento.
        </div>
      </div>
    </div>
  );
}
