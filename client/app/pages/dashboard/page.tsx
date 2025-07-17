// pages/dashboard.tsx

import { useExpenseContext } from "@/app/components/Context";
import { useRouter } from "next/navigation";

const DashboardPage = () => {
  const { expenses, accounts, categories } = useExpenseContext();
  const router = useRouter()

  // Opcional: Si el `useEffect` del contexto ya carga los datos, quizás no necesites llamar a fetch aquí
  // pero es bueno tener las funciones disponibles si necesitas refrescar datos manualmente.

  // Calcular totales (ejemplo, estas lógicas podrían estar en un hook o utilidad)
  const totalSpent = expenses
    .filter(t => t.transaction_type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalEarned = expenses
    .filter(t => t.transaction_type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);

  return (
      <div className="dashboard-container">
        <h1>Resumen General</h1>

        {/* Sección de Paneles de Resumen */}
        <section className="summary-panels">
          <div className="panel">
            <h3>Total Gastado</h3>
            <p className="amount-spent">${totalSpent.toFixed(2)}</p>
          </div>
          <div className="panel">
            <h3>Total Ingresado</h3>
            <p className="amount-earned">${totalEarned.toFixed(2)}</p>
          </div>
          <div className="panel">
            <h3>Balance Total Cuentas</h3>
            <p className="amount-balance">${totalBalance.toFixed(2)}</p>
          </div>
          {/* Puedes añadir más paneles: Cuentas activas, Categorías más usadas, etc. */}
        </section>

        {/* Sección de Últimas Transacciones */}
        <section className="latest-transactions">
          <h2>Últimas Transacciones</h2>
          {/* Aquí podrías mostrar una tabla pequeña de las 5-10 últimas transacciones */}
          {expenses.length > 0 ? (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Descripción</th>
                  <th>Monto</th>
                  <th>Tipo</th>
                  <th>Categoría</th>
                  <th>Cuenta</th>
                </tr>
              </thead>
              <tbody>
                {expenses.slice(0, 5).map(tx => ( // Mostrar solo las 5 últimas
                  <tr key={tx.id}>
                    <td>{new Date(tx.date).toLocaleDateString()}</td>
                    <td>{tx.notes || '-'}</td>
                    <td className={tx.transaction_type === 'expense' ? 'text-red' : 'text-green'}>
                        {tx.transaction_type === 'expense' ? '-' : ''}${tx.amount.toFixed(2)}
                    </td>
                    <td>{tx.transaction_type}</td>
                    <td>{categories.find(cat => cat.id === tx.category)?.name || 'N/A'}</td>
                    <td>{accounts.find(acc => acc.id === tx.account)?.name || 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No hay transacciones recientes para mostrar.</p>
          )}
          <button className="btn-secondary" onClick={() => router.push('/transactions')}>Ver Todas las Transacciones</button>
        </section>

        {/* Sección de Cuentas (resumen o top 3) */}
        <section className="accounts-overview">
          <h2>Cuentas</h2>
          {/* Pequeña lista o tarjeta de las cuentas principales */}
          {accounts.length > 0 ? (
            <div className="account-cards">
              {accounts.map(account => (
                <div key={account.id} className="account-card">
                  <h4>{account.name}</h4>
                  <p>Tipo: {account.acc_type}</p>
                  <p>Balance: ${account.balance.toFixed(2)} {account.currency}</p>
                </div>
              ))}
            </div>
          ) : (
            <p>No hay cuentas para mostrar. ¡Crea una!</p>
          )}
          <button className="btn-secondary" onClick={() => router.push('/accounts')}>Gestionar Cuentas</button>
        </section>

      </div>
  );
};

export default DashboardPage;