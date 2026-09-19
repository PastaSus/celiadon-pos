# Story 2.4 review prompt — Blind Hunter (run in a fresh, context-free session)

The bmad-build oneshot review layer for this story is **Blind Hunter**, and the workflow requires it to run as a
context-free subagent. This session had no subagent capability, so the filled prompt is parked here. Run it in a
**new session with no prior conversation context**, then paste the findings back so they can be triaged into the
spec's `## Review Triage Log`.

**Changed work:** branch `feat/2-4-reorder-levels-badges`, story 2.4 (per-product reorder levels with stock badges).
**Frozen content under review:** `_bmad-output/implementation-artifacts/review-context-2-4.diff` — a unified diff
captured at implementation time. Read that file; it does not depend on commit state, so it cannot go stale.
**Files the diff touches (read them at HEAD for full context):**

- `client/src/components/Badge.tsx` — new `stockStatus()`; `stockTone()` now delegates to it
- `client/src/components/index.ts` — barrel exports `stockStatus` and the `StockStatus` type
- `client/src/pages/Inventory.tsx` — threshold in the Add/Edit modal, save body, "Reorder at" column,
  sr-only status text in the stock cell, filter predicate via `stockStatus()`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`, `deferred-work.md` — planning bookkeeping (ignore for code review)

Note for the reviewer: this layer runs before the work is committed, and once committed `git diff` is empty — read
the frozen diff file above rather than the worktree.

---

Conduct a review of CONTENT.
Look for what's missing, not only what's wrong.
Compute your finding floor N from the size of the changes: N = min(floor(sqrt(kB) + 1), 10), where kB is the changed
content's size in kilobytes. State the arithmetic in one line, then find at least N issues to fix or improve.
Output a Markdown list of findings only — no severity, priority, or ranking.
If the content is empty, stop and say so.
If you have zero findings, re-check and keep thinking; do not stop with an empty list.

CONTENT:
The unified diff at `D:\WebDevPersonal\cube-tech-pos\_bmad-output\implementation-artifacts\review-context-2-4.diff`
(about 9.8 kB — floor(sqrt(9.8) + 1) = 4, so at least four findings). Read that file; it is the content under review.
Then read the three touched files at HEAD for surrounding context — `client/src/components/Badge.tsx`,
`client/src/components/index.ts`, `client/src/pages/Inventory.tsx` — and, if you need the contract the change must
honour, `server/routes/products.ts` (POST/PUT reorder_level handling) and `client/src/components/Table.tsx`.

Do not invoke any skill, and do not spawn subagents of your own — you are the reviewer. Return your findings as text
in your final message; do not route them through any findings-reporting tool the host may offer.