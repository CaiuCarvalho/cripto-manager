'use client';

import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';

const NETWORKS = ['ETH', 'BTC', 'SOL', 'BSC', 'MATIC', 'AVAX', 'ARB', 'OP'];

const NETWORK_COLORS: Record<string, string> = {
  ETH: '#627EEA', BTC: '#F7931A', SOL: '#9945FF',
  BSC: '#F0B90B', MATIC: '#8247E5', AVAX: '#E84142',
  ARB: '#28A0F0', OP: '#FF0420',
};

interface PrivateKeyMeta {
  id: string;
  label: string;
  network: string;
  wallet_id: string | null;
  enc_version: number;
  last_accessed_at: string | null;
  created_at: string;
}

function fmtDate(iso: string | null) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function NetworkTag({ network }: { network: string }) {
  const color = NETWORK_COLORS[network] ?? '#888';
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      padding: '2px 8px', borderRadius: 999,
      fontSize: 11, fontWeight: 600, fontFamily: 'var(--font-mono)',
      background: `${color}22`, color, letterSpacing: '0.04em',
    }}>
      {network}
    </span>
  );
}

function Modal({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <>
      <div
        onClick={onClose}
        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 50 }}
      />
      <div style={{
        position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
        zIndex: 51, background: 'var(--surface)', border: '1px solid var(--border-soft)',
        borderRadius: 14, padding: 28, width: 440, maxWidth: 'calc(100vw - 40px)',
        boxShadow: '0 24px 60px rgba(0,0,0,0.35)',
      }}>
        {children}
      </div>
    </>
  );
}

function ModalHeader({ title, subtitle, onClose }: { title: string; subtitle?: string; onClose: () => void }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 22 }}>
      <div>
        <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--fg)' }}>{title}</div>
        {subtitle && <div style={{ fontSize: 12, color: 'var(--fg-mute)', marginTop: 3 }}>{subtitle}</div>}
      </div>
      <button onClick={onClose} style={{ background: 'none', border: 0, cursor: 'pointer', color: 'var(--fg-mute)', padding: 4, display: 'flex', marginTop: -2 }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M18 6L6 18M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%', height: 36, borderRadius: 8, border: '1px solid var(--border-soft)',
  background: 'var(--surface-2)', color: 'var(--fg)', fontSize: 13,
  padding: '0 12px', outline: 'none', boxSizing: 'border-box',
  fontFamily: 'var(--font-sans)',
};

const fieldLabel: React.CSSProperties = {
  display: 'block', fontSize: 11, color: 'var(--fg-mute)',
  textTransform: 'uppercase', letterSpacing: '0.06em',
  marginBottom: 6, marginTop: 14,
};

