import { Transaction, Account, Category, CreateAccountPayload, CreateTransactionPayload, CreateCategoryPayload, DefaultCategory } from "./api_interfaces";

// Interfaz para las propiedades del contexto (lo que provee el ExpenseProvider)
export interface ExpenseContextProps {
  password: string;
  isAuth: boolean;
  setIsAuth: React.Dispatch<React.SetStateAction<boolean>>;
  setPassword: React.Dispatch<React.SetStateAction<string>>;

  // Estados para los datos
  expenses: Transaction[]; // Renombrado de Expense[] a Transaction[] para mayor claridad
  accounts: Account[];
  categories: Category[];

  // Setters de estado (si quieres que los componentes externos puedan manipular el estado directamente)
  setExpenses: React.Dispatch<React.SetStateAction<Transaction[]>>;
  setAccounts: React.Dispatch<React.SetStateAction<Account[]>>;
  setCategories: React.Dispatch<React.SetStateAction<Category[]>>;

  // Funciones API para Transacciones
  fetchTransactions: () => Promise<void>; // Renombrado de fetchExpenses
  createTransaction: (newTransaction: CreateTransactionPayload) => Promise<Transaction | undefined>;
  deleteTransaction: (id: number) => Promise<void>;

  // Funciones API para Cuentas
  fetchAccounts: () => Promise<void>;
  createAccount: (newAccount: CreateAccountPayload) => Promise<Account | undefined>;
  deleteAccount: (id: number) => Promise<void>;

  // Funciones API para Categorías
  fetchCategories: () => Promise<void>;
  createCategory: (newCategory: CreateCategoryPayload) => Promise<Category | undefined>;
  deleteCategory: (id: number) => Promise<void>;

  memorizedCategories: DefaultCategory[];
}