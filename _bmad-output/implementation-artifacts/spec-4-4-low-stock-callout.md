---
title: 'Story 4.4: Call out low stock on the dashboard'
type: 'feature'
created: '2026-09-19'
status: 'done'
route: 'oneshot'
review_loop_iteration: 0
context:
  - _bmad-output/implementation-artifacts/epic-4-context.md
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Low and out-of-stock products are only visible inside Inventory, so a glance at the Dashboard never tells an owner what to reorder today.

**Approach:** Add a low-stock callout to the Dashboard fed client-side by the existing `GET /products` list (no server change): rows for every product at or below its `reorder_level` using the Epic 2 `stockStatus`/`stockTone` rule, out-of-stock first, each showing product, current quantity, and threshold with the established red/yellow tones. The callout hides entirely when nothing is low and links to `/inventory?stock=low` (the deep-link the low-stock filter already honors). Stock is point-in-time and ignores the selected range.

</frozen-after-approval>

## Implementation Notes

- Client only, no server change: Dashboard fetches `GET /products` once on mount and derives the callout with the Epic 2 `stockStatus`/`stockTone` rule (out first, then lowest quantity); each row shows product, quantity, threshold, and a tone badge; the section hides when empty and links to `/inventory?stock=low`. Stock is point-in-time and ignores the range control.
- Verified: server `tsc --noEmit` exit 0; client build clean. Live probe: 5-product dev DB shows no callout (correct hide); with rows temporarily set to out (0/10) and low (3/5) the order is out-then-low with right statuses, then restored to 50/30. Probe server stopped afterwards.
- Review fixes (blind hunter, 12 findings, no loopback): 4-space effect indentation; fetch error now shows an inline failure message instead of hiding; status/tone derive once per product with a name tiebreak; rows wrap and truncate long names. No defers.

## Review Triage Log

- ?stock=low link hides out-of-stock rows — false: the low-stock-filter link is the specified behavior and the callout itself shows both statuses.
- No loading flag causes a pop-in shift — rejected low: any placeholder would shift the same way and an always-reserved box would violate hide-when-empty.
- Failed fetch hides as if healthy — low, patched: failures with no data show "Failed to load low stock."
- List never refreshes — false: route remounts refetch on every visit, consistent with all dashboard sections.
- Full-catalog in-memory filter — rejected low: no low-only endpoint exists and store-scale volumes match the POS/Inventory pattern.
- Unbounded list dominates the page — rejected low: capping would hide rows the story requires listed.
- Double stockStatus per comparison, no tiebreak — low, patched: status and tone derive once with a name tiebreak.
- Heading counts out items against filter vocabulary — false: the count matches the listed rows under the epic's own section name.
- No per-row action affordance — rejected low: View in Inventory is the specified action path.
- Row overflow on narrow screens — low, patched: rows wrap with truncating names.
- 4-space effect indentation — low, patched: reindented to 2 spaces.
- Recomputed status per row and color-only status — split: recompute fixed by derive-once (low); screen-reader claim false since badges carry text labels.
