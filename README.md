Expenses Tracker
This is a prototype full-stack application that allows users to securely manage and record their financial transactions. 
It provides a clean and intuitive interface, built with Next.js and Tailwind CSS on the frontend, while the backend is implemented using Python and Django REST Framework (DRF).

Features
User Authentication: Managed with DRF Simple JWT, supporting secure login, logout, and user data protection.
Financial Record Management: Users can add, update, and manage personal financial records.
Categories: Transactions can be categorized (e.g., Food, Rent, Salary, Utilities, Entertainment).
Date Tracking: Each record includes the transaction date.

Backend Overview
Authentication: Handles registration, login, logout, and user profile retrieval using JWT tokens.
Expense Management: Authenticated users can create, view, update, and delete their financial records securely.
Permissions: Ensures users can only access or modify their own data.
Error Handling: Provides clear feedback for invalid inputs or unauthorized actions.

Frontend Overview
Next.js Framework: Provides server-side rendering and improved performance.
Tailwind CSS: Used for a modern, responsive, and clean design.
State Management: Manages the state of financial records across components.
Design: Inspired by a tutorial by PedroTech but adapted for Next.js and Tailwind CSS, diverging from the original React and Vite implementation.

How to Use
Login/Sign Up: Users must register and log in using their credentials.
Add Records: Authenticated users can add new financial records by specifying details like description, amount, category, and date.
View Records: Users can view a summary of their transactions on the dashboard.
Edit/Delete Records: Modify or remove records as needed, with secure handling of user permissions.

Acknowledgments
This project’s frontend design was influenced by PedroTech's tutorial on building finance tracking applications, adapted and reimplemented with Next.js and Tailwind CSS.
