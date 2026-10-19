import { money } from '../utils/finance.js';

// Gráfico de barra que muestra qué parte del total es capital propio
// y qué parte son intereses. Se dibuja solo con CSS (anchos en porcentaje).
export default function CompositionBar({ capital, interest, capitalLabel, currency }) {
  const total = capital + Math.max(interest, 0);
  const interestShare = total > 0 ? (Math.max(interest, 0) / total) * 100 : 0;
  const capitalShare = 100 - interestShare;
  const percentText = `${interestShare.toFixed(1)} %`;

  return (
    <figure className="composition">
      <div
        className="composition-bar"
        role="img"
        aria-label={`${capitalLabel}: ${capitalShare.toFixed(1)} %. Intereses: ${percentText} del total.`}
      >
        <span className="segment capital" style={{ width: `${capitalShare}%` }} />
        <span className="segment interest" style={{ width: `${interestShare}%` }} />
      </div>
      <figcaption className="composition-legend">
        <span>
          <i className="swatch capital" aria-hidden="true" />
          {capitalLabel} <strong>{money(capital, currency)}</strong>
        </span>
        <span>
          <i className="swatch interest" aria-hidden="true" />
          Intereses <strong>{percentText}</strong>
        </span>
      </figcaption>
    </figure>
  );
}
