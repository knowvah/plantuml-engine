## Observation: the one-leaf short-circuit is EntityImageDegenerated, and activity-legacy never ported it
- **Context**: finding the svek path that skips graphviz for one leaf (cov-entity-empty 49x54, cov-relationship 106x63).
- **Finding**: `GraphvizImageBuilder.java:149-158`: `isDegeneratedWithFewEntities(1)` (no groups, no links, one leaf) with a root parent and no `USymbolHexagon` returns `new EntityImageDegenerated(createEntityImageBlock(single), backcolor)` before any DOT is built. `activity-legacy/layout.ts` throws `unported:` for it; description has its own inline `degenerateSingleLeaf`. Ported as `src/core/svek/EntityImageDegenerated.ts` (delta 7, `UEmpty(7,7)` at the far corner, `EntityImageDegenerated.java:46-111`); `layoutChen` flags `geometry.degenerate`.
- **Impact**: activity-legacy and others could reuse the new class; Chen reaches it for every one-entity diagram.
- **Confidence**: High (cov-entity-empty and cov-relationship render byte-identical)

## Observation: Chen links never carry a quantifier, role, url or head/tail decor
- **Context**: deciding what of activity-legacy's edge adapter to copy.
- **Finding**: every Chen command builds `LinkArg.build(label, length)` and `new LinkType(NONE, NONE)`; only a middle decor and bold style are added. The DOT-side `buildEdgeTexts` still builds quantifier blocks (constructor parity); the renderer does not draw them and throws `unported:` for a head/tail decor or a middle decor other than SUBSET/SUPERSET.
- **Impact**: if a later command sets a quantifier, `renderer-edge.ts` needs activity-legacy's `quantifierFields`.
- **Confidence**: High

## Observation: pragma aspect and ratio never reach the DOT
- **Context**: `getDotStringSkek` appends `aspect=` and `ratio=` lines (`net/atmp/CucaDiagram.java:399-415`).
- **Finding**: no engine in this port consumes them (`CucaDiagramBase2.getDotStringSkek` builds the lines; `DotInputGraph.aspect` has no producer in svek engines). Chen follows activity-legacy: not passed.
- **Impact**: `!pragma aspect`/`ratio` on a Chen diagram is a divergence nobody has measured; no fixture covers it.
- **Confidence**: Medium
