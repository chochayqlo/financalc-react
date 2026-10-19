// Punto de entrada: monta el componente App dentro de <div id="root">.
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
// Fuente Archivo (variable en peso y ancho) instalada con npm: funciona sin conexión.
import '@fontsource-variable/archivo/wdth.css';
import './styles.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
