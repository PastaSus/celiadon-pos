---
title: 'Story 2.1: Build the category CRUD API and UI'
type: 'feature'
created: '2026-09-18'
status: 'done'
route: 'oneshot'
review_loop_iteration: 0
context:
  - _bmad-output/implementation-artifacts/epic-2-context.md
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** The `categories` table exists with no API and no UI, so products cannot be organized and the catalog has no grouping to filter by.

**Approach:** Add a `categories` route module following the products/auth file patterns (auth guard on reads, admin/manager role guard on writes, parameterized queries, `{ error }` failures): list alphabetically, create/rename with blank and duplicate rejection, and refuse deletion of a category that still has products with a specific conflict error instead of relying on the FK null-out. Mount it at `/api/categories`. On the client, add a category manager modal on Inventory (list, inline add, inline rename, inline delete-confirm) reusing Modal, Button, input, and toast patterns. Product-to-category assignment UI stays out — it ships with the filter/badge story.

</frozen-after-approval>

## Implementation Notes

- API (`server/routes/categories.ts`, mounted at `/api/categories` in `server/index.ts`; Vercel wrapper imports the app so no change needed there): list alphabetical, shared blank/duplicate validator, 409 on duplicate name via 23505 mapping, explicit pre-delete product-reference check refusing with 409 instead of the FK null-out, 404s on missing rows. Guards mirror products.ts (reads all roles, writes admin/manager).
- Client (`client/src/pages/Inventory.tsx`): Manage categories secondary button beside Add Product; one manager Modal (add form, inline rename, inline delete-confirm — single overlay level preserved); linked sr-only labels, token input styling, EmptyState for the empty list, server-message toasts, list refresh after every mutation.
- Verified: `npx tsc --noEmit` and `npm run build` clean; 17-assertion live smoke cycle against the dev database passed (list/create/blank-400/duplicate-409/rename/rename-blank-400/alpha-order/product-link/delete-409-refusal/delete-product/delete-category/delete-404) with zero residue (categories empty, 5 seed products intact); smoke server killed, port freed, temp script removed.
- Review patches: case-insensitive ordering plus case-insensitive duplicate guard; null-body and 255-char validation; numeric :id guard on PUT/DELETE; atomic guarded DELETE replacing the check-then-delete race; modal loading spinner; required/maxLength on add input; rename rows in submit forms with per-row aria-labels; delete-confirm names the using products from loaded data. Re-proved live: case-order, case-dup 409, bad-id 400s, atomic 409-refusal cycle — all passing, zero residue.

## Review Triage Log

- Case-sensitive ordering and duplicates (patched) — ORDER BY LOWER plus explicit LOWER duplicate check; live-proved with mixed-case categories.
- Null body and over-length names (patched) — null-safe destructure plus 255-char limit matching the column.
- Non-numeric :id (patched here; deferred for products.ts) — 400 guard on both write routes, live-proved; the identical pre-existing products.ts pattern recorded in deferred-work.md.
- Check-then-delete race (patched) — single-statement guarded DELETE makes the race impossible; refusal cycle re-proved live.
- No GET /:id (false) — no consumer needs single-category fetch; client maps names from the list.
- SELECT * style (false) — matches products.ts house pattern; table shape equals the Category type exactly.
- Modal loading flash (patched) — spinner while fetching; empty state only for genuinely empty.
- Add form lacks guards (patched) — required plus maxLength; server remains the enforcer.
- Single saving flag (low, rejected) — sub-100ms ops; per-row flags add complexity without user-visible gain.
- Rename Enter/labels (patched) — rows wrapped in submit forms with per-row aria-labels; sr-only labels are the correct dense-row pattern.
- Refusal not actionable (patched) — confirm state lists using product count and names from loaded data.
