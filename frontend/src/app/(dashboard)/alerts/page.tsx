'use client';

import { ALERTS, WALLETS, COINS, type Alert, type AlertStatus, type AlertKind } from '@/lib/mock-data';
import { fmtRelative, fmtDate } from '@/lib/formatters';

const KIND_LABELS: Record<AlertKind, string> = {
  above:  'Acima de',
  below:  'Abaixo de',
  change: 'Variação',
  wallet: 'Carteira',
};

function StatusPill({ status }: { status: AlertStatus }) {
  const map: Record<AlertStatus, { label: string; fg: string; bg: string; dot: string }> = {
    armed:     { label: 'Ativo',    fg: 'var(--up-fg)',   bg: 'var(--up-bg)',            dot: 'var(--up-fg)' },
    triggered: { label: 'Disparado', fg: '#a87018',       bg: 'rgba(168,112,24,0.14)',   dot: '#d8932e' },
    paused:    { label: 'Pausado',   fg: 'var(--fg-mute)', bg: 'var(--surface-2)',        dot: 'var(--fg-mute)' },
  };
  const s = map[status];
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '3px 9px', borderRadius: 999, fontSize: 11, fontWeight: 500,
      color: s.fg, background: s.bg, whiteSpace: 'nowrap',
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: s.dot }} />
      {s.label}
    </span>
  );
}

function AlertDescription({ alert }: { alert: Alert }) {
  const coin = COINS.find(c => c.id === alert.coin);
  const wallet = alert.wallet ? WALLETS.find(w => w.id === alert.wallet) : null;

  const coinLabel = (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
      {coin && <span style={{ width: 8, height: 8, borderRadius: '50%', background: coin.color }} />}
      <strong>{coin?.symbol ?? alert.coin.toUpperCase()}</strong>
    </span>
  );

  if (alert.kind === 'above' || alert.kind === 'below') {
    return (
      <span>
        {coinLabel} {KIND_LABELS[alert.kind]}{' '}
        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
          ${alert.threshold.toLocaleString('pt-BR')}
        </span>
      </span>
    );
  }

  if (alert.kind === 'change') {
    return (
      <span>
        {coinLabel} variar{' '}
        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: alert.threshold < 0 ? 'var(--down-fg)' : 'var(--up-fg)' }}>
          {alert.threshold > 0 ? '+' : ''}{alert.threshold}%
        </span>
        {alert.window && <span style={{ color: 'var(--fg-mute)' }}> em {alert.window}</span>}
      </span>
    );
  }

  if (alert.kind === 'wallet') {
    return (
      <span>
        {coinLabel} ativo em carteira{' '}
        {wallet && <strong>{wallet.label}</strong>}
      </span>
    );
  }

  return <span>{KIND_LABELS[alert.kind]}</span>;
}

function AlertRow({ alert, last }: { alert: Alert; last: boolean }) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '1fr auto auto',
      alignItems: 'center',
      gap: 16,
      padding: '14px 20px',
      borderBottom: last ? 'none' : '1px solid var(--border-soft)',
    }}>
      {/* Descrição */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <div style={{ fontSize: 14, color: 'var(--fg)', display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          <AlertDescription alert={alert} />
        </div>
        <div style={{ fontSize: 11, color: 'var(--fg-mute)' }}>
          {alert.status === 'triggered' && alert.triggered_at
            ? `Disparado em ${fmtDate(alert.triggered_at)}`
            : `Verificado ${fmtRelative(alert.last_check)}`
          }
        </div>
      </div>

      {/* Status */}
      <StatusPill status={alert.status} />

      {/* Ações */}
      <div style={{ display: 'flex', gap: 6 }}>
        <button style={{
          padding: '5px 10px', borderRadius: 6, border: '1px solid var(--border-soft)',
          background: 'var(--surface-2)', color: 'var(--fg-mute)', fontSize: 11,
          cursor: 'pointer', fontFamily: 'inherit',
        }}>
          Editar
        </button>
        <button style={{
          padding: '5px 10px', borderRadius: 6, border: '1px solid var(--border-soft)',
          background: 'var(--surface-2)', color: 'var(--down-fg)', fontSize: 11,
          cursor: 'pointer', fontFamily: 'inherit',
        }}>
          Remover
        </button>
      </div>
    </div>
  );
}

export default function AlertsPage() {
  const armed     = ALERTS.filter(a => a.status === 'armed');
  const triggered = ALERTS.filter(a => a.status === 'triggered');
  const paused    = ALERTS.filter(a => a.status === 'paused');

  return (
    <div style={{ padding: '24px 32px 64px', display: 'flex', flexDirection: 'column', gap: 18 }}>

      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: 'var(--surface)', border: '1px solid var(--border-soft)',
        borderRadius: 12, padding: '16px 22px',
      }}>
        <div>
          <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--fg-mute)', marginBottom: 4 }}>
            Alertas ativos
          </div>
          <div style={{ fontSize: 26, fontWeight: 600, fontFamily: 'var(--font-mono)' }}>
            {armed.length + triggered.length}
          </div>
        </div>
        <button style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '8px 14px', borderRadius: 8, border: '1px solid var(--border-soft)',
          background: 'var(--surface-2)', color: 'var(--fg)', fontSize: 13,
          cursor: 'pointer', fontFamily: 'inherit',
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 5v14M5 12l7-7 7 7" />
          </svg>
          Novo alerta
        </button>
      </div>

      {/* Disparados */}
      {triggered.length > 0 && (
        <div style={{ background: 'var(--surface)', border: '1px solid rgba(168,112,24,0.35)', borderRadius: 12, overflow: 'hidden' }}>
          <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--border-soft)', background: 'rgba(168,112,24,0.07)' }}>
            <span style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#a87018' }}>
              Disparados
            </span>
          </div>
          {triggered.map((a, i) => <AlertRow key={a.id} alert={a} last={i === triggered.length - 1} />)}
        </div>
      )}

      {/* Ativos */}
      {armed.length > 0 && (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border-soft)', borderRadius: 12, overflow: 'hidden' }}>
          <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--border-soft)' }}>
            <span style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--fg-mute)' }}>
              Ativos
            </span>
          </div>
          {armed.map((a, i) => <AlertRow key={a.id} alert={a} last={i === armed.length - 1} />)}
        </div>
      )}

      {/* Pausados */}
      {paused.length > 0 && (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border-soft)', borderRadius: 12, overflow: 'hidden' }}>
          <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--border-soft)' }}>
            <span style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--fg-mute)' }}>
              Pausados
            </span>
          </div>
          {paused.map((a, i) => <AlertRow key={a.id} alert={a} last={i === paused.length - 1} />)}
        </div>
      )}

      {ALERTS.length === 0 && (
        <div style={{
          background: 'var(--surface)', border: '1px solid var(--border-soft)',
          borderRadius: 12, padding: '64px 24px', textAlign: 'center',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
        }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--fg-mute)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 8a6 6 0 0 1 12 0c0 7 3 7 3 9H3c0-2 3-2 3-9"/>
            <path d="M10 21h4"/>
          </svg>
          <div style={{ fontSize: 15, fontWeight: 600 }}>Nenhum alerta configurado</div>
          <div style={{ fontSize: 13, color: 'var(--fg-mute)' }}>Crie alertas para ser notificado sobre variações de preço.</div>
        </div>
      )}
    </div>
  );
}
