export interface Expense {
  id: number;
  date: string;
  description: string;
  is_expense: boolean;
  amount: string;
  category: string;
}

export interface ExpenseContextProps {
  data: Expense[];
  setData: React.Dispatch<React.SetStateAction<Expense[]>>;
  password: string;
  setPassword: React.Dispatch<React.SetStateAction<string>>;
  isAuth: boolean;
  setIsAuth: React.Dispatch<React.SetStateAction<boolean>>;
  fetchExpenses: () => void;
  deleteExpense: (id: number) => void;
  updateExpense: (id: number, updatedExpense: Expense) => void;
}