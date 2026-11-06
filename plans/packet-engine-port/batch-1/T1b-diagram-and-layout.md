# T1b — `PacketDiagram`: model, `build()`, skin param

**Read:** `PacketDiagram.java` (whole, minus `getTextBlock`), `chart/ChartDiagram.ts`, `chart/chart-skin-param.ts`, D2, D6.

**Do:**

1. `packetdiag/packet-skin-param.ts`: mirror `chart-skin-param.ts`, plus `getPragma()` (`PacketBlock.java:228`). Members packet never reaches throw `unported:`, as chart's do.
2. `packetdiag/PacketDiagram.ts`: `extends TitledDiagram` with `DiagramType.PACKET`. Port the fields with their Java defaults (`DEFAULT_COL_WIDTH = 16`, `bitWidth 24`, `bitHeight 32`, `scaleInterval = colWidth / 2` as integer division), every setter with its guard, `PacketItem` with `ofRange` and both `toPacketBlock`s, `ScaleDirection`, `getStyle()` on `root, element, packetdiagDiagram`, and `build()` → `adjustLayout`, `adjustColWidth`, `adjustIndicators`, `adjustBitWidth` in that order. `checkFinalError()` calls `build()` then `super`.
3. `adjustLayout` (`:411-458`): the overflow split, `rowCnt = p.width / remainRowWidth` **after** `remainRowWidth = colWidth`, the `remain == 0` re-close of the last row's block, `sameHeight`, then RTL reversal per row. Java `int` division is `Math.trunc`.
4. `textRotation` is set on `PacketItem` and never passed on (D6): comment the drop with `toPacketBlock:521-528`.
5. `packetdiag/PacketBlock.ts`, model half only: both constructors, `openLeft`, `openRight`, `getWidth`, `getHeight`, `setHeight`, `getDrawWidth`, `getDrawHeight`, `getLabel`. T1c adds the style, label and draw methods to the same class.

## Acceptance
- Given `packet-tcp-header`'s items, when `build()` runs, then the grid is 8 rows: six `[16]` (the two 32-bit fields split into two rows each), then `[4,6,1,1,1,1,1,1]`, then `[16]`, the 15 rects of `in.svg` at y 56 to 294, and `bitWidth` is 42 (`FontSize` 14 × 3; rect width 672 = 16 × 42).
- Given `packet-spanning-field` and `packet-rtl`, then the grid's widths and order match the rects of their `in.svg`.
- Given `colwidth = 0` or `scale_interval = 0`, then the guards keep 16 and the default interval; given `scale_interval = 40` at colwidth 16, then it clamps to 16.
- Given `1: A [rotate=270]`, then the block carries no rotation (D6).

Observability N/A. Rollback Reversible.
