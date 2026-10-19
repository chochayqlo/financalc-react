import NumberField from './NumberField.jsx';
import { modes } from '../utils/modes.js';
import { CURRENCIES } from '../utils/finance.js';

// Formulario de la simulación. Recibe los valores y las funciones desde App (props)
// y solo se encarga de mostrarlos y avisar de los cambios.
// `noValidate` desactiva los globos de error del navegador para que se vean
// los mensajes en español de finance.js, iguales en todos los navegadores.
export default function CalculatorForm({
  type,
  values,
  currency,
  error,
  errorField,
  onFieldChange,
  onSubmit,
  onReset,
}) {
  const mode = modes.find((option) => option.value === type);
  const symbol = CURRENCIES[currency].symbol;

  // Devuelve las props comunes de cada campo para no repetirlas.
  const fieldProps = (field) => ({
    id: field,
    value: values[field],
    onChange: (value) => onFieldChange(field, value),
    invalid: errorField === field,
    errorId: 'form-error',
  });

  return (
    <form onSubmit={onSubmit} className="panel form" noValidate>
      <h2>{mode.label}</h2>
      <p className="form-description">{mode.description}</p>

      <NumberField {...fieldProps('principal')} label={`Capital inicial (${symbol})`} />
      <NumberField {...fieldProps('rate')} label="Tasa de interés anual (%)" />
      <NumberField
        {...fieldProps('years')}
        label="Plazo (años)"
        hint={
          type === 'loan'
            ? 'Ejemplo: 1.5 equivale a 18 meses.'
            : 'Puedes usar decimales, por ejemplo 2.5 años.'
        }
      />
      {type === 'savings' && (
        <NumberField
          {...fieldProps('deposit')}
          label={`Aporte mensual (${symbol})`}
          placeholder="0"
          required={false}
          hint="Opcional. Se suma al final de cada mes."
        />
      )}

      {error && (
        <p className="error" id="form-error" role="alert">
          {error}
        </p>
      )}

      <div className="actions">
        <button className="primary" type="submit">
          Calcular
        </button>
        <button className="secondary" type="button" onClick={onReset}>
          Limpiar
        </button>
      </div>
    </form>
  );
}
