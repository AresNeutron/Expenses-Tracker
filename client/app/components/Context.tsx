// context/ExpenseContext.tsx
"use client";

import { usePathname, useRouter } from "next/navigation";
import React, {
  createContext,
  useState,
  ReactNode,
  useContext,
  useEffect,
  useCallback,
} from "react";
import { checkAuthenticationStatus, clearAuthTokens, setupTokenRefresh } from "../utils/tokens";
import {
  Transaction, // Importar Transaction
  Account,
  Category,
  CreateTransactionPayload,
  CreateCategoryPayload,
  DefaultCategory,
  CreateAccountPayload,
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
  const currentPath = usePathname();

  // --- Funciones API para Transacciones (anteriormente Gastos) ---
  const fetchTransactions = useCallback(async () => {
    const data = await getTransactions(filters);
    setTransactions(data);
  }, [filters]);

  const createTransaction = useCallback(
    async (newTransaction: CreateTransactionPayload) => {
      const custom_response = await apiCreateTransaction(newTransaction);
      if (custom_response.success) {
        setTransactions((prev) => [...prev, custom_response.data]);
      }
      return custom_response;
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
    const data = await getAccounts();
    setAccounts(data);
  }, []);

  const createAccount = useCallback(
    async (newAccount: CreateAccountPayload) => {
      const custom_response = await apiCreateAccount(newAccount);
      if (custom_response.success) {
        setAccounts((prev) => [...prev, custom_response.data]);
      }
      return custom_response;
    },
    []
  );

  const deleteAccount = useCallback(async (id: number) => {
    await apiDeleteAccount(id);
    setAccounts((prev) => prev.filter((acc) => acc.id !== id));
  }, []);

  // --- Funciones API para Categorías ---
  const fetchCategories = useCallback(async () => {
    const data = await getCategories();
    setCategories(data);
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
    const data = await getDefaultCategories();
    setDefaultCategories(data);
  }, []);

  // Initialize authentication only once on app startup
  const initializeAuth = useCallback(async () => {
    try {
      const isAuthenticated = await checkAuthenticationStatus();
      
      if (isAuthenticated) {
        setIsAuth(true);
        
        // Load user data after successful authentication
        await Promise.all([
          fetchTransactions(),
          fetchAccounts(),
          fetchCategories(),
        ]);

        // Redirect to dashboard if user is on login/register pages
        if (currentPath === "/" || currentPath === "/pages/register/") {
          router.push("/pages/dashboard/");
        }
      } else {
        setIsAuth(false);
        // Only redirect if user is trying to access protected pages
        if (currentPath !== "/" && currentPath !== "/pages/register/") {
          router.push("/");
        }
      }
    } catch (error) {
      console.error("Authentication initialization failed:", error);
      setIsAuth(false);
      clearAuthTokens();
    }
  }, [fetchTransactions, fetchAccounts, fetchCategories, currentPath, router]);

  // Handle successful login - call this after login API success
  const handleLoginSuccess = useCallback(async () => {
    setIsAuth(true);
    setupTokenRefresh(); // Setup automatic token refresh
    
    // Load user data
    await Promise.all([
      fetchTransactions(),
      fetchAccounts(),
      fetchCategories(),
    ]);
    
    router.push("/pages/dashboard/");
  }, [fetchTransactions, fetchAccounts, fetchCategories, router]);

  // Handle logout
  const handleLogout = useCallback(() => {
    setIsAuth(false);
    clearAuthTokens(); // This also clears the refresh timeout
    
    // Clear all user data
    setTransactions([]);
    setAccounts([]);
    setCategories([]);
    setFilters(initialFilters);
    
    router.push("/");
  }, [router]);

  // Run authentication check only once on app mount
  useEffect(() => {
    initializeAuth();
  }, []); // Empty dependency array ensures this runs only once

  // Separate effect for data refetching when filters change (only if authenticated)
  useEffect(() => {
    if (isAuth) {
      fetchTransactions();
    }
  }, [filters, isAuth, fetchTransactions]);

  useEffect(() => {
    fetchDefaultCategories();
  }, [fetchDefaultCategories]);

  return (
    <ExpenseContext.Provider
      value={{
        password,
        isAuth,
        setIsAuth,
        setPassword,
        handleLoginSuccess,
        handleLogout,
        transactions, // Estado `transactions` para transacciones
        accounts,
        createAccount,
        deleteAccount,
        categories,
        createTransaction,
        deleteTransaction,
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
