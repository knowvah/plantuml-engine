## Observation: `dotEqual` is blind to declaration order inside a cluster
- **Context**: stdd T6b, zaloga-87 and zumuje-46 went conformant -> diverged (3 px) after reordering a cluster's members, while the survey still reported `dotEqual: true` for both.
- **Finding**: the DOT comparison canonicalises `shNNNN` ids, so two files that declare a cluster's nodes in different orders compare equal. The layout was only ever right because `acc.nodes` happened to carry the order dot-engine needed; the state engine never set `inverted: true` on a LEFT/UP edge, so `svek-dot-top.ts`'s `getNodesOrderedTop` mirror (`Cluster.java:195-209`) never fired for state diagrams.
- **Impact**: a `layoutEqual: false` next to `dotEqual: true` means "same canonical DOT, different first-encounter order"; compare the emitted text's declaration order against the jar's `svek-N.dot` directly (`/tmp/stdd-order-probe.mts` prints `toSvekDot` and `firstEncounterOrder`).
- **Confidence**: High

## Observation: dot-engine's insertion order is `firstEncounterOrder`, not the emitted text
- **Context**: same rows.
- **Finding**: `graph-layout-build.ts#addNodes` inserts nodes in `svek-dot-order.ts#firstEncounterOrder`, which rebuilds graphviz's first-encounter walk from the input graph (edges in lines0, root tops, clusters by `nodeIds` after `topsFirstClusters`). Anything the emitter orders by a flag the input lacks is therefore invisible to the engine as well.
- **Impact**: when a state-side ordering change moves a row, check the edge flags (`inverted`) before suspecting dot-engine.
- **Confidence**: High

## Observation: `SvekEdge#drawU` mixes frames for a group's self-link
- **Context**: polodo-05's `State3 --> State3 : Failed`, 55.44 px right of the raw path.
- **Finding**: `SvekEdge.java:863-869` translates an auto-link of a group by `cluster.width - (rawStart.x - cluster.minX) + dx`; `rawStart` is the un-moved dot path while the cluster has already taken the pass's `moveDelta`, so the link lands `moveDelta` short of the cluster's right edge, and the ink pass (dx 0) saw it exactly on the edge. The jar's `moveDelta` is `6 - minX` in graphviz's own frame, i.e. this port's `ink.dx - originShift.x`.
- **Impact**: any further "jar quirk" involving `dx` needs `DotLayoutResult.originShift` to reproduce the jar's raw frame; it is already threaded to `StateGeometry.originShift`.
- **Confidence**: High
