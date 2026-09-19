---
title: 'Story 5.3: Stack every surface at the tablet and phone breakpoints'
type: 'feature'
created: '2026-09-19'
status: 'done'
route: 'oneshot'
review_loop_iteration: 0
context:
  - _bmad-output/implementation-artifacts/epic-5-context.md
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Several page headers, action rows, and the POS product grid assume desktop widths, so phones get squeezed controls and cramped tiles instead of clean stacking.

**Approach:** Class-only retrofit at the Tailwind breakpoints, no logic changes: Inventory and Stock Movements headers stack title over actions below `sm`; the category-add row wraps; the Receipt action row wraps; the Dashboard low-stock header wraps; the POS product grid starts at one column and steps to two at `sm` (three at `md` as today). Tables already scroll in-container via the shared Table; the primary-action hierarchy is already correct (single primary per surface) and stays untouched.

</frozen-after-approval>

## Implementation Notes

- Class-only retrofit, no logic touched: Inventory/StockMovements headers stack below `sm`, category-add row wraps, Receipt actions wrap, low-stock header wraps, POS tiles go 1-up below `sm`. Tables were already in-container scrollers; primary hierarchy already single-primary everywhere.
- Verified: server `tsc --noEmit` exit 0; client build clean. No live viewport pass available here — classes follow the existing breakpoint vocabulary.
- Review fixes (blind hunter, 9 findings, no loopback): full-width stacked header buttons, input min-w-0, receipt link touch targets, wrapping ChartPanel header and date pair, wrapping low-stock meta group, tile name breaking. No defers.

## Review Triage Log

- Header buttons squeeze on 320px viewports — low, patched: stacked full-width below sm.
- Category input squeezes instead of wrapping — low, patched: min-w-0 lets it shrink and wrap.
- Record-movement button narrow on mobile — low, patched: full-width below sm like its filters.
- Receipt links lack touch targets — low, patched: 44px inline-flex links.
- ChartPanel header can clip pills — low, patched: header wraps.
- Date pair overflows 320px — low, patched: pair wraps.
- Low-stock meta group can overflow — low, patched: inner group wraps.
- Long tile names stretch cards — low, patched: names break words.
- Transactions left out of the pass — false: filters stack, tables scroll in-container, and pagination fits; no concrete defect cited.
