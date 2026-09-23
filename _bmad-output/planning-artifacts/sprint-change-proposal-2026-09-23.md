# Sprint Change Proposal — celiadon-pos (formerly cube-tech-pos)

- **Date:** 2026-09-23
- **Author:** bmad-correct-course (batch mode)
- **Status:** approved
- **Scope classification:** Moderate — backlog reorganization → PO/DEV handoff
- **Triggers:**
  1. Project rename — Cube Tech is a real company; this repo was a job-application project. Decided this session: **Option A**, spelling `celiadon` everywhere (logotype `celiadon`, titles/receipts `celiadon POS`, repo/folders `celiadon-pos`).
  2. UX amendments from PR #41 (`e569ba5`, merged 2026-09-22) landed after sprint planning (2026-09-18) — spines are `status: final` with AA palette, Motion, and Header rules that no story covers, and the build still ships the failing #1690E8 azure and an `sr-only` logotype.

## 1. Issue Summary

**Problem statement.** Two changes arrived mid-sprint, after `sprint-status.yaml` was generated:

- **Identity.** The product name must stop referencing Cube Tech. Affects code strings (`STORE_NAME`, Login, logotypes, `<title>`), package names, README, AGENTS.md, `_bmad/config.toml`, planning-artifact content and folder names, and user-managed infra (GitHub repo, Vercel projects).
- **Contract drift.** The 2026-09-22 UX amendments (validation-report.md: all 13 rubric findings resolved *in the spines only*) commit the build to: brand azure **#0D75C4** (AA 4.8:1 for white labels; previous #1690E8 = 3.39:1), a functional-only Motion system with a shared dialog hook and a global reduced-motion kill, and a Header that shows a visible logotype plus a compact user chip at every width. No epic or story carries any of it; `client/tailwind.config.js:17` and `client/src/pages/Dashboard.tsx:65` still hold #1690E8; `App.tsx:132` and `NavDrawer.tsx:92` still hide the logotype `sr-only`; `prefers-reduced-motion` appears nowhere in `client/src`.

**Evidence.** `git show e569ba5` · `deferred-work.md` entry 2-3 (AA remainder) and 5-2 (shared dialog hook) · review-rubric.md high finding · `sprint-status.yaml` generated 2026-09-18 / last updated 2026-09-19.

**Category:** new requirement (rename) + original requirements superseded after planning (UX amendments).

## 2. Impact Analysis

### Epic impact

| Epic | Impact |
|---|---|
| 1 — One app | **Modified.** Story 1.1's AC ("exact hex values in DESIGN.md frontmatter") is self-violating until the config matches the amended DESIGN. Two new stories (rename, AA sweep). |
| 2 — Catalog | None. |
| 3 — Sales | Value of `STORE_NAME` changes via Story 1.7; Story 3.4 mechanics unchanged. |
| 4 — Dashboard | Story 1.8 touches Dashboard's cash series hex only. |
| 5 — Responsive | **Modified.** Story 5.1 amended (Header identity reversal); new Story 5.5 (Motion + shared dialog hook). |

No new epic. No epic obsolete. No resequencing — new stories enter as `backlog`.

### Story impact

