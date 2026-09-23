# Epic 5 Context: Works at the counter, on a phone or tablet

<!-- Compiled from planning artifacts. Edit freely. Regenerate with compile-epic-context if planning docs change. -->

## Goal

A cashier on a phone or tablet can navigate, browse products, review the cart in a drawer, always see the running count and total, and complete a sale without the cart ever being out of reach. This epic is deliberately last: it retrofits the Dashboard and Reports surfaces built in Epic 4, so earlier epics should already respect the breakpoint rules (horizontally scrolling tables, one primary action per surface) to keep this pass small.

## Stories

- Story 5.1: Collapse the nav to a hamburger on small screens
- Story 5.1 amendment: Header identity at every width (visible logotype + compact user chip; approved in sprint-change-proposal-2026-09-23)
- Story 5.2: Move the cart into a drawer with an always-visible total
- Story 5.3: Stack every surface at the tablet and phone breakpoints
- Story 5.4: Keep the cart alive across filtering and drawer toggles
- Story 5.5: Motion system and shared dialog hook (approved in sprint-change-proposal-2026-09-23)

## Requirements & Constraints

- Below 1024px the nav collapses to a hamburger opening a drawer with exactly the same role-filtered routes as desktop, plus the user email/role meta and Sign out; role filtering must not leak across roles.
- The header shows the visible `celiadon` logotype beside the accent mark at every width, plus a compact user chip right-aligned at every width (role always, email at `sm` and up); the drawer keeps the full `email · role` meta and Sign out unchanged. Chrome dividers/text use the ink-line/ink-text tokens, never raw slate literals.
- Below 1024px the POS cart leaves the grid and becomes a slide-out drawer triggered from a fixed bottom summary bar that always shows item count and total; the cart is never unreachable.
- Dashboard and Reports stack to one column below 768px (stat cards 2-across in the 768–1023 band, charts stacked); tables scroll horizontally inside their container at every width, never dropping columns and never causing page-level sideways scroll; identifiers stay in the first column.
- Cart contents, quantities, and totals survive category filtering and drawer open/close; only a completed sale or explicit removal empties the cart.
- Each surface keeps exactly one visible primary action (POS: Complete Sale); forms and modals go full width minus page padding on phones.
- No test framework is added; verification is server typecheck plus client build plus manual pass. Only free tiers/services; no new runtime dependencies beyond what earlier epics installed.
- Motion (Story 5.5) is functional-only per DESIGN.md Motion: 120/200/250ms caps, transform/opacity/color only, one shared dialog hook for Modal/NavDrawer/CartDrawer, global reduced-motion kill, no route/list transitions or celebrations.

## Technical Decisions

- Reuse the Epic 1 dialog pattern for both drawers: same scrim treatment as Modal, close on Escape and scrim/backdrop tap, return focus to the opener, trap Tab while open. Keep Modal stacking one level deep; toasts render above overlays.
- Cart drawer state lives with the POS cart (same line items, steppers, and Complete Sale action as the desktop cart), not as a separate cart copy — the drawer is a viewport presentation of one cart.
- Breakpoints are Tailwind defaults: `lg` (1024px) is the nav-collapse boundary (hamburger + drawer below it), `md` (768px) governs stacking bands. POS grid is 3 columns above `lg`, 2 columns below; the desktop cart column is sticky above `lg`, the summary bar is pinned below `lg`.
- Chart panels keep a stable fixed height across breakpoints so filtering never makes the page jump.
- Chrome-on-navy colors are named tokens under the ink family (`ink-line` dividers, `ink-text` meta) so the header and drawer never carry raw slate literals.

## UX & Interaction Patterns

- Cart drawer panel rises from the bottom edge (full width on phones), 8px corners, pinned footer on navy holding the total in flat cyan numerals with Complete Sale beside it so the commit action never scrolls out of reach.
- Totals and numerals use tabular figures; money renders through the shared currency formatter everywhere including the summary bar.
- Navy chrome with flat cyan emphasis; no glow, neon, bloom, or colored shadows — short neutral gray shadow only. Touch targets at least 44px on POS tiles, steppers, and drawer controls.
- Icon-only controls (cart trigger, drawer close, quantity steppers) carry accessible labels; decorative icons are hidden from assistive tech; visible 2px focus ring on every interactive element.
- Overlays announce as dialogs; Escape closes the topmost overlay only and never clears a cart or cancels a sale.

## Cross-Story Dependencies

- Depends on Epic 1 (navy nav chrome, dialog/scrim pattern, icon set, toast behavior) and Epic 4 (Dashboard and Reports layouts that Story 5.3 stacks) — hence this epic runs last.
- Story 5.2 builds the drawer and summary bar; Story 5.3 assumes they exist when stacking POS; Story 5.4 assumes the drawer and filters exist to prove cart persistence.
- The header amendment builds on Story 5.1's hamburger/drawer and the Story 1.7 `celiadon` strings; the motion story (5.5) consolidates the focus-trap copies in Modal, NavDrawer, and CartDrawer.
