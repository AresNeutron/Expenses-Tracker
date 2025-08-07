📊 Personal Finance Manager
A user-centric application designed to simplify personal finance tracking and management. This tool helps users visualize their financial health, understand their spending habits, and effectively manage their accounts and transactions.

✨ Key Features
Our app is built with a strong focus on a seamless user experience and intuitive design.

User-Centric Interface: A clean, modern, and uncluttered design that makes financial management less intimidating.

Responsive Layout: Fully optimized for all devices, from desktop monitors to mobile phones.

Interactive Data Visualization: Gain instant insights into your finances with easy-to-read charts and graphs.

Comprehensive Financial Tracking: Manage multiple accounts and track all income and expenses in one place.

🏗️ Backend Architecture
The backend is structured around three essential data models that power the entire application.

Data Models
User Model:

id: Unique identifier for each user.

name: User's full name.

email: Unique email address for authentication.

password: Hashed password for secure access.

created_at: Timestamp of user creation.

Account Model:

id: Unique identifier for each account.

user_id: Foreign key linking to the User model.

name: A descriptive name (e.g., "Checking," "Savings").

balance: The current balance of the account.

currency: Currency of the account (e.g., USD, EUR).

created_at: Timestamp of account creation.

Transaction Model:

id: Unique identifier for each transaction.

account_id: Foreign key linking to the Account model.

type: Type of transaction (income or expense).

category: A specific category (e.g., "Salary," "Groceries").

amount: The monetary value.

date: The date the transaction occurred.

description: A brief description.

created_at: Timestamp of transaction creation.

API Endpoints
The following operations are available for interacting with the application.

Endpoint

Method

Description

/users/register

POST

Creates a new user account.

/users/login

POST

Authenticates a user and returns a token.

/users/me

GET

Retrieves the details of the authenticated user.

/users/me

DELETE

Deletes the user account.

/accounts

POST

Creates a new financial account for the authenticated user.

/accounts

GET

Retrieves a list of all user accounts.

/accounts/{id}

GET

Retrieves details for a specific account.

/accounts/{id}

DELETE

Deletes a specific account.

/transactions

POST

Creates a new transaction for a specified account.

/transactions

GET

Retrieves a list of all user transactions.

/transactions/{id}

GET

Retrieves details for a specific transaction.

/transactions/{id}

DELETE

Deletes a specific transaction.

➡️ Application Workflow
Registration & Login: Users register to create a new account, then log in to access their dashboard.

Account Creation: Users set up their financial accounts, like a "Checking" or "Savings" account.

Transaction Management: Transactions are added and categorized, linking them to a specific account.

Financial Overview: The dashboard provides a visual summary of balances and spending patterns.

Note: The feature for "transfer" transactions (moving funds between accounts) is currently under development and will be implemented in a future update.