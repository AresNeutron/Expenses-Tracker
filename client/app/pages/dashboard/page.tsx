"use client"

import type React from "react"
import { useState } from "react"
import { useExpenseContext } from "@/app/components/Context"
import type { AccountType } from "@/app/interfaces/api_interfaces"
import {
  Plus,
  CreditCard,
  Wallet,
  Building2,
  Trash2,
  DollarSign,
  TrendingUp,
  Eye,
  EyeOff,
  ChevronRight,
  PiggyBank,
} from "lucide-react"

const AccountsPage: React.FC = () => {
  const { accounts, createAccount, deleteAccount } = useExpenseContext()
  const [showCreateAccountModal, setShowCreateAccountModal] = useState(false)
  const [newAccountName, setNewAccountName] = useState("")
  const [newAccountType, setNewAccountType] = useState<AccountType>("bank")
  const [newAccountCurrency, setNewAccountCurrency] = useState("USD")
  const [newInitialBalance, setNewInitialBalance] = useState<string>("0")
  const [showBalances, setShowBalances] = useState(true)

  const handleCreateAccount = async () => {
    if (newAccountName.trim() === "") {
      alert("Please enter an account name.")
      return
    }
    if (isNaN(Number.parseFloat(newInitialBalance))) {
      alert("Please enter a valid number for initial balance.")
      return
    }

    const created = await createAccount({
      name: newAccountName,
      acc_type: newAccountType,
      currency: newAccountCurrency,
      initial_balance: newInitialBalance,
    })
    if (created) {
      setNewAccountName("")
      setNewAccountType("bank")
      setNewAccountCurrency("USD")
      setNewInitialBalance("0")
      setShowCreateAccountModal(false)
    }
  }

  const handleDeleteAccount = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this account?")) {
      await deleteAccount(id)
    }
  }

  const totalBalance = accounts.reduce((sum, account) => sum + Number.parseFloat(account.balance), 0)

  const getAccountIcon = (type: AccountType) => {
    switch (type) {
      case "bank":
        return <Building2 className="w-6 h-6" />
      case "cash":
        return <Wallet className="w-6 h-6" />
      case "card":
        return <CreditCard className="w-6 h-6" />
      default:
        return <PiggyBank className="w-6 h-6" />
    }
  }

  const getAccountTypeLabel = (type: AccountType) => {
    switch (type) {
      case "bank":
        return "Bank Account"
      case "cash":
        return "Cash"
      case "card":
        return "Credit Card"
      default:
        return "Other"
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 p-6 container mx-auto max-w-7xl">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-neutral-800 dark:text-neutral-100 mb-2">My Accounts</h1>
              <p className="text-neutral-600 dark:text-neutral-400">
                Manage your financial accounts and track your balances
              </p>
            </div>
            <button
              onClick={() => setShowCreateAccountModal(true)}
              className="group flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-button font-medium transition-all duration-200 shadow-card hover:shadow-card-hover"
            >
              <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-200" />
              Add Account
            </button>
          </div>

          {/* Summary Card */}
          <div className="card p-6 mb-8 bg-gradient-to-r from-primary-50 to-success-50 dark:from-primary-900/20 dark:to-success-900/20 border-primary-200 dark:border-primary-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary-500 rounded-full">
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400 mb-1">Total Balance</p>
                  <div className="flex items-center gap-3">
                    {showBalances ? (
                      <p className="text-3xl font-bold balance-text">${totalBalance.toFixed(2)}</p>
                    ) : (
                      <p className="text-3xl font-bold text-neutral-400">••••••</p>
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
              <div className="flex items-center gap-2 text-success-600">
                <TrendingUp className="w-5 h-5" />
                <span className="text-sm font-medium">{accounts.length} accounts</span>
              </div>
            </div>
          </div>
        </div>

        {/* Accounts Grid */}
        {accounts.length === 0 ? (
          <div className="card p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="p-4 bg-primary-100 dark:bg-primary-900/30 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                <PiggyBank className="w-10 h-10 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-neutral-800 dark:text-neutral-100 mb-3">No accounts yet</h3>
              <p className="text-neutral-600 dark:text-neutral-400 mb-8 leading-relaxed">
                Get started by creating your first account to begin tracking your finances effectively.
              </p>
              <button
                onClick={() => setShowCreateAccountModal(true)}
                className="group inline-flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white px-8 py-4 rounded-button font-medium transition-all duration-200 shadow-card hover:shadow-card-hover"
              >
                <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-200" />
                Create My First Account
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {accounts.map((account) => (
              <div
                key={account.id}
                className="group card p-6 hover:shadow-card-hover transition-all duration-200 border-l-4 border-primary-500"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-input text-primary-600">
                      {getAccountIcon(account.acc_type)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-neutral-800 dark:text-neutral-100 group-hover:text-primary-600 transition-colors duration-200">
                        {account.name}
                      </h3>
                      <p className="text-sm text-neutral-500 dark:text-neutral-400">
                        {getAccountTypeLabel(account.acc_type)}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteAccount(account.id)}
                    className="opacity-0 group-hover:opacity-100 p-2 hover:bg-error-50 dark:hover:bg-error-900/20 text-error-500 hover:text-error-600 rounded-input transition-all duration-200"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-neutral-600 dark:text-neutral-400">Current Balance</span>
                    <div className="flex items-center gap-2">
                      {showBalances ? (
                        <span className="text-xl font-bold text-neutral-800 dark:text-neutral-100">
                          {Number.parseFloat(account.balance).toFixed(2)} {account.currency}
                        </span>
                      ) : (
                        <span className="text-xl font-bold text-neutral-400">••••••</span>
                      )}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-border-primary">
                    <button className="w-full flex items-center justify-between text-sm text-primary-600 hover:text-primary-700 font-medium group/button">
                      <span>View Details</span>
                      <ChevronRight className="w-4 h-4 group-hover/button:translate-x-1 transition-transform duration-200" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create Account Modal */}
        {showCreateAccountModal && (
          <div className="fixed inset-0 bg-neutral-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="card w-full max-w-md bg-surface-primary">
              <div className="p-6 border-b border-border-primary">
                <h2 className="text-xl font-semibold text-neutral-800 dark:text-neutral-100">Create New Account</h2>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                  Add a new account to track your finances
                </p>
              </div>

              <div className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    Account Name
                  </label>
                  <input
                    type="text"
                    value={newAccountName}
                    onChange={(e) => setNewAccountName(e.target.value)}
                    className="inputElement"
                    placeholder="e.g., Main Checking, Savings"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    Account Type
                  </label>
                  <select
                    value={newAccountType}
                    onChange={(e) => setNewAccountType(e.target.value as AccountType)}
                    className="inputElement"
                  >
                    <option value="bank">Bank Account</option>
                    <option value="cash">Cash</option>
                    <option value="card">Credit Card</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                      Currency
                    </label>
                    <input
                      type="text"
                      value={newAccountCurrency}
                      onChange={(e) => setNewAccountCurrency(e.target.value)}
                      className="inputElement"
                      placeholder="USD"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                      Initial Balance
                    </label>
                    <input
                      type="number"
                      value={newInitialBalance}
                      onChange={(e) => setNewInitialBalance(e.target.value)}
                      className="inputElement"
                      placeholder="0.00"
                      step="0.01"
                    />
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-border-primary flex gap-3 justify-end">
                <button onClick={() => setShowCreateAccountModal(false)} className="secondaryButton px-6 py-2">
                  Cancel
                </button>
                <button onClick={handleCreateAccount} className="submitButton px-6 py-2">
                  Create Account
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default AccountsPage
