---
title: 'Story 4.3: Show the key numbers with a date range control'
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

**Problem:** The Dashboard charts have no shared time window and no glanceable totals, so an owner cannot ask what the store did in a chosen period.

**Approach:** Add a `DateRangeBar` (preset chips Today/7/30/90 mirroring `CategoryChips` — role group, aria-pressed, single active — plus two native date inputs; defaults to the last 30 days; typing switches to Custom; start-after-end corrects by moving the other endpoint, never errors) and a `StatCard` row (total revenue, transaction count, average sale, items sold per UX-DR9) to the Dashboard. A new role-guarded `GET /reports/summary?from&to` serves the metrics; `from`/`to` (ISO, inclusive) become optional params on the three existing report endpoints, omitted preserving today's fixed-12-months behavior. The selected range drives every tile and chart; the granularity toggle stays independent; no deltas (optional per the AC). Money renders only through `formatCurrency()`.

</frozen-after-approval>

## Implementation Notes

- Server: `GET /summary` (count, revenue, JS-derived average with zero-division guard, items via details join) plus optional `?from&?to` (ISO days, inclusive) on all four report endpoints via a shared `parseRange` that falls back to the fixed window on omitted/malformed/inverted input.
- Client: new `StatCard` (UX-DR9) and `DateRangeBar` (Today/7/30/90/Custom chips mirroring CategoryChips, native date inputs, custom-on-type, move-the-other-endpoint correction) in the barrel; Dashboard range state defaults to 30 days and drives trend, top, mix, and summary; granularity toggle stays independent; no deltas (optional per AC).
- Verified: server `tsc --noEmit` exit 0; client build clean. Live probe: summary 30d `{45,1,45,1}`; empty window all zeros with average 0; garbage and inverted ranges fall back; ranged trend/top return the September slice; 401 without token. Probe server stopped afterwards.
- Review fixes (blind hunter, 10 findings, no loopback): daily spans capped at 366 days (400 otherwise, fallback unaffected); caption now names the selected range with For-the-selected-range/All-time scope headings; StatCard values announced via aria-live. No defers.

## Review Triage Log

- Stale fixed-window comments after parseRange — low, patched: comments describe the optional range params.
- Silent fallback versus granularity 400s — false: lenient fallback is the frozen behavior; the client always sends valid ranges.
- Millisecond end-of-day gap and server-local parsing — rejected low: sub-millisecond boundary sales effectively never occur and hand-built datetimes are outside the client contract.
- Unbounded daily buckets over long ranges — low, patched: daily spans over 366 days return 400; fallback still yields 12/53/366.
- Local-ISO versus UTC-midnight shift — false: UTC bucketing with its straddle is the frozen decision and the client caps future dates.
- Date-clear no-op and silent correction — false: behaviors are spec'd (correction without error) or harmless.
- Stale 12-months caption and scope confusion — low, patched: dynamic range caption plus scope subheadings.
- No summary loading state and parallel refetches — false: tiles show — without misleading and independent cancelled fetches are the established pattern.
- Local-time labels and silent tile updates — split: labels follow the frozen UTC decision (false); missing announcements patched with aria-live (low).
- Query contract client-local and unrounded average — false: no shared query-type pattern exists in the repo and formatCurrency rounds at render.
