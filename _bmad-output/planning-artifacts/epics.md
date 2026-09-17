---
stepsCompleted: [1]
inputDocuments:
  - _bmad-output/specs/spec-pos-transformation/SPEC.md
  - _bmad-output/architecture/architecture-cube-tech-pos-2026-09-16/ARCHITECTURE-SPINE.md
  - _bmad-output/planning-artifacts/ux-designs/ux-cube-tech-pos-2026-09-17/DESIGN.md
  - _bmad-output/planning-artifacts/ux-designs/ux-cube-tech-pos-2026-09-17/EXPERIENCE.md
---

# cube-tech-pos - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for cube-tech-pos, decomposing the requirements from the SPEC, the Architecture Spine, and the UX design contract into implementable stories.

**Input set.** No PRD exists for this project. `SPEC.md` (9 capabilities, each with `intent` and `success`) is the requirements source, and it holds no numbered FRs - the FRs below are derived from each capability's `success` statement plus the SPEC's Constraints and Non-goals. The architecture spine and both UX spines are `status: final` and binding; SPEC lives outside `planning-artifacts/`, which is why all three are listed explicitly above.

**Brownfield, not greenfield.** There is no starter template. `client/` and `server/` are existing packages with their own `package.json` and `node_modules`, the stack is already chosen and shipped, and eight of the nine capabilities are partially built. Epic 1 Story 1 is therefore not a scaffold story.

### Capability status at branch point (verified against shipped code, commit 5956b50)

This matters for slicing: verification and retrofit stories must not be written as if they were build-from-scratch.

| Capability | Status | What that means for stories |
|---|---|---|
| CAP-1 Auth + RBAC | **Shipped** | Verify-only. No build story. |
| CAP-8 Shared types | **Shipped** | Verify-only. |
| CAP-7 Component library | **6 of 8 components shipped** | Add the missing components; do not rebuild the existing six. |
| CAP-3 Payment methods | **Backend only** - schema field + validation exist, zero client usage | Frontend story + API wiring. |
| CAP-5 Stock alerts | **Schema only** - `stock_movements` table and `reorder_level` exist, no routes, no UI | Routes + UI. |
| CAP-6 Receipts | **Partial** - transaction detail exists, no receipt view or print | Receipt view + print styles. |
| CAP-2 Categories + search | **Schema + partial API** - categories table exists, **no search anywhere in any route** | Search + filtering UI and API, category CRUD UI. |
| CAP-4 Analytics | **Absent** - Recharts not installed, no chart code | Full build; must add the dependency. |
| CAP-9 Responsive | **Partial** - some responsive classes, no drawer, no hamburger, no breakpoint discipline | App-wide rules, not a per-page tweak. |

### Two app-wide retrofit workstreams that must not be lost

These span every shipped surface and are the easiest requirements to forget, because each individual offender looks trivial. They are captured as UX-DR2 and UX-DR3 below and should be sliced as their own stories.

1. **Palette migration.** Every shipped page and component still uses raw `bg-indigo-*` and `text-gray-*` classes. The adopted palette is azure/teal/cyan on navy chrome, and it ships as named tokens in `tailwind.config.js`. Until the retrofit lands, the product is two visual systems wearing one name.
2. **Icon library.** `lucide-react` is the mandated single icon library and is **not installed**. The only icon in the codebase today is a Unicode `✕` glyph in `Modal.tsx`. Emoji and Unicode glyphs are banned as icons.

## Requirements Inventory

### Functional Requirements

