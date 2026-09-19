---
title: 'Story 2.4: Manage per-product reorder levels with stock badges'
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

**Problem:** `products.reorder_level` already drives every stock judgement — `stockTone()` reads it for the badge, Story 2.3's filter reads it for `?stock=low` — but no screen can set it. `EMPTY_FORM` has no threshold field and the save body omits the key, so every product sits at the schema default of 10, "low stock" means the same thing for every product, and a tuned value would be silently reset to 10 by the next edit (the route is a full-record replace).

**Approach:** Make the threshold a first-class product attribute in the one place products are already edited — the Inventory Add/Edit modal — pre-filled with the product's own value (10 for a new product) and always carried in the save body, plus a "Reorder at" column so an amber badge states what it is low against. The stock cell keeps the bare quantity and gains visually-hidden status text, so tone is never the only signal. `stockStatus()` joins `stockTone()` in `Badge.tsx` as the single out/low/healthy decision, and Story 2.3's inline filter predicate switches to it, so the badge tone, the badge wording, and the low-stock view cannot drift apart.

**Decisions (planning checkpoint, fast path):** editable in the modal, not inline in the table; threshold visible as a column; badge keeps the bare number plus sr-only status text rather than POS wording. Inline/bulk table tuning is recorded in `deferred-work.md`.

**Non-goals:** no schema change, migration, new route, or edit to `server/routes/products.ts` / `shared/types.ts`; no second badge or competing stock indicator; no low-stock count or Dashboard callout (FR27, Epic 4); no stock movement on a threshold change — a threshold is not a quantity change and 2.5 owns movements; no test framework.

</frozen-after-approval>

## Implementation Notes

- Scope landed as planned, three files: `Badge.tsx` (+15), `components/index.ts` (+2), `Inventory.tsx` (+50/-12).
  Server, schema, and `shared/types.ts` untouched — the POST/PUT `reorder_level` write path and validation already
  existed, so no API contract moved.
- `stockStatus(quantity, reorderLevel)` is the new single decision (`out` / `low` / `healthy`); `stockTone()` now
  delegates to it, so the tone and the wording are one rule. Story 2.3's inline filter predicate was replaced with
  the same helper to stop the column and the filter drifting apart. Semantics preserved exactly: `in-stock` is
  `status !== 'out'` (low stock is its subset), `low` is `quantity > 0 && <= reorder_level`, `out` is `<= 0`.
- Form: `EMPTY_FORM.reorder_level = '10'`, `openEditModal` seeds the product's own value, `handleSubmit` always sends
  `parseInt(formData.reorder_level, 10)`. That third point is a real bug fix, not cosmetics — the PUT is a
  full-record replace, so before this change every product edit reset a tuned threshold to the server default of 10.
- Input is `type="number" min="0" step="1" required`, so a negative, blank, or fractional value is blocked natively;
  the server's `reorder_level must be an integer >= 0` remains the backstop and surfaces in the toast.
- Stock cell keeps the bare quantity and adds `sr-only` status text, so colour is not the only signal. The new
  "Reorder at" column is a plain `tabular-nums` value, not a badge — no competing stock indicator (UX-DR14).
- Verified: `cd server && npx tsc --noEmit` clean; `cd client && npm run build` (tsc -b + vite) clean, 1914 modules.
- Review: the oneshot Blind Hunter layer could not run here (no subagent capability). Prompt parked at
  `review-prompt-2-4-blind-hunter.md`, anchored to the frozen `review-context-2-4.diff` so it will not go stale.

## Review Triage Log

- Blind Hunter layer not yet run (process note) — parked as a filled prompt for a context-free session; findings are
  not yet triaged. Frozen diff: `review-context-2-4.diff`.
