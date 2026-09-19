---
title: 'Story 3.3: Filter and page the transaction history'
type: 'feature'
created: '2026-09-19'
status: 'done'
route: 'oneshot'
review_loop_iteration: 0
context:
  - _bmad-output/implementation-artifacts/epic-3-context.md
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** The Transactions page lists every sale newest-first with no date or payment filter and no paging, so answering a return or a question at the counter means scrolling forever.

**Approach:** Filter and page the list client-side over the existing `GET /sales` array (no server change, no new files, no API contract change): a single-calendar-day picker defaulting to today (UX-DR26) plus a payment `FilterSelect` (All first and default, then cash/card/e-wallet per FR16) combined as AND with a visible Clear action whenever any filter is non-default; page 10 per page without full reloads; the empty state names the active filters instead of a blank table (UX-DR22); legacy rows with a null payment method render `—` and appear only under All. Reuse the Epic 2 vocabulary (`FilterSelect`, the conditional Clear pattern, the result-count line) and the `Table` emptyMessage. No product text filter — the story AC scopes this to date, payment, and paging.

</frozen-after-approval>

## Implementation Notes

- Client only: `client/src/pages/Transactions.tsx` — date picker (single day, defaults to today, `max` today), payment `FilterSelect` (All + cash/card/e-wallet), AND组合 client-side over `GET /sales`, page 10 per page with Prev/Next, Clear restores today + All, empty state names the active date/payment. Added a Payment column (`—` for legacy null rows, shown only under All). No server change, no new files.
- Verified: `cd server && npx tsc --noEmit` exit 0; `cd client && npm run build` clean (1916 modules, no new warnings).
- Review fixes: clearing the date input now falls back to today instead of matching nothing; the filtered-empty message shows a locale-formatted date instead of raw YYYY-MM-DD.

## Review Triage Log

- Default-today hides history / Clear returns to today — false: single-day-default-today is the story AC (epics.md:482), not a defect.
- Cleared date input matched nothing with an "on ." message — low, patched: empty input falls back to today.
- Client-side filter/paging with no query params — false: frozen design decision, keeps the API contract unchanged.
- Fetch failure shows "No transactions yet" with no retry — deferred: pre-existing catch-toast path, not caused by this change.
- Detail fetch can reopen a closed modal — deferred: pre-existing viewDetails race, untouched by this change.
- Prev/Next only, count line only when active — false: satisfies the AC and follows the Epic 2 vocabulary.
- max=today hides future-dated rows — false: transaction_date is TIMESTAMPTZ DEFAULT NOW() (db.sql:41), so future rows cannot occur through the app.
- Raw YYYY-MM-DD in the empty message — low, patched: message now uses a locale-formatted date.
- Untyped 'all' filter value / no null-method option — false: 'all' is the Epic 2 FilterSelect convention; null-under-All is spec'd.
- Local-timezone day grouping undocumented — false: ISO timestamptz parses to the same instant, so local-day grouping is the correct counter semantic with no reachable bug.
