# Batch 2 — diagram, commands, factory

Serial (D9). Still unreachable from `renderSync` until T3a.

| ID | Description | Agent | Writes | Depends On | Done |
|---|---|---|---|---|---|
| T2a | `NwDiagram` grows from `toSet` to the whole class | typescript-pro or orchestrator | `src/diagrams/nwdiag/NwDiagram.ts`, `tests/unit/nwdiag/NwDiagram*.test.ts` | T1c | [x] |
| T2b | The 8 commands, `CommandFootboxIgnored`, the factory and the skin param | typescript-pro or orchestrator | `src/diagrams/nwdiag/Command*.ts`, `NwDiagramFactory.ts`, `nwdiag-skin-param.ts`, `tests/unit/nwdiag/command*.test.ts`, `NwDiagramFactory.test.ts` | T2a | [x] |

## Interface contracts

T2a outputs, consumed by T2b and T3a: `class NwDiagram extends TitledDiagram` with `openGroup(name)`,
`openNetwork(name)`, `closeSomething()`, `link(n1, n2)`, `addElement(name, definition)`, `setProperty(p, v)`, each
returning the port's `CommandExecutionResult`; `makeDiagramReady()`; `getTextBlock(): TextBlock`;
`getDefaultMargins()` = `none()`; static `toSet` unchanged (packet calls it).

T2b outputs, consumed by T3a: `parseNwdiag(source, preprocessing, emoji?): NwDiagram | <the refusal shape
PacketDiagramFactory.ts returns>`, mirroring `parsePacket`.

## Batch close

Per [task-contract.md](../task-contract.md#batch-close), steps 1 and 4 (no survey yet).
