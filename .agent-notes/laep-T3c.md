## Observation: refusal position must be the whole-source position in every engine
- **Context**: laep T3c fixtures `lap-url`, `unterminated-long`, `note-on-link-first` drew the jar's error page but named class where the jar names sequence or state.
- **Finding**: the max-score tie-break (`PSystemErrorUtils.java:140-147`) compares `consumed`. Class, state and the legacy engine report the failing line's position with `@startuml` at 0; sequence reported the body index and the skin cut reported the body line count, one less, so sequence lost the first-line tie the jar gives it. Fixed in `sequence/parser.ts#refusalLineOf` and `skin-command.ts#skinCutOf`. The ufp follow-on "sequence refusal index off by one" in `planning/next-missions.md` is this.
- **Impact**: any new engine's refusal must use the same convention; a "never rises" pin that FALLS (error-arecibo 10 to 8) is the signal it is right.
- **Confidence**: High

## Observation: nested inner activity is a jar crash page
- **Context**: `inner-brace-nested` (an inner activity inside an inner activity).
- **Finding**: the jar's oracle is its `ReportLog` crash page (`Entity.checkGroup(Entity.java:355)` from `Cluster.getStyle`), matching the mirror in `activity-legacy-dot.ts#printGroup`. We draw an error page, not the jar's JVM-fact page; `measurements/fixtures.mts` counts any own error page against a crash oracle as a pair.
- **Impact**: this fixture can never reach compareSvg 0; it is an error-page pair by D8.
- **Confidence**: High

## Observation: HColorSimple#asPaint drops the dark partner
- **Context**: `skinparam mode dark` on a legacy activity: arrows `#181818` instead of `#E7E7E7`, partition border `#000` instead of `#FFF`.
- **Finding**: `asPaint()` is light-only; `Fore`/`Back` accept `HColorOrPaint`, so passing the `HColorSimple` lets the driver apply the mapper (`ColorMapper.DARK_MODE`). `SvekEdge`, `Cluster`, `ClusterDecoration`, `SymbolContext` now accept it; other engines still pass strings.
- **Impact**: any other engine that routes style colours through `asPaint()` has the same dark-mode gap.
- **Confidence**: High
