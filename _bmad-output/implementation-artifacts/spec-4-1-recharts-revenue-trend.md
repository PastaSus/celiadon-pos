---
title: 'Story 4.1: Install Recharts and chart the revenue trend'
type: 'feature'
created: '2026-09-19'
status: 'done'
route: 'dispatch'
review_loop_iteration: 0
baseline_commit: '7b88ee4c2bd1f1a9c9895c988a8ed37e58ef911b'
context:
  - _bmad-output/implementation-artifacts/epic-4-context.md
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** The Dashboard shows all-time totals and recent sales but no revenue-over-time view, so an owner cannot see whether the store is trending up or down.

**Approach:** Install `recharts` (^2, the only permitted new dependency) and ship a revenue line chart inside a new reusable `ChartPanel` on the Dashboard, fed by a new `GET /reports/revenue-trend` endpoint that returns zero-filled buckets for a fixed server-side window with a granularity parameter (daily/weekly/monthly, monthly default). Axes and tooltips format through `formatCurrency()`; loading shows a skeleton and a sales-less window shows "No sales in this range". The date-range control is Story 4.3 — this story wires no range params.

**Decisions:** Fixed window is the last 12 months (12 monthly points under the default aggregation).

## Boundaries & Constraints

**Always:** New report endpoint sits behind the same JWT plus `requireRole('admin','manager')` guards as the dashboard route; cashiers never see charts. All DB access uses `pool.query()` with `$1, $2` placeholders — never interpolate values. Types import from `shared/types.ts`. Money renders only through `formatCurrency()`, including chart axes and tooltips. Buckets use `date_trunc` in the DB session timezone (UTC) with inclusive endpoints; daily buckets near local midnight may straddle the counter day.

**Never:** No range params or presets (Story 4.3 owns `DateRangeBar` and the range-to-query wiring). No top-products or payment-mix charts (Story 4.2). No StatCard row (Story 4.3). No charting library besides recharts. No test framework.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| HAPPY_PATH | `GET /reports/revenue-trend?granularity=monthly` | 200 `{ data: [{ bucket, revenue }] }`, zero-filled buckets oldest-first, revenue as numbers | N/A |
| DEFAULT_GRANULARITY | Param omitted | Monthly buckets | N/A |
| INVALID_GRANULARITY | `?granularity=yearly` | 400, no query run | Name the rejected value |
| EMPTY_WINDOW | Window with no sales | 200 zero-filled buckets; panel shows "No sales in this range", never bare axes | N/A |

</frozen-after-approval>

## Code Map

- `server/routes/dashboard.ts:8-29` -- existing `GET /` with `requireAuth + requireRole('admin','manager')`; guard pattern to copy for the new router. All-time aggregates only — nothing to reuse for buckets.
- `server/routes/reports.ts` (new) -- `GET /revenue-trend`; validate granularity against an allowlist (mirror `VALID_PAYMENT_METHODS` in `server/routes/sales.ts:16`); `date_trunc` + `generate_series` zero-fill over the fixed window; wrap as `{ data }`.
- `server/index.ts:24` -- router mount point; add the reports router beside dashboard.
- `server/db.sql:35-42,66` -- `sales(total_amount DECIMAL, transaction_date TIMESTAMPTZ DEFAULT NOW())` with `idx_sales_transaction_date`; aggregation source.
- `shared/types.ts:78-84` -- `DashboardStats` lives here; add the trend bucket/response types beside it.
- `client/package.json:12-17` -- add `recharts ^2`; React 18 compatible, no other chart lib.
- `client/src/components/ChartPanel.tsx` (new) -- title at section scale, stable-height frame, skeleton loading, "No sales in this range" empty state; the wrapper Stories 4.2-4.3 reuse.
- `client/src/components/index.ts` -- barrel; export the new panel.
- `client/src/pages/Dashboard.tsx:7-34` -- fetch-on-mount + stat cards pattern; add the revenue section (granularity toggle defaulting to monthly, chart in ChartPanel). Do not touch: stat cards, Recent Sales table.
- Chart color: revenue series uses the existing `brand` token; no new palette tokens (azure/navy/amber tokens do not exist in `client/tailwind.config.js`).

## Tasks & Acceptance