function AddKeyModal({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [label, setLabel] = useState('');
  const [network, setNetwork] = useState('ETH');
  const [privateKey, setPrivateKey] = useState('');
  const [walletId, setWalletId] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!label.trim() || !privateKey.trim()) {
      setErr('Preencha os campos obrigatórios.');
      return;
    }
    setSaving(true);
    setErr('');
    try {
      await api.post('/api/private-keys', {
        label: label.trim(),
        network,
        privateKey: privateKey.trim(),
        wallet_id: walletId.trim() || undefined,
      });
      onSaved();
      onClose();
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setErr(msg ?? 'Erro ao salvar. Tente novamente.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal onClose={onClose}>
      <ModalHeader
        title="Adicionar chave privada"
        subtitle="Será cifrada com AES-256-GCM antes de ser persistida."
        onClose={onClose}
      />
      <form onSubmit={handleSubmit}>
        <label style={fieldLabel}>
          Rótulo <span style={{ color: 'var(--down-fg)' }}>*</span>
        </label>
        <input
          style={inputStyle}
          value={label}
          onChange={e => setLabel(e.target.value)}
          placeholder="Ex: Carteira principal ETH"
          autoFocus
        />

        <label style={fieldLabel}>
          Rede <span style={{ color: 'var(--down-fg)' }}>*</span>
        </label>
        <select
          value={network}
          onChange={e => setNetwork(e.target.value)}
          style={{ ...inputStyle, cursor: 'pointer' }}
        >
          {NETWORKS.map(n => <option key={n} value={n}>{n}</option>)}
        </select>

        <label style={fieldLabel}>
          Chave privada <span style={{ color: 'var(--down-fg)' }}>*</span>
        </label>
        <div style={{ position: 'relative' }}>
          <input
            type={showKey ? 'text' : 'password'}
            style={{
              ...inputStyle, paddingRight: 40,
              fontFamily: showKey ? 'var(--font-mono)' : 'var(--font-sans)',
              fontSize: showKey ? 11 : 13,
            }}
            value={privateKey}
            onChange={e => setPrivateKey(e.target.value)}
            placeholder="0x… ou chave em hex"
            autoComplete="off"
          />
          <button
            type="button"
            onClick={() => setShowKey(v => !v)}
            style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 0, cursor: 'pointer', color: 'var(--fg-mute)', padding: 2, display: 'flex' }}
          >
            {showKey
              ? <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3l18 18" /><path d="M10.6 6.1a10 10 0 0 1 10.4 5.9" /><path d="M6.6 6.6A12 12 0 0 0 3 12s4 7 9 7a9 9 0 0 0 4-1" /></svg>
              : <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z" /><circle cx="12" cy="12" r="3" /></svg>
            }
          </button>
        </div>

        <label style={fieldLabel}>
          ID da carteira{' '}
          <span style={{ color: 'var(--fg-mute)', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>
            (opcional)
          </span>
        </label>
        <input
          style={inputStyle}
          value={walletId}
          onChange={e => setWalletId(e.target.value)}
          placeholder="UUID da carteira vinculada"
        />

        {err && (
          <div style={{ marginTop: 12, padding: '8px 12px', borderRadius: 7, background: 'var(--down-bg)', color: 'var(--down-fg)', fontSize: 12 }}>
            {err}
          </div>
        )}

        <div style={{ display: 'flex', gap: 10, marginTop: 22 }}>
          <button
            type="button" onClick={onClose}
            style={{ flex: 1, height: 36, borderRadius: 8, border: '1px solid var(--border-soft)', background: 'transparent', color: 'var(--fg-soft)', fontSize: 13, cursor: 'pointer', fontFamily: 'var(--font-sans)' }}
          >
            Cancelar
          </button>
          <button
            type="submit" disabled={saving}
            style={{ flex: 2, height: 36, borderRadius: 8, border: 0, background: 'var(--fg)', color: 'var(--bg)', fontSize: 13, fontWeight: 500, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.6 : 1, fontFamily: 'var(--font-sans)' }}
          >
            {saving ? 'Salvando…' : 'Salvar com criptografia'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function RevealModal({ id, label, network, onClose }: { id: string; label: string; network: string; onClose: () => void }) {
  const [value, setValue] = useState<string | null>(null);
  const [masked, setMasked] = useState(true);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    api.get<{ privateKey: string }>(`/api/private-keys/${id}`)
      .then(r => setValue(r.data.privateKey))
      .catch(e => {
        const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message;
        setErr(msg ?? 'Erro ao descriptografar.');
      })
      .finally(() => setLoading(false));
  }, [id]);

  function handleCopy() {
    if (!value) return;
    navigator.clipboard.writeText(value).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <Modal onClose={onClose}>
      <ModalHeader title={label} onClose={onClose} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: -14, marginBottom: 18 }}>
        <NetworkTag network={network} />
        <span style={{ fontSize: 11, color: 'var(--fg-mute)' }}>Chave privada</span>
      </div>

      {loading && (
        <div style={{ padding: '24px 0', textAlign: 'center', color: 'var(--fg-mute)', fontSize: 13 }}>
          Descriptografando…
        </div>
      )}

      {err && (
        <div style={{ padding: '8px 12px', borderRadius: 7, background: 'var(--down-bg)', color: 'var(--down-fg)', fontSize: 12 }}>
          {err}
        </div>
      )}

      {!loading && value && (
        <>
          <div style={{
            background: 'var(--surface-2)', border: '1px solid var(--border-soft)',
            borderRadius: 8, padding: '12px 14px',
            fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--fg)',
            wordBreak: 'break-all', lineHeight: 1.6,
            userSelect: masked ? 'none' : 'text',
            filter: masked ? 'blur(5px)' : 'none',
            transition: 'filter 0.2s',
            minHeight: 48,
          }}>
            {value}
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
            <button
              onClick={() => setMasked(v => !v)}
              style={{ flex: 1, height: 34, borderRadius: 8, border: '1px solid var(--border-soft)', background: 'transparent', color: 'var(--fg-soft)', fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontFamily: 'var(--font-sans)' }}
            >
              {masked
                ? <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z" /><circle cx="12" cy="12" r="3" /></svg> Mostrar</>
                : <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3l18 18" /><path d="M10.6 6.1a10 10 0 0 1 10.4 5.9" /><path d="M6.6 6.6A12 12 0 0 0 3 12s4 7 9 7a9 9 0 0 0 4-1" /></svg> Ocultar</>
              }
            </button>
            <button
              onClick={handleCopy}
              style={{ flex: 1, height: 34, borderRadius: 8, border: 0, background: copied ? 'var(--up-bg)' : 'var(--fg)', color: copied ? 'var(--up-fg)' : 'var(--bg)', fontSize: 12, fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, transition: 'background 0.15s, color 0.15s', fontFamily: 'var(--font-sans)' }}
            >
              {copied
                ? <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg> Copiado!</>
                : <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" /></svg> Copiar</>
              }
            </button>
          </div>

          <div style={{ marginTop: 12, padding: '9px 12px', borderRadius: 7, background: 'var(--surface-2)', border: '1px solid var(--border-soft)', display: 'flex', gap: 8, alignItems: 'flex-start' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--fg-mute)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 1 }}>
              <circle cx="12" cy="12" r="10" /><path d="M12 16v-4M12 8h.01" />
            </svg>
            <span style={{ fontSize: 11, color: 'var(--fg-mute)', lineHeight: 1.5 }}>
              Feche esta janela após copiar. Nunca compartilhe sua chave privada com ninguém.
            </span>
          </div>
        </>
      )}
    </Modal>
  );
}

