---
title: 'Story 3.2: Complete the sale atomically with refresh'
type: 'feature'
created: '2026-09-19'
status: 'review'
route: 'oneshot'
review_loop_iteration: 0
baseline_commit: '17b1d10fcbd6ec63cd96118ef431fb06c06be637'
context:
  - _bmad-output/implementation-artifacts/epic-3-context.md
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** The sale transaction writes the sale row, its details, and the stock decrement, but records no `sale`-type movement rows — so the movement history Story 2.5 built stays silent about the most common quantity change — and concurrent checkouts can both pass the stock check before either decrements.

**Approach:** Lock the product rows (`FOR UPDATE`) inside the existing `BEGIN`/`COMMIT` transaction, insert one `sale` movement row per line (`reason` = `Sale <receiptNumber>`, negative delta), and keep the POS completion path (clear cart, refresh stock in place, success toast; error toast with the cart intact) working against the tightened writer.

</frozen-after-approval>

## Implementation Notes

- Server only: `SELECT ... FOR UPDATE` locks the sold rows for the transaction so concurrent checkouts serialize on the stock check (FR28/NFR4); one `INSERT INTO stock_movements (type 'sale', negative delta, reason 'Sale <receipt>')` per line joins the sale insert, details insert, and stock decrement in the same `BEGIN`/`COMMIT`. Verified: 11-assertion live cycle against the dev DB (happy path + movement row, oversell 400 with stock and movement count unchanged, two-way race for the last units with exactly one winner and stock 3 → 1), all passing, script deleted with rows cleaned up. `npx tsc --noEmit` exit 0; client build clean (no client change).
- Review: oneshot Blind Hunter layer needs a context-free subagent this session cannot launch, so it is parked as `review-prompt-3-2-blind-hunter.md` anchored to the frozen `review-context-3-2.diff` (2.9 kB, floor 2). Findings not yet triaged; spec moves to `review` pending them, not `done`.

