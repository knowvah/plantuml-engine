# T2a — The axis commands

**Read:** `command/CommandChartHAxis.java`, `command/CommandChartVAxis.java`, `wbs/CommandWBSLink.ts`, D6.

**Do:** `chart-command-text.ts` holds `javaSplitComma` (trailing empties dropped; `",".split` gives none), `javaTrim` (up to U+0020), `parseLabels`, `parseValues`, `parseCoordinatePairs`, `SPACES` and the shared regex fragments. Then both commands. Traps the old `line-handlers.ts` got wrong:

- `h-axis`: spacing, `label-right` and `grid` apply **before** any return. A numeric range returns `setXAxis(title, min, max)` and never reads `DATA`. Otherwise `setXAxisTitle(title)` runs, with a null title overwriting an earlier one, then `setXAxisLabels`. `SPACING` is `Integer.parseInt`: beyond 2^31-1 it is `Invalid number format in spacing value`. Keep the `<= 0` error though `[0-9]+` only reaches it at 0.
- The h-axis `RANGE` regex leaf is `(-?[0-9.]+)\s*-?->\s*(-?[0-9.]+)`, so `1.2.3 --> 5` matches and then fails `parseDouble` with `Invalid number format in axis range`.
- `v-axis` with `LABELS` **returns before reading the title, range, ticks, spacing, label-top and grid**, and applies to `yAxisLabels` even for `v2-axis`. A title on that line is dropped.
- `v2-axis` with no `y2Axis` yet: `setY2Axis` creates it even with all nulls. `isSecondaryAxis` tests `v2` and `y2` prefixes case-sensitively, after a case-insensitive regex, so `V2-axis` configures the **primary** axis: a test holds this.
- Field order is fixed: `spacing` then `label-top` then `grid` for `v-axis`, and `ticks` before them. `v-axis 0 --> 10 grid spacing 5` is a syntax error.
- `parseCustomTicks` is `[value:"label", ...]`; it splits on every comma, so a label with a comma fails: `Invalid tick format. Expected: [value:"label", ...]`.

## Acceptance
- Given `h-axis "Quarters" [Q1, Q2] label-right`, then labels `[Q1, Q2]`, title `Quarters`, position RIGHT.
- Given `v-axis [A, B]` with `"T"` and a range on the line, then only `yAxisLabels` changes.
- Given `h-axis [A,B,]`, then two labels, as the jar's planning probe drew.
- Given `V2-axis 0 --> 5`, then `y2Axis` stays undefined and `yAxis` is 0 to 5.
- Given `v-axis 0 --> 10 ticks [0:"a,b"]`, then the tick-format error.

Observability N/A. Rollback Reversible.