**Execution:**
- [x] `client/package.json` -- add `recharts ^2` via install -- the only new runtime dependency this epic permits
- [x] `shared/types.ts` -- add trend bucket and `{ data }` response types -- keeps the client/server contract typed
- [x] `server/routes/reports.ts` (new) + `server/index.ts` -- `GET /reports/revenue-trend` with role guards, granularity allowlist, zero-filled UTC buckets -- the chart's only data source
- [x] `client/src/components/ChartPanel.tsx` (new) + barrel export -- reusable titled panel with skeleton and empty states for all epic charts
- [x] `client/src/pages/Dashboard.tsx` -- revenue section with daily/weekly/monthly toggle (monthly default), `formatCurrency()` axes and tooltips -- the visible story

**Acceptance Criteria:**
- Given the dashboard loads, when the revenue section renders, then a line chart shows zero-filled buckets with a working daily/weekly/monthly toggle defaulting to monthly (FR18)
- Given any axis or tooltip renders, when revenue values appear, then every one passes through `formatCurrency()` with no raw numbers (UX-DR27)
- Given the chart loads or its window has no sales, when each state renders, then loading shows a skeleton and the empty window shows "No sales in this range", never a blank chart (UX-DR10, UX-DR30)
- Given `cd server` with `npx tsc --noEmit` and `cd client` with `npm run build`, then both succeed with no new warnings

## Implementation Notes

- Implemented via dispatch subagent; verified against the staged diff (773 insertions across 11 files, incl. package-lock).
- Matrix audit by live probe against the dev DB (server on :5057, admin login): default param → 12 monthly buckets oldest-first (ISO strings, numeric revenue, latest bucket 45); `?granularity=yearly` → 400 naming the value with no query; daily → 366 buckets, weekly → 53; zero-filled buckets in sales-less stretches; no token → 401. Probe server stopped afterwards.
- Known follow-ups (not fixed): ~365-point daily chart is heavy until 4.3 narrows the window; vite chunk-size warning at 606 kB from recharts (build succeeds); weekly buckets start Monday per Postgres default.
- Review patches (3 layers, 21 findings, no loopback): UTC-anchored window edges, 400 on array granularity, trend error panel, chart aria-label, token-driven stroke. Session timezone verified GMT live. Full verification re-run green after patching.

## Spec Change Log

## Review Triage Log

- Blind: UTC/local mix in daily/weekly window edges — low, patched: start now UTC-anchored like the monthly branch.
- Blind: no start/end params means breaking change for 4.3 — false: adding optional params later is backward compatible.
- Blind: empty `?granularity=` falls back instead of 400 — false: empty-means-default is conventional and the monthly default is safe.
- Blind: array granularity silently returns monthly — low, patched: non-single-string params now 400 naming the value.
- Blind: failed fetch renders the empty message — medium, patched: error flag shows a failure panel while previous good data stays.
- Blind: toggle fetch has no abort/disabled — false: the cancelled-flag cleanup makes stale renders impossible.
- Blind: no legend or chart description — low, patched: wrapper carries role="img" with an aria-label summary.
- Blind: hardcoded `#1690E8` stroke — low, patched: currentColor under text-brand follows the token.
- Blind: no invalid-date guard on buckets — false: buckets come from generate_series, always valid ISO.
- Blind: Monday week-start undocumented — false: tooltips render full "Week of" dates, self-interpreting.
- Blind: 365 daily points with no decimation — rejected low: minTickGap plus ResponsiveContainer handle display, weight unproven, and 4.3 narrows windows.
- Edge: repeated granularity array — low, patched (same fix as the blind array finding).
- Edge: explicit empty granularity masked — false (same as the blind empty-value finding).
- Edge: session timezone not pinned — false: live check shows the session is GMT, matching the documented UTC buckets.
- Edge: local setMonth against UTC buckets — low, patched (same UTC-anchoring fix).
- Edge: partial first bucket on mid-bucket start — low, patched: day-anchored start makes the first bucket whole.
- Edge: non-array payload crashes trend.length — false: 200s always carry an array; failures throw before setTrend.
- Edge: malformed bucket renders Invalid Date — false (same as the blind bucket finding).
- Edge: tooltip shows $NaN on gaps — false: revenue is ::float wrapped in Number(), never nullish on 200.
- Edge: non-numeric revenue defeats the empty check — false: same guarantee as above.
- Edge: initial failure misreported as empty — medium, patched (same error-flag fix as the blind failure finding).

## Verification

**Commands:**
- `cd server && npx tsc --noEmit` -- expected: exit 0, no output
- `cd client && npm run build` -- expected: tsc + vite succeed with no new warnings

**Manual checks (if no CLI):**
- Dashboard shows the revenue chart with three aggregation states; direct GET of an invalid granularity returns 400 naming the value
