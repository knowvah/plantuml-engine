# Batch 1 — layout, model, grid drawing

Serial (D9). Every file is new and unreachable from `renderSync` until T3a, so `npm test` stays green and the unit
tests are the measure.

| ID | Description | Agent | Writes | Depends On | Done |
|---|---|---|---|---|---|
| T1a | `next/` layout: stages, bars, boxes, Tetris packing, the play field, the array | typescript-pro or orchestrator | `src/diagrams/nwdiag/next/{NStage,Staged,NBar,NBox,NTetris,BooleanGrid,NPlayField,NwArray}.ts`, `tests/unit/nwdiag/next/**` | T0 | [x] |
| T1b | `core/` model: networks, groups, servers (no drawing) | typescript-pro or orchestrator | `src/diagrams/nwdiag/core/{NStackable,Network,NwGroup,NServer}.ts`, `tests/unit/nwdiag/core/**` | T1a | [x] |
| T1c | Grid drawing: server cells, links, tubes, groups | typescript-pro or orchestrator | `src/diagrams/nwdiag/next/{NServerDraw,GridTextBlockSimple,GridTextBlockDecorated}.ts`; `NServer.ts`, `NwGroup.ts` drawing methods; tests | T1b | [x] |

## Interface contracts

T1a outputs, consumed by T1b and T2a:
- `NStage { getNumber(): number; compareTo(o): number }`, statics `getMin`, `getMax`.
- `Staged { getStart(): NStage; getEnd(): NStage; getNWidth(): number; contains(s): boolean }`.
- `NBar implements Staged` with `getParent(): NBox | null`, `setParent`, `addStage(s)`; `NBox implements Staged` with
  `add(bar)`, `getPositions(): ReadonlyMap<NBar, number>`.
- `NPlayField { getStage(n); getLast(): NStage | null; createNewStage(); addInPlayfield(bar); doLayout(): ReadonlyMap<NBar, number>; fixGroups(groups, servers) }`.
- `NwArray { getNbLines(); getNbCols(); get(i, j): NServerDraw | null; getLine(i); set(i, j, v) }`. `NServerDraw` is a
  type-only import until T1c.

T1b outputs, consumed by T1c and T2a: `Network` (`getUp`, `getNstage`, `magicDelta`, `isVisible`, `goInvisible`,
`getY`/`setY`, `setMinMax`/`getXmin`/`getXmax`, `isFullWidth`, `getDisplayName`, `getOwnAdress`, `getColor`);
`NwGroup` (`addName`, `names`, `contains`, `getNboxInternal`, `getNbox`, `setColor`, `setDescription`);
`NServer` (`create`, `connectTo`, `connectMeIfAlone`, `isAlone`, `someAddress`, `blankSomeAddress`,
`learnThisAddress`, `doNotPrintFirstLink`, `printFirstLink`, `getMainNetworkNext`, `getAdress`, `updateProperties`,
`getBar`, `getName`, `getDescription`, `getShape`).

T1c outputs, consumed by T2a: `GridTextBlockDecorated` (`NETWORK_THIN = 5`, `add(i, j, draw)`, `lineHeight(sb, i)`,
`drawU`, `calculateDimension`), `NServerDraw.MAGIC = 15`, `NServer#getDraw(topMargin, conns, networks, skinParam)`,
`NwGroup#getTopHeaderHeight(sb, skinParam)`.

## Batch close

Per [task-contract.md](../task-contract.md#batch-close), steps 1 and 4 (no survey yet).
