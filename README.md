# 💰 Expenses Tracker - Personal Finance Manager

A modern, full-stack personal finance management application built with Next.js and Django. This application provides users with comprehensive tools to track their financial health, manage multiple accounts, categorize transactions, and gain valuable insights into their spending habits.

## 🚀 Features

### Core Financial Management
- **Multi-Account Support**: Manage bank accounts, cash, credit cards, and other financial accounts
- **Transaction Tracking**: Record and categorize income and expenses with detailed notes
- **Category Management**: Use default categories or create custom ones with icons and colors
- **Real-time Balance Updates**: Automatic account balance calculation based on transactions
- **Financial Statistics**: View total income, expenses, and net balance at a glance

### User Experience
- **Responsive Design**: Fully optimized for desktop, tablet, and mobile devices
- **Dark/Light Theme**: Toggle between themes for comfortable viewing
- **Interactive UI**: Modern interface with smooth animations and transitions
- **Data Visualization**: Clear financial statistics and account overviews
- **Privacy Controls**: Toggle visibility of financial amounts

### Authentication & Security
- **JWT Authentication**: Secure user authentication with access and refresh tokens
- **Protected Routes**: Role-based access control for all financial data
- **Automatic Token Refresh**: Seamless session management
- **User Registration/Login**: Complete user account management system

## 🏗️ Architecture Overview

### Technology Stack

**Frontend (Client)**
- **Framework**: Next.js 15.1.2 with React 19
- **Language**: TypeScript
- **Styling**: Tailwind CSS with custom design system
- **UI Components**: Custom components with Lucide React icons
- **State Management**: React Context API
- **HTTP Client**: Axios with JWT interceptors
- **Authentication**: JWT token-based with automatic refresh

**Backend (Server)**
- **Framework**: Django 5.2.4 with Django REST Framework
- **Language**: Python
- **Database**: PostgreSQL (via psycopg2-binary)
- **Authentication**: JWT with SimpleJWT
- **API Documentation**: drf-yasg (Swagger/OpenAPI)
- **CORS**: django-cors-headers for cross-origin requests

**Deployment & DevOps**
- **Containerization**: Docker with docker-compose
- **Environment Management**: python-decouple for settings
- **Production Server**: Gunicorn WSGI server
- **Database**: PostgreSQL with connection pooling

### Core Data Models

**User Model** (Django built-in)
- Standard Django User model with authentication capabilities
- Extended through relationships with Account, Category, and Transaction models

**Account Model**
- `user`: Foreign key to User (one-to-many relationship)
- `name`: Account name (e.g., "Main Checking", "Savings")
- `acc_type`: Account type (bank, cash, card, other)
- `balance`: Current calculated balance
- `initial_balance`: Starting balance when account was created
- `currency`: Three-letter currency code (default: USD)
- `is_active`: Soft delete functionality
- `created_at`, `updated_at`: Timestamp tracking

**Category Model**
- `user`: Foreign key to User (one-to-many relationship)
- `name`: Category name (unique per user)
- `parent_category`: Self-referencing foreign key for subcategories
- `is_expense`: Boolean to distinguish income/expense categories
- `icon`: Category icon (emoji or icon code)
- `color`: Hex color code for UI representation
- `order`: Sort order for display
- `is_active`: Soft delete functionality

**Transaction Model**
- `user`: Foreign key to User (one-to-many relationship)
- `account`: Foreign key to Account
- `transaction_type`: Type (expense, income, transfer, adjustment)
- `category`: Generic foreign key to Category or DefaultCategory
- `amount`: Decimal amount (always positive)
- `notes`: Optional transaction description
- `status`: Transaction status (pending, cleared, reconciled, void)
- `linked_transaction`: Self-referencing for transfer transactions
- `created_at`: Timestamp for transaction date

**DefaultCategory Model**
- System-provided categories available to all users
- Similar structure to Category but not user-specific
- Provides common categories like "Food", "Transportation", "Salary", etc.

## 📡 API Endpoints

The REST API provides comprehensive endpoints for all application functionality:

### Authentication & User Management
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/register/` | POST | Create new user account |
| `/api/auth/login/` | POST | Authenticate user and return JWT tokens |
| `/api/auth/logout/` | POST | Logout user and blacklist refresh token |
| `/api/auth/me/` | GET | Get current authenticated user details |
| `/api/auth/token/refresh/` | POST | Refresh JWT access token |

### Account Management
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/accounts/` | GET | List all user accounts |
| `/api/accounts/create/` | POST | Create new financial account |
| `/api/accounts/{id}/` | GET | Get specific account details |
| `/api/accounts/{id}/` | DELETE | Delete account (soft delete) |

### Transaction Management
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/transactions/` | GET | List user transactions (with filtering) |
| `/api/transactions/create/` | POST | Create new transaction |
| `/api/transactions/{id}/` | GET | Get specific transaction details |
| `/api/transactions/{id}/` | PUT | Update transaction |
| `/api/transactions/{id}/` | DELETE | Delete transaction (soft delete) |

### Category Management
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/categories/` | GET/POST | List user categories or create new |
| `/api/categories/{id}/` | GET/PUT/DELETE | Manage specific category |
| `/api/categories/default/` | GET | Get system default categories |

