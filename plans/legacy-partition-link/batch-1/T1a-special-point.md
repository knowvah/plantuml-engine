# T1a: special point, wrappers, `za` edge ends

**Decisions:** D1, D2 (non-swimlane half), D5.

## Steps

1. Copy the 10 `plans/legacy-partition-link/fixtures/*.puml` to `tests/fixtures/activity-legacy/`, and each
   `/tmp/lpl-oracle/<slug>/<slug>.svg` beside it. Add all 10 to both `OPEN_ROWS` with the reason
   `#157 T2a: link to a partition, solve pending` (`partition-link-swimlane`: `#157 T1b`; `partition-link-kermor`:
   `#157 T1c`), except any that already measure 0 (`partition-link-empty` may: an empty partition is an
   `EMPTY_PACKAGE` leaf, `GraphvizImageBuilder.java:414-418`).
2. Red: in `tests/unit/activity-legacy/partition-link.test.ts`, the DOT of `partition-link`,
   `partition-link-to-partition`, `-from-outside`, `-nested`, `-label`, `-colored`, `-ltr` and `-self` is structurally
   equal to its jar `svek-1.dot`. Commit the expected DOTs the way the DOT-parity gate does (pins under
   `oracle/goldens/activity-legacy/<slug>/`, step 5), not as hand-typed strings.
3. Green (D1, D2): `CENTER_ID`/`getSpecialPointId` in `src/core/svek/Cluster.ts`; edge ends by `getNodeUid`
   semantics; delete `requireLeaf`; after `buildEdges`, finish each cluster: linked ⇒ `innerMarginLevels: 2`,
   `unwrappedNodeId`, the point node; record `ltail`/`lhead` (`getCluster2`: the first cluster whose group is the
   entity) on the edge.
4. The SVG still fails at the solve (T2a). The whole suite must stay green: the open rows keep the ratchet green.
5. Pin (task contract step 6): `pin-legacy-dot.mts --authored /tmp/lpl-oracle --write` adds every EQUAL row;
   `build-authored-baseline.mts <HEAD> --write` re-measures. Diff both outputs.

## Acceptance
- Given `partition-link`, when the DOT is built, then `pin-legacy-dot.mts --authored /tmp/lpl-oracle` lists it EQUAL,
  with `zaent0001` a direct child of the base cluster and `cluster<N>a{p0{<N>{…i{p1{…}}}}}` around it.
- Given `partition-link-to-partition`, then both partitions carry a special point and both edge ends name them.
- Given `partition-link-empty`, then no special point is written and the edge names the empty package's node.
- Given the full suite, then it is green, with every not-yet-zero fixture an `OPEN_ROWS` entry.

Observability is N/A. Rollback is Reversible.
