# Spine Pair Review — celiadon-pos

## Overall verdict
The pair extracts cleanly on mechanics and shape: all 62 prose token references resolve, all 74 frontmatter tokens are type-valid with no missing hex, canonical section order is intact, and the 2026-09-22 amendments (Motion, shared dialog hook, reduced-motion floor, reversed user-meta rule) are cross-wired consistently — except the Header spec, which landed on DESIGN only. It is not yet a clean contract: 1 high finding (no stated contrast target; the committed white-on-primary button pair computes 3.39:1, below AA), 8 medium coverage/discipline misses, 4 low. Fix the high and the Header/NavDrawer pairing gaps before story-dev treats this folder as frozen; the rest can ride as known findings.

## 1. Flow coverage — adequate
Sources frontmatter → SPEC.md capabilities CAP-1…CAP-9 and ARCHITECTURE-SPINE `binds` (same list); scope line (EXPERIENCE.md:12) commits the spines to CAP-2/3/4/5/6/9. Extracted all 3 Key Flows; verified each has a named protagonist, numbered steps, an explicit **Climax** beat, and a **Failure** path; mapped each in-scope capability to at least one flow (CAP-2 → Flows 2–3 search/filter; CAP-3 → Flow 1:163; CAP-4 → Flow 2; CAP-5 → Flows 2–3; CAP-6 → Flow 1:165; CAP-9 → Flow 1 whole). Flow structure itself is complete — 3/3 protagonists, 3/3 climax beats, 3/3 failure paths.

### Findings
- **low** Flows carry no requirement names — CAP ids appear only in the scope line (EXPERIENCE.md:12), never in flow headings (EXPERIENCE.md:159, 169, 179), so a mechanical source-extract must infer the requirement→flow binding. *Fix:* tag each flow heading with its CAP id(s), or add a one-line mapping under Key Flows.
- **low** CAP-2's category CRUD half (IA "Categories" modal, EXPERIENCE.md:31 — create, rename, delete) appears in no Key Flow; only search and filter sides are walked (EXPERIENCE.md:173, 184). *Fix:* add a category step to Flow 3, or record explicitly that category CRUD is covered by State/Interaction rules only.

## 2. Token completeness — adequate
Extracted every frontmatter token — 36 colors, 10 typography, 3 rounded, 6 spacing, 19 components — and every prose reference (55 in DESIGN, 7 in EXPERIENCE). All 62 resolve; all colors are plain 6-digit hex; typography entries use only the spec's allowed fields (`mono`/`receipt` fontFamily stacks are valid); rounded/spacing/components match design-md-spec.md type rules. Contrast was checked by computing the load-bearing pairs.

### Findings
- **high** No contrast target is stated for load-bearing combinations, and the canonical committed pair fails AA: Accessibility Floor (EXPERIENCE.md:122–135) has no text-contrast requirement and DESIGN states no ratios anywhere. `button-primary` and `nav-active` (DESIGN frontmatter :48, :64) render `{colors.surface}` white on `{colors.primary}` #1690E8 = **3.39:1**, below 4.5:1 for 14px labels; `{colors.text-muted}` on `{colors.canvas}` = 4.46:1 and `{colors.text-subtle}` on surface = 3.05:1 are also unstated risks. Badge pairs (6.4–6.8:1), white-on-success (4.96), white-on-danger (4.83), and accent-on-ink (12.6) all pass — only the primary button is committed-and-failing. *Fix:* add one AA 4.5:1 floor line to the Accessibility Floor, and use `{colors.primary-strong}` (#0B5EA6, 6.63:1) — or a darkened primary — for filled-button/nav-pill labels.
- **medium** Header spec escapes the token set with literal Tailwind classes: `border-slate-700` and `text-slate-300` (DESIGN.md:239) resolve to no frontmatter token, contradicting "every surface references tokens rather than literals" (DESIGN.md:128). *Fix:* define `border-on-ink` / `text-on-ink` color tokens (or map to existing ink-ramp tokens) and reference them by name.
- **low** The one stated contrast claim is imprecise: "Cyan-on-white fails below large-headline sizes" (DESIGN.md:111) implies large sizes pass; #02F0FD on white is 1.41:1 and fails 3:1 at every size. The derived rule (accent never on white) is safe, so downstream impact is wording only. *Fix:* reword to "fails at any size."

## 3. Component coverage — thin
Extracted every component name used anywhere in the pair — inherited (`Button`, `Badge`, `Table`, `Modal`, `Toast`, `LoadingSpinner`), new (SearchInput, FilterSelect, Category chips, CartDrawer, Header, PaymentMethodControl, StatCard, ChartPanel, DateRangeBar, ReceiptView, EmptyState), plus NavDrawer and the cart summary bar — and tested each for an entry in DESIGN.md Components (visual) AND a row in EXPERIENCE.md Component Patterns (behavioral). 11 of 13 new components pair cleanly with substantive rules on both sides; the gaps below are all in the amendment surface and the inherited set.

