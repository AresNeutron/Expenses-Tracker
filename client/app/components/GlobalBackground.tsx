"use client"
import { usePathname } from "next/navigation"

export default function GlobalBackground() {
  const pathname = usePathname()

  // Different background variations for different pages
  const getBackgroundVariant = () => {
    if (pathname === "/" || pathname.includes("login")) {
      return {
        gradient:
          "bg-gradient-to-br from-primary-50 via-neutral-50 to-primary-100 dark:from-neutral-900 dark:via-neutral-800 dark:to-primary-900",
        circle1: "bg-primary-200 dark:bg-primary-800",
        circle2: "bg-success-200 dark:bg-success-800",
      }
    } else if (pathname.includes("register")) {
      return {
        gradient:
          "bg-gradient-to-br from-success-50 via-neutral-50 to-primary-100 dark:from-neutral-900 dark:via-neutral-800 dark:to-success-900",
        circle1: "bg-success-200 dark:bg-success-800",
        circle2: "bg-primary-200 dark:bg-primary-800",
      }
    } else if (pathname.includes("dashboard")) {
      return {
        gradient:
          "bg-gradient-to-br from-neutral-50 via-primary-50 to-success-50 dark:from-neutral-900 dark:via-primary-900 dark:to-neutral-800",
        circle1: "bg-primary-200 dark:bg-primary-800",
        circle2: "bg-warning-200 dark:bg-warning-800",
      }
    } else {
      // Default background for other pages
      return {
        gradient:
          "bg-gradient-to-br from-neutral-50 via-surface-secondary to-primary-50 dark:from-neutral-900 dark:via-neutral-800 dark:to-primary-900",
        circle1: "bg-neutral-200 dark:bg-neutral-700",
        circle2: "bg-primary-200 dark:bg-primary-800",
      }
    }
  }

  const variant = getBackgroundVariant()

  return (
    <div className={`fixed inset-0 -z-10 transition-all duration-700 ease-in-out ${variant.gradient}`}>
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Top-right floating circle */}
        <div
          className={`absolute -top-40 -right-40 w-80 h-80 ${variant.circle1} rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-xl opacity-30 dark:opacity-20 animate-pulse transition-colors duration-700`}
        ></div>

        {/* Bottom-left floating circle */}
        <div
          className={`absolute -bottom-40 -left-40 w-80 h-80 ${variant.circle2} rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-xl opacity-30 dark:opacity-20 animate-pulse delay-1000 transition-colors duration-700`}
        ></div>

        {/* Additional subtle circles for more depth */}
        <div
          className={`absolute top-1/4 left-1/4 w-60 h-60 ${variant.circle1} rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-2xl opacity-20 dark:opacity-10 animate-pulse delay-500 transition-colors duration-700`}
        ></div>

        <div
          className={`absolute bottom-1/4 right-1/4 w-60 h-60 ${variant.circle2} rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-2xl opacity-20 dark:opacity-10 animate-pulse delay-1500 transition-colors duration-700`}
        ></div>
      </div>

      {/* Subtle texture overlay */}
      <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.05] pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-neutral-900 to-transparent transform rotate-12 scale-150"></div>
        <div className="absolute inset-0 bg-gradient-to-l from-transparent via-neutral-900 to-transparent transform -rotate-12 scale-150"></div>
      </div>
    </div>
  )
}