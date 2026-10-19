import { modeLabel } from '../utils/modes.js';
import { money } from '../utils/finance.js';

const dateFormat = new Intl.DateTimeFormat('es-DO', { dateStyle: 'medium', timeStyle: 'short' });

// Describe en una línea los datos que se usaron en la simulación.
function describe(entry) {
  const { principal, rate, years, deposit } = entry.values;
  const yearsText = Number(years) === 1 ? '1 año' : `${years} años`;
  let text = `${money(Number(principal), entry.currency)} al ${rate} % por ${yearsText}`;
  if (entry.type === 'savings' && Number(deposit) > 0) {
    text += `, aportando ${money(Number(deposit), entry.currency)} al mes`;
  }
  return text;
}

// Lista de las últimas simulaciones guardadas en localStorage.
// "Repetir" vuelve a cargar esa simulación en el formulario.
export default function HistoryList({ entries, onSelect, onClear }) {
  if (entries.length === 0) return null;

  return (
    <section className="history" aria-labelledby="history-title">
      <div className="history-head">
        <h2 id="history-title">Simulaciones recientes</h2>
        <button type="button" className="link-button" onClick={onClear}>
          Borrar historial
        </button>
      </div>
      <ol className="history-list">
        {entries.map((entry) => {
          const label = modeLabel(entry.type);
          return (
            <li key={entry.id} className="history-item">
              <div className="history-info">
                <strong>{label}</strong>
                <span>{describe(entry)}</span>
                <time dateTime={entry.createdAt}>{dateFormat.format(new Date(entry.createdAt))}</time>
              </div>
              <div className="history-result">
                <span>{entry.mainLabel}</span>
                <strong>{money(entry.main, entry.currency)}</strong>
              </div>
              <button
                type="button"
                className="secondary small"
                onClick={() => onSelect(entry)}
                aria-label={`Repetir simulación de ${label}: ${describe(entry)}`}
              >
                Repetir
              </button>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
