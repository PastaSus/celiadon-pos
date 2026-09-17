---
name: Cube Tech POS
status: draft
sources:
  - _bmad-output/specs/spec-pos-transformation/SPEC.md
  - _bmad-output/architecture/architecture-cube-tech-pos-2026-09-16/ARCHITECTURE-SPINE.md
updated: 2026-09-17
---

# Cube Tech POS - Experience Spine

> Paired with `DESIGN.md` in this folder, which owns how it looks. This spine owns how it works. Both win on conflict with any mock, wireframe, or import. Scope: the six capabilities not yet shipped - CAP-2, CAP-3, CAP-4, CAP-5, CAP-6, CAP-9.

## Foundation

Single-store, multi-surface responsive web. React 18 + Vite + Tailwind on the client, Express + TypeScript + PostgreSQL on the server, two independent Vercel projects and a Neon database.

The UI system is the internal component library at `client/src/components/` (Badge, Button, LoadingSpinner, Modal, Table, Toast) - not shadcn, not MUI, not a headless kit. It is internal, it already ships, and it is the structural contract: components keep their props and behaviors, but every `bg-indigo-*` and `text-gray-*` class migrates to the named palette (`brand` azure, `teal` commit, slate text) so a primary button renders azure and body text renders slate. `EXPERIENCE.md` specifies only the behavioral delta the new surfaces need, and `DESIGN.md` holds the visual identity.

Role model is the binding constraint on the IA. Three roles exist - `admin`, `manager`, `cashier` - and the nav is filtered by role from a single source (`NAV_ITEMS` in `client/src/App.tsx`), which means a surface that is not in that table is not reachable. Auth state lives in `AuthContext`; an expired token clears the session and returns the user to login.

Stakes: portfolio-grade demo of a real retail tool, used by one store's staff. Not regulated, no sensitive-data handling beyond credentials, no payment processing (payment method is recorded, never charged).

## Information Architecture

| Surface | Reached from | Purpose | Roles |
|---|---|---|---|
| Login | App entry when unauthenticated | Email + password sign-in | public |
| Dashboard | `/` , brand mark | Today's numbers, charts, low-stock callout | admin, manager |
| Inventory | `/inventory` | Product CRUD, search, category filter, stock state | admin, manager |
| Categories | Modal on Inventory | Create, rename, delete categories | admin, manager |
| Point of Sale | `/pos` | Ring up a sale: product grid, cart, payment method, complete | admin, manager, cashier |
| Cart drawer | POS, below `lg` only | The cart on a narrow viewport | admin, manager, cashier |
| Transactions | `/transactions` | Sales history, line-item detail, print receipt | admin, manager, cashier |
| Receipt | Print view from a transaction | Printable receipt at 80mm | admin, manager, cashier |
| Reports | `/reports` | Date-ranged revenue, top products, payment mix | admin, manager |
| Stock Movements | `/stock-movements` | Every quantity change with who, why, when | admin, manager |

Landing surfaces differ by role: a cashier lands on Point of Sale, everyone else lands on Dashboard. That rule already ships, and the new nav items must not disturb it.

Modal stacking is one level deep. Category management, product add/edit, product delete confirmation, and transaction detail are all Modals, and no Modal opens another Modal. The receipt is a surface, not a Modal - it needs the print dialog and a full page.

→ No mocks in this run; every surface above is build-ready from the spine tables. Spine wins on conflict.

## Voice and Tone

Microcopy only. Brand voice and aesthetic posture live in `DESIGN.md`.

The product talks like a competent coworker who is busy: short, specific, and never congratulating anyone for completing a task the software was built to do.

| Do | Don't |
|---|---|
| "Sale completed" | "Awesome! Sale completed successfully!" |
| "Not enough stock" | "Oops! You can't add that many." |
| "No products match this filter" | "Nothing here yet! Try adjusting your search." |
| "Out of stock" | "Sold out :(" |
| "Low stock: 3 items at or below reorder level" | "Heads up! Some items are running low!" |
| "Cart is empty" | "Your cart is waiting for its first item!" |

