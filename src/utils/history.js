// Historial de simulaciones guardado en localStorage.
// localStorage puede no estar disponible (modo privado, permisos bloqueados),
// por eso cada lectura y escritura va dentro de try/catch.

const STORAGE_KEY = 'financalc:historial';
export const HISTORY_LIMIT = 5;

export function loadHistory() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return Array.isArray(saved) ? saved.slice(0, HISTORY_LIMIT) : [];
  } catch {
    return [];
  }
}

export function saveHistory(entries) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch {
    // Si no se puede guardar, la app sigue funcionando sin historial persistente.
  }
}

// Agrega una simulación al principio de la lista, sin repetir la última
// y conservando solo las más recientes.
export function addToHistory(entries, entry) {
  const [latest] = entries;
  const isSame =
    latest &&
    latest.type === entry.type &&
    latest.currency === entry.currency &&
    JSON.stringify(latest.values) === JSON.stringify(entry.values);
  if (isSame) return entries;
  return [entry, ...entries].slice(0, HISTORY_LIMIT);
}
