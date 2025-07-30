// services/accounts.ts
import axios from "axios";
import { Account, CreateAccountPayload, CustomAccountResponse } from "../interfaces/api_interfaces";
import api from "./api";

export const getAccounts = async (): Promise<Account[]> => {
  try {
    const response = await api.get<Account[]>("accounts/");
    return response.data;
  } catch (error) {
    console.error("Error fetching accounts:", error);
    throw error;
  }
};

export const createAccount = async (account: CreateAccountPayload): Promise<CustomAccountResponse> => {
  try {
    const response = await api.post("accounts/create/", account);
    console.log(response.data)
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response && error.response.status === 400) {
      console.log(error.response.data)
      return error.response.data;
    }
    throw error;
  }
};

export const deleteAccount = async (id: number): Promise<void> => {
  try {
    await api.delete(`accounts/${id}/`);
  } catch (error) {
    console.error("Error deleting account:", error);
    throw error;
  }
};

