-- POS System Database Schema (PostgreSQL)
-- Apply with: psql "$DATABASE_URL" -f server/db.sql

-- Users ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'cashier'
        CHECK (role IN ('admin', 'cashier', 'manager')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Categories ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Products ------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
    stock_quantity INT NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
    category_id INT REFERENCES categories(id) ON DELETE SET NULL,
    reorder_level INT NOT NULL DEFAULT 10,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    -- PostgreSQL has no ON UPDATE CURRENT_TIMESTAMP; routes set this explicitly.
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Sales ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS sales (
    id SERIAL PRIMARY KEY,
    receipt_number VARCHAR(50) UNIQUE NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL CHECK (total_amount >= 0),
    payment_method VARCHAR(20) CHECK (payment_method IN ('cash', 'card', 'e-wallet')),
    user_id INT REFERENCES users(id) ON DELETE SET NULL,
    transaction_date TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Sales details -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS sales_details (
    id SERIAL PRIMARY KEY,
    sale_id INT NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
    product_id INT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    quantity INT NOT NULL CHECK (quantity > 0),
    unit_price DECIMAL(10, 2) NOT NULL,
    subtotal DECIMAL(10, 2) NOT NULL
);

-- Stock movements -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS stock_movements (
    id SERIAL PRIMARY KEY,
    product_id INT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL CHECK (type IN ('sale', 'restock', 'adjustment', 'return')),
    quantity INT NOT NULL,
    reason VARCHAR(255),
    user_id INT REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_sales_transaction_date ON sales(transaction_date DESC);
CREATE INDEX IF NOT EXISTS idx_sales_details_sale ON sales_details(sale_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_product ON stock_movements(product_id);

-- Seed: first admin. Only the bcrypt hash is stored; the plaintext demo
-- password is documented in README.md and must be changed before deploying.
-- Demo password: admin123 — change this immediately in any real deployment.
INSERT INTO users (email, password_hash, role)
VALUES ('admin@cubetech.pos', '$2a$10$VIK700GPgKvONvuMWPP95.kzQMvMYCtdd4x/bHdArie8Z0vk/syGW', 'admin')
ON CONFLICT (email) DO NOTHING;

-- Seed: sample products for testing
INSERT INTO products (name, price, stock_quantity) VALUES
('Wireless Mouse', 29.99, 50),
('Mechanical Keyboard', 89.99, 30),
('USB-C Hub', 45.00, 25),
('Monitor Stand', 35.00, 40),
('Webcam HD', 59.99, 20);
