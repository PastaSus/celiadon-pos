# Epic 2 Context: Organize the catalog, find anything, and know what is running low

<!-- Compiled from planning artifacts. Edit freely. Regenerate with compile-epic-context if planning docs change. -->

## Goal

A manager can group products into categories, anyone can find a product by typing part of its name in well under a second, filter down to what is low, and see the full history of why any quantity changed — turning the catalog from an unscannable list into an organized, searchable, explainable inventory.

## Stories

- Story 2.1: Build the category CRUD API and UI
- Story 2.2: Search products by name on Inventory and POS
- Story 2.3: Filter by category and stock status
- Story 2.4: Manage per-product reorder levels with stock badges
- Story 2.5: Record and list stock movements

## Requirements & Constraints

- A product belongs to at most one category and shows it as a badge in Inventory.
- Category create/rename/delete is restricted to admin and manager; deleting a category that still has products is refused with a specific error rather than orphaning products. Listing is alphabetical; blank or duplicate names are rejected with a clear error.
- Inventory search matches product names case-insensitively and returns in under 200ms. POS grid also supports name search.
- Search and category filter combine as AND (never OR); a clear-filters action appears whenever either is non-default and restores the unfiltered list in one click. A query with no matches shows the filtered-empty state, never a blank list.
- Stock status has three states driven by a single rule: out of stock at quantity at or below zero, low stock when quantity is above zero but at or below the product's reorder level, healthy above. Threshold is per product with default 10; the numeric quantity is always visible alongside the badge.
- Every quantity change writes a movement row recording product, type (sale / restock / adjustment / return), quantity delta, reason, responsible user, and timestamp. Restock and manual adjust require a reason and are attributed to the signed-in user; restock/adjust is admin/manager only.
- The movements surface lists newest first showing product, delta, type, who, when, and note, and filters by product and by movement type.
- Every endpoint stays behind auth; product and category writes require admin or manager role. Existing API contracts must not break. Verification is typecheck plus client build; no test framework is added.

## Technical Decisions

- Consume existing schema, do not invent tables: categories, stock_movements, products.category_id, and products.reorder_level (default 10) already exist with no routes or UI.
- File set for this epic is Inventory.tsx plus products.ts, the new categories.ts route, and the new stock.ts route. Consolidating categories and stock here avoids rewriting Inventory.tsx twice.
- All DB access is raw SQL through pool.query() with $1, $2 placeholders — no ORM, never interpolate values into SQL strings.
- Types come from shared/types.ts (single source); money renders only through formatCurrency(); prices store as decimal(10,2) and arrive as JS numbers via the pg numeric parser.
- SearchInput and FilterSelect are created in this epic and reused by the Stock Movements surface; the low-stock filter is one filter state, not a separate page.

## UX & Interaction Patterns

- SearchInput: debounced 200ms, leading Search icon, clear (X) button visible only when non-empty, Escape clears, no submit button, result count updates in place.
- FilterSelect: native select styled like other inputs; first option always "All categories" (or "All types"), selected by default; combines with search as AND.
- CategoryChips (POS only): client-side filter over the already-loaded product list, issues no request; "All" selected by default, exactly one chip active at a time.
- Single stock-status rule: every stock badge renders through stockTone(quantity, reorderLevel) via Badge — red at or below zero, amber at or below reorder level, teal/green above. Never hand-pick a color for a stock value.
- Filtering is live with no Apply button; Clear appears whenever any filter is non-default. The filtered-empty state ("No products match this filter" plus Clear affordance) is visually and textually distinct from the no-data state and never offers a create action.
- Microcopy uses concrete numbers ("3 items at or below reorder level"), sentence case, no exclamation marks or emoji; failure messages name the operation and the server-given cause.

## Cross-Story Dependencies

- Story 2.1 (category data) and 2.2 (search baseline) precede 2.3, which layers category and stock-status filters onto that list.
- Story 2.4's per-product thresholds define what 2.3's low-stock filter matches.
- The stock_movements table surfaced in 2.5 is also written by sale completion in a later epic's atomic transaction — keep the movement shape (product, type, delta, reason, user, timestamp) stable for that writer.
- The Dashboard low-stock callout in a later epic consumes this epic's reorder levels and navigates to Inventory with the low-stock filter pre-applied, so that filter must be deep-linkable.
