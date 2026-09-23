---
title: 'Story 1.8: Apply the AA palette correction'
type: 'chore'
created: '2026-09-23'
status: 'done'
route: 'oneshot'
review_loop_iteration: 0
context: []
story_key: '1-8-aa-palette'
baseline_commit: 'bd23fdbce78862d5d199f834b55b5acc0ab69d0e'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** DESIGN.md commits the AA-corrected azure (`primary` #0D75C4, white labels 4.8:1) but the build still ships #1690E8 (3.39:1, fails AA), and small muted text sitting directly on the canvas background measures 4.04:1, also below the 4.5:1 floor.

**Approach:** Swap the two stale hexes to the committed azure, then audit every small muted-text usage for its real background and lift failing on-canvas sites to slate-600 — config plus classes only, no behavior change.

</frozen-after-approval>

## Implementation Notes

Investigation (step-02, all verified against code on `feat/aa-palette-correction`):

- Stale-hex sites (only two in the repo): `client/tailwind.config.js:17` (`brand.DEFAULT: '#1690E8'`, hover `#0E7BCB` at :18) and `client/src/pages/Dashboard.tsx:65` (`cash: '#1690E8'` inside `PAYMENT_FILLS`, whose comment cites the token — keep the citation, change the hex). Targets from DESIGN frontmatter: `brand.DEFAULT` → `#0D75C4`, `brand.hover` → `#0A6BB4`. `ring` needs no token (spec-1-1 established `ring-brand` utilities; ring tracks brand automatically). `chart-revenue` has no config token either — the Dashboard revenue series must be checked for a literal and pointed at the new azure if one exists.
- Everything downstream of the tokens (`bg-brand`, `text-white` on primary, `hover:bg-brand-hover`, nav pill, focus rings) fixes itself; verify by building, not by touching consumers.
- Computed contrast ratios (WCAG relative luminance, verified with node): white on #0D75C4 = 4.82:1 (pass), white on #0A6BB4 = 5.56:1 (pass), slate-500 on white = 4.76:1 (pass — leave on-white usages alone), slate-500 on canvas = 4.04:1 (FAIL for small text), DESIGN text-muted on canvas = 4.46:1 (fail), text-subtle on white = 3.05:1 (fails body, passes large/non-text only).
- Muted-text audit rule: enumerate every `text-slate-500` / `text-slate-400` / `text-subtle` usage, determine its real rendered background (white card/panel vs `bg-canvas` page vs navy chrome). Any small (< 18.66px bold / 24px) text below 4.5:1 moves to `text-slate-600` (verify: slate-600 on canvas and on white both clear 4.5:1 — compute and record both ratios here before editing). Known failing site: `POS.tsx:156` result count (directly on canvas). `bg-slate-500` tone dots (Dashboard stat dots) are non-text indicators at 4.76:1 on white — leave. `disabled:bg-slate-400` fills are backgrounds, not text — leave. Ghost-button `text-slate-500` sites: fix only where the rendered bg is canvas.
- Decisions: `text-slate-600` (existing scale) over a new muted token — zero config change, minimal visual delta, and code never used a muted token anyway. On-white slate-500 stays (4.76 passes; no churn). Done specs (e.g. spec-1-1's ring note) are historical records — leave stale notes alone.
- Doc edit (proposal §B, belongs to this story): `epics.md` UX-DR1 `brand (azure #1690E8 + hover…)` → `#0D75C4` / `#0A6BB4`.
- Out of scope: Story 5.x motion/header work, any component prop/behavior change, favicon, seed data.
- Verify: repo-wide grep for `#1690E8` returns zero; `cd server && npx tsc --noEmit` clean; `cd client && npm run build` succeeds; record the slate-600 ratios and the final per-site disposition (site → bg → verdict) in these notes.

## Disposition log (added during implementation)

- Hex swap: `tailwind.config.js` brand DEFAULT → #0D75C4, hover → #0A6BB4; `Dashboard.tsx` PAYMENT_FILLS cash → #0D75C4 (token citation kept). Revenue line uses `stroke="currentColor"` inside `text-brand` — tracks automatically, no edit. `ring` needs no token (`ring-brand` utilities). Final grep for `#1690E8` across client/server/shared: zero hits.
- slate-600 remedy verified: 6.44:1 on canvas, 7.58:1 on white — clears 4.5:1 both places.
- Muted-text audit (small text only; large/dark text trivially passes):
  - FIXED → `text-slate-600` (were small slate-500 directly on canvas, 4.04:1): POS result count, Dashboard range line, Transactions result count, Transactions pagination, StockMovements result count, Inventory result count, DateRangeBar "to" separator (plain-div root on canvas).
  - LEFT (small slate-500 on white, 4.76:1, pass): all table cells (Inventory/Transactions/StockMovements/Dashboard), modal help texts (Inventory ×2, SM ×1), Login card, App access-denied card, ChartPanel empty/loading, CartDrawer panel + empty state, desktop-cart empty state, CartItems unit lines, Dashboard stat labels, ghost-button labels (all render on white).
  - LEFT (non-text): `bg-slate-500` stat tone dots (4.76:1, non-text floor is 3:1), `disabled:bg-slate-400` fills, chart axis ticks #64748B at 12px on white (4.76:1), CartDrawer close icon (icon-only, 4.76:1 on white).
  - No `text-slate-400` / `text-subtle` text usage exists anywhere — the 3.05:1 pair has no live surface.
- Doc: `epics.md` UX-DR1 hexes → #0D75C4 / #0A6BB4.

## Review Triage Log

- [ramp leftovers | false] `brand.strong/surface/subtle` unchanged matches the amended DESIGN frontmatter exactly; no re-harmonization owed — strong-on-white computes 6.63:1.
- [PAYMENT_FILLS literal | false] Raw hex in the SVG fill map is the sanctioned exception (fills can't use Tailwind classes; token cited in comment) and now carries the correct value.
- [ring unverified | false] Computed: ring azure 4.82:1 on white, 4.09:1 on canvas — both clear the 3:1 non-text floor in UX-DR16.
- [bg record | false] Every named left-alone site re-verified white (StatCard/Receipt/Modal/SearchInput/FilterSelect/table cells); the per-site disposition above is the record.
- [icons/ghost | false] Non-text floor is 3:1 and slate-500-on-canvas clears 4.04:1; all ghost text sites render on white.
- [spinner label | low → patch] `LoadingSpinner` "Loading…" renders directly on canvas at page level (4.04:1) — moved root text to `text-slate-600` (passes both bgs).
- [UX-DR1 hexes | low → patch] Added the unchanged strong/surface/subtle hexes so the normative line is complete.
- [historical mentions | false] `#1690E8` in deferred-work, done specs, rubric, and validation reports correctly describes the past; only live code was in scope.
- [mockup stale | low → patch] Two `#1690E8` instances in `pos-key-screen.html` (ramp comment + revenue dot) → `#0D75C4` / `#0A6BB4`.
- [verification trail | false] Tracking resolves at finalize (status sync + commit), not a code defect.
- [date inputs/ticks | false] Date inputs are slate-800 (~14:1); axis ticks #64748B at 12px on white are 4.76:1 — both pass.

Nothing deferred.
