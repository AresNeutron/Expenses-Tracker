// services/accounts.ts
import api from "./api";
import { Account } from "../interfaces/interfaces";

export const getAccounts = async (): Promise<Account[]> => {
  try {
    const response = await api.get<Account[]>("/accounts/");
    return response.data;
  } catch (error) {
    console.error("Error fetching accounts:", error);
    throw error;
  }
};

export const createAccount = async (account: Omit<Account, 'id' | 'user' | 'balance' | 'initial_balance' | 'is_active'>): Promise<Account> => {
  try {
    // Cuando creas una cuenta, el backend probablemente calculará 'balance', 'initial_balance' y 'is_active'.
    // Por eso los omitimos en el tipo de entrada. Si tu API espera un `initial_balance` explícito, ajústalo.
    const response = await api.post<Account>("/accounts/", account);
    return response.data;
  } catch (error) {
    console.error("Error creating account:", error);
    throw error;
  }
};

export const updateAccount = async (id: number, account: Account): Promise<Account> => {
  try {
    const response = await api.put<Account>(`/accounts/${id}/`, account);
    return response.data;
  } catch (error) {
    console.error("Error updating account:", error);
    throw error;
  }
};

export const deleteAccount = async (id: number): Promise<void> => {
  try {
    await api.delete(`/accounts/${id}/`);
  } catch (error) {
    console.error("Error deleting account:", error);
    throw error;
  }
};

