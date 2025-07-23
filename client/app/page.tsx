"use client"
import Link from "next/link"
import type React from "react"

import axios from "axios"
import { useRouter } from "next/navigation"
import PasswordInput from "@/app/components/PasswordInput"
import { useExpenseContext } from "@/app/components/Context"
import { useState } from "react"
import { setupTokenRefresh } from "./utils/tokens"

export default function Login() {
  const { password, setPassword, setIsAuth } = useExpenseContext()
  const [identifier, setIdentifier] = useState<string>("") // For email or username
  const [errors, setErrors] = useState<string[]>([])
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setErrors([]) // Clear any previous errors
    try {
      console.log("Payload:", { identifier, password })
      const response = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/login/`, {
        identifier,
        password,
      })
      const { access, refresh } = response.data
      // Save tokens to local storage or cookies
      localStorage.setItem("access_token", access)
      localStorage.setItem("refresh_token", refresh)
      setupTokenRefresh() // Refresh token setup
      // Redirect or notify success
      router.push("/pages/dashboard")
      setPassword("") // Clear password fields
      setIsAuth(true) // Set authentication status
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        // Handle Axios-specific error
        if (err.response && err.response.status === 401) {
          setErrors(["Invalid username/email or password. Please try again."])
        } else if (err.response && err.response.status === 400) {
          // Other error from the backend
          setErrors(["Invalid request. User does not exist."])
        }
      } else {
        // General Axios error
        console.log(err)
        setErrors(["An unexpected error occurred. Please try again later."])
      }
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="relative w-full max-w-md">
        {/* Main login card */}
        <div className="card p-8 backdrop-blur-sm bg-surface-primary/80">
          {/* Header section */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full mb-4 shadow-lg">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-neutral-800 mb-2">Welcome Back</h1>
            <p className="text-neutral-600 text-sm">Sign in to manage your finances</p>
          </div>

          {/* Login form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <label htmlFor="identifier" className="block text-sm font-medium text-neutral-700 mb-2">
                  Username or Email
                </label>
                <input
                  id="identifier"
                  className="inputElement"
                  type="text"
                  placeholder="Enter your username or email"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-neutral-700 mb-2">
                  Password
                </label>
                <PasswordInput />
              </div>
            </div>

            {/* Error Messages */}
            {errors.length > 0 && (
              <div className="bg-error-50 border border-error-200 rounded-input p-4">
                <div className="flex items-start">
                  <svg
                    className="w-5 h-5 text-error-500 mt-0.5 mr-3 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <div className="space-y-1">
                    {errors.map((error, index) => (
                      <p key={index} className="text-sm text-error-700">
                        {error}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <button type="submit" className="submitButton">
              <span className="flex items-center justify-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                  />
                </svg>
                Sign In
              </span>
            </button>
          </form>
        </div>

        {/* Register link card */}
        <div className="card p-6 mt-6 text-center backdrop-blur-sm bg-surface-primary/80">
          <p className="text-neutral-600">
            Don't have an account?{" "}
            <Link
              className="font-semibold text-primary-600 hover:text-primary-700 transition-colors duration-200 underline decoration-primary-200 hover:decoration-primary-300 underline-offset-2"
              href="/pages/register"
            >
              Create Account
            </Link>
          </p>
        </div>

        {/* Footer text */}
        <div className="text-center mt-8">
          <p className="text-xs text-neutral-500">Secure • Trusted • Modern Financial Management</p>
        </div>
      </div>
    </div>
  )
}