```
FR1: Unauthenticated visitors can reach only the Login page; every other route redirects to Login when no valid JWT is present.
FR2: A user signs in with email and password; valid credentials return a JWT that grants access until expiry.
FR3: Invalid credentials are rejected with a single generic error that does not reveal whether the email or the password was wrong.
FR4: Navigation and route guards are filtered by role, so a cashier cannot reach Dashboard, Inventory, Reports, or Stock Movements.
FR5: Only an admin can create new users; a non-admin request to register is rejected with 403.
FR6: An expired or malformed token clears the stored session and returns the user to Login without rendering a partially authorized page.
FR7: A cashier lands on Point of Sale after sign-in; admin and manager land on Dashboard.
FR8: A product belongs to at most one category, displays that category as a badge in Inventory, and can be filtered by it.
FR9: An admin or manager can create, rename, and delete categories; deleting a category that still has products is refused with a specific error rather than orphaning products.
FR10: Inventory search returns products whose name matches the query, case-insensitively, in under 200ms.
FR11: Inventory applies search and category filter simultaneously as AND, and exposes a clear-filters action whenever either is non-default.
FR12: The POS product grid can be filtered by category without issuing a new request.
FR13: The POS product grid can be searched by product name.
FR14: The checkout block exposes a payment method control with exactly three options - cash, card, e-wallet - defaulting to cash.
FR15: The selected payment method is persisted on the sale record and returned by the sales API.
FR16: A transaction's payment method is displayed as text wherever the transaction is shown.
FR17: Revenue can be broken down by payment method for a chosen date range.
FR18: Dashboard shows revenue as a line chart with a daily / weekly / monthly toggle.
FR19: Dashboard shows the top 5 products by units sold as a bar chart.
FR20: Dashboard shows the payment-method breakdown as a pie chart.
FR21: Dashboard shows key metrics: total revenue, average transaction value, and today's sales count.
FR22: A single date range control filters every chart and metric on a reporting surface together, and its range is inclusive of both endpoints.
FR23: A date range with no sales renders an explicit "No sales in this range" message inside each chart panel instead of an empty axes box.
FR24: Every stock quantity change writes a stock_movements row recording the product, type (sale / restock / adjustment / return), quantity, reason, the user responsible, and a timestamp.
FR25: A product with quantity above zero at or below its reorder_level shows a low-stock warning badge; a product at or below zero shows out of stock. The numeric quantity is always visible alongside the state.
FR26: A Stock Movements surface lists quantity changes with who, why, and when, and can be filtered by product and by movement type.
FR27: Dashboard shows a low-stock callout reporting the count of products at or below reorder level, which navigates to Inventory with the low-stock filter already applied.
FR28: Completing a sale decrements stock and records a sale movement within one transaction; a sale that lacks sufficient stock is rejected and rolled back entirely, leaving stock unchanged.
FR29: An admin or manager can restock or adjust a product quantity with a reason, and the resulting movement is attributed to that user.
FR30: A sale produces a viewable receipt showing store name, receipt number, date and time, line items with quantity and unit price, subtotal, total, payment method, and cashier.
FR31: The receipt exposes a Print action that opens the browser print dialog showing only the receipt, with no navigation, cart, or other app chrome.
FR32: A receipt can be reopened from transaction history and reprinted.
FR33: Every reusable component the UX contract specifies exists in `client/src/components/`, and no page inlines its own modal or table implementation.
FR34: All client and server interfaces are declared once in `shared/types.ts` and imported by both packages, so changing a type breaks compilation in both.
FR35: Below 768px the navigation collapses to a hamburger that opens a drawer containing the role-permitted items, the user's email and role, and Sign out.
FR36: Below 1024px the POS cart is reached through a drawer triggered from a fixed summary bar that always shows item count and total; the cart is never unreachable.
FR37: Dashboard and Reports stack to one column below 768px, and tables scroll horizontally rather than dropping columns.
FR38: Cart contents survive category filtering and drawer open/close within POS; only a completed sale or an explicit removal empties the cart.
```

### NonFunctional Requirements

