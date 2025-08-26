// services/transactions.ts
import axios from "axios";
import {
  CreateTransactionPayload,
  CustomTransacctionResponse,
  CustomTransactionsListResponse,
  Transaction,
} from "../interfaces/api_interfaces";
import { FiltersInterface } from "../interfaces/interfaces";
import api from "./api";

export const getTransactions = async (
  filters: FiltersInterface
): Promise<Transaction[]> => {
  let url = "transactions/";
  const queryParams = [];

  if (filters.transactionType !== "all") {
    queryParams.push(`transaction_type=${filters.transactionType}`);
  }
  
  if (filters.date !== "all") {
    queryParams.push(`date=${filters.date}`);
  }
  
  if (filters.keywords !== "all" && filters.keywords.trim() !== "") {
    queryParams.push(`search=${encodeURIComponent(filters.keywords)}`);
  }
  
  if (filters.categoryID !== "all" && filters.categoryTypeModel !== "all") {
    queryParams.push(`category_id=${filters.categoryID}`);
    queryParams.push(`category_type_model=${filters.categoryTypeModel}`);
  }

  if (queryParams.length > 0) {
    url += `?${queryParams.join("&")}`;
  }
  try {
    const response = await api.get<CustomTransactionsListResponse>(url);
    console.log("Transactions, response from server:", response);
    
    if (response.data.success) {
      return response.data.data;
    } else {
      throw new Error("Failed to fetch transactions: " + JSON.stringify(response.data.error_details));
    }
  } catch (error) {
    console.error("Error fetching transactions:", error);
    throw error;
  }
};

export const createTransaction = async (
  transaction: CreateTransactionPayload
): Promise<CustomTransacctionResponse> => {
  try {
    const response = await api.post("transactions/create/", transaction);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response && error.response.status === 400) {
      console.log(error.response.data)
      return error.response.data;
    }
    throw error;
  }
};

export const deleteTransaction = async (id: number): Promise<void> => {
  try {
    await api.delete(`transactions/${id}/`);
  } catch (error) {
    console.error("Error deleting transaction:", error);
    throw error;
  }
};
