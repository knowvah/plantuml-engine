# T3a — The frame, axes and grid

**Read:** `ChartRenderer.java:62-773`, `:925-1076`, `ChartDiagram.java:94-121`, `:333-345`, `core/style/ValueNull.ts`, D5.

**Do:** Split into further commits if this runs past about 15 minutes: styles and frame, then `drawYAxis`, then the `drawXAxis` family, then the grid.

1. Constants `MARGIN` 20, `AXIS_LABEL_SPACE` 40, `TITLE_SPACE` 30, `TICK_SIZE` 5, and the legend four, cited to `:81-88`.
2. `ChartStyles.ts`: all the `get*StyleSignature` and `get*Style`. `withTOBECHANGED` plus `forStereotypeItself` merged with `OVERWRITE_EXISTING_VALUE`, as `:959-978`. The class's own `BarRenderer#getBarStyle` and `ScatterRenderer#getScatterStyle` do **not** merge `forStereotypeItself` (`BarRenderer.java:89-96`): T3b ports those separately, so stereotype selectors reach colour and border differently. Keep the difference.
3. `calculateDimension`, `drawU`, `drawYAxis` (three tick arms), `drawVerticalText`, `drawHorizontalAxisTitle`, `drawXAxis`, `drawCategoriesVerticallyOnLeft`, `drawYAxisHorizontally`, `drawGridLines`, `formatValue`, `formatAxisValue`.
4. Traps. `drawVerticalText` uses `UText` directly, not a `Display`: no creole, and `withOrientation(90 | 270)`. `drawYAxis`'s axis-title is drawn with `ug` already carrying the axis stroke. `drawCategoriesVerticallyOnLeft` and `drawYAxisHorizontally` keep the outer `ug`, stroke `1.0` and merged `lineColor` (`:164`), and `drawYAxisHorizontally` builds a font at `UFontFactory.sansSerif(10)` and uses `String.format("%.0f", value)`. Keep the `xAxis == null` tests and the null colour fallbacks even though neither fires: note why in a comment. `drawXAxis` is called with `yAxis` at the zero line (`:180-189`), and the h-tick arm's `startValue` uses `floor`, `drawGridLines`' v arm `ceil`.
5. `ChartDiagram#getRenderer` (`:99-121`) with the horizontal swap, `getTextBlock` returning `this`, `drawU`, `calculateDimension`. `drawSeries`, `drawAnnotations` and `drawLegend` are empty stubs for T3b and T3c; `calculateLegendDimension` goes in T3c, so stub it to 0.

## Acceptance
- Given `babadu-29`'s source with the legend removed, then `calculateDimension` is 480 x 410.
- Given `babadu-29`'s axes, then the first drawn line is `x1=70 y1=60 x2=70 y2=360`, `stroke:#181818;stroke-width:0.5` under the margin translate, and the tick text `20` sits at `x=44.425 y=303.889`.
- Given `sotoju-04`'s custom ticks and `badepu-56`'s `spacing 25`, then tick positions and labels match their `in.svg`.
- Given `rupive-64`, then the v and v2 titles carry `rotate(-90 27 289.319)` and `rotate(90 513 194.906)`.
- Given `biniba-95`, then the category ticks and labels at size 10 match `in.svg`.
- Given a grid-on-v-axis source, then the horizontal grid lines step `range / 10`, as `cojavo-81`'s `in.svg` draws them.

Observability N/A. Rollback Reversible.
