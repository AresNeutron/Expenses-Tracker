"use client";

import Link from "next/link";
import axios from "axios";
import { useRouter } from "next/navigation";
import PasswordInput from "@/app/components/PasswordInput";
import { useExpenseContext } from "@/app/components/Context";
import { useState } from "react";
import { setupTokenRefresh } from "./utils/tokens";

export default function Login() {
  const { password, setPassword, setIsAuth } = useExpenseContext();
  const [identifier, setIdentifier] = useState<string>(""); // For email or username
  const [errors, setErrors] = useState<string[]>([]);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors([]); // Clear any previous errors

    try {
      console.log("Payload:", { identifier, password });
      const response = await axios.post(
        "http://127.0.0.1:8000/api/login/",
        {
          identifier,
          password,
        }
      );
      const { access, refresh } = response.data;

      // Save tokens to local storage or cookies
      localStorage.setItem("access_token", access);
      localStorage.setItem("refresh_token", refresh);

      setupTokenRefresh(); // Refresh token setup

      // Redirect or notify success
      router.push("/pages/dashboard");

      setPassword(""); // Clear password field
      setIsAuth(true); // Set authentication status
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        // Handle Axios-specific error
        if (err.response && err.response.status === 401) {
          setErrors(["Invalid username/email or password. Please try again."]);
        } else if(err.response && err.response.status === 400) {
          // Other error from the backend
          setErrors(['Invalid request. User does not exist.']);
        }
      } else {
        // General Axios error
        console.log(err);
        setErrors(["An unexpected error occurred. Please try again later."]);
      }
    }
  };

  return (
    <div className="flex items-center min-h-screen justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex items-center justify-center p-1 mx-auto max-w-[800px] h-4/5 bg-red">
        <div className="w-[300px] h-full">
          <form
            className="authElement"
            onSubmit={(e) => {
              handleSubmit(e);
            }}
          >
            <h1 className="text-2xl text-center mb-4 -mt-3">
              Log in to handle your expenses
            </h1>
            <input
              className="inputElement mb-2"
              type="text"
              placeholder="Username or Email"
              required
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
            />
            <PasswordInput />

            {/* Error Messages */}
            {errors.length > 0 && (
              <div className="text-red-500 mt-4">
                {errors.map((error, index) => (
                  <p key={index}>{error}</p>
                ))}
              </div>
            )}
            <button type="submit" className="submitButton mt-6 p-2">
              Sign in
            </button>
          </form>
          <div className="authElement p-6 mt-6">
            <p>
              Do not have an account?{" "}
              <Link className="font-bold" href={"/pages/register"}>
                Register
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
