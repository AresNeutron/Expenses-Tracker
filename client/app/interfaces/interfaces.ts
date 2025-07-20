// Enums o tipos literales para las opciones
export type AccountType = "bank" | "cash" | "card" | "other";
export type TransactionType = "expense" | "income" | "transfer" | "adjust";
export type TransactionStatus = "pending" | "cleared" | "reconciled" | "void";

export interface Account {
  id?: number; // El ID es opcional porque no existirá al crear uno nuevo
  user?: number; // El usuario se establecerá en el backend, pero puede ser útil si lo recibes. Si no lo necesitas, puedes omitirlo o hacerlo opcional.
  name: string;
  acc_type: AccountType;
  currency: string;
  balance: number; // DecimalField en Django, mapeado a number en TS
  initial_balance: number; // DecimalField en Django
  is_active: boolean;
}

export interface Category {
  id?: number;
  user?: number;
  name: string;
  parent_category?: number | null; // ForeignKey a 'self', puede ser null
  is_expense: boolean;
}

export interface Transaction {
  id?: number;
  user?: number;
  account: number; // ID de la cuenta
  transaction_type: TransactionType;
  linked_transaction?: number | null; // Puede ser null
  status: TransactionStatus;
  category: number; // ID de la categoría
  amount: number; // DecimalField en Django
  notes: string;
  date: string; // Django DateTimeField puede venir como string ISO
}

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
  createTransaction: (newTransaction: Omit<Transaction, 'id' | 'user'>) => Promise<Transaction | undefined>;
  deleteTransaction: (id: number) => Promise<void>;
  updateTransaction: (id: number, updatedTransaction: Transaction) => Promise<Transaction | undefined>;

  // Funciones API para Cuentas
  fetchAccounts: () => Promise<void>;
  createAccount: (newAccount: Omit<Account, 'id' | 'user' | 'balance' | 'initial_balance' | 'is_active'>) => Promise<Account | undefined>;
  deleteAccount: (id: number) => Promise<void>;
  updateAccount: (id: number, updatedAccount: Account) => Promise<Account | undefined>;

  // Funciones API para Categorías
  fetchCategories: () => Promise<void>;
  createCategory: (newCategory: Omit<Category, 'id' | 'user'>) => Promise<Category | undefined>;
  deleteCategory: (id: number) => Promise<void>;
  updateCategory: (id: number, updatedCategory: Category) => Promise<Category | undefined>;
}