Rules that fall out of that:

- Sentence case for labels, buttons, headings, and toasts. No title case in sentences.
- No exclamation marks and no emoji in system messages. The receipt has no decoration either.
- Numbers are concrete. "3 items at or below reorder level" beats "some items are low."
- Failure messages name the operation and the cause the server gave. A failed sale says what failed; it never says "Something went wrong."
- Money always appears through `formatCurrency()`, including in chart axes and tooltips, so a value is never rendered as a bare number.

## Component Patterns

Behavioral specs. Visual specs live in `DESIGN.md.Components` or in the existing component source.

| Component | Surfaces | Behavioral rules |
|---|---|---|
| SearchInput (new) | Inventory, Stock Movements | Debounced 200ms on the product name; case-insensitive; clear button appears once the field is non-empty; Escape clears it. Result count updates in place; no submit button. |
| FilterSelect (new) | Inventory, Stock Movements | Native select styled to match inputs. First option is always "All categories" (or "All types"), which is the default. Combines with search as AND, never as OR. |
| Category chips (new, POS only) | Point of Sale | Client-side filter over the loaded product list - no request. "All" chip is selected by default; exactly one chip is active at a time. |
| CartDrawer (new) | POS below `lg` | Opens from a fixed bottom bar showing item count and total. Overlay scrim from `Modal`'s language. Closes on Escape, on scrim click, and after a completed sale. Cart contents and controls behave exactly as the desktop cart does. |
| PaymentMethodControl (new) | POS checkout block | Three options - Cash, Card, E-wallet - presented as a segmented control. Cash is preselected. Always visible; never hidden behind the Complete Sale button. Changing it after a failed sale preserves the cart and the selection. |
| StatCard (new) | Dashboard, Reports | Label above value, tone dot left of the label, value at `{typography.numeric-lg}`. Optional delta line beneath (Reports only). No interaction - a stat card is not a button. |
| DateRangeBar (new) | Reports | Two native date inputs plus presets: Today, 7 days, 30 days, 90 days. A preset writes both inputs. Changing either input switches the active preset to "Custom". Ranges are inclusive of both endpoints. Invalid range (start after end) is corrected by moving the other endpoint, never by erroring. |
| ChartPanel (new, wraps Recharts) | Dashboard, Reports | Title at `{typography.section}`, chart below, legend where a series name is not obvious. Has its own loading and empty state; an empty range shows "No sales in this range" inside the panel rather than an empty axes box. |
| ReceiptView (new) | Receipt print surface | Renders store name, receipt number, timestamp, line items (name, qty, unit price, subtotal), total, payment method, and cashier email. Read-only. One primary action: Print. |
| EmptyState (new) | All tables and lists | Existing `Table` `emptyMessage` covers tables; `EmptyState` covers grids and panels. One sentence naming the state, and an action only when the user can act (e.g. "Add Product"). |
| Table (existing) | All lists | Unchanged. Typed `Column<T>`, `dense` for nested use inside a Modal, `emptyMessage` for the empty case, horizontal scroll on narrow viewports. New tables configure columns; they do not reimplement layout. |
| Modal (existing) | Inventory, Transactions | Unchanged behavior. Gains Escape-to-close and a focus trap (see Accessibility Floor). One level deep. |

Low stock is not a component - it is the `stockTone()` rule applied through `Badge`, and it must read identically on Inventory, POS, and the Dashboard callout.

## State Patterns

Every surface has the same five states, and a surface is not done until all five are specified.

