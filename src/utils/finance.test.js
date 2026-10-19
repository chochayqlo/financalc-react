import { describe, expect, it } from 'vitest';
import { amortizationSchedule, calculate, money } from './finance.js';

// Casos de la tabla "11 · Pruebas guiadas" de la guía.
describe('pruebas guiadas de la guía', () => {
  it('interés simple: P=1000, r=12 %, t=2 → interés 240 y total 1240', () => {
    const result = calculate('simple', '1000', '12', '2');
    expect(result.interest).toBeCloseTo(240, 2);
    expect(result.total).toBeCloseTo(1240, 2);
  });

  it('interés compuesto: P=1000, r=0 %, t=2 → total 1000', () => {
    const result = calculate('compound', '1000', '0', '2');
    expect(result.total).toBe(1000);
    expect(result.interest).toBe(0);
  });

  it('préstamo: P=1200, r=0 %, t=1 → cuota 100', () => {
    const result = calculate('loan', '1200', '0', '1');
    expect(result.main).toBe(100);
    expect(result.months).toBe(12);
  });

  it('validación: P=-100 lanza un error', () => {
    expect(() => calculate('simple', '-100', '12', '2')).toThrow(/capital/);
  });
});

describe('fórmulas', () => {
  it('préstamo con interés: RD$100,000 al 12 % por 2 años', () => {
    const result = calculate('loan', '100000', '12', '2');
    expect(result.main).toBeCloseTo(4707.35, 2);
    expect(result.total).toBeCloseTo(result.main * 24, 6);
    expect(result.interest).toBeCloseTo(result.total - 100000, 6);
  });

  it('interés compuesto con capitalización mensual', () => {
    const result = calculate('compound', '1000', '12', '1');
    expect(result.total).toBeCloseTo(1000 * Math.pow(1.01, 12), 6);
  });

  it('ahorro sin aportes es igual al interés compuesto', () => {
    const savings = calculate('savings', '5000', '6', '3');
    const compound = calculate('compound', '5000', '6', '3');
    expect(savings.total).toBeCloseTo(compound.total, 6);
  });

  it('ahorro con aportes mensuales y tasa 0 suma capital + aportes', () => {
    const result = calculate('savings', '1000', '0', '1', '100');
    expect(result.total).toBe(2200);
    expect(result.contributed).toBe(2200);
    expect(result.interest).toBe(0);
  });

  it('ahorro con aportes mensuales y tasa > 0', () => {
    const result = calculate('savings', '0.01', '12', '1', '100');
    // Aportes de 100 al final de cada mes por 12 meses al 1 % mensual.
    const expected = 0.01 * Math.pow(1.01, 12) + 100 * ((Math.pow(1.01, 12) - 1) / 0.01);
    expect(result.total).toBeCloseTo(expected, 6);
  });
});

describe('validaciones', () => {
  it.each([
    ['capital vacío', ['', '12', '2'], 'principal'],
    ['capital en cero', ['0', '12', '2'], 'principal'],
    ['tasa vacía', ['1000', '', '2'], 'rate'],
    ['tasa negativa', ['1000', '-1', '2'], 'rate'],
    ['plazo en cero', ['1000', '12', '0'], 'years'],
    ['texto no numérico', ['abc', '12', '2'], 'principal'],
  ])('%s indica el campo con error', (_, args, field) => {
    try {
      calculate('loan', ...args);
      throw new Error('debía fallar');
    } catch (error) {
      expect(error.field).toBe(field);
    }
  });

  it('aporte mensual negativo es inválido', () => {
    expect(() => calculate('savings', '1000', '5', '1', '-50')).toThrow(/aporte/);
  });

  it('un préstamo necesita al menos un mes', () => {
    expect(() => calculate('loan', '1000', '12', '0.01')).toThrow(/al menos un mes/);
  });

  it('tipo desconocido lanza error', () => {
    expect(() => calculate('otro', '1000', '12', '1')).toThrow(/válido/);
  });
});

describe('tabla de amortización', () => {
  it('termina con saldo 0 y la suma del capital es el préstamo', () => {
    const rows = amortizationSchedule('100000', '12', '2');
    expect(rows).toHaveLength(24);
    expect(rows.at(-1).balance).toBe(0);
    const capital = rows.reduce((sum, row) => sum + row.capital, 0);
    expect(capital).toBeCloseTo(100000, 4);
    expect(rows[0].interest).toBeCloseTo(1000, 6); // 1 % del saldo inicial
  });
});

describe('formato de moneda', () => {
  it('muestra pesos dominicanos y dólares', () => {
    expect(money(1250.5)).toBe('RD$1,250.50');
    expect(money(1250.5, 'USD')).toBe('US$1,250.50');
  });

  it('no muestra -0.00', () => {
    expect(money(-0.000001)).toBe('RD$0.00');
  });
});
