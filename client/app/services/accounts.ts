// services/accounts.ts
import { Account, CreateAccountPayload } from "../interfaces/api_interfaces";
import api from "./api";

export const getAccounts = async (): Promise<Account[]> => {
  try {
    const response = await api.get<Account[]>("/accounts/");
    return response.data;
  } catch (error) {
    console.error("Error fetching accounts:", error);
    throw error;
  }
};

export const createAccount = async (account: CreateAccountPayload): Promise<Account> => {
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

export const deleteAccount = async (id: number): Promise<void> => {
  try {
    await api.delete(`/accounts/${id}/`);
  } catch (error) {
    console.error("Error deleting account:", error);
    throw error;
  }
};

