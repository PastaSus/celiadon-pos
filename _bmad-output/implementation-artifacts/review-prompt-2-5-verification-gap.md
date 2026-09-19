# Story 2.5 review prompt — Verification Gap Reviewer (run in a fresh, context-free session)

The bmad-build `dispatch` route for this story has three review layers. This session had no subagent capability, so
each is parked here for a separate session. Run this one context-free and paste the findings back for triage.

**Work under review:** branch `feat/2-5-stock-movements`, based on `dbb4cd5` — story 2.5, "Record and list stock
movements".
**Frozen content:** `_bmad-output/implementation-artifacts/review-context-2-5.diff` (~26 kB), captured at
implementation time so it cannot go stale. Read that file.

**Read this before judging coverage:** this project has **no test framework** — NFR13 forbids adding a test runner
this phase, and `npm test` does not exist. Verification is `cd server && npx tsc --noEmit`, `cd client && npm run
build`, and a throwaway live API cycle against the dev database, whose 42 assertions are summarised in the spec's
`## Implementation Notes`; the scripts were deleted after they ran, so no runner artifact exists. Judge what is
actually verifiable under that constraint rather than filing "no unit tests" for every branch.

*This prompt points at files in the same checkout. If you are running it somewhere without this repository, stop and
say so rather than reviewing nothing.*

---

Read `.cline/skills/bmad-build/review-prompts/verification-gap.md` completely and follow it as your review
instructions.

Review content: the unified diff at `_bmad-output/implementation-artifacts/review-context-2-5.diff`. Read that file —
it is the content under review. The two new files are `server/routes/stock.ts` and
`client/src/pages/StockMovements.tsx`.

Do not invoke any skill, and do not spawn subagents of your own — you are the reviewer. If the instruction file is
unreadable, report that exact failure and stop. Return your findings as text in your final message; do not route them
through any findings-reporting tool the host may offer.