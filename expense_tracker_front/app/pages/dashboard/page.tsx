"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useExpenseContext } from "../../components/Context";
import { getUserName } from "@/app/utils/auth";

export default function Dashboard() {
  const [description, setDescription] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [isExpense, setIsExpense] = useState<boolean>(false);
  const [category, setCategory] = useState<string>("");
  const [username, setUsername] = useState<string>("");

  const { setData } = useExpenseContext();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // Prevent page reload
    const today = new Date();
    const localDate = new Date(
      today.getTime() - today.getTimezoneOffset() * 60000
    );
    const formattedDate = localDate.toISOString().split("T")[0]; // "yyyy-mm-dd"

    const expenseData = {
      description,
      amount: parseFloat(amount),
      is_expense: isExpense,
      category,
      date: formattedDate, // Add the formatted date
    };

    const token = localStorage.getItem("access_token");
    if (!token) {
      alert("No access token found. Please log in.");
      return;
    }
    
    console.log("Authorization Header:", `Bearer ${token}`);
    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/api/expenses/create/",
        expenseData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setDescription("");
      setAmount("");
      setIsExpense(false);
      setCategory("");
      setData((prevData) => [...prevData, response.data]);
    } catch (error) {
      console.error(error);
    }
  };

  const handleUserName = async () => {
    const userName = await getUserName();
    setUsername(userName);
  };

  useEffect(() => {
    handleUserName();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center mt-6 text-azul p-4">
      <h1 className="text-5xl font-bold mb-8 text-center">
        Welcome to your Expense Tracker {username && (`, ${username}!`)}
      </h1>
      <form
        className="w-3/5 p-8 rounded-lg shadow-lg space-y-6 bg-white"
        onSubmit={(e) => {
          handleSubmit(e);
        }}
      >
        <div>
          <label
            htmlFor="description"
            className="block mb-2 text-xl font-medium"
          >
            Expense Description
          </label>
          <input
            id="description"
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter Expense"
            className="inputElement"
            required
          />
        </div>
        <div>
          <label htmlFor="amount" className="block mb-2 text-xl font-medium">
            Expense Amount
          </label>
          <input
            id="amount"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter Amount"
            className="inputElement"
            required
          />
        </div>
        <div className="flex items-center space-x-4">
          <input
            id="isExpense"
            type="checkbox"
            checked={isExpense}
            onChange={(e) => setIsExpense(e.target.checked)}
            className="w-6 h-6 text-azulClaro focus:ring-blue-500 focus:ring-2"
          />
          <label htmlFor="isExpense" className="text-xl">
            Is this an expense?
          </label>
        </div>
        <div>
          <label htmlFor="category" className="block mb-2 text-xl font-medium">
            Expense Category
          </label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full p-3 text-xl border-2 border-gray-300
             rounded focus:outline-none focus:ring-2 focus:ring-azulClaro"
            required
          >
            <option value="">Select a category</option>
            <option value="Food">Food</option>
            <option value="Salary">Salary</option>
            <option value="Transport">Transport</option>
            <option value="Utilities">Utilities</option>
            <option value="Entertainment">Entertainment</option>
            <option value="Other">Other</option>
          </select>
        </div>
        <button type="submit" className="submitButton">
          Add Expense
        </button>
      </form>
    </div>
  );
}
