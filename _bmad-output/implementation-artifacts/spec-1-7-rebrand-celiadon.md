---
title: 'Story 1.7: Rebrand to celiadon'
type: 'chore'
created: '2026-09-23'
status: 'done'
route: 'dispatch'
baseline_commit: 'bd23fdbce78862d5d199f834b55b5acc0ab69d0e'
review_loop_iteration: 0
context: []
story_key: '1-7-rename'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** The product is named after Cube Tech, a real company, but this repo was built as a job-application project. Every surface, config, and planning artifact must stop borrowing that identity.

**Approach:** Mechanical string and path sweep to celadon (Option A: logotype `celadon`, titles/receipts `celadon POS`, repo/packages/folders `celadon-pos`), landing before any other new string work.

## Boundaries & Constraints

**Always:** Preserve exact casing per surface (`celadon` logotype, `celadon POS` titles/receipts, `celadon-pos` identifiers/paths). Keep every behavior, route, prop, and API contract identical — strings and paths only. Folder renames use VCS moves so history survives. Old spec `sources:` frontmatter paths are updated to the new folder names so traceability stays live.

**Never:** No behavior, styling, schema, or dependency changes. No renaming the OS checkout directory (user-side, like the repo/hosting renames). No touching the demo password hash or weakening published credentials. No new brand invention beyond the approved strings.

**Decisions (2026-09-23):** Seed admin email renamed to `admin@celiadon.pos` in `server/db.sql` + README; existing Neon database keeps its old row until re-seeded. Frozen review evidence (`review-context-*.diff`, `review-prompt-*`) stays byte-identical; grep exemptions documented in Verification. Work happens on branch `feat/rebrand-celiadon` per repo `feat/<slug>` convention (cf. `feat/ux-motion-header`).

</frozen-after-approval>

## Code Map

- `client/src/lib/api.ts:10` — exports `STORE_NAME`; single source consumed by ReceiptView.
- `client/src/pages/Login.tsx:27` — H1 brand title.
- `client/src/App.tsx:132`, `client/src/components/NavDrawer.tsx:92` — logotype strings (visibility handled by Story 5.1 amendment; this story changes the text only).
- `client/index.html:7` — `<title>POS System</title>` → `celiadon POS`.
- `client/package.json`, `server/package.json`, root `package.json` — names `pos-client` / `pos-server` / `pos-system`.
- `server/db.sql:74` — seed admin email (pending Open Question 1).
- `README.md:71` — documents seed email; plus any title/brand prose.
- `AGENTS.md:4` — project heading (managed block; full refresh follows via `bmad-project-context` after merge).
- `_bmad/config.toml:14`, `_bmad/{bmm,bmb,cis,tea,core,wds,bmad-loop}/config.yaml` — `project_name` fields.
- `SPEC.md:85` — Open Question answer hardcodes the old store name.
- `ARCHITECTURE-SPINE.md` — frontmatter name, heading, tree label, two sources paths; folder rename to `architecture-celiadon-pos-2026-09-16`.
- `ux-cube-tech-pos-2026-09-17/` — DESIGN.md (frontmatter, heading, logotype refs), EXPERIENCE.md (frontmatter, heading, STORE_NAME value), mockup title + logotype, `.memlog.md` if branded; folder rename to `ux-celiadon-pos-2026-09-17`.
- `epics.md` — title, overview sentence, three sources paths, UX-DR12 mockup path; Story 1.7/1.8 registration pending (backlog items from the approved change proposal).
- `sprint-status.yaml:1` — header comment (status entries for 1-7/1-8/5-5 already added).
- Old specs `spec-1-1` … `spec-2-5` etc. — `sources:` frontmatter path segments pointing at the two renamed folders.
- `deferred-work.md` — absolute `D:\WebDevPersonal\cube-tech-pos\…` source paths stay valid (checkout dir unchanged); header untouched.
- Do NOT touch: `review-context-*.diff`, `review-prompt-*` (pending Open Question 2), anything under `node_modules/`, `.git/`, the change-proposal doc itself.

## Tasks & Acceptance

**Execution:**
- [x] `client/src/lib/api.ts` — set `STORE_NAME = 'celiadon POS'` — receipt single source.
- [x] `client/src/pages/Login.tsx` — H1 renders `celiadon POS` — title surfaces keep the suffix.
- [x] `client/src/App.tsx` + `client/src/components/NavDrawer.tsx` — logotype strings render `celiadon` with no "POS" — per approved Header naming.
- [x] `client/index.html` — `<title>` reads `celiadon POS`.
- [x] `client/package.json`, `server/package.json`, root `package.json` — rename to `celiadon-client`, `celiadon-server`, `celiadon-pos`.
- [x] `server/db.sql` + `README.md` — seed email per Open Question 1 decision; README brand prose → celiadon.
- [x] `_bmad/config.toml` + all seven `_bmad/*/config.yaml` — `project_name` → `celiadon-pos`.
- [x] `SPEC.md`, `ARCHITECTURE-SPINE.md`, `DESIGN.md`, `EXPERIENCE.md`, mockup, `.memlog.md` — brand strings → approved forms.
- [x] VCS-move both dated planning folders to `celiadon-pos` names; update every inbound path reference (epics frontmatter + overview, architecture sources, UX-DR12 mockup path, old spec `sources:` frontmatter).
- [x] `epics.md` — title/overview → celiadon; register Story 1.7 and 1.8 entries under Epic 1 (brief, pointing at this spec and the change proposal).
- [x] `AGENTS.md` heading + `sprint-status.yaml` header comment → celiadon-pos.

