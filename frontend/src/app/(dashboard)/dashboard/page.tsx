'use client';

import { useEffect, useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import api from '@/lib/api';

interface Asset {
  symbol: string;
  name: string;
  amount: number;
  value_usd: number;
  price_change_24h: number;
}

interface Summary {
  total_usd: number;
  total_brl: number;
  wallet_count: number;
  assets: Asset[];
}

interface HistoryPoint {
  date: string;
  total_usd: number;
}

function SkeletonCard() {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 animate-pulse">
      <div className="h-4 bg-gray-800 rounded w-1/3 mb-3" />
      <div className="h-8 bg-gray-800 rounded w-2/3" />
    </div>
  );
}

function formatUSD(value: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
}

function formatBRL(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
}

export default function DashboardPage() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [history, setHistory] = useState<HistoryPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const [summaryRes, historyRes] = await Promise.all([
          api.get<Summary>('/api/portfolio/summary'),
          api.get<HistoryPoint[]>('/api/portfolio/history?days=30'),
        ]);
        setSummary(summaryRes.data);
        setHistory(historyRes.data);
      } catch {
        setError('Não foi possível carregar os dados do portfolio. Tente novamente.');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <h2 className="text-2xl font-bold text-white">Dashboard</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 h-64 animate-pulse">
          <div className="h-full bg-gray-800 rounded" />
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-3 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-10 bg-gray-800 rounded" />
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

  const chartData = history.map((h) => ({
    date: formatDate(h.date),
    total: h.total_usd,
  }));

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold text-white">Dashboard</h2>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <p className="text-sm text-gray-400 mb-1">Total (USD)</p>
          <p className="text-2xl font-bold text-white">{formatUSD(summary?.total_usd ?? 0)}</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <p className="text-sm text-gray-400 mb-1">Total (BRL)</p>
          <p className="text-2xl font-bold text-white">{formatBRL(summary?.total_brl ?? 0)}</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <p className="text-sm text-gray-400 mb-1">Carteiras</p>
          <p className="text-2xl font-bold text-white">{summary?.wallet_count ?? 0}</p>
        </div>
      </div>

      {/* Portfolio chart */}
      {chartData.length > 0 && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h3 className="text-base font-semibold text-white mb-4">Evolução dos últimos 30 dias</h3>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis
                dataKey="date"
                tick={{ fill: '#9CA3AF', fontSize: 12 }}
                axisLine={{ stroke: '#374151' }}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: '#9CA3AF', fontSize: 12 }}
                axisLine={{ stroke: '#374151' }}
                tickLine={false}
                tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
              />
              <Tooltip
                contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '8px' }}
                labelStyle={{ color: '#F9FAFB' }}
                itemStyle={{ color: '#60A5FA' }}
                formatter={(value: number) => [formatUSD(value), 'Total']}
              />
              <Line
                type="monotone"
                dataKey="total"
                stroke="#3B82F6"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: '#3B82F6' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Assets list */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-800">
          <h3 className="text-base font-semibold text-white">Ativos</h3>
        </div>
        {(summary?.assets ?? []).length === 0 ? (
          <p className="p-5 text-gray-400 text-sm">Nenhum ativo encontrado.</p>
        ) : (
          <div className="divide-y divide-gray-800">
            {(summary?.assets ?? []).map((asset) => (
              <div key={asset.symbol} className="flex items-center justify-between px-5 py-3">
                <div>
                  <span className="text-white font-semibold">{asset.symbol}</span>
                  <span className="text-gray-400 text-sm ml-2">{asset.name}</span>
                </div>
                <div className="text-right">
                  <p className="text-white text-sm">{formatUSD(asset.value_usd)}</p>
                  <p className="text-xs text-gray-500">{asset.amount.toLocaleString('pt-BR', { maximumFractionDigits: 6 })}</p>
                </div>
                <div className="ml-6 min-w-[70px] text-right">
                  <span
                    className={`text-sm font-medium ${
                      asset.price_change_24h >= 0 ? 'text-green-400' : 'text-red-400'
                    }`}
                  >
                    {asset.price_change_24h >= 0 ? '+' : ''}
                    {asset.price_change_24h.toFixed(2)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
