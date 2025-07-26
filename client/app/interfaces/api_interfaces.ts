// Enums o tipos literales para las opciones
export type AccountType = "bank" | "cash" | "card" | "other";
export type TransactionType = "expense" | "income" | "transfer" | "adjust";
export type TransactionStatus = "pending" | "cleared" | "reconciled" | "void";
export type CategoryTypeModel = "category" | "defaultcategory";

export interface Account {
  id: number; 
  user: number; // El ID del usuario, aunque el backend lo asigne, lo recibimos en las respuestas.
  name: string;
  acc_type: AccountType // 'BANK', 'CASH', 'CREDIT_CARD', etc.
  balance: string; // DecimalField en Django se mapea comúnmente a string en TS para precisión
  initial_balance: string; // Como el balance, string para precisión
  is_active: boolean;
  currency: string;
  created_at: string; // Las fechas se reciben del backend
  updated_at: string; // Las fechas se reciben del backend
  deleted_at: string | null; // Puede ser null
  last_transaction_date: string | null; // Puede ser null
}

export interface Category {
  id: number;
  user: number;
  name: string;
  parent_category: number | null; // El ID de la categoría padre, puede ser null
  is_expense: boolean;
  icon: string;
  color: string;
  order: number;
  is_active: boolean;
  created_at: string; // Las fechas se reciben del backend
  updated_at: string; // Las fechas se reciben del backend
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

// Interfaces para los datos que se ENVÍAN al crear (sin ID, user, ni campos auto-generados)

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
