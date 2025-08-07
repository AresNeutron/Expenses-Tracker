README: Personal Finance Manager
This is a personal finance management application designed to provide users with a simple and effective way to track and manage their finances. The app focuses on helping users gain a clear understanding of their spending habits, income sources, and overall financial health through a clean and intuitive user interface.

Frontend: User-Centric Design
The frontend is built with a strong emphasis on User Experience (UX). The design is intuitive, ensuring that users can easily navigate the application without a steep learning curve. Key features of the frontend include:

Clean and Modern Interface: A visually appealing and clutter-free design that makes financial management less intimidating.

Intuitive Navigation: A straightforward layout allows users to quickly access different sections of the app, such as dashboards, transaction lists, and reports.

Responsive Design: The application is fully responsive, providing a seamless experience whether accessed on a desktop, tablet, or mobile device.

Data Visualization: Interactive charts and graphs are used to present financial data in an easy-to-understand format, helping users visualize their financial trends at a glance.

Backend: Data Models and Operations
The backend is structured around three core data models that manage all financial information.

Data Models
User Model:

id: Unique identifier for each user.

name: The user's full name.

email: The user's unique email address, used for authentication.

password: Hashed password for secure access.

created_at: Timestamp of user creation.

Account Model:

id: Unique identifier for each account.

user_id: Foreign key linking the account to a specific user.

name: A descriptive name for the account (e.g., "Checking Account," "Savings").

balance: The current balance of the account.

currency: The currency of the account (e.g., USD, EUR).

created_at: Timestamp of account creation.

Transaction Model:

id: Unique identifier for each transaction.

account_id: Foreign key linking the transaction to a specific account.

type: The type of transaction (e.g., 'income', 'expense').

category: A category for the transaction (e.g., "Groceries," "Salary," "Utilities").

amount: The monetary value of the transaction.

date: The date the transaction occurred.

description: A brief description of the transaction.

created_at: Timestamp of transaction creation.

Available Operations
The application provides a comprehensive set of CRUD (Create, Read, Update, Delete) operations for each of the core models.

User Operations:

POST /users/register: Creates a new user account.

POST /users/login: Authenticates a user and returns a token.

GET /users/me: Retrieves the details of the authenticated user.

DELETE /users/me: Deletes the user account.

Account Operations:

POST /accounts: Creates a new financial account for the authenticated user.

GET /accounts: Retrieves a list of all accounts for the authenticated user.

GET /accounts/{id}: Retrieves details for a specific account.

DELETE /accounts/{id}: Deletes a specific account.

Transaction Operations:

POST /transactions: Creates a new transaction for a specified account.

GET /transactions: Retrieves a list of all transactions for the authenticated user.

GET /transactions/{id}: Retrieves details for a specific transaction.

DELETE /transactions/{id}: Deletes a specific transaction.

Application Workflow
The general workflow for a user interacting with the application is as follows:

Registration and Login: A new user first registers an account. They then log in to gain access to their personal dashboard.

Account Creation: Upon logging in, the user creates one or more financial accounts (e.g., a "Checking" or "Savings" account) to represent their real-world financial accounts.

Transaction Management: The user begins adding transactions, categorizing them as either 'income' or 'expense' and linking them to a specific account.

Financial Overview: The dashboard provides a visual summary of the user's finances, including total balances, spending trends over time, and a breakdown of transactions by category.

Note: The feature for "transfer" transactions (moving money between two of the user's accounts) is currently not implemented but is planned for future updates.
