// components/Navbar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

const Navbar: React.FC = () => {
  const pathname = usePathname();

  return (
    <nav className="bg-gray-800 p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        {/* Logo o Nombre de la App */}
        <Link href="/pages/dashboard" className="text-white text-2xl font-bold tracking-wide">
          <span className="text-blue-400">Finan</span>Track
        </Link>

        {/* Enlaces de Navegación */}
        <div className="space-x-6">
          <Link
            href="/pages/dashboard"
            className={`text-lg font-medium transition-colors duration-300 ${
              pathname === "/pages/dashboard"
                ? "text-blue-400 border-b-2 border-blue-400 pb-1"
                : "text-gray-300 hover:text-white"
            }`}
          >
            Accounts
          </Link>
          <Link
            href="/pages/transactions"
            className={`text-lg font-medium transition-colors duration-300 ${
              pathname === "/pages/transactions"
                ? "text-blue-400 border-b-2 border-blue-400 pb-1"
                : "text-gray-300 hover:text-white"
            }`}
          >
            Transactions
          </Link>
        </div>

        {/* Podrías añadir un botón de "Logout" o el nombre del usuario aquí */}
        {/* <div className="flex items-center space-x-4">
          <span className="text-gray-300">Welcome, User!</span>
          <button className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition-colors duration-300">
            Logout
          </button>
        </div> */}
      </div>
    </nav>
  );
};

export default Navbar;