'use client';

import { useState, useEffect } from 'react';
import { fmtDate, fmtRelative } from '@/lib/formatters';
import api from '@/lib/api';

interface Alert {
  id: string;
  coin_symbol: string;
  target_price: number;
  direction: 'ABOVE' | 'BELOW';
  active: boolean;
  triggered_at: string | null;
  created_at: string;
}

type AlertStatus = 'armed' | 'triggered' | 'paused';

function getStatus(alert: Alert): AlertStatus {
  if (alert.triggered_at) return 'triggered';
  if (alert.active) return 'armed';
  return 'paused';
}

const COIN_COLORS: Record<string, string> = {
  BTC: '#f7931a', ETH: '#627eea', SOL: '#9945ff',
  BNB: '#f3ba2f', MATIC: '#8247e5', AVAX: '#e84142',
  ARB: '#28a0f0', OP: '#ff0420', USDT: '#26a17b', USDC: '#2775ca',
};

function StatusPill({ status }: { status: AlertStatus }) {
  const map: Record<AlertStatus, { label: string; fg: string; bg: string; dot: string }> = {
    armed:     { label: 'Ativo',     fg: 'var(--up-fg)',   bg: 'var(--up-bg)',          dot: 'var(--up-fg)' },
    triggered: { label: 'Disparado', fg: '#a87018',        bg: 'rgba(168,112,24,0.14)', dot: '#d8932e' },
    paused:    { label: 'Pausado',   fg: 'var(--fg-mute)', bg: 'var(--surface-2)',       dot: 'var(--fg-mute)' },
  };
  const s = map[status];
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '3px 9px', borderRadius: 999, fontSize: 11, fontWeight: 500, color: s.fg, background: s.bg, whiteSpace: 'nowrap' }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: s.dot }} />
      {s.label}
    </span>
  );
}

function AlertDescription({ alert }: { alert: Alert }) {
  const color = COIN_COLORS[alert.coin_symbol.toUpperCase()] ?? '#888';
  return (
    <span>
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
        <span style={{ width: 8, height: 8, borderRadius: '50%', background: color }} />
        <strong>{alert.coin_symbol.toUpperCase()}</strong>
      </span>
      {' '}{alert.direction === 'ABOVE' ? 'acima de' : 'abaixo de'}{' '}
      <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
        ${alert.target_price.toLocaleString('pt-BR')}
      </span>
    </span>
  );
}

function AlertRow({ alert, onDelete, last }: { alert: Alert; onDelete: () => void; last: boolean }) {
  const status = getStatus(alert);
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', alignItems: 'center', gap: 16, padding: '14px 20px', borderBottom: last ? 'none' : '1px solid var(--border-soft)' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <div style={{ fontSize: 14, color: 'var(--fg)', display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          <AlertDescription alert={alert} />
        </div>
        <div style={{ fontSize: 11, color: 'var(--fg-mute)' }}>
          {status === 'triggered' && alert.triggered_at
            ? `Disparado em ${fmtDate(alert.triggered_at)}`
            : `Criado ${fmtRelative(alert.created_at)}`}
        </div>
      </div>
      <StatusPill status={status} />
      <button
        onClick={onDelete}
        style={{ padding: '5px 10px', borderRadius: 6, border: '1px solid var(--border-soft)', background: 'var(--surface-2)', color: 'var(--down-fg)', fontSize: 11, cursor: 'pointer', fontFamily: 'inherit' }}
      >
        Remover
      </button>
    </div>
  );
}