## 🚦 Getting Started

### Prerequisites
- Node.js 18+ and npm/yarn
- Python 3.12+
- PostgreSQL database
- Docker (optional, for containerized deployment)

### Backend Setup (Django)

1. **Navigate to server directory**
   ```bash
   cd server/expense_tracker
   ```

2. **Create virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Environment configuration**
   Create a `.env` file in the server directory:
   ```env
   DATABASE_URL=postgres://user:password@localhost:5432/expense_tracker
   SECRET_KEY=your-secret-key
   DEBUG=True
   RENDER_EXTERNAL_HOSTNAME=localhost
   ```

5. **Database migration**
   ```bash
   python manage.py migrate
   ```

6. **Create superuser (optional)**
   ```bash
   python manage.py createsuperuser
   ```

7. **Run development server**
   ```bash
   python manage.py runserver
   ```

### Frontend Setup (Next.js)

1. **Navigate to client directory**
   ```bash
   cd client
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Environment configuration**
   Create a `.env.local` file:
   ```env
   NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
   ```

4. **Run development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

### Docker Setup (Alternative)

1. **Navigate to backend directory**
   ```bash
   cd server/expense_tracker
   ```

2. **Run with Docker Compose**
   ```bash
   docker-compose up --build
   ```

## 📱 Application Flow

### User Journey
1. **Registration/Login**: Users create an account or authenticate with existing credentials
2. **Account Setup**: Create financial accounts (bank, cash, credit card, etc.)
3. **Transaction Management**: Record income and expenses with categorization
4. **Financial Monitoring**: View statistics, balances, and transaction history
5. **Category Management**: Create and manage custom categories for better organization

### Key Features in Action
- **Dashboard**: Overview of all accounts and recent transactions
- **Account Management**: Add, view, and manage multiple financial accounts
- **Transaction Tracking**: Record and categorize all financial activities
- **Category System**: Use default categories or create custom ones
- **Filtering & Search**: Find specific transactions using multiple filters
- **Responsive Design**: Full functionality across all device sizes

## 🔐 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: Django's built-in password hashing
- **CORS Configuration**: Properly configured cross-origin requests
- **Soft Deletes**: Data preservation with logical deletion
- **Input Validation**: Comprehensive server-side validation
- **Environment Variables**: Sensitive data stored in environment files

## 🎨 UI/UX Features

- **Theme Toggle**: Dark and light mode support
- **Responsive Design**: Mobile-first responsive layout
- **Interactive Elements**: Smooth animations and transitions
- **Privacy Controls**: Toggle visibility of sensitive financial data
- **Modern Icons**: Lucide React icons throughout the interface
- **Form Validation**: Real-time client and server-side validation

## 🛠️ Development Scripts

### Frontend (Client)
```bash
npm run dev        # Start development server with Turbopack
npm run build      # Build production bundle
npm run start      # Start production server
npm run lint       # Run ESLint
```

### Backend (Server)
```bash
python manage.py runserver     # Start development server
python manage.py migrate       # Apply database migrations
python manage.py makemigrations # Create new migrations
python manage.py test          # Run test suite
python manage.py collectstatic # Collect static files for production
```

## 🚀 Deployment

### Production Considerations
- Set `DEBUG=False` in Django settings
- Configure production database (PostgreSQL recommended)
- Set up proper CORS origins for frontend domain
- Use environment variables for sensitive configuration
- Configure static file serving (WhiteNoise or CDN)
- Set up proper logging and monitoring

### Current Deployment Configuration
- **Frontend**: Configured for Vercel deployment
- **Backend**: Ready for Render deployment with Gunicorn
- **Database**: PostgreSQL with connection pooling
- **CORS**: Pre-configured for common deployment domains

## 📁 Project Structure

```
Expenses-Tracker/
├── client/                          # Next.js Frontend
│   ├── app/
│   │   ├── components/             # Reusable React components
│   │   ├── interfaces/             # TypeScript interfaces
│   │   ├── pages/                  # Application pages
│   │   ├── services/              # API service functions
│   │   └── utils/                 # Utility functions
│   ├── lib/                       # Shared utilities
│   └── package.json               # Frontend dependencies
├── server/                        # Django Backend
│   └── expense_tracker/
│       ├── api/                   # Django app for API
│       │   ├── migrations/        # Database migrations
│       │   ├── models.py         # Data models
│       │   ├── serializers.py    # API serializers
│       │   ├── views/            # API view functions
│       │   └── urls.py           # URL routing
│       ├── expense_tracker/       # Django project settings
│       ├── requirements.txt       # Python dependencies
│       ├── Dockerfile            # Docker configuration
│       └── docker-compose.yml    # Docker Compose setup
└── README.md                      # This file
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🔮 Future Enhancements

- **Transfer Transactions**: Move money between accounts
- **Budget Planning**: Set and track monthly budgets by category
- **Financial Reports**: Generate detailed financial reports and export data
- **Recurring Transactions**: Automate regular income and expenses
- **Multi-Currency Support**: Handle multiple currencies with exchange rates
- **Data Export**: Export transactions to CSV, PDF, or Excel formats
- **Mobile App**: React Native mobile application
- **Bank Integration**: Connect to bank APIs for automatic transaction import