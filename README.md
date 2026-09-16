# POS System

A web-based Point of Sale (POS) system with basic inventory management built with React, Tailwind CSS, Node.js, Express, and MySQL.

## Features

1. **Inventory Management** - Add, edit, delete, and view products
2. **Point of Sale** - Sales interface with cart functionality
3. **Sales Transactions** - Transaction history with receipt generation
4. **Dashboard** - Overview of key metrics

## Tech Stack

- **Frontend:** React + Vite + Tailwind CSS
- **Backend:** Node.js + Express
- **Database:** MySQL (TiDB Cloud / MySQL compatible)

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- MySQL database (local or cloud)

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

1. Create a MySQL database
2. Import the schema from `server/db.sql`

```bash
mysql -u username -p pos_system < server/db.sql
```

Or use a cloud database like TiDB Cloud.

### 4. Configure Environment Variables

Create a `.env` file in the `server` directory:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=pos_system
```

### 5. Start the Application

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
- `price` - Product price
- `stock_quantity` - Current stock
- `created_at` - Creation timestamp
- `updated_at` - Last update timestamp

### Sales Table
- `id` - Primary key
- `receipt_number` - Unique receipt identifier
- `total_amount` - Total sale amount
- `transaction_date` - Transaction timestamp

### Sales Details Table
- `id` - Primary key
- `sale_id` - Foreign key to Sales
- `product_id` - Foreign key to Products
- `quantity` - Quantity sold
- `unit_price` - Price at time of sale
- `subtotal` - Line item total

## API Endpoints

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
