import { amortizationSchedule, money } from '../utils/finance.js';

// Tabla de amortización del préstamo: una fila por cuota, generada con .map().
// Muestra cómo cada mes baja la parte de interés y sube la parte de capital.
export default function AmortizationTable({ values, currency }) {
  const rows = amortizationSchedule(values.principal, values.rate, values.years);
  const totals = rows.reduce(
    (sum, row) => ({
      payment: sum.payment + row.payment,
      interest: sum.interest + row.interest,
      capital: sum.capital + row.capital,
    }),
    { payment: 0, interest: 0, capital: 0 },
  );

  return (
    <section className="schedule" aria-labelledby="schedule-title">
      <details>
        <summary>
          <span id="schedule-title">Tabla de amortización</span>
          <span className="summary-hint">{rows.length} cuotas mensuales</span>
        </summary>
        <div className="table-scroll" tabIndex={0} aria-label="Tabla de amortización, desplazable">
          <table>
            <thead>
              <tr>
                <th scope="col">Mes</th>
                <th scope="col">Cuota</th>
                <th scope="col">Interés</th>
                <th scope="col">Capital</th>
                <th scope="col">Saldo</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.month}>
                  <th scope="row">{row.month}</th>
                  <td>{money(row.payment, currency)}</td>
                  <td>{money(row.interest, currency)}</td>
                  <td>{money(row.capital, currency)}</td>
                  <td>{money(row.balance, currency)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <th scope="row">Total</th>
                <td>{money(totals.payment, currency)}</td>
                <td>{money(totals.interest, currency)}</td>
                <td>{money(totals.capital, currency)}</td>
                <td />
              </tr>
            </tfoot>
          </table>
        </div>
      </details>
    </section>
  );
}
