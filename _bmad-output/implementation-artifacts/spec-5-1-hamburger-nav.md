---
title: 'Story 5.1: Collapse the nav to a hamburger on small screens'
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

**Problem:** The navy nav bar renders its full link row at every width, so on a phone the routes crowd, shrink, or scroll away instead of fitting the screen.

**Approach:** Below the `md` (768px) breakpoint the nav shows a hamburger (lucide Menu, labeled, aria-expanded) that opens a left slide-in drawer with exactly the same role-filtered routes as desktop plus the user email/role meta and Sign out; desktop markup is unchanged. The new `NavDrawer` reuses the Epic 1 dialog pattern (scrim/backdrop-tap close, Escape close, focus trap, focus return to the hamburger, announced as a dialog) in navy chrome matching the bar. No route or role logic changes.

</frozen-after-approval>

## Implementation Notes

- New `client/src/components/NavDrawer.tsx` (barrel-exported): left slide-in navy panel with the Epic 1 dialog behavior (scrim/backdrop-tap, Escape, focus trap, focus return, role dialog); links, meta, and Sign out render as children.
- `client/src/App.tsx`: hamburger (lucide Menu, labeled + aria-expanded, `md:hidden`) beside the brand; desktop link row now `hidden md:flex` (unchanged otherwise); drawer lists the same role-filtered `navItems` with active states, closes on navigation, and carries email/role meta plus Sign out.
- Verified: server `tsc --noEmit` exit 0; client build clean. No live UI pass available here — drawer behavior (trap/Escape/backdrop/focus-return) mirrors the proven Modal effect line for line.
- Review fixes (blind hunter, 9 findings, no loopback): drawer closes on navigation and on crossing into desktop widths; aria-current on desktop and drawer links; hamburger wired to the panel via aria-controls/id; drawer links wrapped in a labelled nav landmark. No defers.

## Review Triage Log

- No body scroll lock — false: matches the reused Modal pattern; diverging here alone would split the epic's dialog behavior.
- No close on pathname change — low, patched: pathname effect and link clicks both leave the drawer closed.
- No auto-close on resize past md — low, patched: matchMedia listener closes at the desktop boundary.
- No aria-current on active links — low, patched on both desktop and drawer maps.
- aria-expanded without aria-controls — low, patched: panel carries id="mobile-nav".
- Background not inert — false: app-wide inert is beyond this story and the trap already confines Tab.
- No nav landmark in the drawer — low, patched: links wrapped in nav aria-label="Mobile navigation".
- Ref assignment during render — false: deliberate parity with the proven Modal effect; idempotent and behaviorally safe.
- No slide transition — rejected low: no transition vocabulary exists in the app and animating mount/unmount needs a state machine.
