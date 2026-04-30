// frontend/src/lib/formatters.ts

export function fmtBRL(n: number, opts: { hide?: boolean; decimals?: number } = {}): string {
  const { hide = false, decimals = 2 } = opts;
  if (hide) return 'R$ •••••';
  return n.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export function fmtPct(n: number): string {
  return (n >= 0 ? '+' : '') + n.toFixed(2) + '%';
}

export function fmtAmount(n: number, decimals = 4): string {
  return n.toLocaleString('pt-BR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  });
}

export function fmtDate(iso: string): string {
  const d = new Date(iso);
  return (
    d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }) +
    ' · ' +
    d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  );
}

export function fmtAbrev(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'k';
  return n.toFixed(0);
}

export function fmtRelative(iso: string): string {
  const d = (Date.now() - new Date(iso).getTime()) / 1000;
  if (d < 60) return 'agora';
  if (d < 3600) return Math.floor(d / 60) + ' min atrás';
  if (d < 86400) return Math.floor(d / 3600) + 'h atrás';
  return Math.floor(d / 86400) + 'd atrás';
}

export function shortAddr(a: string): string {
  if (!a) return '—';
  if (a.startsWith('••••')) return a;
  return a.slice(0, 6) + '…' + a.slice(-6);
}
