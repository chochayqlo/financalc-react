import { CURRENCIES } from '../utils/finance.js';

// Permite elegir RD$ o US$ para mostrar los montos.
// Solo cambia el formato: no hace conversión de moneda.
export default function CurrencyToggle({ value, onChange }) {
  return (
    <div className="currency" role="group" aria-label="Moneda de los montos">
      <span className="currency-label" aria-hidden="true">Moneda</span>
      {Object.values(CURRENCIES).map((currency) => (
        <button
          type="button"
          key={currency.code}
          className={value === currency.code ? 'currency-option active' : 'currency-option'}
          onClick={() => onChange(currency.code)}
          aria-pressed={value === currency.code}
          title={currency.label}
        >
          {currency.symbol}
        </button>
      ))}
    </div>
  );
}