| State | Treatment |
|---|---|
| Loading | `LoadingSpinner` centered in the surface's own area - never a full-page takeover on a filter change. Charts and stat cards keep their frame while loading so the page does not jump. |
| Empty (no data at all) | `EmptyState` or the `Table` empty message: one sentence, plus an action only when the user can act. Inventory: "No products yet. Add your first product." with an Add Product button. Transactions: "No transactions yet." with no action. |
| Empty (filtered to nothing) | Distinct from the above and never shows a create action: "No products match this filter" with a Clear filters affordance. This distinction matters - offering "Add Product" to someone whose filter missed is wrong. |
| Error | `Toast` with the server's message, inline in the surface where the failure was local (e.g. the range did not load), and the previous good data stays on screen rather than blanking out. |
| Partial / stale | When a sale completes, stock changes; the POS grid reloads and shows the change without a full re-mount. A stale number is worse than a spinner, so a mutation always refreshes what it invalidated. |

Surface-specific states worth naming:

- **Cart empty (POS)** - "Click products to add to cart." The Complete Sale button is not rendered at all in this state; it is not merely disabled. A disabled commit button invites hunting for why.
- **Sale completed (POS)** - cart clears, a success toast fires, stock refreshes, and the payment method returns to its default (Cash). The cashier is immediately ready for the next customer without touching anything.
- **Out of stock (POS)** - tile dims to 50 percent, shows "Out of stock," and does not respond to clicks. It does not disappear from the grid; a product that vanishes reads as a bug.
- **Low stock (Inventory, POS, Dashboard)** - yellow `Badge` with the count. Red only at zero. The number is always visible next to the state, never replaced by it.
- **No sales in range (Reports)** - panel-level message inside the chart frame, with the date range still visible so the user can see what they asked for.
- **Token expired (anywhere)** - the session clears and the app returns to Login. No partial page, no half-authorized view.

## Interaction Primitives

- **One primary action per surface.** Inventory: Add Product. POS: Complete Sale. Receipt: Print. Reports: none - it filters, it does not commit. A surface with two primary buttons has a design problem, not a layout problem.
- **Commit actions confirm by result, not by dialog.** Completing a sale needs no "are you sure" - the receipt is the confirmation. Destructive actions (delete product, delete category) always confirm via `Modal`.
- **Filters are live and need no Apply button.** Search and category selection re-render as they change. A Clear action appears whenever any filter is non-default, and clearing restores the unfiltered list in one click.
- **Escape closes the topmost overlay and nothing else.** Modal, then CartDrawer. Escape never clears a cart or cancels a sale; that requires an explicit action.
- **Keyboard path through checkout.** Tab reaches product tiles, quantity steppers, the payment control, and Complete Sale in that order. Enter on a focused tile adds it to the cart. The receipt is reachable and printable without a mouse.
- **No optimistic mutations on money.** Cart quantities are local and feel instant; a completed sale is real only after the server responds. A sale that fails leaves the cart exactly as it was.
- **The cart survives navigation within POS.** Switching category filters or reopening the drawer never drops cart contents. Only a completed sale or an explicit removal empties it.

## Accessibility Floor

The floor is what makes the product usable at a counter with a queue - not a compliance exercise. It is behavioral, and every surface meets it.

- **Keyboard reachable, end to end.** Every interactive element is reachable by Tab in reading order and operable with Enter or Space: nav items, product tiles, quantity steppers, the payment control, Complete Sale, filter controls, pagination-free table actions, and Print.
- **Visible focus.** The focus ring is 2px `{colors.ring}` (`focus:ring-2 focus:ring-brand`) on every interactive element, and it is never removed. It must be visible against `{colors.surface}`, `{colors.canvas}`, and `{colors.ink}` - on the navy chrome the ring is `{colors.accent}` cyan (`focus:ring-accent`) so it survives the dark background.
- **Labels are programmatically tied to inputs.** Every input has an `htmlFor`-linked `<label>`. The Inventory form currently uses bare labels and must be fixed; Login already does this correctly, so Login is the reference.
- **Overlays behave like dialogs.** `Modal` and `CartDrawer` close on Escape, return focus to the element that opened them, and keep Tab inside while open. `Modal`'s existing scrim and close button already establish the pattern; the behavior is what is missing.
- **Status changes are announced.** The `Toast` container already exposes `role="status"`; error toasts are the case that matters most, because a failed sale must not be silent for a screen-reader user.
- **The receipt prints legibly.** Print output is high contrast, does not depend on color to convey anything (the payment method is text, not a colored chip), and fits 80mm without horizontal clipping.
- **Color is never the only signal.** Stock state always shows the number alongside the badge; the active nav item carries a surface fill as well as color; chart series carry a legend or label. A user who cannot distinguish yellow from red still gets the count.
- **Tap targets are at least 44px on the touch surfaces** (POS tiles, steppers, drawer controls, payment segments). This is the one place where a counter device, not a desktop mouse, sets the floor.

