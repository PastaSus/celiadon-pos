---
title: 'Story 2.5: Record and list stock movements'
type: 'feature'
created: '2026-09-19'
status: 'in-review'
route: 'dispatch'
baseline_commit: 'dbb4cd50b1806798ae87f544be7acdff39af9f55'
review_loop_iteration: 0
context:
  - _bmad-output/implementation-artifacts/epic-2-context.md
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** `stock_movements` exists in the schema with an index and a CHECK constraint, but nothing reads or writes it — there is no `server/routes/stock.ts`, no page, and no nav entry. Every quantity change is therefore invisible: a product that reads 3 on the shelf cannot be explained, and the manager flow that opens Stock Movements to ask "sold through or adjusted?" has nowhere to land. The Inventory edit form is worse than invisible — it changes `stock_quantity` directly and records nothing.

**Approach:** Build the write path and the read path as one cohesive cross-layer story (the template's DB+BE+UI case, so they stay in one file). `server/routes/stock.ts` exposes the movements list — newest first, joined to product name and user email, narrowed by product, type, and a product-name search — and a restock/adjust/return action that records the caller and a required reason while moving the quantity in **one transaction** (AD-3). `client/src/pages/StockMovements.tsx` renders it with the existing `SearchInput`, `FilterSelect`, and `Table`, plus a modal to record a movement. Finally, the Inventory product edit stops being silent: when `stock_quantity` changes, the route writes an `adjustment` row inside its own transaction.

**Decisions (planning checkpoint, fast path — user delegated the recommendations):**
- **Writers in this story:** the stock API's restock/adjust/return (FR29), and the Inventory product PUT when the quantity changes (the AC's "manual edits"). **Sale deductions are Story 3.2's** (FR28: "decrements stock and records a sale movement within one transaction", Epic 3's FR list) — this story only defines the row shape and must keep it stable for that writer, per `epic-2-context.md`. Creating a product sets an opening balance, not a change, so it writes no movement.
- **The action takes the resulting quantity, not a delta** (`EXPERIENCE.md` Flow 2: "entering the new quantity with a reason"). The server computes and stores the **delta**, which is what FR24 requires of the row.
- **Reason is required** on every movement recorded through the API (FR29), while the list still renders a null reason as "No reason recorded" because rows written elsewhere may lack one (`EXPERIENCE.md` Flow 3 shows exactly that row).
- **Type colors:** `adjustment` is always neutral (DESIGN.md: "A stock movement of type `adjustment` carries no judgment, so it carries no color"); `restock`/`return` are green; `sale` is neutral. The signed delta is always printed, so color never carries the direction alone.
- **Filtering is server-side** — unlike Inventory's in-memory filters, movements grow without bound and cannot be filtered after loading them all.
- **Out of scope:** FR27's low-stock callout (Epic 4), even though the spine names "low-stock alerts" beside this route. No schema change, no new component, no test framework.

## Boundaries & Constraints

**Always:** `pool.query()` with `$1, $2` placeholders — the only string interpolation in a query is a fixed fragment and a placeholder index, never a value (AD-2). Quantity and movement move together inside `pool.connect()` → `BEGIN` → `COMMIT` → `release()`, with `ROLLBACK` and a rethrow on any failure (AD-3). Both endpoints sit behind `requireAuth` **and** `requireRole('admin','manager')` (FR4). Movement rows keep the schema's shape — product, type, delta, reason, user, timestamp — because Story 3.2 writes the same table. The list is newest first and shows who, why, and when (FR26).