```
NFR1: Product search returns results in under 200ms.
NFR2: Every database query uses parameterized placeholders ($1, $2, $3) with a params array. No value is ever interpolated into a SQL string.
NFR3: There is no ORM. Access is raw SQL through pool.query(). Multi-table writes use an explicit BEGIN / COMMIT / ROLLBACK on a single pooled connection and always call client.release().
NFR4: Multi-step writes - sale creation, stock decrement, and movement insert - are atomic. A partially written sale must be impossible.
NFR5: Currency is USD everywhere, stored as decimal(10,2), and rendered only through formatCurrency() from client/src/lib/api.ts. The pg numeric type is kept as a JS number by the type parser in server/db.ts rather than the pg default string.
NFR6: The existing API routes (/api/products, /api/sales, /api/dashboard) keep their contracts. Existing consumers must not break.
NFR7: Only free tools, free tiers, and free services. No paid API, library, or hosting tier may become required.
NFR8: Every endpoint except login is behind auth middleware; product and category writes require the admin or manager role. /auth/register is admin-only.
NFR9: Both packages compile clean: server typechecks with npx tsc --noEmit, client builds with npm run build. No unused-import or type errors are introduced.
NFR10: The dev setup is preserved - Vite on 5173 proxying /api to Express on 5000, client and server as separate packages in one monorepo.
NFR11: Accessibility floor holds on every surface: visible 2px focus ring never removed, every input programmatically label-linked, overlays close on Escape and trap focus, toasts announced via role="status", and at least 44px touch targets on POS surfaces.
NFR12: The only new runtime dependencies permitted are recharts (charts) and lucide-react (icons). No state-management library, no date library, no PDF library, no second UI kit, no icon font.
NFR13: No test framework is added in this phase. Verification is typecheck plus build plus manual pass. Testing is deferred by the SPEC.
NFR14: Secrets stay out of the repo. Server reads DATABASE_URL (or POSTGRES_URL) and JWT_SECRET from env; a missing JWT_SECRET must not be masked as a wrong-password failure.
```

### Additional Requirements

```
- No starter template. This is a brownfield retrofit of an existing monorepo: client/ and server/ each have their own package.json and node_modules. Epic 1 Story 1 is not a scaffold story - there is nothing to initialize.
- Architecture decision record is binding. AD-1 no ORM (raw SQL only) · AD-2 parameterized queries mandatory · AD-3 transaction pattern for multi-step writes · AD-4 JWT auth with role middleware · AD-5 relative /api URLs in dev, VITE_API_URL at build time in production · AD-6 shared types single source · AD-7 component extraction pattern · AD-8 USD currency everywhere · AD-9 auth context for client state · AD-10 deployment topology.
- Dependencies to install (both client-side): recharts ^2 for CAP-4 charts, lucide-react for the icon set. Neither is currently in client/package.json.
- Deployment topology: two independent Vercel projects built from this one repo - Root Directory server (Express via server/api/index.ts; server/index.ts only calls listen when run directly) and Root Directory client (Vite static build). Database is Neon PostgreSQL. server/vercel.json and client/vercel.json already exist.
- Env vars: server needs DATABASE_URL (or POSTGRES_URL) and JWT_SECRET. Client needs VITE_API_URL, read at build time, so changing it requires a client redeploy.
- Schema work already present in server/db.sql that these stories consume: users, categories, stock_movements, products.category_id, products.reorder_level (default 10), sales.payment_method. Verify against db.sql before writing migration-style work.
- Route files to extend: routes/products.ts, routes/sales.ts, routes/dashboard.ts. New route files named by the spine: routes/categories.ts, routes/reports.ts, routes/stock.ts.
- Receipt printing is browser print plus @media print CSS. No PDF library, and no print-hardware integration (SPEC non-goal).
- No barcode scanning, no payment gateway, no multi-store, no purchasing workflow - all SPEC non-goals and all out of scope for every story.
- Offline mode is out of scope. A sale requires the server; a failed sale leaves the cart intact.
- Do not edit root tsconfig.json or eslint.config.mjs - Next.js leftovers, not used by either package. public/ still holds unused Next.js/Vite SVGs; removing them and replacing the Vite favicon is optional cleanup, not a requirement.
- README.md publishes a demo admin password. Not a story, but do not weaken it further or add new published credentials.
```

### UX Design Requirements

The UX contract is a first-class input. Every item below is specific enough to carry testable acceptance criteria.

