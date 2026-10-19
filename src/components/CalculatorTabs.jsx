import { modes } from '../utils/modes.js';

// Selector de modalidad. No guarda estado propio: App le pasa el valor activo
// (prop `value`) y la función para cambiarlo (prop `onChange`).
export default function CalculatorTabs({ value, onChange }) {
  return (
    <div className="tabs" role="group" aria-label="Tipo de cálculo">
      {modes.map((option) => (
        <button
          type="button"
          key={option.value}
          className={value === option.value ? 'tab active' : 'tab'}
          onClick={() => onChange(option.value)}
          aria-pressed={value === option.value}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
