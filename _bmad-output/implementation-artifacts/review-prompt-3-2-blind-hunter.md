Conduct a review of CONTENT.
Look for what's missing, not only what's wrong.
Compute your finding floor N from the size of the changes: N = min(floor(sqrt(kB) + 1), 10), where kB is the changed content's size in kilobytes. State the arithmetic in one line, then find at least N issues to fix or improve.
Output a Markdown list of findings only — no severity, priority, or ranking.
If the content is empty, stop and say so.
If you have zero findings, re-check and keep thinking; do not stop with an empty list.

CONTENT:
Commit under review: the 3.2 worktree changes frozen in
_bmad-output/implementation-artifacts/review-context-3-2.diff
(2.9 kB, floor = floor(sqrt(2.9) + 1) = 2 findings).
The spec is _bmad-output/implementation-artifacts/spec-3-2-atomic-sale.md.
Inspect the diff directly before reviewing; it is the source of truth.
The worktree is clean otherwise.

Do not invoke any skill, and do not spawn subagents of your own — you are the reviewer. Return your findings as text in your final message; do not route them through any findings-reporting tool the host may offer.
