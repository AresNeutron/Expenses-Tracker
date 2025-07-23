// components/ManageCategoriesModal.tsx
"use client";

import React, { useState } from "react";
import { Category } from "../interfaces/api_interfaces";
import { useExpenseContext } from "./Context";

interface ManageCategoriesModalProps {
  onClose: () => void;
}

const ManageCategoriesModal: React.FC<ManageCategoriesModalProps> = ({ onClose }) => {
  const { categories, createCategory, deleteCategory } = useExpenseContext();
  const [newCategoryName, setNewCategoryName] = useState("");

  const handleCreateCategory = async () => {
    if (newCategoryName.trim() === "") {
      alert("Please enter a category name.");
      return;
    }
    const created = await createCategory({ name: newCategoryName });
    if (created) {
      setNewCategoryName("");
      // fetchCategories(); // El contexto ya actualiza el estado
    }
  };

  const handleDeleteCategory = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this category?")) {
      await deleteCategory(id);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-lg">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Manage Categories</h2>

        <div className="mb-6">
          <h3 className="text-xl font-semibold text-gray-700 mb-3">Add New Category</h3>
          <div className="flex gap-2">
            <input
              type="text"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="e.g., Groceries, Rent, Salary"
            />
            <button
              onClick={handleCreateCategory}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition duration-300"
            >
              Add Category
            </button>
          </div>
        </div>

        <h3 className="text-xl font-semibold text-gray-700 mb-3">Existing Categories</h3>
        {categories.length === 0 ? (
          <p className="text-gray-600">No categories found. Add some!</p>
        ) : (
          <ul className="space-y-3 max-h-60 overflow-y-auto pr-2">
            {categories.map((category: Category) => (
              <li
                key={category.id}
                className="flex justify-between items-center bg-gray-50 p-3 rounded-md border border-gray-200"
              >
                <span className="text-gray-800 font-medium">{category.name}</span>
                <button
                  onClick={() => handleDeleteCategory(category.id)}
                  className="text-red-500 hover:text-red-700 text-sm"
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}

        <div className="flex justify-end mt-8">
          <button
            onClick={onClose}
            className="bg-gray-300 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-400 transition duration-300"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ManageCategoriesModal;