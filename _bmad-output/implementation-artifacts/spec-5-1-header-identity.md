---
title: 'Story 5.1 amendment: Header identity at every width'
type: 'feature'
created: '2026-09-23'
status: 'done'
route: 'oneshot'
review_loop_iteration: 0
context: []
story_key: '5-1-hamburger-nav'
baseline_commit: '23c9ce1b1d47c51b7744db9984234c222774fcd2'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Below desktop widths the header reads empty and anonymous — the logotype is `sr-only` and the user meta hides below `md`, so staff sharing one till cannot glance who is signed in without opening the drawer.

**Approach:** Render the `celiadon` logotype visibly beside the accent mark at every width, add a compact right-aligned user chip (role always, email at `sm` and up) below `lg`, and back the chrome divider/meta with named ink tokens. Drawer keeps full meta + Sign out unchanged.

</frozen-after-approval>

## Implementation Notes

Logotype set mark-first (Box, then wordmark) — conventional lockup order; mockup classes otherwise verbatim.

Contrast: ink-text #CBD5E1 on ink #0A1929 = 11.95:1 (computed, clears 4.5:1).

NavDrawer.tsx needed no edits — its only slate literal is the interactive close button (out of scope); drawer meta/divider live in App.tsx and were swapped there.

## Review Triage Log

- [lockup split/grouping | medium → patch] Mark and wordmark were separate `justify-between` items and would split apart on mobile — wrapped in a grouped `flex items-center gap-2 whitespace-nowrap` span (kept right-side placement, matching pre-existing mobile arrangement).
- [chip overflow | low → patch] Added `min-w-0` + `truncate` guards so long emails can't squeeze the brand row.
- [slate-300 remains | false] Interactive-state colors (links, buttons, hamburger) are explicitly out of intent — token swaps scoped to divider + meta text only.
- [field order | false] Mobile `role · email` follows the amended spine; desktop/drawer `email · role` is shipped behavior deliberately left unchanged.
- [config comment | low → patch] Noted the ink-line/ink-text tokens in the palette comment block.
- [wordmark link | false] The logotype was never a link; adding navigation is behavior change outside intent. (nowrap folded into the lockup patch.)
- [context breakpoint | low → patch] epic-5-context still claimed the `md` nav-collapse boundary — corrected to `lg` per the amended spine.

Nothing deferred.

Investigation (step-02, verified against code on `feat/header-identity`):

- Current header (`client/src/App.tsx:118-165`): hamburger `lg:hidden` (:122-131); `sr-only` logotype (:132) + accent `Box` mark (:133); desktop block `hidden lg:flex` (:135) with links, `border-l border-slate-700` divider (:150), meta `hidden md:inline` email·role (:151-153), Sign out (:154-160). Drawer (`NavDrawer.tsx` + App :167-200): full meta + Sign out, `border-slate-700` divider (:185) — behavior unchanged, token swaps only.
- Logotype styling: `text-lg font-extrabold tracking-tight text-white` — the exact classes of the spine-linked reference mockup (`pos-key-screen.html:40`), with text `celiadon`.
- New mobile chip (`lg:hidden`, right-aligned in the bar): `text-xs` caption in token text color; role always rendered; email wrapped in `hidden sm:inline` with the `·` separator inside the same span so nothing dangles. Chip is plain text (not interactive) — no touch-target requirement. Drawer meta and desktop block keep their existing full `email · role` format.
- Tokens: extend the `ink` family in `client/tailwind.config.js` with `line: '#334155'` and `text: '#CBD5E1'` (exact hexes of the current slate-700/slate-300 literals, per DESIGN `border-on-ink`/`text-on-ink`) → utilities `border-ink-line`, `text-ink-text`. Replace the literals in the header (:150-153) and drawer (:185-187) only — no app-wide slate sweep.
- Hamburger stays `lg:hidden` (matches amended spine: hamburger below `lg`); no breakpoint, route, role, drawer-behavior, or motion changes — enter/exit animation belongs to Story 5.5.
- Contrast: ink-text on ink must clear 4.5:1 — compute both ratios in verification (expected ≈13+:1; record the numbers here).
- Out of scope: drawer behavior/content beyond token swaps, desktop link styling, hover states, Story 5.5 motion, palette hexes (separate branch).
- Verify: `cd server && npx tsc --noEmit` clean; `cd client && npm run build` succeeds; manual or DOM check that logotype + chip render at 360px, 768px, and 1280px widths with email hidden/shown per tier.
