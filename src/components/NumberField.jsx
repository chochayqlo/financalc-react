// Campo numérico reutilizable y "controlado":
// el valor viene del estado del padre (prop `value`) y cada cambio
// se comunica hacia arriba con la función `onChange`.
export default function NumberField({
  id,
  label,
  value,
  onChange,
  min = 0,
  step = 'any',
  hint,
  placeholder,
  required = true,
  invalid = false,
  errorId,
}) {
  const hintId = hint ? `${id}-hint` : undefined;
  const describedBy = [hintId, invalid ? errorId : undefined].filter(Boolean).join(' ') || undefined;

  return (
    <div className={invalid ? 'field invalid' : 'field'}>
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        name={id}
        type="number"
        inputMode="decimal"
        min={min}
        step={step}
        value={value}
        placeholder={placeholder}
        required={required}
        onChange={(event) => onChange(event.target.value)}
        aria-invalid={invalid}
        aria-describedby={describedBy}
      />
      {hint && <small id={hintId}>{hint}</small>}
    </div>
  );
}
