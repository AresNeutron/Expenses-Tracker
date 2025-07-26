"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import type React from "react"
import { useState } from "react"
import { Building2, ArrowRightLeft, Menu, X, ChevronRight, Wallet } from "lucide-react"

const Navbar: React.FC = () => {
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const navigationItems = [
    {
      name: "Accounts",
      href: "/pages/dashboard",
      icon: Building2,
      description: "Manage your accounts and balances",
      isActive: pathname === "/pages/dashboard",
    },
    {
      name: "Transactions",
      href: "/pages/transactions",
      icon: ArrowRightLeft,
      description: "Track income, expenses and transfers",
      isActive: pathname === "/pages/transactions",
    },
  ]

  return (
    <>
      {/* Main Navbar */}
      <nav className="sticky top-0 z-40 w-full border-b border-border-primary bg-surface-primary/80 backdrop-blur-md shadow-card">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link
              href="/pages/dashboard"
              className="group flex items-center gap-3 transition-all duration-200 hover:scale-105"
            >
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-200">
                  <Wallet className="w-5 h-5 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-success-400 rounded-full animate-pulse"></div>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 dark:from-primary-400 dark:to-primary-300 bg-clip-text text-transparent">
                  FinanTrack
                </h1>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 -mt-1">Business Suite</p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-1">
              {navigationItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group relative flex items-center gap-3 px-4 py-2 rounded-button text-sm font-medium transition-all duration-200 ${
                    item.isActive
                      ? "bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 shadow-sm"
                      : "text-neutral-600 dark:text-neutral-300 hover:bg-surface-secondary hover:text-neutral-800 dark:hover:text-neutral-100"
                  }`}
                >
                  <item.icon
                    className={`w-4 h-4 transition-all duration-200 ${
                      item.isActive ? "text-primary-600 dark:text-primary-400" : "group-hover:scale-110"
                    }`}
                  />
                  <span>{item.name}</span>

                  {/* Active indicator */}
                  {item.isActive && (
                    <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-primary-500 rounded-full"></div>
                  )}

                  {/* Hover arrow */}
                  <ChevronRight
                    className={`w-3 h-3 transition-all duration-200 ${
                      item.isActive
                        ? "opacity-100 translate-x-0"
                        : "opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0"
                    }`}
                  />
                </Link>
              ))}
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-button text-neutral-600 dark:text-neutral-300 hover:bg-surface-secondary transition-colors duration-200"
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div
          className={`md:hidden border-t border-border-primary bg-surface-primary transition-all duration-300 ease-in-out ${
            isMobileMenuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0 overflow-hidden"
          }`}
        >
          <div className="container mx-auto px-4 py-4 space-y-2">
            {navigationItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`group flex items-center gap-4 p-4 rounded-card transition-all duration-200 ${
                  item.isActive
                    ? "bg-primary-50 dark:bg-primary-900/30 border border-primary-200 dark:border-primary-700/50"
                    : "hover:bg-surface-secondary border border-transparent"
                }`}
              >
                <div
                  className={`p-2 rounded-input ${
                    item.isActive
                      ? "bg-primary-100 dark:bg-primary-800/50"
                      : "bg-neutral-100 dark:bg-neutral-700 group-hover:bg-primary-100 dark:group-hover:bg-primary-800/50"
                  }`}
                >
                  <item.icon
                    className={`w-5 h-5 ${
                      item.isActive
                        ? "text-primary-600 dark:text-primary-400"
                        : "text-neutral-600 dark:text-neutral-300 group-hover:text-primary-600 dark:group-hover:text-primary-400"
                    }`}
                  />
                </div>
                <div className="flex-1">
                  <h3
                    className={`font-medium ${
                      item.isActive
                        ? "text-primary-700 dark:text-primary-300"
                        : "text-neutral-800 dark:text-neutral-200"
                    }`}
                  >
                    {item.name}
                  </h3>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">{item.description}</p>
                </div>
                {item.isActive && <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse"></div>}
              </Link>
            ))}
          </div>
        </div>
      </nav>

      {/* Mobile menu overlay */}
      {isMobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 bg-neutral-900/20 backdrop-blur-sm z-30"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </>
  )
}

export default Navbar
