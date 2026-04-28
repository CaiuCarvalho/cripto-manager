'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import NetworkBadge from '@/components/NetworkBadge';

interface Wallet {
  id: string;
  name: string;
  address: string;
  network: string;
}

const NETWORKS = ['ETH', 'BTC', 'SOL', 'BSC', 'MATIC', 'AVAX', 'ARB', 'OP'];

function truncateAddress(addr: string) {
  if (addr.length <= 16) return addr;
  return `${addr.slice(0, 8)}...${addr.slice(-6)}`;
}

export default function WalletsPage() {
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [syncing, setSyncing] = useState<Record<string, boolean>>({});
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', address: '', network: 'ETH' });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  async function fetchWallets() {
    try {
      const res = await api.get<Wallet[]>('/api/wallets');
      setWallets(res.data);
    } catch {
      setError('Não foi possível carregar as carteiras.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchWallets();
  }, []);

  async function handleSync(id: string) {
    setSyncing((prev) => ({ ...prev, [id]: true }));
    try {
      await api.post(`/api/sync/wallet/${id}`);
    } catch {
      alert('Erro ao sincronizar a carteira. Tente novamente.');
    } finally {
      setSyncing((prev) => ({ ...prev, [id]: false }));
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm('Tem certeza que deseja remover esta carteira?')) return;
    try {
      await api.delete(`/api/wallets/${id}`);
      setWallets((prev) => prev.filter((w) => w.id !== id));
    } catch {
      alert('Erro ao remover a carteira.');
    }
  }

  async function handleAddWallet(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    if (!form.name.trim() || !form.address.trim()) {
      setFormError('Nome e endereço são obrigatórios.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await api.post<Wallet>('/api/wallets', form);
      setWallets((prev) => [...prev, res.data]);
      setForm({ name: '', address: '', network: 'ETH' });
      setShowForm(false);
    } catch {
      setFormError('Erro ao adicionar carteira. Verifique os dados e tente novamente.');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">Carteiras</h2>
        </div>
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-gray-900 border border-gray-800 rounded-xl p-5 animate-pulse">
            <div className="h-5 bg-gray-800 rounded w-1/4 mb-2" />
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
            onClick={() => { setError(null); setLoading(true); fetchWallets(); }}
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
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Carteiras</h2>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition"
        >
          {showForm ? 'Cancelar' : '+ Adicionar Carteira'}
        </button>
      </div>

      {/* Add wallet form */}
      {showForm && (
        <form
          onSubmit={handleAddWallet}
          className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-4"
        >
          <h3 className="text-base font-semibold text-white">Nova Carteira</h3>

          {formError && (
            <div className="p-3 rounded-lg bg-red-900/40 border border-red-700 text-red-400 text-sm">
              {formError}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Nome</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="Minha carteira ETH"
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Rede</label>
              <select
                value={form.network}
                onChange={(e) => setForm((f) => ({ ...f, network: e.target.value }))}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              >
                {NETWORKS.map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Endereço</label>
            <input
              type="text"
              value={form.address}
              onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
              placeholder="0x..."
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-mono"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition"
            >
              {submitting ? 'Adicionando...' : 'Adicionar'}
            </button>
          </div>
        </form>
      )}

      {/* Wallets list */}
      {wallets.length === 0 ? (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 text-center">
          <p className="text-gray-400">Nenhuma carteira cadastrada.</p>
          <button
            onClick={() => setShowForm(true)}
            className="mt-3 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition"
          >
            Adicionar primeira carteira
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {wallets.map((wallet) => (
            <div
              key={wallet.id}
              className="bg-gray-900 border border-gray-800 rounded-xl p-5 flex items-center justify-between gap-4"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-white font-semibold truncate">{wallet.name}</span>
                  <NetworkBadge network={wallet.network} />
                </div>
                <p className="text-gray-400 text-sm font-mono">{truncateAddress(wallet.address)}</p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => handleSync(wallet.id)}
                  disabled={syncing[wallet.id]}
                  className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 disabled:opacity-60 disabled:cursor-not-allowed text-gray-300 text-xs font-medium rounded-lg border border-gray-700 transition"
                >
                  {syncing[wallet.id] ? 'Sincronizando...' : 'Sincronizar'}
                </button>
                <button
                  onClick={() => handleDelete(wallet.id)}
                  className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-medium rounded-lg transition"
                >
                  Excluir
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
