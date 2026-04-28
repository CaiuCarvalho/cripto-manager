'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';

interface Transaction {
  id: string;
  date: string;
  type: 'SEND' | 'RECEIVE' | 'SWAP';
  token_symbol: string;
  amount: number;
  value_usd: number;
  hash: string;
  explorer_url?: string;
}

const TYPE_STYLES: Record<string, string> = {
  SEND: 'bg-red-500/20 text-red-400',
  RECEIVE: 'bg-green-500/20 text-green-400',
  SWAP: 'bg-blue-500/20 text-blue-400',
};

const PAGE_SIZE = 20;

function truncateHash(hash: string) {
  if (hash.length <= 16) return hash;
  return `${hash.slice(0, 8)}...${hash.slice(-6)}`;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatUSD(v: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(v);
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterType, setFilterType] = useState('');
  const [filterToken, setFilterToken] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    async function fetchTransactions() {
      try {
        const res = await api.get<Transaction[]>('/api/transactions?limit=50');
        setTransactions(res.data);
      } catch {
        setError('Não foi possível carregar as transações.');
      } finally {
        setLoading(false);
      }
    }
    fetchTransactions();
  }, []);

  const filtered = transactions.filter((t) => {
    const typeMatch = filterType === '' || t.type === filterType;
    const tokenMatch =
      filterToken === '' ||
      t.token_symbol.toLowerCase().includes(filterToken.toLowerCase());
    return typeMatch && tokenMatch;
  });

  const paginated = filtered.slice(0, page * PAGE_SIZE);
  const hasMore = paginated.length < filtered.length;

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        <h2 className="text-2xl font-bold text-white">Transações</h2>
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden animate-pulse">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-12 bg-gray-800 border-b border-gray-900 mx-0" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-900/30 border border-red-700 rounded-xl p-6 text-center">
          <p className="text-red-400 font-medium">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm transition"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-5">
      <h2 className="text-2xl font-bold text-white">Transações</h2>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <select
          value={filterType}
          onChange={(e) => { setFilterType(e.target.value); setPage(1); }}
          className="px-3 py-2 bg-gray-900 border border-gray-800 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Todos os tipos</option>
          <option value="SEND">SEND</option>
          <option value="RECEIVE">RECEIVE</option>
          <option value="SWAP">SWAP</option>
        </select>
        <input
          type="text"
          value={filterToken}
          onChange={(e) => { setFilterToken(e.target.value); setPage(1); }}
          placeholder="Filtrar por token..."
          className="px-3 py-2 bg-gray-900 border border-gray-800 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <span className="self-center text-gray-500 text-sm">
          {filtered.length} transaç{filtered.length === 1 ? 'ão' : 'ões'}
        </span>
      </div>

      {/* Table */}
      {paginated.length === 0 ? (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 text-center">
          <p className="text-gray-400">Nenhuma transação encontrada.</p>
        </div>
      ) : (
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800 text-gray-400">
                  <th className="text-left px-5 py-3 font-medium">Data</th>
                  <th className="text-left px-5 py-3 font-medium">Tipo</th>
                  <th className="text-left px-5 py-3 font-medium">Token</th>
                  <th className="text-right px-5 py-3 font-medium">Quantidade</th>
                  <th className="text-right px-5 py-3 font-medium">Valor (USD)</th>
                  <th className="text-left px-5 py-3 font-medium">Hash</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {paginated.map((tx) => (
                  <tr key={tx.id} className="hover:bg-gray-800/50 transition-colors">
                    <td className="px-5 py-3 text-gray-400 whitespace-nowrap">{formatDate(tx.date)}</td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${TYPE_STYLES[tx.type] ?? 'bg-gray-700 text-gray-300'}`}>
                        {tx.type}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-white font-medium">{tx.token_symbol}</td>
                    <td className="px-5 py-3 text-right text-gray-300 font-mono">
                      {tx.amount.toLocaleString('pt-BR', { maximumFractionDigits: 8 })}
                    </td>
                    <td className="px-5 py-3 text-right text-gray-300">{formatUSD(tx.value_usd)}</td>
                    <td className="px-5 py-3">
                      {tx.explorer_url ? (
                        <a
                          href={tx.explorer_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:text-blue-300 font-mono transition"
                        >
                          {truncateHash(tx.hash)}
                        </a>
                      ) : (
                        <span className="text-gray-500 font-mono">{truncateHash(tx.hash)}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {hasMore && (
            <div className="px-5 py-4 border-t border-gray-800 text-center">
              <button
                onClick={() => setPage((p) => p + 1)}
                className="px-5 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm font-medium rounded-lg border border-gray-700 transition"
              >
                Carregar mais
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
