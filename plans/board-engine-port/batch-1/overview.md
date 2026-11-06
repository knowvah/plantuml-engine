# Batch 1 — tree and drawing

New files sit beside the old engine, unreachable from `renderSync` until T3a (D9). Unit tests are the measure.

| ID | Description | Agent | Writes | Depends On | Done |
|---|---|---|---|---|---|
| [T1a](T1a-tree.md) | `BNode`, `BArray` in `HashMap` order, `PostIt`, `Activity`'s tree half | orchestrator | `src/diagrams/board/{BNode,BArray,PostIt,Activity}.ts`, `tests/unit/board/{BNode,BArray,Activity}.test.ts` | T0 | [x] |
| [T1b](T1b-drawing.md) | `CardBox`, `Activity#drawMe`, `BoardDiagram`, `board-skin-param.ts` | orchestrator | `src/diagrams/board/{CardBox,BoardDiagram,board-skin-param}.ts`, `Activity.ts`, `tests/unit/board/{CardBox,BoardDiagram}.test.ts` | T1a | [x] |

Serial: T1b draws T1a's cells. Merge them if `Activity` cannot land without its draw half (pep journal row 6 precedent); journal it.
