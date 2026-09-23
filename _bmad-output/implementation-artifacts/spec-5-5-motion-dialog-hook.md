---
title: 'Story 5.5: Motion system and shared dialog hook'
type: 'feature'
created: '2026-09-23'
status: 'done'
route: 'dispatch'
baseline_commit: '8c98d3fd7dc46db038e1ddaa03193a5359cccffa'
review_loop_iteration: 0
context: []
story_key: '5-5-motion'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Overlays appear and vanish instantly with no spatial feedback, presses give no acknowledgement, and the identical focus-trap effect is copied in Modal, NavDrawer, and CartDrawer — so the next dialog fix must land in three places.

**Approach:** Add one shared dialog hook owning enter/exit animation plus the existing trap/Escape/focus-return behavior, rewire all three dialogs onto it, and apply the functional-only motion vocabulary (durations, press scale, loading pulse, reduced-motion kill) with no animation library.

## Boundaries & Constraints

**Always:** CSS/Tailwind transitions and keyframes in `index.css` only — no animation library (dependency decision is final). Every dialog keeps its exact current behavior (scrim, Escape, trap, focus return, one-level stacking) while gaining enter/exit motion. Panels accept input on the first frame.

**Never:** No springs, overshoot, or bounce. No animating layout properties, box-shadow, or filter. No route transitions, list/table row animation, celebrations, parallax, scroll-jacking, shimmer, or decorative motion. No per-component reduced-motion opt-outs. No behavior, prop, visual, or copy changes beyond motion.

</frozen-after-approval>

## Code Map

- `client/src/components/Modal.tsx:14-69` — first focus-trap copy (FOCUSABLE const + effect); panel fades only, no slide.
- `client/src/components/NavDrawer.tsx:12-71` — second copy, line-identical logic; panel slides from the left edge.
- `client/src/components/CartDrawer.tsx:23-93` — third copy, line-identical logic; panel rises from the bottom edge.
- `client/src/index.css` — Tailwind directives + print block only; home for duration/easing utilities and the global reduced-motion kill rule.
- Press targets: `client/src/components/Button.tsx` (all variants), POS product tiles (`client/src/pages/POS.tsx:182` — also carries a banned `transition-all` on a shadow hover, fix by dropping it to an instant shadow), `client/src/components/CategoryChips.tsx`, `client/src/components/PaymentMethodControl.tsx`, nav pills in `client/src/App.tsx` + drawer links.
- Loading: `client/src/components/ChartPanel.tsx:31` already pulses; `StatCard` renders only with data (page-level spinner owns loading) — no new skeleton there.
- Existing `transition-colors` usages stay — color-only transitions are the sanctioned state-change pattern.

## Tasks & Acceptance

**Execution:**
- [x] `client/src/hooks/useDialog.ts` (new, barrel-exported if the components barrel covers hooks, else direct import) -- single hook owning open-state enter/exit phasing plus trap/Escape/focus-return, replacing all three copied effects -- one fix lands once.
- [x] `client/src/components/Modal.tsx` -- rewire onto the hook; scrim + panel fade at base duration, ease-out in, faster ease-in out -- behavior identical, motion added.
- [x] `client/src/components/NavDrawer.tsx` -- rewire onto the hook; scrim fades, panel translates from the left edge -- behavior identical, motion added.
- [x] `client/src/components/CartDrawer.tsx` -- rewire onto the hook; scrim fades, panel translates from the bottom edge -- behavior identical, motion added.
- [x] `client/src/index.css` -- duration/easing utilities (fast 120ms, base 200ms, max 250ms cap) + one global `prefers-reduced-motion: reduce` rule zeroing all animation/transition duration -- single kill switch.
- [x] Press +svc: `active:scale-[0.98]` over fast on Button variants, POS tiles, category chips, payment segments, nav pills -- transform-only acknowledgement.
- [x] `client/src/pages/POS.tsx:182` -- drop banned `transition-all` (animates box-shadow) so the tile hover shadow applies instantly.

