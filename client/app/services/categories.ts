// services/categories.ts
import api from "./api";
import { Category } from "../interfaces/interfaces";

export const getCategories = async (): Promise<Category[]> => {
  try {
    const response = await api.get<Category[]>("/categories/");
    return response.data;
  } catch (error) {
    console.error("Error fetching categories:", error);
    throw error;
  }
};

export const createCategory = async (category: Omit<Category, 'id' | 'user'>): Promise<Category> => {
  try {
    const response = await api.post<Category>("/categories/", category);
    return response.data;
  } catch (error) {
    console.error("Error creating category:", error);
    throw error;
  }
};

export const deleteCategory = async (id: number): Promise<void> => {
  try {
    await api.delete(`/categories/${id}/`);
  } catch (error) {
    console.error("Error deleting category:", error);
    throw error;
  }
};