# T1b — `ChartDiagram`'s state, and the skin param

**Read:** `ChartDiagram.java:52-92`, `:123-331`, `wbs/WBSDiagram.ts` (constructor, `sprites`, `annotations`, `scale`), `wbs/wbs-skin-param.ts`, `core/TitledDiagram.ts`, D2, D3.

**Do:**

1. `chart-skin-param.ts` per D2. A member the chart path never reaches throws `unported:`, as wbs's do.
2. `ChartDiagram.ts`: `LegendPosition`, `GridMode` (`OFF`, `MAJOR`, `BOTH`), `StackMode`, `Orientation`; `xAxisLabels`, `xAxisTitle`, `xAxisTickSpacing`, `xAxisLabelPosition`, `xAxis`, `yAxisLabels`, `series`, `yAxis`, `y2Axis`, the rest. `getDescription` is `Chart Diagram`.
3. `addSeries` in full (`:193-255`): the five validations in order, with Java's exact messages, then `this.series.add`, then `includeValue` on `y2Axis` or `yAxis` (`:249`). X-coordinate text uses `Double.toString`, so `X-coordinate 12.0 is outside h-axis range [0.0, 10.0]`: a test holds it. Note `:209` reads `xAxis.getMax() == xAxis.getMin()` after `isAutoScale()`, and `:232` `includeValue` is a no-op by then: keep both. `setGridMode` is unreachable from a registered command and still ports (`:282-286`).
4. Leave `getRenderer` and `getTextBlock` for T3a.

## Acceptance
- Given a `line` with coordinate pairs and categorical `h-axis` labels, when `addSeries`, then the error reads `Coordinate pair notation requires numeric h-axis (e.g., h-axis "x" -5 --> 5), not categorical labels`, and the series is not added.
- Given `h-axis` unset, when a coordinate-pair series is added, then the error is the `explicit h-axis range` one.
- Given a first index-based series, when a coordinate-pair series follows, then the error is `All series must use the same data format (either all coordinate pairs or all index-based)`.
- Given `v-axis` with no range and `bar [150]`, then `getYAxis().getMax()` is 150.

Observability N/A. Rollback Reversible.
