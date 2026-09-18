---
title: 'Story 1.3: Migrate the shared components to the palette'
type: 'refactor'
created: '2026-09-18'
status: 'done'
route: 'oneshot'
review_loop_iteration: 0
context:
  - _bmad-output/planning-artifacts/ux-designs/ux-cube-tech-pos-2026-09-17/DESIGN.md
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** The six shared components still render raw indigo/gray/green/red utilities, so buttons, badges, tables, and toasts disagree with each other and with the adopted token system.

**Approach:** First extend `theme.extend.colors` with the exact DESIGN.md status shades the components need (commit surface/text, warning and danger families with a behavior-preserving danger hover equal to red-700), then remap every raw color class in Badge, Button, Table, Toast, LoadingSpinner, and Modal to named tokens — Button primary to brand, success to commit, danger to the danger family, secondary to line with ink text; Badge tones to commit/amber/red/azure-wash/slate fills; Table head to panel with line dividers; Toast to commit/danger/ink; spinner track to line with a brand leading edge. Component props and behavior stay unchanged, and `npm run build` succeeds with no new warnings.

</frozen-after-approval>

## Implementation Notes

- Config: added commit surface/text, warning and danger families with exact DESIGN.md hexes. `danger.hover` is `#B91C1C` (Tailwind red-700), deliberately behavior-preserving for the existing Button danger hover; `danger.text` (`#991B1B` == red-800) doubles as the dangerGhost hover. Provenance comment updated.
- Judgment calls (user-invisible): secondary text is `text-ink` per the story AC; secondary hover is `bg-line-strong` (stays in the line family); disabled states map gray-400/100 to slate-400/100; ghost maps to slate-500/800; dense Table borders made explicit `border-line`; Toast info is `bg-ink`; spinner leading edge is `border-t-brand`.
- Verified: repo-wide scan of `client/src/components` shows no indigo/gray/green/yellow/red utilities, no colored shadows, no raw hex; `npm run build` succeeds with no new warnings. Props and behavior of all six components unchanged.

## Review Triage Log

- Secondary uses text-ink vs DESIGN text/slate-800 (false) — the story AC explicitly mandates `ink` text, implemented literally; the DESIGN delta (#0A1929 vs #152A3F) is sub-perceptual and the AC governs this story.
- No focus-visible/ring classes applied (false) — no focus variants existed to map, default browser outlines are intact (index.css verified in Story 1.2), and the branded ring is Story 1.5's scope (UX-DR16).
- danger.hover is red-700, not a DESIGN hex (false) — deliberate documented choice: DESIGN specifies no danger hover, so the existing hover value was tokenized to preserve behavior exactly.
- Success toast not ink-navy with cyan edge (deferred, already scheduled) — sale-specific toast treatment is Story 1.5's scope (its AC names the navy-with-cyan-edge treatment); the generic success tone must not take sale-specific styling.
- Dense Table lacks muted head, last row bordered (false) — dense minimalism is the component's established design and the borders are behavior-identical to before, only token-colored; restructuring exceeds the migration mandate.
- Modal scrim bypasses named palette (false) — bg-black at 50% equals the overlay hex exactly, and black/white defaults sit outside the indigo/gray migration mandate.
- shadow-md/shadow-lg vs the shadow system (false) — both are neutral gray, not glow or colored shadow; sizes are pre-existing and out of color-migration scope.
