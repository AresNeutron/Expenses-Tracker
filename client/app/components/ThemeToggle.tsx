"use client"
import { useState, useEffect } from "react"

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Detectar preferencia inicial y cargar desde localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme")
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches

    if (savedTheme) {
      setIsDark(savedTheme === "dark")
    } else {
      setIsDark(prefersDark)
    }
    setMounted(true)
  }, [])

  // Aplicar el tema al documento
  useEffect(() => {
    if (mounted) {
      if (isDark) {
        document.documentElement.classList.add("dark")
        localStorage.setItem("theme", "dark")
      } else {
        document.documentElement.classList.remove("dark")
        localStorage.setItem("theme", "light")
      }
    }
  }, [isDark, mounted])

  const toggleTheme = () => {
    setIsDark(!isDark)
  }

  // Evitar hidration mismatch
  if (!mounted) {
    return (
      <div className="fixed top-4 right-4 z-50">
        <div className="w-12 h-12 bg-surface-secondary rounded-full animate-pulse"></div>
      </div>
    )
  }

  return (
    <div className="fixed top-3 right-3 sm:top-4 sm:right-4 z-50">
      <button
        onClick={toggleTheme}
        className="group relative w-10 h-10 sm:w-12 sm:h-12 bg-surface-primary border border-border-primary rounded-full shadow-card hover:shadow-card-hover transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-200 focus:ring-offset-2"
        aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      >
        {/* Fondo con gradiente sutil */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-50 to-neutral-100 dark:from-neutral-800 dark:to-neutral-900 rounded-full opacity-50 group-hover:opacity-70 transition-opacity duration-300"></div>

        {/* Contenedor de iconos */}
        <div className="relative w-full h-full flex items-center justify-center">
          {/* Icono de sol (modo claro) */}
          <svg
            className={`absolute w-4 h-4 sm:w-5 sm:h-5 text-warning-500 transition-all duration-500 ease-in-out ${
              isDark ? "opacity-0 rotate-90 scale-50" : "opacity-100 rotate-0 scale-100"
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <circle cx="12" cy="12" r="5" />
            <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
          </svg>

          {/* Icono de luna (modo oscuro) */}
          <svg
            className={`absolute w-4 h-4 sm:w-5 sm:h-5 text-primary-400 transition-all duration-500 ease-in-out ${
              isDark ? "opacity-100 rotate-0 scale-100" : "opacity-0 -rotate-90 scale-50"
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
          </svg>
        </div>

        {/* Indicador de estado activo */}
        <div
          className={`absolute -bottom-1 -right-1 w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-all duration-300 ${
            isDark ? "bg-primary-500 shadow-lg shadow-primary-500/50" : "bg-warning-500 shadow-lg shadow-warning-500/50"
          }`}
        ></div>

        {/* Tooltip */}
        <div className="absolute -bottom-10 sm:-bottom-12 right-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
          <div className="bg-neutral-800 dark:bg-neutral-200 text-white dark:text-neutral-800 text-xs px-2 sm:px-3 py-1 rounded-input whitespace-nowrap shadow-lg">
            {isDark ? "Switch to light" : "Switch to dark"}
            <div className="absolute -top-1 right-2 sm:right-3 w-2 h-2 bg-neutral-800 dark:bg-neutral-200 rotate-45"></div>
          </div>
        </div>
      </button>
    </div>
  )
}
