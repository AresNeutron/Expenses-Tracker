// services/categories.ts
import axios from "axios";
import { Category, CreateCategoryPayload, DefaultCategory } from "../interfaces/api_interfaces";
import api from "./api";

export const getCategories = async (): Promise<Category[]> => {
  try {
    const response = await api.get<Category[]>("categories/");
    return response.data;
  } catch (error) {
    console.error("Error fetching categories:", error);
    throw error;
  }
};


export const getDefaultCategories = async (): Promise<DefaultCategory[]> => {
  const url = process.env.NEXT_PUBLIC_BACKEND_URL;
  try {
    // call to endpoint without authentication headers
    const response = await axios.get<DefaultCategory[]>(url + "api/categories/default/");
    return response.data;
  } catch (error) {
    console.error("Error fetching categories:", error);
    throw error;
  }
};


export const createCategory = async (category: CreateCategoryPayload): Promise<Category> => {
  try {
    const response = await api.post<Category>("categories/", category);
    return response.data;
  } catch (error) {
    console.error("Error creating category:", error);
    throw error;
  }
};

export const deleteCategory = async (id: number): Promise<void> => {
  try {
    await api.delete(`categories/${id}/`);
  } catch (error) {
    console.error("Error deleting category:", error);
    throw error;
  }
};