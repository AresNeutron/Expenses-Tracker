import {
  Transaction,
  Account,
  Category,
  CreateAccountPayload,
  CreateTransactionPayload,
  CreateCategoryPayload,
  DefaultCategory,
  TransactionType,
  CategoryTypeModel,
  CustomTransacctionResponse,
  CustomAccountResponse,
} from "./api_interfaces";

// Interfaz para las propiedades del contexto (lo que provee el ExpenseProvider)
export interface ExpenseContextProps {
  password: string;
  isAuth: boolean;
  setIsAuth: React.Dispatch<React.SetStateAction<boolean>>;
  setPassword: React.Dispatch<React.SetStateAction<string>>;

  // Estados para los datos
  transactions: Transaction[];
  accounts: Account[];
  categories: Category[];

  // Funciones API para Transacciones
  createTransaction: (
    newTransaction: CreateTransactionPayload
  ) => Promise<CustomTransacctionResponse>;
  deleteTransaction: (id: number) => Promise<void>;

  // Funciones API para Cuentas
  createAccount: (
    newAccount: CreateAccountPayload
  ) => Promise<CustomAccountResponse>;
  deleteAccount: (id: number) => Promise<void>;

  // Funciones API para Categorías
  createCategory: (
    newCategory: CreateCategoryPayload
  ) => Promise<Category | undefined>;
  deleteCategory: (id: number) => Promise<void>;

  defaultCategories: DefaultCategory[];

  filters: FiltersInterface;
  setFilters: React.Dispatch<React.SetStateAction<FiltersInterface>>;
}


export interface FiltersInterface {
  transactionType: "all" | TransactionType;
  accountID: string | "all";
  categoryID: string | "all";
  categoryTypeModel: CategoryTypeModel | "all";
}

export const initialFilters: FiltersInterface = {
  transactionType: "all",
  accountID: "all",
  categoryID: "all",
  categoryTypeModel: "all",
}