**Acceptance Criteria:**
- Given the completed sweep, when searching the repo excluding `.git/`, `node_modules/`, frozen review diffs/prompts, machine-local absolute checkout paths, and the change-proposal doc, then zero old-brand strings remain.
- Given the app running, when loading Login, the nav header, the drawer, and a receipt, then Login shows `celiadon POS`, header/drawer show `celiadon`, and the receipt shows `celiadon POS` from the single exported constant.
- Given the renamed planning folders, when opening any old spec's `sources:` links and the epics/architecture sources lists, then every path resolves.
- Given no behavior was touched, when typechecking the server and building the client, then both succeed with no new warnings.

## Implementation Notes

Note (2026-09-23 spelling unification): the `<frozen-after-approval>` block above is read-only and retains the `celadon` typo on its Approach/Always lines. The implemented truth is `celiadon` everywhere (logotype `celiadon`, titles/receipts `celiadon POS`, identifiers/paths `celiadon-pos`) per the human's Option A decision; all non-frozen sections of this spec were updated accordingly.

## Spec Change Log

## Review Triage Log

- [B1/E2 | G-memlog | false] Claimed `.memlog.md` topic reads `celadon-pos`; the file reads `celiadon-pos` with the approved spelling — reviewer misread, no defect.
- [B2/E3/E4 | G-visible | false] `sr-only` logotypes vs DESIGN's visible-logotype rule is real but explicitly out of this story's intent — spec scopes visibility text-only and assigns the reversal to the Story 5.1 amendment; this story's strings-only AC is met. (Edge hunter also cited nonexistent lines 983/996.)
- [B3 | false] `TOKEN_KEY = 'pos.token'` unchanged is correct, not a gap — renaming it would force-logout every session for zero user-visible benefit.
- [B4 | P-desc | low → patch] Package descriptions stayed generic; mentioned celiadon in root + server descriptions (client has no description field). Trivial identity polish in the story's own domain.
- [B5 | false] Mockup `rosa@celiadon.com` vs seed `admin@celiadon.pos` is not a defect — demo content and seed login are unrelated artifacts with no consistency requirement.
- [B6/E1 | G-seed | false] `ON CONFLICT DO NOTHING` keeping the old Neon row is the human-approved Open-Question-1 decision ("keeps its old row until re-seeded"), not an oversight; a data-migrating UPDATE would violate the spec's no-migration boundary.
- [B7 | false] Claimed `spec-2-5+` `sources:` still point at old folders; repo-wide search confirms zero stale folder references anywhere — reviewer misread.
- [B8 | false] `sprint-status` in-progress vs spec in-review is normal workflow mechanics (present step syncs to review); story amendments need no new status entries.
- [B9 | P-url | low → patch] Deploy-URL example named a Vercel host before the manual rename; qualified the comment with "(once the Vercel project is renamed)" so it reads true both before and after.
- [B10 | P-exempt | low → patch] Epics Story 1.7 exemption list omitted `.git/` + `node_modules/`; aligned its wording with the spec AC.
- [B11 | false] `/vite.svg` favicon is pre-existing and explicitly optional cleanup in the epics, outside this story's strings-and-paths intent.
- [B12 | false] Rubric/validation-report describing the 3.39:1 failure is frozen review history, and validation-report.md already documents the #0D75C4 remediation — no annotation owed.

## Design Notes

Canonical string mapping (only these forms; nothing else is invented):

| Old | New | Where |
|---|---|---|
| `Cube Tech POS` | `celiadon POS` | Login H1, `<title>`, STORE_NAME, SPEC answer, doc headings where the full product name belongs |
| `Cube Tech POS` logotype | `celiadon` | App header, NavDrawer, DESIGN logotype refs |
| `cube-tech-pos` | `celiadon-pos` | package names, `project_name`, folder names, repo name |
| `admin@cubetech.pos` | per Open Question 1 | seed + README |

## Verification

**Commands:**
- `rg -n -i "cube.?tech" --glob '!.git/**' --glob '!**/node_modules/**'` — expected: only exempted paths (frozen review evidence, absolute checkout paths, change proposal) remain, per Open Question decisions.
- `cd server && npx tsc --noEmit` — expected: clean.
- `cd client && npm run build` — expected: success, no new warnings.

**Manual checks (if no CLI):**
- Login, header, drawer, and a printed receipt show the approved strings; renamed folder links open from epics and old specs.
