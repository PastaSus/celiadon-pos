---
title: 'Story 5.4: Keep the cart alive across filtering and drawer toggles'
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

**Problem:** Mid-sale catalog filtering and cart-drawer open/close cycles must never lose the customer's items, quantities, or totals — only a completed sale or explicit removal may empty the cart.

**Approach:** Prove by exhaustive audit that no filter, drawer, or render path writes cart state: the only `setCart` writers are add, quantity update, explicit remove, and post-success clear (FR38). No reload persistence — the story scopes survival to filtering and drawer cycles within the session. Fix any writer found outside those four; otherwise this story ships verification only.

</frozen-after-approval>

## Implementation Notes

- Verification-only story, no code change: exhaustive `setCart` enumeration in `POS.tsx` finds exactly four writers — add (line 69), quantity update (85), explicit remove (102), post-success clear (127). Reproduce with `grep -n "setCart(" client/src/pages/POS.tsx | grep -v setCartOpen` (drawer state excluded). Filter setters, the `visibleProducts` derivation, drawer open/close, and the checkout failure path never write cart state; totals and counts derive from cart every render so they cannot drift. Stale product snapshots after a failed checkout are intentional (cart stays intact for retry; oversell is caught by the atomic sale rollback).
- Verified: server `tsc --noEmit` exit 0; client build clean (no behavior delta to execute beyond the audit).
- Review fixes (blind hunter, 9 findings, 1 deferred): audit now records its reproducible grep; impure cart updaters deferred to deferred-work.

## Review Triage Log

- Audit not reproducible, setCartOpen confounds grep — low, patched: exact excluding command recorded above.
- Drawer buttons are unlisted writers — false: steppers, remove, and CTA route into the same four listed state writers by prop.
- Stepper-to-zero silently empties lines — false: covered under the quantity-update writer; standard pre-existing behavior.
- Stale snapshot validation and prices — false: no catalog refresh path exists mid-sale; refresh coincides with the post-sale clear.
- Full Product objects without reconciliation — false: same unreachable staleness as above.
- Toasts inside updaters are impure — deferred: real pre-existing smell, production-harmless, tracked for later.
- Navigation and reload empty the cart — false: the frozen intent explicitly scopes survival to in-session filtering and drawer cycles.
- No runtime verification step — false: no defect claimed and no runner exists to host one; the recorded grep is the re-checkable artifact.
- Toast-identity comment unverified — false: pre-existing effect-deps note unrelated to cart writers.
