// Modalidades de cálculo disponibles. Se comparten entre varios componentes
// (pestañas, formulario e historial), por eso viven en su propio módulo.
export const modes = [
  {
    value: 'loan',
    label: 'Préstamo',
    description: 'Calcula la cuota fija que pagarías cada mes y cuánto te cuesta el préstamo en intereses.',
  },
  {
    value: 'simple',
    label: 'Interés simple',
    description: 'El interés se calcula siempre sobre el capital inicial, sin reinvertir lo ganado.',
  },
  {
    value: 'compound',
    label: 'Interés compuesto',
    description: 'Los intereses se suman al capital cada mes y también generan intereses.',
  },
  {
    value: 'savings',
    label: 'Ahorro',
    description: 'Proyecta cuánto tendrás con un depósito inicial y, si quieres, un aporte cada mes.',
  },
];

export const modeLabel = (value) => modes.find((mode) => mode.value === value)?.label ?? value;
