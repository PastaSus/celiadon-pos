---
title: 'Story 3.4: View and print the receipt'
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

**Problem:** Completed sales can be listed and inspected but never shown or printed as a customer-facing receipt, so the customer leaves with no proof and the drawer has no paper trail.

**Approach:** Add one shared `ReceiptView` printable surface (not a Modal) served at a `/receipts/:id` route and fed by the existing `GET /sales/:id` endpoint, so the post-sale and history paths share a single layout and data path: after a completed sale the POS retains the new sale id and navigates there (re-fetching, since the detail endpoint joins product names and the POST response does not), and the Transactions detail surface links to the same route. The slip shows the store name from a single exported constant, one line per item (name, qty × unit price, subtotal), totals through `formatCurrency()`, payment method, receipt number, and timestamp in sentence case with no emoji or decoration; printing uses `window.print()` plus `@media print` CSS targeting 80mm with the app chrome hidden and no PDF library. No cashier line — the acceptance criteria scope the slip to store, lines, totals, method, and timestamp, and sales carry only a user id.

</frozen-after-approval>

## Implementation Notes

- New `client/src/components/ReceiptView.tsx` (exported from the barrel): 80mm paper-slip layout fed by `GET /sales/:id` — store name via new `STORE_NAME` constant in `client/src/lib/api.ts`, receipt number, timestamp, item lines, `formatCurrency()` totals, payment label (`—` for legacy nulls).
- New `client/src/pages/Receipt.tsx` at `/receipts/:id` (contextual route with `ProtectedRoute`, no nav item): loading, not-found (incl. non-numeric id guard), Print button (`window.print()`) + back link, both `print:hidden`. Post-sale path: POS retains the created sale id and navigates after cart clear + stock refresh. History path: View Receipt button in the Transactions detail modal.
- Print: `@page { size: 80mm auto; margin: 4mm }` in `index.css`; nav hidden via `print:hidden`.
- Verified: `cd server && npx tsc --noEmit` exit 0; `cd client && npm run build` clean (1918 modules, no new warnings).
- Review fixes: added a New Sale link on the receipt page so the post-checkout flow is not stranded; store name is now a real `h1` for heading semantics.

## Review Triage Log

- No amount-tendered/change lines — false: the POS collects no tendered amount, so there is nothing to print; that would be a new checkout input, not this story.
- No cashier attribution — false: excluded in the frozen intent; the AC scopes the slip to store, lines, totals, method, and timestamp.
- No store footer / bare receipt number — false: no address or policy data exists anywhere in the system, and the RCP- prefix is self-describing.
- No New Sale action stranding post-checkout — low, patched: receipt page now links to New Sale alongside Print and Back to Transactions.
- Modal left open behind receipt on back-navigation — false: navigating to the receipt route unmounts Transactions, discarding modal state.
- No `@media print` reset, screen styles leak — false: browsers omit backgrounds by default, the slip is a fixed 80mm block, and the nav is `print:hidden`; no verified print defect.
- Every load failure reads as not-found with no retry — deferred: toast names the real error; page-level retry recorded in deferred-work.
- No Number() coercion for pg numeric — false: the OID-1700 parser in `db.ts` already delivers prices as numbers.
- Bare toLocaleString() dates — false: matches every existing surface, and null/invalid dates cannot occur (TIMESTAMPTZ NOT NULL).
- STORE_NAME in api.ts — false: no display-constants module exists and api.ts already hosts shared client-wide helpers.
- Refetch delay before receipt shows — false: deliberate single-data-path decision (detail endpoint joins product names, POST does not).
- No heading structure on the slip — low, patched: store name is now an `h1`.
