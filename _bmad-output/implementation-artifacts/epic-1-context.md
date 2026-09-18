# Epic 1 Context: The product looks and behaves like one app

<!-- Compiled from planning artifacts. Edit freely. Regenerate with compile-epic-context if planning docs change. -->

## Goal

Unify every already-shipped surface onto one visual system — named azure/teal/cyan palette on navy chrome, a single icon library, and a shared accessibility floor — before any feature work, so later epics build on one design language instead of re-churning the same components, pages, and app shell six times.

## Stories

- Story 1.1: Adopt the palette tokens in the Tailwind config
- Story 1.2: Install lucide-react and replace the close glyph
- Story 1.3: Migrate the shared components to the palette
- Story 1.4: Migrate the pages and app shell to the palette
- Story 1.5: Hold the accessibility floor on every shipped surface
- Story 1.6: Prove auth, roles, and shared types still hold after the retrofit

## Requirements & Constraints

- No new user-facing features in this epic; auth and shared types are verify-only since they already ship. Verification must prove: anonymous visitors reach only Login; valid credentials yield a working session; invalid credentials get one generic error; only admins can register users; expired/malformed tokens clear the session and return to Login with no half-authorized render; cashiers land on POS while admins/managers land on Dashboard; nav and route guards stay role-filtered.
- Every reusable UI pattern must exist in the shared components directory with no page inlining its own modal or table; component public props and behavior must not change during the color migration.
- Client and server interfaces stay declared once in the shared types file; all displayed money renders through the single currency formatter. Existing API contracts must not break.
- Both packages must compile clean after every story (server typecheck, client build); no new type or unused-import errors. Verification is typecheck plus build plus manual pass — no test framework is added in this phase.
- Only free tools and tiers; the only new runtime dependency permitted in this epic is the icon library. No state-management, date, PDF, second UI kit, or second icon library.
- No raw hex or arbitrary color values on any surface; no surface may reference the old raw indigo/gray utilities after migration. Dark mode is out of scope — do not add dark variants.
- Secrets stay out of the repo (database URL and JWT secret from env); demo credentials must not be weakened or multiplied.

## Technical Decisions

- Define the palette once as named tokens in the Tailwind config extension (brand azure family, cyan accent family, teal, deep-teal commit family, navy ink, canvas/panel surfaces, line/border grays, slate text ramp, amber/red status fills). Every surface references tokens; a hue change is a one-file config edit.
- Do the migration in a single pass per layer — tokens and config first, then components, then pages plus app shell — because the same class strings span all six shipped components, all five pages, and the app shell. Splitting it across feature epics would rewrite the same files repeatedly.
- Use one icon library for everything with inherited currentColor, small fixed sizes (compact beside captions, medium in buttons/inputs, large standalone), and the library default stroke. Ban emoji, Unicode glyphs, hand-written inline SVG, and icon fonts as icons.
- Keep the established layering: pages compose extracted components, auth state lives in a top-level context with the token in local storage sent as a Bearer header, and role filtering derives from a single nav table. The mass class rewrite must not alter route behavior.
- New shared EmptyState component replaces ad-hoc inline empty paragraphs so grids and panels share one empty-surface pattern; stock badges everywhere go through the single quantity-to-tone rule rather than hand-picked colors.

## UX & Interaction Patterns

- Color meaning: azure marks interactivity and the active nav item only, never status; deep teal owns the commit action and healthy stock; amber means at/below reorder level; red means out of stock or destructive; slate carries text hierarchy. Cyan appears flat on navy chrome only (logo mark, key numerals, dark-surface focus), never as body text on white.
- No glow, neon, bloom, or colored shadow anywhere; the only shadow is a short neutral gray. Emphasis on navy comes from flat cyan plus size and weight.
- Type discipline: heavy large numerals for stat values and cart totals with tabular figures; uppercase caption-scale letter-spaced table heads; monospace reserved for identifiers and receipts, never general UI.
- Accessibility floor on every surface: visible 2px focus ring never removed (azure on light, cyan on navy); every input has a programmatically linked label; overlays close on Escape, trap focus while open, and return focus to the opener with at most one level of stacking; icon-only controls carry accessible labels and at least 44px touch targets on POS surfaces; toasts announce via live status role with mandatory error toasts for failed mutations.
- Every surface handles five states — loading scoped to its own area, empty with no data, empty from filtering (visually distinct, never offering a create action), error preserving prior good data, and partial/stale — with one primary action per surface and sentence-case, exclamation-free, emoji-free microcopy that names concrete counts and server-given failure causes.

## Cross-Story Dependencies

- Token definition is the prerequisite for both migration stories; component migration precedes page/shell migration so pages compose already-migrated components without rework.
- Icon installation precedes component migration touching the close control; the accessibility story builds on the migrated components and pages; the final regression story requires all prior stories and gates the epic.
- This epic blocks all feature epics: later search, payment, chart, and responsive work assumes the token names, icon library, EmptyState, and focus/overlay/toast behaviors already exist.
