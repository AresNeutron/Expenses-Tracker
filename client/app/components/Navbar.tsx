"use client"

import { useState } from "react"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { ChevronRight, Wallet, ArrowRightLeft, LogOut } from "lucide-react"
import { useExpenseContext } from "@/app/context/Context"
import { logout } from "@/app/utils/auth"
import MessageModal from "@/app/components/MessageModal"

const Navbar = () => {
  const pathname = usePathname()
  const router = useRouter()
  const { setIsAuth } = useExpenseContext()

  // Normalizar pathname
  const normalize = (p?: string | null) => {
    if (!p) return ""
    return p !== "/" && p.endsWith("/") ? p.slice(0, -1) : p
  }
  const currentPath = normalize(pathname)

  const navigationItems = [
    {
      name: "Transactions",
      href: "/pages/transactions",
      icon: ArrowRightLeft,
      description: "Track income, expenses and transfers",
      isActive: currentPath === "/pages/transactions",
    },
  ]

  // Modales de confirmación y éxito
  const [showConfirm, setShowConfirm] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  const openConfirm = () => setShowConfirm(true)

  const performLogout = async () => {
    try {
      await logout()
      // Mostrar éxito sin desmontar la Navbar todavía
      setShowSuccess(true)
    } catch (e) {
      console.log(e)
      // Podríamos mostrar un modal de error si lo necesitas en el futuro
      setShowSuccess(true)
    }
  }

  const finalizeAndRedirect = () => {
    setShowSuccess(false)
    setIsAuth(false)
    router.push("/")
  }

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

            {/* Desktop Navigation (con botón Sign out al mismo nivel) */}
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
                  <item.icon/>
                  <span>{item.name}</span>

                  {item.isActive && (
                    <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-primary-500 rounded-full"></div>
                  )}

                  <ChevronRight
                    className={`w-3 h-3 transition-all duration-200 ${
                      item.isActive
                        ? "opacity-100 translate-x-0"
                        : "opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0"
                    }`}
                  />
                </Link>
              ))}
              <button
                onClick={openConfirm}
                className="group relative flex items-center gap-3 px-4 py-2 rounded-button text-sm font-medium text-error-600 hover:text-error-700 bg-surface-secondary hover:bg-error-50 border border-border-primary transition-all duration-200"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign out</span>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Tabs (3 columnas, incluyendo Sign out) */}
        <div className="md:hidden border-t border-border-primary bg-surface-primary">
          <div className="container mx-auto px-3 sm:px-4 py-2">
            <div className="grid grid-cols-3 gap-2">
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
                  <item.icon />
                  <span className="truncate">{item.name}</span>
                </Link>
              ))}
              <button
                onClick={openConfirm}
                aria-label="Sign out"
                className="flex items-center justify-center gap-2 px-3 py-2 rounded-button text-sm font-medium transition-all duration-200
                           bg-surface-secondary text-error-600 border border-error-200 hover:bg-error-50 dark:hover:bg-error-900/20"
              >
                <LogOut className="w-4 h-4" />
                <span className="truncate">Sign out</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Modal de confirmación */}
      <MessageModal
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        type="confirm"
        title="Log Out"
        message="Are you sure you want to log out?"
        onConfirm={performLogout}
        confirmText="Log Out"
        cancelText="Cancel"
      />

      {/* Modal de éxito */}
      <MessageModal
        isOpen={showSuccess}
        onClose={finalizeAndRedirect}
        type="success"
        title="Logged Out"
        message="You've successfully logged out."
      />
    </>
  )
}

export default Navbar
