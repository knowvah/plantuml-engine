# aae T1 — the activity-3 arrow-label embed, diagnosed (issue #188, 2026-11-22)

Evidence: the instrumented jar probe in `plans/activity-arrow-embed/measurements/aae-probe.patch` (upstream classes at the
oracle seam commit `8fec366a9`, `System.err` lines only), and temporary `AAE_TRACE` logging in our
`compress-geometry.ts`, `canvas-origin.ts`, `canvas-origin-text-ink.ts` and `assemble-svg-activity.ts` (removed).

## Observation: the jar's arrow-label block is not 10 tall; compression produces the 20-long arrow and y 92
- **Context**: T1 step 1, the README's "10-tall block" inference (`y = mid - 5`).
- **Finding**: The jar's `Snake#getTextBlockPosition` (`activitydiagram3/ftile/Snake.java:244-250`) receives the full
  block: `dim=[61,68]` (act3), `[532,227]` (act3-open), `[61,79]` (act3-mixed). `FtileFactoryDelegatorAssembly#assembly`
  (`ftile/vcompact/FtileFactoryDelegatorAssembly.java:58-63`) reserves `35 + 68 = 103`, so the raw arrow runs
  87 → 190 and the image's raw top is `138.5 - 34 = 104.5`. Then `ActivityDiagram3.java:209-210` wraps the drawing in
  `CompressionXorYBuilder` ON_X then ON_Y. Its `SlotFinder` (`klimt/compress/SlotFinder.java:84-109`) has no branch
  for `UImageSvg`, so the label's image occupies no slot; the free slot between the box and the arrowhead is removed
  (`CompressionXorYBuilder.java:65-66`, `reverse().smaller(5.0)`), and `CompressionTransform#transform`
  (`CompressionTransform.java:47-64`) maps every point inside a removed slot to the slot's start. The image's own draw
  point (its top-left, drawn through `UGraphicCompressOnXorY#draw`'s fallthrough arm,
  `UGraphicCompressOnXorY.java:116`, `getUg().apply(getTranslate(x, y)).draw(shape)`) lands at 92 = 87 + 5.
  "mid - 5" is a coincidence of the 5-px slot margin, not a block height.
- **Ruled out**: (a) a 10-tall `calculateDimension`: the probe prints 61x68 at `Snake.java:247`; (b) a different
  `StringBounder` for reserve vs draw: both calls print `FileFormat$1`; (c) the oracle seam: the stock jar shows the
  same placement (README); (d) `SheetBlock1` padding: `padding=0.0:0.0:0.0:0.0` printed.
- **Impact**: Never fit 10. The 1-line embed block is ported correctly; the fault is in how its anchor rides through
  compression.
- **Confidence**: High

## Observation: ours anchors an embed-first label on a text baseline that compression clamps (act3, the 27.111)
- **Context**: T1 step 2, `edgeLabelBlockSize` and `edge-label-anchor.ts`.
- **Finding**: `edgeLabelBlockSize` returns 61x68 (as the jar). Our raw points are the jar's (87 → 190, 87 → 349,
  87 → 201). `labelAnchors` (`src/diagrams/activity/layout/compress/edge-label-anchor.ts:146-151`) anchors every label
  at `(x, top + size * ASCENT_FRACTION)` = 113.056 raw, the first `UText`'s baseline, even when the block's first draw
  is the `<image>`. The trace: raw 113.056 → ON_Y `ct` → 77 (internal, inside the removed slot, so the slot start),
  the same value the jar's 104.5 maps to. The renderer then recovers the top as `baselineY - 11 * 7/9`, drawing the
  image at 92 - 8.556 = 83.444. The 27.111 "block" is `2 * (97 - 83.444)`: no block of that height exists. The anchor
  offset is not compression-invariant once the anchor falls inside a removed slot.
