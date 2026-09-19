---
title: 'Story 3.1: Select the payment method at checkout'
type: 'feature'
created: '2026-09-19'
status: 'done'
route: 'oneshot'
review_loop_iteration: 0
baseline_commit: '6c02e998c926eedf5d62aea1aacbd0bcb6310325'
context:
  - _bmad-output/implementation-artifacts/epic-3-context.md
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** `sales.payment_method` is validated server-side but no client surface sets it, so every sale records NULL and register totals cannot be reconciled by payment type.

**Approach:** Add a `PaymentMethodControl` segmented single-select to the POS cart (Cash preselected, per the pos-key-screen mockup) that travels on the existing checkout payload, and tighten the server so an invalid method is rejected instead of silently nulled.

## Boundaries & Constraints

**Always:** All DB access uses `pool.query()` with `$1, $2` placeholders — never interpolate values (AD-2). Types import from `shared/types.ts`, never re-declared in client code. Money renders only through `formatCurrency()`. Endpoints stay behind `requireAuth`; any authenticated role may sell (FR4).

**Never:** No schema change (`payment_method` CHECK constraint already exists). No new page, no new component beyond `PaymentMethodControl`. Receipt view and print styles are Story 3.4. Transaction-list payment filter is Story 3.3. No test framework.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| HAPPY_PATH | Cashier selects Card, completes sale | Sale row carries `card`; response echoes it | N/A |
| DEFAULT | No segment touched, completes sale | Sale records `cash` | N/A |
| INVALID_METHOD | `payment_method: "bitcoin"` posted directly | 400, no sale row written | Name the rejected value in the error |
| MISSING_METHOD | Body omits `payment_method` | 400, no sale row written | State the field is required |

</frozen-after-approval>

## Code Map

- `server/routes/sales.ts:16,22-121` -- sale POST; `VALID_PAYMENT_METHODS` allowlist and `method` null-coalescing at lines 51-53 are the exact lines to tighten. Transaction skeleton (BEGIN/COMMIT/ROLLBACK/release) already ships — reuse, do not restructure.
- `client/src/pages/POS.tsx:7-68,93-121,241-259` -- cart state, checkout sender, cart panel layout. Control sits between cart lines and total block (mockup order: lines → method → total → Complete Sale). `setCart([])` currently skips method reset — wire it.
- `client/src/components/CategoryChips.tsx:11-27` -- golden example for the segmented pattern: `role="group"` + `aria-label`, `aria-pressed` per option, exactly one active, active = `bg-brand text-white`, inactive = `text-brand-strong` on `bg-brand-subtle` wash row, 44px touch floor.
- `client/src/components/index.ts` -- barrel; add the new component export here.
- `client/src/components/Button.tsx:17` -- `success` variant owns Complete Sale (deep teal commit color); the control must not borrow it.
- `shared/types.ts:11,44-52` -- `PaymentMethod` union and `Sale.payment_method` already exist; no type change needed. Do not touch.
- `server/db.sql:39` -- CHECK constraint already covers the three values; no migration.
- Do not change: `server/routes/stock.ts` (2.5's movement writer), `client/src/pages/Transactions.tsx` (3.3 owns its filter), receipt surfaces (3.4).

## Tasks & Acceptance

**Execution:**
- [x] `server/routes/sales.ts` -- reject invalid or missing `payment_method` with 400 (ROLLBACK, no write) instead of null-coalescing -- closes the silent-NULL path
- [x] `client/src/components/PaymentMethodControl.tsx` (new) -- segmented single-select (Cash/Card/E-Wallet), Cash preselected, `role="group"`, `aria-pressed`, 44px touch targets -- per UX-DR8 and the pos-key-screen mockup
- [x] `client/src/components/index.ts` -- export the new control from the barrel
- [x] `client/src/pages/POS.tsx` -- render control in cart panel, send its value on checkout, reset to cash on sale completion -- wires the payload end to end

**Acceptance Criteria:**
- Given a completed sale, when the method was selected or left default, then the recorded sale carries exactly that valid method (FR14, FR15)
- Given the control renders, when a cashier reads it, then Cash is preselected, labels are text-only (never emoji), and exactly one segment is active (FR14, UX-DR8)
- Given `cd server` with `npx tsc --noEmit` and `cd client` with `npm run build`, then both succeed with no new warnings

## Implementation Notes

- Server: kept the existing `method` null-coalescing shape and added a null-guard that ROLLBACKs with a 400 naming either the missing field or the rejected value. Item validation still runs first; only a valid-items payload reaches the method check.
- Client: new `PaymentMethodControl` mirrors `CategoryChips` (group + aria-pressed, one active, brand wash row, 44px floor). `POS.tsx` owns the `paymentMethod` state (default `cash`), sends it on checkout, resets to cash alongside `setCart([])`. Control sits between cart lines and the total block per the mockup.
- Verified: smoke script against dev DB covered all four matrix rows (card recorded, cash recorded, `bitcoin` 400 + no write, missing 400 + no write) — 8/8 passing, then deleted with test rows cleaned up. `npx tsc --noEmit` exit 0; client build 1916 modules, no new warnings.

## Spec Change Log

## Review Triage Log

## Verification

**Commands:**
- `cd server && npx tsc --noEmit` -- expected: exit 0, no output
- `cd client && npm run build` -- expected: tsc + vite succeed with no new warnings

**Manual checks (if no CLI):**
- POS cart shows the segmented control with Cash active; completing a sale records the chosen method; direct POST of an invalid or missing method returns 400 with no sale row
