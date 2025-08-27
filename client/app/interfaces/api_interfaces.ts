// Enums o tipos literales para las opciones
export type TransactionType = "expense" | "income"
export type CategoryTypeModel = "category" | "defaultcategory";

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
  is_expense: boolean;
  category_id: number 
  category_type_model: CategoryTypeModel;
  amount: string; 
  notes: string;
  created_at: string;
}


export interface CreateCategoryPayload {
  name: string;
  parent_category?: number | null; // Opcional, puede ser null
  is_expense?: boolean; // si no se provee, se considera gasto por defecto
  icon?: string; // Opcional, es para mejorar la UX
  color?: string; // Opcional, es para mejorar la UX
}

export interface CreateTransactionPayload {
  is_expense: boolean;
  category_id: number;
  category_type_model: CategoryTypeModel; 
  amount: string;
  notes?: string; // Opcional
}

export interface CustomTransacctionResponse {
  success: boolean;
  data: Transaction;
  error_details: ErrorDetail;
}

export type ErrorDetail = {
  [key: string]: string[]
}