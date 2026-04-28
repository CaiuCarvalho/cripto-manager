interface PillProps {
  value: number;
  size?: 'sm' | 'md';
}

export function Pill({ value, size = 'md' }: PillProps) {
  const up = value >= 0;
  const fs = size === 'sm' ? 11 : 12;
  const padding = size === 'sm' ? '2px 7px' : '3px 9px';
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        padding,
        borderRadius: 999,
        fontFamily: 'var(--font-mono)',
        fontSize: fs,
        fontWeight: 500,
        background: up ? 'var(--up-bg)' : 'var(--down-bg)',
        color: up ? 'var(--up-fg)' : 'var(--down-fg)',
        fontVariantNumeric: 'tabular-nums',
        whiteSpace: 'nowrap',
      }}
    >
      <span style={{ fontSize: fs - 2 }}>{up ? '▲' : '▼'}</span>
      {Math.abs(value).toFixed(2)}%
    </span>
  );
}
