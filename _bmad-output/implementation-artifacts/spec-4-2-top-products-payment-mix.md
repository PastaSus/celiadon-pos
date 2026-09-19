---
title: 'Story 4.2: Show top products and payment mix'
type: 'feature'
created: '2026-09-19'
status: 'done'
route: 'oneshot'
review_loop_iteration: 0
context:
  - _bmad-output/implementation-artifacts/epic-4-context.md
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** The Dashboard shows revenue over time but not what drives it, so restocking and register setup cannot follow the numbers.

**Approach:** Add two sections to the Dashboard inside the reused `ChartPanel`, fed by two new role-guarded endpoints on the existing reports router over the same fixed last-12-months window as Story 4.1 (no range params — Story 4.3 owns ranges; both sections ignore the granularity toggle): top 5 products by revenue as a ranked list showing rank, name, quantity, and revenue (FR19), and payment mix as a pie with legend and values whose cash/card/e-wallet shares sum to 100% with legacy null methods excluded from the denominator (FR20). Money renders only through `formatCurrency()`; sales-less windows show "No sales in this range", never bare panels.

</frozen-after-approval>

## Implementation Notes

- Server: `GET /top-products` (top 5 by `SUM(subtotal)` via the proven `sales_details JOIN products` pattern) and `GET /payment-mix` (COUNT + SUM grouped by method, NULLs excluded) on the existing reports router, same guards and fixed 12-month window as the trend endpoint.
- Client: ranked `Table` in ChartPanel for top products; `PieChart` with legend (share %) and `formatCurrency()` tooltips for the mix, zero-filled across all three methods, `role="img"` summary; both sections keep previous data on fetch failure with distinct error messages. Slice fills centralized in one map citing their tokens (SVG cannot use Tailwind classes).
- Verified: server `tsc --noEmit` exit 0; client build clean. Live probe: top-products returns the ranked row; mix correctly returns `[]` on the null-method-only dev data (exclusion proven); both endpoints 401 without token. Shares-sum-100% rests on client arithmetic (not live-proven — dev DB has no method-carrying sales); probe server stopped afterwards.
- Review fixes (blind hunter, 10 findings, no loopback): deterministic ORDER BY on both endpoints; one shared "Showing the last 12 months." caption; largest-remainder shares summing to exactly 100. Dashboard-stats blocking deferred to deferred-work.

## Review Triage Log

- Fixed monthly window diverges from the trend toggle with no label — low, patched: shared "Showing the last 12 months." caption above both panels.
- No tie-breaker on top-products, no ORDER BY on the mix — low, patched: `ORDER BY revenue DESC, p.name ASC` and `ORDER BY payment_method`.
- Unguarded future payment values break the 100% claim — false: the CHECK constraint plus app validation make unknown values impossible.
- Zero-revenue slices render zero-angle entries — false: zero slices are invisible and unhoverable; the full legend is intended.
- Rounded shares sum to 99.9/100.1 — low, patched: largest-remainder shares verified by node check to total exactly 100.
- Stale charts indistinguishable on failure — false: keep-previous plus toast is the epic-mandated pattern, not this story's defect.
- Dashboard blocked behind stats failure — deferred: pre-existing page structure hiding the independent chart fetches.
- No window metadata, "range" text without a selector — low, patched (same shared caption).
- Deleted products vanish from ranking — false: no returns feature exists and the cascade is already accepted deferred work.
- Fragile legend string-matching, stale aria-label — false: ChartPanel suppresses children when empty and labels are unique.
