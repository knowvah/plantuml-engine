## Observation: an edge to an undeclared node is dropped on both DOT paths
- **Context**: lpl T1c, kermor's special point, which the jar names in edges but never declares (`ClusterDotStringKermor.java:69-165`).
- **Finding**: `svek-dot-emit.ts#emitBody` (`emitEdges`) and `graph-layout-build-edges.ts#addEdges` both skip an edge whose `from`/`to` has no `DotInputNode` ("defensive", from the old engine). A graphviz-implicit node must be modelled as `DotInputNode.implicit` (no statement, no colour value, its own id, met at its first edge mention, laid out with graphviz defaults).
- **Impact**: any future engine whose jar DOT names an undeclared node needs `implicit`, not a lifted guard.
- **Confidence**: High

## Observation: dot-engine sizes a default `\N` label like native only under the LUT measurer
- **Context**: lpl T1c, sizing the implicit `zaent0001` ellipse.
- **Finding**: on the jar's `svek-1.dot`, native `dot` 16.1.0 gives `width=1.3553`; dot-engine's Node default measurer (graphviz's headless estimate) gives 1.4089, but `LutTextMeasurer` (installed by `src/core/dot-engine-measurer.ts` for every layout) gives 1.3553 and every native position. A standalone probe that does not import that module measures the estimate.
- **Impact**: probes comparing dot-engine to native must `setTextMeasurer(new LutTextMeasurer())` first, or they blame dot-engine for the wrong measurer.
- **Confidence**: High
