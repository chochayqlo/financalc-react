// Encabezado de la aplicación: marca y descripción corta.
// El ícono es un SVG propio (actividad de ampliación: cambiar texto e ícono).
export default function Header() {
  return (
    <header className="header">
      <div className="shell header-inner">
        <a className="brand" href="/" aria-label="FinanCalc, inicio">
          <svg className="brand-mark" viewBox="0 0 32 32" aria-hidden="true">
            <rect width="32" height="32" rx="9" fill="currentColor" />
            <path d="M8 22h16" stroke="#8fd0e3" strokeWidth="2.4" strokeLinecap="round" />
            <path
              d="M8 18l5-5 4 3 7-7"
              fill="none"
              stroke="#e8b04a"
              strokeWidth="2.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span>FinanCalc</span>
        </a>
        <p className="header-tagline">Simulador de préstamos, intereses y ahorro</p>
      </div>
    </header>
  );
}
