# Batch 2 — players and panels

| ID | Description | Agent | Writes | Depends On | Done |
|---|---|---|---|---|---|
| T2a | `Player`, `AbstractStatePlayer`, `ChangeState`, `TimingNote`, `PlayerFrame`, `IntricatedPoint` | orchestrator or typescript-pro | see task file | T1c | [x] |
| T2b | `TimeConstraint`, `TimeMessage`, `Highlight`, `TimeArrow` | orchestrator or typescript-pro | see task file | T2a | [x] |
| T2c | `Panels`, `PanelsState` and the concise/rectangle/no-left panels, the five shapes, `PlayerConcise`, `PlayerRectangle` | orchestrator or typescript-pro | see task file | T2b | [x] |
| T2d | `PanelsRobust`, `PlayerRobust` | orchestrator or typescript-pro | see task file | T2c | [x] |
| T2e | `PanelsBinary`, `PanelsClock`, `PanelsAnalog`, `PlayerBinary`, `PlayerClock`, `PlayerAnalog` | orchestrator or typescript-pro | see task file | T2c | [x] |

Serial (D15): every task extends `Player.ts` and `graphic/Panels.ts` types. Nothing is reachable from `renderSync` yet;
build players and panels directly in tests, with a `TimingRuler` from T1c and a `timing-skin-param.ts`-shaped stub
(T3a writes the real one; T2a may write it early and journal that).

## Interface contract (T2a/T2c → T2d, T2e, T3a)

```ts
abstract class Player {                        // Player.java:61-162
  constructor(title: string, skinParam: ISkinParam, ruler: TimingRuler, compact: boolean,
              stereotype: Stereotype | undefined, generalBackgroundColor: HColor | undefined)  // ≤5 params: args object (D16)
  addNote(now: TimeTick, note: Display, position: Position, stereotype?: Stereotype): void
  getNotes(); getSkinParam(); getRuler(); getSuggestedHeight(): number; isCompact(): boolean
  getGeneralBackgroundColor(): HColor | undefined
  abstract defineState(stateCode: string, label: string): void
  abstract setState(now: TimeTick, comment: string | undefined, color: Colors, ...states: string[]): void
  abstract createConstraint(tick1: TimeTick, tick2: TimeTick, message: string, config: ArrowConfiguration): void
  drawFrameTitle(ug: UGraphic): void; getFrameHeight(sb: StringBounder): number; setHeight(h: number): void
  panels(): Panels                             // built once, java:153-158
  protected abstract buildPlayerPanels(): Panels
  protected getStyle(): Style                  // root, element, timingDiagram, <sname> withTOBECHANGED(stereotype)
}
abstract class Panels implements TimeProjected {   // graphic/Panels.java:65-192
  abstract drawLeftPanel(ug: UGraphic, fullAvailableWidth: number): void
  abstract drawRightPanel(ug: UGraphic): void
  abstract getFullHeight(sb: StringBounder): number
  abstract getLeftPanelWidth(sb: StringBounder): number
  getTimeProjection(sb: StringBounder, tick: TimeTick): IntricatedPoint | undefined
}
```

`ArrowConfiguration` is `net.sourceforge.plantuml.skin.ArrowConfiguration`. The sequence engine's
`src/diagrams/sequence/sequence-arrowhead.ts` exports an `ArrowConfiguration` typed for sequence; read it first. Import
it if it carries what `TimeConstraint`/`TimeArrow` read; otherwise port the members timing reads into `src/core/skin/`
(upstream's package) and journal it. Never edit the sequence type for timing's sake without a sequence ratchet run.

## Batch close

The task contract's batch close, steps 1 and 4.
