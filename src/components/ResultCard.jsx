import { useEffect, useRef, useState } from 'react';
import CompositionBar from './CompositionBar.jsx';
import { money } from '../utils/finance.js';

// Texto que se copia al portapapeles con el botón "Copiar resultado".
function buildSummary(result, modeLabel, currency) {
  return [
    `FinanCalc: ${modeLabel}`,
    `${result.mainLabel}: ${money(result.main, currency)}`,
    `${result.totalLabel}: ${money(result.total, currency)}`,
    `${result.interestLabel}: ${money(result.interest, currency)}`,
  ].join('\n');
}

async function copyText(text) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }
  // Alternativa para navegadores sin la API del portapapeles.
  const area = document.createElement('textarea');
  area.value = text;
  area.setAttribute('readonly', '');
  area.style.position = 'fixed';
  area.style.opacity = '0';
  document.body.appendChild(area);
  area.select();
  const ok = document.execCommand('copy');
  area.remove();
  if (!ok) throw new Error('No se pudo copiar');
}

// Muestra el resultado de la simulación. Si `result` es null, muestra
// un mensaje que invita a completar el formulario.
export default function ResultCard({ result, modeLabel, currency }) {
  const [copyStatus, setCopyStatus] = useState('idle'); // 'idle' | 'copied' | 'failed'
  const sectionRef = useRef(null);

  // En celulares el resultado queda debajo del formulario:
  // cuando aparece uno nuevo, se desplaza la pantalla hasta él.
  useEffect(() => {
    if (!result) return;
    const isNarrow = window.matchMedia?.('(max-width: 719px)')?.matches;
    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
    if (isNarrow) {
      sectionRef.current?.scrollIntoView?.({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
    }
  }, [result]);

  // Después de copiar, el botón vuelve a su texto original a los 2 segundos.
  // La función de limpieza cancela el temporizador si el componente cambia antes.
  useEffect(() => {
    if (copyStatus === 'idle') return undefined;
    const timer = setTimeout(() => setCopyStatus('idle'), 2000);
    return () => clearTimeout(timer);
  }, [copyStatus]);

  if (!result) {
    return (
      <section className="panel results empty" aria-live="polite">
        <h2>Tu resultado aparecerá aquí</h2>
        <p>Completa los datos y pulsa Calcular para ver la cifra principal, el total y los intereses.</p>
      </section>
    );
  }

  const handleCopy = async () => {
    try {
      await copyText(buildSummary(result, modeLabel, currency));
      setCopyStatus('copied');
    } catch {
      setCopyStatus('failed');
    }
  };

  const copyLabel = {
    idle: 'Copiar resultado',
    copied: 'Resultado copiado',
    failed: 'No se pudo copiar',
  }[copyStatus];

  return (
    <section className="panel results" aria-live="polite" ref={sectionRef}>
      <h2 className="result-label">{result.mainLabel}</h2>
      <p className="result-figure">{money(result.main, currency)}</p>

      <CompositionBar
        capital={result.capital}
        interest={result.interest}
        capitalLabel={result.contributed !== undefined ? 'Tu dinero' : 'Capital'}
        currency={currency}
      />

      <dl className="metrics">
        <div className="metric">
          <dt>{result.totalLabel}</dt>
          <dd>{money(result.total, currency)}</dd>
        </div>
        <div className="metric">
          <dt>{result.interestLabel}</dt>
          <dd>{money(result.interest, currency)}</dd>
        </div>
        {result.contributed !== undefined && (
          <div className="metric">
            <dt>Total aportado</dt>
            <dd>{money(result.contributed, currency)}</dd>
          </div>
        )}
        {result.months !== undefined && (
          <div className="metric">
            <dt>{result.contributed !== undefined ? 'Meses de ahorro' : 'Número de cuotas'}</dt>
            <dd>{result.months}</dd>
          </div>
        )}
      </dl>

      <button type="button" className="copy" onClick={handleCopy}>
        {copyLabel}
      </button>

      <p className="disclaimer">
        Simulación educativa. No incluye comisiones, impuestos, seguros ni otros cargos.
      </p>
    </section>
  );
}
