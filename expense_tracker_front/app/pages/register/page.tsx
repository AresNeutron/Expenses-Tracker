"use client";

import { useExpenseContext } from "@/app/components/Context";
import PasswordInput from "@/app/components/PasswordInput";
import { validateEmail, validatePassword } from "@/app/utils/validations";
import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation"; // Correct import for App Router
import { useState } from "react";

function Register() {
  const { password } = useExpenseContext();
  const [username, setUsername] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [errors, setErrors] = useState<string[]>([]);
  const router = useRouter(); // Works with App Router

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const errorMessages: string[] = [];

    // Validate email
    if (!validateEmail(email)) {
      errorMessages.push("Please enter a valid email address.");
    }

    // Validate password
    if (!validatePassword(password)) {
      errorMessages.push(
        "Password must be at least 8 characters long, include one uppercase letter, one lowercase letter, one number, and one special character."
      );
    }

    if (errorMessages.length > 0) {
      setErrors(errorMessages);
      return;
    }

    // Clear errors
    setErrors([]);

    try {
      const response = await axios.post("http://127.0.0.1:8000/api/register/", {
        username: username,
        email: email,
        password: password,
      });
      // Store the tokens in localStorage
      localStorage.setItem("access_token", response.data.access);
      localStorage.setItem("refresh_token", response.data.refresh);

      // Redirect to login page
      router.push("/pages/dashboard"); // Updated routing method
    } catch (err) {
      console.error(err);
      alert("Registration failed. Please try again.");
    }
  };

  return (
    <div className="mx-auto flex min-h-screen items-center justify-center px-1 py-12 sm:px-2 lg:px-3">
      <div className="w-[300px] h-full mx-auto">
        <form className="authElement" onSubmit={handleRegister}>
          <h1 className="text-2xl text-center mb-4 -mt-3">
            Register to handle your expenses
          </h1>
          <input
            className="inputElement mb-2"
            type="text"
            placeholder="Email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <PasswordInput />
          <input
            className="inputElement"
            type="text"
            placeholder="Username"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

          {/* Error Messages */}
          {errors.length > 0 && (
            <div className="text-red-500 mt-4">
              {errors.map((error, index) => (
                <p key={index}>{error}</p>
              ))}
            </div>
          )}
          <button type="submit" className="submitButton mt-6 p-2">
            Sign Up
          </button>
        </form>
        <div className="authElement p-6 mt-6">
          <p>
            Have an account?{" "}
            <Link className="font-bold" href="/">
              Log In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;
