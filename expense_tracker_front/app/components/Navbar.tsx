"use client";

import Link from "next/link";
import { logout } from "../utils/logout";
import { useRouter } from "next/navigation";
import { useExpenseContext } from "./Context";

function Navbar() {
  const router = useRouter();
  const { isAuth, setIsAuth } = useExpenseContext();

  const handleLogout = async () => {
    const confirmLogout = window.confirm("Are you sure you want to log out?");
    if (confirmLogout) {
      await logout();
      setIsAuth(false);
      router.push("/");
    }
  };

  return (
    <div>
      {isAuth && (
    <div
      className="flex flex-wrap justify-evenly items-center bg-azul
      text-white text-xl p-4 w-full min-h-16"
    >
      <Link href="/pages/dashboard">
        <p>Add Expense</p>
      </Link>
      <Link href="/pages/expenses">
        <p>See Expenses</p>
      </Link>
      <button
        className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-700"
        onClick={handleLogout}
      >
        Log Out
      </button>
    </div>
      )}
    </div>
  );
}

export default Navbar;
