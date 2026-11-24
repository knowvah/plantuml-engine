# ptw T2a — package title wraps at styleTitle (#219)

## Observation: the title atoms sum, they are not one stripe measure
- **Context**: unit-testing `measureShownFolderTitle` at wrap 100.
- **Finding**: a wrapped `create2` stripe's width is the sum of its word and space atoms (`Fission` splits words),
  e.g. `empty` + ` ` + `package` = 106.84999990 with margins, while `measure('empty package')` + 12 = 106.84999847.
  The 1.4e-6 gap fails a `toBeCloseTo(…, 6)`.
- **Impact**: assert wrapped widths from per-atom sums (or at 3 decimals), never from one measure of the joined line.
- **Confidence**: High

## Observation: buildCreate2Name hit the 5-parameter cap
- **Context**: adding a wrap width to `buildCreate2Name`.
- **Finding**: the fifth parameter is now a `Create2NameWidths` object (`minimumWidth`, `wrapWidth`).
  `EntityImageRequirement` passes `{ minimumWidth }`. Upstream `EntityImageRequirement.java` also calls `create2`
  with its style, so its body would wrap at that style's `MaximumWidth` too; the port passes no wrap width there
  (no oracle row yet).
- **Impact**: a requirement with `MaximumWidth` set may not wrap as the jar does; a probe would settle it.
- **Confidence**: Medium (Java read for the description path; requirement path not measured)

## Observation: the class renderer's description leaf needed the same title wrap
- **Context**: the folder sizer falls back to `opts.wrapWidth` (skinparam wrapWidth) for the title.
- **Finding**: class's `buildDescriptionLeafOpts` feeds `theme.wrapWidth` to the same sizer, so
  `renderer-usymbol-entity.ts` now paints `wrapWidthTitle: theme.wrapWidth ?? 0` too, keeping box and ink in step.
- **Impact**: any further title-wrap source must be added on both the description and class renderers.
- **Confidence**: High