```
UX-DR1: Implement the named palette tokens in client/tailwind.config.js theme.extend: brand (azure #1690E8 + hover/strong/surface/subtle), accent (cyan #02F0FD + accent-ink), teal (#3FE0D0), commit (deep teal #0B7E71 + hover), ink (navy #0A1929), canvas (#E8EDF3), panel (#F5F8FB), line (#E0E0E0 + strong), and the slate text ramp. No surface in the app may reference a raw hex.
UX-DR2: HIGH RISK OF BEING FORGOTTEN - migrate every shipped raw color class to the named tokens: bg-indigo-*, text-indigo-*, ring-indigo-*, border-indigo-*, bg-gray-*, text-gray--*, border-gray-*, and their hover variants, across all 6 shipped components (Badge, Button, LoadingSpinner, Modal, Table, Toast) and all 5 pages (POS, Inventory, Dashboard, Transactions, Login) plus App.tsx. Until this lands the product runs two visual systems at once.
UX-DR3: HIGH RISK OF BEING FORGOTTEN - add lucide-react to client/package.json and replace the Unicode glyph currently used as the Modal close button with the lucide X component. Ban emoji, Unicode glyphs, hand-written inline SVG, icon fonts, and any second icon library. Icons render at 16px beside caption text, 20px in buttons and inputs, 24px standalone; 2px stroke (1.75 only at 24px+); always currentColor.
UX-DR4: New component SearchInput - debounced 200ms, case-insensitive, leading lucide Search icon, lucide X clear button that appears only when the field is non-empty, Escape clears the field, no submit button, result count updates in place. Used by Inventory and Stock Movements.
UX-DR5: New component FilterSelect - a native select styled to match inputs, first option always "All categories" or "All types" and selected by default, combines with search as AND (never OR). Used by Inventory and Stock Movements.
UX-DR6: New component CategoryChips (POS only) - client-side filter over the already-loaded product list, issuing no request; "All" is selected by default and exactly one chip is active at a time.
UX-DR7: New component CartDrawer - the cart below 1024px, triggered from a fixed summary bar that always shows item count and total; pinned footer on ink navy holding the total in flat cyan numerals with Complete Sale beside it; same scrim as Modal; Escape closes it; cart contents survive open and close.
UX-DR8: New component PaymentMethodControl - three segments (cash, card, e-wallet) in a brand-subtle wash, selected segment filled azure with white text, unselected segments azure-strong text only; default is cash; sits directly above Complete Sale. Text-only - no icons in the segments.
UX-DR9: New component StatCard - caption-scale label in muted slate with a tone dot, value at numeric-lg (24px / weight 800) with tabular figures; dot colors come from the fixed chart token set. The low-stock card's value stays amber and never borrows the commit color.
UX-DR10: New component ChartPanel wrapping Recharts - title at section scale, chart below, its own loading and empty state, "No sales in this range" rendered inside the frame for an empty range rather than an empty axes box, and a stable height across breakpoints so filtering does not make the page jump.
UX-DR11: New component DateRangeBar - two native date inputs plus preset chips styled like the POS category chips, inclusive of both endpoints, and an invalid range (start after end) is corrected by moving the other endpoint rather than raising an error.
UX-DR12: New component ReceiptView - renders store name, receipt number, timestamp, line items with quantity and unit price, subtotal, total, payment method, and cashier; read-only; exactly one primary action (Print); monospace body at receipt type scale; consistent with the bundled reference mock at ux-designs/ux-cube-tech-pos-2026-09-17/mockups/pos-key-screen.html.
UX-DR13: New component EmptyState - one sentence naming the state, centered, with an action only when the user can act. It replaces the current ad-hoc inline paragraph on the POS grid so every empty surface reads the same.
UX-DR14: Single stock-status rule - implement stockTone(quantity, reorderLevel) and drive every stock badge through Badge with it: red at quantity <= 0, amber when quantity <= reorder_level, teal above. Never hand-pick a color for a stock value.
UX-DR15: No glow. No neon, bloom, outer light, colored shadow, or blurred halo anywhere - remove any that exist. The only shadow is a short, low-opacity neutral gray (shadow-sm, shadow-md on POS tile hover). Emphasis on the navy chrome comes from flat cyan plus size and weight.
UX-DR16: Focus visibility - a 2px focus ring on every interactive element, never removed and never replaced by a color-only change. brand azure on light surfaces, accent cyan on the ink navy chrome, and it must be visible against both surface white and canvas blue-gray.
UX-DR17: Fix label association - every input has an htmlFor-linked label. Inventory's form currently uses bare labels and must be corrected; Login already does this properly and is the reference.
UX-DR18: Overlays behave as dialogs - Modal and CartDrawer close on Escape, return focus to the element that opened them, and keep Tab inside while open. Modal stacking stays one level deep; the receipt is a surface, not a Modal.
UX-DR19: Icon-only controls are labeled - every icon-only button (cart trigger, Modal and drawer close, quantity steppers, Print) carries an aria-label; purely decorative icons are aria-hidden. Icon-only touch targets are at least 44px.
UX-DR20: Toast announces via role="status", and error toasts are mandatory for failed mutations - a failed sale must never be silent.
UX-DR21: Breakpoint discipline app-wide - 768px is the single nav-collapse boundary (hamburger drawer carrying role-permitted items, email and role, and Sign out); 1024px is the cart-to-drawer boundary; tables scroll horizontally at every width and never drop columns, with identifiers staying in the first column.
UX-DR22: Five states specified per surface - loading, empty (no data), empty (filtered to nothing), error, and partial/stale. Loading is scoped to the surface's own area, never a full-page takeover on a filter change. The filtered-empty state must be visually and textually distinct from the no-data state and must never offer a create action.
UX-DR23: Mutations refresh what they invalidated - completing a sale updates stock in the POS grid without a full re-mount, and the payment method returns to its cash default so the cashier is ready for the next customer without touching anything.
UX-DR24: No optimistic mutations on money - cart quantities are local and feel instant, but a completed sale is real only after the server responds, and a failed sale leaves the cart exactly as it was with an error toast naming the cause.
UX-DR25: One primary action per surface - Inventory: Add Product; POS: Complete Sale; Receipt: Print; Reports: none. Destructive actions always confirm via Modal. The Complete Sale control is not rendered at all when the cart is empty rather than rendered disabled.
UX-DR26: Filter behavior - filtering is live with no Apply button; a Clear action appears whenever any filter is non-default and restores the unfiltered list in one click; Escape clears the topmost overlay only and never clears a cart or cancels a sale.
UX-DR27: Money is rendered by formatCurrency() everywhere, including chart axes and tooltips, so a value is never shown as a bare number. Numeric values use tabular figures.
UX-DR28: Voice rules in all microcopy - sentence case for labels, buttons, headings, and toasts; no exclamation marks and no emoji in system messages; concrete numbers over vague quantifiers ("3 items at or below reorder level", not "some items are low"); failure messages name the operation and the cause the server gave and never say "Something went wrong."
UX-DR29: Receipt presentation - store name from a single exported STORE_NAME constant (not a literal in JSX), monospace body, high contrast, nothing conveyed by color alone (payment method is text), fits 80mm width without horizontal clipping, and prints with no app chrome.
UX-DR30: Chart presentation - series colors are the five fixed chart tokens plus the azure revenue series, grid lines are line gray #E0E0E0, axis labels are caption-scale muted slate, no vertical grid lines, no 3D, no gradients, no drop shadows on series, and legends or labels wherever a series name is not obvious.
UX-DR31: Type tokens applied consistently - numeric-lg is 24px at weight 800 and is the only style for stat values and cart totals, uppercase table heads at caption scale with letter spacing, and monospace is never used for general UI text.
UX-DR32: Dark mode is out of scope; do not add dark: variants.
```

### FR Coverage Map

_To be completed in the epic design step._

## Epic List

_To be completed in the epic design step._