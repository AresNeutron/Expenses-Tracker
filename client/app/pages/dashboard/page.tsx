// pages/accounts/index.tsx (o dashboard.tsx, según tu preferencia de ruta)
"use client";

import React, { useState, useEffect } from "react";
import { useExpenseContext } from "@/app/components/Context";
import { AccountType } from "@/app/interfaces/api_interfaces";

const AccountsPage: React.FC = () => {
  const { accounts, fetchAccounts, createAccount, deleteAccount } = useExpenseContext();
  const [showCreateAccountModal, setShowCreateAccountModal] = useState(false);
  const [newAccountName, setNewAccountName] = useState("");
  const [newAccountType, setNewAccountType] = useState<AccountType>("bank"); // Default type
  const [newAccountCurrency, setNewAccountCurrency] = useState("USD"); // Default currency
  const [newInitialBalance, setNewInitialBalance] = useState<string>('0');

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  const handleCreateAccount = async () => {
    if (newAccountName.trim() === "") {
      alert("Please enter an account name.");
      return;
    }
    // Basic validation for initial balance
    if (isNaN(parseFloat(newInitialBalance))) {
      alert("Please enter a valid number for initial balance.");
      return;
    }

    const created = await createAccount({
      name: newAccountName,
      acc_type: newAccountType,
      currency: newAccountCurrency,
      initial_balance: newInitialBalance,
    });
    if (created) {
      setNewAccountName("");
      setNewAccountType("bank");
      setNewAccountCurrency("USD");
      setNewInitialBalance('0');
      setShowCreateAccountModal(false);
      // fetchAccounts(); // El contexto ya actualiza el estado, no es estrictamente necesario aquí
    }
  };

  const handleDeleteAccount = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this account?")) {
      await deleteAccount(id);
    }
  };

  // Calcula el saldo total
  const totalBalance = accounts.reduce((sum, account) => sum + parseFloat(account.balance), 0);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <main className="flex-1 p-6 container mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">My Accounts</h1>

        {accounts.length === 0 ? (
          <div className="bg-white p-8 rounded-lg shadow-md text-center">
            <p className="text-lg text-gray-700 mb-6">
              It looks like you do not have any accounts yet.
              <br />
              Let us create your first one to start tracking your finances!
            </p>
            <button
              onClick={() => setShowCreateAccountModal(true)}
              className="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-blue-700 transition duration-300"
            >
              Create My First Account
            </button>
          </div>
        ) : (
          <div>
            <div className="bg-white p-6 rounded-lg shadow-md mb-6">
              <h2 className="text-xl font-semibold text-gray-700 mb-3">Overall Summary</h2>
              <p className="text-3xl font-bold text-green-600">
                Total Balance: {totalBalance.toFixed(2)} USD
              </p>
            </div>

            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold text-gray-800">Your Accounts</h2>
              <button
                onClick={() => setShowCreateAccountModal(true)}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition duration-300"
              >
                + Add New Account
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {accounts.map((account) => (
                <div
                  key={account.id}
                  className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-semibold text-gray-900">{account.name}</h3>
                    <button
                      onClick={() => handleDeleteAccount(account.id)}
                      className="text-red-500 hover:text-red-700 text-sm"
                    >
                      Delete
                    </button>
                  </div>
                  <p className="text-gray-600 text-sm mb-2">{account.acc_type.replace("_", " ")}</p>
                  <p className="text-2xl font-bold text-gray-800">
                    {parseFloat(account.balance).toFixed(2)} {account.currency}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Modal para crear cuenta */}
        {showCreateAccountModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Create New Account</h2>
              <div className="mb-4">
                <label htmlFor="accountName" className="block text-gray-700 text-sm font-bold mb-2">
                  Account Name:
                </label>
                <input
                  type="text"
                  id="accountName"
                  value={newAccountName}
                  onChange={(e) => setNewAccountName(e.target.value)}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  placeholder="e.g., Savings, Checking, Cash"
                />
              </div>
              <div className="mb-4">
                <label htmlFor="accountType" className="block text-gray-700 text-sm font-bold mb-2">
                  Account Type:
                </label>
                <select
                  id="accountType"
                  value={newAccountType}
                  onChange={(e) => setNewAccountType(e.target.value as AccountType)}
                  className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                >
                  <option value="bank">Bank</option>
                  <option value="cash">Cash</option>
                  <option value="card">Credit Card</option>
                  {/* Add more types if defined in backend */}
                </select>
              </div>
              <div className="mb-4"> {/* New input field for Initial Balance */}
                <label htmlFor="initialBalance" className="block text-gray-700 text-sm font-bold mb-2">
                  Initial Balance:
                </label>
                <input
                  type="number" // Use type="number" for numerical input
                  id="initialBalance"
                  value={newInitialBalance}
                  onChange={(e) => setNewInitialBalance(e.target.value)}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  placeholder="e.g., 1000.00"
                  step="0.01" // Allows decimal values
                />
              </div>
              <div className="mb-6">
                <label htmlFor="accountCurrency" className="block text-gray-700 text-sm font-bold mb-2">
                  Currency:
                </label>
                <input
                  type="text"
                  id="accountCurrency"
                  value={newAccountCurrency}
                  onChange={(e) => setNewAccountCurrency(e.target.value)}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  placeholder="e.g., USD, EUR, UYU"
                />
              </div>
              <div className="flex justify-end gap-4">
                <button
                  onClick={() => setShowCreateAccountModal(false)}
                  className="bg-gray-300 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-400 transition duration-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateAccount}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-300"
                >
                  Create Account
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AccountsPage;