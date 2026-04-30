import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { AllocationDonut } from '@/components/ui/allocation-donut';

const SLICES = [
  { color: '#f2a23a', value: 30000, symbol: 'BTC' },
  { color: '#7b8aff', value: 20000, symbol: 'ETH' },
  { color: '#9b6bd6', value: 10000, symbol: 'SOL' },
];

describe('AllocationDonut', () => {
  it('renderiza um SVG', () => {
    const { container } = render(<AllocationDonut slices={SLICES} />);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('renderiza um circle por fatia mais o círculo de fundo', () => {
    const { container } = render(<AllocationDonut slices={SLICES} />);
    const circles = container.querySelectorAll('circle');
    expect(circles.length).toBe(SLICES.length + 1);
  });

  it('exibe totalLabel quando fornecido', () => {
    const { getByText } = render(
      <AllocationDonut slices={SLICES} totalLabel="R$ 60k" />
    );
    expect(getByText('R$ 60k')).toBeInTheDocument();
  });

  it('exibe texto TOTAL', () => {
    const { getByText } = render(<AllocationDonut slices={SLICES} />);
    expect(getByText('TOTAL')).toBeInTheDocument();
  });

  it('tamanho padrão é 140x140', () => {
    const { container } = render(<AllocationDonut slices={SLICES} />);
    const svg = container.querySelector('svg')!;
    expect(svg.getAttribute('width')).toBe('140');
    expect(svg.getAttribute('height')).toBe('140');
  });
});
