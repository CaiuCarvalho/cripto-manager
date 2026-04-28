'use client';

import type { Range } from '@/lib/mock-data';

const RANGES: Range[] = ['1D', '1S', '1M', '3M', '1A', 'Tudo'];

interface RangeTabsProps {
  value: Range;
  onChange: (r: Range) => void;
}

export function RangeTabs({ value, onChange }: RangeTabsProps) {
  return (
    <div className="flex gap-0.5">
      {RANGES.map((r) => {
        const active = r === value;
        return (
          <button
            key={r}
            onClick={() => onChange(r)}
            style={{
              padding: '3px 9px',
              borderRadius: 6,
              border: 0,
              fontSize: 11,
              fontFamily: 'var(--font-mono)',
              fontWeight: active ? 600 : 400,
              cursor: 'pointer',
              background: active ? 'var(--surface-2)' : 'transparent',
              color: active ? 'var(--fg)' : 'var(--fg-mute)',
              transition: 'background 0.1s, color 0.1s',
            }}
          >
            {r}
          </button>
        );
      })}
    </div>
  );
}
