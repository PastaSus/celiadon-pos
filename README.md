# POS System

A web-based Point of Sale (POS) system with inventory management built with React, Tailwind CSS, Node.js, Express, and PostgreSQL.

## Features

1. **Inventory Management** - Add, edit, delete, and view products
2. **Point of Sale** - Sales interface with cart functionality
3. **Sales Transactions** - Transaction history with receipt generation
4. **Dashboard** - Overview of key metrics
5. **Auth** - JWT login with admin / manager / cashier roles

## Tech Stack

- **Frontend:** React + Vite + Tailwind CSS
- **Backend:** Node.js + Express + TypeScript
- **Database:** PostgreSQL (Neon free tier)
- **Shared types:** `shared/types.ts` imported by both client and server

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- PostgreSQL database (local or Neon cloud)

## Installation

### 1. Clone the repository

```bash
git clone <repository-url>
cd pos-system
```

### 2. Install dependencies

```bash
# Install client dependencies
cd client
npm install

# Install server dependencies
cd ../server
npm install
```

### 3. Database Setup

1. Create a PostgreSQL database (e.g. a free Neon project)
2. Apply the schema and seed data from `server/db.sql`:

```bash
psql "$DATABASE_URL" -f server/db.sql
```

### 4. Configure Environment Variables

Create a `.env` file in the `server` directory (see `server/.env.example`):

```env
DATABASE_URL=postgresql://user:password@host:5432/pos_system?sslmode=require
JWT_SECRET=replace-me-with-a-long-random-secret
JWT_EXPIRES_IN=7d
PORT=5000
```

### 5. Seed the admin user

`server/db.sql` inserts `admin@cubetech.pos` with a bcrypt-hashed demo password (documented
separately — change it before deploying). The hash in the SQL file is a bcrypt hash of that
demo password; only the hash is stored, never the plaintext.

### 6. Start the Application

```bash
# Terminal 1 - Start the server
cd server
npm run dev

# Terminal 2 - Start the client
cd client
npm run dev
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend: http://localhost:5000

## Database Schema

### Products Table
- `id` - Primary key
- `name` - Product name
- `price` - Product price (DECIMAL)
- `stock_quantity` - Current stock
- `category_id` - Optional FK to Categories
- `reorder_level` - Low-stock threshold (default 10)
- `created_at` - Creation timestamp
- `updated_at` - Last update timestamp (set explicitly in UPDATE; PostgreSQL has no ON UPDATE)

### Users Table
- `id` - Primary key
- `email` - Unique login email
- `password_hash` - bcrypt hash (never plaintext)
- `role` - admin | manager | cashier
- `created_at` - Creation timestamp

### Categories / Stock Movements
- `categories(id, name, created_at)` - product grouping
- `stock_movements(id, product_id, type, quantity, reason, user_id, created_at)` - audit trail

### Sales Table
- `id` - Primary key
- `receipt_number` - Unique receipt identifier
- `total_amount` - Total sale amount (DECIMAL)
- `payment_method` - cash | card | e-wallet (nullable)
- `user_id` - FK to Users, who processed the sale (nullable)
- `transaction_date` - Transaction timestamp

### Sales Details Table
- `id` - Primary key
- `sale_id` - Foreign key to Sales
- `product_id` - Foreign key to Products
- `quantity` - Quantity sold
- `unit_price` - Price at time of sale
- `subtotal` - Line item total

## API Endpoints

All endpoints except `POST /api/auth/login` require `Authorization: Bearer <JWT>`.
Writes on products require admin or manager; `GET /api/dashboard` requires admin or
manager; sales reads/writes are open to all authenticated roles.

### Auth
- `POST /api/auth/login` - Login (public)
- `POST /api/auth/register` - Create user (admin only)
- `GET /api/auth/me` - Current session user

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

### Sales
- `GET /api/sales` - Get all sales
- `GET /api/sales/:id` - Get sale details
- `POST /api/sales` - Create new sale

### Dashboard
- `GET /api/dashboard` - Get dashboard statistics

## License

MIT
