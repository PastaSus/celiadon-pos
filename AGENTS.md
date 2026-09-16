<!-- bmad:context -->
<!-- Verified 2026-09-16. Managed by bmad-project-context; edits inside this block are replaced on refresh. Keep anything you want preserved outside the markers. -->

## cube-tech-pos

Point-of-sale system for retail inventory and sales. PERN stack: Vite + React 18 + Tailwind (client), Express + TypeScript + PostgreSQL (server). USD ($) currency throughout. Monorepo with separate `client/` and `server/` packages, each with own `package.json` and `node_modules`.

## Where things are

- Client entry: `client/src/App.tsx` — React Router routes, nav bar
- Server entry: `server/index.ts` — Express app, all routes mounted here
- Database schema + seed data: `server/db.sql`
- DB connection pool: `server/db.ts`
- API helper + shared TS interfaces: `client/src/lib/api.ts`
- API routes: `server/routes/products.ts`, `server/routes/sales.ts`, `server/routes/dashboard.ts`

## Running and verifying

- `npm run dev` from root starts both client (port 5173) and server (port 5000) via concurrently
- Vite proxies `/api` to `http://localhost:5000` in dev — client uses relative URLs (`/api/...`)
- Server uses `tsx watch` for hot reload; client uses Vite dev server
- DB is PostgreSQL (Neon free tier) — set `DATABASE_URL` in `server/.env`
- No test framework installed yet — `npm test` does not exist

## Conventions that differ from defaults

- Currency is USD ($), never ₱ — `client/src/lib/api.ts` and all page components
- All DB access uses `pool.query()` with parameterized `$1, $2, $3` placeholders — never string interpolation
- Sales creation uses PostgreSQL transactions with explicit `BEGIN`/`COMMIT`/`ROLLBACK` and `client.release()` — `server/routes/sales.ts`
- No ORM — raw SQL queries throughout
- No shared types package — client interfaces in `client/src/lib/api.ts` mirror server schema and must stay in sync manually

## Known pitfalls

- Root `tsconfig.json` and `eslint.config.mjs` are Next.js leftovers — not used by this project. Do not edit them for client/server changes.
- `public/` contains Next.js SVGs (`next.svg`, `vercel.svg`) — unused, safe to delete.
- `design-artifacts/`, `docs/`, `skills/`, `_bmad-output/` are empty placeholders.
- No auth exists — all endpoints are publicly accessible. Do not add protected routes without first implementing authentication.

<!-- /bmad:context -->
