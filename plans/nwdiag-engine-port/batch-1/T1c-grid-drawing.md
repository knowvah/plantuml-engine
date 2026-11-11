# T1c — Grid drawing

**Read:** `next/NServerDraw.java`, `GridTextBlockSimple.java`, `GridTextBlockDecorated.java`; `NServer.java`
`getDraw`, `toTextBlock`, `getFontConfiguration`; `NwGroup.java` `getTopHeaderHeight`, `drawGroup`,
`buildHeaderName`; `VerticalLine.ts`; D3, D8, D10.

**Do:**

1. `NServer#toTextBlock(sname, s)`: null for null, `TextBlockUtils.empty(0, 0)` for `""`, else `", "` replaced by
   `BLOCK_E1_NEWLINE` and `Display.getWithNewlines(pragma, s).create(fontConfiguration, LEFT, skinParam)`. Style
   `root, element, nwdiagDiagram, <sname>`.
2. `NServer#getDraw`: the merged `server` style's `getSymbolContext`, `backcolor` through `getColor` with a missing colour
   ignored, then `getShape().asSmall(...)` (D3).
3. `NServerDraw.ts`: whole class, `MAGIC = 15`, `marginAd`, `marginBoxW()`, `getMinMax`, `drawMe`, `drawLinks`,
   `getTextBlockLink1`, `link2`, `drawCenter`, `naturalDimension`, accessors (D8). Split `drawLinks` into named
   helpers if the hooks demand it (D10).
4. `GridTextBlockSimple.ts` on `TextBlockMemoized`: `MINIMUM_WIDTH = 70`, `drawU`, `colWidth`, `lineHeight` (floor 50),
   `calculateDimensionSlow`, `add`, the two throwing methods, `getMagneticBorder`, `getBackcolor` null.
5. `GridTextBlockDecorated.ts`: `NETWORK_THIN = 5`, `drawGrid` (groups, tubes, links in that order), `drawLinks`,
   `drawGroups`, `isThereALink`, `drawNetworkTube` (shadow from `style.getShadowing()`, the network colour as `bg` over
   the style's), `computeMixMax`.
6. `NwGroup#getTopHeaderHeight`, `drawGroup` (`MinMax.draw(ug, lineColor, backgroundColor)`, header at
   `(minX + 5, minY)`), `buildHeaderName`.

**Tests:** build a two-network, three-server grid by hand and assert cell `naturalDimension`, `lineHeight` and
`colWidth` against `bafega-98-puju017`'s or `befize-38-mine284`'s oracle geometry (tube `rect` x/width, server `rect`
size, link `path` x) drawn through `UGraphicSvg`; `toTextBlock("a, b")` gives two lines; a group's header raises the
cell's top margin by its height. Values come from the oracle SVG, never fitted.

## Acceptance
- Given a cell with a 55.4 × 32 box and no addresses, then `naturalDimension` is `max(20, 85.4, 20)` wide and
  `20 + 30 + 32 + 20` high (MAGIC 15 twice), matching `cov-no-wrapper`'s oracle.
- Given a network linked by columns 1 and 2 of 3, then `computeMixMax` spans exactly those columns; with `width = full`
  it starts at 0 and ends at the last column.
- Given `npm test`, then it passes with every new file at 90/90/90.

Observability N/A. Rollback Reversible.
