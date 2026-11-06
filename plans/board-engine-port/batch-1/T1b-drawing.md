# T1b — Cards, separators and the diagram

**Read:** `CardBox.java`, `Activity.java#drawMe`, `BoardDiagram.java`, `FontConfiguration.java:63-65`, `HColors.java:94`, `LimitFinder.java:179-188`, `packetdiag/PacketDiagram.ts` and `packet-skin-param.ts` (D2), D6.

**Do:**

1. `CardBox.ts`: 150×70, `setDeltaShadow(1)`, `HColors.BLACK` stroke on `HColors.LIGHT_GRAY` fill, the label as `Display.create(name)` drawn with `FontConfiguration.blackBlueTrue(UFontFactory.sansSerif(14))`, `HorizontalAlignment.LEFT`, translated `(3, 3)`. No style read (D6).
2. `Activity.ts`: `getBox` and `drawMe`, root card first, then each cell in D3 order at `(x × 170, stage × 90)`; the discarded `apply` as a comment.
3. `BoardDiagram.ts` extends `TitledDiagram`: `activities`, `addLine(plus, label)` (empty `plus` starts an activity; otherwise `getLastActivity().addRelease(plus.length, label)`, throwing on none, D10), `getTextBlock` with `calculateDimension` = `getMinMax(this, sb, true).getDimension().delta(10, 10)`, and `drawMe` with the separators on the untranslated `ug`, `UStroke(5, 5, 0.5)`, black.
4. `board-skin-param.ts` from `packet-skin-param.ts`, dropping what board never reads.

**Tests:** drawing gasaxu's text block through `UGraphicSvg` gives the oracle's first rect (`x=10 y=10 width=150 height=70 fill="#C0C0C0"`, the filter reference), first text (`x=13 y=23.889 textLength=36.575`), the three `<line>` separators at y 90, 180, 270 to x 1540, and a dimension that, with the default margin, makes the 1562×373 canvas. If the dimension misses by the canvas's last 2 px, find the mechanism in klimt (`LimitFinder`, `SvgGraphics`) before touching a number.

## Acceptance
- Given gasaxu through the new text block, then the body's rect and text sequence equals `in.svg`'s, with no `dominant-baseline`.
- Given `skin rose` in the skin param, then the card stays `#C0C0C0` (`cov-skin-rose` oracle).
- Given `npm test`, then it passes.

Observability N/A. Rollback Reversible.
