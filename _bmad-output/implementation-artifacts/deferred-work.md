- source_spec: `D:\WebDevPersonal\cube-tech-pos/_bmad-output/implementation-artifacts/spec-1-2-install-lucide-react.md`
  summary: Add a lint or CI check enforcing the icon and color bans (no emoji, Unicode glyphs, inline SVG, icon fonts, second icon library, raw hex, bg-[#...]).
  evidence: Blind-hunter review noted nothing prevents future regressions of the Story 1.2 bans; no lint framework or story currently owns it.
- source_spec: `D:\WebDevPersonal\cube-tech-pos/_bmad-output/implementation-artifacts/spec-1-5-accessibility-floor.md`
  summary: Make horizontally scrolling table regions keyboard-scrollable (e.g. tabindex on scroll containers) as part of responsive breakpoint work.
  evidence: Overflow containers predate this story and are unreachable by keyboard alone; flagged in Story 1.5 review, belongs with the breakpoint/table discipline.
- source_spec: `D:\WebDevPersonal\cube-tech-pos/_bmad-output/implementation-artifacts/spec-1-5-accessibility-floor.md`
  summary: Add component tests for the accessibility behaviors (Modal Escape/trap/focus-return, tile keyboard commit and disabled state, Table region/scope, label association, EmptyState rendering) when the test framework lands.
  evidence: Verification-gap review proved no test observes these behaviors; NFR13 forbids a runner this phase, so coverage waits for the test-framework story with the manual keyboard/AT pass as interim.