### Findings
- **medium** Header exists only on one side of the pair: full visual bullet in DESIGN.md:239, but no Component Patterns row in EXPERIENCE.md:72–86 — its behavior lives only in Responsive (EXPERIENCE.md:145, 149). The 2026-09-22 amendment applied Header to DESIGN but not to Component Patterns. *Fix:* add a Header row (hamburger below `lg`, chip role/email tiers, drawer keeps full meta + Sign out).
- **medium** NavDrawer has an EXPERIENCE row (EXPERIENCE.md:78) but no DESIGN Components entry — DESIGN mentions it only inside Motion (DESIGN.md:223); no visual spec (scrim, edge, chrome surface) is committed. *Fix:* add a Components bullet, or state explicitly "inherited visuals, unchanged."
- **medium** `Button`, `Badge`, `Toast`, `LoadingSpinner` have no Component Patterns rows (the table at EXPERIENCE.md:72–86 covers only Table and Modal of the inherited set), so the designated behavioral section does not extract completely; their rules are scattered across A11y (EXPERIENCE.md:134), States (EXPERIENCE.md:96), and Motion (DESIGN.md:224). *Fix:* add four one-line "Unchanged — see source" rows, matching the Table/Modal precedent.
- **medium** The cart summary bar is load-bearing (CAP-9 success, Flow 1:162–165, Elevation pin layer DESIGN.md:190) and has a frontmatter token (`components.bottombar`, DESIGN.md:65), but no DESIGN Components anatomy and no own Component Patterns row — behavior is folded into the CartDrawer row (EXPERIENCE.md:77) — and it is named four ways. *Fix:* promote it to a named component with one row per spine.

## 4. State coverage — adequate
Walked all 10 IA surfaces (EXPERIENCE.md:26–38) against applicable states: the universal five-state table (EXPERIENCE.md:94–100) covers loading/cold-load, empty (both flavors), error, and partial/stale for every surface; six surface-specific states are named (EXPERIENCE.md:104–109); focus is covered globally in the Accessibility Floor (EXPERIENCE.md:127); offline is explicitly out of scope with a rationale (EXPERIENCE.md:155) — a defensible drop. Token-expiry (session loss) is named.

### Findings
- **medium** Permission-denied is unspecified. The IA asserts a Roles column per surface and Foundation says off-role surfaces "are not reachable" (EXPERIENCE.md:20), but nothing states what a direct URL hit renders (cashier → `/reports`), while SPEC CAP-1's success criterion requires cashiers cannot access reports (SPEC.md:19). *Fix:* add one State Patterns row — redirect to the role's landing surface vs. denial message — so RBAC UX is committed.

## 5. Visual reference coverage — strong
Enumerated the workspace: `mockups/pos-key-screen.html` (only file), `wireframes/` (absent), `imports/` (empty), `.working/` (empty). The single mockup is linked inline at its relevant section (DESIGN.md:130, Colors), names what it illustrates (token application to POS desktop cart column, mobile drawer and bottom bar, vocabulary strip), disclaims layout-contract status, and states the conflict rule. Spines-win-on-conflict is stated in both files (DESIGN.md:130; EXPERIENCE.md:12, 43, 218). No orphans; no unspecific references.

### Findings
- **low** EXPERIENCE.md:43 "→ No mocks in this run" is stale — `mockups/pos-key-screen.html` exists in the folder and is linked from DESIGN.md:130. *Fix:* reword to "One color/POS reference mockup (linked from DESIGN); no composition mocks."

## 6. Bloat & overspecification — strong
Checked for pixel specs where tokens cover (Motion ms values have no frontmatter type in design-md-spec.md, so the prose table is the right home; icon px sizes are decisions, not token restatements), source restatement, prose-where-table-works, unread sections, and decorative narrative. DESIGN carries editorial voice as permitted; EXPERIENCE prose is uniformly decision-tied (no editorializing outside the scenario flavor the flow examples themselves use). The glow-ban repetition is documented as deliberate in `.memlog.md:37`. Motion, Icons, and Open Items each earn their place for a downstream consumer.

### Findings
No findings.

## 7. Inheritance discipline — adequate
Verified: both `sources` frontmatter paths resolve to SPEC.md and ARCHITECTURE-SPINE.md; `Story 5.1` resolves (`planning-artifacts/epics.md:558`); all 7 EXPERIENCE token references resolve to DESIGN tokens by name (`typography.numeric-lg`, `typography.section`, `colors.ring/surface/canvas/ink/accent`); component names are identical across all sections of both files (Category chips, CartDrawer, PaymentMethodControl, StatCard, ChartPanel, DateRangeBar, ReceiptView, EmptyState, SearchInput, FilterSelect, NavDrawer); shared rule vocabulary (shared dialog hook, reduced-motion kill, `formatCurrency()`, `stockTone()`, spine-wins) is consistent across both spines and matches the 2026-09-22 memlog amendments.

