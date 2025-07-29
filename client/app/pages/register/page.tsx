"use client"
import { useExpenseContext } from "@/app/components/Context"
import PasswordInput from "@/app/components/PasswordInput"
import { validateEmail, validatePassword } from "@/app/utils/validations"
import axios from "axios"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import type React from "react"

function Register() {
  const { password, setIsAuth } = useExpenseContext()
  const [username, setUsername] = useState<string>("")
  const [email, setEmail] = useState<string>("")
  const [errors, setErrors] = useState<string[]>([])
  const router = useRouter()

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const errorMessages: string[] = []

    // Validate email
    if (!validateEmail(email)) {
      errorMessages.push("Please enter a valid email address.")
    }

    // Validate password
    if (!validatePassword(password)) {
      errorMessages.push(
        "Password must be at least 8 characters long, include one uppercase letter, one lowercase letter, one number, and one special character.",
      )
    }

    if (errorMessages.length > 0) {
      setErrors(errorMessages)
      return
    }

    // Clear errors
    setErrors([])

    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/register/`, {
        username: username,
        email: email,
        password: password,
      })

      // Store the tokens in localStorage
      localStorage.setItem("access_token", response.data.access)
      localStorage.setItem("refresh_token", response.data.refresh)

      setIsAuth(true);

      // Redirect to dashboard
      router.push("/pages/dashboard")
    } catch (err) {
      console.error(err)
      setErrors(["Registration failed. Please try again."])
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="relative w-full max-w-md">
        {/* Main register card */}
        <div className="card p-8 backdrop-blur-sm bg-surface-primary/80">
          {/* Header section */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-success-500 to-primary-600 rounded-full mb-4 shadow-lg">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-neutral-800 mb-2">Create Account</h1>
            <p className="text-neutral-600 text-sm">Join us to start managing your finances</p>
          </div>

          {/* Register form */}
          <form onSubmit={handleRegister} className="space-y-6">
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-neutral-700 mb-2">
                  Email Address
                </label>
                <input
                  id="email"
                  className="inputElement"
                  type="email"
                  placeholder="Enter your email address"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div>
                <label htmlFor="username" className="block text-sm font-medium text-neutral-700 mb-2">
                  Username
                </label>
                <input
                  id="username"
                  className="inputElement"
                  type="text"
                  placeholder="Choose a username"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
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
                    d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                  />
                </svg>
                Create Account
              </span>
            </button>
          </form>

          {/* Password requirements info */}
          <div className="mt-6 p-4 bg-primary-50 border border-primary-200 rounded-input">
            <h3 className="text-sm font-medium text-primary-800 mb-2">Password Requirements:</h3>
            <ul className="text-xs text-primary-700 space-y-1">
              <li className="flex items-center">
                <svg className="w-3 h-3 mr-2 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                At least 8 characters long
              </li>
              <li className="flex items-center">
                <svg className="w-3 h-3 mr-2 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                Include uppercase and lowercase letters
              </li>
              <li className="flex items-center">
                <svg className="w-3 h-3 mr-2 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                Include numbers and special characters
              </li>
            </ul>
          </div>
        </div>

        {/* Login link card */}
        <div className="card p-6 mt-6 text-center backdrop-blur-sm bg-surface-primary/80">
          <p className="text-neutral-600">
            Already have an account?{" "}
            <Link
              className="font-semibold text-primary-600 hover:text-primary-700 transition-colors duration-200 underline decoration-primary-200 hover:decoration-primary-300 underline-offset-2"
              href="/"
            >
              Sign In
            </Link>
          </p>
        </div>

        {/* Footer text */}
        <div className="text-center mt-8">
          <p className="text-xs text-neutral-500">
            By creating an account, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  )
}

export default Register
