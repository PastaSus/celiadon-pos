---
title: 'Story 2.3: Filter by category and stock status'
type: 'feature'
created: '2026-09-19'
status: 'done'
route: 'oneshot'
review_loop_iteration: 0
context:
  - _bmad-output/implementation-artifacts/epic-2-context.md
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** After Story 2.2 the product list is searchable but cannot be narrowed by category or by stock state, and although categories can be created and renamed, no product can be assigned one — so `category_id` is always null, nothing is filterable, and the low-stock view the Dashboard callout (FR27) has to link to does not exist.

**Approach:** Two new shared components — `FilterSelect` (native select wearing the input tokens, first option always "All categories") and `CategoryChips` (POS-only, exactly one active pill) — plus one Inventory filter row that narrows the already-searched rows by category and by stock status (all / in-stock / low-stock / out-of-stock) client-side, combining with search as AND, showing a Clear action whenever any filter is non-default, and reading `?category=<id>` and `?stock=low` on mount so the low-stock view is deep-linkable for Epic 4. Products finally get their deferred category assignment: a category select in the add/edit form and a category badge column in the table (FR8). POS reuses its existing in-memory filter pattern to narrow by category chip without issuing a request. No server changes — `/categories` and the `products.category_id` write path already exist. Low stock means quantity above zero at or below that product's `reorder_level`, never a hardcoded 10.

</frozen-after-approval>

## Implementation Notes

- Components (`client/src/components/` + barrel `index.ts`): `FilterSelect` — native select, `appearance-none` with a decorative `ChevronDown`, sr-only `htmlFor`-linked label derived from the `label` prop so two selects on one surface never share an id, first option is the default and carries the meaning (UX-DR5). `CategoryChips` — POS-only `role="group"` of `aria-pressed` pills on a `brand-subtle` wash, exactly one active, 44px `min-h` for the POS touch floor (NFR11).
- Inventory: one filter row (search, category, stock status, Clear) where category and stock narrow the already-searched rows in memory, so the 2.2 API search contract is untouched. `?category=<id>` and `?stock=all|in-stock|low|out-of-stock` are read once on mount and written back with `replace`, which makes the low-stock view deep-linkable for FR27's Dashboard callout — that vocabulary is the contract Epic 4 must use. Clear restores the unfiltered list and the search term in one click (UX-DR26). The count line and the `No products match this filter` message appear only while something is non-default, so the no-data state keeps its create affordance and the filtered-empty state never offers one (UX-DR22).
- The category assignment deferred by Story 2.1 landed here: a category select in the add/edit form (`Uncategorized` = `null`) and a Category column using the neutral badge tone — azure stays reserved for interactive elements, so a category is never azure.
- POS: categories load once on mount; `CategoryChips` narrows the already-loaded grid alongside the name search and issues no request (FR12, UX-DR6), leaving the cart untouched (FR38). A failed categories fetch hides the chip row and toasts the cause rather than blocking the register.
- No server change: `/categories` reads and the `products.category_id` write path already existed, so every existing API contract is untouched (NFR6).
- Verified: `cd server && npx tsc --noEmit` and `cd client && npm run build` clean; an 18-assertion live cycle against the dev database passed (health, login, every product row carries `stock_quantity`/`reorder_level`/`category_id`, temp category + product create, assignment persists, `reorder_level` defaults to 10, category cleared to null, re-assignment with a low quantity, delete-in-use refused with 409, product and category delete, zero residue with the product count restored and no server errors); smoke server killed, port 5055 freed, temp script removed.
- Review patches: the URL-sync effect compares the serialized query before navigating (a same-value navigation would otherwise re-enter it on every render); `?category=` must be numeric or it resets to all, so the select and the list can never disagree; "In stock" means quantity above zero with low stock as its subset, so asking for what is available never hides a sellable low-stock item.

## Review Triage Log

- URL-sync re-navigation loop (patched) — serialized-query comparison before `setSearchParams`; without it a same-value navigation re-enters the effect on every render.
- Unvalidated `?category=` deep link (patched) — a non-numeric value now resets to all; the native select has no matching option, so state and UI could disagree about what is filtered.
- `in-stock` excluded low stock (patched) — "In stock" is quantity above zero and low stock is its subset; three disjoint states would hide sellable items from a cashier asking what is available. One predicate line to reverse if the tighter reading is wanted.
- Active chip contrast 3.39:1 (deferred) — white on azure `#1690E8` at caption scale is below AA, but DESIGN.md mandates the azure chip fill and `Button` primary plus active nav already ship the same pairing; recorded in `deferred-work.md` as a palette-wide pass rather than patching one chip in isolation.
- POS chips can go stale when a category is deleted in another tab (low, rejected) — requires a second signed-in session, a deleted category's products are nulled by the FK, and picking All recovers the row, so a refetch listener costs more than the failure.
- Oneshot Blind Hunter layer not run (process note) — it must run context-free and this session had no subagent capability; the filled prompt is parked at `review-prompt-2-3-blind-hunter.md` for a fresh session, so its findings are not yet triaged.