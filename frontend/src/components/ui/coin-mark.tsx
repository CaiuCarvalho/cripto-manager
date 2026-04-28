interface CoinMarkProps {
  symbol: string;
  color: string;
  size?: number;
}

export function CoinMark({ symbol, color, size = 28 }: CoinMarkProps) {
  const initials = symbol.slice(0, 2);
  const fontSize = Math.round(size * 0.36);
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: color,
        color: '#fff',
        flexShrink: 0,
        fontSize,
        fontWeight: 600,
        letterSpacing: '0.02em',
        fontFamily: 'var(--font-mono)',
      }}
      className="inline-flex items-center justify-center"
    >
      {initials}
    </div>
  );
}
