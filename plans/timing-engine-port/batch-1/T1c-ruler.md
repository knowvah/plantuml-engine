# T1c — `TimingRuler`, `TickInPlayer`, `TimeTickBuilder`

**Read:** D3, D4, D6, D7, D16; `TimingRuler.java` (342 lines: `addTime`, `ensureNotEmpty`, `scaleInPixels`,
`getPosInPixel*`, `getWidth`, `getHeight`, `drawVlines`, `drawTimeAxis{,Manual,Automatic}`, `getAbsolutesTicks`,
`roundValues`, `getLabel`, `setStopAt`), `TickInPlayer.java`, `command/TimeTickBuilder.java`; T1a's journal row on the
Julian throw site.

**Do:**

1. `TimingRuler.ts`: a `TreeSet<TimeTick>` as a sorted array (D6); the `Comparator<Long>` of `getAbsolutesTicks`
   (java:146-160) as written; `codes` iterated in Java `HashMap` order where `getLabel` reads it (D6). The ruler takes
   the skin param it is constructed with (D7). Drawing goes through klimt (`UGraphic`, `ULine`, `UTranslate`,
   `TextBlock`), the time labels through the ruler's `getTimeTextBlock` font, as the Java builds them.
2. `TickInPlayer.ts`.
3. `command/TimeTickBuilder.ts`: the five `RegexOr` alternatives in order (`CODE`, `DATE`, `HOUR`, `DIGIT`, `CLOCK`),
   `expressionAtWithArobase`, `expressionAtWithoutArobase`, `optionalExpressionAtWithArobase`, and `parseTimeTick`
   with its `Clocks` reads (relative `+`, `now`, code deltas through `new BigDecimal(delta)`).
4. If the Julian `IllegalStateException` is thrown here, mirror it.

**Tests:** ticks `0`, `100`, `300` with default scale give the x positions of `cov-concise-basic`'s vertical lines;
`scaleInPixels(100, 50)` gives `cov-scale-hide-axis`'s; the automatic axis of `cov-negative-time` labels `-10`, `0`,
`20`'s round values as the oracle does; `TimeTickBuilder` parses `@:start+3`, `@1:15:00`, `@2020/07/04`, `@+5.5`,
`@clk*2` (with a stub `Clocks`) to the jar's tick values; manual axis labels prefer a code name over the number.

## Acceptance
- Given the planning probes' oracle line and text positions, when the ruler is built from their ticks, then its
  `getPosInPixel` values equal the oracle x coordinates.
- Given `npm test`, then it passes with the new files covered ≥90 %.

Observability N/A. Rollback Reversible.