## Responsive & Platform

Responsive is an app-wide rule set, not a per-feature detail. `md` is 768px and is the single collapse boundary; `lg` is 1024px.

| Breakpoint | Behavior |
|---|---|
| `≥ lg` (1024px+) | Full nav with all role-permitted items. POS is a 3-column layout with a sticky cart. Dashboard stat cards 4 across, charts 2 per row. Reports charts 2 per row. |
| `md`–`lg` (768–1023px) | Nav stays horizontal. POS drops to 2 columns, so the cart becomes the `CartDrawer` with the fixed bottom summary bar. Dashboard stat cards 2 across, charts stack. Tables scroll horizontally. |
| `< md` (under 768px) | Nav collapses to a hamburger that opens a drawer containing the role-permitted items, the user email/role meta, and Sign out. The POS product grid is 2 across and the cart is exclusively the drawer. Dashboard and Reports stack everything to one column. Tables scroll horizontally. Forms and modals go full width minus page padding. |

Rules that hold at every width:

- The nav's user meta (`email · role`) hides below `md`; it reappears inside the hamburger drawer rather than being dropped, so a cashier can always confirm who they are signed in as.
- The cart is never unreachable: above `lg` it is a column, below `lg` it is the drawer triggered from a bottom bar that always shows item count and total.
- Tables never drop columns to fit. They scroll horizontally, which the `Table` component already supports, and identifiers stay in the first column so the user keeps their place while scrolling.
- Chart panels keep a stable height across breakpoints so filter changes do not make the page jump.
- The POS is the priority surface on touch: it is the only surface where a phone or tablet is a first-class device rather than a fallback, and it is the surface a cashier holds while serving a customer.

This is responsive web, not a native app, and offline mode is out of scope - a sale requires the server, and a failed sale leaves the cart intact so nothing is lost.

## Key Flows

### Flow 1 - A cash sale on a phone (Rosa, cashier, Saturday 11:40am, queue of four)

1. Rosa opens the site on her phone. The session is alive, so she lands directly on Point of Sale - not the Dashboard - because her role's landing surface is POS.
2. The nav is a hamburger; she ignores it. The product grid is two across. She taps two items: a USB-C cable and a phone case. The fixed bottom bar updates to "2 items · $34.98."
3. The customer pays cash. Rosa taps the bottom bar; the `CartDrawer` rises with both lines, their quantity steppers, and the total. The payment control already reads **Cash** - she does not have to touch it.
4. She taps **Complete Sale**.
5. **Climax:** The drawer closes, a toast says "Sale completed," the bottom bar resets to "0 items," and the grid behind her has already refreshed - the cable now reads 11 in stock instead of 12. Rosa opens the new transaction from the toast's wake, hits **Print**, and the print dialog opens on a receipt that fits the store's 80mm roll. She is on the next customer before the receipt finishes printing.

Failure: the cable sold on another till a second earlier, so the server rejects the sale with "Not enough stock." The drawer stays open with both lines intact, an error toast names the problem, and Rosa lowers the cable's quantity to 1 and completes. Nothing is retyped.

### Flow 2 - Checking the week's numbers (Marcus, store manager, Monday 8:15am before opening)

