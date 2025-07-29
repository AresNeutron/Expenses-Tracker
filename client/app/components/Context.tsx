// context/ExpenseContext.tsx
"use client";

import { useRouter } from "next/navigation";
import React, {
  createContext,
  useState,
  ReactNode,
  useContext,
  useEffect,
  useCallback,
} from "react";
import { isTokenValid, refreshToken, setupTokenRefresh } from "../utils/tokens";
import {
  Transaction, // Importar Transaction
  Account,
  Category,
  CreateAccountPayload,
  CreateTransactionPayload,
  CreateCategoryPayload,
  DefaultCategory,
} from "../interfaces/api_interfaces";

import {
  getTransactions, // Renombrado
  createTransaction as apiCreateTransaction, // Renombrado y aliased
  deleteTransaction as apiDeleteTransaction, // Renombrado y aliased
} from "../services/transactions"; // Ruta y nombre de archivo actualizado
import {
  getAccounts,
  createAccount as apiCreateAccount,
  deleteAccount as apiDeleteAccount,
} from "../services/accounts";
import {
  getCategories,
  getDefaultCategories,
  createCategory as apiCreateCategory,
  deleteCategory as apiDeleteCategory,
} from "../services/categories";
import {
  ExpenseContextProps,
  FiltersInterface,
  initialFilters,
} from "../interfaces/interfaces";
import Navbar from "./Navbar";

export const ExpenseContext = createContext<ExpenseContextProps | undefined>(
  undefined
);

interface ExpenseProviderProps {
  children: ReactNode;
}

const ExpenseProvider: React.FC<ExpenseProviderProps> = ({ children }) => {
  const [password, setPassword] = useState<string>("");
  const [isAuth, setIsAuth] = useState<boolean>(false);
  // const [errors, setErrors] = useState<string[]>([]);

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [defaultCategories, setDefaultCategories] = useState<DefaultCategory[]>(
    []
  );
  const [filters, setFilters] = useState<FiltersInterface>(initialFilters);

  const router = useRouter();

  // --- Funciones API para Transacciones (anteriormente Gastos) ---
  const fetchTransactions = useCallback(async () => {
    try {
      const data = await getTransactions(filters); // Llamar a la función renombrada
      setTransactions(data); // Actualizar el estado `transactions`
    } catch (error) {
      console.error("Failed to fetch transactions:", error);
    }
  }, [filters]);

  const createTransaction = useCallback(
    async (newTransaction: CreateTransactionPayload) => {
      try {
        const created = await apiCreateTransaction(newTransaction);
        setTransactions((prev) => [...prev, created]);
        return created;
      } catch (error) {
        console.error("Failed to create transaction:", error);
        return undefined;
      }
    },
    []
  );

  const deleteTransaction = useCallback(async (id: number) => {
    try {
      await apiDeleteTransaction(id);
      setTransactions((prev) => prev.filter((exp) => exp.id !== id));
    } catch (error) {
      console.error("Failed to delete transaction:", error);
    }
  }, []);

  // --- Funciones API para Cuentas ---
  const fetchAccounts = useCallback(async () => {
    try {
      const data = await getAccounts();
      setAccounts(data);
    } catch (error) {
      console.error("Failed to fetch accounts:", error);
    }
  }, []);

  const createAccount = useCallback(
    async (newAccount: CreateAccountPayload) => {
      try {
        const created = await apiCreateAccount(newAccount);
        setAccounts((prev) => [...prev, created]);
        return created;
      } catch (error) {
        console.error("Failed to create account:", error);
        return undefined;
      }
    },
    []
  );

  const deleteAccount = useCallback(async (id: number) => {
    try {
      await apiDeleteAccount(id);
      setAccounts((prev) => prev.filter((acc) => acc.id !== id));
    } catch (error) {
      console.error("Failed to delete account:", error);
    }
  }, []);

  // --- Funciones API para Categorías ---
  const fetchCategories = useCallback(async () => {
    try {
      const data = await getCategories();
      setCategories(data);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    }
  }, []);

  const createCategory = useCallback(
    async (newCategory: CreateCategoryPayload) => {
      try {
        const created = await apiCreateCategory(newCategory);
        setCategories((prev) => [...prev, created]);
        return created;
      } catch (error) {
        console.error("Failed to create category:", error);
        return undefined;
      }
    },
    []
  );

  const deleteCategory = useCallback(async (id: number) => {
    try {
      await apiDeleteCategory(id);
      setCategories((prev) => prev.filter((cat) => cat.id !== id));
    } catch (error) {
      console.error("Failed to delete category:", error);
    }
  }, []);

  const fetchDefaultCategories = useCallback(async () => {
    try {
      const data = await getDefaultCategories();
      setDefaultCategories(data);
    } catch (err) {
      console.error(err);
    }
  }, []);

  const initializeAuthAndData = useCallback(async () => {
    const refresh = localStorage.getItem("refresh_token")

    // case for a new user, there is no refresh token, redirect to register page without messages
    if (!refresh) {
      setIsAuth(false);
      router.push("/pages/register/");
    }

    try {
      await refreshToken();
    } catch (error) {
      // this catch block will work under the hood every time the user token is wrong
      console.log("Error refreshing token:", error);

      setIsAuth(false);
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      router.push("/");
      return;
    }

    // this other block works if the token is still valid, and automatically redirects to dashboard
    if (isTokenValid()) {
      setIsAuth(true);
      setupTokenRefresh();

      await Promise.all([
        fetchTransactions(),
        fetchAccounts(),
        fetchCategories(),
      ]);
      router.push("/pages/dashboard/");
    } else {
      // in case the token exist but isn't valid, redirects to login page
      setIsAuth(false);

      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");

      // we must show a message in UI, something like "your session expire, log in again"
      router.push("/");
    }
  }, [
    router,
    setIsAuth,
    fetchTransactions,
    fetchAccounts,
    fetchCategories,
  ]);

  useEffect(() => {
    initializeAuthAndData();
  }, [initializeAuthAndData]);

  useEffect(()=> {
    fetchDefaultCategories();
  }, [fetchDefaultCategories])

  return (
    <ExpenseContext.Provider
      value={{
        password,
        isAuth,
        setIsAuth,
        setPassword,
        transactions, // Estado `transactions` para transacciones
        accounts,
        categories,
        createTransaction,
        deleteTransaction,
        createAccount,
        deleteAccount,
        createCategory,
        deleteCategory,
        defaultCategories,
        filters,
        setFilters,
      }}
    >
      {isAuth && <Navbar />}
      {children}
    </ExpenseContext.Provider>
  );
};

export default ExpenseProvider;

export const useExpenseContext = () => {
  const context = useContext(ExpenseContext);
  if (context === undefined) {
    throw new Error("useExpenseContext must be used within an ExpenseProvider");
  }
  return context;
};