**Never:** Never accept a hand-recorded `sale` movement — that type belongs to the sale transaction. Never let stock go below zero, and never let a `restock` or `return` reduce the quantity (a mislabeled row is the exact lie this feature exists to prevent). Never edit `shared/types.ts`'s existing `StockMovement` fields — only additive optional display fields. Never rebuild `Table`, `Modal`, `SearchInput`, or `FilterSelect` locally. No `@media print`, no CSV export, no pagination.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|---|---|---|---|
| Restock | Product at 8, resulting quantity 30, type `restock`, reason "Weekly delivery" | Stock 30; row `restock` +22, caller's email, reason stored | N/A |
| Adjustment down | Product at 30, resulting quantity 27, type `adjustment`, reason "3 damaged in transit" | Stock 27; row `adjustment` −3 | N/A |
| To zero | Resulting quantity 0 | Allowed; the product reads out of stock | N/A |
| Reason missing | `reason` absent or blank | Nothing written | 400, toast "A reason is required" |
| Restock that reduces | Product at 30, resulting quantity 20, type `restock` | Nothing written | 400, toast "A restock must increase the quantity" |
| No change | Resulting quantity equals current | Nothing written | 400, toast names the product and says nothing changed |
| Unknown product | `product_id` not in `products` | Nothing written | 404, toast "Product not found" |
| Delete product with history | Product with movements deleted | Movements cascade away with it (schema's `ON DELETE CASCADE`) | N/A — documented, not changed |
| Cashier reaches it | Cashier token, or the route in the nav | Not in the nav; route refuses | 403 on the API, "Access denied" panel from `ProtectedRoute` |
| Bad filter | `?product_id=abc` or an unknown `?type=` | Nothing listed | 400, toast with the server's message |
| Inventory edit | `PUT /products/:id` moving 8 → 12 | Product 12; row `adjustment` +4 in the same transaction | N/A |
| Inventory edit, no change | `PUT` with the same quantity | Product updated; no row written | N/A |

</frozen-after-approval>
## Code Map

- `server/db.sql:54-63` — `stock_movements(id, product_id FK CASCADE, type CHECK IN ('sale','restock','adjustment','return'), quantity INT NOT NULL, reason VARCHAR(255), user_id FK SET NULL, created_at)`. `quantity` is the **signed delta** and carries no CHECK, so a negative row is legal by design. `:68` indexes `product_id`. No schema work.
- `shared/types.ts:13` + `:64-72` — `StockMovementType` and `StockMovement` already exist and match the table. Add only optional joined display fields, mirroring `SaleDetail.product_name?` (`:61`). Never rename or retype: Story 3.2 writes this shape.
- `server/middleware/auth.ts` — `AuthedRequest.user?: User` (`:6-8`), `requireAuth` (`:30`), `requireRole(...roles)` (`:65`). `req.user!.id` and `req.user!.role` are the attribution and the guard.
- `server/routes/categories.ts` — closest structural precedent: a small router with in-route validation returning `{ error }` plus a status code. Follow its shape.
- `server/routes/products.ts:118-168` — PUT. Wraps `UPDATE ... RETURNING *` in a plain `pool.query` and 404s on an empty result; it must become transactional to read the previous quantity and write the movement (`:142-156` is the query to wrap).
- `server/routes/sales.ts:22-121` — **do not edit.** It decrements stock at `:96-99` with no movement; Story 3.2 adds the `sale` row inside that existing transaction. Read it only to confirm the shape to stay compatible with.
- `server/index.ts:4-8` (imports) and `:19-23` (mounts) — add `stockRouter` at `/api/stock`.
- `client/src/App.tsx:21-31` — `NAV_ITEMS` is the single source for the nav and the route table (`:133-139` both render from it), so one entry adds the page, its link, and its role guard. `ProtectedRoute` (`:39-63`) already renders the "Access denied" panel.
- `client/src/components/` — reuse `SearchInput` (`value`/`onChange`/`onSearch`, 200ms debounce, Escape clears), `FilterSelect` (`label`/`value`/`options`/`onChange`; sr-only label, so filter bars only), `Table` (`Column<T>`, `align`, `emptyMessage`), `Modal` (`open`/`title`/`onClose`), `Badge` + `tone` for the type cell, `EmptyState`, `Button`, `useToast`. The barrel `index.ts` is the import path.
- `client/src/pages/Inventory.tsx` — the pattern to copy for a filter row with an `aria-live` result count (`:348-390`), a `columns` array (`:277-345`), and a modal form with visible labels (`:401-520`, the reference markup for the movement form — visible `<label htmlFor>`, never `FilterSelect`).
- `client/src/lib/api.ts` — `fetchApi<T>(path, options)`; relative `/api` paths only (AD-5).

## Tasks & Acceptance

**Execution:**
- [x] `shared/types.ts` — add optional `product_name?: string` and `user_email?: string | null` to `StockMovement` — the list renders joins; the bare inserted row has neither.
- [x] `server/routes/stock.ts` (new) — `GET /movements`: auth + admin/manager, optional `product_id` / `type` / `search` filters, joins `products.name` and `users.email`, `ORDER BY created_at DESC, id DESC`. `POST /movements`: auth + admin/manager, `BEGIN` → lock the product → reject no-op and mislabeled rows → `UPDATE` the quantity → `INSERT` the movement with `req.user.id` → `COMMIT`.
- [x] `server/index.ts` — import and mount `stockRouter` at `/api/stock`.
- [x] `server/routes/products.ts` — make PUT transactional and insert an `adjustment` row when `stock_quantity` changes, attributed to `req.user!.id` with the reason "Stock edited in Inventory" — closes the silent-edit hole the AC calls "manual edits".
- [x] `client/src/pages/StockMovements.tsx` (new) — filter row (search, product, type, Clear) driving server-side queries, the newest-first table, both empty states, and the "Record movement" modal.
- [x] `client/src/App.tsx` — add the `/stock-movements` entry with roles `['admin','manager']` plus its import — nav and guard come from the same row (FR4).

**Acceptance Criteria:**
- Given products exist with no movements, when a manager records a restock with a reason, then the movement is at the top of the list carrying its delta, type, their email, the reason, and a timestamp, and the product's quantity equals the value they entered.
- Given a product at 30, when a manager records an adjustment to 27 with a reason, then the row reads −3 and the product reads 27 on Inventory.
- Given the movement form, when the reason is blank, the type is a restock that would reduce the quantity, or the entered quantity equals the current one, then nothing is written and the toast names the cause the server gave.
- Given a signed-in cashier, when they look for the surface, then it is absent from the nav and the API answers 403.
- Given a manager edits a product's stock quantity on Inventory, when the save succeeds, then exactly one `adjustment` movement with the right delta and user is recorded, and an edit that does not change the quantity records none.
- Given movements exist, when the list is filtered by product, by type, and by a product-name search, then all three narrow the same list as AND, Clear restores it in one click, and a filter that matches nothing shows the filtered-empty state with no create action.
- Given a movement whose reason is null, when it renders, then its note reads "No reason recorded" rather than showing an empty cell.
- Given the change ships, when `cd server && npx tsc --noEmit` and `cd client && npm run build` run, then both succeed.

## Implementation Notes

- Shape: two new files (`server/routes/stock.ts`, `client/src/pages/StockMovements.tsx`) and four small edits
  (`server/index.ts` mount, `client/src/App.tsx` nav row, `shared/types.ts` two optional display fields, and the
  transactional `products.ts` PUT). Schema, `sales.ts`, and every existing API contract are untouched.
- The POST takes the **resulting** quantity and stores the **delta**, so `stock_movements.quantity` stays the signed
  change FR24 describes while the person at the shelf types a counted total. Verified live: 10 → 30 records +20, and
  30 → 27 records −3.
- Refusals, all proven against the dev database: blank reason, non-integer or negative quantity, a delta of zero, a
  `restock`/`return` that would reduce stock, a hand-recorded `sale`, an unknown product (404), a non-numeric
  `product_id` filter and an unknown `type` filter (400), and a tokenless request (401). Every refusal left both the
  quantity and the history unchanged.
- The Inventory edit is no longer silent: a changed `stock_quantity` writes an `adjustment` attributed to the caller,
  with the reason "Stock edited in Inventory". Product creation writes nothing, because an opening balance is not a
  change. Both were verified plus the no-change case.
- **Sale deductions are deliberately not implemented here.** FR28 places that write inside the sale transaction
  ("decrements stock and records a sale movement within one transaction"), which is Epic 3's Story 3.2 and rewrites
  `sales.ts:22-121`. This story defines the row shape for that writer and does not duplicate it — the AC's "sale
  deductions" clause is satisfied by 3.2, and this is the one remaining path where a quantity can move untraced.
- Client decisions: filters are sent to the server (history is unbounded, unlike Inventory's in-memory rows) with a
  monotonic request guard so a slow response cannot overwrite a fresher one; the two empty states stay textually
  distinct with no create action in the filtered case; "Record movement" is absent rather than disabled when no
  product exists (UX-DR25); type tones follow DESIGN.md (`adjustment` and `sale` neutral, `restock`/`return` commit
  green) and the delta is printed with its sign so direction is never colour-only; a null reason renders "No reason
  recorded" (`EXPERIENCE.md` Flow 3 ships exactly that row).
- Verified: `cd server && npx tsc --noEmit` exit 0 and `cd client && npm run build` (tsc -b + vite) clean at 1915
  modules. Live: two throwaway in-process cycles against the dev database, 28 + 14 = 42 assertions, all passing, both
  scripts deleted afterwards with no residue (movement count back to baseline, temp product and temp cashier
  removed). Every row of the I/O matrix is covered: restock, adjustment down, to zero (and a zero-quantity product
  restocking again), blank reason, reducing restock, no change, unknown product, delete-with-history, cashier 403 on
  both endpoints, bad filters, Inventory edit, and Inventory edit with no change. A literal `%` in the search term
  was also checked to confirm the LIKE escaping.
- Review: this story's route is `dispatch`, whose three layers (Blind Hunter, Edge Case Hunter, Verification Gap)
  all require context-free subagents, and this session has no subagent capability — so all three are parked as
  filled prompts under `review-prompt-2-5-*.md`, anchored to the frozen `review-context-2-5.diff`. Their findings
  are not yet triaged, so this spec stays `in-review` and a later `bmad-build` run resumes at the review step.

## Spec Change Log

## Review Triage Log

- No findings yet: the three dispatch review layers could not run in this session (no subagent capability) and are
  parked as prompts for separate context-free sessions. Frozen diff for all three: `review-context-2-5.diff`.

## Verification

**Commands:**
- `cd server && npx tsc --noEmit` — expected: exit 0, no output.
- `cd client && npm run build` — expected: tsc + vite succeed with no new warnings.
- **Live cycle** — `server/.env` carries `DATABASE_URL` and `JWT_SECRET`, so start the API on a spare port and kill it after: log in as the seeded admin; assert `GET /api/stock/movements` returns `[]`; a restock of a temp product lands as a positive `restock` row carrying the caller's email; the list narrows by `product_id`, by `type`, and by `search`; a blank reason, a reducing restock, and a no-change quantity each return 400 and write nothing; an unknown product returns 404; `?product_id=abc` returns 400; a tokenless request returns 401; a `PUT /products/:id` quantity change leaves exactly one `adjustment` row with the right delta; deleting the temp product leaves the movements table exactly as it started.

**Manual checks:**
- Stock Movements at 375px wide: the table scrolls horizontally without dropping a column and the product identifier stays in the first column (UX-DR21).
- The movement modal closes on Escape and returns focus to "Record movement" (UX-DR18).