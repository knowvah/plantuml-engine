# scr-T2a observations

## Observation: captured class spot glyph is 0.001 off the jar at two points
- **Context**: Verifying the nested-class spot glyph against the stock jar (`class__nested-classonly`).
- **Finding**: Our `C` spot (size 17) path has `24.473,17.481` and `Q23.842,27.002` where the stock jar and the
  top-level oracle (`class__casc-control-plain.svg`) have `24.473,17.48` and `Q23.842,27.001`; the jar's `d` also ends
  `Z ` (trailing space), ours `Z`. Same at top level, where class rows are conformant, so `compareSvg` tolerates both.
  Likely the translation of the captured outline (`class-badge-glyph-data.ts`, `spot-glyph-data.ts`) re-rounding.
- **Impact**: A byte-exact glyph would need the capture translated without re-rounding; no row measures it today.
- **Confidence**: Medium (values High; the rounding cause is not traced).

## Observation: stock-check.mjs now prints its output directory
- **Context**: Needed the stock jar's SVG, not only its verdict.
- **Finding**: `plans/style-mode-cascades/measurements/stock-check.mjs` prints `out\t<dir>` last; the `.svg` files stay
  there.
- **Impact**: Read stock-jar SVGs without a hand-typed `java` call (not on the allowlist).
- **Confidence**: High.
