# Batch 3 — diagram, commands, factory

| ID | Description | Agent | Writes | Depends On | Done |
|---|---|---|---|---|---|
| T3a | `TimingDiagram`, `timing-skin-param.ts` | orchestrator or typescript-pro | see task file | T2e | [x] |
| T3b | The player, state and time commands (11) | orchestrator or typescript-pro | see task file | T3a | [x] |
| T3c | The remaining commands (11), `CommandFootboxIgnored`, common commands, `TimingDiagramFactory` | orchestrator or typescript-pro | see task file | T3b | [x] |

Serial (D15). Still unreachable from `renderSync` until T4a; T3c's factory tests drive a whole source to a
`TimingDiagram` and draw it onto `UGraphicSvg`, which is the first end-to-end measure.

## Interface contract (T3a → T3b, T3c, T4a)

`TimingDiagram` keeps the Java's public surface (`TimingDiagram.java:94-430`): `createPlayerRobust/Concise/Rectangle
(code, full, compact, stereotype, backColor)`, `createPlayerClock(code, full, period, pulse, offset, compact,
stereotype)` (args object, D16), `createPlayerAnalog`, `createPlayerBinary`, `createTimeMessage`, `addTime(time, code)`,
`getCodeValue`, `updateNow`, `getPlayer`, `getNow`, `getClockValue`, `setLastPlayer`, `getLastPlayer`, `scaleInPixels`,
`setTimeAxisStategy`, `highlight`, `goCompactMode`, `useDateFormat`, `getTimingFormatDate`, `setStopAt`,
`getTextBlock`, `getDescription()` = `(Timing Diagram)`.

`initCommandsList` order (`TimingDiagramFactory.java:83-109`): common commands 1, `CommandFootboxIgnored`,
`CommandRobustConcise`, `CommandClock`, `CommandAnalog`, `CommandBinary`, `CommandDefineStateShort`,
`CommandDefineStateLong`, `CommandChangeStateByPlayerCode`, `CommandChangeStateByTime`, `CommandAtTime`,
`CommandAtPlayer`, `CommandTimeMessage`, `CommandNote`, `CommandNoteLong`, `CommandConstraint`, `CommandScalePixel`,
`CommandHideTimeAxis`, `CommandHighlight`, `CommandModeCompact`, `CommandTicks`, `CommandPixelHeight`,
`CommandUseDateFormat`, then the commented `// cmds.add(new CommandStopAt());`. Order decides which command claims a
line; keep it.

## Batch close

The task contract's batch close, steps 1 and 4.