- **Origin**: ours `edge-label-anchor.ts:146-151` (`labelAnchors`) and `:171-184` (`withLabelDeltas`); upstream
  `UGraphicCompressOnXorY.java:116` maps the image's own draw point. `if-label` already handles the same case
  (aar-T6b, `shapes-of.ts#ifLabelTextAnchor`: "a label whose first draw is an image is anchored on that draw's own
  point").
- **Why act3-mixed agrees**: its first draw is the `hi` `UText`, so the baseline anchor is the right draw point, and the
  image sits one stripe below it inside the same kept text slot.
- **Ruled out**: the block measure (61x68 both sides); the creole stripe walk (one `EmbeddedDiagram` stripe both
  sides); the reserve (identical raw points).
- **Confidence**: High

## Observation: act3-open's 31.5 shift is the canvas-origin ink ignoring `labelDelta`
- **Context**: T1 step 3.
- **Finding**: `extendForEdgeLabelText` (`src/diagrams/activity/layout/canvas-origin-text-ink.ts:136-160`) places the
  block with `getTextBlockPosition(edge.points, dim, …)` on the compressed points, without the compression
  `labelDelta` the renderer applies (`edgeLabelLayout`). Trace for act3-open: compressed points 72 → 92 (internal), mid
  82, top `82 - 227/2 = -31.5`, so the ink's minY is -31.5 and every node shifts 31.5 down. The jar's canvas is the
  `LimitFinder` extent of the compressed drawing (`CompressionXorYBuilder.java:87-89`, `getMinMax` draws `this`,
  i.e. through `UGraphicCompressOnXorY`), so its label ink sits where the image is drawn (92). For act3 the same
  misplacement exists (top 48 internal) but stays inside the other nodes' ink, so it is invisible there.
- **Origin**: ours `canvas-origin-text-ink.ts:151`; upstream `CompressionXorYBuilder.java:87-89` +
  `LimitFinder.java:199-202` (`drawImageSvg`).
- **Ruled out**: the reserve (raw points equal the jar's); the block height (227 both sides); `RECENTRED` margins
  (the delta is exactly the label's misplaced top).
- **Confidence**: High

## Observation: the 1-px canvas width is the in-label reservation, same family (in scope, D1)
- **Context**: T1 step 4.
- **Finding**: our fragment width is 115 from the layout ink, while the drawn fold (`drawnMaxX`) is 95, the jar's
  `ensureVisible` value. The label's own ink is right (`TextBlockUtils.getMinMax` → our `LimitFinder#drawImage`,
  `x + w - 1` = 77.3375, as `LimitFinder.java:199-202`). The extra pixel is the walk-time
  `inLabelReservation` (`src/diagrams/activity/layout/tile-layout-inlabel.ts:98-118`): it re-derives the label's ink
  from text-line arithmetic (`lines`, `fontSize`) with `width = dim.width - 2 * pad` = 61, reaching `x + 61` =
  78.3375. Upstream has no such reservation; the jar's ink is the block's own draw. For a text label the arithmetic
  equals `LimitFinder#drawText` (`LimitFinder.java:216-224`), which is why only embed rows show it.
- **Origin**: ours `tile-layout-inlabel.ts:113-117`.
- **Ruled out**: the label ink (77.3375, correct); `drawnMaxX` (95, as the jar); a separate canvas mechanism: the
  trace shows the reservation is the only contributor past 77.3375.
- **Confidence**: High

## Observation: the reserve follows the jar's expression
- **Context**: T1 step 5.
- **Finding**: `FtileFactoryDelegatorAssembly.java:58-63` reserves `35 + textBlock.calculateDimension(sb).getHeight()`
  for every label, embed or not (probe: 103, 262, 114). The 20-long arrow of an embed-only label is compression
  removing that reserve (the image occupies no slot); a 3-line text label keeps it because its `UText` slots do
  (`SlotFinder.java:121-128`). Ours produces the same raw points for all three rows (trace), so the reserve needs no
  change.
- **Ruled out**: a label-type-dependent reserve: the Java has one expression.
- **Confidence**: High

## Consequences for batch 2
- T2: anchor a label on its block's first draw (`UText` baseline or image top-left), in `edge-label-anchor.ts`
  only; text-first labels keep today's anchor exactly.
- T3: `extendForEdgeLabelText` reads `edgeLabelLayout` (delta-aware), and `inLabelReservation` reads the drawn block's
  `LimitFinder` extent; both through one exported helper next to the measure. `tile-layout-inlabel.ts`'s reserve,
  `activity-draw-extent.ts` and the activity sheets do not change.
- No `src/core/` change, so no other engine's gates beyond the every-engine survey.
