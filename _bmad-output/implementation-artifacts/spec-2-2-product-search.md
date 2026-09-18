---
title: 'Story 2.2: Search products by name on Inventory and POS'
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

**Problem:** No search exists anywhere, so staff scroll the full catalog to find a product — on the register during a sale and in Inventory during stock work.

**Approach:** Add an optional `search` parameter to `GET /products` matching names case-insensitively (escaped `ILIKE`, blank means unfiltered, existing newest-first order preserved), and build a shared controlled `SearchInput` (leading search icon, clear button only when non-empty, Escape clears, 200ms debounced search callback). Inventory searches through the API; the POS grid filters its loaded list client-side so the cart never waits on a request. Both surfaces show a result count while searching and a filter-specific empty state distinct from the no-data state.

</frozen-after-approval>

## Implementation Notes

- API (`server/routes/products.ts` list route): optional `search` param, escaped `ILIKE` (backslash/percent/underscore neutralized), blank or missing means unfiltered, newest-first order preserved.
- `SearchInput` (`client/src/components/` + barrel): controlled value/onChange with a ref-held debounced onSearch (200ms default, no mount fire), leading search icon, clear button only when non-empty, Escape clears, placeholder-doubled aria-label.
- Inventory searches through the API (query preserved across save/delete reloads) with a result count and filter-specific empty message; POS filters its loaded list client-side (cart never waits) with the same count/empty treatment. Debounce identity loop avoided via callback ref.
- Verified: server tsc + client build clean; live API proofs — 'mouse' and 'MOUSE' both return Wireless Mouse, literal '%' matches nothing, blank/missing returns all 5; smoke server killed, port freed.
- Review patches: whitespace queries trim to cleared on both surfaces; Inventory request sequencing guard; category delete warning reads from an unfiltered full-list fetch; result counts announce via aria-live; clear returns focus to the field.

## Review Triage Log

- Whitespace query divergence (patched) — trimmed queries on both surfaces; blank counts as cleared everywhere.
- Category warning undercount (patched) — modal fetches its own unfiltered list for the using-count.
- Stale search race (patched) — monotonic sequence id drops out-of-order responses.
- Count not announced (patched) — aria-live polite on both count lines.
- Empty copy inconsistent (false) — surface-appropriate wording satisfies the AC on both; the grid div renders no visible output.
- Clear focus loss (patched) — focus parked back in the field; Backspace timing is the specified debounce.
- Unbounded ILIKE at scale (false) — single-store catalogs answer in single-digit ms; LIMIT would corrupt counts and an index is premature.
