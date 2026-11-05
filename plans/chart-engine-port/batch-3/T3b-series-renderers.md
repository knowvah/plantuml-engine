# T3b — Series

**Read:** `ChartRenderer.java:775-923`, `BarRenderer.java` (all), `LineRenderer.java` (all), `AreaRenderer.java` (all), `ScatterRenderer.java` (all), `ChartRenderer.java:933-949`.

**Do:** the four classes and `drawSeries`, name for name. Each has its own `formatValue` and label drawing; keep them per class, since the Java does, unless they are byte-identical and a shared helper keeps the cited name.

Traps:

- `drawSeries` returns with no categories and no coordinate pairs, or no series. Bars draw **first** whatever the source order, then line and scatter in order, then areas stacked. `axis` for a bar group is `barSeries.get(0)`'s. `cumulativeValues` starts as a copy of the first area's values and grows per `:908-920`.
- The bar colour branch: `s.getColor()`, then the style. `barStyle.value(PName.BackGroundColor).asColor` **returns `#F1F1F1`** from `element`, so `getDefaultColor` is reached only by a type-level null: keep it. `ValueNull.asColor` is black, not null. So the scatter trap: `MarkerColor` unset answers black, which `!= null`, so `markerColor` is black whatever `color` was; the legend does the same (`:1207-1209`). The jar's `fosoma-37` draws `#000`.
- Bars: `draw` single, `drawGrouped`, `drawStacked`. `barHeight > 0` guards only the single-vertical arm (`:162`); grouped and stacked draw a zero-height rect. `drawHorizontal` never guards, and `Math.abs` makes a negative value a positive width from `x = 0`. `drawLabel`'s `try` swallows nothing the port can raise, so no `catch` is needed: note it. `BarWidth` reads `value(PName.BarWidth).asDouble()`: `ValueNull` is 0, which fails `> 0`, so the default 0.6 stands; `drawGrouped` ignores it (`0.8`).
- `LineRenderer` draws `ULine` per segment at stroke `2.0`, in the coordinate-pair arm by `valueToPixel`, with `Math.min(values.size() - 1, categoryCount - 1)` in the index arm. Its `System.err` branch is `xAxis == null`, unreachable: drop the print, keep the guard with its citation, or keep neither and cite why; journal it.
- Areas: polygon top then bottom, `ug.apply(color).apply(color.bg())` with **no** stroke set, so it inherits the outer `1.0`. Labels sit at `y - 8`.
- `MarkerShape`'s style read is a string switch that ignores unknown values (`ScatterRenderer#draw`). `MarkerSize` default 8 under `> 0`.

## Acceptance
- Given `babadu-29`, then bar rects are `x=90 y=225 width=60 height=135 fill=#F1F1F1`, stroke `#181818` at 0.5.
- Given `fosoma-37`, then the scatter ellipse is `cx=120 cy=216 rx=4 ry=4 fill=#000` and the line and bar draw per `in.svg`, in the jar's order.
- Given `xejigi-91`, then `<<datapoints>>` ellipses are `#1F77B4` at `rx=5` and `<<highlights>>` polygons `110,265,105,275,115,275` in `#E74C3C`.
- Given `tixexi-49`, `tozute-42`, `cojavo-81`, then stacked and grouped rects match their `in.svg`, including `x=106.667`.
- Given `biniba-95`, then the horizontal rects are `x=70 y=80 width=300 height=60`.
- Given `reseci-41`, then the negative bar and the zero line match `in.svg`.

Observability N/A. Rollback Reversible.
