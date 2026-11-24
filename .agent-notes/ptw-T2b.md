# ptw T2b — folder label wrap, push-forward probes (#219)

## Observation: oracle-render.sh numbers svek dumps in render order, not argument order
- **Context**: rendering `ptw-as-label` and `ptw-folder` in one `scripts/oracle-render.sh` call.
- **Finding**: `svek-1.dot` belonged to the second argument; the sizes looked swapped until each was matched by
  its height arithmetic (a shown title 14 + label 42 + 23 = 79 vs a fixed tab 15 + 42 + 23 = 80).
- **Impact**: render one `.puml` per out dir when a DOT size must be attributed.
- **Confidence**: High

## Observation: cluster nodeIds keep source order; the node list does not
- **Context**: `ptw-nested`, 39 diffs left with every node size equal to the jar's.
- **Finding**: `inDotEmissionOrder` (`layout-classify.ts:76-81`) orders the graph's node list leaves-first inside a
  group, but `classifyAsCluster` builds `directLeafAstIds` in source order (`:26-28`), and `buildDotClusters` writes
  the cluster body from it. A demoted empty sub-package lands before the cluster's leaves; upstream prints leaves
  first (`GraphvizImageBuilder.java:440-442`). One-line fix verified on three probes, filed as #278 (not landed:
  separable, touches every description cluster).
- **Impact**: any DOT-order question inside a description cluster: check `cluster.nodeIds`, not `graph.nodes`.
- **Confidence**: High

## Observation: an empty package group never took the package style
- **Context**: push-forward probe `skinparam packageStyle rectangle` on an empty `package {}`.
- **Finding**: `restyle` (`layout-package-style.ts`) skipped every childless node, on the premise that an empty
  package is drawn by `EntityImageEmptyPackage`. Upstream sets the symbol at parse time, and
  `GeneralImageBuilder.java:205-207` draws an `EMPTY_PACKAGE` with a `USymbol` through `EntityImageDescription`, so
  the jar draws a rectangle (or a node, ...). Fixed for `declaredAsGroup` packages. A brace-less `package foo`
  element under the same skinparam has a bold-title residual: #280.
- **Impact**: description-only. The class engine's empty package path is separate (`EntityImageEmptyPackage`).
- **Confidence**: High

## Observation: ELK draws an empty package unlike the jar
- **Context**: push-forward probe `!pragma layout elk` + empty package.
- **Finding**: 31 diffs with no wrap setting (document 350 vs 616 wide). Upstream ELK mutes empty groups in its own
  walk (`CucaDiagramFileMakerElk.java:316-321`). Filed as #279; origin in the port not isolated.
- **Impact**: ELK description fixtures with empty packages.
- **Confidence**: Medium (measured; mechanism not isolated)