export default function PrivateKeysPage() {
  const [keys, setKeys] = useState<PrivateKeyMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [reveal, setReveal] = useState<{ id: string; label: string; network: string } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; label: string } | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchKeys = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get<PrivateKeyMeta[]>('/api/private-keys');
      setKeys(data);
    } catch {
      setError('Não foi possível carregar as chaves.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchKeys(); }, [fetchKeys]);

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/api/private-keys/${deleteTarget.id}`);
      setDeleteTarget(null);
      fetchKeys();
    } catch {
      // keep modal open on error
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div style={{ padding: '24px 32px 64px' }}>

      {/* Page actions header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--fg)' }}>
            Chaves armazenadas
            {!loading && keys.length > 0 && (
              <span style={{ marginLeft: 8, fontSize: 12, fontWeight: 400, color: 'var(--fg-mute)' }}>
                ({keys.length})
              </span>
            )}
          </div>
          <div style={{ fontSize: 12, color: 'var(--fg-mute)', marginTop: 2 }}>
            Cifradas com AES-256-GCM · nonce único por operação
          </div>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          style={{ height: 34, padding: '0 14px', borderRadius: 8, border: 0, background: 'var(--fg)', color: 'var(--bg)', fontSize: 13, fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 7, fontFamily: 'var(--font-sans)' }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M12 5v14M5 12h14" />
          </svg>
          Adicionar chave
        </button>
      </div>

      {/* Security notice */}
      <div style={{
        background: 'var(--surface)', border: '1px solid var(--border-soft)',
        borderRadius: 10, padding: '12px 16px', marginBottom: 20,
        display: 'flex', gap: 12, alignItems: 'flex-start',
      }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 1 }}>
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
        <div>
          <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--fg)', marginBottom: 2 }}>
            Armazenamento seguro
          </div>
          <div style={{ fontSize: 11, color: 'var(--fg-mute)', lineHeight: 1.55 }}>
            Cada chave é cifrada individualmente com AES-256-GCM usando um nonce aleatório antes de ser
            persistida. O banco de dados nunca contém texto plano. A chave mestra de criptografia existe
            apenas no servidor.
          </div>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border-soft)', borderRadius: 12, padding: '48px 32px', textAlign: 'center' }}>
          <div style={{ fontSize: 13, color: 'var(--fg-mute)' }}>Carregando…</div>
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border-soft)', borderRadius: 12, padding: '36px 32px', textAlign: 'center' }}>
          <div style={{ fontSize: 13, color: 'var(--down-fg)', marginBottom: 12 }}>{error}</div>
          <button
            onClick={fetchKeys}
            style={{ padding: '6px 16px', borderRadius: 7, border: '1px solid var(--border-soft)', background: 'transparent', color: 'var(--fg-soft)', fontSize: 12, cursor: 'pointer', fontFamily: 'var(--font-sans)' }}
          >
            Tentar novamente
          </button>
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && keys.length === 0 && (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border-soft)', borderRadius: 12, padding: '56px 32px', textAlign: 'center' }}>
          <div style={{ width: 48, height: 48, borderRadius: 14, background: 'var(--surface-2)', border: '1px solid var(--border-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--fg-mute)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
          <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--fg)' }}>Nenhuma chave armazenada</div>
          <div style={{ fontSize: 13, color: 'var(--fg-mute)', marginTop: 6, marginBottom: 22 }}>
            Adicione sua primeira chave privada com segurança máxima.
          </div>
          <button
            onClick={() => setShowAdd(true)}
            style={{ padding: '8px 18px', borderRadius: 8, border: 0, background: 'var(--fg)', color: 'var(--bg)', fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'var(--font-sans)' }}
          >
            Adicionar chave privada
          </button>
        </div>
      )}

      {/* Keys table */}
      {!loading && !error && keys.length > 0 && (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border-soft)', borderRadius: 12, overflow: 'hidden' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 90px 160px 160px 130px', padding: '10px 22px', borderBottom: '1px solid var(--border-soft)' }}>
            {['Rótulo', 'Rede', 'Criada em', 'Último acesso', 'Ações'].map(h => (
              <div key={h} style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--fg-mute)' }}>
                {h}
              </div>
            ))}
          </div>

          {keys.map((k, i) => (
            <div
              key={k.id}
              style={{
                display: 'grid', gridTemplateColumns: '1fr 90px 160px 160px 130px',
                padding: '0 22px', height: 52, alignItems: 'center',
                borderTop: i === 0 ? 'none' : '1px solid var(--border-soft)',
                transition: 'background 0.1s',
              }}
              onMouseEnter={ev => (ev.currentTarget.style.background = 'var(--surface-2)')}
              onMouseLeave={ev => (ev.currentTarget.style.background = 'transparent')}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                <div style={{ width: 28, height: 28, borderRadius: 7, background: 'var(--surface-2)', border: '1px solid var(--border-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--fg-mute)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </div>
                <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--fg)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {k.label}
                </span>
              </div>

              <NetworkTag network={k.network} />

              <span style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--fg-mute)' }}>
                {fmtDate(k.created_at)}
              </span>

              <span style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--fg-mute)' }}>
                {fmtDate(k.last_accessed_at)}
              </span>

              <div style={{ display: 'flex', gap: 6 }}>
                <button
                  onClick={() => setReveal({ id: k.id, label: k.label, network: k.network })}
                  style={{ height: 28, padding: '0 10px', borderRadius: 6, border: '1px solid var(--border-soft)', background: 'transparent', color: 'var(--fg-soft)', fontSize: 11, cursor: 'pointer', fontFamily: 'var(--font-sans)', display: 'flex', alignItems: 'center', gap: 5 }}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z" /><circle cx="12" cy="12" r="3" />
                  </svg>
                  Revelar
                </button>
                <button
                  onClick={() => setDeleteTarget({ id: k.id, label: k.label })}
                  style={{ height: 28, width: 28, borderRadius: 6, border: '1px solid var(--border-soft)', background: 'transparent', color: 'var(--down-fg)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
                    <path d="M10 11v6M14 11v6" /><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      {showAdd && (
        <AddKeyModal onClose={() => setShowAdd(false)} onSaved={fetchKeys} />
      )}
      {reveal && (
        <RevealModal
          id={reveal.id}
          label={reveal.label}
          network={reveal.network}
          onClose={() => setReveal(null)}
        />
      )}
      {deleteTarget && (
        <Modal onClose={() => { if (!deleting) setDeleteTarget(null); }}>
          <div style={{ textAlign: 'center', padding: '8px 0' }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--down-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--down-fg)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
                <path d="M10 11v6M14 11v6" /><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
              </svg>
            </div>
            <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--fg)', marginBottom: 6 }}>
              Excluir chave privada?
            </div>
            <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--fg)', marginBottom: 4 }}>
              {deleteTarget.label}
            </div>
            <div style={{ fontSize: 12, color: 'var(--fg-mute)', marginBottom: 24, lineHeight: 1.5 }}>
              Esta ação é irreversível. A chave será removida permanentemente.
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
                style={{ flex: 1, height: 36, borderRadius: 8, border: '1px solid var(--border-soft)', background: 'transparent', color: 'var(--fg-soft)', fontSize: 13, cursor: 'pointer', fontFamily: 'var(--font-sans)' }}
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                style={{ flex: 1, height: 36, borderRadius: 8, border: 0, background: 'var(--down-fg)', color: '#fff', fontSize: 13, fontWeight: 500, cursor: deleting ? 'not-allowed' : 'pointer', opacity: deleting ? 0.6 : 1, fontFamily: 'var(--font-sans)' }}
              >
                {deleting ? 'Excluindo…' : 'Excluir'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
