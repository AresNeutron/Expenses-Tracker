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
  useMemo,
} from "react";
import { isTokenValid, setupTokenRefresh } from "../utils/tokens";
import {
  Transaction, // Importar Transaction
  Account,
  Category,
  CreateAccountPayload,
  CreateTransactionPayload,
  CreateCategoryPayload,
  DefaultCategory,
} from "../interfaces/api_interfaces"; // Asegúrate de que todas las interfaces están importadas

// Importar funciones API
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
import { ExpenseContextProps } from "../interfaces/interfaces";
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

  // Estados para cada tipo de dato
  const [expenses, setExpenses] = useState<Transaction[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [defaultCategories, setDefaultCategories] = useState<DefaultCategory[]>([]);

  const router = useRouter();

  // --- Funciones API para Transacciones (anteriormente Gastos) ---
  const fetchTransactions = useCallback(async () => {
    try {
      const data = await getTransactions(); // Llamar a la función renombrada
      setExpenses(data); // Actualizar el estado `expenses`
    } catch (error) {
      console.error("Failed to fetch transactions:", error);
    }
  }, []);

  const createTransaction = useCallback(async (newTransaction: CreateTransactionPayload) => {
    try {
      const created = await apiCreateTransaction(newTransaction);
      setExpenses((prev) => [...prev, created]);
      return created;
    } catch (error) {
      console.error("Failed to create transaction:", error);
      return undefined;
    }
  }, []);

  const deleteTransaction = useCallback(async (id: number) => {
    try {
      await apiDeleteTransaction(id);
      setExpenses((prev) => prev.filter((exp) => exp.id !== id));
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

  const createAccount = useCallback(async (newAccount: CreateAccountPayload) => {
    try {
      const created = await apiCreateAccount(newAccount);
      setAccounts((prev) => [...prev, created]);
      return created;
    } catch (error) {
      console.error("Failed to create account:", error);
      return undefined;
    }
  }, []);

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

  const createCategory = useCallback(async (newCategory: CreateCategoryPayload) => {
    try {
      const created = await apiCreateCategory(newCategory);
      setCategories((prev) => [...prev, created]);
      return created;
    } catch (error) {
      console.error("Failed to create category:", error);
      return undefined;
    }
  }, []);

  const deleteCategory = useCallback(async (id: number) => {
    try {
      await apiDeleteCategory(id);
      setCategories((prev) => prev.filter((cat) => cat.id !== id));
    } catch (error) {
      console.error("Failed to delete category:", error);
    }
  }, []);


  // Configuración del refresco de token e inicio de carga de datos al montar el componente
  useEffect(() => {
    const initializeAuthAndData = async () => {
      const accessToken = localStorage.getItem("access_token");
      if (accessToken) {
        if (isTokenValid()) {
          setIsAuth(true);
          setupTokenRefresh(); // Configura el refresco de token si es válido
          // Cargar datos iniciales para todas las entidades
          await Promise.all([
            fetchTransactions(), // Llamar a la función renombrada
            fetchAccounts(),
            fetchCategories(),
          ]);
        } else {
          console.log("Your session expired. Please log in again.");
          setIsAuth(false);
          // Opcional: limpiar tokens si expiró y redirigir al login
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
          router.push("/"); // O tu página de login
        }
      } else {
        setIsAuth(false);
        router.push("/"); // Redirigir al login si no hay token
      }
    };

    initializeAuthAndData();
  }, [router, setIsAuth, fetchTransactions, fetchAccounts, fetchCategories]); // Asegúrate de incluir todas las dependencias

  useEffect(()=> {
    const fetchCategories = async () => {
      try {
        const data = await getDefaultCategories();
        setDefaultCategories(data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchCategories();
  }, [])

  const memorizedCategories = useMemo(() => {
    return defaultCategories;
  }, [defaultCategories]);

  return (
    <ExpenseContext.Provider
      value={{
        password,
        isAuth,
        setIsAuth,
        setPassword,
        expenses, // Estado `expenses` para transacciones
        setExpenses,
        accounts,
        setAccounts,
        categories,
        setCategories,
        fetchTransactions, // Función para transacciones
        createTransaction,
        deleteTransaction,
        fetchAccounts,
        createAccount,
        deleteAccount,
        fetchCategories,
        createCategory,
        deleteCategory,
        memorizedCategories,
      }}
    >
      {isAuth && <Navbar/>}
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