### Findings
- **medium** "The Tailwind 4-based scale" (DESIGN.md:158) contradicts every source: ARCHITECTURE-SPINE stack says `Tailwind CSS ^3.4` (ARCHITECTURE-SPINE.md:143), `client/package.json` pins `^3.4.10`, and DESIGN's own frontmatter/body describe `tailwind.config.js theme.extend` (DESIGN.md:3, 107) — a 3.x pattern. A consumer could conclude TW4 CSS-first config is in scope. *Fix:* change to "The Tailwind 3.4 scale".
- **medium** Flow 3's protagonist is "Priya, owner" (EXPERIENCE.md:179), but the role model is exactly three roles — `admin`, `manager`, `cashier` (EXPERIENCE.md:20; SPEC.md:18) — and "owner" appears nowhere in the sources' glossary. Reads as a fourth role. *Fix:* "Priya, admin (owner-operator)" or "Priya, admin".

## 8. Shape fit — strong
DESIGN.md section order verified: Brand & Style → Colors → Typography → Layout & Spacing → Elevation & Depth → Shapes → **Motion** (invented, between locked anchors) → Components → **Icons** (invented, between locked anchors) → Do's and Don'ts — all 8 canonical sections present, in order, none dropped. Both invented sections earn their place: Motion is the load-bearing home for the shared-dialog-hook rule, duration tokens, and the reduced-motion kill; Icons binds CAP-7's lucide-react dependency and is cross-referenced from ARCHITECTURE-SPINE.md:145. EXPERIENCE.md contains all 8 required defaults (Foundation, Information Architecture, Voice and Tone, Component Patterns, State Patterns, Interaction Primitives, Accessibility Floor, Key Flows); nothing omittable was dropped. Required-when-applicable both trigger and both present: Responsive & Platform (multi-surface + CAP-9 breakpoints, EXPERIENCE.md:137) and Inspiration & Anti-patterns (Square/Toast/Shopify references in DESIGN/memlog; 7 recorded rejects, EXPERIENCE.md:189). Open Items earns its place as the SPEC-gap/assumption trail (receipt reprint flagged for CE).

### Findings
No findings.

## Mechanical notes
- **Frontmatter:** both files complete — `name`, `status`, `sources`, `updated: 2026-09-22`; DESIGN adds `description` and all five token blocks. Token counts: 36 colors / 10 typography / 3 rounded / 6 spacing / 19 components (`.memlog.md:29` still says 31/16/10 — stale count, predates the palette revision at memlog line 31; not load-bearing).
- **Cross-references:** no broken refs found. 55/55 DESIGN prose `{…}` refs resolve; 7/7 EXPERIENCE refs resolve; `Story 5.1` → `planning-artifacts/epics.md:558`; mockup path resolves; `DESIGN.md Motion` / `DESIGN.md.Components` pointers resolve. No Mermaid in either spine (syntax check n/a).
- **Name inconsistencies:** the cart summary element is called "bottom bar" (EXPERIENCE.md:150, 162), "cart summary bar" (DESIGN.md:190, EXPERIENCE.md:207), "mobile cart-bar" (DESIGN.md:169), and token `bottombar` (DESIGN.md:65); `stockTone()` (DESIGN.md:275, EXPERIENCE.md:88) vs bare `stockTone` (EXPERIENCE.md:191); role "owner" (see §7).
- **Stale lines:** EXPERIENCE.md:43 "No mocks in this run" (see §5); EXPERIENCE.md:218 "Next: `bmad-create-epics-and-stories`" — `planning-artifacts/epics.md` and implementation-artifacts already exist, so the pointer has been consumed.
- **Internal slip:** DESIGN.md:169 — "On wide screens a key number — … the mobile cart-bar total" — the cart bar only exists below `lg`; intent (key money numbers on navy) is otherwise consistent with CartDrawer/Elevation.
- **Orphans/empty dirs:** `imports/` and `.working/` exist but contain no files; `wireframes/` does not exist — nothing to link, no orphans.
- **Defined-but-prose-unreferenced tokens** (fine for machine consumption; invisible to a prose-only extractor): `primary-hover`, `success-hover`, `accent-ink`; components `button-primary/commit/destructive/secondary`, `badge-*`, `table-shell`, `table-head`, `modal-shell`, `nav-active`, `bottombar` (range mentions cover `chart-2..4`).
