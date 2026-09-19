- source_spec: `D:\WebDevPersonal\cube-tech-pos/_bmad-output/implementation-artifacts/spec-1-2-install-lucide-react.md`
  summary: Add a lint or CI check enforcing the icon and color bans (no emoji, Unicode glyphs, inline SVG, icon fonts, second icon library, raw hex, bg-[#...]).
  evidence: Blind-hunter review noted nothing prevents future regressions of the Story 1.2 bans; no lint framework or story currently owns it.
- source_spec: `D:\WebDevPersonal\cube-tech-pos/_bmad-output/implementation-artifacts/spec-1-5-accessibility-floor.md`
  summary: Make horizontally scrolling table regions keyboard-scrollable (e.g. tabindex on scroll containers) as part of responsive breakpoint work.
  evidence: Overflow containers predate this story and are unreachable by keyboard alone; flagged in Story 1.5 review, belongs with the breakpoint/table discipline.
- source_spec: `D:\WebDevPersonal\cube-tech-pos/_bmad-output/implementation-artifacts/spec-1-5-accessibility-floor.md`
  summary: Add component tests for the accessibility behaviors (Modal Escape/trap/focus-return, tile keyboard commit and disabled state, Table region/scope, label association, EmptyState rendering) when the test framework lands.
  evidence: Verification-gap review proved no test observes these behaviors; NFR13 forbids a runner this phase, so coverage waits for the test-framework story with the manual keyboard/AT pass as interim.
- source_spec: `D:\WebDevPersonal\cube-tech-pos/_bmad-output/implementation-artifacts/spec-2-1-category-crud.md`
  summary: Harden pre-existing product routes with numeric :id validation and explicit column lists to match the categories route.
  evidence: Story 2.1 review found PUT/DELETE /products/:id pass raw params to pg (500 on garbage input) and use SELECT *; the new categories route guards both, leaving the older file as the inconsistent one.
- source_spec: `D:\WebDevPersonal\cube-tech-pos/_bmad-output/implementation-artifacts/spec-2-3-category-stock-filters.md`
  summary: Run a palette-wide WCAG AA contrast pass on azure-on-white small text (Button primary, active nav item, the active POS category chip, full-screen surfaces) rather than fixing one component.
  evidence: Story 2.3 review computed white on azure #1690E8 at 3.39:1, below AA for text under 18.66px bold / 24px. DESIGN.md mandates that pairing and Story 1.5 left it in place, so it is a design-token decision that needs to change once, not a per-component defect.
- source_spec: `D:\WebDevPersonal\cube-tech-pos/_bmad-output/implementation-artifacts/spec-2-4-reorder-levels-badges.md`
  summary: Allow tuning reorder levels inline from the Inventory table for bulk editing.
  evidence: Story 2.4 puts the threshold in the Add/Edit Product modal, so retuning a whole category costs one modal round trip per product. The inline-table alternative was offered and not chosen during planning because it adds a second mutation path and per-row save state; revisit only if bulk tuning proves tedious in use.
- source_spec: `D:\WebDevPersonal\cube-tech-pos/_bmad-output/implementation-artifacts/spec-3-3-transaction-filters.md`
  summary: Show an error state with retry on the Transactions page instead of "No transactions yet" when the sales fetch fails.
  evidence: Blind-hunter review on Story 3-3 confirmed the catch path toasts but leaves sales as [], so a failed load reads as an empty register; pre-existing from the unfiltered list, not caused by the filter change.
- source_spec: `D:\WebDevPersonal\cube-tech-pos/_bmad-output/implementation-artifacts/spec-3-3-transaction-filters.md`
  summary: Ignore or cancel the in-flight transaction-detail fetch when its modal is closed so a late response cannot reopen it.
  evidence: Blind-hunter review on Story 3-3 confirmed viewDetails sets selectedSale unconditionally on resolve; pre-existing race, untouched by the filter change.
- source_spec: `D:\WebDevPersonal\cube-tech-pos/_bmad-output/implementation-artifacts/spec-2-5-stock-movements.md`
  summary: Preserve stock-movement history when a product is deleted, instead of cascading it away.
  evidence: `stock_movements.product_id` is `REFERENCES products(id) ON DELETE CASCADE` (server/db.sql:57), so deleting a product erases every movement that explained its quantity — the exact question the Stock Movements surface exists to answer. Story 2.5 documented the cascade as accepted rather than changing the schema, since a soft-delete or an archive flag is a product decision, not a filter. Revisit if history retention becomes a requirement.
- source_spec: `D:\WebDevPersonal\cube-tech-pos/_bmad-output/implementation-artifacts/spec-3-4-receipt-view-print.md`
  summary: Distinguish a missing receipt from a failed receipt load with a retry action on the receipt page.
  evidence: Blind-hunter review on Story 3-4 confirmed every fetch failure renders "Receipt not found" with no retry; the toast names the real error, but the page itself conflates transient errors with a genuinely missing id.
