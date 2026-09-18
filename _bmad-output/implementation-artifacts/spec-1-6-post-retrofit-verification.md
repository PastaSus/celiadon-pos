---
title: 'Story 1.6: Prove auth, roles, and shared types still hold after the retrofit'
type: 'chore'
created: '2026-09-18'
status: 'done'
route: 'oneshot'
review_loop_iteration: 0
context: []
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** The Epic 1 refactor touched App.tsx, every component, and every page — exactly the files that carry route guards, role filtering, and API contracts — so the retrofit must prove it broke nothing it touched.

**Approach:** Verify by inspection, sweep, and runtime rather than by changing code: confirm guards, landings, and role tables in App.tsx and AuthContext; confirm generic credential errors and admin-only registration in the auth route and middleware; confirm single-source types, formatter-only money, component-only modal/table markup, and zero residual raw color classes via repo-wide sweeps; confirm both packages compile; and boot the server for DB-free runtime proofs (health 200, guard 401, validation 400). DB-backed sign-in and the full browser pass stay outstanding manual checks.

</frozen-after-approval>

## Implementation Notes

Evidence collected (no production code changed — verification only). All paths CWD-relative, line numbers verified 2026-09-18:
- FR1/FR7 (`client/src/App.tsx`): `!ready` spinner (L42, L69), `!user` to `/login` (L43), wildcard to `/login` when logged out (L82), role-denied explicit card (L45-59), nav filtered from the same table (L87), per-role landing via `landingFor` (L33-35, L132, L140). Deep links fall through the same guards; no asset/route bypass exists outside `<Routes>`.
- FR6 (`client/src/contexts/AuthContext.tsx`): boot-time `fetchMe()` failure calls `logout()` clearing token+user (L46-51); any API 401 triggers the registered unauthorized handler to the same `logout` (L35-36; handler invoked in `lib/api.ts` fetch wrapper).
- FR2/FR3 (`server/routes/auth.ts`): unknown email and wrong password share one `401 'Invalid credentials'` (L35-38); unknown emails compare against `TIMING_EQUALIZER_HASH` (L13, L30-33).
- FR5/FR8 (`server/routes/auth.ts:55`, `server/middleware/auth.ts`): `/register` sits behind `requireAuth` + `requireRole('admin')`; non-admin authenticated callers get `403 'Insufficient permissions'` (middleware L71-72), missing/malformed/expired tokens get 401 (L33, L43, L54).
- FR4: `NAV_ITEMS` (App.tsx L21-31) — `/`+`/inventory` admin/manager, `/pos`+`/transactions` all roles; `ProtectedRoute` consumes the same table (L133), so nav and guard cannot diverge.
- FR33: grep `fixed inset-0|<table` over `client/src` hits only `components/Modal.tsx:74` and `components/Table.tsx:40`; no `<dialog>`, inline th/td, or modal/table CSS in pages.
- FR34: grep `interface (Product|Sale|SaleDetail|User|Category)\b` over `client/src` returns nothing; all seven client modules import types from `shared/types.ts` (App, AuthContext, api.ts, Dashboard, Inventory, POS, Transactions).
- NFR5: `formatCurrency(` appears at 10 page call sites; grep `Intl\.NumberFormat|₱` over `client/src` returns nothing (server renders no money strings; receipts come in Epic 3).
- Retrofit sweep: grep `bg-indigo-|text-indigo-|indigo-[0-9]|text-gray-[0-9]|bg-gray-[0-9]|border-gray|divide-gray|ring-indigo` over `client/src` returns nothing; glyph/emoji/inline-SVG sweeps clean since Story 1.2/1.4.
- NFR9: `cd server && npx tsc --noEmit` exit 0 with `SERVER_TS_CLEAN`; `cd client && npm run build` exit 0 (tsc -b + vite, no new warnings).
- Runtime (tsx boot, port 5000): `curl /api/health` → 200 `{"status":"ok",...}`; `GET /api/products` (no token) → 401 `{"error":"Authentication required"}`; `POST /api/auth/login` with `{}` → 400 `{"error":"Email and password are required"}`. Smoke server killed via taskkill PID; port confirmed free (health curl refused afterwards).
- Outstanding (human-owned, blocks nothing in Epic 2 but required before demo): (1) DB-backed sign-in — seed or use a known admin, POST /api/auth/login, expect 200 + JWT, then wrong password expecting generic 401; (2) browser pass — log in per role, confirm nav items, landings, and denial card; keyboard pass per Story 1.5 manual checklist.

## Review Triage Log

All 14 blind-hunter rows share one root cause (evidence notes lacked file:line citations, patterns, commands, and outputs) and were fixed by a single notes patch — one entry, fourteen rows:
- Guards claim untraced (patched) — now cites App.tsx L42-43, L69-82, L87, L132-140.
- Token-clearing path undescribed (patched) — now cites AuthContext L35-36, L46-51 plus the api.ts 401 hook.
- Positive sign-in unverified (patched as documented-outstanding) — DB-backed sign-in is an explicit owned checklist item, not a silent gap.
- Timing-equalizer unproven (patched) — now cites auth.ts L13, L30-33.
- Admin-register uncited (patched) — now cites route L55 and middleware L71-72 with the 403 body.
- Role matrix unenumerated (patched) — full matrix plus same-table-consumption cited at App.tsx L21-31, L133.
- Deep-link/redirect behavior omitted (patched) — wildcard routes and landing redirects cited; no bypass outside Routes.
- Type-singularity pattern missing (patched) — exact grep pattern and per-file import list recorded.
- Money-formatter coverage thin (patched) — call-site count, nil-pattern sweeps, and server/receipt scoping recorded.
- Modal/table sweep incomplete (patched) — dialog/th-td/page-CSS dimensions addressed with nil results.
- Sweep reproducibility missing (patched) — exact patterns and scopes recorded.
- Compile evidence missing (patched) — commands, exit codes, and outputs recorded.
- Runtime proof missing (patched) — curl commands, bodies, port, and kill confirmation recorded.
- Outstanding checks unowned (patched) — two owned checklist items with steps and expected results recorded.