- **NEW 1.7** Rebrand to celiadon (first — so later stories don't write old strings)
- **NEW 1.8** Apply the AA palette correction (closes deferred-work 2-3)
- **AMEND 5.1** +2 AC: visible logotype; compact user chip
- **NEW 5.5** Motion system and shared dialog hook (also closes deferred-work 5-2)
- **NEW UX-DR33** (motion) and **UX-DR34** (header identity) + coverage-map lines

### Artifact conflicts

| Artifact | Conflict | Resolution |
|---|---|---|
| PRD | None exists (SPEC is the requirements source) | N/A |
| SPEC.md | Open Question answer hardcodes `"Cube Tech POS"` | → `"celiadon POS"` |
| ARCHITECTURE-SPINE.md | frontmatter `name`, heading, tree label, sources paths | text edits; no AD/API/schema conflict — motion is CSS-only per DESIGN |
| DESIGN.md / EXPERIENCE.md / mockup | frontmatter `name`, headings, logotype refs (DESIGN:103, :241), `STORE_NAME` value (EXPERIENCE:223) | rename strings only; Motion/Header/AA content already final |
| epics.md | title, UX-DR1 stale hexes (#1690E8), `sources` paths | text edits + new stories |
| `_bmad-output` folders | `architecture-cube-tech-pos-*`, `ux-cube-tech-pos-*` | rename + fix all inbound references |
| `_bmad/config.toml` | `project_name = "cube-tech-pos"` | → `"celiadon-pos"` |
| AGENTS.md, README | name references | sweep; AGENTS.md via `bmad-project-context` refresh after |
| package.json ×3 | `pos-system` / `pos-client` / `pos-server` | → `celiadon-pos` / `celiadon-client` / `celiadon-server` |
| sprint-status.yaml | missing new stories | add 3 backlog entries |
| User-managed | GitHub repo name, 2 Vercel project names, client redeploy (`VITE_API_URL` build-time) | manual, sequenced after 1.7 merges |

### Technical impact

No stack change, no new dependencies (motion = CSS/Tailwind only; DESIGN bans an animation library), no schema/API impact. Both builds must stay green (NFR9).

## 3. Recommended Approach

**Option 1 — Direct Adjustment.** ✅
- Effort: **Low-Medium** · Risk: **Low** · Timeline: fits the remaining polish phase
- Add/modify stories inside existing epics; mechanical doc sweep.

**Option 2 — Rollback — rejected.** Nothing completed needs reverting; rolling back in-review stories would churn 23 items for zero behavioral delta.

**Option 3 — MVP review — N/A.** No MVP scope pressure (portfolio project); goals unchanged.

**Rationale.** The change is additive and text-level. The binding spines already carry the amended contract; the backlog just doesn't know it yet. Direct adjustment preserves momentum and keeps all acceptance history in place.

**Recommended sequence:** Story 1.7 → 1.8 → amend 5.1 → Story 5.5 → doc/folder rename sweep → AGENTS.md refresh → user-side repo/Vercel rename.

## 4. Detailed Change Proposals

### A1 — NEW Story 1.7: Rebrand to celiadon (Epic 1)

**As** a recruiter opening the demo,
**I want** the product to present as celiadon,
**So that** the portfolio piece doesn't borrow a real company's identity.

**Acceptance Criteria:**

**Given** every surface and artifact currently reads some form of Cube Tech / cube-tech
**When** the rebrand lands
**Then** `STORE_NAME = 'celiadon POS'` in `client/src/lib/api.ts`, Login H1 renders `celiadon POS`, logotype strings in `App.tsx` and `NavDrawer.tsx` render `celiadon` (no "POS" — per Header spec), and `client/index.html` `<title>` reads `celiadon POS`
**And** package names become `celiadon-pos`, `celiadon-client`, `celiadon-server`
**And** `_bmad/config.toml` sets `project_name = "celiadon-pos"`; README and the AGENTS.md managed block carry celiadon only
**And** planning artifacts read celiadon in content (`SPEC.md` Open Question answer → `"celiadon POS"`; DESIGN/EXPERIENCE/mockup names, headings, logotype refs; ARCHITECTURE frontmatter/heading/tree; epics title + sources paths) and folders `architecture-cube-tech-pos-*` / `ux-cube-tech-pos-*` are renamed to `celiadon-pos` equivalents with all inbound references updated
**And** a repo-wide search finds zero remaining `Cube Tech` / `cube-tech` strings outside `.git` and this proposal
**And** `cd server && npx tsc --noEmit` and `cd client && npm run build` both succeed

*Rationale: identity work belongs to Epic 1 (one product); must land before Motion/Header stories mint new strings.*

### A2 — NEW Story 1.8: Apply the AA palette correction (Epic 1)

**As** a cashier under fluorescent light,
**I want** primary-button and nav labels that meet WCAG AA,
**So that** the azure brand color doesn't fail contrast on every filled control.

**Acceptance Criteria:**

**Given** DESIGN.md commits `primary` #0D75C4 and `primary-hover` #0A6BB4 while `tailwind.config.js` still carries #1690E8
**When** the correction is applied
**Then** `brand.DEFAULT` = #0D75C4, `brand.hover` = #0A6BB4, and `ring` + the Dashboard revenue/cash series (`Dashboard.tsx:65`) track the new azure
**And** a repo-wide sweep finds zero `#1690E8` literals in client CSS/classes/config
**And** white-on-primary computes ≥ 4.5:1; `text-muted` on canvas and `text-subtle` on surface are spot-verified against the AA floor in EXPERIENCE.md Accessibility Floor, and any pair that fails is fixed as a palette token (not per component)
**And** `cd client && npm run build` succeeds

*Closes deferred-work.md entry 2-3; retroactively satisfies Story 1.1's "exact hex values in DESIGN.md frontmatter" AC.*

### A3 — AMEND Story 5.1: Collapse the nav to a hamburger on small screens (Epic 5)

**Append two Acceptance Criteria:**

**And** the header logotype is **visible** at every width (removed from `sr-only`), rendering `celiadon` beside the accent logo mark — no longer hidden below any breakpoint
**And** a compact user chip renders right-aligned at every width: role always visible, email at `sm` and up, behind a 1px `border-on-ink` divider with caption-scale `text-on-ink`; the hamburger drawer keeps the full `email · role` meta and Sign out unchanged

*Rationale: DESIGN.md:241 + EXPERIENCE.md Header row (2026-09-22) deliberately reversed the old hide-below-md rule; Story 5.1 predates it.*

### A4 — NEW Story 5.5: Motion system and shared dialog hook (Epic 5)

**As** a cashier mid-transaction,
**I want** fast, functional feedback when panels open and controls press,
**So that** the interface acknowledges me without ever delaying the sale.

**Acceptance Criteria:**

**Given** DESIGN.md Motion specifies functional-only motion and three dialogs (Modal, NavDrawer, CartDrawer) each carry their own focus-trap copy
**When** the motion system ships
**Then** durations are 120ms (fast: hover/press/color) / 200ms (base: overlay enter, loading pulse) / 250ms (max — nothing moves slower), enter ease-out, exit ease-in, no springs or overshoot
**And** only `transform`, `opacity`, `color`, and `background-color` animate — no layout properties, `box-shadow`, or `filter`
**And** one shared dialog hook owns enter/exit **and** focus trap/Escape/focus-return for Modal, NavDrawer, and CartDrawer: drawers translate from their edge (left / bottom), Modal fades with the scrim, exit faster than enter — eliminating the third focus-trap copy (closes deferred-work 5-2)
**And** interactive controls may use `active:scale-[0.98]` over fast (Button, POS tiles, category chips, nav pills) — transform only
**And** StatCard and ChartPanel loading placeholders use `animate-pulse`
**And** a single global `prefers-reduced-motion: reduce` rule in `index.css` kills all animation and transition duration outright; no component overrides it
**And** banned: page/route transitions, list/table row animation on filter, sale celebrations, parallax, scroll-jacking, skeleton shimmer gradients, decorative motion; panels accept input on the first frame
**And** `cd client && npm run build` succeeds

*New requirements: UX-DR33 (motion), UX-DR34 (header identity — paired with A3) added to epics.md inventory + coverage map (Epic 5).*

### B — Doc text edits (bundled with A1 unless noted)

| File | Edit |
|---|---|
| `SPEC.md` Open Questions | `"Cube Tech POS"` → `"celiadon POS"` |
| `epics.md` | title/overview → celiadon; UX-DR1 hexes → #0D75C4 / #0A6BB4 (**independent of rename — belongs to A2**); sources paths |
| `DESIGN.md` | frontmatter name, heading, :103, :241 logotype → `celiadon` |
| `EXPERIENCE.md` | frontmatter name, heading, :223 STORE_NAME → `"celiadon POS"` |
| `ARCHITECTURE-SPINE.md` | frontmatter name, heading, tree label, sources paths |
| mockup `pos-key-screen.html` | `<title>` + logotype → celiadon |
| folder renames | `architecture-cube-tech-pos-2026-09-16` → `architecture-celiadon-pos-2026-09-16`; `ux-cube-tech-pos-2026-09-17` → `ux-celiadon-pos-2026-09-17` + inbound refs |
| `sprint-status.yaml` | add `1-7-rename: backlog`, `1-8-aa-palette: backlog`, `5-5-motion: backlog`; bump `last_updated` |

### C — User-side (manual, post-merge of Story 1.7)

1. Rename GitHub repo → `celiadon-pos` (redirects preserve clones until remotes update).
2. Rename both Vercel projects (Root Directory `server` and `client`).
3. Redeploy client (reads `VITE_API_URL` at build time).
4. `bmad-project-context` refresh so AGENTS.md's managed block verifies against the new state.

## 5. Implementation Handoff

**Scope: Moderate** → route to **PO/Developer** (this session's operator).

| Responsibility | Owner |
|---|---|
| Approve proposal, own naming/infra decisions | PO (user) |
| Implement A1→A2→A3→A4 via `bmad-build` (one story per fresh context) | Developer |
| Doc/folder sweep bundled with A1; sprint-status sync each story (bmad-build does this) | Developer |
| GitHub/Vercel renames + AGENTS.md refresh | User + Developer (post-merge) |

**Success criteria:**
- Zero `Cube Tech`/`cube-tech` strings in live content outside `.git` and this proposal
- Zero `#1690E8` literals; white-on-primary ≥ 4.5:1
- Visible `celiadon` logotype + user chip at every width; shared dialog hook is the only focus-trap implementation; global reduced-motion kill present
- `npx tsc --noEmit` and `npm run build` green
- `sprint-status.yaml` reflects 1-7, 1-8, 5-5 and the 5.1 amendment

**Next action:** run `bmad-build` for **Story 1.7 (Rebrand to celiadon)** in a fresh context window.