function AddAlertModal({ onClose, onAdded }: { onClose: () => void; onAdded: (a: Alert) => void }) {
  const [coinSymbol, setCoinSymbol] = useState('BTC');
  const [targetPrice, setTargetPrice] = useState('');
  const [direction, setDirection] = useState<'ABOVE' | 'BELOW'>('ABOVE');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const price = parseFloat(targetPrice);
    if (isNaN(price) || price <= 0) { setError('Preço alvo deve ser um número positivo.'); return; }
    setLoading(true);
    try {
      const res = await api.post<Alert>('/alerts', {
        coin_symbol: coinSymbol.toUpperCase(),
        target_price: price,
        direction,
      });
      onAdded(res.data);
      onClose();
    } catch (err: unknown) {
      const apiErr = err as { response?: { data?: { message?: string } } };
      setError(apiErr.response?.data?.message ?? 'Erro ao criar alerta.');
    } finally {
      setLoading(false);
    }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '9px 12px', borderRadius: 8,
    border: '1px solid var(--border-soft)', background: 'var(--bg)',
    color: 'var(--fg)', fontSize: 14, boxSizing: 'border-box',
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border-soft)', borderRadius: 14, padding: 28, width: 380, maxWidth: '95vw' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--fg)' }}>Novo alerta de preço</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--fg-mute)', fontSize: 20, lineHeight: 1 }}>×</button>
        </div>
        {error && (
          <div style={{ marginBottom: 14, padding: '10px 14px', borderRadius: 8, background: 'var(--down-bg)', color: 'var(--down-fg)', fontSize: 13 }}>
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ display: 'block', fontSize: 12, color: 'var(--fg-mute)', marginBottom: 6 }}>Símbolo</label>
            <input
              value={coinSymbol}
              onChange={e => setCoinSymbol(e.target.value.toUpperCase())}
              required
              placeholder="BTC"
              style={{ ...inputStyle, fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 12, color: 'var(--fg-mute)', marginBottom: 6 }}>Preço alvo (USD)</label>
            <input
              value={targetPrice}
              onChange={e => setTargetPrice(e.target.value)}
              type="number"
              step="any"
              min="0"
              required
              placeholder="50000"
              style={{ ...inputStyle, fontFamily: 'var(--font-mono)' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 12, color: 'var(--fg-mute)', marginBottom: 6 }}>Condição</label>
            <div style={{ display: 'flex', gap: 8 }}>
              {(['ABOVE', 'BELOW'] as const).map(d => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDirection(d)}
                  style={{
                    flex: 1, padding: '9px', borderRadius: 8,
                    border: `1px solid ${direction === d ? 'var(--accent)' : 'var(--border-soft)'}`,
                    background: direction === d ? 'var(--accent-soft)' : 'var(--surface-2)',
                    color: direction === d ? 'var(--accent)' : 'var(--fg-mute)',
                    fontSize: 13, cursor: 'pointer', fontWeight: direction === d ? 600 : 400,
                  }}
                >
                  {d === 'ABOVE' ? 'Acima de' : 'Abaixo de'}
                </button>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
            <button type="button" onClick={onClose} style={{ flex: 1, padding: '9px', borderRadius: 8, border: '1px solid var(--border-soft)', background: 'var(--surface-2)', color: 'var(--fg)', fontSize: 14, cursor: 'pointer' }}>
              Cancelar
            </button>
            <button type="submit" disabled={loading} style={{ flex: 1, padding: '9px', borderRadius: 8, border: 'none', background: 'var(--accent)', color: '#fff', fontSize: 14, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1 }}>
              {loading ? 'Criando…' : 'Criar alerta'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function AlertSection({ title, alerts, borderColor, bgColor, titleColor, onDelete }: {
  title: string;
  alerts: Alert[];
  borderColor: string;
  bgColor?: string;
  titleColor: string;
  onDelete: (id: string) => void;
}) {
  if (alerts.length === 0) return null;
  return (
    <div style={{ background: 'var(--surface)', border: `1px solid ${borderColor}`, borderRadius: 12, overflow: 'hidden' }}>
      <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--border-soft)', background: bgColor }}>
        <span style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: titleColor }}>
          {title}
        </span>
      </div>
      {alerts.map((a, i) => (
        <AlertRow key={a.id} alert={a} onDelete={() => onDelete(a.id)} last={i === alerts.length - 1} />
      ))}
    </div>
  );
}

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    api.get<Alert[]>('/alerts')
      .then(res => setAlerts(res.data))
      .catch(err => setError(err.response?.data?.message ?? err.message))
      .finally(() => setLoading(false));
  }, []);

  async function handleDelete(alertId: string) {
    if (!confirm('Remover este alerta?')) return;
    try {
      await api.delete(`/alerts/${alertId}`);
      setAlerts(prev => prev.filter(a => a.id !== alertId));
    } catch {
      alert('Erro ao remover alerta. Tente novamente.');
    }
  }

  const triggered = alerts.filter(a => a.triggered_at);
  const armed     = alerts.filter(a => !a.triggered_at && a.active);
  const paused    = alerts.filter(a => !a.triggered_at && !a.active);

  if (loading) {
    return (
      <div style={{ padding: '24px 32px 64px', display: 'flex', flexDirection: 'column', gap: 18 }}>
        {[80, 200].map((h, i) => (
          <div key={i} style={{ background: 'var(--surface)', border: '1px solid var(--border-soft)', borderRadius: 12, padding: 22 }}>
            <div style={{ height: h, borderRadius: 6, background: 'var(--surface-2)', animation: 'agon-pulse 1.5s ease-in-out infinite' }} />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '24px 32px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, marginTop: 64 }}>
        <div style={{ fontSize: 15, color: 'var(--down-fg)' }}>Erro ao carregar alertas</div>
        <div style={{ fontSize: 13, color: 'var(--fg-mute)' }}>{error}</div>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px 32px 64px', display: 'flex', flexDirection: 'column', gap: 18 }}>
      {showAddModal && (
        <AddAlertModal
          onClose={() => setShowAddModal(false)}
          onAdded={a => setAlerts(prev => [a, ...prev])}
        />
      )}

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--surface)', border: '1px solid var(--border-soft)', borderRadius: 12, padding: '16px 22px' }}>
        <div>
          <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--fg-mute)', marginBottom: 4 }}>Alertas ativos</div>
          <div style={{ fontSize: 26, fontWeight: 600, fontFamily: 'var(--font-mono)' }}>
            {armed.length + triggered.length}
          </div>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 8, border: '1px solid var(--border-soft)', background: 'var(--surface-2)', color: 'var(--fg)', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 5v14M5 12l7-7 7 7" />
          </svg>
          Novo alerta
        </button>
      </div>

      <AlertSection
        title="Disparados"
        alerts={triggered}
        borderColor="rgba(168,112,24,0.35)"
        bgColor="rgba(168,112,24,0.07)"
        titleColor="#a87018"
        onDelete={handleDelete}
      />
      <AlertSection
        title="Ativos"
        alerts={armed}
        borderColor="var(--border-soft)"
        titleColor="var(--fg-mute)"
        onDelete={handleDelete}
      />
      <AlertSection
        title="Pausados"
        alerts={paused}
        borderColor="var(--border-soft)"
        titleColor="var(--fg-mute)"
        onDelete={handleDelete}
      />

      {alerts.length === 0 && (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border-soft)', borderRadius: 12, padding: '64px 24px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--fg-mute)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 8a6 6 0 0 1 12 0c0 7 3 7 3 9H3c0-2 3-2 3-9" /><path d="M10 21h4" />
          </svg>
          <div style={{ fontSize: 15, fontWeight: 600 }}>Nenhum alerta configurado</div>
          <div style={{ fontSize: 13, color: 'var(--fg-mute)' }}>Crie alertas para ser notificado sobre variações de preço.</div>
          <button onClick={() => setShowAddModal(true)} style={{ marginTop: 4, padding: '8px 20px', borderRadius: 8, background: 'var(--accent)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 13 }}>
            Criar primeiro alerta
          </button>
        </div>
      )}
    </div>
  );
}
