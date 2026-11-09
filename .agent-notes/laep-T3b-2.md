## Observation: GvGraphBuilder#addEdge ignores the subgraph it is called on
- **Context**: porting the swimlane lane edges, which the jar writes inside the cluster subgraph.
- **Finding**: `addEdge` on a subgraph builder creates the edge in the ROOT (`node_modules/@knowvah/dot-engine/src/api/builder.ts:246-259`), so cgraph's "an edge in a subgraph makes both endpoints members" does not happen; members are added with `addNode` on the subgraph.
- **Impact**: any DOT feature relying on edge-induced subgraph membership must add the nodes explicitly.
- **Confidence**: High

## Observation: swimlane lane lines are drawn from y = 0 of the unmoved ug
- **Context**: first render of xoxite-49 had lines at y 7.6, jar at 0.
- **Finding**: `Cluster#drawSwinLinesState` draws at absolute y = 0; `moveDelta` moves only `rectangleArea`/`xyTitle` (`Cluster.java:129-136, 438-446`), so nodes sit in the svek frame while lines do not follow the ink y shift.
- **Impact**: renderer-svek-result.ts applies originShift to nodes/edges and only the x shift to swimlane clusters.
- **Confidence**: High
