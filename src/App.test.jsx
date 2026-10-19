// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import App from './App.jsx';

const field = (label) => screen.getByLabelText(label, { exact: false });
const type = (label, value) => fireEvent.change(field(label), { target: { value } });
const submit = () => fireEvent.click(screen.getByRole('button', { name: 'Calcular' }));
// Panel de resultados, localizado por su título (la etiqueta del resultado principal).
const resultPanel = (label) => screen.getByRole('heading', { name: label }).closest('section');

beforeEach(() => {
  localStorage.clear();
  window.scrollTo = () => {}; // jsdom no implementa el desplazamiento
});
afterEach(cleanup);

describe('FinanCalc', () => {
  it('muestra el estado inicial con los valores por defecto', () => {
    render(<App />);
    expect(field('Capital inicial').value).toBe('100000');
    expect(screen.getByText('Tu resultado aparecerá aquí')).toBeTruthy();
  });

  it('calcula la cuota de un préstamo sin recargar la página', () => {
    render(<App />);
    submit();
    const results = resultPanel('Cuota mensual');
    expect(within(results).getByText('RD$4,707.35')).toBeTruthy();
  });

  it('caso de la guía: interés simple P=1000, r=12, t=2', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: 'Interés simple' }));
    type('Capital inicial', '1000');
    type('Tasa de interés', '12');
    type('Plazo', '2');
    submit();
    const results = resultPanel('Interés generado');
    expect(within(results).getAllByText('RD$240.00').length).toBeGreaterThan(0);
    expect(within(results).getByText('RD$1,240.00')).toBeTruthy();
  });

  it('caso de la guía: validación con capital negativo muestra un error', () => {
    render(<App />);
    type('Capital inicial', '-100');
    submit();
    expect(screen.getByRole('alert').textContent).toMatch(/capital inicial mayor que cero/);
    expect(field('Capital inicial').getAttribute('aria-invalid')).toBe('true');
  });

  it('caso de la guía: Limpiar restablece los campos', () => {
    render(<App />);
    type('Capital inicial', '5000');
    type('Tasa de interés', '3');
    fireEvent.click(screen.getByRole('button', { name: 'Limpiar' }));
    expect(field('Capital inicial').value).toBe('100000');
    expect(field('Tasa de interés').value).toBe('12');
  });

  it('el aporte mensual solo aparece en Ahorro', () => {
    render(<App />);
    expect(screen.queryByLabelText('Aporte mensual', { exact: false })).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Ahorro' }));
    expect(field('Aporte mensual')).toBeTruthy();
  });

  it('cambia el formato a dólares', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: 'US$' }));
    submit();
    expect(within(resultPanel('Cuota mensual')).getByText('US$4,707.35')).toBeTruthy();
    expect(screen.getByText('Capital inicial (US$)')).toBeTruthy();
  });

  it('guarda la simulación en el historial (localStorage)', () => {
    render(<App />);
    submit();
    expect(screen.getByText('Simulaciones recientes')).toBeTruthy();
    const saved = JSON.parse(localStorage.getItem('financalc:historial'));
    expect(saved).toHaveLength(1);
    expect(saved[0].type).toBe('loan');
  });

  it('muestra la tabla de amortización del préstamo', () => {
    render(<App />);
    submit();
    expect(screen.getByText('24 cuotas mensuales')).toBeTruthy();
    expect(screen.getAllByRole('row')).toHaveLength(1 + 24 + 1);
  });

  it('Repetir carga una simulación del historial', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: 'Ahorro' }));
    type('Aporte mensual', '500');
    submit();
    fireEvent.click(screen.getByRole('button', { name: 'Préstamo' }));
    expect(screen.queryByLabelText('Aporte mensual', { exact: false })).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: /^Repetir simulación de Ahorro/ }));
    expect(field('Aporte mensual').value).toBe('500');
    expect(resultPanel('Ahorro proyectado')).toBeTruthy();
  });

  it('Borrar historial vacía la lista', () => {
    render(<App />);
    submit();
    fireEvent.click(screen.getByRole('button', { name: 'Borrar historial' }));
    expect(screen.queryByText('Simulaciones recientes')).toBeNull();
    expect(JSON.parse(localStorage.getItem('financalc:historial'))).toEqual([]);
  });
});
