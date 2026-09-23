---
title: 'Story 1.5: Hold the accessibility floor on every shipped surface'
type: 'feature'
created: '2026-09-18'
status: 'done'
route: 'dispatch'
baseline_commit: '6693b65914dea31c22132af26e921abf52a878f2'
review_loop_iteration: 0
context:
  - _bmad-output/planning-artifacts/ux-designs/ux-celiadon-pos-2026-09-17/DESIGN.md
  - _bmad-output/planning-artifacts/ux-designs/ux-celiadon-pos-2026-09-17/EXPERIENCE.md
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** The migrated surfaces look unified but the accessibility floor does not hold: the Modal ignores Escape and traps nothing, POS tiles are mouse-only divs, form labels lack programmatic links, toasts carry no register-chime treatment, and two slate-on-panel pairings sit just under the 4.5:1 contrast floor.

**Approach:** Add the missing behaviors without changing visual design or data flow — a shared EmptyState component, Modal Escape/trap/focus-return, keyboard-operable POS tiles, linked labels with required markers, the success-only navy toast chime (error stays danger, info stays ink), slate-600 ink for text on panel blocks, focus-visible rings (brand on light, accent on navy), and tabular numerals on displayed money. Contrast audit evidence lives in Design Notes. White-on-brand (3.39:1) is a documented palette exception, not a fix target.

## Boundaries & Constraints

## Boundaries & Constraints

**Always:** No visual redesign — tokens, layout, and copy stay as shipped. Every behavior added here follows EXPERIENCE.md exactly (Escape closes top overlay only, one overlay level, toasts announce via role=status). No new runtime dependency.

**Never:** No data-flow, route, or API changes. No dark mode. No chart, filter, or responsive work (later epics). No global `* { outline: none }` or any focus-ring removal.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Tile keyboard commit | Enter or Space on a focused product tile | Product added to cart, same as click | Out-of-stock tile is a disabled button, not focusable |
| Escape hierarchy | Escape with Modal open | Top overlay closes, focus returns to opener | Closed cart/drawer state never clears the cart |
| Modal tab trap | Tab past last focusable element in Modal | Focus wraps to first element inside Modal | N/A |
| Failed toast | Any failed mutation | Error toast announces via role=status, prior data stays | N/A |

</frozen-after-approval>

## Code Map

- `client/src/components/EmptyState.tsx` — NEW: centered one-sentence state with optional action slot; replaces the POS grid inline empty paragraph.
- `client/src/components/Modal.tsx` — ADD: Escape-to-close, Tab trap while open, focus return to opener. Props unchanged.
- `client/src/components/Table.tsx` — FIX: head text slate-500 to slate-600 (4.46:1 fails on panel); ADD: `scope="col"` on headers, optional `label` prop driving a `role="region"` wrapper in dense mode.
- `client/src/components/Button.tsx` — ADD: `focus-visible` brand ring on the shared base so every Button inherits it.
- `client/src/components/Toast.tsx` — RESTYLE per decided TOAST_TREATMENT; keep role=status and 4s dismiss.
- `client/src/components/index.ts` — EXPORT EmptyState.
- `client/src/pages/POS.tsx` — CONVERT tiles div-to-button (identical styling plus text-left, ring-brand), SWAP empty paragraph for EmptyState.
- `client/src/pages/Transactions.tsx` — FIX: detail labels to slate-600 on panel blocks; PASS label="Items" to the dense table.
- `client/src/pages/Inventory.tsx` — FIX: htmlFor/id label links on the three modal inputs; ADD red-asterisk required markers.
- `client/src/pages/Login.tsx` — ADD red-asterisk required markers (labels already linked; reference implementation).
- `client/src/pages/Dashboard.tsx` — ADD tabular-nums to stat values.
- `client/src/App.tsx` — ADD focus-visible accent rings on navy (nav links, sign-out, denied link gets ring-brand on light).

## Tasks & Acceptance

**Execution:**
- [x] `client/src/components/EmptyState.tsx` + `index.ts` -- new component (message, optional action) -- replaces ad-hoc empty states per UX-DR13
- [x] `client/src/components/Modal.tsx` -- Escape close, focus trap, focus return -- dialog behavior per UX-DR18
- [x] `client/src/components/Table.tsx` -- panel-contrast fix, header scope, dense region label -- contrast floor + AT context
- [x] `client/src/components/Button.tsx` -- shared focus-visible brand ring -- every Button keyboard-visible
- [x] `client/src/components/Toast.tsx` -- decided chime treatment, keep announce/dismiss -- UX-DR20
- [x] `client/src/pages/POS.tsx` -- keyboard tiles, EmptyState swap -- tiles operable, empty unified
- [x] `client/src/pages/Transactions.tsx` + `Inventory.tsx` + `Login.tsx` -- label links, asterisks, panel contrast -- UX-DR17 + floor
- [x] `client/src/pages/Dashboard.tsx` + `client/src/App.tsx` -- tabular numerals, navy focus rings -- UX-DR27 + UX-DR16

**Acceptance Criteria:**
- Given any shipped surface, when it loads with no data or a local failure, then a scoped spinner or EmptyState/table message shows — never a blank region — and toasts carry the server's message with prior data intact
- Given keyboard-only use, when tabbing through nav, tiles, steppers, payment-adjacent controls, filters, and dialogs, then every control is reachable with a visible ring and operable via Enter/Space, and Escape closes only the top overlay
- Given the contrast audit, when body text renders on canvas or panel blocks, then every pairing meets 4.5:1 (slate-600 on panel replaces slate-500; white-on-brand recorded per the BRAND_CONTRAST decision)
- Given `cd server` with `npx tsc --noEmit` and `cd client` with `npm run build`, then both succeed with no new warnings

## Implementation Notes

