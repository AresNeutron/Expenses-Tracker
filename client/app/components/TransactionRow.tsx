"use client";

import type React from "react";
import { useState, useEffect } from "react";
import type {
  CategoryTypeModel,
  CreateTransactionPayload,
  Transaction,
} from "../interfaces/api_interfaces";
import { useExpenseContext } from "../context/Context";
import {
  ArrowUpCircle,
  ArrowDownCircle,
  Calendar,
  Trash2,
  Save,
  X,
  ChevronDown,
} from "lucide-react";

interface TransactionRowProps {
  transaction?: Transaction;
  isNew?: boolean;
  isEditing?: boolean;
  editingField?: "amount" | "notes" | "category" | null;
  onCancel: () => void;
  onEdit: (
    transactionId: number,
    field: "amount" | "notes" | "category"
  ) => void;
}

const TransactionRow: React.FC<TransactionRowProps> = ({
  transaction,
  isNew = false,
  isEditing = false,
  editingField,
  onCancel,
  onEdit,
}) => {
  const {
    categories,
    defaultCategories,
    createTransaction,
    updateTransaction,
    deleteTransaction,
    showMessage,
  } = useExpenseContext();

  // Form state for new/editing transactions
  const [amount, setAmount] = useState(isNew ? "0" : transaction?.amount || "");
  const [categoryID, setCategoryID] = useState(
    isNew ? "10" : transaction?.category_id.toString() || ""
  );
  const [categoryTypeModel, setCategoryTypeModel] = useState<CategoryTypeModel>(
    isNew
      ? "defaultcategory"
      : transaction?.category_type_model || "defaultcategory"
  );
  const [isExpense, setIsExpense] = useState<boolean>(
    isNew ? true : transaction?.is_expense || true
  );
  const [notes, setNotes] = useState(isNew ? "" : transaction?.notes || "");

  // Editing state for inline editing
  const [editingValue, setEditingValue] = useState<string>("");
  const [editingCategory, setEditingCategory] = useState<{
    categoryId: string;
    categoryTypeModel: CategoryTypeModel;
  }>({ categoryId: "", categoryTypeModel: "defaultcategory" });

  // Initialize editing values when editing starts
  useEffect(() => {
    if (isEditing && transaction && editingField) {
      if (editingField === "amount") {
        setEditingValue(transaction.amount);
      } else if (editingField === "notes") {
        setEditingValue(transaction.notes || "");
      } else if (editingField === "category") {
        setEditingCategory({
          categoryId: transaction.category_id.toString(),
          categoryTypeModel: transaction.category_type_model,
        });
      }
    }
  }, [isEditing, transaction, editingField]);

  const handleCategoryChange = (selectedCategoryId: string) => {
    let selectedCategoryTypeModel: CategoryTypeModel = "defaultcategory";

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

    if (isNew) {
      setCategoryID(selectedCategoryId);
      setCategoryTypeModel(selectedCategoryTypeModel);
    } else {
      setEditingCategory({
        categoryId: selectedCategoryId,
        categoryTypeModel: selectedCategoryTypeModel,
      });
    }
  };

  const getCategoryInfo = (transactionData: Transaction) => {
    const defaultCategory = defaultCategories.find(
      (cat) =>
        cat.id === transactionData.category_id &&
        transactionData.category_type_model.includes("default")
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
        cat.id === transactionData.category_id &&
        transactionData.category_type_model.includes("category")
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

  const getTransactionIcon = (isExpenseValue: boolean) => {
    return isExpenseValue ? (
      <ArrowDownCircle className="w-5 h-5 text-error-500" />
    ) : (
      <ArrowUpCircle className="w-5 h-5 text-success-500" />
    );
  };

  const handleSave = async () => {
    if (isNew) {
      // Create new transaction
      const payload: CreateTransactionPayload = {
        amount: amount,
        category_id: Number.parseInt(categoryID),
        category_type_model: categoryTypeModel,
        is_expense: isExpense,
        notes: notes,
      };

      await createTransaction(payload);
      onCancel(); // Close the new row after successful creation
    } else if (transaction && editingField) {
      // Update existing transaction
      let payload: CreateTransactionPayload;

      if (editingField === "amount") {
        payload = {
          amount: editingValue,
          category_id: transaction.category_id,
          category_type_model: transaction.category_type_model,
          is_expense: transaction.is_expense,
          notes: transaction.notes,
        };
      } else if (editingField === "notes") {
        payload = {
          amount: transaction.amount,
          category_id: transaction.category_id,
          category_type_model: transaction.category_type_model,
          is_expense: transaction.is_expense,
          notes: editingValue,
        };
      } else if (editingField === "category") {
        payload = {
          amount: transaction.amount,
          category_id: Number.parseInt(editingCategory.categoryId),
          category_type_model: editingCategory.categoryTypeModel,
          is_expense: transaction.is_expense,
          notes: transaction.notes,
        };
      } else {
        return;
      }

      await updateTransaction(transaction.id, payload);
      onCancel(); // Close editing state after successful update
    }
  };

  const handleDelete = async (id: number) => {
    showMessage(
      "confirm",
      "Delete Transaction",
      "Are you sure you want to delete this transaction? This action cannot be undone.",
      async () => {
        await deleteTransaction(id);
      }
    );
  };

  const isValidAmount = () => {
    const amountValue = Number.parseFloat(isNew ? amount : editingValue);
    return amountValue > 0;
  };

  if (isNew) {
    return (
      <tr className="bg-surface-secondary hover:bg-surface-secondary border-2 border-primary-300 dark:border-primary-600">
        <td className="px-4 sm:px-6 py-4 border-r border-border-primary/30">
          <div className="flex items-center gap-2 sm:gap-3">
            {getTransactionIcon(isExpense)}
            <div className="min-w-0 flex items-center gap-2">
              <input
                type="checkbox"
                checked={isExpense}
                onChange={(e) => setIsExpense(e.target.checked)}
                className="w-4 h-4 text-primary-500 bg-surface-primary border-border-primary rounded focus:ring-primary-200 focus:ring-1"
              />
              <span className="text-xs sm:text-sm font-medium text-neutral-800 dark:text-neutral-200">
                {isExpense ? "Expense" : "Income"}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="text-xs bg-surface-primary border border-border-primary rounded px-2 py-1 mt-1 w-full focus:outline-none focus:ring-1 focus:ring-primary-400"
                placeholder="Add notes..."
              />
            </div>
          </div>
        </td>
        <td className="px-4 sm:px-6 py-4 border-r border-border-primary/30">
          <div className="flex items-center gap-1">
            <span
              className={`text-sm font-semibold ${
                isExpense
                  ? "text-error-600 dark:text-error-400"
                  : "text-success-600 dark:text-success-400"
              }`}
            >
              {isExpense ? "-" : "+"}$
            </span>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="text-sm font-semibold bg-surface-primary border border-border-primary rounded px-2 py-1 w-20 focus:outline-none focus:ring-1 focus:ring-primary-400"
              step="0.01"
              min="0"
              placeholder="0.00"
            />
          </div>
        </td>
        <td className="px-4 sm:px-6 py-4 border-r border-border-primary/30">
          <div className="relative">
            <select
              value={categoryID}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="appearance-none text-xs sm:text-sm bg-surface-primary border border-border-primary rounded px-2 py-1 pr-6 focus:outline-none focus:ring-1 focus:ring-primary-400 max-w-full"
            >
              <option value="">Select Category</option>
              {defaultCategories && defaultCategories.length > 0 && (
                <optgroup label="Default Categories">
                  {defaultCategories.map((cat) => (
                    <option key={`new-default-${cat.id}`} value={cat.id}>
                      {cat.icon} {cat.name}
                    </option>
                  ))}
                </optgroup>
              )}
              {categories && categories.length > 0 && (
                <optgroup label="Your Categories">
                  {categories.map((cat) => (
                    <option key={`new-user-${cat.id}`} value={cat.id}>
                      {cat.icon} {cat.name}
                    </option>
                  ))}
                </optgroup>
              )}
            </select>
            <ChevronDown className="absolute right-1 top-1/2 transform -translate-y-1/2 w-3 h-3 text-neutral-400 pointer-events-none" />
          </div>
        </td>
        <td className="px-4 sm:px-6 py-4 border-r border-border-primary/30 hidden md:table-cell">
          <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
            <Calendar className="w-4 h-4" />
            {new Date().toLocaleDateString()}
          </div>
        </td>
        <td className="px-4 sm:px-6 py-4 text-right">
          <div className="flex items-center justify-end gap-2">
            <button
              onClick={handleSave}
              disabled={!isValidAmount()}
              className="p-1 sm:p-2 hover:bg-success-50 dark:hover:bg-success-900/20 text-success-500 hover:text-success-600 rounded-input transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Save transaction"
            >
              <Save className="w-3 h-3 sm:w-4 sm:h-4" />
            </button>
            <button
              onClick={onCancel}
              className="p-1 sm:p-2 hover:bg-error-50 dark:hover:bg-error-900/20 text-error-500 hover:text-error-600 rounded-input transition-all duration-200"
              title="Cancel"
            >
              <X className="w-3 h-3 sm:w-4 sm:h-4" />
            </button>
          </div>
        </td>
      </tr>
    );
  }

  // Existing transaction row
  if (!transaction) return null;

  const categoryInfo = getCategoryInfo(transaction);

  return (
    <tr className="hover:bg-surface-secondary transition-colors duration-150 border-b border-border-primary/50">
      <td className="px-4 sm:px-6 py-4 border-r border-border-primary/30">
        <div className="flex items-center gap-2 sm:gap-3">
          {getTransactionIcon(transaction.is_expense)}
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-medium text-neutral-800 dark:text-neutral-200 capitalize">
                {transaction.is_expense ? "Expense" : "Income"}
              </span>
            </div>
            {isEditing && editingField === "notes" ? (
              <input
                type="text"
                value={editingValue}
                onChange={(e) => setEditingValue(e.target.value)}
                className="text-xs bg-surface-primary border border-primary-300 rounded px-1 py-0.5 mt-1 max-w-xs focus:outline-none focus:ring-1 focus:ring-primary-400"
                placeholder="Add notes..."
                autoFocus
              />
            ) : (
              <p
                className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 max-w-xs truncate cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-700 px-1 py-0.5 rounded transition-colors duration-150"
                onClick={() => onEdit(transaction.id, "notes")}
                title={transaction.notes || "Click to add notes"}
              >
                {transaction.notes || "Add notes..."}
              </p>
            )}
          </div>
        </div>
      </td>
      <td className="px-4 sm:px-6 py-4 border-r border-border-primary/30">
        {isEditing && editingField === "amount" ? (
          <div className="flex items-center gap-1">
            <span
              className={`text-sm font-semibold ${
                transaction.is_expense
                  ? "text-error-600 dark:text-error-400"
                  : "text-success-600 dark:text-success-400"
              }`}
            >
              {transaction.is_expense ? "-" : "+"}$
            </span>
            <input
              type="number"
              value={editingValue}
              onChange={(e) => setEditingValue(e.target.value)}
              className="text-sm font-semibold bg-surface-primary border border-primary-300 rounded px-2 py-1 w-20 focus:outline-none focus:ring-1 focus:ring-primary-400"
              step="0.01"
              min="0"
              autoFocus
            />
          </div>
        ) : (
          <span
            className={`text-sm sm:text-lg font-semibold cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-700 px-2 py-1 rounded transition-colors duration-150 ${
              transaction.is_expense
                ? "text-error-600 dark:text-error-400"
                : "text-success-600 dark:text-success-400"
            }`}
            onClick={() => onEdit(transaction.id, "amount")}
            title="Click to edit amount"
          >
            {transaction.is_expense ? "-" : "+"}$
            {Number.parseFloat(transaction.amount).toFixed(2)}
          </span>
        )}
        <div className="md:hidden text-xs text-neutral-500 dark:text-neutral-400 mt-1 flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          {new Date(transaction.created_at).toLocaleDateString()}
        </div>
      </td>
      <td className="px-4 sm:px-6 py-4 border-r border-border-primary/30">
        {isEditing && editingField === "category" ? (
          <select
            value={editingCategory.categoryId}
            onChange={(e) => handleCategoryChange(e.target.value)}
            className="text-xs sm:text-sm bg-surface-primary border border-primary-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary-400 max-w-full"
            autoFocus
          >
            <option value="">Select Category</option>
            {defaultCategories && defaultCategories.length > 0 && (
              <optgroup label="Default Categories">
                {defaultCategories.map((cat) => (
                  <option key={`edit-default-${cat.id}`} value={cat.id}>
                    {cat.icon} {cat.name}
                  </option>
                ))}
              </optgroup>
            )}
            {categories && categories.length > 0 && (
              <optgroup label="Your Categories">
                {categories.map((cat) => (
                  <option key={`edit-user-${cat.id}`} value={cat.id}>
                    {cat.icon} {cat.name}
                  </option>
                ))}
              </optgroup>
            )}
          </select>
        ) : (
          <div
            className="flex items-center gap-1 sm:gap-2 cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-700 px-2 py-1 rounded transition-colors duration-150"
            onClick={() => onEdit(transaction.id, "category")}
            title="Click to edit category"
          >
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
        )}
      </td>
      <td className="px-4 sm:px-6 py-4 border-r border-border-primary/30 hidden md:table-cell">
        <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
          <Calendar className="w-4 h-4" />
          {new Date(transaction.created_at).toLocaleDateString()}
        </div>
      </td>
      <td className="px-4 sm:px-6 py-4 text-right">
        {isEditing ? (
          <div className="flex items-center justify-end gap-2">
            <button
              onClick={handleSave}
              disabled={editingField === "amount" && !isValidAmount()}
              className="p-1 sm:p-2 hover:bg-success-50 dark:hover:bg-success-900/20 text-success-500 hover:text-success-600 rounded-input transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Save changes"
            >
              <Save className="w-3 h-3 sm:w-4 sm:h-4" />
            </button>
            <button
              onClick={onCancel}
              className="p-1 sm:p-2 hover:bg-error-50 dark:hover:bg-error-900/20 text-error-500 hover:text-error-600 rounded-input transition-all duration-200"
              title="Cancel"
            >
              <X className="w-3 h-3 sm:w-4 sm:h-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => handleDelete(transaction.id)}
            className="p-1 sm:p-2 hover:bg-error-50 dark:hover:bg-error-900/20 text-error-500 hover:text-error-600 rounded-input transition-all duration-200"
          >
            <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
          </button>
        )}
      </td>
    </tr>
  );
};

export default TransactionRow;
