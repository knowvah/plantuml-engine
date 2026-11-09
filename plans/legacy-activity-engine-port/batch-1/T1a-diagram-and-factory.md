# T1a — `ActivityDiagram`, `ConditionalContext`, factory skeleton, plugin parse

**Java:** `activitydiagram/ActivityDiagram.java` (172 lines), `ConditionalContext.java` (71),
`ActivityDiagramFactory.java` (102), `net/atmp/CucaDiagram.java` for every inherited call
(`quarkInContext`, `reallyCreateLeaf`, `gotoGroup`, `endGroup`, `getUniqueSequence`, `cleanId`, `updateLasts`).
Also the four shared commands the factory lists first: `command/UBrexCommandFootboxIgnored.java`,
`CommonCommands.addCommonCommands1`, `command/UBrexCommandRankDir.java`, `classdiagram/command/UBrexCommandHideShow2.java`.

**Writes:** `src/diagrams/activity-legacy/{ActivityDiagram,ConditionalContext,ActivityDiagramFactory,index}.ts`,
any shared command it ports (D2), `tests/unit/activity-legacy/{ActivityDiagram,ConditionalContext,ActivityDiagramFactory}.test.ts`.
**Reads:** `src/core/cucadiagram/CucaDiagram*.ts`, `src/diagrams/description/index.ts` (how a cuca engine builds
its diagram and handles common commands), `src/diagrams/board/BoardDiagramFactory.ts` (a recent factory port and its
refusal shape), `src/core/dispatcher-types.ts:330` (`SyncPlugin`).

## What to build

- `ActivityDiagram extends CucaDiagram`, `DiagramType.ACTIVITY`, `setNamespaceSeparator(null)`, with every method of
  the Java class, `getDotStrings` and the deprecated getter included (D9).
- `ConditionalContext`, throwing on a non-`BRANCH` entity.
- `ActivityDiagramFactory` with `initCommandsList` in upstream order. Commands T1b to T1d have not ported yet are
  listed as named placeholders that never match, each with a `TODO(T1x)` the later task deletes.
- `index.ts` exports `activityLegacyPlugin` with `parse` only wired (layout and render throw "not yet ported" until
  T2c). Not registered: that is T3a.

## Interface output (consumed by T1b to T2d)

`parse(source)` returns the populated `ActivityDiagram` (leafs, groups, links, notes, pragma, skin params,
annotations) or a `ParseRefusal`. Commands mutate the diagram through its upstream methods only; no side table.

## Acceptance
- Given `@startuml` + `@enduml` with nothing between, when parsed, then the result mirrors the jar's empty-diagram
  behaviour for this factory (read `PSystemCommandFactory` and quote it) and a unit test pins it.
- Given `startIf` twice and `endif` once, then `getCurrentContext().getBranch()` is the first branch, and the branch
  codes follow `getUniqueSequence("#")`.
- Given `getStart` called twice, then one `CIRCLE_START` leaf exists, displayed `start`; `getEnd("x")` makes `end$x`.
- Given `hide empty` and `left to right direction` lines, then the factory accepts them through the shared commands.

Observability: N/A — no new observable operations. Rollback: Reversible.
