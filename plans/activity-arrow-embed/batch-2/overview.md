# Batch 2: the two rows

| ID | Description | Agent | Writes | Depends On | Done |
|---|---|---|---|---|---|
| [T2](T2-block-measure.md) | Port the block measure so `act3` reaches 0 | orchestrator / typescript-pro | `edge-label-anchor.ts`, activity sheet, tests | T1 | [x] |
| [T3](T3-open-reserve-origin.md) | Every consumer reads that measure, so `act3-open` reaches 0 | orchestrator / typescript-pro | `tile-layout-inlabel.ts`, `canvas-origin-text-ink.ts`, `activity-draw-extent.ts`, tests | T2 | [x] |

Serial: T3 consumes T2's measure. The write-sets are T1's expected files; T1's journal entry overrides them.

**Interface contract (T2 → T3).** `edgeLabelBlockSize(label, theme, measurer?, wrapped?)` keeps its signature and
returns `{ width: number; height: number }`, the jar's `text.textBlock.calculateDimension(stringBounder)`
(`Snake.java:247`). If T1 shows a consumer needs a second quantity (for example the drawn image extent for ink),
T2 exports it next to the measure as a named function with its own `@see`, and T3 imports it; no consumer re-derives
either.

If T1 finds the 31.5 shift is the same mechanism as the block height, T2 may bring `act3-open` to zero too. Then T3
only verifies every consumer reads the measure and pins; journal it.

**T1 override (2026-11-22, journal row 6).** T2 writes `layout/compress/edge-label-anchor.ts` only (anchor a label on
its block's first draw) plus `tests/diagrams/activity/aae-arrow-embed-block.test.ts` and the authored gate. T3 writes
`layout/canvas-origin-text-ink.ts` (`extendForEdgeLabelText` reads `edgeLabelLayout`), `layout/tile-layout-inlabel.ts`
(`inLabelReservation` reads the drawn block's ink, not the `35 + height` reserve, which is already right),
`edge-label-anchor.ts` (the shared ink helper), its test and the authored gate. The activity sheets and
`activity-draw-extent.ts` do not change.

**Close:** the README gates, then `npm run svg:survey` and `verdict-diff.mjs 229a5a836` (0 lost), census check,
`npm run parity:dashboard`, journal.
