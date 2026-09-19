---
title: 'Story 5.2: Move the cart into a drawer with an always-visible total'
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

**Problem:** Below 1024px the POS cart sits as a side-by-side panel that crowds out the product grid, and scrolling for it mid-sale costs sales at the counter.

**Approach:** Below the `lg` (1024px) breakpoint the cart leaves the grid for a bottom-rising `CartDrawer` opened from a fixed summary bar that always shows item count and total; at `lg` and up the desktop panel is byte-for-byte unchanged. One shared `CartItems` list (lines, 44px steppers, remove) serves both presentations so there is still exactly one cart — same state, steppers, payment control, and Complete Sale action. The drawer reuses the dialog pattern (trap, Escape, backdrop-tap, focus return) with a pinned navy footer carrying the total in heavier-weight flat accent tabular numerals and Complete Sale beside it. Main content gains bottom padding below `lg` so the bar never covers it.

</frozen-after-approval>

## Implementation Notes

- New `CartItems` (shared line rows/steppers/remove) used by both presentations; new `CartDrawer` bottom sheet (scrim/Escape/trap/focus-return, 85vh scroll body, navy pinned footer with accent total + Complete Sale) fed by the one POS cart state.
- `POS.tsx`: desktop panel gains `hidden lg:block` (identical ≥lg visuals), grid gains `pb-24 lg:pb-0` for the fixed bar, new navy summary bar (`lg:hidden`, count + accent total, opens drawer), drawer auto-closes crossing into `lg` like the nav drawer.
- Verified: server `tsc --noEmit` exit 0; client build clean. No live small-viewport pass available here — drawer behavior mirrors the proven NavDrawer effect.
- Review fixes (blind hunter, 10 findings, 1 deferred): safe-area padding on drawer footer and summary bar; aria-live quantity; singular/plural drawer label; shared empty-cart copy. Shared dialog hook deferred to deferred-work.

## Review Triage Log

- No body scroll lock — false: matches the reused dialog pattern; diverging here alone would split epic behavior.
- No safe-area padding — low, patched: max() safe-area bottom padding on the footer and the bar.
- Drawer left to unmount on checkout — false: success unmounts via receipt navigation while failure correctly keeps it open.
- Bar enabled when empty or processing — false: the empty drawer guides and mid-processing reopen shows truthful state.
- No line totals and no stepper announcements — split: line totals false (desktop parity, out of scope); announcements patched with aria-live (low).
- Silent decrement-to-zero removal — false: standard intentional cart behavior, pre-existing.
- Duplicated focus trap, no shared hook — deferred: third copy confirmed identical; extraction tracked for later.
- No addListener fallback or initial match check — false: modern API coverage and safe default state.
- Label pluralization and landmark gaps — split: "1 items" patched (low); aria-labelledby/inert false per the shared pattern.
- Empty copy hardcoded twice — low, patched: single exported constant used by both.
