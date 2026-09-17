---
name: Cube Tech POS
description: Retail point-of-sale for a single store. Azure/teal/cyan palette on dark-navy chrome inspired by Square, Toast, and Shopify POS, shipped via tailwind.config.js theme.extend (brand, accent, teal, ink); this file specifies the system the remaining capabilities build against.
status: final
sources:
  - _bmad-output/specs/spec-pos-transformation/SPEC.md
  - _bmad-output/architecture/architecture-cube-tech-pos-2026-09-16/ARCHITECTURE-SPINE.md
updated: 2026-09-17
colors:
  # Cool azure/teal/cyan system on dark-navy chrome, inspired by Square, Toast, and Shopify POS. Accents stay in the cyan-to-azure band; neutrals are blue-gray. Ships via tailwind.config.js theme.extend as named colors (brand, accent, teal, ink) - see Colors section. Shipped bg-indigo-*/text-gray-* classes migrate to the new names.
  primary: '#1690E8' # azure - brand, primary buttons, active nav
  primary-hover: '#0E7BCB' # primary button hover
  primary-strong: '#0B5EA6' # pressed state, link hover
  primary-surface: '#D8EEFD' # selected segments, active chip wash
  primary-subtle: '#EBF6FE' # receipt total block, info wash panels
  accent: '#02F0FD' # electric cyan - glow on dark chrome ONLY: logo mark, focus ring on navy, key numerals on dark bars. Never body text on white.
  accent-ink: '#07333D' # readable text on accent fills
  teal: '#3FE0D0' # secondary accent - chart series, progress fills
  ring: '#1690E8' # focus ring on light surfaces (accent glow on dark)
  canvas: '#E8EDF3' # cool blue-gray page background
  surface: '#FFFFFF' # cards, tables, modals, nav sheets
  surface-muted: '#F5F8FB' # table head, modal detail blocks
  border: '#E0E0E0' # dividers, table rows
  border-strong: '#C2CFDB' # form inputs
  ink: '#0A1929' # dark navy - nav chrome, mobile cart bar, drawer footer
  text: '#152A3F' # headings and values (maps to slate-800)
  text-strong: '#0A1929' # table cell emphasis (maps to slate-900)
  text-muted: '#5B6E82' # labels, meta, empty states (maps to slate-500)
  text-subtle: '#8296A9' # secondary text (maps to slate-400)
  success: '#0B7E71' # deep teal - Complete Sale, positive amounts
  success-hover: '#0A6B61' # commit button hover
  success-surface: '#CCFBF1' # healthy badge fill
  success-text: '#115E59' # healthy badge text
  warning: '#EAB308' # amber dot - at/below reorder level
  warning-surface: '#FEF9C3' # yellow-100 - low-stock badge fill
  warning-text: '#854D0E' # yellow-800 - low-stock badge text
  danger: '#DC2626' # red-600 - destructive actions, out of stock
  danger-surface: '#FEE2E2' # red-100 - badge fill
  danger-text: '#991B1B' # red-800 - badge text
  chart-revenue: '#1690E8' # revenue series owns the brand azure
  chart-1: '#0B7E71' # deep teal
  chart-2: '#3FE0D0' # teal - bars and areas, never thin text
  chart-3: '#0A1929' # navy
  chart-4: '#EAB308' # amber
  chart-5: '#64748B' # slate
  overlay: '#000000' # Modal scrim at 50 percent
