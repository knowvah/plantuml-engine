# smc-T3 — monochrome and reverse colour

## Observation: the sequence "participant head" diff was the lifeline hover rect
- **Context**: `sequence__mode-monorev` showed `rect/@fill` ours `#FFF` jar `#000`.
- **Finding**: the rect is `renderer-lifeline.ts#drawHoverTarget`'s `fill="#000" fill-opacity="0"`. Upstream writes a transparent colour as `#00000000` before the mapper runs (`HColor.java:74-76`) and `WITH_FILL_OPACITY` emits `#000` + `fill-opacity="0"` (`SvgGraphics.java:521-528`), so the jar's mapper never sees it; our post-hoc regex mapper (`fragment-color-mapper.ts`) flipped it. `COLOR_PROPERTY_RE` now skips a fill followed by `fill-opacity="0"`.
- **Impact**: any engine using the fragment mapper (class, activity, sequence, state) inherits the skip.
- **Confidence**: High

## Observation: routing/refusal baselines go stale when a fix un-refuses a corpus row
- **Context**: pinning `activity/gigefo-15-cami497` with `pin-goldens.mts`.
- **Finding**: its dot-cache twin still read `known-misroute`/`known-gap` (measured 2026-11-03), stale since ubt fixed the while-stereotype refusal; the pin tool refuses a non-ok twin. Fixed by editing the two baseline rows and six count constants in `routing-conformance.test.ts`/`refusal-coverage.test.ts`; the full `tests/oracle/svg-conformance` suite verifies them (12027 passed).
- **Impact**: a `known-*` baseline row tolerates a row that already works, so stale entries accumulate silently.
- **Confidence**: High

## Observation: unmapped background gradient and border colour
- **Finding**: `backgroundGradient` and `diagramBorderColor` are not passed through the fragment mapper in activity, sequence, state or class; upstream maps both gradient stops (`SvgGraphics.java:178-181`). No row exercises either.
- **Confidence**: Medium (read, not measured)
