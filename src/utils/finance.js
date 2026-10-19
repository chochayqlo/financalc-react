// Funciones financieras de FinanCalc.
// Este módulo NO importa React: solo recibe números (o textos de los inputs)
// y devuelve resultados. Así se puede probar y reutilizar por separado.
//
// Convenciones:
// - La tasa es un porcentaje ANUAL nominal: 12 significa 12 %.
// - El plazo se expresa en años (admite decimales: 1.5 = 18 meses).
// - La capitalización y las cuotas son mensuales.

export const CURRENCIES = {
  DOP: { code: 'DOP', symbol: 'RD$', label: 'Pesos dominicanos' },
  USD: { code: 'USD', symbol: 'US$', label: 'Dólares' },
};

// Formatea un número como moneda. Solo cambia la presentación, no convierte montos.
// Los valores casi cero se muestran como 0 para evitar textos como "-RD$0.00".
export const money = (amount, currency = 'DOP') =>
  new Intl.NumberFormat('es-DO', { style: 'currency', currency }).format(
    Math.abs(amount) < 0.005 ? 0 : amount,
  );

// Error de validación que recuerda qué campo lo provocó,
// para que la interfaz pueda marcar ese input.
export class ValidationError extends Error {
  constructor(message, field) {
    super(message);
    this.name = 'ValidationError';
    this.field = field;
  }
}

const isBlank = (value) => value === undefined || value === null || String(value).trim() === '';

// Convierte los textos del formulario a números y valida cada uno.
// Lanza un ValidationError con un mensaje claro si algo no es válido.
export function parseInputs(principal, annualRate, years, monthlyDeposit = 0) {
  const P = Number(principal);
  const ratePercent = Number(annualRate);
  const t = Number(years);
  const D = isBlank(monthlyDeposit) ? 0 : Number(monthlyDeposit);

  if (isBlank(principal) || !Number.isFinite(P) || P <= 0) {
    throw new ValidationError('Escribe un capital inicial mayor que cero.', 'principal');
  }
  if (isBlank(annualRate) || !Number.isFinite(ratePercent)) {
    throw new ValidationError('Escribe la tasa de interés anual. Puede ser 0.', 'rate');
  }
  if (ratePercent < 0) {
    throw new ValidationError('La tasa de interés no puede ser negativa.', 'rate');
  }
  if (isBlank(years) || !Number.isFinite(t) || t <= 0) {
    throw new ValidationError('Escribe un plazo mayor que cero años.', 'years');
  }
  if (!Number.isFinite(D) || D < 0) {
    throw new ValidationError('El aporte mensual no puede ser negativo.', 'deposit');
  }

  return { P, r: ratePercent / 100, t, D };
}

// Convierte años a meses enteros (las cuotas y los aportes son mensuales).
function toMonths(years) {
  const months = Math.round(years * 12);
  if (months < 1) {
    throw new ValidationError('El plazo debe ser de al menos un mes (aprox. 0.08 años).', 'years');
  }
  return months;
}

// Calcula una simulación y devuelve un objeto listo para mostrar.
//   main      → cifra principal (cuota, interés o monto final)
//   total     → monto total pagado o acumulado
//   interest  → intereses pagados o generados
//   capital   → dinero propio (capital + aportes); sirve para el gráfico
export function calculate(type, principal, annualRate, years, monthlyDeposit = 0) {
  const { P, r, t, D } = parseInputs(principal, annualRate, years, monthlyDeposit);
  let result;

  if (type === 'simple') {
    // I = P × r × t
    const interest = P * r * t;
    result = {
      main: interest,
      mainLabel: 'Interés generado',
      total: P + interest,
      totalLabel: 'Monto final',
      interest,
      interestLabel: 'Intereses generados',
      capital: P,
    };
  } else if (type === 'compound') {
    // A = P × (1 + r/12)^(12t)
    const total = P * Math.pow(1 + r / 12, 12 * t);
    result = {
      main: total,
      mainLabel: 'Monto futuro',
      total,
      totalLabel: 'Monto final',
      interest: total - P,
      interestLabel: 'Intereses generados',
      capital: P,
    };
  } else if (type === 'savings') {
    // Depósito inicial capitalizado + aportes al final de cada mes:
    // A = P(1+i)^n + D × [((1+i)^n − 1) / i]   (si i = 0 → P + D × n)
    const months = toMonths(t);
    const i = r / 12;
    const growth = Math.pow(1 + i, months);
    const fromDeposits = i === 0 ? D * months : D * ((growth - 1) / i);
    const total = P * growth + fromDeposits;
    const contributed = P + D * months;
    result = {
      main: total,
      mainLabel: 'Ahorro proyectado',
      total,
      totalLabel: 'Monto final',
      interest: total - contributed,
      interestLabel: 'Intereses generados',
      capital: contributed,
      contributed,
      months,
    };
  } else if (type === 'loan') {
    // C = P × i / [1 − (1 + i)^(−n)]   (si i = 0 → C = P / n)
    const months = toMonths(t);
    const i = r / 12;
    const payment = i === 0 ? P / months : (P * i) / (1 - Math.pow(1 + i, -months));
    const total = payment * months;
    result = {
      main: payment,
      mainLabel: 'Cuota mensual',
      total,
      totalLabel: 'Total a pagar',
      interest: total - P,
      interestLabel: 'Intereses pagados',
      capital: P,
      months,
    };
  } else {
    throw new ValidationError('Selecciona un tipo de cálculo válido.');
  }

  if (![result.main, result.total, result.interest].every(Number.isFinite)) {
    throw new ValidationError('Los valores son demasiado grandes para calcular. Prueba con montos menores.');
  }
  return result;
}

// Tabla de amortización de un préstamo con cuotas iguales (sistema francés).
// Devuelve una fila por mes: cuota, parte de interés, parte de capital y saldo pendiente.
export function amortizationSchedule(principal, annualRate, years) {
  const { P, r, t } = parseInputs(principal, annualRate, years);
  const months = toMonths(t);
  const i = r / 12;
  const payment = i === 0 ? P / months : (P * i) / (1 - Math.pow(1 + i, -months));

  const rows = [];
  let balance = P;
  for (let month = 1; month <= months; month++) {
    const interest = balance * i;
    const capital = payment - interest;
    balance -= capital;
    // Evita mostrar -0.00 por errores de redondeo en la última cuota.
    if (month === months || Math.abs(balance) < 0.005) balance = 0;
    rows.push({ month, payment, interest, capital, balance });
  }
  return rows;
}
