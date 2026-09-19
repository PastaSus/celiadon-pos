# Epic 4 Context: See how the store is doing

<!-- Compiled from planning artifacts. Edit freely. Regenerate with compile-epic-context if planning docs change. -->

## Goal

An owner or manager opens one surface and sees the store's health at a glance: revenue over time with a daily/weekly/monthly toggle, top products, payment mix, key totals, and a low-stock callout that links straight into the filtered Inventory view.

## Stories

- Story 4.1: Install Recharts and chart the revenue trend
- Story 4.2: Show top products and payment mix
- Story 4.3: Show the key numbers with a date range control
- Story 4.4: Call out low stock on the dashboard

## Requirements & Constraints

- Revenue line chart supports daily / weekly / monthly aggregation; range control defaults to the last 30 days with presets (Today, 7, 30, 90 days) plus custom dates, and every chart plus every metric on the surface follows the one selected range together. Ranges are inclusive of both endpoints; an invalid range (start after end) is corrected by moving the other endpoint, never by erroring.
- Key metrics row: total revenue, transaction count, average sale value, items sold for the chosen period.
- Top 5 products by revenue for the range, with rank, name, quantity, and revenue; payment mix shows cash / card / e-wallet shares summing to 100% with legend and values.
- A range with no sales renders "No sales in this range" inside each chart panel, never a bare axes box.
- Low-stock callout lists product, current quantity, and threshold with out-of-stock first, links into the Inventory low-stock filter, and hides when nothing is low.
- Dashboard and Reports are admin/manager only; cashiers never see them. Existing API contracts must not break. Only permitted new runtime dependency is recharts; no test framework is added — verification is typecheck plus client build.

## Technical Decisions

- Add recharts ^2 to client/package.json; no other charting library. All charts render inside the new ChartPanel wrapper with Recharts underneath.
- Server file set is routes/dashboard.ts plus the new routes/reports.ts for date-ranged analytics; client surfaces are Dashboard.tsx and Reports.tsx sharing StatCard, ChartPanel, and DateRangeBar.
- All DB access is raw SQL through pool.query() with $1, $2 placeholders — no ORM, never interpolate values. Date filtering uses ISO 8601 strings with inclusive endpoints.
- Types come from shared/types.ts (single source); money renders only through formatCurrency(), including chart axes and tooltips; prices store as decimal(10,2) and arrive as JS numbers via the pg numeric parser.
- Low-stock truth is per-product products.reorder_level (default 10): out of stock at quantity <= 0, low when quantity <= reorder_level. This epic only reads the rule defined in Epic 2; it does not redefine it.
- Keep API response shape ({ data } / { error }) and auth guards; new report endpoints sit behind the same JWT plus role middleware.

## UX & Interaction Patterns

- StatCard: caption-scale muted label with tone dot, value at numeric-lg 24px/800 with tabular figures; dot colors from the fixed chart token set; revenue card may use the navy value band; low-stock value stays amber, never the commit color. Stat cards are not buttons.
- ChartPanel: title at section scale, chart below, own loading (skeleton, frame kept) and empty states, stable height across breakpoints so filtering never makes the page jump. Grid lines light gray, axis labels caption-scale muted slate, no vertical grid lines, no 3D/gradients/drop shadows; series reuse the fixed chart tokens with brand azure reserved for revenue; legends wherever a series name is not obvious.
- DateRangeBar: two native date inputs plus preset chips styled like POS category chips; exactly one preset active; typing into an input switches to Custom.
- State discipline per surface: scoped loading, no-data vs. filtered-to-nothing kept distinct, error toast with the server's message while previous good data stays on screen, mutation refresh of invalidated data.
- Voice: sentence case, no exclamation marks or emoji, concrete numbers, money only via formatCurrency() with tabular figures.

## Cross-Story Dependencies

- Story 4.1 (Recharts install + ChartPanel + revenue chart) precedes 4.2 and 4.3, which reuse its panel, tokens, and money-formatting conventions.
- Story 4.3's DateRangeBar drives every tile and chart from 4.1–4.2; build the range-to-query wiring once and share it.
- Story 4.4 depends on Epic 2's reorder_level and stockTone rule; it renders the callout on this epic's Dashboard and links into Epic 2's Inventory filter — the filter must accept a pre-applied low-stock state.
- Payment-mix chart consumes payment methods recorded in Epic 3; legacy rows with null method must group sensibly, not break the pie.
- Epic 5 stacks this epic's Dashboard/Reports to one column below 768px; build with the standard page shell and horizontally-scrolling tables so that retrofit stays small.
