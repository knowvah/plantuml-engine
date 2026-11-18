# Batch 1: the DOT

Serial: each task edits `activity-legacy-dot.ts`. The batch is done when every drawable fixture's DOT is structurally
EQUAL to its jar `svek-1.dot`, or pushed forward with a filed issue (T1c only).

| ID | Description | Agent | Writes | Depends On | Done |
|---|---|---|---|---|---|
| [T1a](T1a-special-point.md) | Special point, `a`/`p0`/`i`/`p1` wrappers, `za` edge ends; fixtures in | orchestrator | `Cluster.ts`, `activity-legacy-dot.ts`, fixtures, baselines | T0 | [x] |
| [T1b](T1b-swimlane-wrap.md) | The swimlane branch of the shared wrappers | orchestrator | `svek-dot-wrappers.ts` and its consumers | T1a | [x] |
| [T1c](T1c-kermor-point.md) | Kermor's undeclared special point | orchestrator | `activity-legacy-dot.ts`, emitter/builder if needed | T1a | [x] |

**Interface T1a → T1b/T1c/T2a:** a linked partition's `DotInputCluster` carries `unwrappedNodeId =
getSpecialPointId(group)`, listed in `nodeIds`; the edge's `from`/`to` is that id; `ActivityLegacyDot.nodes` (the
`SvekNode`s) never holds it. `ActivityLegacyDotEdge` gains `tailCluster?`/`headCluster?: ActivityLegacyDotCluster`
(`ltail`/`lhead`, `SvekEdge.java:252-258`), which T2a reads.