**Acceptance Criteria:**
- Given each dialog closed, when opened, then the scrim fades at base and the panel enters from its edge (drawers) or fades (Modal) with ease-out, and the reverse runs faster with ease-in on close.
- Given `prefers-reduced-motion: reduce`, when any overlay opens, presses, or loads, then everything appears instantly with zero transition while Escape, trap, and focus return work unchanged.
- Given the three dialog files, when searched for the trap effect, then exactly one implementation exists (the hook) with no copied fallback.
- Given a slow device, when a panel opens, then its controls respond on the first frame with nothing queued behind a transition.

## Implementation Notes

Direct import for `useDialog` (no barrel entry): the components barrel covers components only, and the spec's conditional explicitly permits direct import in that case.

## Review Triage Log

- [barrel | false] Spec conditionally permits direct import when the barrel covers components only — that condition holds; decision recorded above.
- [pulse no-diff | false] ChartPanel pulse pre-existed and still ships; StatCard has no loading state by design (page spinner owns loading), recorded in the spec Code Map — no missing code.
- [kill-switch gaps | false] Grep confirms no `transition-delay`, `animation-delay`, custom iteration counts, or smooth scrolling exist in `client/src` — zeroing durations covers everything present.
- [bare rAF/double-frame | false] No SSR or test runner exists in this phase (NFR13), so bare rAF cannot break; `shown` gates only paint, while mount + focus (hence input) happen on the state-change commit.
- [scroll-lock | false] Pre-existing: original dialogs never locked scroll, and spec-5-1 already rejected diverging here; unchanged by this story.
- [stacking | false] One-level-deep stacking is an app invariant (EXPERIENCE.md) — two live dialogs cannot occur.
- [tile color snap | false] Tiles carry no color transitions to preserve, and focus indication appearing instantly is correct a11y behavior.
- [border-color allowlist | false] `border-color` is a color property — inside the allowed set, not outside it.
- [disabled scale | false] Disabled controls cannot take user activation, so `:active` never matches them — no observable feedback occurs.
- [modal scrim | false] Modal never had scrim-click close; spec requires exact scrim behavior preserved, which is what shipped.
- [bookkeeping | false] Statuses resolve at present/commit by workflow mechanics; no loopback occurred, so iteration 0 is correct.
- [cap unenforced | false] Grep confirms no `duration-*` utilities beyond the new fast/base exist; the only continuous motion is the pre-existing spinner, outside this story's transition vocabulary.
- [E1 rAF suppressed | false] Reachable only with debugger-paused JS — not a normal-use state.
- [E2 jank exit | low, rejected] Mid-transition unmount under extreme jank is a cosmetic transient; the transitionend+fallback fix exceeds a direct correction for a rarely-met defect.
- [E3 reopen-during-exit | false] `mounted` stays true and `openerRef` still names the true opener, so focus never leaves and return stays correct.
- [E4 exit-window clicks | false] Close handlers are idempotent, and completing a sale clears the cart (removing the commit control) before the exit window matters.
- [E5 shared Escape | false] Cannot occur under the one-level-deep invariant.
- [E6/E10 reduced-motion frames | false] A ~2-frame transient with the trap intact throughout — imperceptible, no information or control lost.
- [E7 node replaced | false] React never swaps the panel node without remounting, which re-runs the effect and rebinds the trap.
- [E8 opener unmounted | false] Identical behavior in the pre-change code — pre-existing, not caused here.
- [E9 first-frame | false] Mechanism misdescribed: `useState(open)` mounts the panel on the state-change commit and focus moves immediately; no transition gates input.
- [VG hook lifecycle | defer] Real gap, filed as defer by the layer: no runner exists this phase (NFR13) and dialog tests already wait on the test-framework story — recorded in deferred-work.md.

Nothing else deferred; no loopback (review_loop_iteration stays 0).

## Spec Change Log

## Review Triage Log

## Design Notes

Exit choreography needs a leaving phase: keep the panel mounted while the exit transition runs (e.g. an internal `leaving` state driven by the hook), then unmount. Unmount-then-animate is impossible — `if (!open) return null` must become `if (!open && !leaving) return null` or equivalent. Keep the phasing inside the hook so callers still pass plain `open`/`onClose`.

## Verification

**Commands:**
- `cd server && npx tsc --noEmit` -- expected: clean.
- `cd client && npm run build` -- expected: success, no new warnings.

**Manual checks (if no CLI):**
- Open/close each dialog with and without reduced-motion emulation; rapid click-through never queues; keyboard trap/Escape/focus-return unchanged.
