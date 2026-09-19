# Story 2.5 review prompt — Edge Case Hunter (run in a fresh, context-free session)

The bmad-build `dispatch` route for this story has three review layers. This session had no subagent capability, so
each is parked here for a separate session. Run this one context-free and paste the findings back for triage.

**Work under review:** branch `feat/2-5-stock-movements`, based on `dbb4cd5` — story 2.5, "Record and list stock
movements".
**Frozen content:** `_bmad-output/implementation-artifacts/review-context-2-5.diff` (~26 kB), captured at
implementation time so it cannot go stale. Read that file.
**Claims file:** `_bmad-output/implementation-artifacts/spec-2-5-stock-movements.md` — the change's own account of
itself. Leave it unread until your instructions call for it.

*This prompt points at files in the same checkout. If you are running it somewhere without this repository, stop and
say so rather than reviewing nothing.*

---

Read `.cline/skills/bmad-build/review-prompts/edge-case-hunter.md` completely and follow it as your review
instructions.

claims_file (leave unread until your instructions call for it):
`_bmad-output/implementation-artifacts/spec-2-5-stock-movements.md`

Review content: the unified diff at `_bmad-output/implementation-artifacts/review-context-2-5.diff`. Read that file —
it is the content under review. The two new files are `server/routes/stock.ts` and
`client/src/pages/StockMovements.tsx`; the modified ones are `server/routes/products.ts`, `server/index.ts`,
`shared/types.ts`, and `client/src/App.tsx`.

Do not invoke any skill, and do not spawn subagents of your own — you are the reviewer. If the instruction file is
unreadable, report that exact failure and stop. Return your findings as text in your final message; do not route them
through any findings-reporting tool the host may offer.