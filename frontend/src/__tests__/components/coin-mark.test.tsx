import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CoinMark } from '@/components/ui/coin-mark';

describe('CoinMark', () => {
  it('exibe as duas primeiras letras do símbolo', () => {
    render(<CoinMark symbol="BTC" color="#f2a23a" />);
    expect(screen.getByText('BT')).toBeInTheDocument();
  });

  it('funciona com símbolo de 2 letras', () => {
    render(<CoinMark symbol="ET" color="#7b8aff" />);
    expect(screen.getByText('ET')).toBeInTheDocument();
  });

  it('aplica a cor de fundo', () => {
    const { container } = render(<CoinMark symbol="SOL" color="#9b6bd6" />);
    const el = container.firstChild as HTMLElement;
    expect(el.style.background).toBe('rgb(155, 107, 214)');
  });

  it('tamanho padrão é 28px', () => {
    const { container } = render(<CoinMark symbol="BTC" color="#f2a23a" />);
    const el = container.firstChild as HTMLElement;
    expect(el.style.width).toBe('28px');
    expect(el.style.height).toBe('28px');
  });

  it('respeita tamanho customizado', () => {
    const { container } = render(<CoinMark symbol="BTC" color="#f2a23a" size={40} />);
    const el = container.firstChild as HTMLElement;
    expect(el.style.width).toBe('40px');
    expect(el.style.height).toBe('40px');
  });
});
