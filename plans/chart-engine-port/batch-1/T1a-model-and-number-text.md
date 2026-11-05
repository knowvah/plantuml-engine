# T1a — The chart model, and Java's number text

**Read:** `ChartAxis.java` (all), `ChartSeries.java` (all), `ChartAnnotation.java` (all), `core/svg-format.ts:23-75`, `klimt/sprite/sax/sax-text-image-use.ts:50-66`, D4, D6.

**Do:**

1. `ChartAxis.ts`: a class. `setMin` and `setMax` clear `autoScale`, `valueToPixel` answers `pixelMin` at `max == min` (`ChartAxis.java:112-116`), `includeValue` only under `autoScale`, `hasTickSpacing` means `> 0`. `LabelPosition` as a `const` map. Custom ticks per D6.
2. `ChartSeries.ts`: `SeriesType`, `MarkerShape`, the two constructors as one with an optional `xValues` (`hasExplicitXValues` is `xValues !== undefined`), default marker `CIRCLE`.
3. `ChartAnnotation.ts`: `xPosition` is `number | string`, so the `instanceof Double` test becomes `typeof`.
4. `core/java-number-format.ts`, per D4. Export `javaFixedN` from `svg-format.ts`.

## Acceptance
- Given `javaFormatF`, when `(1.005, 2)` and `(12.5, 0)`, then `1.01` and `13`; `(NaN, 2)` gives `NaN` and `(Infinity, 2)` gives `Infinity`.
- Given `javaFormatE`, when `(0.001, 2)`, `(0.0025, 2)` and `(-0.00123, 2)`, then `1.00e-03`, `2.50e-03` and `-1.23e-03`, the first two as the jar printed them in the planning probe.
- Given `parseDouble`, when `1d`, `1.5f`, `NaN`, `-Infinity`, `0x1p3`, then 1, 1.5, NaN, -Infinity, 8; when `` (empty), `0x10`, `1.2.3`, then it reports failure where `Number` would answer.
- Given `new ChartAxis()` then `includeValue(150)`, then `getMax()` is 150; after `setMax(100)`, `includeValue(150)` leaves 100.

Observability N/A. Rollback Reversible.
