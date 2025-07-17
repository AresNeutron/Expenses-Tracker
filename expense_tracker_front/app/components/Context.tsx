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
import { isTokenValid, setupTokenRefresh } from "../utils/tokens";
import {
  Transaction, // Importar Transaction
  Account,
  Category,
  ExpenseContextProps,
} from "../interfaces/interfaces"; // Asegúrate de que todas las interfaces están importadas

// Importar funciones API
import {
  getTransactions, // Renombrado
  createTransaction as apiCreateTransaction, // Renombrado y aliased
  deleteTransaction as apiDeleteTransaction, // Renombrado y aliased
  updateTransaction as apiUpdateTransaction, // Renombrado y aliased
} from "../services/transactions"; // Ruta y nombre de archivo actualizado
import {
  getAccounts,
  createAccount as apiCreateAccount,
  deleteAccount as apiDeleteAccount,
  updateAccount as apiUpdateAccount,
} from "../services/accounts";
import {
  getCategories,
  createCategory as apiCreateCategory,
  deleteCategory as apiDeleteCategory,
  updateCategory as apiUpdateCategory,
} from "../services/categories";

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
  const [expenses, setExpenses] = useState<Transaction[]>([]); // Renombrado a `expenses` pero almacena `Transaction`
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

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

  const createTransaction = useCallback(async (newTransaction: Omit<Transaction, 'id' | 'user'>) => {
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

  const updateTransaction = useCallback(async (id: number, updatedTransaction: Transaction) => {
    try {
      const updated = await apiUpdateTransaction(id, updatedTransaction);
      setExpenses((prev) =>
        prev.map((exp) => (exp.id === id ? updated : exp))
      );
      return updated;
    } catch (error) {
      console.error("Failed to update transaction:", error);
      return undefined;
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

  const createAccount = useCallback(async (newAccount: Omit<Account, 'id' | 'user' | 'balance' | 'initial_balance' | 'is_active'>) => {
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

  const updateAccount = useCallback(async (id: number, updatedAccount: Account) => {
    try {
      const updated = await apiUpdateAccount(id, updatedAccount);
      setAccounts((prev) =>
        prev.map((acc) => (acc.id === id ? updated : acc))
      );
      return updated;
    } catch (error) {
      console.error("Failed to update account:", error);
      return undefined;
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

  const createCategory = useCallback(async (newCategory: Omit<Category, 'id' | 'user'>) => {
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

  const updateCategory = useCallback(async (id: number, updatedCategory: Category) => {
    try {
      const updated = await apiUpdateCategory(id, updatedCategory);
      setCategories((prev) =>
        prev.map((cat) => (cat.id === id ? updated : cat))
      );
      return updated;
    } catch (error) {
      console.error("Failed to update category:", error);
      return undefined;
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
          router.push("/pages/dashboard"); // Redirigir al dashboard SOLO después de cargar datos
        } else {
          console.log("Your session expired. Please log in again.");
          setIsAuth(false);
          // Opcional: limpiar tokens si expiró y redirigir al login
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
          router.push("/pages/login"); // O tu página de login
        }
      } else {
        setIsAuth(false);
        router.push("/pages/login"); // Redirigir al login si no hay token
      }
    };

    initializeAuthAndData();
  }, [router, setIsAuth, fetchTransactions, fetchAccounts, fetchCategories]); // Asegúrate de incluir todas las dependencias

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
        updateTransaction,
        fetchAccounts,
        createAccount,
        deleteAccount,
        updateAccount,
        fetchCategories,
        createCategory,
        deleteCategory,
        updateCategory,
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
    throw new Error("useExpenseContext must be used within an ExpenseProvider");
  }
  return context;
};