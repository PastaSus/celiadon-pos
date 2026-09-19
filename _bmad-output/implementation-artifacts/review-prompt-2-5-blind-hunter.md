# Story 2.5 review prompt — Blind Hunter (run in a fresh, context-free session)

The bmad-build `dispatch` route for this story has three review layers. This session had no subagent capability, so
each is parked here for a separate session. Run this one context-free, then paste the findings back for triage into
the spec's `## Review Triage Log`.

**Work under review:** branch `feat/2-5-stock-movements`, based on `dbb4cd5` — story 2.5, "Record and list stock
movements": a new `/api/stock` route (list + restock/adjust/return), a new Stock Movements page, a nav entry, and a
transactional `products.ts` PUT that now records an `adjustment` when a quantity changes.
**Frozen content:** `_bmad-output/implementation-artifacts/review-context-2-5.diff` (~26 kB) — captured at
implementation time, so it cannot go stale after the work is committed. Read that file.
**Files it touches:** `server/routes/stock.ts` (new), `client/src/pages/StockMovements.tsx` (new),
`server/routes/products.ts`, `server/index.ts`, `shared/types.ts`, `client/src/App.tsx`, plus `sprint-status.yaml`
(bookkeeping — ignore for code review).

*This prompt points at files in the same checkout. If you are running it somewhere without this repository, stop and
say so rather than reviewing nothing.*

---

Conduct a review of CONTENT.
Look for what's missing, not only what's wrong.
Compute your finding floor N from the diff file's size: N = min(floor(sqrt(kB) + 1), 10), where kB is the file's
size in kilobytes. State the arithmetic in one line, then find at least N issues to fix or improve.
Output a Markdown list of findings only — no severity, priority, or ranking.
If the content is empty, stop and say so.
If you have zero findings, re-check and keep thinking; do not stop with an empty list.

CONTENT: the unified diff at `_bmad-output/implementation-artifacts/review-context-2-5.diff`. Read that file — it is
the content under review. Read the touched files at HEAD too when the diff alone leaves you guessing; the two new
files are `server/routes/stock.ts` and `client/src/pages/StockMovements.tsx`, and the contracts this change must
honour live in `server/db.sql` (the `stock_movements` table), `server/middleware/auth.ts`, `server/routes/sales.ts`
(the sale transaction that will later write `sale` movements), and `client/src/components/`.

Do not invoke any skill, and do not spawn subagents of your own — you are the reviewer. Return your findings as text
in your final message; do not route them through any findings-reporting tool the host may offer.