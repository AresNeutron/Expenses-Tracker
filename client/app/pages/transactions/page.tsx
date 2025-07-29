"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import type {
  CategoryTypeModel,
  CreateTransactionPayload,
  TransactionType,
  Transaction,
} from "../../interfaces/api_interfaces"
import { useExpenseContext } from "@/app/components/Context"
import ManageCategoriesModal from "@/app/components/ManageCategoriesModal"
import MessageModal from "@/app/components/MessageModal"
import {
  Plus,
  ArrowUpCircle,
  ArrowDownCircle,
  ArrowRightLeft,
  Calendar,
  DollarSign,
  Search,
  Settings,
  Trash2,
  Eye,
  EyeOff,
  TrendingUp,
  TrendingDown,
  Building2,
  Wallet,
  CreditCard,
  PiggyBank,
  FileText,
  ChevronDown,
  ExternalLink,
} from "lucide-react"

const TransactionsPage: React.FC = () => {
  const {
    transactions,
    accounts,
    categories,
    createTransaction,
    deleteTransaction,
    defaultCategories,
    setFilters,
    filters,
  } = useExpenseContext()

  const [showCreateTransactionModal, setShowCreateTransactionModal] = useState(false)
  const [showManageCategoriesModal, setShowManageCategoriesModal] = useState(false)
  const [showBalances, setShowBalances] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  // Estados para el MessageModal
  const [messageModal, setMessageModal] = useState({
    isOpen: false,
    type: "info" as "success" | "error" | "warning" | "info" | "confirm",
    title: "",
    message: "",
    onConfirm: undefined as (() => void) | undefined,
  })

  // Estados para el formulario de nueva transacción
  const [amount, setAmount] = useState("")
  const [accountID, setAccountID] = useState("")
  const [categoryID, setCategoryID] = useState("")
  const [categoryTypeModel, setCategoryTypeModel] = useState<CategoryTypeModel>("defaultcategory")
  const [type, setType] = useState<TransactionType>("expense")
  const [notes, setNotes] = useState("")

  const showMessage = (
    type: "success" | "error" | "warning" | "info" | "confirm",
    title: string,
    message: string,
    onConfirm?: () => void,
  ) => {
    setMessageModal({
      isOpen: true,
      type,
      title,
      message,
      onConfirm,
    })
  }

  const handleCreateTransaction = async () => {
    if (amount.trim() === "" || Number.isNaN(Number.parseFloat(amount)) || accountID === "" || categoryID === "") {
      showMessage("error", "Validation Error", "Please fill in all required fields: Amount, Account, and Category.")
      return
    }

    const payload: CreateTransactionPayload = {
      amount: amount,
      account: Number.parseInt(accountID),
      category_id: Number.parseInt(categoryID),
      category_type_model: categoryTypeModel,
      transaction_type: type,
      notes: notes,
    }

    const created = await createTransaction(payload)
    if (created) {
      setAmount("")
      setAccountID("")
      setCategoryID("")
      setType("expense")
      setNotes("")
      setShowCreateTransactionModal(false)
      showMessage("success", "Transaction Recorded", `Your ${type} transaction has been recorded successfully!`)
    } else {
      showMessage("error", "Transaction Failed", "Failed to record transaction. Please try again.")
    }
  }

  const handleDeleteTransaction = async (id: number) => {
    showMessage(
      "confirm",
      "Delete Transaction",
      "Are you sure you want to delete this transaction? This action cannot be undone.",
      async () => {
        await deleteTransaction(id)
        showMessage("success", "Transaction Deleted", "The transaction has been deleted successfully.")
      },
    )
  }

  const getCategoryInfo = (transaction: Transaction) => {
    const defaultCategory = defaultCategories.find(
      (cat) => cat.id === transaction.category_id && transaction.category_type_model.includes("default"),
    )
    if (defaultCategory) {
      return {
        name: defaultCategory.name,
        icon: defaultCategory.icon,
        color: defaultCategory.color,
        isDefault: true,
      }
    }

    const userCategory = categories.find(
      (cat) => cat.id === transaction.category_id && transaction.category_type_model.includes("category"),
    )
    if (userCategory) {
      return {
        name: userCategory.name,
        icon: userCategory.icon,
        color: userCategory.color,
        isDefault: false,
      }
    }

    return {
      name: "N/A",
      icon: "📦",
      color: "#6B7280",
      isDefault: false,
    }
  }

  const getAccountIcon = (accountId: number) => {
    const account = accounts.find((acc) => acc.id === accountId)
    if (!account) return <PiggyBank className="w-4 h-4" />

    switch (account.acc_type) {
      case "bank":
        return <Building2 className="w-4 h-4" />
      case "cash":
        return <Wallet className="w-4 h-4" />
      case "card":
        return <CreditCard className="w-4 h-4" />
      default:
        return <PiggyBank className="w-4 h-4" />
    }
  }

  const getTransactionIcon = (type: TransactionType) => {
    switch (type) {
      case "income":
        return <ArrowUpCircle className="w-5 h-5 text-success-500" />
      case "expense":
        return <ArrowDownCircle className="w-5 h-5 text-error-500" />
      case "transfer":
        return <ArrowRightLeft className="w-5 h-5 text-primary-500" />
      default:
        return <DollarSign className="w-5 h-5 text-neutral-500" />
    }
  }

  // Filtrar transacciones
  const filteredTransactions = transactions.filter((transaction) => {
    const categoryInfo = getCategoryInfo(transaction)
    const matchesSearch =
      searchTerm === "" ||
      categoryInfo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.notes.toLowerCase().includes(searchTerm.toLowerCase()) ||
      accounts
        .find((acc) => acc.id === transaction.account)
        ?.name.toLowerCase()
        .includes(searchTerm.toLowerCase())

    return matchesSearch
  })

  // Calcular estadísticas
  const totalIncome = transactions
    .filter((t) => t.transaction_type === "income")
    .reduce((sum, t) => sum + Number.parseFloat(t.amount), 0)

  const totalExpenses = transactions
    .filter((t) => t.transaction_type === "expense")
    .reduce((sum, t) => sum + Number.parseFloat(t.amount), 0)

  const netBalance = totalIncome - totalExpenses

  // Manejadores para los filtros
  const handleTransactionTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilters((prev) => ({
      ...prev,
      transactionType: e.target.value as "all" | TransactionType,
    }))
  }

  const handleAccountFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilters((prev) => ({ ...prev, accountID: e.target.value }))
  }

  const handleCategoryFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedCategoryId = e.target.value
    let selectedCategoryTypeModel: CategoryTypeModel | "all" = "all"

    if (selectedCategoryId !== "all") {
      if (defaultCategories.some((cat) => cat.id === Number.parseInt(selectedCategoryId))) {
        selectedCategoryTypeModel = "defaultcategory"
      } else if (categories.some((cat) => cat.id === Number.parseInt(selectedCategoryId))) {
        selectedCategoryTypeModel = "category"
      }
    }

    setFilters((prev) => ({
      ...prev,
      categoryID: selectedCategoryId,
      categoryTypeModel: selectedCategoryTypeModel,
    }))
  }

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 p-6 container mx-auto max-w-7xl">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-neutral-800 dark:text-neutral-100 mb-2">My Transactions</h1>
              <p className="text-neutral-600 dark:text-neutral-300">Track your income, expenses, and transfers</p>
            </div>
            {/* Solo mostrar el botón superior si hay transacciones Y hay cuentas */}
            {transactions.length > 0 && accounts.length > 0 && (
              <button
                onClick={() => setShowCreateTransactionModal(true)}
                className="group flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-button font-medium transition-all duration-200 shadow-card hover:shadow-card-hover"
              >
                <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-200" />
                Add Transaction
              </button>
            )}
          </div>

          {/* Statistics Cards - Solo mostrar si hay transacciones Y hay cuentas */}
          {transactions.length > 0 && accounts.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="card p-6 bg-gradient-to-r from-success-50 to-success-100 dark:from-success-900/20 dark:to-success-800/20 border-success-200 dark:border-success-700/50">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-success-500 rounded-full">
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-success-700 dark:text-success-300 mb-1">Total Income</p>
                    <div className="flex items-center gap-2">
                      {showBalances ? (
                        <p className="text-2xl font-bold text-success-600 dark:text-success-400">
                          ${totalIncome.toFixed(2)}
                        </p>
                      ) : (
                        <p className="text-2xl font-bold text-neutral-400">••••••</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="card p-6 bg-gradient-to-r from-error-50 to-error-100 dark:from-error-900/20 dark:to-error-800/20 border-error-200 dark:border-error-700/50">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-error-500 rounded-full">
                    <TrendingDown className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-error-700 dark:text-error-300 mb-1">Total Expenses</p>
                    <div className="flex items-center gap-2">
                      {showBalances ? (
                        <p className="text-2xl font-bold text-error-600 dark:text-error-400">
                          ${totalExpenses.toFixed(2)}
                        </p>
                      ) : (
                        <p className="text-2xl font-bold text-neutral-400">••••••</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="card p-6 bg-gradient-to-r from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 border-primary-200 dark:border-primary-700/50">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-primary-500 rounded-full">
                    <DollarSign className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-primary-700 dark:text-primary-300 mb-1">Net Balance</p>
                    <div className="flex items-center gap-3">
                      {showBalances ? (
                        <p
                          className={`text-2xl font-bold ${
                            netBalance >= 0
                              ? "text-success-600 dark:text-success-400"
                              : "text-error-600 dark:text-error-400"
                          }`}
                        >
                          ${netBalance.toFixed(2)}
                        </p>
                      ) : (
                        <p className="text-2xl font-bold text-neutral-400">••••••</p>
                      )}
                      <button
                        onClick={() => setShowBalances(!showBalances)}
                        className="p-1 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-input transition-colors duration-200"
                      >
                        {showBalances ? (
                          <EyeOff className="w-4 h-4 text-neutral-500" />
                        ) : (
                          <Eye className="w-4 h-4 text-neutral-500" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Filters and Search - Solo mostrar si hay transacciones Y hay cuentas */}
          {transactions.length > 0 && accounts.length > 0 && (
            <div className="card p-6 mb-6">
              <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="flex items-center gap-4 w-full md:w-auto flex-wrap">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400" />
                    <input
                      type="text"
                      placeholder="Search transactions..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-border-primary rounded-input bg-surface-primary text-neutral-800 dark:text-neutral-200 focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-border-focus transition-all duration-200"
                    />
                  </div>
                  <div className="relative">
                    <select
                      value={filters.transactionType}
                      onChange={handleTransactionTypeChange}
                      className="appearance-none bg-surface-primary border border-border-primary rounded-input px-4 py-2 pr-8 text-neutral-800 dark:text-neutral-200 focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-border-focus transition-all duration-200"
                    >
                      <option value="all">All Types</option>
                      <option value="income">Income</option>
                      <option value="expense">Expense</option>
                      <option value="transfer">Transfer</option>
                    </select>
                    <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
                  </div>
                  <div className="relative">
                    <select
                      value={filters.accountID}
                      onChange={handleAccountFilterChange}
                      className="appearance-none bg-surface-primary border border-border-primary rounded-input px-4 py-2 pr-8 text-neutral-800 dark:text-neutral-200 focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-border-focus transition-all duration-200"
                    >
                      <option value="all">All Accounts</option>
                      {accounts.map((acc) => (
                        <option key={`filter-acc-${acc.id}`} value={acc.id}>
                          {acc.name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
                  </div>
                  <div className="relative">
                    <select
                      value={filters.categoryID}
                      onChange={handleCategoryFilterChange}
                      className="appearance-none bg-surface-primary border border-border-primary rounded-input px-4 py-2 pr-8 text-neutral-800 dark:text-neutral-200 focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-border-focus transition-all duration-200"
                    >
                      <option value="all">All Categories</option>
                      {defaultCategories && defaultCategories.length > 0 && (
                        <optgroup label="Default Categories">
                          {defaultCategories.map((cat) => (
                            <option key={`filter-default-${cat.id}`} value={cat.id}>
                              {cat.icon} {cat.name}
                            </option>
                          ))}
                        </optgroup>
                      )}
                      {categories && categories.length > 0 && (
                        <optgroup label="Your Categories">
                          {categories.map((cat) => (
                            <option key={`filter-user-${cat.id}`} value={cat.id}>
                              {cat.icon} {cat.name}
                            </option>
                          ))}
                        </optgroup>
                      )}
                    </select>
                    <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-neutral-600 dark:text-neutral-400">
                    {filteredTransactions.length} transactions
                  </span>
                  <button
                    onClick={() => setShowManageCategoriesModal(true)}
                    className="flex items-center gap-2 px-4 py-2 text-sm bg-surface-secondary hover:bg-neutral-100 dark:hover:bg-neutral-700 border border-border-primary rounded-input transition-colors duration-200"
                  >
                    <Settings className="w-4 h-4" />
                    Manage Categories
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Transactions List */}
        {accounts.length === 0 ? (
          // Mensaje cuando no hay cuentas
          <div className="card p-12 text-center">
            <div className="max-w-lg mx-auto">
              <div className="p-4 bg-warning-100 dark:bg-warning-900/30 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                <Building2 className="w-10 h-10 text-warning-600" />
              </div>
              <h3 className="text-xl font-semibold text-neutral-800 dark:text-neutral-100 mb-3">
                No accounts available
              </h3>
              <p className="text-neutral-600 dark:text-neutral-400 mb-8 leading-relaxed">
                You cannot record transactions without having any accounts first. Accounts are required to track where
                your money comes from and goes to.
              </p>
              <Link
                href="/pages/dashboard"
                className="group inline-flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white px-8 py-4 rounded-button font-medium transition-all duration-200 shadow-card hover:shadow-card-hover"
              >
                <Building2 className="w-5 h-5" />
                Go to Accounts Page
                <ExternalLink className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
              </Link>
            </div>
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="card p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="p-4 bg-primary-100 dark:bg-primary-900/30 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                <FileText className="w-10 h-10 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-neutral-800 dark:text-neutral-100 mb-3">
                {transactions.length === 0 ? "No transactions yet" : "No matching transactions"}
              </h3>
              <p className="text-neutral-600 dark:text-neutral-400 mb-8 leading-relaxed">
                {transactions.length === 0
                  ? "Start by recording your first transaction to track your finances."
                  : "Try adjusting your search or filter criteria."}
              </p>
              {/* Botón con animación llamativa solo cuando no hay transacciones */}
              {transactions.length === 0 && (
                <button
                  onClick={() => setShowCreateTransactionModal(true)}
                  className="group inline-flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white px-8 py-4 rounded-button font-medium transition-all duration-1500 shadow-card hover:shadow-card-hover animate-bounce hover:animate-none"
                >
                  <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-200" />
                  Record First Transaction
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-border-primary">
                <thead className="bg-surface-secondary">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-neutral-600 dark:text-neutral-300 uppercase tracking-wider">
                      Transaction
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-neutral-600 dark:text-neutral-300 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-neutral-600 dark:text-neutral-300 uppercase tracking-wider">
                      Account
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-neutral-600 dark:text-neutral-300 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-neutral-600 dark:text-neutral-300 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-medium text-neutral-600 dark:text-neutral-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-surface-primary divide-y divide-border-primary">
                  {filteredTransactions.map((transaction) => {
                    const categoryInfo = getCategoryInfo(transaction)
                    return (
                      <tr key={transaction.id} className="hover:bg-surface-secondary transition-colors duration-150">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            {getTransactionIcon(transaction.transaction_type)}
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-neutral-800 dark:text-neutral-200 capitalize">
                                  {transaction.transaction_type}
                                </span>
                              </div>
                              {transaction.notes && (
                                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 max-w-xs truncate">
                                  {transaction.notes}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`text-lg font-semibold ${
                              transaction.transaction_type === "expense"
                                ? "text-error-600 dark:text-error-400"
                                : transaction.transaction_type === "income"
                                  ? "text-success-600 dark:text-success-400"
                                  : "text-primary-600 dark:text-primary-400"
                            }`}
                          >
                            {transaction.transaction_type === "expense" ? "-" : ""}$
                            {Number.parseFloat(transaction.amount).toFixed(2)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="p-1 bg-neutral-100 dark:bg-neutral-700 rounded text-neutral-600 dark:text-neutral-300">
                              {getAccountIcon(transaction.account)}
                            </div>
                            <span className="text-sm text-neutral-700 dark:text-neutral-300">
                              {accounts.find((acc) => acc.id === transaction.account)?.name || "N/A"}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-8 h-8 rounded-input flex items-center justify-center text-sm border"
                              style={{
                                backgroundColor: `${categoryInfo.color}20`,
                                borderColor: `${categoryInfo.color}40`,
                              }}
                            >
                              {categoryInfo.icon}
                            </div>
                            <div>
                              <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                {categoryInfo.name}
                              </span>
                              {categoryInfo.isDefault && (
                                <div className="text-xs text-neutral-500 dark:text-neutral-400">Default</div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
                            <Calendar className="w-4 h-4" />
                            {new Date(transaction.created_at).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => handleDeleteTransaction(transaction.id)}
                            className="p-2 hover:bg-error-50 dark:hover:bg-error-900/20 text-error-500 hover:text-error-600 rounded-input transition-all duration-200"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Create Transaction Modal - Solo mostrar si hay cuentas */}
        {showCreateTransactionModal && accounts.length > 0 && (
          <div className="fixed inset-0 bg-neutral-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="card w-full max-w-2xl bg-surface-primary max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-border-primary">
                <h2 className="text-xl font-semibold text-neutral-800 dark:text-neutral-100">Record New Transaction</h2>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                  Add a new income, expense, or transfer
                </p>
              </div>

              <div className="p-6 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                      Transaction Type
                    </label>
                    <div className="relative">
                      <select
                        value={type}
                        onChange={(e) => setType(e.target.value as TransactionType)}
                        className="inputElement appearance-none pr-8"
                      >
                        <option value="expense">Expense</option>
                        <option value="income">Income</option>
                        <option value="transfer">Transfer</option>
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                      Amount
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400" />
                      <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="inputElement pl-10"
                        placeholder="0.00"
                        step="0.01"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    Account
                  </label>
                  <div className="relative">
                    <select
                      value={accountID}
                      onChange={(e) => setAccountID(e.target.value)}
                      className="inputElement appearance-none pr-8"
                    >
                      <option value="">Select Account</option>
                      {accounts.map((acc) => (
                        <option key={acc.id} value={acc.id}>
                          {acc.name} ({acc.acc_type})
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    Category
                  </label>
                  <div className="relative">
                    <select
                      value={categoryID}
                      onChange={(e) => {
                        const selectedCategoryId = Number.parseInt(e.target.value)
                        setCategoryID(e.target.value)

                        if (defaultCategories.some((cat) => cat.id === selectedCategoryId)) {
                          setCategoryTypeModel("defaultcategory")
                        } else if (categories.some((cat) => cat.id === selectedCategoryId)) {
                          setCategoryTypeModel("category")
                        } else {
                          setCategoryTypeModel("defaultcategory")
                        }
                      }}
                      className="inputElement appearance-none pr-8"
                    >
                      <option value="">Select Category</option>
                      {defaultCategories && defaultCategories.length > 0 && (
                        <optgroup label="Default Categories">
                          {defaultCategories.map((cat) => (
                            <option key={`default-${cat.id}`} value={cat.id}>
                              {cat.icon} {cat.name}
                            </option>
                          ))}
                        </optgroup>
                      )}
                      {categories && categories.length > 0 && (
                        <optgroup label="Your Categories">
                          {categories.map((cat) => (
                            <option key={`user-${cat.id}`} value={cat.id}>
                              {cat.icon} {cat.name}
                            </option>
                          ))}
                        </optgroup>
                      )}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    Notes (Optional)
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="inputElement h-24 resize-none"
                    placeholder="Add any additional details about this transaction..."
                  />
                </div>
              </div>

              <div className="p-6 border-t border-border-primary flex gap-3 justify-end">
                <button onClick={() => setShowCreateTransactionModal(false)} className="secondaryButton px-6 py-2">
                  Cancel
                </button>
                <button onClick={handleCreateTransaction} className="submitButton px-6 py-2">
                  <span className="flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    Record Transaction
                  </span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Manage Categories Modal */}
        {showManageCategoriesModal && <ManageCategoriesModal onClose={() => setShowManageCategoriesModal(false)} />}

        {/* Message Modal */}
        <MessageModal
          isOpen={messageModal.isOpen}
          onClose={() => setMessageModal({ ...messageModal, isOpen: false })}
          type={messageModal.type}
          title={messageModal.title}
          message={messageModal.message}
          onConfirm={messageModal.onConfirm}
          confirmText="Delete Transaction"
          cancelText="Keep Transaction"
        />
      </main>
    </div>
  )
}

export default TransactionsPage
