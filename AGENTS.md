<!-- bmad:context -->
<!-- Verified 2026-09-23 against 73720a0. Managed by bmad-project-context; edits inside this block are replaced on refresh. Keep anything you want preserved outside the markers. -->

## celiadon-pos

Point-of-sale system for retail inventory and sales. Vite + React 18 + Tailwind (client), Express + TypeScript + PostgreSQL (server), USD ($) currency throughout. Monorepo with separate `client/` and `server/` packages, each with own `package.json` and `node_modules`. Planning artifacts live in `_bmad-output/` (spec, architecture spine, UX spines, implementation specs).

## Where things are

- Client entry: `client/src/App.tsx` — routes, role-filtered nav, `ProtectedRoute`
- Server entry: `server/index.ts` — Express app; calls `listen` only when run directly (`server/api/index.ts` wraps it for Vercel)
- DB schema + seed: `server/db.sql`; connection pool: `server/db.ts`
- Shared TS types (single source of truth): `shared/types.ts`
- API helper + token handling: `client/src/lib/api.ts`; auth session: `client/src/contexts/AuthContext.tsx`; login: `client/src/pages/Login.tsx`
- Component library: `client/src/components/` (Modal, Button, Table, Toast, Badge, LoadingSpinner, SearchInput, FilterSelect, StatCard, ChartPanel, DateRangeBar, ReceiptView, EmptyState, NavDrawer, CartDrawer) — barrel `index.ts`; dialog motion lives in `client/src/hooks/useDialog.ts`
- API routes: `server/routes/{auth,products,sales,dashboard,categories,reports,stock}.ts`; JWT guards: `server/middleware/auth.ts`
- Deploy configs: `server/vercel.json`, `client/vercel.json`

## Running and verifying

- `npm run dev` from root starts both client (5173) and server (5000) via concurrently; Vite proxies `/api` to :5000 in dev
- Verify server: `cd server && npx tsc --noEmit` (this typechecks routes/, middleware/ and ../shared). Verify client: `cd client && npm run build`
- No test framework installed — `npm test` does not exist
- Local DB: Neon — `server/.env` needs `DATABASE_URL` (or `POSTGRES_URL`) and `JWT_SECRET`
- Deployed: two Vercel projects (Root Directory `server` and `client`) + Neon. Frontend reads `VITE_API_URL` at **build** time — changing it requires a frontend redeploy

## Conventions that differ from defaults

- Currency is USD ($), never ₱ — use `formatCurrency()` from `client/src/lib/api.ts`
- All DB access uses `pool.query()` with `$1, $2, $3` placeholders — never string interpolation
- Sales creation uses explicit `BEGIN`/`COMMIT`/`ROLLBACK` + `client.release()` — `server/routes/sales.ts`
- No ORM — raw SQL. pg returns `numeric` as a string; the OID-1700 parser in `db.ts` keeps prices as numbers
- Import types from `shared/types.ts`; never re-declare Product/Sale/etc. in client code
- Auth: every endpoint is behind `requireAuth`; product writes require `requireRole('admin','manager')`; `/auth/register` is admin-only
- New dialogs must use the `useDialog` hook — never copy the focus-trap effect; dialog motion tokens live in `client/src/index.css`

## Known pitfalls

- Root `tsconfig.json` and `eslint.config.mjs` are Next.js leftovers — not used. Do not edit them for client/server changes.
- `public/` contains Next.js SVGs (`next.svg`, `vercel.svg`) — unused, safe to delete.
- A missing `JWT_SECRET` fails login only on **correct** credentials (bcrypt passes, then sign throws) — reads as "wrong password", not a config error.
- Demo admin credentials (`Admin123!`) are published in `README.md` — change before any real use.

<!-- /bmad:context -->
