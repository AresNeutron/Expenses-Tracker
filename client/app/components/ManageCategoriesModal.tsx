"use client";

import type React from "react";
import { useState } from "react";
import type { Category } from "../interfaces/api_interfaces";
import { useExpenseContext } from "../context/Context";
import { Plus, Trash2, X, Palette, Smile, Tag } from "lucide-react";

interface ManageCategoriesModalProps {
  onClose: () => void;
}

const ManageCategoriesModal: React.FC<ManageCategoriesModalProps> = ({
  onClose,
}) => {
  const { categories, createCategory, deleteCategory } = useExpenseContext();
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryIcon, setNewCategoryIcon] = useState("📦");
  const [newCategoryColor, setNewCategoryColor] = useState("#6B7280");
  const [newCategoryIsExpense, setNewCategoryIsExpense] = useState(true);

  // Emojis predefinidos para selección rápida
  const commonEmojis = [
    "📦",
    "🏠",
    "🚗",
    "🍽️",
    "🛍️",
    "💡",
    "🎬",
    "🏥",
    "📚",
    "✈️",
    "💄",
    "🎮",
    "📱",
    "💻",
    "🎵",
    "🏋️",
    "🐕",
    "🌱",
    "🔧",
    "📝",
    "💰",
    "💵",
    "📈",
    "🎁",
    "💳",
    "🏦",
    "💼",
    "🎯",
    "⭐",
    "🔥",
  ];

  // Colores predefinidos
  const commonColors = [
    "#FF6B6B",
    "#4ECDC4",
    "#45B7D1",
    "#96CEB4",
    "#FFEAA7",
    "#DDA0DD",
    "#98D8C8",
    "#F7DC6F",
    "#BB8FCE",
    "#85C1E9",
    "#2ECC71",
    "#3498DB",
    "#9B59B6",
    "#E74C3C",
    "#F39C12",
    "#1ABC9C",
    "#E67E22",
    "#34495E",
  ];

  const handleCreateCategory = async () => {
    if (newCategoryName.trim() === "") {
      alert("Please enter a category name.");
      return;
    }

    const created = await createCategory({
      name: newCategoryName,
      is_expense: newCategoryIsExpense,
      icon: newCategoryIcon,
      color: newCategoryColor,
    });

    if (created) {
      setNewCategoryName("");
      setNewCategoryIcon("📦");
      setNewCategoryColor("#6B7280");
      setNewCategoryIsExpense(true);
    }
  };

  const handleDeleteCategory = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this category?")) {
      await deleteCategory(id);
    }
  };

  return (
    <div className="fixed inset-0 bg-neutral-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4">
      <div className="card w-full max-w-4xl bg-surface-primary max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-border-primary">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-neutral-800 dark:text-neutral-100">
                Manage Categories
              </h2>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                Create and organize your custom categories
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-button transition-colors duration-200 flex-shrink-0"
            >
              <X className="w-5 h-5 text-neutral-500" />
            </button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row h-full max-h-[calc(90vh-80px)]">
          {/* Create Category Form */}
          <div className="lg:w-1/2 p-4 sm:p-6 border-b lg:border-b-0 lg:border-r border-border-primary">
            <h3 className="text-base sm:text-lg font-semibold text-neutral-800 dark:text-neutral-100 mb-4 flex items-center gap-2">
              <Plus className="w-4 h-4 sm:w-5 sm:h-5 text-primary-500" />
              Add New Category
            </h3>

            <div className="space-y-4 sm:space-y-6">
              {/* Category Name */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Category Name
                </label>
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  className="inputElement text-sm sm:text-base"
                  placeholder="e.g., Groceries, Rent, Salary"
                />
              </div>

              {/* Category Type Toggle */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3">
                  Category Type
                </label>
                <div className="flex flex-col xs:flex-row items-stretch xs:items-center gap-2 xs:gap-4">
                  <button
                    onClick={() => setNewCategoryIsExpense(true)}
                    className={`flex items-center justify-center xs:justify-start gap-2 px-3 sm:px-4 py-2 rounded-button transition-all duration-200 text-sm ${
                      newCategoryIsExpense
                        ? "bg-error-100 dark:bg-error-900/30 text-error-700 dark:text-error-300 border border-error-200 dark:border-error-700/50"
                        : "bg-surface-secondary text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700"
                    }`}
                  >
                    <div className="w-3 h-3 bg-error-500 rounded-full flex-shrink-0"></div>
                    Expense
                  </button>
                  <button
                    onClick={() => setNewCategoryIsExpense(false)}
                    className={`flex items-center justify-center xs:justify-start gap-2 px-3 sm:px-4 py-2 rounded-button transition-all duration-200 text-sm ${
                      !newCategoryIsExpense
                        ? "bg-success-100 dark:bg-success-900/30 text-success-700 dark:text-success-300 border border-success-200 dark:border-success-700/50"
                        : "bg-surface-secondary text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700"
                    }`}
                  >
                    <div className="w-3 h-3 bg-success-500 rounded-full flex-shrink-0"></div>
                    Income
                  </button>
                </div>
              </div>

              {/* Icon Selection */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3">
                  <Smile className="w-4 h-4 inline mr-1" />
                  Category Icon
                </label>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 sm:w-12 sm:h-12 rounded-button border-2 border-border-primary flex items-center justify-center text-xl sm:text-2xl flex-shrink-0"
                      style={{ backgroundColor: `${newCategoryColor}20` }}
                    >
                      {newCategoryIcon}
                    </div>
                    <input
                      type="text"
                      value={newCategoryIcon}
                      onChange={(e) => setNewCategoryIcon(e.target.value)}
                      className="inputElement flex-1 text-sm sm:text-base"
                      placeholder="Enter emoji or text"
                      maxLength={2}
                    />
                  </div>
                  <div className="grid grid-cols-8 sm:grid-cols-10 gap-1 sm:gap-2">
                    {commonEmojis.map((emoji) => (
                      <button
                        key={emoji}
                        onClick={() => setNewCategoryIcon(emoji)}
                        className={`w-7 h-7 sm:w-8 sm:h-8 rounded-input text-sm sm:text-lg hover:bg-surface-secondary transition-colors duration-200 ${
                          newCategoryIcon === emoji
                            ? "bg-primary-100 dark:bg-primary-900/30"
                            : ""
                        }`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Color Selection */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3">
                  <Palette className="w-4 h-4 inline mr-1" />
                  Category Color
                </label>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 sm:w-12 sm:h-12 rounded-button border-2 border-border-primary flex-shrink-0"
                      style={{ backgroundColor: newCategoryColor }}
                    ></div>
                    <input
                      type="color"
                      value={newCategoryColor}
                      onChange={(e) => setNewCategoryColor(e.target.value)}
                      className="w-12 h-8 sm:w-16 sm:h-10 rounded-input border border-border-primary cursor-pointer flex-shrink-0"
                    />
                    <input
                      type="text"
                      value={newCategoryColor}
                      onChange={(e) => setNewCategoryColor(e.target.value)}
                      className="inputElement flex-1 text-sm sm:text-base"
                      placeholder="#6B7280"
                    />
                  </div>
                  <div className="grid grid-cols-6 sm:grid-cols-9 gap-1 sm:gap-2">
                    {commonColors.map((color) => (
                      <button
                        key={color}
                        onClick={() => setNewCategoryColor(color)}
                        className={`w-7 h-7 sm:w-8 sm:h-8 rounded-input border-2 transition-all duration-200 hover:scale-110 ${
                          newCategoryColor === color
                            ? "border-neutral-800 dark:border-neutral-200 scale-110"
                            : "border-border-primary"
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Create Button */}
              <button
                onClick={handleCreateCategory}
                className="w-full submitButton flex items-center justify-center gap-2 text-sm sm:text-base"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Create Category</span>
                <span className="sm:hidden">Create</span>
              </button>
            </div>
          </div>

          {/* Existing Categories List */}
          <div className="lg:w-1/2 p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold text-neutral-800 dark:text-neutral-100 mb-4 flex items-center gap-2">
              <Tag className="w-4 h-4 sm:w-5 sm:h-5 text-primary-500" />
              Your Categories ({categories.length})
            </h3>

            {categories.length === 0 ? (
              <div className="text-center py-8 sm:py-12">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-neutral-100 dark:bg-neutral-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Tag className="w-6 h-6 sm:w-8 sm:h-8 text-neutral-400" />
                </div>
                <p className="text-neutral-600 dark:text-neutral-400 text-sm sm:text-base">
                  No custom categories yet.
                </p>
                <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-500 mt-1">
                  Create your first category to get started!
                </p>
              </div>
            ) : (
              <div className="space-y-2 sm:space-y-3 max-h-64 sm:max-h-96 overflow-y-auto pr-1 sm:pr-2">
                {categories.map((category: Category) => (
                  <div
                    key={category.id}
                    className="group card p-3 sm:p-4 hover:shadow-card-hover transition-all duration-200"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                        <div
                          className="w-8 h-8 sm:w-10 sm:h-10 rounded-button flex items-center justify-center text-sm sm:text-lg border-2 flex-shrink-0"
                          style={{
                            backgroundColor: `${category.color}20`,
                            borderColor: `${category.color}40`,
                          }}
                        >
                          {category.icon || "📦"}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="font-medium text-neutral-800 dark:text-neutral-100 text-sm sm:text-base truncate">
                            {category.name}
                          </h4>
                          <div className="flex items-center gap-2 mt-1">
                            <span
                              className={`text-xs px-2 py-1 rounded-full ${
                                category.is_expense
                                  ? "bg-error-100 dark:bg-error-900/30 text-error-700 dark:text-error-300"
                                  : "bg-success-100 dark:bg-success-900/30 text-success-700 dark:text-success-300"
                              }`}
                            >
                              {category.is_expense ? "Expense" : "Income"}
                            </span>
                            <div
                              className="w-2 h-2 sm:w-3 sm:h-3 rounded-full border border-neutral-300 dark:border-neutral-600 flex-shrink-0"
                              style={{ backgroundColor: category.color }}
                            />
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteCategory(category.id)}
                        className="opacity-0 group-hover:opacity-100 p-1 sm:p-2 hover:bg-error-50 dark:hover:bg-error-900/20 text-error-500 hover:text-error-600 rounded-input transition-all duration-200 flex-shrink-0"
                      >
                        <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageCategoriesModal;
