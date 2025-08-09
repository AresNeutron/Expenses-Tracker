"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import type React from "react"
import { ChevronRight, Wallet, Building2, ArrowRightLeft } from "lucide-react"

const Navbar: React.FC = () => {
  const pathname = usePathname()

  // Normalizar el pathname para manejar barras finales ("/pages/dashboard" === "/pages/dashboard/")
  const normalize = (p?: string | null) => {
    if (!p) return ""
    return p !== "/" && p.endsWith("/") ? p.slice(0, -1) : p
  }
  const currentPath = normalize(pathname)

  const navigationItems = [
    {
      name: "Accounts",
      href: "/pages/dashboard",
      icon: Building2,
      description: "Manage your accounts and balances",
      isActive: currentPath === "/pages/dashboard",
    },
    {
      name: "Transactions",
      href: "/pages/transactions",
      icon: ArrowRightLeft,
      description: "Track income, expenses and transfers",
      isActive: currentPath === "/pages/transactions",
    },
  ]

  return (
    <>
      {/* Main Navbar */}
      <nav className="sticky top-0 z-40 w-full border-b border-border-primary bg-surface-primary/80 backdrop-blur-md shadow-card">
        <div className="container mx-auto px-3 sm:px-4 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16">
            {/* Logo */}
            <Link
              href="/pages/dashboard"
              className="group flex items-center gap-2 sm:gap-3 transition-all duration-200 hover:scale-105 flex-shrink-0"
            >
              <div className="relative">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-200">
                  <Wallet className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-2 h-2 sm:w-3 sm:h-3 bg-success-400 rounded-full animate-pulse"></div>
              </div>
              <div className="hidden xs:block sm:block">
                <h1 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 dark:from-primary-400 dark:to-primary-300 bg-clip-text text-transparent">
                  FinanTrack
                </h1>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 -mt-1 hidden sm:block">Business Suite</p>
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
                  aria-current={item.isActive ? "page" : undefined}
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
          </div>
        </div>

        {/* Mobile Navigation Tabs - always visible on small screens */}
        <div className="md:hidden border-t border-border-primary bg-surface-primary">
          <div className="container mx-auto px-3 sm:px-4 py-2">
            <div className="grid grid-cols-2 gap-2">
              {navigationItems.map((item) => (
                <Link
                  key={`m-${item.name}`}
                  href={item.href}
                  className={`flex items-center justify-center gap-2 px-3 py-2 rounded-button text-sm font-medium transition-all duration-200 ${
                    item.isActive
                      ? "bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 border border-primary-200 dark:border-primary-700/50"
                      : "bg-surface-secondary text-neutral-700 dark:text-neutral-200 border border-border-primary hover:bg-neutral-50 dark:hover:bg-neutral-700"
                  }`}
                  aria-current={item.isActive ? "page" : undefined}
                >
                  <item.icon
                    className={`w-4 h-4 ${
                      item.isActive
                        ? "text-primary-600 dark:text-primary-400"
                        : "text-neutral-600 dark:text-neutral-300"
                    }`}
                  />
                  <span className="truncate">{item.name}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </nav>
    </>
  )
}

export default Navbar
