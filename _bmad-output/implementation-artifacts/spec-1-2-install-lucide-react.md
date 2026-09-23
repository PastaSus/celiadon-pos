---
title: 'Story 1.2: Install lucide-react and replace the close glyph'
type: 'feature'
created: '2026-09-18'
status: 'done'
route: 'oneshot'
review_loop_iteration: 0
context:
  - _bmad-output/planning-artifacts/ux-designs/ux-celiadon-pos-2026-09-17/DESIGN.md
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** The client has no icon library, so the Modal close control is a Unicode `✕` glyph with font metrics instead of icon-grid alignment (screen readers may announce it as "multiplication sign") and a touch target far below the 44px floor.

**Approach:** Add `lucide-react` to `client/package.json` and replace the Modal glyph with the `X` icon at 20px, default 2px stroke, and inherited `currentColor`, keeping the existing `aria-label="Close"` and lifting the control to a 44px touch target. Leave the button's gray color classes untouched — palette migration is Story 1.3. Also clear the one `→` arrow in a `lib/api.ts` comment so no Unicode glyph remains in `client/src`. Then prove it with a clean `npm run build` with no new warnings and a Modal that still opens and closes.

</frozen-after-approval>

## Implementation Notes

- Installed `lucide-react@1.47.0` in `client/` (latest; stack table's `^0.4xx` predates the v1 release — the story requires only that the dependency is added, and NFR12 permits it).
- `Modal.tsx`: `✕` glyph replaced with `<X size={20} aria-hidden="true" />` (lucide defaults supply 2px stroke and `currentColor`); button keeps `aria-label="Close"` and existing gray classes (palette is Story 1.3), gains flex centering plus 44px min touch target.
- `lib/api.ts`: comment arrow `→` changed to `->`; repo-wide scan confirms no emoji, Unicode glyph, inline svg, icon font, or second icon library remains in `client/src`.
- `npm run build` succeeds with no new warnings; Modal open/close behavior untouched (early return + onClose wiring unchanged).

## Review Triage Log

- Explicit strokeWidth/color props missing on X (false) — lucide defaults are 2px stroke and currentColor per the library contract and DESIGN.md Icons, so the AC is met without redundant props.
- 44px target unproven without fixed box (false) — min-h/min-w 44px is a hard floor the icon content cannot shrink below; target holds under any title length.
- No visible focus style (false) — index.css has no outline removal, so the default focus outline renders; the branded 2px ring is Story 1.5's scope (UX-DR16).
- Missing overlay-click/Escape/scroll-lock/focus-return (deferred, already scheduled) — pre-existing gaps owned by Story 1.5 (UX-DR18); no new entry to avoid duplicating planned scope.
- No lint rule enforcing the bans (deferred) — real hardening idea with no owning story; recorded in deferred-work.md.
- No build log in worktree (false) — build was executed in-session and passed; logs are not a story deliverable.
- Spec file untracked at review time (false) — review precedes commit by design; staged at commit.
- `->` ASCII arrow instead of word (false) — plain ASCII in a comment, invisible to Unicode-glyph scans and never rendered.
- No TODO for deferred palette work (low, rejected) — Story 1.3's AC already enumerates every file to migrate; a marker would add noise without preventing a miss.
- Caret range allows upgrades (false) — lockfile pins exact versions and caret matches every other dep in package.json.
- Long title crowding the target (false) — min-w 44px floor holds regardless of title length; truncation polish is pre-existing behavior outside this story.