Implemented via dispatch subagent against this spec; frozen block untouched. Full diff since baseline read and verified task-by-task: EmptyState + barrel export, Modal Escape/trap/focus-return with dialog semantics, Table slate-600/scope/dense-region, Button shared focus-visible ring, success-only navy toast chime, POS button-tiles + EmptyState swap, label links + asterisks, Dashboard tabular numerals, App navy focus rings. Extras accepted: tabular-nums on POS tile prices (Intent mandates tabular money) and slate-600 on the Table empty message (same panel-contrast family).
Verified: `npx tsc --noEmit` (server) and `npm run build` (client) re-run independently, both clean; slate-600 on panel re-measured at 7.11:1.
Matrix audit caveat: no test framework exists in this phase by NFR13, so the four I/O rows were verified by diff inspection (native button commit, capture-phase Escape, trap wrap logic, unchanged role=status) plus build — not by executed tests. Manual keyboard-only and screen-reader passes remain for a human with a browser; recorded as the outstanding verification.

## Spec Change Log

## Review Triage Log

Blind-hunter rows:
- Modal aria-label vs labelledby (false) — title is typed string so non-string titles are impossible; aria-label names the dialog correctly.
- No backdrop-click/scroll-lock/inert (false) — none contracted; Escape + trap + aria-modal cover the mandated dialog behavior.
- offsetParent filter brittle (false) — no shipped modal child is fixed/transformed/hidden; the unreachable state cannot occur.
- Non-dense tables unnamed (false) — region naming is dense-only by design; full-page tables need no region name.
- Scroll regions not keyboard-scrollable (deferred D1) — pre-existing overflow pattern; keyboard scrolling belongs to the responsive epic.
- No scope=row path (false) — no row-header cells exist in any table.
- Empty div not live-announced (false) — static content found by browsing; live announcement not contracted.
- Inputs lack required/autocomplete (false) — required present on all five inputs and Login carries username/current-password autocomplete; aria-hidden asterisk plus required attr announces correctly.
- Missing input hints/error wiring (false) — no inline errors exist to wire; no applicable autocomplete values for product fields.
- Block content inside button tile (low, rejected) — renders and operates correctly everywhere; restructuring exceeds a simple correction for validator-only harm.
- Disabled tile unexplained (false) — implements the approved matrix row; the badge names the state visibly.
- Tile lacks action verb (patch P1) — tile buttons announce content with no add action; needs a product-named aria-label.
- Toast announce wiring missing (false) — role=status present on every toast; tones follow the approved success-only decision.
- No skip link (low, rejected out of scope) — absent from the contracted floor list; nav overhaul is Epic 5.
- Nav links under 44px (false) — locked spec decision scopes 44px to icon-only controls and POS surfaces.
- Stat labels/dots contrast (false) — labels pass on white and dots are non-text indicators with adjacent text.
- slate-600 on panel unverified (false) — re-measured at 7.11:1.
- EmptyState absent from diff (false) — present in the regenerated diff file; reviewer read a stale copy.
- Transactions empty plain div (false) — rendered through Table, which carries the slate-600 fix.
Edge-case rows:
- Focus on panel/outside escapes trap (false) — scrim blocks pointer focus outside; trap wraps every Tab path from inside; focus initializes inside.
- Fixed/hidden children skipped (false) — same evidence as the offsetParent row; no such children shipped.
- Nested modals double-close on Escape (false) — single-level stacking is the enforced contract; nesting unreachable.
- Unmounted opener loses focus (false) — every flow closes before list reloads; opener mounted at close in all callers.
- Label ignored when not dense (false) — documented dense-only semantics; sole caller complies.
- Dense overflow without label unnamed (false) — no region renders without a label, so nothing is unnamed.
- Row-header scope path (false) — same evidence as the scope=row row; no row headers exist.
- Tile needs Add-verb label (patch P1) — same defect as the action-verb row; one fix covers both.
Verification-gap rows (pre-verified, all medium — real regression risk, manual pass interim):
- Modal behavior untested (medium, deferred D2) — no runner exists; NFR13 defers testing.
- Tile keyboard/disabled untested (medium, deferred D2) — same evidence.
- Table region/scope untested (medium, deferred D2) — same evidence.
- Label association untested (medium, deferred D2) — same evidence.
- EmptyState rendering untested (medium, deferred D2) — same evidence.

## Design Notes

Contrast evidence (WCAG relative-luminance, measured 2026-09-18 — PASS is >= 4.5:1): slate-500 on white 4.76 PASS, on canvas 4.04 FAIL, on panel 4.46 FAIL; slate-800 on white/canvas PASS; slate-300 on ink 11.95 PASS; accent on ink 12.57 PASS; white on commit 4.96 PASS; white on danger 4.83 PASS; ink on brand-subtle 14.84 PASS; all badge fills 6.3+ PASS; brand-strong on white 6.63 PASS; slate-600/700 on white PASS. Failures drive the fixes: slate-500 becomes slate-600 on panel backgrounds (Table head, transaction detail labels); white on brand azure is 3.39:1 and goes to the BRAND_CONTRAST decision.

Decided-then-locked details: 44px touch targets apply to icon-only controls and POS surfaces only (steppers and Modal close already comply; table text buttons and nav links stay natural size). Toast treatment and brand contrast resolve via Open Questions, then lock into the frozen block.

## Verification

**Commands:**
- `cd server && npx tsc --noEmit` -- expected: clean
- `cd client && npm run build` -- expected: clean, no new warnings

**Manual checks (if no CLI):**
- Keyboard-only pass: nav, tiles (Enter adds to cart), steppers, modal open/Escape/focus-return, sign out, print path reachable
- Screen-reader spot check: icon-only buttons named, error toast announced, dense items table has region context
