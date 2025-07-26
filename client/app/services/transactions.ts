// services/transactions.ts
import { CreateTransactionPayload, Transaction } from "../interfaces/api_interfaces";
import api from "./api";

export const getTransactions = async (): Promise<Transaction[]> => {
  try {
    const response = await api.get<Transaction[]>("/transactions/");
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching transactions:", error);
    throw error;
  }
};

export const createTransaction = async (transaction: CreateTransactionPayload): Promise<Transaction> => {
  try {
    const response = await api.post<Transaction>("/transactions/", transaction);
    return response.data;
  } catch (error) {
    console.error("Error creating transaction:", error);
    throw error;
  }
};

export const deleteTransaction = async (id: number): Promise<void> => {
  try {
    await api.delete(`/transactions/${id}/`);
  } catch (error) {
    console.error("Error deleting transaction:", error);
    throw error;
  }
};