---
title: 'Story 1.4: Migrate the pages and app shell to the palette'
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

**Problem:** App.tsx and all five pages still render raw indigo/gray/green/red/blue/purple utilities, so the product remains two visual systems wearing one name, and the POS still uses text glyphs for its quantity steppers.

**Approach:** Remap every raw color class in App.tsx, Login, Inventory, POS, Dashboard, and Transactions to named tokens under two rules — gray-N migrates step-preserving to slate-N, and semantic colors take their token (brand for links and the login logotype, commit for positive amounts and healthy states, danger for errors, panel/line for muted blocks and dividers, canvas for the page). The nav becomes ink chrome with an accent logo mark, azure active pill, and slate inactive items; the POS cart total moves onto a navy band with accent tabular numerals and its stock text becomes stockTone Badges; Dashboard stat dots take the existing brand/commit/teal/warning tokens. While migrating the POS cart lines, replace the glyph steppers and remove control with lucide Minus/Plus/X icons at 44px with accessible labels, completing the client-wide icon ban. Route guards, landing rules, data flow, and all behavior stay unchanged, and `npm run build` succeeds with no new warnings.

</frozen-after-approval>

## Implementation Notes

- Mapping rules applied: gray-N migrates step-preserving to slate-N; semantic colors take tokens (brand links/logotype, commit positive amounts, danger errors, panel muted blocks, line dividers, canvas page). Inputs take border-line-strong with focus:ring-brand.
- Judgment calls: Sign out is a plain navy-styled button (ghost variant text would fail on ink chrome); stat dots map blue/green/purple/yellow to brand/commit/teal/warning since every DESIGN chart hex already exists under another token; transaction total is ink numerals on a brand-subtle wash; POS price is non-interactive slate-800; POS steppers grew to 44px with lucide Minus/Plus/X and accessible labels, completing the client-wide icon ban on the lines already being migrated.
- Verified: repo-wide scan of App.tsx and all pages shows no raw indigo/gray/green/red/blue/purple/yellow utilities and no glyphs; `npm run build` (tsc + vite) succeeds with no new warnings. Nav roles, ProtectedRoute, landings, and all data flow untouched.
- Review patches: stepper/remove aria-labels now name the product; stat dots reassigned to Products teal, Inventory commit, Sales slate-500, Revenue brand (revenue owns azure per DESIGN; amber stays reserved for low stock).

## Review Triage Log

- Grid prices not accent-on-navy (false) — the navy-band rule targets key numerals; the cart total carries it while tile prices stay slate on white per the card system.
- Quantity span styling/announcements (deferred, already scheduled) — single centered digits gain nothing from tabular figures, and announcement design belongs to Story 1.5's floor audit.
- Tiles not keyboard-operable (deferred, already scheduled) — genuine gap owned by Story 1.5, which requires every interactive element keyboard-reachable; converting tiles exceeds migration scope.
- Generic stepper labels (patched) — labels now include the product name.
- Sign-out forks raw button (false) — deliberate: ghost text fails on ink chrome and className overrides risk unpredictable conflicts; default focus intact and branded rings arrive in Story 1.5.
- Logotype brand vs nav accent (false) — DESIGN assigns brand to the logotype on light surfaces and accent to the mark on navy chrome; both correct on their surfaces.
- Dot hues and missing legend (patched in part) — labels beside dots are the legend; Revenue dot reassigned from warning-amber to brand so amber stays reserved for low stock.
- Two total treatments (false) — each follows its surface's DESIGN rule: receipt-style block on subtle wash in the modal, key numeral on navy in the POS cart.
