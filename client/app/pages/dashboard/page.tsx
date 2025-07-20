"use client"
import { useExpenseContext } from "@/app/components/Context"
import { useRouter } from "next/navigation"
import { useState } from "react"

const DashboardPage = () => {
  const { expenses, accounts, categories } = useExpenseContext()
  const router = useRouter()
  const [selectedPeriod, setSelectedPeriod] = useState("month")

  // Calcular métricas financieras
  const totalSpent = expenses
    .filter((t) => t.transaction_type === "expense" && t.status === "cleared")
    .reduce((sum, t) => sum + t.amount, 0)

  const totalEarned = expenses
    .filter((t) => t.transaction_type === "income" && t.status === "cleared")
    .reduce((sum, t) => sum + t.amount, 0)

  const totalBalance = accounts.filter((acc) => acc.is_active).reduce((sum, acc) => sum + acc.balance, 0)

  const pendingTransactions = expenses.filter((t) => t.status === "pending").length

  const netIncome = totalEarned - totalSpent

  // Obtener transacciones recientes
  const recentTransactions = expenses
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5)

  // Obtener categorías más usadas
  const categoryUsage = categories
    .map((cat) => ({
      ...cat,
      usage: expenses.filter((t) => t.category === cat.id).length,
      amount: expenses.filter((t) => t.category === cat.id).reduce((sum, t) => sum + t.amount, 0),
    }))
    .sort((a, b) => b.usage - a.usage)
    .slice(0, 3)

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-neutral-800 dark:text-neutral-100">Financial Dashboard</h1>
            <p className="text-neutral-600 dark:text-neutral-400 mt-1">Welcome back! Here's your financial overview</p>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="inputElement !w-auto !p-2 text-sm"
            >
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="year">This Year</option>
            </select>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Balance */}
          <div className="card p-6 bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900 dark:to-primary-800 border-primary-200 dark:border-primary-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-primary-600 dark:text-primary-300">Total Balance</p>
                <p className="text-2xl font-bold text-primary-800 dark:text-primary-100 mt-1">
                  ${totalBalance.toFixed(2)}
                </p>
              </div>
              <div className="w-12 h-12 bg-primary-500 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Total Income */}
          <div className="card p-6 bg-gradient-to-br from-success-50 to-success-100 dark:from-success-900 dark:to-success-800 border-success-200 dark:border-success-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-success-600 dark:text-success-300">Total Income</p>
                <p className="text-2xl font-bold text-success-800 dark:text-success-100 mt-1">
                  ${totalEarned.toFixed(2)}
                </p>
              </div>
              <div className="w-12 h-12 bg-success-500 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                </svg>
              </div>
            </div>
          </div>

          {/* Total Expenses */}
          <div className="card p-6 bg-gradient-to-br from-error-50 to-error-100 dark:from-error-900 dark:to-error-800 border-error-200 dark:border-error-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-error-600 dark:text-error-300">Total Expenses</p>
                <p className="text-2xl font-bold text-error-800 dark:text-error-100 mt-1">${totalSpent.toFixed(2)}</p>
              </div>
              <div className="w-12 h-12 bg-error-500 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 13l-5 5m0 0l-5-5m5 5V6" />
                </svg>
              </div>
            </div>
          </div>

          {/* Net Income */}
          <div
            className={`card p-6 bg-gradient-to-br ${netIncome >= 0 ? "from-success-50 to-success-100 dark:from-success-900 dark:to-success-800 border-success-200 dark:border-success-700" : "from-warning-50 to-warning-100 dark:from-warning-900 dark:to-warning-800 border-warning-200 dark:border-warning-700"}`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p
                  className={`text-sm font-medium ${netIncome >= 0 ? "text-success-600 dark:text-success-300" : "text-warning-600 dark:text-warning-300"}`}
                >
                  Net Income
                </p>
                <p
                  className={`text-2xl font-bold mt-1 ${netIncome >= 0 ? "text-success-800 dark:text-success-100" : "text-warning-800 dark:text-warning-100"}`}
                >
                  ${netIncome.toFixed(2)}
                </p>
              </div>
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center ${netIncome >= 0 ? "bg-success-500" : "bg-warning-500"}`}
              >
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Transactions */}
          <div className="lg:col-span-2">
            <div className="card p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-neutral-800 dark:text-neutral-100">Recent Transactions</h2>
                {pendingTransactions > 0 && (
                  <span className="bg-warning-100 text-warning-800 dark:bg-warning-900 dark:text-warning-200 px-3 py-1 rounded-full text-sm font-medium">
                    {pendingTransactions} Pending
                  </span>
                )}
              </div>

              {recentTransactions.length > 0 ? (
                <div className="space-y-4">
                  {recentTransactions.map((tx) => {
                    const category = categories.find((cat) => cat.id === tx.category)
                    const account = accounts.find((acc) => acc.id === tx.account)

                    return (
                      <div
                        key={tx.id}
                        className="flex items-center justify-between p-4 bg-surface-secondary dark:bg-surface-tertiary rounded-input hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              tx.transaction_type === "income"
                                ? "bg-success-100 dark:bg-success-900"
                                : tx.transaction_type === "expense"
                                  ? "bg-error-100 dark:bg-error-900"
                                  : "bg-primary-100 dark:bg-primary-900"
                            }`}
                          >
                            <svg
                              className={`w-5 h-5 ${
                                tx.transaction_type === "income"
                                  ? "text-success-600 dark:text-success-300"
                                  : tx.transaction_type === "expense"
                                    ? "text-error-600 dark:text-error-300"
                                    : "text-primary-600 dark:text-primary-300"
                              }`}
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              {tx.transaction_type === "income" ? (
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M7 11l5-5m0 0l5 5m-5-5v12"
                                />
                              ) : tx.transaction_type === "expense" ? (
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M17 13l-5 5m0 0l-5-5m5 5V6"
                                />
                              ) : (
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                                />
                              )}
                            </svg>
                          </div>
                          <div>
                            <p className="font-medium text-neutral-800 dark:text-neutral-200">
                              {category?.name || "Unknown Category"}
                            </p>
                            <p className="text-sm text-neutral-600 dark:text-neutral-400">
                              {account?.name || "Unknown Account"} • {new Date(tx.date).toLocaleDateString()}
                            </p>
                            {tx.notes && (
                              <p className="text-sm text-neutral-500 dark:text-neutral-500 mt-1">{tx.notes}</p>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <p
                            className={`font-semibold ${
                              tx.transaction_type === "income"
                                ? "text-success-600 dark:text-success-400"
                                : tx.transaction_type === "expense"
                                  ? "text-error-600 dark:text-error-400"
                                  : "text-neutral-600 dark:text-neutral-400"
                            }`}
                          >
                            {tx.transaction_type === "expense" ? "-" : "+"}${tx.amount.toFixed(2)}
                          </p>
                          <span
                            className={`inline-block px-2 py-1 rounded text-xs font-medium mt-1 ${
                              tx.status === "cleared"
                                ? "bg-success-100 text-success-800 dark:bg-success-900 dark:text-success-200"
                                : tx.status === "pending"
                                  ? "bg-warning-100 text-warning-800 dark:bg-warning-900 dark:text-warning-200"
                                  : "bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200"
                            }`}
                          >
                            {tx.status}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <svg
                    className="w-16 h-16 text-neutral-400 dark:text-neutral-600 mx-auto mb-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                  <p className="text-neutral-600 dark:text-neutral-400">No transactions yet</p>
                  <p className="text-sm text-neutral-500 dark:text-neutral-500 mt-1">
                    Start by adding your first transaction
                  </p>
                </div>
              )}

              <div className="mt-6 pt-4 border-t border-border-primary">
                <button onClick={() => router.push("/transactions")} className="secondaryButton !w-auto px-6">
                  View All Transactions
                </button>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Accounts Overview */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-neutral-800 dark:text-neutral-100 mb-4">Your Accounts</h3>

              {accounts.length > 0 ? (
                <div className="space-y-3">
                  {accounts
                    .filter((acc) => acc.is_active)
                    .slice(0, 4)
                    .map((account) => (
                      <div
                        key={account.id}
                        className="flex items-center justify-between p-3 bg-surface-secondary dark:bg-surface-tertiary rounded-input"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              account.acc_type === "bank"
                                ? "bg-primary-100 dark:bg-primary-900"
                                : account.acc_type === "cash"
                                  ? "bg-success-100 dark:bg-success-900"
                                  : account.acc_type === "card"
                                    ? "bg-warning-100 dark:bg-warning-900"
                                    : "bg-neutral-100 dark:bg-neutral-800"
                            }`}
                          >
                            <svg
                              className={`w-4 h-4 ${
                                account.acc_type === "bank"
                                  ? "text-primary-600 dark:text-primary-300"
                                  : account.acc_type === "cash"
                                    ? "text-success-600 dark:text-success-300"
                                    : account.acc_type === "card"
                                      ? "text-warning-600 dark:text-warning-300"
                                      : "text-neutral-600 dark:text-neutral-400"
                              }`}
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              {account.acc_type === "bank" ? (
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                                />
                              ) : account.acc_type === "cash" ? (
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 0h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v2M7 7h10"
                                />
                              ) : (
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                                />
                              )}
                            </svg>
                          </div>
                          <div>
                            <p className="font-medium text-neutral-800 dark:text-neutral-200 text-sm">{account.name}</p>
                            <p className="text-xs text-neutral-500 dark:text-neutral-500 capitalize">
                              {account.acc_type}
                            </p>
                          </div>
                        </div>
                        <p className="font-semibold text-neutral-800 dark:text-neutral-200 text-sm">
                          ${account.balance.toFixed(2)}
                        </p>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <svg
                    className="w-12 h-12 text-neutral-400 dark:text-neutral-600 mx-auto mb-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                    />
                  </svg>
                  <p className="text-neutral-600 dark:text-neutral-400 text-sm">No accounts yet</p>
                </div>
              )}

              <button onClick={() => router.push("/accounts")} className="secondaryButton !w-full mt-4">
                Manage Accounts
              </button>
            </div>

            {/* Top Categories */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-neutral-800 dark:text-neutral-100 mb-4">Top Categories</h3>

              {categoryUsage.length > 0 ? (
                <div className="space-y-3">
                  {categoryUsage.map((category, index) => (
                    <div key={category.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                            index === 0 ? "bg-warning-500" : index === 1 ? "bg-neutral-400" : "bg-warning-600"
                          }`}
                        >
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium text-neutral-800 dark:text-neutral-200 text-sm">{category.name}</p>
                          <p className="text-xs text-neutral-500 dark:text-neutral-500">
                            {category.usage} transactions
                          </p>
                        </div>
                      </div>
                      <p className="font-semibold text-neutral-800 dark:text-neutral-200 text-sm">
                        ${category.amount.toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <svg
                    className="w-12 h-12 text-neutral-400 dark:text-neutral-600 mx-auto mb-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                    />
                  </svg>
                  <p className="text-neutral-600 dark:text-neutral-400 text-sm">No categories yet</p>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-neutral-800 dark:text-neutral-100 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button
                  onClick={() => router.push("/transactions/new")}
                  className="submitButton !bg-success-500 hover:!bg-success-600"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Add Transaction
                </button>
                <button onClick={() => router.push("/accounts/new")} className="secondaryButton !w-full">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                    />
                  </svg>
                  Add Account
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardPage
