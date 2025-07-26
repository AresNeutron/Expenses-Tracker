// pages/transactions/index.tsx
"use client";

import React, { useState } from "react";
import {
  CategoryTypeModel,
  CreateTransactionPayload,
  TransactionType,
} from "../../interfaces/api_interfaces"; // Importamos la interfaz de payload
import { useExpenseContext } from "@/app/components/Context";
import ManageCategoriesModal from "@/app/components/ManageCategoriesModal";

const TransactionsPage: React.FC = () => {
  const {
    expenses,
    accounts,
    categories,
    createTransaction,
    deleteTransaction,
    memorizedCategories, // las categorías por defecto están ya importadas en este archivo, sólo hay que usarlas
  } = useExpenseContext();

  const [showCreateTransactionModal, setShowCreateTransactionModal] =
    useState(false);
  const [showManageCategoriesModal, setShowManageCategoriesModal] =
    useState(false);

  // Estados para el formulario de nueva transacción
  const [amount, setAmount] = useState("");
  const [accountID, setAccountID] = useState("");
  const [categoryID, setCategoryID] = useState("");
  const [categoryTypeModel, setCategoryTypeModel] =
    useState<CategoryTypeModel>("defaultcategory");
  const [type, setType] = useState<TransactionType>("expense");
  const [notes, setNotes] = useState("");

  const handleCreateTransaction = async () => {
    if (
      amount.trim() === "" ||
      isNaN(parseFloat(amount)) ||
      accountID === "" ||
      categoryID === ""
    ) {
      alert(
        "Please fill in all required fields: Amount, Account, and Category."
      );
      return;
    }

    const payload: CreateTransactionPayload = {
      amount: amount,
      account: parseInt(accountID),
      category_id: parseInt(categoryID),
      category_type_model: categoryTypeModel,
      transaction_type: type,
      notes: notes,
    };

    console.log(payload);

    const created = await createTransaction(payload);
    if (created) {
      // Reset form fields
      setAmount("");
      setAccountID("");
      setCategoryID("");
      setType("expense");
      setNotes("");
      setShowCreateTransactionModal(false);
      // fetchTransactions(); // El contexto ya actualiza el estado
    }
  };

  const handleDeleteTransaction = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this transaction?")) {
      await deleteTransaction(id);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <main className="flex-1 p-6 container mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">My Transactions</h1>
          <button
            onClick={() => setShowCreateTransactionModal(true)}
            className="bg-blue-600 text-white px-5 py-2 rounded-lg text-lg font-semibold hover:bg-blue-700 transition duration-300"
          >
            + Add New Transaction
          </button>
        </div>

        {expenses.length === 0 ? (
          <div className="bg-white p-8 rounded-lg shadow-md text-center text-gray-700">
            <p className="text-lg mb-4">No transactions recorded yet.</p>
            <p>Start by adding your first expense or income!</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Account
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Notes
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {expenses.map((transaction) => (
                  <tr key={transaction.id}>
                    <td
                      className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                        transaction.transaction_type === "expense"
                          ? "text-red-600"
                          : "text-green-600"
                      }`}
                    >
                      {transaction.transaction_type === "expense" ? "-" : ""}{" "}
                      {parseFloat(transaction.amount).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {transaction.transaction_type}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {accounts.find((acc) => acc.id === transaction.account)
                        ?.name || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {categories.find(
                        (cat) => cat.id === transaction.category_id
                      )?.name || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 max-w-xs overflow-hidden text-ellipsis">
                      {transaction.notes || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleDeleteTransaction(transaction.id)}
                        className="text-red-600 hover:text-red-900 ml-4"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Modal para crear transacción */}
        {showCreateTransactionModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-lg">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                Record New Transaction
              </h2>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label
                    htmlFor="transactionType"
                    className="block text-gray-700 text-sm font-bold mb-2"
                  >
                    Type:
                  </label>
                  <select
                    id="transactionType"
                    value={type}
                    onChange={(e) => setType(e.target.value as TransactionType)}
                    className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  >
                    <option value="expense">Expense</option>
                    <option value="income">Income</option>
                    <option value="transfer">Transfer</option>
                  </select>
                </div>
                <div>
                  <label
                    htmlFor="transactionAmount"
                    className="block text-gray-700 text-sm font-bold mb-2"
                  >
                    Amount:
                  </label>
                  <input
                    type="number"
                    id="transactionAmount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    placeholder="e.g., 50.00"
                    step="0.01"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label
                    htmlFor="transactionAccount"
                    className="block text-gray-700 text-sm font-bold mb-2"
                  >
                    Account:
                  </label>
                  <select
                    id="transactionAccount"
                    value={accountID}
                    onChange={(e) => setAccountID(e.target.value)}
                    className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  >
                    <option value="">Select Account</option>
                    {accounts.map((acc) => (
                      <option key={acc.id} value={acc.id}>
                        {acc.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="mb-4">
                <label
                  htmlFor="transactionCategory"
                  className="block text-gray-700 text-sm font-bold mb-2"
                >
                  Category:
                </label>
                <div className="flex gap-2">
                  <select
                    id="transactionCategory"
                    value={categoryID}
                    onChange={(e) => setCategoryID(e.target.value)}
                    className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  >
                    <option
                      onSelect={() => {
                        setCategoryTypeModel("defaultcategory");
                      }}
                      value=""
                    >
                      Select Category
                    </option>
                    {/* Opciones para categorías por defecto */}
                    {memorizedCategories && memorizedCategories.length > 0 && (
                      <optgroup label="Default Categories">
                        {memorizedCategories.map((cat) => (
                          <option key={`default-${cat.id}`} value={cat.id}>
                            {cat.name}
                          </option>
                        ))}
                      </optgroup>
                    )}
                    {/* Opciones para categorías de usuario */}
                    {categories && categories.length > 0 && (
                      <optgroup label="Your Categories">
                        {categories.map((cat) => (
                          <option
                            onSelect={() => {
                              setCategoryTypeModel("category");
                            }}
                            key={`user-${cat.id}`}
                            value={cat.id}
                          >
                            {cat.name}
                          </option>
                        ))}
                      </optgroup>
                    )}
                  </select>
                  <button
                    onClick={() => setShowManageCategoriesModal(true)}
                    className="bg-gray-200 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-300 transition duration-300 text-sm"
                  >
                    Manage Categories
                  </button>
                </div>
              </div>
              <div className="mb-6">
                <label
                  htmlFor="transactionNotes"
                  className="block text-gray-700 text-sm font-bold mb-2"
                >
                  Notes:
                </label>
                <textarea
                  id="transactionNotes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline h-20"
                  placeholder="Optional notes about the transaction"
                ></textarea>
              </div>
              <div className="flex justify-end gap-4">
                <button
                  onClick={() => setShowCreateTransactionModal(false)}
                  className="bg-gray-300 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-400 transition duration-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateTransaction}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-300"
                >
                  Record Transaction
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Gestión de Categorías */}
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
