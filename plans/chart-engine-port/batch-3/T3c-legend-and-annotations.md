# T3c — Legend and annotations

**Read:** `ChartRenderer.java:1078-1420`.

**Do:** `calculateLegendDimension`, `drawLegend`, `drawLegendScatterMarker`, `drawAnnotations`.

Traps:

- The legend's four `position` arms (`:1130-1149`), and `RIGHT` adds `AXIS_LABEL_SPACE` under `y2Axis`, as `rupive-64`'s `x=520` shows. Symbols: bar and area a `LEGEND_SYMBOL_SIZE` rect drawn with `ug.apply(color).apply(color.bg())`, line an `hline` at stroke 2.0, scatter `drawLegendScatterMarker` at size `12 * 0.7`.
- The legend default colour is `s.getColor()`, else `getDefaultColor(i)`, then the style overrides only when `getColor()` is null. Its scatter arm goes through `MarkerColor` first, so black.
- `drawLegendScatterMarker`'s triangle uses `addPoint(0, -size / 2)` and two more, translated by `dx(x).dy(y)`.
- Annotations: `instanceof Double` to `typeof`; a numeric x on a vertical chart reads `yAxis` (`:1319`) and a horizontal chart's y (`:1315`), which looks wrong and is the jar. An unknown categorical label `continue`s (`:1325-1326`). `minSpaceAbove` is `textDim.getHeight() + 40`. The arrow is `ULine(0, arrowLength)` then a polygon `(0,0) (-5,-8) (5,-8)`, and arrow colour is the merged annotation style's `LineColor`.

## Acceptance
- Given `babadu-29`, then `calculateDimension` is 583 x 410 (480 plus the 93 wide legend and its 10 margin), and the final canvas is 604 x 431.
- Given `rupive-64`, then the legend rect is `x=520 y=95 width=12 height=12 fill=#3498DB`, stroke `#3498DB` at 1.
- Given `minapa-49`, then the arrow polygon is `430,116,425,124,435,124` in `#181818`, and `Target line` draws above its point with no arrow.
- Given an annotation at an unknown label, then nothing draws for it.

Observability N/A. Rollback Reversible.
