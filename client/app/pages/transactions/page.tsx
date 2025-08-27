"use client";

import type React from "react";
import { useState } from "react";
import type {
  CategoryTypeModel,
  TransactionType,
} from "../../interfaces/api_interfaces";
import { useExpenseContext } from "@/app/context/Context";
import { initialFilters } from "@/app/interfaces/interfaces";
import ManageCategoriesModal from "@/app/components/ManageCategoriesModal";
import TransactionRow from "@/app/components/TransactionRow";
import {
  Plus,
  DollarSign,
  Settings,
  Eye,
  EyeOff,
  TrendingUp,
  TrendingDown,
  FileText,
  ChevronDown,
  Search,
} from "lucide-react";

const TransactionsPage: React.FC = () => {
  const { transactions, categories, defaultCategories, setFilters, filters } =
    useExpenseContext();

  const [showManageCategoriesModal, setShowManageCategoriesModal] =
    useState(false);
  const [showBalances, setShowBalances] = useState(true);
  const [showNewRow, setShowNewRow] = useState(false);

  // Estados para inline editing
  const [editingCell, setEditingCell] = useState<{
    transactionId: number;
    field: "amount" | "notes" | "category";
  } | null>(null);

  // Función para verificar si los filtros están en su estado inicial
  const isFiltersAtInitialState = () => {
    return (
      filters.transactionType === initialFilters.transactionType &&
      filters.categoryID === initialFilters.categoryID &&
      filters.categoryTypeModel === initialFilters.categoryTypeModel &&
      filters.date === initialFilters.date &&
      filters.keywords === initialFilters.keywords
    );
  };

  // Inline editing functions
  const startEdit = (
    transactionId: number,
    field: "amount" | "notes" | "category"
  ) => {
    setEditingCell({ transactionId, field });
  };

  const cancelEdit = () => {
    setEditingCell(null);
  };

  const handleNewTransaction = () => {
    // CLAUDE, this function triggers, but no row is appearing
    setShowNewRow(true);
  };

  const cancelNewTransaction = () => {
    setShowNewRow(false);
  };

  // Calcular estadísticas
  const totalIncome = transactions
    .filter((t) => !t.is_expense)
    .reduce((sum, t) => sum + Number.parseFloat(t.amount), 0);

  const totalExpenses = transactions
    .filter((t) => t.is_expense)
    .reduce((sum, t) => sum + Number.parseFloat(t.amount), 0);

  const netBalance = totalIncome - totalExpenses;

  // Manejadores para los filtros
  const handleTransactionTypeChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setFilters((prev) => ({
      ...prev,
      transactionType: e.target.value as "all" | TransactionType,
    }));
  };

  const handleCategoryFilterChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const selectedCategoryId = e.target.value;
    let selectedCategoryTypeModel: CategoryTypeModel | "all" = "all";

    if (selectedCategoryId !== "all") {
      if (
        defaultCategories.some(
          (cat) => cat.id === Number.parseInt(selectedCategoryId)
        )
      ) {
        selectedCategoryTypeModel = "defaultcategory";
      } else if (
        categories.some((cat) => cat.id === Number.parseInt(selectedCategoryId))
      ) {
        selectedCategoryTypeModel = "category";
      }
    }

    setFilters((prev) => ({
      ...prev,
      categoryID: selectedCategoryId,
      categoryTypeModel: selectedCategoryTypeModel,
    }));
  };

  const handleDateFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters((prev) => ({
      ...prev,
      date: e.target.value || "all",
    }));
  };

  const handleKeywordsFilterChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFilters((prev) => ({
      ...prev,
      keywords: e.target.value || "all",
    }));
  };

  // Condición para mostrar estadísticas y filtros
  const shouldShowStatsAndFilters =
    transactions.length > 0 || !isFiltersAtInitialState();

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 p-2 sm:p-4 w-full max-w-none">
        {/* Compact Header Section */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-neutral-800 dark:text-neutral-100 mb-1">
                Transactions
              </h1>
              <p className="text-sm text-neutral-600 dark:text-neutral-300">
                Track your income and expenses
              </p>
            </div>
            {/* Move manage categories button here in top right corner */}
            {shouldShowStatsAndFilters && (
              <button
                onClick={() => setShowManageCategoriesModal(true)}
                className="flex items-center gap-2 px-3 py-2 text-xs bg-surface-secondary hover:bg-neutral-100 dark:hover:bg-neutral-700 border border-border-primary rounded-input transition-colors duration-200 text-neutral-600 dark:text-neutral-400"
              >
                <Settings className="w-3 h-3 flex-shrink-0" />
                <span className="hidden sm:inline">Categories</span>
              </button>
            )}
          </div>

          {/* Compact Statistics Cards */}
          {shouldShowStatsAndFilters && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-4">
              <div className="card p-4 bg-gradient-to-r from-success-50 to-success-100 dark:from-success-900/20 dark:to-success-800/20 border-success-200 dark:border-success-700/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-success-500 rounded-full">
                    <TrendingUp className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-success-700 dark:text-success-300 mb-1">
                      Total Income
                    </p>
                    <div className="flex items-center gap-2">
                      {showBalances ? (
                        <p className="text-lg font-bold text-success-600 dark:text-success-400">
                          ${totalIncome.toFixed(2)}
                        </p>
                      ) : (
                        <p className="text-lg font-bold text-neutral-400">
                          ••••••
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="card p-4 bg-gradient-to-r from-error-50 to-error-100 dark:from-error-900/20 dark:to-error-800/20 border-error-200 dark:border-error-700/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-error-500 rounded-full">
                    <TrendingDown className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-error-700 dark:text-error-300 mb-1">
                      Total Expenses
                    </p>
                    <div className="flex items-center gap-2">
                      {showBalances ? (
                        <p className="text-lg font-bold text-error-600 dark:text-error-400">
                          ${totalExpenses.toFixed(2)}
                        </p>
                      ) : (
                        <p className="text-lg font-bold text-neutral-400">
                          ••••••
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="card p-4 bg-gradient-to-r from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 border-primary-200 dark:border-primary-700/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary-500 rounded-full">
                    <DollarSign className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-primary-700 dark:text-primary-300 mb-1">
                      Net Balance
                    </p>
                    <div className="flex items-center gap-3">
                      {showBalances ? (
                        <p
                          className={`text-lg font-bold ${
                            netBalance >= 0
                              ? "text-success-600 dark:text-success-400"
                              : "text-error-600 dark:text-error-400"
                          }`}
                        >
                          ${netBalance.toFixed(2)}
                        </p>
                      ) : (
                        <p className="text-lg font-bold text-neutral-400">
                          ••••••
                        </p>
                      )}
                      <button
                        onClick={() => setShowBalances(!showBalances)}
                        className="p-1 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-input transition-colors duration-200"
                      >
                        {showBalances ? (
                          <EyeOff className="w-3 h-3 text-neutral-500" />
                        ) : (
                          <Eye className="w-3 h-3 text-neutral-500" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Compact Filters */}
          {shouldShowStatsAndFilters && (
            <div className="card p-3 mb-4">
              <div className="flex flex-col sm:flex-row gap-3 items-start">
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full">
                  <div className="relative flex-1 min-w-0">
                    <select
                      value={filters.transactionType}
                      onChange={handleTransactionTypeChange}
                      className="appearance-none bg-surface-primary border border-border-primary rounded-input px-2 py-1.5 pr-6 text-neutral-800 dark:text-neutral-200 focus:outline-none focus:ring-1 focus:ring-primary-200 focus:border-border-focus transition-all duration-200 w-full text-sm"
                    >
                      <option value="all">All Types</option>
                      <option value="income">Income</option>
                      <option value="expense">Expense</option>
                    </select>
                    <ChevronDown className="absolute right-1.5 top-1/2 transform -translate-y-1/2 w-3 h-3 text-neutral-400 pointer-events-none" />
                  </div>
                  <div className="relative flex-1 min-w-0">
                    <select
                      value={filters.categoryID}
                      onChange={handleCategoryFilterChange}
                      className="appearance-none bg-surface-primary border border-border-primary rounded-input px-2 py-1.5 pr-6 text-neutral-800 dark:text-neutral-200 focus:outline-none focus:ring-1 focus:ring-primary-200 focus:border-border-focus transition-all duration-200 w-full text-sm"
                    >
                      <option value="all">All Categories</option>
                      {defaultCategories && defaultCategories.length > 0 && (
                        <optgroup label="Default Categories">
                          {defaultCategories.map((cat) => (
                            <option
                              key={`filter-default-${cat.id}`}
                              value={cat.id}
                            >
                              {cat.icon} {cat.name}
                            </option>
                          ))}
                        </optgroup>
                      )}
                      {categories && categories.length > 0 && (
                        <optgroup label="Your Categories">
                          {categories.map((cat) => (
                            <option
                              key={`filter-user-${cat.id}`}
                              value={cat.id}
                            >
                              {cat.icon} {cat.name}
                            </option>
                          ))}
                        </optgroup>
                      )}
                    </select>
                    <ChevronDown className="absolute right-1.5 top-1/2 transform -translate-y-1/2 w-3 h-3 text-neutral-400 pointer-events-none" />
                  </div>
                  <div className="relative flex-1 min-w-0">
                    <input
                      type="date"
                      value={filters.date === "all" ? "" : filters.date}
                      onChange={handleDateFilterChange}
                      className="bg-surface-primary border border-border-primary rounded-input px-2 py-1.5 text-neutral-800 dark:text-neutral-200 focus:outline-none focus:ring-1 focus:ring-primary-200 focus:border-border-focus transition-all duration-200 w-full text-sm"
                      placeholder="Filter by date"
                    />
                  </div>
                  <div className="relative flex-1 min-w-0">
                    <input
                      type="text"
                      value={filters.keywords === "all" ? "" : filters.keywords}
                      onChange={handleKeywordsFilterChange}
                      className="bg-surface-primary border border-border-primary rounded-input px-2 py-1.5 pl-7 text-neutral-800 dark:text-neutral-200 focus:outline-none focus:ring-1 focus:ring-primary-200 focus:border-border-focus transition-all duration-200 w-full text-sm"
                      placeholder="Search..."
                    />
                    <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-neutral-400 pointer-events-none" />
                  </div>
                </div>
                <span className="text-xs text-neutral-600 dark:text-neutral-400 self-center whitespace-nowrap">
                  {transactions.length} items
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Large Transactions Table */}
        <div
          className="flex-1 flex flex-col"
          style={{ minHeight: "calc(100vh - 300px)" }}
        >
          {transactions.length === 0 && !showNewRow ? (
            <div className="card p-12 text-center flex-1 flex items-center justify-center">
              <div className="max-w-md mx-auto">
                <div className="p-4 bg-primary-100 dark:bg-primary-900/30 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                  <FileText className="w-10 h-10 text-primary-600" />
                </div>
                <h3 className="text-xl font-semibold text-neutral-800 dark:text-neutral-100 mb-3">
                  {isFiltersAtInitialState()
                    ? "No transactions yet"
                    : "No matching transactions"}
                </h3>
                <p className="text-neutral-600 dark:text-neutral-400 mb-8 leading-relaxed">
                  {isFiltersAtInitialState()
                    ? "Start by recording your first transaction to track your finances."
                    : "No transactions match your current filter criteria. Try adjusting your filters or create a new transaction."}
                </p>
                {/* Botón con animación llamativa solo cuando no hay transacciones y filtros están en estado inicial */}
                {isFiltersAtInitialState() && (
                  <button
                    onClick={handleNewTransaction}
                    className="group inline-flex items-center gap-2 bg-primary-500 hover:bg-primary-600
          text-white px-6 py-4 rounded-button font-medium transition-all duration-1500
            shadow-card hover:shadow-card-hover animate-gentle-bounce hover:animate-none"
                  >
                    <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-200" />
                    <span>Record First Transaction</span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="card overflow-hidden flex-1 flex flex-col">
              {/* Record New Transaction Button */}
              {!showNewRow && (
                <div className="p-4 border-b border-border-primary">
                  <button
                    onClick={handleNewTransaction}
                    className="w-full group flex items-center justify-center gap-2 bg-primary-500 hover:bg-primary-600 text-white px-4 py-3 rounded-button font-medium transition-all duration-200 shadow-card hover:shadow-card-hover"
                  >
                    <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-200" />
                    <span>Record New Transaction</span>
                  </button>
                </div>
              )}
              <div className="overflow-x-auto flex-1">
                <table className="min-w-full divide-y-2 divide-border-primary h-full">
                  <thead className="bg-surface-secondary border-b-2 border-border-primary">
                    <tr>
                      <th className="px-4 sm:px-6 py-4 text-left text-sm font-semibold text-neutral-700 dark:text-neutral-200 uppercase tracking-wider border-r border-border-primary">
                        Transaction
                      </th>
                      <th className="px-4 sm:px-6 py-4 text-left text-sm font-semibold text-neutral-700 dark:text-neutral-200 uppercase tracking-wider border-r border-border-primary">
                        Amount
                      </th>
                      <th className="px-4 sm:px-6 py-4 text-left text-sm font-semibold text-neutral-700 dark:text-neutral-200 uppercase tracking-wider border-r border-border-primary">
                        Category
                      </th>
                      <th className="px-4 sm:px-6 py-4 text-left text-sm font-semibold text-neutral-700 dark:text-neutral-200 uppercase tracking-wider border-r border-border-primary hidden md:table-cell">
                        Date
                      </th>
                      <th className="px-4 sm:px-6 py-4 text-right text-sm font-semibold text-neutral-700 dark:text-neutral-200 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-surface-primary divide-y divide-border-primary">
                    {showNewRow && (
                      <TransactionRow
                        isNew={true}
                        onCancel={cancelNewTransaction}
                        onEdit={startEdit}
                      />
                    )}
                    {transactions.map((transaction) => (
                      <TransactionRow
                        key={transaction.id}
                        transaction={transaction}
                        isEditing={
                          editingCell?.transactionId === transaction.id
                        }
                        editingField={
                          editingCell?.transactionId === transaction.id
                            ? editingCell.field
                            : null
                        }
                        onCancel={cancelEdit}
                        onEdit={startEdit}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Manage Categories Modal */}
        {showManageCategoriesModal && (
          <ManageCategoriesModal
            onClose={() => setShowManageCategoriesModal(false)}
          />
        )}
      </main>
    </div>
  );
};

export default TransactionsPage;
