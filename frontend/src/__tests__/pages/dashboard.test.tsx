import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import DashboardPage from '@/app/(dashboard)/dashboard/page';

describe('DashboardPage (smoke)', () => {
  it('renderiza sem erros', () => {
    expect(() => render(<DashboardPage />)).not.toThrow();
  });

  it('exibe o label "Patrimônio total"', () => {
    render(<DashboardPage />);
    expect(screen.getByText('Patrimônio total')).toBeInTheDocument();
  });

  it('exibe os range tabs', () => {
    render(<DashboardPage />);
    expect(screen.getByText('1D')).toBeInTheDocument();
    expect(screen.getByText('1M')).toBeInTheDocument();
    expect(screen.getByText('Tudo')).toBeInTheDocument();
  });

  it('exibe pelo menos um símbolo BTC na tabela de holdings', () => {
    render(<DashboardPage />);
    expect(screen.getAllByText(/BTC/i).length).toBeGreaterThan(0);
  });
});
