import { describe, it, expect } from 'vitest';
import {
  fmtBRL, fmtPct, fmtAmount, fmtDate, fmtAbrev, fmtRelative, shortAddr,
} from '@/lib/formatters';

describe('fmtBRL', () => {
  it('formata valor positivo em BRL', () => {
    expect(fmtBRL(1000)).toBe('R$ 1.000,00');
  });
  it('oculta valor quando hide=true', () => {
    expect(fmtBRL(99999, { hide: true })).toBe('R$ •••••');
  });
  it('respeita decimals customizado', () => {
    expect(fmtBRL(1.5, { decimals: 0 })).toBe('R$ 2');
  });
});

describe('fmtPct', () => {
  it('valor positivo tem prefixo +', () => {
    expect(fmtPct(1.42)).toBe('+1.42%');
  });
  it('valor negativo não tem prefixo +', () => {
    expect(fmtPct(-2.14)).toBe('-2.14%');
  });
  it('zero tem prefixo +', () => {
    expect(fmtPct(0)).toBe('+0.00%');
  });
});

describe('fmtAmount', () => {
  it('formata inteiro sem casas decimais desnecessárias', () => {
    expect(fmtAmount(4200, 4)).toBe('4.200');
  });
  it('formata decimal com precisão correta', () => {
    expect(fmtAmount(0.042, 4)).toBe('0,042');
  });
});

describe('fmtDate', () => {
  it('retorna string não vazia para ISO válido', () => {
    const result = fmtDate('2026-04-26T14:32:00');
    expect(result).toBeTruthy();
    expect(result).toContain('·');
  });
});

describe('fmtAbrev', () => {
  it('formata milhões', () => {
    expect(fmtAbrev(2_500_000)).toBe('2.5M');
  });
  it('formata milhares', () => {
    expect(fmtAbrev(1500)).toBe('1.5k');
  });
  it('retorna número bruto abaixo de 1000', () => {
    expect(fmtAbrev(42)).toBe('42');
  });
});

describe('fmtRelative', () => {
  it('retorna "agora" para data muito recente', () => {
    const now = new Date().toISOString();
    expect(fmtRelative(now)).toBe('agora');
  });
  it('retorna string com "atrás" para data passada', () => {
    const old = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
    expect(fmtRelative(old)).toContain('atrás');
  });
});

describe('shortAddr', () => {
  it('abrevia endereço longo', () => {
    const addr = 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh';
    expect(shortAddr(addr)).toBe('bc1qxy…hx0wlh');
  });
  it('retorna endereço mascarado sem modificação', () => {
    expect(shortAddr('••••3829')).toBe('••••3829');
  });
});