1. Marcus signs in and lands on the Dashboard. Four stat cards answer the obvious questions: revenue, average transaction, today's sales, and a low-stock count of 3.
2. The revenue line chart shows the last 30 days by default. He switches the toggle to weekly to see the month's shape without weekend spikes distorting the trend.
3. The low-stock count bugs him. He follows the callout card, lands on Inventory with the low-stock filter already applied, and sees the three products at or below their reorder level - the count matches the card exactly.
4. He restocks the first one, entering the new quantity with a reason. The stock movement is recorded against his name, and the row drops out of the filtered list.
5. **Climax:** He opens Reports, sets the range to the last 30 days, and the payment-method pie finally answers the question he actually came in with: card has overtaken cash since the new terminal went in, and e-wallet is still flat. He steps the range back one month to confirm the crossover. The number he will quote in the Monday huddle is one he just derived himself, on a screen that shows both the total and the mix behind it.

Failure: the range returns nothing because he set the start date after the end date. The control corrects the range by moving the end date rather than raising an error, and the charts render the corrected range instead of an empty axes box.

### Flow 3 - The reorder walk (Priya, owner, Thursday 4:30pm, mid-shift)

1. Priya is on the sales floor with a tablet. The Dashboard's low-stock callout names 3 products at or below reorder level.
2. She opens Stock Movements to see *why* they are low before she reorders - she wants to know whether these sold through or were adjusted.
3. The movements table is filtered to those products. Two of the three show a run of `sale` movements across the afternoon; the third shows a single `adjustment` from yesterday with no reason recorded.
4. She opens Inventory, searches the third product by name, and raises its reorder level - it should have been flagged days ago at its volume.
5. **Climax:** She returns to the Dashboard and the low-stock count reads 2, not 3, because she changed the rule rather than the stock. The system now tells her the truth about *this* store's threshold for *this* product, and next week the alert fires before the shelf is empty instead of after.

Failure: the movements list is long and she cannot tell the products apart in one table. The product filter narrows it to one product at a time, and the type filter answers "sales or adjustments?" without scrolling.

## Inspiration & Anti-patterns

**Lifted from the existing app, deliberately.** The stat-card row, the `Table` column model, the modal detail pattern from Transactions, and the `stockTone` badge rule are already this product's vocabulary. New surfaces extend them rather than introducing a second way to show a number, a list, or a status.

**Lifted from counter hardware.** The 80mm receipt width, monospace totals, and tabular figures come from physical receipt printers, not from web dashboards.

**Rejected - Reports as a separate app.** Reports shares stat cards, chart panels, and the table with the Dashboard. Two chart libraries or two card styles would read as two products.

**Rejected - toasts for filters and navigation.** A toast is for the result of a mutation. Filtering a list is not an event worth announcing.

**Rejected - hiding the payment method until checkout.** The method is a visible control in the checkout block, because a cashier decides it while the customer is paying, not after.

**Rejected - cards instead of tables on mobile.** Staff scan columns. Horizontal scroll preserves the columns; a card layout loses the comparison.

**Rejected - a global low-stock destination in the nav.** Low stock is a state of a product, surfaced where products are shown, plus one Dashboard callout. It is not a page.

## Open Items

- **[ASSUMPTION] Receipt store name.** The receipt renders a hardcoded "Cube Tech POS" constant. Multi-store is a SPEC non-goal, so one exported constant keeps it swappable without touching layout. Confirm or reject at finalization.
- **Low-stock threshold - settled.** Per-product `reorder_level` (DEFAULT 10), not a global 10. `stockTone()` is already parameterized, so the UI needs no rewrite.
- **Chart default range - not yet chosen.** The Dashboard defaults to 30 days in Flow 2; confirm whether the default should follow the role or persist the last range the user picked.
- **Receipt reprint rules - unspecified.** Anyone who can see Transactions can currently print. If reprints must be logged, that is a SPEC gap to raise rather than a UX decision to invent.

→ Next: `bmad-create-epics-and-stories`, which reads this folder as the UX contract alongside `SPEC.md` and `ARCHITECTURE-SPINE.md`. Spine wins on conflict.

