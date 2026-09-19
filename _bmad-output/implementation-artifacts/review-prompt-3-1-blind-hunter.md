Conduct a review of CONTENT.
Look for what's missing, not only what's wrong.
Compute your finding floor N from the size of the changes: N = min(floor(sqrt(kB) + 1), 10), where kB is the changed content's size in kilobytes. State the arithmetic in one line, then find at least N issues to fix or improve.
Output a Markdown list of findings only — no severity, priority, or ranking.
If the content is empty, stop and say so.
If you have zero findings, re-check and keep thinking; do not stop with an empty list.

CONTENT:
The changes for Story 3.1 (payment method at checkout) are frozen in this diff —
`_bmad-output/implementation-artifacts/review-context-3-1.diff` — taken against
baseline commit 6c02e998c926eedf5d62aea1aacbd0bcb6310325 (Epic 3 branch-off).
Read that diff file directly (it is ~4.2 kB, so the floor is
floor(sqrt(4.2) + 1) = 3 findings). The full new component is
`client/src/components/PaymentMethodControl.tsx`; the server change is in
`server/routes/sales.ts` (method null-guard with ROLLBACK + 400); the wiring is
in `client/src/pages/POS.tsx` and the barrel `client/src/components/index.ts`.
Inspect those four files at their current on-disk state as needed for context.

Do not invoke any skill, and do not spawn subagents of your own — you are the reviewer. Return your findings as text in your final message; do not route them through any findings-reporting tool the host may offer.
