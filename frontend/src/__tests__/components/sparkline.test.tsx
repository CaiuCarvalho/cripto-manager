import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { Sparkline } from '@/components/ui/sparkline';

describe('Sparkline', () => {
  it('renderiza SVG com dados válidos', () => {
    const { container } = render(<Sparkline data={[1, 2, 3, 4, 5]} />);
    expect(container.querySelector('svg')).toBeInTheDocument();
    expect(container.querySelector('path')).toBeInTheDocument();
  });

  it('retorna null com menos de 2 pontos', () => {
    const { container } = render(<Sparkline data={[42]} />);
    expect(container.firstChild).toBeNull();
  });

  it('retorna null com array vazio', () => {
    const { container } = render(<Sparkline data={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it('respeita width e height customizados', () => {
    const { container } = render(<Sparkline data={[1, 2, 3]} width={100} height={40} />);
    const svg = container.querySelector('svg')!;
    expect(svg.getAttribute('width')).toBe('100');
    expect(svg.getAttribute('height')).toBe('40');
  });

  it('path tem atributo d definido', () => {
    const { container } = render(<Sparkline data={[10, 20, 15, 25]} />);
    const path = container.querySelector('path')!;
    expect(path.getAttribute('d')).toBeTruthy();
    expect(path.getAttribute('d')).toContain('M');
  });
});
