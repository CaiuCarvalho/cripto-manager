import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TransactionsPage from '@/app/(dashboard)/transactions/page';

describe('TransactionsPage (smoke)', () => {
  it('renderiza sem erros', () => {
    expect(() => render(<TransactionsPage />)).not.toThrow();
  });

  it('exibe o label "Total comprado"', () => {
    render(<TransactionsPage />);
    expect(screen.getByText('Total comprado')).toBeInTheDocument();
  });

  it('exibe o label "Total vendido"', () => {
    render(<TransactionsPage />);
    expect(screen.getByText('Total vendido')).toBeInTheDocument();
  });

  it('exibe os filtros de tipo', () => {
    render(<TransactionsPage />);
    expect(screen.getByText('Todos')).toBeInTheDocument();
    expect(screen.getByText('Compras')).toBeInTheDocument();
    expect(screen.getByText('Vendas')).toBeInTheDocument();
  });

  it('exibe linhas de transação com badge Compra', () => {
    render(<TransactionsPage />);
    expect(screen.getAllByText('Compra').length).toBeGreaterThan(0);
  });

  it('filtra por Compras ao clicar no botão', async () => {
    render(<TransactionsPage />);
    const user = userEvent.setup();
    await user.click(screen.getByText('Compras'));
    expect(screen.queryAllByText('Venda').length).toBe(0);
  });
});
