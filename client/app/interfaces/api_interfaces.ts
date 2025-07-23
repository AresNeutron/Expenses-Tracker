// Enums o tipos literales para las opciones
export type AccountType = "bank" | "cash" | "card" | "other";
export type TransactionType = "expense" | "income" | "transfer" | "adjust";
export type TransactionStatus = "pending" | "cleared" | "reconciled" | "void";

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

export interface Transaction {
  id: number;
  user: number;
  account: number; // El ID de la cuenta asociada
  transaction_type: TransactionType; // 'EXPENSE', 'INCOME', 'TRANSFER'
  linked_transaction: number | null; // El ID de la transacción vinculada, puede ser null
  status: TransactionStatus; // 'PENDING', 'CLEARED', 'RECONCILED'
  category: number; // El ID de la categoría asociada
  amount: string; // DecimalField en Django se mapea a string en TS
  notes: string;
  date: string; // La fecha de la transacción
  created_at: string; // Las fechas se reciben del backend
  updated_at: string; // Las fechas se reciben del backend
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
  is_expense?: boolean; // Opcional, tiene un default en el backend
  icon?: string; // Opcional, tiene un default en el backend
  color?: string; // Opcional, tiene un default en el backend
  order?: number; // Opcional, tiene un default en el backend
  is_active?: boolean; // Opcional, tiene un default en el backend
}

export interface CreateTransactionPayload {
  account: number;
  transaction_type: TransactionType;
  linked_transaction?: number | null; // Opcional, puede ser null
  status?: TransactionStatus; // Opcional, tiene un default en el backend
  category: number;
  amount: string;
  notes?: string; // Opcional
  date: string; // La fecha de la transacción
}
