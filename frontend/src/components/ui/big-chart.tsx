'use client';

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  type TooltipProps,
} from 'recharts';

interface BigChartProps {
  data: number[];
  height?: number;
}

interface ChartPoint {
  index: number;
  value: number;
}

function CustomTooltip({ active, payload }: TooltipProps<number, string>) {
  if (!active || !payload?.length) return null;
  const val: number = payload[0].value as number;
  return (
    <div
      style={{
        padding: '8px 10px',
        background: 'var(--surface-elev)',
        border: '1px solid var(--border)',
        borderRadius: 8,
        fontSize: 11,
        fontFamily: 'var(--font-mono)',
        color: 'var(--fg)',
        boxShadow: 'var(--shadow-sm)',
        minWidth: 120,
        pointerEvents: 'none',
      }}
    >
      <div style={{ color: 'var(--fg-mute)', fontSize: 10, marginBottom: 2 }}>
        Ponto {(payload[0].payload as ChartPoint).index + 1}
      </div>
      <div style={{ fontWeight: 600 }}>
        {val.toLocaleString('pt-BR', { maximumFractionDigits: 2 })}
      </div>
    </div>
  );
}

export function BigChart({ data, height = 260 }: BigChartProps) {
  const chartData: ChartPoint[] = data.map((value, index) => ({ index, value }));
  const up = data.length >= 2 && data[data.length - 1] >= data[0];
  const color = up ? 'var(--up-fg)' : 'var(--down-fg)';
  const gradientId = `chartFill-${up ? 'up' : 'down'}`;

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={chartData} margin={{ top: 18, right: 8, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.18} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid
          strokeDasharray="2 4"
          stroke="var(--border-soft)"
          vertical={false}
        />
        <XAxis dataKey="index" hide />
        <YAxis
          orientation="right"
          axisLine={false}
          tickLine={false}
          tick={{ fill: 'var(--fg-mute)', fontSize: 10, fontFamily: 'var(--font-mono)' }}
          tickFormatter={(v: number) => v.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
          width={72}
          tickCount={5}
        />
        <Tooltip
          content={<CustomTooltip />}
          cursor={{ stroke: 'var(--border)', strokeWidth: 1 }}
        />
        <Area
          type="monotone"
          dataKey="value"
          stroke={color}
          strokeWidth={1.75}
          fill={`url(#${gradientId})`}
          dot={false}
          activeDot={{ r: 5, fill: color, stroke: 'var(--bg)', strokeWidth: 2 }}
          strokeLinecap="round"
          strokeLinejoin="round"
          isAnimationActive={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
