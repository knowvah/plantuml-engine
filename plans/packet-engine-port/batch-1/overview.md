# Batch 1 — nwdiag seams, diagram, blocks

New files only; `renderSync` still reaches the old engine (D9).

| ID | Description | Agent | Writes | Depends On | Done |
|---|---|---|---|---|---|
| [T1a](T1a-nwdiag-seams.md) | `nwdiag/VerticalLine`, `NwDiagram.toSet`, two allowlist entries | typescript-pro | `src/diagrams/nwdiag/{VerticalLine,NwDiagram}.ts`, `tests/architecture/layering.test.ts`, `tests/unit/nwdiag/**` | T0 | [x] |
| [T1b](T1b-diagram-and-layout.md) | `PacketDiagram` model, `build()` and the skin param | typescript-pro | `packetdiag/PacketDiagram.ts`, `packetdiag/packet-skin-param.ts`, `packetdiag/PacketBlock.ts` (model half) | T0 | [x] |
| [T1c](T1c-blocks-and-draw.md) | `PacketBlock`, `PacketIndicator`, `PacketDiagram#getTextBlock` | typescript-pro | `packetdiag/{PacketBlock,PacketIndicator}.ts`, `PacketDiagram.ts` | T1a, T1b | [x] |

Serial (D9), though T1a and T1b share no file.

**Interface T1b gives T1c and batch 2:** `PacketDiagram` with upstream's public setters (`setColWidth`, `updateScaleInterval`, `updateNodeHeight`, `setScaleDirection(string)`, `setSameHeight`, `addPacketItemRange(start, end, height, desc, textRotation)`, `getLastPacketEnd(): number | undefined`), `checkFinalError()` calling `build()`, `getStyle()`, `getSkinParam()`, `annotations`. **T1c adds** `getTextBlock()`.

**Interface T1a gives T1c and T2a:** `new VerticalLine(y1, y2, skip: ReadonlySet<number>)` with `drawU(ug)`; `NwDiagram.toSet(definition: string | undefined): Map<string, string>`.
