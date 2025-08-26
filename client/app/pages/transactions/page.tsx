"use client";

import type React from "react";
import { useState } from "react";
import type {
  CategoryTypeModel,
  CreateTransactionPayload,
  TransactionType,
  Transaction,
} from "../../interfaces/api_interfaces";
import { useExpenseContext } from "@/app/components/Context";
import { initialFilters } from "@/app/interfaces/interfaces";
import ManageCategoriesModal from "@/app/components/ManageCategoriesModal";
import MessageModal from "@/app/components/MessageModal";
import {
  Plus,
  ArrowUpCircle,
  ArrowDownCircle,
  Calendar,
  DollarSign,
  Settings,
  Trash2,
  Eye,
  EyeOff,
  TrendingUp,
  TrendingDown,
  FileText,
  ChevronDown,
  Search,
} from "lucide-react";

const TransactionsPage: React.FC = () => {
  const {
    transactions,
    categories,
    createTransaction,
    deleteTransaction,
    defaultCategories,
    setFilters,
    filters,
  } = useExpenseContext();

  const [showCreateTransactionModal, setShowCreateTransactionModal] =
    useState(false);
  const [showManageCategoriesModal, setShowManageCategoriesModal] =
    useState(false);
  const [showBalances, setShowBalances] = useState(true);

  // Estados para el MessageModal
  const [messageModal, setMessageModal] = useState({
    isOpen: false,
    type: "info" as "success" | "error" | "warning" | "info" | "confirm",
    title: "",
    message: "",
    onConfirm: undefined as (() => void) | undefined,
  });

  // Estados para el formulario de nueva transacción
  const [amount, setAmount] = useState("");
  const [categoryID, setCategoryID] = useState("");
  const [categoryTypeModel, setCategoryTypeModel] =
    useState<CategoryTypeModel>("defaultcategory");
  const [isExpense, setIsExpense] = useState(true);
  const [notes, setNotes] = useState("");

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

  const showMessage = (
    type: "success" | "error" | "warning" | "info" | "confirm",
    title: string,
    message: string,
    onConfirm?: () => void
  ) => {
    setMessageModal({
      isOpen: true,
      type,
      title,
      message,
      onConfirm,
    });
  };

  const handleCreateTransaction = async () => {
    if (
      amount.trim() === "" ||
      Number.isNaN(Number.parseFloat(amount)) ||
      categoryID === ""
    ) {
      showMessage(
        "error",
        "Validation Error",
        "Please fill in all required fields: Amount and Category."
      );
      return;
    }

    const payload: CreateTransactionPayload = {
      amount: amount,
      category_id: Number.parseInt(categoryID),
      category_type_model: categoryTypeModel,
      is_expense: isExpense,
      notes: notes,
    };

    const custom_response = await createTransaction(payload);

    if (custom_response.success) {
      setAmount("");
      setCategoryID("");
      setIsExpense(true);
      setNotes("");
      setShowCreateTransactionModal(false);
      showMessage(
        "success",
        "Transaction Recorded",
        `Your ${
          isExpense ? "expense" : "income"
        } transaction has been recorded successfully!`
      );
    } else {
      const error_details = custom_response.error_details;
      let fieldError = Object.keys(error_details)[0];
      fieldError = fieldError.split("_").join(" ");
      const messageToUser = Object.values(error_details)[0][0];
      showMessage("error", "Error in input " + fieldError, messageToUser);
    }
  };

  const handleDeleteTransaction = async (id: number) => {
    showMessage(
      "confirm",
      "Delete Transaction",
      "Are you sure you want to delete this transaction? This action cannot be undone.",
      async () => {
        await deleteTransaction(id);
        showMessage(
          "success",
          "Transaction Deleted",
          "The transaction has been deleted successfully."
        );
      }
    );
  };

  const getCategoryInfo = (transaction: Transaction) => {
    const defaultCategory = defaultCategories.find(
      (cat) =>
        cat.id === transaction.category_id &&
        transaction.category_type_model.includes("default")
    );
    if (defaultCategory) {
      return {
        name: defaultCategory.name,
        icon: defaultCategory.icon,
        color: defaultCategory.color,
        isDefault: true,
      };
    }

    const userCategory = categories.find(
      (cat) =>
        cat.id === transaction.category_id &&
        transaction.category_type_model.includes("category")
    );
    if (userCategory) {
      return {
        name: userCategory.name,
        icon: userCategory.icon,
        color: userCategory.color,
        isDefault: false,
      };
    }

    return {
      name: "N/A",
      icon: "📦",
      color: "#6B7280",
      isDefault: false,
    };
  };

  const getTransactionIcon = (isExpense: boolean) => {
    return isExpense ? (
      <ArrowDownCircle className="w-5 h-5 text-error-500" />
    ) : (
      <ArrowUpCircle className="w-5 h-5 text-success-500" />
    );
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

  const handleKeywordsFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
                My Transactions
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
        <div className="flex-1 flex flex-col" style={{minHeight: 'calc(100vh - 300px)'}}>
        {transactions.length === 0 ? (
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
                  onClick={() => setShowCreateTransactionModal(true)}
                  className="group inline-flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white px-6 py-4 rounded-button font-medium transition-all duration-300 shadow-card hover:shadow-card-hover animate-pulse hover:animate-none"
                >
                  <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-200" />
                  <span>Record First Transaction</span>
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="card overflow-hidden flex-1 flex flex-col">
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
                  {transactions.map((transaction) => {
                    const categoryInfo = getCategoryInfo(transaction);
                    return (
                      <tr
                        key={transaction.id}
                        className="hover:bg-surface-secondary transition-colors duration-150 border-b border-border-primary/50"
                      >
                        <td className="px-4 sm:px-6 py-4 border-r border-border-primary/30">
                          <div className="flex items-center gap-2 sm:gap-3">
                            {getTransactionIcon(transaction.is_expense)}
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-xs sm:text-sm font-medium text-neutral-800 dark:text-neutral-200 capitalize">
                                  {transaction.is_expense
                                    ? "Expense"
                                    : "Income"}
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
                        <td className="px-4 sm:px-6 py-4 border-r border-border-primary/30">
                          <span
                            className={`text-sm sm:text-lg font-semibold ${
                              transaction.is_expense
                                ? "text-error-600 dark:text-error-400"
                                : "text-success-600 dark:text-success-400"
                            }`}
                          >
                            {transaction.is_expense ? "-" : "+"}$
                            {Number.parseFloat(transaction.amount).toFixed(2)}
                          </span>
                          {/* Show date on mobile when date column is hidden */}
                          <div className="md:hidden text-xs text-neutral-500 dark:text-neutral-400 mt-1 flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(
                              transaction.created_at
                            ).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-4 sm:px-6 py-4 border-r border-border-primary/30">
                          <div className="flex items-center gap-1 sm:gap-2">
                            <div
                              className="w-6 h-6 sm:w-8 sm:h-8 rounded-input flex items-center justify-center text-xs sm:text-sm border"
                              style={{
                                backgroundColor: `${categoryInfo.color}20`,
                                borderColor: `${categoryInfo.color}40`,
                              }}
                            >
                              {categoryInfo.icon}
                            </div>
                            <div className="min-w-0">
                              <span className="text-xs sm:text-sm font-medium text-neutral-700 dark:text-neutral-300 truncate block">
                                {categoryInfo.name}
                              </span>
                              {categoryInfo.isDefault && (
                                <div className="text-xs text-neutral-500 dark:text-neutral-400">
                                  Default
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 sm:px-6 py-4 border-r border-border-primary/30 hidden md:table-cell">
                          <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
                            <Calendar className="w-4 h-4" />
                            {new Date(
                              transaction.created_at
                            ).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-4 sm:px-6 py-4 text-right">
                          <button
                            onClick={() =>
                              handleDeleteTransaction(transaction.id)
                            }
                            className="p-1 sm:p-2 hover:bg-error-50 dark:hover:bg-error-900/20 text-error-500 hover:text-error-600 rounded-input transition-all duration-200"
                          >
                            <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {/* Full-width Add Transaction Button */}
            <div className="p-4 border-t border-border-primary">
              <button
                onClick={() => setShowCreateTransactionModal(true)}
                className="w-full group flex items-center justify-center gap-2 bg-primary-500 hover:bg-primary-600 text-white px-4 py-3 rounded-button font-medium transition-all duration-200 shadow-card hover:shadow-card-hover"
              >
                <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-200" />
                <span>Add New Transaction</span>
              </button>
            </div>
          </div>
        )}
        </div>

        {/* Create Transaction Modal */}
        {showCreateTransactionModal && (
          <div className="fixed inset-0 bg-neutral-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4">
            <div className="card w-full max-w-2xl bg-surface-primary max-h-[90vh] overflow-y-auto">
              <div className="p-4 sm:p-6 border-b border-border-primary">
                <h2 className="text-lg sm:text-xl font-semibold text-neutral-800 dark:text-neutral-100">
                  Record New Transaction
                </h2>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                  Add a new income or expense
                </p>
              </div>

              <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                      Transaction Type
                    </label>
                    <div className="relative">
                      <select
                        value={isExpense ? "expense" : "income"}
                        onChange={(e) =>
                          setIsExpense(e.target.value === "expense")
                        }
                        className="inputElement appearance-none pr-8"
                      >
                        <option value="expense">Expense</option>
                        <option value="income">Income</option>
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
                    Category
                  </label>
                  <div className="relative">
                    <select
                      value={categoryID}
                      onChange={(e) => {
                        const selectedCategoryId = Number.parseInt(
                          e.target.value
                        );
                        setCategoryID(e.target.value);

                        if (
                          defaultCategories.some(
                            (cat) => cat.id === selectedCategoryId
                          )
                        ) {
                          setCategoryTypeModel("defaultcategory");
                        } else if (
                          categories.some(
                            (cat) => cat.id === selectedCategoryId
                          )
                        ) {
                          setCategoryTypeModel("category");
                        } else {
                          setCategoryTypeModel("defaultcategory");
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

              <div className="p-4 sm:p-6 border-t border-border-primary flex flex-col sm:flex-row gap-3 justify-end">
                <button
                  onClick={() => setShowCreateTransactionModal(false)}
                  className="secondaryButton px-4 sm:px-6 py-2 order-2 sm:order-1"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateTransaction}
                  className="submitButton px-4 sm:px-6 py-2 order-1 sm:order-2"
                >
                  <span className="flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    <span className="hidden sm:inline">Record Transaction</span>
                    <span className="sm:hidden">Record</span>
                  </span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Manage Categories Modal */}
        {showManageCategoriesModal && (
          <ManageCategoriesModal
            onClose={() => setShowManageCategoriesModal(false)}
          />
        )}

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
  );
};

export default TransactionsPage;
