# T2b: the adapter, cluster half

**Goal:** every member `MyElkCluster` and the maker's group walk read answers from the legacy model (D1), so that when
T3a wires the adapter in, a partition, a nested partition, an empty partition and an inner activity all lay out.

## Port
- **The walk** (`CucaDiagramFileMakerElk.java:315-360`): `getChildrenGroups(group)`, `isRemoved`, `isEmpty(g)`,
  `getGroupType(g)`, `muteToType(g, LeafType.EMPTY_PACKAGE)` for an empty `PACKAGE` (`:320-322`), `groupLeafs(g)`,
  `getParentContainer`. `printSingleGroup` skips only `CONCURRENT_STATE`; a legacy `CONCURRENT_ACTIVITY` or
  `INNER_ACTIVITY` group is a cluster like any other. After `muteToType`, `calculateDimension` and `drawLeaf` answer
  with the empty-package image: find what the svek path draws for `partition-empty.puml` and reuse it.
- **Header** (`ClusterHeader`, `:329-331`; `MyElkCluster.java:109`, `:154`): `core/svek/ClusterHeader.ts`
  (`createClusterHeader`) is the port; feed it what the legacy svek cluster feeds it
  (`activity-legacy/renderer-cluster.ts#buildCluster`).
- **Style** (`MyElkCluster.java:93-116`, `:145-149`; `Cluster.java:441-457`, `:683-712`): the legacy svek cluster
  already resolves `getDefaultStyleDefinition(activityDiagram, USymbols.PACKAGE, groupType)` in
  `renderer-cluster.ts`. Export and reuse those helpers rather than re-deriving the cascade; `getClusterBackColor`
  honours a partition's own colour (`lap-partition`'s `#LightSkyBlue`).
- **Skin params:** `packageStyle()` reads `skinparam packageStyle` as `renderer-cluster.ts#packageStyleOf` does;
  `getPackageTitleAlignment`, `getStereotypeAlignment` from the legacy skin param.
- If the adapter would pass 500 lines, move the cluster half to `activity-legacy-elk-cluster.ts` as functions the
  adapter delegates to.

## Red
Extend the adapter test with `tests/fixtures/activity-legacy/elk-lap-partition.puml`,
`elk-partition-empty.puml` and `elk-lap-inner-brace.puml`: `getChildrenGroups('')` ids, `getGroupType` per group
(`PACKAGE`, `INNER_ACTIVITY`), `isEmpty` true only for the empty partition, `getType` after `muteToType`, the header's
`getTitleAndAttributeHeight()` for `Conductor` (an exact integer from the deterministic measurer), and
`getClusterBackColor` for `Audience` (`#87CEFA`). Drop T2a's "cluster member throws" assertion.

## Write-set
The adapter, optionally `activity-legacy-elk-cluster.ts`, their tests; `renderer-cluster.ts` only to export helpers.

## Acceptance
- Given `elk-lap-partition`, when the walk members run, then the two partitions are `PACKAGE` groups, children of the
  root, each listing its leaves in creation order.
- Given `elk-partition-empty`, then `isEmpty` is true for `P`, and after `muteToType` its dimension is the svek empty
  partition's.
- Given `elk-lap-inner-brace`, then the inner activity is a group of type `INNER_ACTIVITY` holding `A` and `B`, with no
  simplifier image anywhere.

Observability is N/A. Rollback is Reversible.
