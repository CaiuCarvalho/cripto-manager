interface DonutSlice {
  color: string;
  value: number;
  symbol: string;
}

interface AllocationDonutProps {
  slices: DonutSlice[];
  size?: number;
  totalLabel?: string;
}

export function AllocationDonut({ slices, size = 140, totalLabel = '' }: AllocationDonutProps) {
  const total = slices.reduce((a, s) => a + s.value, 0);
  const r = size / 2 - 10;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * r;
  let offset = 0;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle
        cx={cx} cy={cy} r={r}
        fill="none"
        stroke="var(--surface-2)"
        strokeWidth="14"
      />
      {slices.map((s, i) => {
        const len = (s.value / total) * circumference;
        const dash = `${len} ${circumference - len}`;
        const el = (
          <circle
            key={i}
            cx={cx} cy={cy} r={r}
            fill="none"
            stroke={s.color}
            strokeWidth="14"
            strokeLinecap="butt"
            strokeDasharray={dash}
            strokeDashoffset={-offset}
            transform={`rotate(-90 ${cx} ${cy})`}
          />
        );
        offset += len;
        return el;
      })}
      <text
        x={cx} y={cy - 6}
        textAnchor="middle"
        fill="var(--fg-mute)"
        fontSize="9"
        fontFamily="var(--font-mono)"
        letterSpacing="0.06em"
      >
        TOTAL
      </text>
      <text
        x={cx} y={cy + 8}
        textAnchor="middle"
        fill="var(--fg)"
        fontSize="13"
        fontWeight="600"
        fontFamily="var(--font-mono)"
      >
        {totalLabel}
      </text>
    </svg>
  );
}
