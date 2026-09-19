# Story 2.3 review prompt — Blind Hunter (run in a fresh, context-free session)

The bmad-build oneshot review layer for this story is **Blind Hunter**. The workflow requires it to run
as a context-free subagent, and this session had no subagent capability, so it is parked here instead.
Run the block below in a **new session with no prior conversation context**, then paste the findings
back so they can be triaged into the spec's `## Review Triage Log`.

**Branch under review:** `feat/2-3-category-stock-filters` (not yet committed — inspect the worktree).
**Files changed:**

- `client/src/components/FilterSelect.tsx` (new)
- `client/src/components/CategoryChips.tsx` (new)
- `client/src/components/index.ts`
- `client/src/pages/Inventory.tsx`
- `client/src/pages/POS.tsx`

---

Conduct a review of CONTENT.
Look for what's missing, not only what's wrong.
Compute your finding floor N from the size of the changes: N = min(floor(sqrt(kB) + 1), 10), where kB is the changed content's size in kilobytes. State the arithmetic in one line, then find at least N issues to fix or improve.
Output a Markdown list of findings only — no severity, priority, or ranking.
If the content is empty, stop and say so.
If you have zero findings, re-check and keep thinking; do not stop with an empty list.

CONTENT:
The changed files in the current worktree on branch `feat/2-3-category-stock-filters` (`git status`, then
read the five files listed above). Inspect them directly before reviewing.

Do not invoke any skill, and do not spawn subagents of your own — you are the reviewer. Return your findings as text in your final message; do not route them through any findings-reporting tool the host may offer.