import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Pill } from '@/components/ui/pill';

describe('Pill', () => {
  it('exibe valor positivo com sinal ▲', () => {
    render(<Pill value={1.42} />);
    expect(screen.getByText(/1\.42%/)).toBeInTheDocument();
    expect(screen.getByText('▲')).toBeInTheDocument();
  });

  it('exibe valor negativo com sinal ▼', () => {
    render(<Pill value={-2.14} />);
    expect(screen.getByText(/2\.14%/)).toBeInTheDocument();
    expect(screen.getByText('▼')).toBeInTheDocument();
  });

  it('exibe zero com sinal ▲', () => {
    render(<Pill value={0} />);
    expect(screen.getByText('▲')).toBeInTheDocument();
  });

  it('exibe valor absoluto (sem sinal negativo no número)', () => {
    render(<Pill value={-5.5} />);
    expect(screen.getByText(/5\.50%/)).toBeInTheDocument();
    expect(screen.queryByText(/-5/)).toBeNull();
  });
});
