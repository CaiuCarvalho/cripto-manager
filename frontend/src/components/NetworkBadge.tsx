const COLORS: Record<string, string> = {
  ETH: 'bg-blue-600',
  BTC: 'bg-orange-500',
  SOL: 'bg-purple-600',
  BSC: 'bg-yellow-500',
  MATIC: 'bg-violet-600',
  AVAX: 'bg-red-500',
  ARB: 'bg-blue-400',
  OP: 'bg-red-400',
};

interface NetworkBadgeProps {
  network: string;
  className?: string;
}

export default function NetworkBadge({ network, className = '' }: NetworkBadgeProps) {
  const colorClass = COLORS[network.toUpperCase()] ?? 'bg-gray-600';
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold text-white ${colorClass} ${className}`}
    >
      {network.toUpperCase()}
    </span>
  );
}
