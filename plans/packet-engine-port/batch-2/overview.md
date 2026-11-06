# Batch 2 — commands and factory

New files only; `renderSync` still reaches the old engine (D9).

| ID | Description | Agent | Writes | Depends On | Done |
|---|---|---|---|---|---|
| [T2a](T2a-commands-and-factory.md) | The 8 commands and `PacketDiagramFactory` | typescript-pro | `packetdiag/command/Command*.ts`, `packetdiag/PacketDiagramFactory.ts`, `tests/unit/packetdiag/command/**` | T1a, T1b | [x] |

**Interface T2a gives T3a:** `parsePacket(source: UmlSource, ...)` shaped as `chart/ChartDiagramFactory.ts#parseChart`, returning the diagram or the refusal chart's factory returns.
