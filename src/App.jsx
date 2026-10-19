import { useEffect, useState } from 'react';
import Header from './components/Header.jsx';
import CalculatorTabs from './components/CalculatorTabs.jsx';
import CurrencyToggle from './components/CurrencyToggle.jsx';
import CalculatorForm from './components/CalculatorForm.jsx';
import ResultCard from './components/ResultCard.jsx';
import AmortizationTable from './components/AmortizationTable.jsx';
import HistoryList from './components/HistoryList.jsx';
import { calculate } from './utils/finance.js';
import { modeLabel } from './utils/modes.js';
import { addToHistory, loadHistory, saveHistory } from './utils/history.js';

const initialValues = { principal: '100000', rate: '12', years: '2', deposit: '' };

// Ejecuta el cálculo con los valores del formulario.
// El aporte mensual solo aplica a la modalidad de ahorro.
const runSimulation = (type, values) =>
  calculate(type, values.principal, values.rate, values.years, type === 'savings' ? values.deposit : 0);

// App es el componente padre: guarda el estado, recibe los eventos de los hijos
// y les pasa por props los datos que deben mostrar.
export default function App() {
  const [type, setType] = useState('loan');
  const [values, setValues] = useState({ ...initialValues });
  const [currency, setCurrency] = useState('DOP');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [errorField, setErrorField] = useState(null);
  // Inicialización perezosa: loadHistory solo se ejecuta en el primer render.
  const [history, setHistory] = useState(loadHistory);

  useEffect(() => {
    document.title = 'FinanCalc | Calculadora financiera';
  }, []);

  // Cada vez que cambia el historial, se guarda en localStorage.
  useEffect(() => {
    saveHistory(history);
  }, [history]);

  const clearOutput = () => {
    setResult(null);
    setError('');
    setErrorField(null);
  };

  const changeType = (next) => {
    setType(next);
    clearOutput();
  };

  const changeField = (field, value) => {
    // Se crea un objeto nuevo con el operador spread; nunca se modifica el estado directamente.
    setValues((prev) => ({ ...prev, [field]: value }));
    clearOutput();
  };

  const submit = (event) => {
    event.preventDefault(); // Evita que el navegador recargue la página.
    try {
      const next = runSimulation(type, values);
      setResult(next);
      setError('');
      setErrorField(null);
      setHistory((prev) =>
        addToHistory(prev, {
          id: Date.now(),
          type,
          currency,
          values: { ...values, deposit: type === 'savings' ? values.deposit : '' },
          main: next.main,
          mainLabel: next.mainLabel,
          createdAt: new Date().toISOString(),
        }),
      );
    } catch (err) {
      setResult(null);
      setError(err.message);
      setErrorField(err.field ?? null);
    }
  };

  const reset = () => {
    setValues({ ...initialValues });
    clearOutput();
  };

  // Vuelve a cargar una simulación del historial en el formulario.
  const restore = (entry) => {
    const restoredValues = { ...initialValues, ...entry.values };
    setType(entry.type);
    setValues(restoredValues);
    setCurrency(entry.currency);
    try {
      setResult(runSimulation(entry.type, restoredValues));
      setError('');
      setErrorField(null);
    } catch (err) {
      setResult(null);
      setError(err.message);
      setErrorField(err.field ?? null);
    }
    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
    window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
  };

  return (
    <>
      <Header />
      <main className="shell">
        <section className="intro">
          <h1>¿Cuánto vas a pagar o a ganar?</h1>
          <p>
            Elige una modalidad, escribe tus datos y mira cuánto de cada peso es capital y cuánto
            son intereses.
          </p>
        </section>

        <div className="toolbar">
          <CalculatorTabs value={type} onChange={changeType} />
          <CurrencyToggle value={currency} onChange={setCurrency} />
        </div>

        <div className="layout">
          <CalculatorForm
            type={type}
            values={values}
            currency={currency}
            error={error}
            errorField={errorField}
            onFieldChange={changeField}
            onSubmit={submit}
            onReset={reset}
          />
          <ResultCard result={result} modeLabel={modeLabel(type)} currency={currency} />
        </div>

        {type === 'loan' && result && <AmortizationTable values={values} currency={currency} />}

        <HistoryList entries={history} onSelect={restore} onClear={() => setHistory([])} />
      </main>
      <footer className="shell footer">
        <p>FinanCalc, proyecto educativo desarrollado con React JS y Vite.</p>
      </footer>
    </>
  );
}
