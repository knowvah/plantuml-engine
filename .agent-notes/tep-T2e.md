## Observation: PanelsBinary#getTimeProjection ignores the value
- **Context**: porting `PanelsBinary` (PanelsBinary.java:81-87), oracle `cov-projections`.
- **Finding**: both points are `getYpos(stringBounder, HIGH_STRING)`: a message to or from a binary player always meets the
  high level, even in a low stretch (`B@5` and `B@100` both end at y 88 in the jar).
- **Impact**: T3a must not "fix" it; the unit test asserts it.
- **Confidence**: High (jar arrows in `/tmp/tdp-plan`-style oracle of `tests/fixtures/timing/cov-projections.puml`)

## Observation: a clock whose only ruler tick is its period draws from x = -50
- **Context**: `vega-clock-message-from-binary` (a clock of period 10 and a binary, no `@` lines).
- **Finding**: `createPlayerClock` adds only the period (10) to the ruler, so tick 0 is 10 time units left of the ruler's
  origin: the wave starts at x -50 relative to the panel, and the jar prints `x1="-20"` for a panel at x 30. `PanelsClock`
  starts its loop at value 0 whatever the ruler holds. The two vega message probes draw no arrow (both ticks null).
- **Impact**: T3a/T4 must call `ruler.addTime(period)` exactly as TimingDiagram.java:324-325 does or the clock fixtures shift.
- **Confidence**: High

## Observation: analog `setState` makes the first value the initial state
- **Context**: `PlayerAnalog#setState` (PlayerAnalog.java:74-84); `cov-ticks-every` draws a zero-length first segment at y(1).
- **Finding**: after the put, `if (initialState == null) initialState = value` runs for a timed value too, so `A is 1` at @0 is
  also the initial state (the polyline starts at it). An unparsable value is `0` after `Logme.error(e)`; the port logs nothing.
- **Impact**: none for output; a CommandChangeState regex that accepts non-numbers on an analog player draws 0.
- **Confidence**: High

## Observation: UGraphicSvg throws IllegalArgumentException on a NaN coordinate
- **Context**: drawing a `PanelsAnalog` whose series reports a NaN min (test double).
- **Finding**: `getYpos` divides by `max - min`; a zero range gives Infinity/NaN as in Java, and the SVG writer rejects NaN
  (`src/core/klimt/drawing/svg`, `IllegalArgumentException`). `analog "A" between 5 and 5` would reach that.
- **Impact**: T4b should probe `between 5 and 5` against the jar before calling analog done.
- **Confidence**: Medium (read, not probed)
