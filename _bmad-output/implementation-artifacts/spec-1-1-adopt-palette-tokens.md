---
title: 'Story 1.1: Adopt the palette tokens in the Tailwind config'
type: 'chore'
created: '2026-09-18'
status: 'done'
route: 'oneshot'
review_loop_iteration: 0
context:
  - _bmad-output/planning-artifacts/ux-designs/ux-cube-tech-pos-2026-09-17/DESIGN.md
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Every shipped page and component uses raw Tailwind indigo/gray utilities, so the product runs two visual systems at once and a palette change means editing dozens of files.

**Approach:** Define the eight story-named color families (`brand`, `accent`, `teal`, `commit`, `ink`, `canvas`, `panel`, `line`) with their DESIGN.md frontmatter hex values as nested tokens under `theme.extend.colors` in `client/tailwind.config.js`, so utilities like `bg-brand`, `bg-brand-hover`, `text-accent`, `bg-commit`, `bg-ink`, `bg-canvas`, `bg-panel`, and `border-line` resolve with no raw hex in the config consumers. Then prove it with a clean `npm run build` (which runs `tsc -b` plus the Vite build) and no new warnings. Scope is exactly the eight families the story names; status/chart/slate tokens stay out until the stories that need them.

</frozen-after-approval>

## Implementation Notes

- Changed `client/tailwind.config.js` only: added the eight color families under `theme.extend.colors` with exact DESIGN.md frontmatter hex values (brand 5 shades, accent + accent-ink, teal DEFAULT, commit + hover, ink/canvas/panel singletons, line + strong).
- `teal` merges with Tailwind's default teal 50–950 scale via extend (deep merge); `bg-teal` resolves to `#3FE0D0` and no existing utility breaks. No other family name collides with the default palette.
- Verified via `resolveConfig`: all eight families resolve; `npm run build` (tsc -b + vite build) succeeds with no new warnings.
- Scope held to the eight story-named families; status/chart/slate tokens deferred to the stories that need them.
- Review patch: added a provenance comment block to the config mapping token names to DESIGN.md keys and naming the deferred groups; re-ran `npm run build`, still clean.

## Review Triage Log

- Config renames DESIGN.md keys with no mapping comment (low) — patched with a provenance comment block; same fix covers the missing deferred-groups note.
- No `ring` token (false) — ring `#1690E8` equals brand DEFAULT and UX-DR16 specifies `ring-brand`/`ring-accent`, so no token is missing.
- No `surface` white token (false) — surface `#FFFFFF` equals Tailwind's default `white`; `bg-white` covers all card/modal uses.
- Teal deep-merge with default scale unverified (false) — the `resolveConfig` run shows `teal.DEFAULT` present alongside 50–950, so bare `bg-teal` resolves and the merge is benign.
- Build alone cannot prove resolution without consumers (false) — resolution was verified via `resolveConfig` theme values; no consumer exists by design until Stories 1.3/1.4.
- Verification recorded while status is in-progress (false) — in-progress is the mandated mid-run status; finalize flips it to done.
