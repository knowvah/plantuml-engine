# Batch 1 — skin, activity Ftiles, grid core

| ID | Description | Agent | Writes | Depends On | Done |
|---|---|---|---|---|---|
| T1a | `SkinParamFresh` takes the preprocessing options and answers what the Ftiles read | orchestrator or typescript-pro | `src/core/skin/SkinParamFresh.ts`, a colour slice if absent, tests | T0 | [x] |
| T1b | Port `Hexagon`, `FtileCircleStart`, `FtileDiamondWIP`, `FtileDiamond`, `FtileBox` | orchestrator or typescript-pro | `src/diagrams/activity/ftile/**`, tests | T1a | [x] |
| T1c | Port the grid core: chains, navigators, coords, cells, puzzles, `Grid`, the cleaners | orchestrator or typescript-pro | `src/diagrams/bpm/` (17 files), tests | T0 | [x] |

Serial in this order (D10). T1c depends on nothing in T1a/T1b except `ConnectorPuzzleEmpty`'s klimt drawing, which uses
only `ULine`/`UTranslate`/`HColors`.

Interface outputs consumed by batch 2:
- T1a: `new SkinParamFresh(classpath?, options?)` where `options` is the preprocessing artifact's option object;
  `options().getValue(OptionKey.DEBUG)`; legacy colour read for `ColorParam.activityBackground`/`activityBorder`.
- T1b: `new FtileCircleStart(skinParam, swimlane: undefined, style, colors)`,
  `new FtileDiamond(skinParam, backColor, borderColor, swimlane: undefined)`,
  `FtileBox.create(skinParam, display, swimlane: undefined, BoxStyle.PLAIN, stereotype: undefined, styleBuilder: undefined)`;
  each is a `TextBlock` (`drawU`, `calculateDimension`).
- T1c: `Grid` with `getRoot`, `getCell(coord | line, col)`, `getById(id): Coord | undefined`, `linesOf`, `colsOf`,
  `addConnections`, `toArray(skinParam)` (calls `GridArray`, so T1c leaves `toArray` to T2a or stubs its import —
  journal which); `Placeable` interface; `ConnectorPuzzle.Where`.

## Batch close
Gates from the README. No survey: nothing is reachable from `renderSync` yet, except T1a's `SkinParamFresh` change —
run `npm run svg:survey -- unknown --out /tmp/bpe-b1/parity-unknown.json` and `verdict-diff` against `<base>` to show
creole and help did not move.
