# T2c: the DOT build and layout

**Java:**
- `svek/GraphvizImageBuilder.java` (`buildImage`, `printEntities`, and the single-node short-circuit);
- `svek/DotStringFactory.java:243-258` (`nodesep`, `ranksep`, `rankdir`);
- `svek/SvekEdge.java` (`minlen`, the label `TABLE`, `labelShield`);
- `svek/SvekNode.java` (shape by `ShapeType`).

**Read in the port:** `src/diagrams/activity-legacy/{activity-legacy-dot,layout,layout-geometry,activity-legacy-edge-text,activity-legacy-links}.ts`.

**Do:**
1. `cheneer-dot.ts` builds the `DotInputGraph` with one `SvekNode` per leaf, in leaf order, and one `SvekEdge` per link,
   in the jar's link order. Copy only what Chen reaches (D2). If a Chen link meets a group or a note, throw `unported:`.
2. The cardinality is the link label. Its font is `activityDiagram/arrow` (D4), at size 11 or whatever the Java says.
3. Find the short-circuit that skips graphviz for one leaf and quote it, then reuse activity-legacy's port if it has
   one. `cov-entity-empty` (49×54) and `cov-relationship` (106×63) are the targets.
4. `layout.ts` calls `graph-layout.ts#layoutGraph` and returns the T2c → T2d contract (batch overview).

## Acceptance
- Given `vega-chen-movie`, `cov-cardinality` and `cov-rankdir`, when `setLayoutInputObserver` captures our graph, then
  `compareStructural` against the planning `svek-1.dot` passes. That covers node shapes and sizes, edge endpoints,
  `minlen`, label table sizes, `nodesep`, `ranksep` and `rankdir`.
- Given a one-leaf probe, then no graph reaches the observer.

Observability is N/A: there are no new observable operations. Rollback is Reversible: revert the commit.
