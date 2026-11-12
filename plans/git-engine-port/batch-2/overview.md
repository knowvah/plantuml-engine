# Batch 2 — drawing, layout bridge, diagram, factory

Serial in the main checkout (D10). Nothing is reachable from `renderSync` until T3a, so the unit tests are the
measure.

| ID | Description | Agent | Writes | Depends On | Done |
|---|---|---|---|---|---|
| T2a | [`Arrow`, `MagicBox`, `GitCurve`](T2a-drawing.md) | orchestrator or typescript-pro | `src/diagrams/json/Arrow.ts`, `src/diagrams/git/{MagicBox,GitCurve}.ts`, `tests/unit/{git,json}/**` | T1b | [x] |
| T2b | [`SmetanaForGit`, `GitDiagram`, `GitDiagramFactory`, export](T2b-diagram.md) | orchestrator or typescript-pro | `src/diagrams/git/{SmetanaForGit,GitDiagram,GitDiagramFactory,git-export}.ts`, `tests/unit/git/**` | T1a, T1b, T1c, T2a | [x] |

## Interface contracts

T2a → T2b:
```ts
class MagicBox {
  constructor(skinParam: ISkinParam, node: GNode);
  getBigDim(stringBounder: StringBounder): XDimension2D;
  drawBorder(ug: UGraphic, sizeInDot: XDimension2D): void;
}
class GitCurve {
  // points: the engine's bezier list; ep: the arrow point, or undefined when absent. Both are in the engine's y-up frame.
  constructor(points: readonly XPoint2D[], ep: XPoint2D | undefined, xMirror: Mirror);
  drawCurve(color: HColor, ug: UGraphic): void;
}
```
`GitCurve`'s constructor takes the engine edge where the Java takes `ST_Agedgeinfo_t`. That adapter is the only
signature change, and it is documented on the class with `GitCurve.java:57-79`.

Observability: N/A — no new observable operations. Rollback: Reversible (each task is one revertible commit).
