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
import { checkAuthenticationStatus, clearAuthTokens } from "../utils/tokens";
import {
  Transaction, // Importar Transaction
  Category,
  CreateTransactionPayload,
  CreateCategoryPayload,
  DefaultCategory,
} from "../interfaces/api_interfaces";

import {
  getTransactions, // Renombrado
  createTransaction as apiCreateTransaction, // Renombrado y aliased
  updateTransaction as apiUpdateTransaction, // Added update function
  deleteTransaction as apiDeleteTransaction, // Renombrado y aliased
} from "../services/transactions"; // Ruta y nombre de archivo actualizado
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
import MessageModal from "../components/MessageModal";
import LoadingModal from "../components/LoadingModal";

export const ExpenseContext = createContext<ExpenseContextProps | undefined>(
  undefined
);

interface ExpenseProviderProps {
  children: ReactNode;
}

const ExpenseProvider: React.FC<ExpenseProviderProps> = ({ children }) => {
  const [password, setPassword] = useState<string>("");
  const [isAuth, setIsAuth] = useState<boolean>(false);

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [defaultCategories, setDefaultCategories] = useState<DefaultCategory[]>(
    []
  );
  const [filters, setFilters] = useState<FiltersInterface>(initialFilters);

  const [messageModal, setMessageModal] = useState({
    isOpen: false,
    type: "info" as "success" | "error" | "warning" | "info" | "confirm",
    title: "",
    message: "",
    onConfirm: undefined as (() => void) | undefined,
  });

  // Loading state
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingStartTime, setLoadingStartTime] = useState<number | undefined>(
    undefined
  );
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [activeRequests, setActiveRequests] = useState<number>(0);

  const router = useRouter();
  const currentPath = usePathname();

  const showMessage = (
    type: "success" | "error" | "warning" | "info" | "confirm",
    title: string,
    message: string,
    onConfirm?: () => void
  ) => {
    setMessageModal({
      isOpen: true,
      type,
      title,
      message,
      onConfirm,
    });
  };

  // Loading control functions
  const startLoading = useCallback(() => {
    setActiveRequests((prev) => {
      const newCount = prev + 1;
      if (newCount === 1) {
        // First request, start loading
        setIsLoading(true);
        setLoadingStartTime(Date.now());
      }
      return newCount;
    });
  }, []);

  const stopLoading = useCallback(() => {
    setActiveRequests((prev) => {
      const newCount = Math.max(0, prev - 1);
      if (newCount === 0) {
        // All requests completed, stop loading
        setIsLoading(false);
        setLoadingStartTime(undefined);
      }
      return newCount;
    });
  }, []);

  // --- Funciones API para Transacciones (anteriormente Gastos) ---
  const fetchTransactions = useCallback(async () => {
    startLoading();
    try {
      const transactions = await getTransactions(filters);
      setTransactions(transactions);
    } finally {
      stopLoading();
    }
  }, [filters, startLoading, stopLoading]);

  const createTransaction = useCallback(
    async (newTransaction: CreateTransactionPayload): Promise<void> => {
      startLoading();
      try {
        const custom_response = await apiCreateTransaction(newTransaction);
        if (custom_response.success) {
          setTransactions((prev) => [...prev, custom_response.data]);
          showMessage(
            "success",
            "Transaction Recorded",
            `Your ${
              newTransaction.is_expense ? "expense" : "income"
            } transaction has been recorded successfully!`
          );
        } else {
          const error_details = custom_response.error_details;
          let fieldError = Object.keys(error_details)[0];
          fieldError = fieldError.split("_").join(" ");
          const messageToUser = Object.values(error_details)[0][0];
          showMessage("error", "Error in input " + fieldError, messageToUser);
        }
      } finally {
        stopLoading();
      }
    },
    [startLoading, stopLoading]
  );

  const updateTransaction = useCallback(
    async (
      id: number,
      updatedTransaction: CreateTransactionPayload
    ): Promise<void> => {
      startLoading();
      try {
        const custom_response = await apiUpdateTransaction(
          id,
          updatedTransaction
        );
        if (custom_response.success) {
          setTransactions((prev) =>
            prev.map((transaction) =>
              transaction.id === id ? custom_response.data : transaction
            )
          );
        } else {
          const error_details = custom_response.error_details;
          let fieldError = Object.keys(error_details)[0];
          fieldError = fieldError.split("_").join(" ");
          const messageToUser = Object.values(error_details)[0][0];
          showMessage("error", "Error in input " + fieldError, messageToUser);
        }
      } catch (error) {
        console.error("Failed to update transaction:", error);
        throw error;
      } finally {
        stopLoading();
      }
    },
    [startLoading, stopLoading]
  );

  const deleteTransaction = useCallback(async (id: number) => {
    startLoading();
    try {
      await apiDeleteTransaction(id);
      setTransactions((prev) => prev.filter((exp) => exp.id !== id));
      showMessage(
        "success",
        "Transaction Deleted",
        "The transaction has been deleted successfully."
      );
    } catch (error) {
      console.error("Failed to delete transaction:", error);
    } finally {
      stopLoading();
    }
  }, [startLoading, stopLoading]);

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
    startLoading();
    try {
      const isAuthenticated = await checkAuthenticationStatus();

      if (isAuthenticated) {
        setIsAuth(true);

        // Load user data after successful authentication
        await Promise.all([fetchTransactions(), fetchCategories()]);

        // Redirect to transactions if user is on login/register pages
        if (currentPath === "/" || currentPath === "/pages/register/") {
          router.push("/pages/transactions/");
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
    } finally {
      stopLoading();
    }
  }, [fetchTransactions, fetchCategories, currentPath, router, startLoading, stopLoading]);

  // Run authentication check only once on app mount
  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]); // Include initializeAuth dependency

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
        showMessage,
        transactions, // Estado `transactions` para transacciones
        categories,
        createTransaction,
        updateTransaction,
        deleteTransaction,
        createCategory,
        deleteCategory,
        defaultCategories,
        filters,
        setFilters,
        isLoading,
        loadingStartTime,
        startLoading,
        stopLoading,
      }}
    >
      {/** Navbar disabled for now */}
      {/* {isAuth && <Navbar />} */}
      {children}
      {/* Loading Modal */}
      <LoadingModal isOpen={isLoading} requestStartTime={loadingStartTime} />
      {/* Message Modal */}
      <MessageModal
        isOpen={messageModal.isOpen}
        onClose={() => setMessageModal({ ...messageModal, isOpen: false })}
        type={messageModal.type}
        title={messageModal.title}
        message={messageModal.message}
        onConfirm={messageModal.onConfirm}
        confirmText="Delete Transaction"
        cancelText="Keep Transaction"
      />
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
