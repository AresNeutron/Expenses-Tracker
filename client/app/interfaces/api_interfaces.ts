// Enums o tipos literales para las opciones
export type AccountType = "bank" | "cash" | "card" | "other";
export type TransactionType = "expense" | "income";
export type TransactionStatus = "pending" | "cleared" | "reconciled" | "void";
export type CategoryTypeModel = "category" | "defaultcategory";

export interface Account {
  id: number; 
  user: number;
  name: string;
  acc_type: AccountType 
  balance: string;
  initial_balance: string;
  is_active: boolean;
  currency: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null; 
  last_transaction_date: string | null; 
}

export interface Category {
  id: number;
  user: number;
  name: string;
  parent_category: number | null;
  is_expense: boolean;
  icon: string;
  color: string;
  order: number;
  is_active: boolean;
  created_at: string; 
  updated_at: string; 
}

export interface DefaultCategory {
  id: number;
  name: string;
  is_expense: boolean;
  icon: string;
  color: string;
  order: number;
}

export interface Transaction {
  id: number;
  user: number;
  account: number;
  transaction_type: TransactionType; 
  linked_transaction: number | null;
  status: TransactionStatus;
  category_id: number 
  category_type_model: CategoryTypeModel;
  amount: string; 
  notes: string;
  created_at: string;
  updated_at: string;
}


export interface CreateAccountPayload {
  name: string;
  acc_type: AccountType;
  currency: string;
  initial_balance: string;
}

export interface CreateCategoryPayload {
  name: string;
  parent_category?: number | null; // Opcional, puede ser null
  is_expense?: boolean; // si no se provee, se considera gasto por defecto
  icon?: string; // Opcional, es para mejorar la UX
  color?: string; // Opcional, es para mejorar la UX
}

export interface CreateTransactionPayload {
  account: number;
  transaction_type: TransactionType;
  linked_transaction?: number | null; // Opcional, puede ser null
  status?: TransactionStatus; // Opcional, tiene un default en el backend
  category_id: number;
  category_type_model: CategoryTypeModel; 
  amount: string;
  notes?: string; // Opcional
}


export interface CustomAccountResponse {
  success: boolean;
  data: Account;
  error_details: ErrorDetail;
};

export interface CustomTransacctionResponse {
  success: boolean;
  data: Transaction;
  error_details: ErrorDetail;
}

type ErrorDetail = {
  [key: string]: string[]
}