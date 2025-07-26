"use client"

import { useState } from "react"
import { Eye, EyeOff, Lock } from "lucide-react"
import { useExpenseContext } from "./Context"

export default function PasswordInput() {
  const { password, setPassword } = useExpenseContext()
  const [showPassword, setShowPassword] = useState(false)
  const [isFocused, setIsFocused] = useState(false)

  return (
    <div className="relative w-full group">
      {/* Icon container */}
      <div className="absolute left-3 top-1/2 transform -translate-y-1/2 z-10">
        <Lock
          className={`w-4 h-4 transition-all duration-200 ${
            isFocused ? "text-primary-500" : "text-neutral-400 dark:text-neutral-500"
          }`}
        />
      </div>

      {/* Input field */}
      <input
        className={`inputElement pl-10 pr-12 transition-all duration-200 ${
          isFocused ? "ring-2 ring-primary-200 dark:ring-primary-400/30 border-primary-500" : ""
        }`}
        type={showPassword ? "text" : "password"}
        placeholder="Enter your password"
        required
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      />

      {/* Toggle visibility button */}
      <button
        type="button"
        className={`absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-input transition-all duration-200 hover:bg-neutral-100 dark:hover:bg-neutral-700 focus:outline-none focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-400/30 ${
          isFocused ? "text-primary-500" : "text-neutral-400 dark:text-neutral-500"
        }`}
        onClick={() => setShowPassword(!showPassword)}
        aria-label={showPassword ? "Hide password" : "Show password"}
      >
        {showPassword ? (
          <EyeOff className="w-4 h-4 transition-transform duration-200 hover:scale-110" />
        ) : (
          <Eye className="w-4 h-4 transition-transform duration-200 hover:scale-110" />
        )}
      </button>

      {/* Focus indicator line */}
      <div
        className={`absolute bottom-0 left-0 h-0.5 bg-primary-500 transition-all duration-300 ${
          isFocused ? "w-full" : "w-0"
        }`}
      />

      {/* Password strength indicator (optional visual enhancement) */}
      {password.length > 0 && (
        <div className="absolute -bottom-1 right-0">
          <div className="flex gap-1">
            {[1, 2, 3].map((level) => (
              <div
                key={level}
                className={`w-1 h-1 rounded-full transition-all duration-300 ${
                  password.length >= level * 3
                    ? level === 1
                      ? "bg-error-400"
                      : level === 2
                        ? "bg-warning-400"
                        : "bg-success-400"
                    : "bg-neutral-200 dark:bg-neutral-700"
                }`}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
