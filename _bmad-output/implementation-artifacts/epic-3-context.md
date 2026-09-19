# Epic 3 Context: Take the money, and prove it

<!-- Compiled from planning artifacts. Edit freely. Regenerate with compile-epic-context if planning docs change. -->

## Goal

A cashier records how the customer paid on a segmented control, a sale either fully succeeds or fully rolls back with stock and movement rows committing as one unit, and any sale — today's or last week's — can be filtered in the Transactions list and printed as a clean 80mm receipt.

## Stories

- Story 3.1: Select the payment method at checkout
- Story 3.2: Complete the sale atomically with refresh
- Story 3.3: Filter the Transactions list
- Story 3.4: View and print the receipt

## Requirements & Constraints

- Every sale carries exactly one valid payment method (`cash`, `card`, `e-wallet`); the server validates and rejects anything else. The POS control is a segmented single-select defaulting to cash, text-labeled, never emoji.
- Sale completion is atomic: sale row, sale details, stock decrements, and `sale`-type movement rows commit in one `BEGIN`/`COMMIT` transaction; insufficient stock rejects and rolls back with no partial write. Stock quantity and the cart refresh after completion.
- Transactions list filters by payment method, product, and date range, applied together as AND; filters apply live with a visible clear action, and an empty result shows the filtered-empty state.
- Receipt is a printable surface (not a Modal) with item lines, totals, payment method, cashier, receipt number, and date; print CSS targets 80mm with no decoration.
- Every endpoint stays behind auth; any authenticated role may sell. Existing API contracts must not break. Verification is typecheck plus client build; no test framework is added.

## Technical Decisions

- Consume existing schema, do not invent tables: `sales.payment_method` CHECK constraint, `sales.receipt_number`, `sales_details`, and `stock_movements` already exist.
- File set for this epic is POS.tsx plus sales.ts, Transactions.tsx, and the new receipt surface. The movement shape (`product`, `type`, `delta`, `reason`, `user`, `timestamp`) was defined by Story 2.5 — Story 3.2 only adds the `sale`-type writer inside the existing transaction, it does not redefine the shape.
- All DB access is raw SQL through pool.query() with $1, $2 placeholders — no ORM, never interpolate values into SQL strings.
- Types come from shared/types.ts (single source); money renders only through formatCurrency(); prices store as decimal(10,2) and arrive as JS numbers via the pg numeric parser.
- Receipt printing is browser print plus @media print CSS. No PDF library, no print-hardware integration.

## UX & Interaction Patterns

- PaymentMethodControl: segmented single-select in the cart panel, Cash preselected, text labels only, one active segment at a time; sits above the total, below the cart lines (per pos-key-screen mockup).
- Complete Sale stays deep teal (`success` variant) — the commit color, used for nothing else on the surface.
- Transactions filters reuse the Epic 2 vocabulary: SearchInput (debounced, clear button, Escape clears) and FilterSelect (first option always "All", selected by default); combine as AND with a Clear action whenever any filter is non-default.
- Receipt reads as a paper slip: store name, receipt number, date, cashier, one line per item (name, qty × unit price, subtotal), total, payment method. Sentence case, no exclamation marks, no emoji, no decoration.
- Microcopy uses concrete numbers, sentence case, no exclamation marks or emoji; failure messages name the operation and the server-given cause ("Sale failed: <cause>", never "Something went wrong").

## Cross-Story Dependencies

- Story 3.1 (method on the payload) precedes 3.2 (atomic write of the same payload); 3.1's control is the only new writer of `payment_method`, 3.2 changes what the server does with the write.
- Story 3.2's `sale` movement rows are the reason Story 2.5 reserved the `sale` row styling — the list already renders them, this story only starts producing them.
- Story 3.3's payment-method filter consumes the values 3.1 records; a sale with a null method (pre-3.1 history) must still render sensibly under filtering.
- Story 3.4's receipt surface reads the sale-detail endpoint that already ships; it adds the print view, not the data.
- Epic 4's payment-mix chart consumes the methods recorded here; null methods from legacy rows must not break its grouping.
