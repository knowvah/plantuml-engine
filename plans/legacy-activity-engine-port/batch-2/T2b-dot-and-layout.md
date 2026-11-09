# T2b — svek DOT and layout

**Java:** `svek/CucaDiagramFileMakerSvek.java:59-87` (order of operations and `getOrderedLinks`),
`svek/DotStringFactory.java` (`getMinRankSep`/`getMinNodeSep` at `:243-258`, graph header), `svek/SvekNode`,
`svek/SvekEdge` (DOT attributes: `arrowtail`, `arrowhead`, `minlen`, labels, `color` sentinels), `svek/Cluster` and
`ClusterDotString` for partitions, `svek/GraphvizImageBuilder.java` (note links at `:140-147`, `rankdir`).

**Writes:** `src/diagrams/activity-legacy/{layout,activity-legacy-dot}.ts`, `tests/unit/activity-legacy/dot.test.ts`.
**Reads:** `src/core/graph-layout.ts`, `graph-layout.types.ts`, `graph-layout-build*.ts`, `svek-dot-order.ts`,
`svek-dot-top.ts`, and `src/diagrams/state/state-dot-graph.ts` (the closest existing DOT builder).

## Interface output (consumed by T2c, T2d, T4)

The `DotInputGraph` handed to `layoutGraph` (observable through `setLayoutInputObserver` for the DOT-parity gate) and
the geometry the renderer reads: each leaf's position and image, each link's points, label boxes and decorations,
each cluster's box.

## Acceptance
- Given `bokuba-91-poda774`, then our DOT equals its `svek-1.dot` structurally (node shapes, sizes, edge order and
  attributes, `nodesep=0.277778`, `ranksep=0.555556`), checked with `scripts/dot-sync-report.ts --slug`.
- Given three more rows with `if`, a partition and a note (pick from `planning-rows.json`), then the same.
- Given `lap-ltr`, then `rankdir=LR` as the oracle DOT has it.

Observability: N/A — no new observable operations. Rollback: Reversible.