components:
  button-primary: { background: '{colors.primary}', foreground: '{colors.surface}', radius: '{rounded.lg}' }
  button-commit: { background: '{colors.success}', foreground: '{colors.surface}', radius: '{rounded.lg}' }
  button-destructive: { background: '{colors.danger}', foreground: '{colors.surface}', radius: '{rounded.lg}' }
  button-secondary: { background: '{colors.border}', foreground: '{colors.text}', radius: '{rounded.lg}' }
  badge-healthy: { background: '{colors.success-surface}', foreground: '{colors.success-text}', radius: '{rounded.full}' }
  badge-low: { background: '{colors.warning-surface}', foreground: '{colors.warning-text}', radius: '{rounded.full}' }
  badge-out: { background: '{colors.danger-surface}', foreground: '{colors.danger-text}', radius: '{rounded.full}' }
  badge-neutral: { background: '{colors.canvas}', foreground: '{colors.text}', radius: '{rounded.full}' }
  input: { background: '{colors.surface}', border: '{colors.border-strong}', radius: '{rounded.lg}' }
  table-shell: { background: '{colors.surface}', radius: '{rounded.lg}' }
  table-head: { background: '{colors.surface-muted}' }
  modal-shell: { background: '{colors.surface}', radius: '{rounded.lg}' }
  stat-card: { background: '{colors.surface}', radius: '{rounded.lg}' }
  cart-drawer: { background: '{colors.surface}', radius: '{rounded.lg}' }
  chart-panel: { background: '{colors.surface}', radius: '{rounded.lg}' }
  nav-chrome: { background: '{colors.ink}', foreground: '{colors.surface}' }
  nav-active: { background: '{colors.primary}', foreground: '{colors.surface}' }
  bottombar: { background: '{colors.ink}', foreground: '{colors.surface}' }
  receipt: { background: '{colors.surface}', foreground: '{colors.text-strong}', radius: '{rounded.sm}' }
