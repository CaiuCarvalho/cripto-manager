import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import AlertsPage from '@/app/(dashboard)/alerts/page';

describe('AlertsPage (smoke)', () => {
  it('renderiza sem erros', () => {
    expect(() => render(<AlertsPage />)).not.toThrow();
  });

  it('exibe o botão "Novo alerta"', () => {
    render(<AlertsPage />);
    expect(screen.getByText('Novo alerta')).toBeInTheDocument();
  });

  it('exibe grupo "Disparados"', () => {
    render(<AlertsPage />);
    expect(screen.getByText('Disparados')).toBeInTheDocument();
  });

  it('exibe grupo "Ativos"', () => {
    render(<AlertsPage />);
    expect(screen.getByText('Ativos')).toBeInTheDocument();
  });

  it('exibe botões Editar e Remover', () => {
    render(<AlertsPage />);
    expect(screen.getAllByText('Editar').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Remover').length).toBeGreaterThan(0);
  });
});
