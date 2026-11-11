## Observation: a `!theme` error page lists the theme's expanded lines in the jar, not in ours
- **Context**: cmf T3b, fixture `cov-help-theme-cmd` (`@startuml` / `!theme amiga` / `help type`).
- **Finding**: the jar's error page counts and lists the theme's expanded lines as source (`... ( skipping 140 lines ) ...`, `skinparam StereotypeE {` ...), so `getTotalLineCountLessThan5()` is false (no Welcome block) and the page takes the theme's black background. Ours lists only the three typed lines, adds the Welcome block and stays white: 147 diffs. The same 147 diffs appear with no `help` at all (`@startuml` / `!theme amiga` / `foo bar baz`), so the mechanism is the shared error-page source listing under `!theme`, not the help factory.
- **Impact**: any `@startuml` error page whose source uses `!theme` diverges; a fix lives in the preprocessor/error-page seam (the UmlSource lines the error page lists), outside the cmf factories.
- **Confidence**: High (jar oracle `/tmp/cmf-t3b/p/out/theme-err.svg`, `tests/fixtures/factories/cov-help-theme-cmd.svg`).

## Observation: a non-titled `UgDiagram` export writes `target=""` on links
- **Context**: cmf T3b, fixture `cov-creole-url`.
- **Finding**: `TextBlockExporter#getSvgLinkTarget` returns `null` with no skin param (TextBlockExporter.java:372-378) and `SvgGraphics.LinkData` writes it as `target=""`; the port defaulted to `_top` everywhere. Fixed in `UgDiagram#exportTo` only (the non-titled arm); titled diagrams keep the skin default `_top`.
- **Impact**: any utility page drawing a creole link now matches; unknown survey moved no row.
- **Confidence**: High.
