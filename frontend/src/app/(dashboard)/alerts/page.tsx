'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';

interface Alert {
  id: string;
  symbol: string;
  target_price: number;
  direction: 'ABOVE' | 'BELOW';
  status: 'ACTIVE' | 'TRIGGERED';
}

const SYMBOLS = ['BTC', 'ETH', 'SOL', 'BNB', 'MATIC', 'AVAX', 'ARB', 'OP', 'LINK', 'UNI'];

function formatUSD(v: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(v);
}

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ symbol: 'BTC', target_price: '', direction: 'ABOVE' as 'ABOVE' | 'BELOW' });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  async function fetchAlerts() {
    try {
      const res = await api.get<Alert[]>('/api/alerts');
      setAlerts(res.data);
    } catch {
      setError('Não foi possível carregar os alertas.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchAlerts();
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    const price = parseFloat(form.target_price);
    if (isNaN(price) || price <= 0) {
      setFormError('Insira um preço alvo válido.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await api.post<Alert>('/api/alerts', {
        symbol: form.symbol,
        target_price: price,
        direction: form.direction,
      });
      setAlerts((prev) => [res.data, ...prev]);
      setForm({ symbol: 'BTC', target_price: '', direction: 'ABOVE' });
    } catch {
      setFormError('Erro ao criar alerta. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm('Tem certeza que deseja remover este alerta?')) return;
    try {
      await api.delete(`/api/alerts/${id}`);
      setAlerts((prev) => prev.filter((a) => a.id !== id));
    } catch {
      alert('Erro ao remover alerta.');
    }
  }

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        <h2 className="text-2xl font-bold text-white">Alertas</h2>
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-gray-900 border border-gray-800 rounded-xl p-5 animate-pulse">
            <div className="h-5 bg-gray-800 rounded w-1/3 mb-2" />
            <div className="h-4 bg-gray-800 rounded w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-900/30 border border-red-700 rounded-xl p-6 text-center">
          <p className="text-red-400 font-medium">{error}</p>
          <button
            onClick={() => { setError(null); setLoading(true); fetchAlerts(); }}
            className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm transition"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold text-white">Alertas de Preço</h2>

      {/* Create alert form */}
      <form
        onSubmit={handleCreate}
        className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-4"
      >
        <h3 className="text-base font-semibold text-white">Criar Alerta</h3>

        {formError && (
          <div className="p-3 rounded-lg bg-red-900/40 border border-red-700 text-red-400 text-sm">
            {formError}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Símbolo</label>
            <select
              value={form.symbol}
              onChange={(e) => setForm((f) => ({ ...f, symbol: e.target.value }))}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            >
              {SYMBOLS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Preço Alvo (USD)</label>
            <input
              type="number"
              step="any"
              min="0"
              value={form.target_price}
              onChange={(e) => setForm((f) => ({ ...f, target_price: e.target.value }))}
              placeholder="ex: 50000"
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Direção</label>
            <select
              value={form.direction}
              onChange={(e) => setForm((f) => ({ ...f, direction: e.target.value as 'ABOVE' | 'BELOW' }))}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            >
              <option value="ABOVE">Acima</option>
              <option value="BELOW">Abaixo</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={submitting}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition"
          >
            {submitting ? 'Criando...' : 'Criar Alerta'}
          </button>
        </div>
      </form>

      {/* Alerts list */}
      {alerts.length === 0 ? (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 text-center">
          <p className="text-gray-400">Nenhum alerta cadastrado.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className="bg-gray-900 border border-gray-800 rounded-xl p-5 flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-4">
                <span className="text-white font-bold text-lg">{alert.symbol}</span>
                <div>
                  <p className="text-sm text-gray-400">
                    Preço alvo:{' '}
                    <span className="text-white font-medium">{formatUSD(alert.target_price)}</span>
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span
                      className={`text-xs px-2 py-0.5 rounded font-semibold ${
                        alert.direction === 'ABOVE'
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-red-500/20 text-red-400'
                      }`}
                    >
                      {alert.direction === 'ABOVE' ? 'Acima' : 'Abaixo'}
                    </span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded font-semibold ${
                        alert.status === 'ACTIVE'
                          ? 'bg-blue-500/20 text-blue-400'
                          : 'bg-gray-500/20 text-gray-400'
                      }`}
                    >
                      {alert.status === 'ACTIVE' ? 'Ativo' : 'Disparado'}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleDelete(alert.id)}
                className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-medium rounded-lg transition shrink-0"
              >
                Excluir
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
