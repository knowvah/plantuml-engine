# T1c — `PacketBlock`, `PacketIndicator`, `getTextBlock`

**Read:** `PacketBlock.java` (whole), `PacketIndicator.java` (whole), `PacketDiagram.java:148-212`, `klimt/drawing/UGraphicStencil.java`, `klimt/shape/TextBlockUtils.java#mergeTB`, `klimt/shape/TextBlockMemoized.java`, and their ports under `src/core/klimt/`. D6.

**Do:**

1. `PacketBlock.ts`: the fields and setters (`openerStroke`, `leftOpen`, `rightOpen` kept and never drawn, D6), `getStyle` on `root, element, packetdiagDiagram, rectangle`, `getFashion`, `getLabelTextBlock` (`Display.getWithNewlines(pragma, label).create8(..., CENTER, ..., CreoleMode.SIMPLE_LINE, LineBreakStrategy.NONE)`), `getLabelTextBlockAbbr` with its char-by-char loop exactly as written (it measures `labelDim + padDim` but assigns `labelDim` from the abbreviation), and `getShapeTextBlock` with `vMargin = 10`, the spacers, the zero-size early return, `UGraphicStencil`, rounded rect and shadow.
2. `PacketIndicator.ts`: `extends TextBlockMemoized`, `V_LINE_FULL = 32`, `V_LINE_SHORT = 16`, `drawU` that always measures the number, `calculateDimensionSlow` via `mergeTB`, `createNumberTextBlock` (`NO_CREOLE`, LEFT) and `createVLineTextBlock` over T1a's `VerticalLine`.
3. `PacketDiagram#getTextBlock`: `calculateDimension` with the last-block `rowHeight` (`:170`) and `drawU` translating as Java does.
4. Tests draw through `UGraphicSvg` and compare fragments of the cached `in.svg`s.

## Acceptance
- Given `packet-tcp-header`, when its `getTextBlock` is drawn at the default margin, then `<text x="6.106" y="20.889" ...>0</text>`, `<path d="M10,24 L10,56" style="stroke:#181818;stroke-width:0.5;" fill="none"/>`, and the first rect `x="10" y="56" width="672" height="34"` with label `x="309.075" textLength="73.85"` match `in.svg`.
- Given a label wider than its block, then it is cut with `...` by the Java loop, checked against an authored oracle (T3c authors it if no vega source has one; until then assert the loop's arithmetic).
- Given rows with heights 2 then 1 in one row and `same_height` false, then `calculateDimension` adds the last block's height, as `:170` does.

Observability N/A. Rollback Reversible.
