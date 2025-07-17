"use client";

import axios from "axios";
import { useRouter } from "next/navigation";
import React, {
  createContext,
  useState,
  ReactNode,
  useContext,
  useEffect,
} from "react";
import { isTokenValid, setupTokenRefresh } from "../utils/tokens";
import { Expense, ExpenseContextProps } from "../interfaces/interfaces";

export const ExpenseContext = createContext<ExpenseContextProps | undefined>(
  undefined
);

interface ExpenseProviderProps {
  children: ReactNode;
}

const ExpenseProvider: React.FC<ExpenseProviderProps> = ({ children }) => {
  const [password, setPassword] = useState<string>("");
  const [isAuth, setIsAuth] = useState<boolean>(false);
  const [data, setData] = useState<Expense[]>([]);

  const router = useRouter();

  const fetchExpenses = async () => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      alert("No access token found. Please log in.");
      return;
    }

    axios
      .get("http://127.0.0.1:8000/api/expenses/", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        console.log(response.data);
        setData(response.data);
      })
      .catch((error) => {
        console.error("There was an error fetching the data!", error);
      });
  };

  const deleteExpense = async (id: number) => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      alert("No access token found. Please log in.");
      return;
    }

    if (!id) {
      console.error("ID is undefined for row:");
      return;
    }
    axios
      .delete(`http://127.0.0.1:8000/api/expenses/${id}/`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        console.log("Expense deleted successfully:", response.data);
        setData((prevData) => prevData.filter((el) => el.id !== id));
      });
  };

  const updateExpense = async (id: number, updatedExpense: Expense) => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      alert("No access token found. Please log in.");
      return;
    }

    axios
      .put(`http://127.0.0.1:8000/api/expenses/${id}/`, updatedExpense, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        if (response.status === 200) {
          console.log("Expense updated successfully:", response.data);
          setData((prevData) =>
            prevData.map((expense) => {
              if (expense.id === id) {
                return updatedExpense;
              } else return expense;
            })
          );
        } else {
          console.error("There was an error updating the expense!");
        }
      })
      .catch((error) => {
        console.error("There was an error updating the expense!", error);
      });
  };

  // Refresh token setup on component mount
  useEffect(() => {
    const accessToken = localStorage.getItem("access_token");
    if (accessToken) {
      if (isTokenValid()) {
        setupTokenRefresh(); // Set up token refresh if the token is valid
        router.push("/pages/dashboard"); // Redirect to dashboard
        setIsAuth(true);
      } else {
        console.log("Token expired. Please log in again.");
      }
    }
  }, [router, setIsAuth]);

  return (
    <ExpenseContext.Provider
      value={{
        data,
        setData,
        password,
        isAuth,
        setIsAuth,
        setPassword,
        fetchExpenses,
        deleteExpense,
        updateExpense,
      }}
    >
      {children}
    </ExpenseContext.Provider>
  );
};

export default ExpenseProvider;

export const useExpenseContext = () => {
  const context = useContext(ExpenseContext);
  if (context === undefined) {
    throw new Error("useExpenseContext must be used within a ExpenseProvider");
  }
  return context;
};
