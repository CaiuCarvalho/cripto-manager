import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import WalletsPage from '@/app/(dashboard)/wallets/page';

describe('WalletsPage (smoke)', () => {
  it('renderiza sem erros', () => {
    expect(() => render(<WalletsPage />)).not.toThrow();
  });

  it('exibe o label "Total em carteiras"', () => {
    render(<WalletsPage />);
    expect(screen.getByText('Total em carteiras')).toBeInTheDocument();
  });

  it('exibe o grupo On-chain', () => {
    render(<WalletsPage />);
    expect(screen.getByText('On-chain')).toBeInTheDocument();
  });

  it('exibe o grupo Exchanges', () => {
    render(<WalletsPage />);
    expect(screen.getByText('Exchanges')).toBeInTheDocument();
  });

  it('exibe o nome de pelo menos uma wallet', () => {
    render(<WalletsPage />);
    expect(screen.getByText('Cold Storage BTC')).toBeInTheDocument();
  });

  it('exibe o botão "Adicionar carteira"', () => {
    render(<WalletsPage />);
    expect(screen.getByText('Adicionar carteira')).toBeInTheDocument();
  });
});