typography:
  display: { fontSize: 24px, fontWeight: '800', lineHeight: '1.3' } # text-2xl page titles
  heading: { fontSize: 20px, fontWeight: '700', lineHeight: '1.4' } # text-xl modal and card titles
  section: { fontSize: 18px, fontWeight: '600', lineHeight: '1.4' } # text-lg section heads
  body: { fontSize: 14px, fontWeight: '400', lineHeight: '1.5' } # text-sm default UI text
  label: { fontSize: 14px, fontWeight: '500', lineHeight: '1.5' } # form labels
  caption: { fontSize: 12px, fontWeight: '400', lineHeight: '1.4' } # text-xs meta and stat labels
  table-head: { fontSize: 12px, fontWeight: '500', letterSpacing: '0.05em' } # uppercase column heads
  numeric-lg: { fontSize: 24px, fontWeight: '800' } # stat card values, cart totals - heavy numerals like Square/Toast
  mono: { fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', fontSize: 14px } # receipt numbers
  receipt: { fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', fontSize: 12px, lineHeight: '1.5' }
rounded:
  sm: 4px # rounded - inputs in dense contexts
  lg: 8px # rounded-lg - buttons, cards, inputs, modal
  full: 9999px # rounded-full - badges and status dots
spacing:
  tight: 8px # gap-2 - intra-control spacing
  control: 12px # gap-3 - button groups and form stacks
  gutter: 16px # gap-4 and px-4 - grid gutters, page padding
  section: 24px # mb-6 and py-6 - page section rhythm
  card: 24px # p-6 - card and modal padding
  page-max: 1280px # max-w-7xl - content width
---

# Cube Tech POS - Design Spine

> Brownfield. The interaction model already ships: the component library in `client/src/components/` plus the route and auth structure in `client/src/App.tsx`. This file rebuilds the visual language on an azure/teal/cyan palette with dark-navy chrome, inspired by Square, Toast, and Shopify POS, and specifies what the six remaining capabilities add. It is not a tweak to Tailwind defaults.

## Brand & Style

Cube Tech POS is a single-store retail counter tool. The person using it is standing up, mid-transaction, often with a customer waiting, frequently on a tablet or a phone. The aesthetic posture follows from that: a dark-navy chrome that frames the work, high-contrast white work surfaces, one azure brand color that marks the live action, status color reserved for stock truth, and no decoration that competes with a price or a quantity.

Aesthetic keywords: **utilitarian, legible at arm's length, cool chrome, honest status.** Square shows how a navy header anchors a register, Toast shows how one green can own every commit action, and Shopify POS shows how cool gray surfaces make products and prices the loudest thing on screen. This system takes all three: navy chrome, one azure for intent, deep-teal commit, slate work surfaces, and an electric-cyan glow that appears only on the dark chrome.

The brand color is `{colors.primary}` (azure). It marks exactly three things: the Cube Tech POS logotype, the active nav item, and the primary action on a surface. On the POS screen the commit action is `{colors.success}` (deep teal) instead, following Toast: "Complete Sale" ends a transaction rather than navigating within one, so it owns its own color.

Everything else is cool neutral. Cards are `{colors.surface}` on a `{colors.canvas}` page, the nav bar is `{colors.ink}` dark navy, and dividers are `{colors.border}`. Nothing is tinted for taste, and there are no gradients, no accent flourishes, and no celebratory motion. `{colors.accent}` electric cyan appears only as a glow on the dark chrome - the logo mark, the cart total on the mobile bar - never as body text on white.

This product inherits its interaction patterns wholesale from the shipped library. `Button`, `Badge`, `Table`, `Modal`, `Toast`, and `LoadingSpinner` are the contract - their props and behaviors are canonical. **Their colors are not**: every `bg-indigo-*` and `text-gray-*` class migrates to the named palette in `tailwind.config.js` (`brand`, `accent`, `teal`, `ink`), so a primary button renders azure and body text renders slate. A new page composes the same components in the new colors; it does not invent new components. The tension this creates is deliberate: the product should read as one system built by one hand, because a cashier learns the vocabulary once and never re-learns it on a new screen.

## Colors

Two color systems operate in this product, and they must not be confused with each other. The palette is electric cyan `{colors.accent}`, teal `{colors.teal}`, neutral light gray `{colors.border}`, and azure `{colors.primary}` - completed with a dark navy `{colors.ink}` for chrome, a cool blue-gray page `{colors.canvas}`, a slate text ramp, and amber/red reserved for stock truth. Cyan-on-white fails below large-headline sizes, so `{colors.accent}` never carries body text; it glows against the navy chrome instead.

**Brand azure is chrome and intent.** `{colors.primary}` fills primary buttons and the active nav pill (on navy chrome the active item is a filled azure pill with white text, which is also how Square's register marks the live tab). `{colors.primary-surface}` is the wash for selected segments and the active POS category chip. `{colors.ring}` draws the focus ring on light surfaces; on the navy chrome the focus ring is `{colors.accent}` cyan so it survives the dark background. Azure never means "good" or "bad" - it means "this is interactive" or "this is the one we are pointing at." A surface that uses azure for a status has made a mistake; that is what `Badge` tones are for.

**Status color is truth about stock and money**, expressed through the `Badge` tone vocabulary and the stock rule:

- **`{colors.success}` deep teal** - a completed sale, a positive amount, healthy stock above its reorder level. Toast's register green is the reference: the commit color is unmistakable and used for nothing else.
- **`{colors.warning}` yellow** - at or below the product's reorder level. The low-stock state. Fills with `{colors.warning-surface}` and reads in `{colors.warning-text}`, so it registers as a warning without becoming an alarm.
- **`{colors.danger}` red** - at or below zero stock, plus destructive actions: delete product, discard cart line. Red is the only color permitted on a delete affordance, and the only color permitted on the out-of-stock state.
- **`{colors.text-muted}` slate** - neutral, unknown, inactive, historical. A stock movement of type `adjustment` carries no judgment, so it carries no color.

**Chart color reuses what already exists.** The dashboard's stat dots already carry `{colors.chart-1}` through `{colors.chart-5}`; CAP-4's series bind to those same values, with `{colors.chart-revenue}` (brand azure) reserved for the revenue series so the primary metric owns the brand color. `{colors.teal}` is the bar-and-area color, never thin text or axis labels. This is deliberate: no new hex value enters the product for CAP-4, which keeps the chart language continuous with the cards sitting above it.

**The slate ramp does one job - separating foreground from background.** `{colors.text}` for headings and values, `{colors.text-strong}` for the emphasized cell in a table, `{colors.text-muted}` for labels, meta text, and empty states, `{colors.text-subtle}` for idle nav and secondary button text. Do not add a sixth step for a sixth purpose; pick the nearest existing one. Body text renders in slate because `text-gray-*` classes migrate to `text-slate-*` with the palette.

**Avoid:** tinted panels used as decoration, azure for status, cyan body text on white (accent is glow-only), red for anything non-destructive, chart colors chosen per-chart to "look nicer," and hardcoded currency symbols anywhere in the UI. Money is rendered by `formatCurrency()` and nothing else.

**Reviewing this palette is a config change, not a redesign.** Every value here is a named token in `tailwind.config.js`, and every surface references tokens rather than literals. Adjusting a hue after seeing a built screen means editing one hex in one file; it does not mean revisiting layout, spacing, or component structure. That is deliberate, because the palette is the decision most likely to be revisited once the POS screen is real and the least likely to invalidate anything else.

## Typography

The system font stack ships with Tailwind and is inherited as-is. No font is downloaded, no font file is added, and no display face is introduced - the product's type has to render instantly on a store tablet with indifferent wifi.

The ramp is small on purpose. Six roles, and a surface picks from them rather than inventing a size.

| Role | Token | Where |
|---|---|---|
| Page title | `{typography.display}` | One per surface, first element after the nav |
| Card / modal title | `{typography.heading}` | Modal headers, POS cart header |
| Section head | `{typography.section}` | "Recent Sales", "Top products", chart titles |
| Body | `{typography.body}` | Default UI text, table cells, form values |
| Label | `{typography.label}` | Form labels, filter labels |
| Caption | `{typography.caption}` | Stat card labels, timestamps, helper text |

Two special cases:

- **Stat values** use `{typography.numeric-lg}` - the number is the content of a stat card, so it is set at title scale and never smaller than its own label.
- **Table column heads** use `{typography.table-head}` with uppercase and letter-spacing, matching the existing `Table` component. A new table inherits this by using the component, not by styling headers by hand.

**Money and quantity alignment.** Every numeric column - price, quantity, subtotal, total - uses tabular figures so digits line up down a column and a cashier can scan a total without reading each row. `Button` and `Badge` text stays at body and caption scale; a badge never sets its own size.

**Monospace is reserved for identifiers and the receipt.** Receipt numbers render in `{typography.mono}` on every surface that shows them (Dashboard, Transactions, receipt) so a number is recognizable as a number at a glance. The printed receipt body uses `{typography.receipt}`. Monospace is never used for general UI text.

## Layout & Spacing

The Tailwind 4-based scale is inherited with no custom spacing tokens. The page shell is fixed: content lives in `max-w-7xl` (`{spacing.page-max}`) centered, with `{spacing.gutter}` horizontal padding and `{spacing.section}` vertical padding, under a nav of fixed height. Every existing surface already follows this, and every new surface joins it rather than introducing its own width.

Grid behavior, by surface:

| Surface | Wide | Narrow |
|---|---|---|
| POS | Products and cart in 3 columns; cart sticky at the top of its column | Single column with the cart as a drawer (see Responsive) |
| Dashboard | Stat cards 4 across; charts 2 per row | Stat cards 1 across; charts stack |
| Reports | Charts 2 per row, table full width | Everything stacks |
| Inventory / Transactions / Stock Movements | Full-width table | Full-width table that scrolls horizontally |

Card padding is `{spacing.card}` for a standalone card and `{spacing.gutter}` for a dense nested block (the detail panels inside a Modal). On wide screens a key number - the POS cart total, a Dashboard stat value, the mobile cart-bar total - sits on `{colors.ink}` navy rather than white, with an `{colors.accent}` cyan glow behind or beside it, so the money is the brightest thing on the surface the way a register total is the brightest thing on a Square terminal. Form fields stack vertically with `{spacing.gutter}` between fields and `{spacing.section}` before the action row, which is always right-aligned with the primary action rightmost. That is the existing Inventory and Transactions behavior, ratified.

Controls inside a row sit `{spacing.tight}` apart when they belong to one action (quantity stepper, cart line controls) and `{spacing.control}` apart when they are distinct actions (Cancel / Save).

## Elevation & Depth

Depth in this product is a two-level system, and it is already established in code.

**Level 0 - the page.** `{colors.canvas}` filled, flat, no shadow. Content sits on it.

**Level 1 - the card.** `{colors.surface}` with a soft shadow and a `{rounded.lg}` corner. Cards, tables, and stat blocks all live here. This is the whole hierarchy: there is no Level 2 card, no nested elevation, and no "raised on hover" beyond the POS product tile's existing hover shadow, which signals a tappable target rather than a deeper layer. The nav bar is `{colors.ink}` navy and sits outside this system - chrome, not content - with a solid fill and no blur.

**Overlays are a separate axis, not elevation.** The `Modal` scrim (`{colors.overlay}` at 50 percent) and the new `CartDrawer` scrim use the same treatment so an overlay is instantly recognizable as "the app is blocked until you deal with this." A dialog floats above the scrim with the same corner and shadow as a card.

The stacking order is fixed and the new drawer must respect it:

| Layer | Value | Members |
|---|---|---|
| Base | auto | Page, cards, tables, nav |
| Pinned | sticky | POS cart column above `lg`, cart summary bar below `lg` |
| Overlay | `z-50` | Modal, CartDrawer scrim + panel |
| Notification | `z-[60]` | Toast container |

A toast is always the topmost thing on screen, including on top of an open Modal. Nothing else may exceed the overlay layer. Toasts that report a completed sale use `{colors.ink}` navy with an `{colors.accent}` cyan edge, so a success reads as a register chime rather than a gray system note.

**Dark mode is out of scope.** The SPEC does not ask for it, the component library is not token-switched, and adding it here would double every color decision for no user-visible benefit to a single-store demo. If it lands later it is a new run, not a patch to these tokens.

## Shapes

Corners are consistent and slightly soft - the shape language of a tool, not a consumer app.

- `{rounded.lg}` (8px) is the default: buttons, inputs, cards, tables, modals, cart drawer, chart panels, toasts. If a surface has a corner and no other rule applies, it is 8px.
- `{rounded.full}` is reserved for two things: `Badge` pills and status dots on stat cards. Nothing else is a pill - notably, **buttons are never fully rounded**, so a pill shape can always be read as "status" rather than "action."
- `{rounded.sm}` (4px) appears only inside dense nested contexts, such as the `Table` in `dense` mode.
- Nav items keep their existing `rounded-md` pill background for the active state, but the pill is now a filled `{colors.primary}` azure with white text on the `{colors.ink}` navy bar - the one place the register look is explicit, and the only exception to the 8px rule.

Borders are 1px `{colors.border}` for dividers and table rows, and `{colors.border-strong}` for form inputs, so an input is discoverable before it is focused. No surface uses a 2px border, and no surface uses a border *and* a shadow to mean the same thing - a card is defined by its shadow, a table row by its divider.

## Components

**Inherited - same props and behaviors, new colors.** `Button` (primary / secondary / danger / dangerGhost / success / ghost, sm / md / lg), `Badge` (green / yellow / red / indigo / gray variant names kept; fills re-mapped to teal / amber / red / azure-wash / slate), `Table` (typed `Column<T>`, `dense` for modal nesting), `Modal`, `Toast`, `LoadingSpinner`. The library migrates to the named palette (`brand` azure, `teal` commit, slate text) in `tailwind.config.js`; their in-code variants and tones are the structural contract, and the new surfaces compose them.

**New visual specs.** Each of these is added to `client/src/components/` and follows the inherited patterns exactly.

- **SearchInput** - `{components.input}` with a leading search glyph at `{colors.text-muted}` inside the field, and a clear affordance at `{colors.text-muted}` that appears only when the field is non-empty. Same height and radius as the form inputs it sits beside, so a filter row reads as one line of controls. Focus uses `{colors.ring}`.
- **FilterSelect** - a native `select` wearing `{components.input}`, with the same height as `SearchInput`. Never a custom dropdown: the native control is faster on a tablet and needs no keyboard work.
- **Category chips (POS)** - `{rounded.full}` pills at `{typography.caption}` scale. Inactive: `{colors.surface}` fill with `{colors.primary-strong}` text on a `{colors.primary-subtle}` wash row. Active: `{colors.primary}` fill with `{colors.surface}` text. Exactly one is active at a time, and the active chip is the only azure element in the grid's header area.
- **CartDrawer** - `{components.cart-drawer}` panel rising from the bottom edge, full width on a phone, capped at a comfortable reading width on a large phone in landscape. Same scrim as `Modal`. A drag/close affordance at the top edge, cart contents as in the desktop cart, and a pinned footer on `{colors.ink}` navy holding the total in `{colors.accent}` cyan numerals with Complete Sale beside it, so the commit action never scrolls out of reach and the money glows the way a register total does.
- **PaymentMethodControl** - a three-segment control in a `{colors.primary-subtle}` wash with a `{rounded.lg}` container. The selected segment is a filled `{colors.primary}` azure pill with white text; unselected segments are `{colors.primary-strong}` text only. It sits directly above Complete Sale, so the choice reads as part of the commit rather than a separate step.
- **StatCard** - `{components.stat-card}`, label at `{typography.caption}` in `{colors.text-muted}` with the tone dot at `{rounded.full}` to its left, value at `{typography.numeric-lg}` in `{colors.text}` with tabular figures. The revenue card carries a `{colors.ink}` navy value band so the day's money reads first on the Dashboard; the low-stock card's value stays in `{colors.warning-text}` amber so it never borrows the commit color. The dot colors come from `{colors.chart-1}` through `{colors.chart-5}` for consistency with the charts below.
- **ChartPanel** - `{components.chart-panel}` holding a title at `{typography.section}` and the chart beneath it. Grid lines in `{colors.border}`, axis labels at `{typography.caption}` in `{colors.text-muted}`, no vertical grid lines, and no chart junk (no 3D, no gradients, no drop shadows on series). Tooltips format money through `formatCurrency()`. Teal `{colors.teal}` is the bar-and-area color; thin lines and small text never use it.
- **DateRangeBar** - two native date inputs using `{components.input}`, followed by preset chips styled exactly like the POS category chips. The active preset is a filled azure pill; "Custom" lights up when the user types into an input directly.
- **ReceiptView** - a `{components.receipt}` block on the print surface, monospace at `{typography.receipt}`, with the store name centered at the top, a divider rule of dashes between header, line items, and totals, and the total row emphasized. On screen it sits on `{colors.canvas}` inside a narrow centered column so the width matches what will print; in print it is the only thing on the page.
- **EmptyState** - one sentence at `{typography.body}` in `{colors.text-muted}`, centered, with an optional single primary action beneath. It replaces the ad-hoc inline paragraph currently on the POS grid so every empty surface reads the same.

## Do's and Don'ts

| Do | Don't |
|---|---|
| Compose the existing library - `Button`, `Badge`, `Table`, `Modal`, `Toast` | Restyle a library component on one page to make it fit there |
| Reserve azure for interactive and current | Use azure for a status, a count, or a category |
| Drive stock state through `stockTone()` and `Badge` only | Hand-pick a teal or red class for a stock value |
| Render money with `formatCurrency()` everywhere, including chart tooltips | Type a currency symbol, or print a bare number where money is meant |
| Reuse `{colors.chart-1}` through `{colors.chart-5}` for chart series | Introduce a new hex for a nicer-looking chart |
| 8px corners on anything with a corner | Pill-shaped buttons, or mixed radii on one surface |
| Keep one primary action per surface | Two primary buttons, or a disabled commit button where the action is impossible |
| Let tables scroll horizontally on narrow viewports | Rewrite a table as cards, or drop columns on mobile |
| Keep toasts above modals (`z-[60]`) | Put a drawer or modal above the toast layer |
| Use cyan only as glow on navy chrome (logo, key numerals, dark focus ring) | Set body text, labels, or thin lines in cyan on white |
| Let the empty state say what is true | Add a create action to a filtered-to-nothing state |
