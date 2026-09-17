---
id: SPEC-pos-transformation
companions: []
sources: []
---

> **Canonical contract.** This SPEC and the files in `companions:` are the complete, preservation-validated contract for what to build, test, and validate. Source documents listed in frontmatter are for traceability — consult them only if you need narrative rationale or prose color this contract intentionally omits.

# POS System Transformation

## Why

The current POS system is a functional MVP (product CRUD, cart, checkout, transaction history) but lacks every feature that makes it production-ready. For a resume project, it needs to demonstrate security, data visualization, responsive design, and real-world business logic — not just basic CRUD. This transformation turns a class-project-level app into a production-grade retail POS that solves real problems and stands out to interviewers.

## Capabilities

- **CAP-1: Authentication and Role-Based Access Control**
  - **intent:** Users can log in with email/password and access features based on their role (admin, cashier, manager).
  - **success:** Unauthenticated users see only the login page. Cashiers cannot access inventory management or reports. Admins can manage users and see all features. JWT tokens expire and refresh correctly.

- **CAP-2: Product Categories, Search, and Filtering**
  - **intent:** Users can organize products into categories, search by name, and filter the product list in both inventory and POS views.
  - **success:** Products display with category badges. Search returns results in <200ms. POS grid can be filtered by category. Inventory table supports category filter and text search simultaneously.

- **CAP-3: Payment Method Tracking**
  - **intent:** Cashiers can select a payment method (cash, card, e-wallet) when completing a sale, and the method is recorded on the transaction.
  - **success:** Sale completion form shows payment method dropdown. Transaction receipt displays the payment method. Dashboard can filter revenue by payment method.

- **CAP-4: Sales Analytics Dashboard**
  - **intent:** Admins/managers can view sales performance through interactive charts with date range filtering.
  - **success:** Dashboard shows revenue line chart (daily/weekly/monthly toggle), top 5 products bar chart, payment method breakdown pie chart, and key metrics (total revenue, avg transaction, today's sales). Date range picker filters all charts.

- **CAP-5: Low Stock Alerts and Stock Movement Log**
  - **intent:** System alerts when products fall below a threshold, and all stock changes are logged with reason and timestamp.
  - **success:** Products below reorder level show warning badge. Stock movement page shows history of all quantity changes (sale, manual adjustment, restock) with who/why/when.

- **CAP-6: Receipt Generation**
  - **intent:** After a sale, users can view and print a formatted receipt.
  - **success:** Receipt shows store name, receipt number, date, line items, total, payment method, and cashier name. Print button opens browser print dialog with receipt-formatted layout.

- **CAP-7: Reusable Component Library**
  - **intent:** Frontend uses extracted, reusable UI components instead of inline implementations.
  - **success:** Modal, Button, Table, Toast, LoadingSpinner, and Badge components exist in `client/src/components/` and are used across all pages. No duplicated modal/table implementations.

- **CAP-8: Shared Types Package**
  - **intent:** Client and server share TypeScript interfaces from a single source of truth.
  - **success:** A `shared/` directory contains type definitions. Both client and server import from it. No manual sync needed — changing a type in shared/ causes type errors in both client and server if not updated.

- **CAP-9: Responsive Mobile Layout**
  - **intent:** The POS and dashboard work on mobile devices with appropriate layout changes.
  - **success:** On screens <768px: cart becomes a slide-out drawer, nav collapses to hamburger menu, dashboard cards stack vertically, tables become scrollable horizontally.

## Constraints

- USD ($) currency throughout — standard for international projects
- PostgreSQL database — no ORM, raw SQL with parameterized `$1, $2, $3` placeholders
- Monorepo with separate `client/` and `server/` packages — maintain this structure
- Vite dev server on port 5173, Express on port 5000 — keep this dev setup
- Existing API routes (`/api/products`, `/api/sales`, `/api/dashboard`) must not break
- Entire project uses free tools and services only — no paid APIs, no paid hosting tiers required
- Deployment: two independent Vercel projects (`server/` → Express, `client/` → Vite static build) plus Neon (free tier) for PostgreSQL. Supersedes the original Render plan — Render has no config in the repo. Frontend reads `VITE_API_URL` at **build** time.

## Non-goals

- Not building: receipt printing hardware integration (paper printers)
- Not building: multi-store or multi-location support
- Not building: inventory procurement/purchasing workflow
- Not building: barcode scanning hardware integration
- Not building: payment gateway integration (Stripe/PayPal) — only tracking payment method locally

## Success signal

The app looks and feels like a real retail POS: you log in, see a dashboard with charts, process sales with payment method selection, get alerts when stock is low, and can print receipts. A recruiter opening the demo sees authentication, data visualization, responsive design, and role-based access — not just a CRUD tutorial.

## Assumptions

- Recharts will be used for dashboard charts (already common in React ecosystems)
- bcryptjs for password hashing (lightweight, no native dependencies)
- Current MySQL database schema will be migrated to PostgreSQL (new tables for users, categories, stock_movements) — `mysql2` replaced with `pg` package

## Open Questions

Both are resolved. The questions are kept verbatim above the answers so the decision trail survives; the answers are binding.

- **Should the store name on receipts be configurable, or hardcode "Cube Tech POS"?** — **Hardcode**, as a single exported `STORE_NAME = "Cube Tech POS"` constant in the receipt module. Multi-store is a non-goal, so one constant keeps it swappable without touching layout.
- **What is the default low-stock threshold — fixed at 10, or configurable per product?** — **Per product**: `products.reorder_level` with `DEFAULT 10`. Low stock is `quantity > 0 AND quantity <= reorder_level`; out of stock is `quantity <= 0`. (Both settled in `EXPERIENCE.md`.)
