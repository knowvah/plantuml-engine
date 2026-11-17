# Decisions (lpl)

## Auto-confirmed (unattended)

Planned with nobody present (`/plan-mission --unattended next --branch feature/parity-queue`, 2026-11-17). `next`
resolved to #157: no issue was `queue:planned`; #136 is blocked by open issues (#157 among them); #157 is the
lowest-numbered remaining `queue:ready` issue, with no "Blocked by" reference and no `needs-ruling` label. Its body
states what done means (0 diffs or a named mechanism, DOT structurally equal, the four gates). No decision below is
reserved for the maintainer: no divergence is introduced, no public API changes, and the change is reversible. Each
decision lists what was rejected and the evidence, so the user can audit it.

### D1: The special point id comes from one port of `Cluster.getSpecialPointId`, in `src/core/svek/Cluster.ts`

**Upstream.** `Cluster.CENTER_ID = "za"` and `getSpecialPointId(group) = CENTER_ID + group.getUid()`
(`svek/Cluster.java:104,653-655`); `Bibliotekon#getNodeUid` answers it for a group with no node (`:126-137`).

**Decision.** Export `CENTER_ID` and `getSpecialPointId(group: { getUid(): string })` from `src/core/svek/Cluster.ts`
(its header already lists `getSpecialPointId` as unported, `:65-66`: update that line). The legacy DOT builder's edge
end is `getNodeUid` semantics: the node's id when the entity has a node in this pass, else the special point for a
group. Keep `buildEdges`' "group is a cluster point, not a missing node" rule (`activity-legacy-dot.ts:361-364`) and
delete `requireLeaf`.

**Rejected.**
- *A private helper in `activity-legacy-dot.ts`.* State (`state-composite-classify.ts:259`), description
  (`layout-helpers-shape-endpoint.ts:44`) and class (`class-shield-helpers.ts:248`) each grew their own; a fourth copy
  of an upstream static is the drift CLAUDE.md warns about. Migrating those three is out of scope (their ids differ in
  spelling, e.g. `zaent-<ns>`, and are pinned).

### D2: Encode the linked partition with the existing cluster fields; swimlanes reuse `unwrappedNodeId`

**Upstream.** One boolean, `thereALinkFromOrToGroup1/2`, decides the `a`/`i` wrappers and the special point
(`ClusterDotString.java:91-99,148-152`); `protection0/1` decide `p0`/`p1` and are off under swimlanes (`:107-115`,
`:299-315`). It is computed when the DOT is printed, over every `SvekEdge` of the pass (`lines`), so it sees the links.

**Decision.**
- The flag is computed **after** `buildEdges`: a cluster is linked when an edge of this pass has the cluster's group as
  `getEntity1()` or `getEntity2()` (identity, `SvekEdge.java:1270-1272`). `printGroup` today builds the
  `DotInputCluster` before the edges exist (`activity-legacy-dot.ts:221-271`); finish the cluster in a second step.
- **Not swimlane:** `innerMarginLevels: 2`, `unwrappedNodeId: getSpecialPointId(group)`, the id appended to
  `nodeIds`, and a `DotInputNode` `{ shape: 'point', width: 0.01 in, … }` (the class pattern,
  `class-dot-clusters.ts:133-145`). The node is not a `SvekNode`: it never enters `builder.nodes`.
- **Swimlane** (`partition-link-swimlane`, jar DOT: `cluster6a { cluster6 { zaent0001; cluster6i { {rank = source;
  sourceIn6 …} … members } } }`, no `p0`/`p1`): on a `swimlane` cluster, a present `unwrappedNodeId` means
  `thereALinkFromOrToGroup1`. `wrapperLevels` answers `{ a: true, p0: false, i: true, p1: false }` for it; the emitter,
  the layout builder and the node order keep the point a direct child of the base cluster; the lane's rank lines
  (`ClusterDotString.java:157-170`) open inside `i`, as the jar writes them.

**Rejected.**
- *A new `DotInputCluster` field for the swimlane case.* A third encoding of the same upstream boolean beside
  `innerMarginLevels: 2` and `borderPointAncestorWrap`; `svek-dot-wrappers.ts:26-31` exists to keep one reading.
- *Reuse `borderPointAncestorWrap`.* It also routes through the border-point path (`graph-layout-build-borderpoint.ts`,
  `borderPointAnchorDecl`), which a swimlane lane is not.
- *Decide the flag inside `printGroup` from `scope.links`.* `scope.links` includes links `buildEdges` drops (removed,
  or a leaf with no node in this pass, `:357-364`); upstream reads only the built `lines`.

### D3: Kermor writes no special point; mirror the undeclared node

**Upstream.** `ClusterDotStringKermor#printInternal` never declares the special point (`svek/ClusterDotStringKermor
.java:69-165`; `empty()`, which would name it, is defined at `:190-196` and called nowhere in the file). The jar's kermor DOT has
`sh0011->zaent0001` and `zaent0001->sh0012` with no `zaent0001` statement (`partition-link-kermor`, planning render),
so graphviz creates a default node at the root (`shape=ellipse`, label `\N`). The jar's SVG leaves a 41.5 px gap
between `A --> P`'s end (`157.73`) and `P --> (*)`'s start (`199.25`).

**Decision.** T1c reads how the legacy kermor builder (`withSwimlanePoints`/`kermorClusterBlock`, laep journal row 22)
and the DOT emitter treat a `nodeIds`/edge id that has no `DotInputNode`, and how `@knowvah/dot-engine` creates a node
from an edge (its `agedge`/`agnode` create path). Mirror the jar: no declaration in the emitted DOT, and the layout gets
graphviz's implicit default node. If dot-engine cannot create it or sizes its `\N` label unlike native `dot -Tdot` on
the jar's `svek-1.dot` (memory `dot-engine-blame-needs-real-dot`), file it (`docs/graphviz-issues/` + `TRACKER.md`)
and push forward `partition-link-kermor` (README push-forward 2).

**Rejected.** *Declare a point node under kermor too.* It "fixes" the jar's gap: an improvement on the jar, forbidden
by CLAUDE.md ("never improve on the jar").

### D4: `simulateCompound` runs in the solve (`layout-geometry.ts`), through `core/spline-clip.ts`

**Upstream.** `SvekEdge#solveLine` reverses an inverted path (`:640-655`, in `solveLine` from `:618`), runs `projectionCluster` (only for
`entityPositionsExceptNormal`, never for a legacy partition, `ClusterDotString.java:101-105`), then
`simulateCompound(lhead, ltail)` (`:671-672`) before the extremities (`:678-688`). `getCluster2` takes the first
`Cluster` whose groups contain the entity (`:219-225`), and `getRectangleArea` is the base cluster's solved box.

**Decision.** In `layout-geometry.ts#edgesOf`, after the existing reversal handling, clip the points of an edge whose
end is a group with `clipSplineStart` (tail) and `clipSplineEnd` (head) on that group's `ActivityLegacyClusterGeo` box
in the same frame. The special point is excluded from `nodesOf` (it is no `SvekNode`). `SvekEdge.ts`' extremity code
is already the `getExtremitySimplier` path (`SvekEdge.ts:238-292`); confirm that nothing there reads a node side for
the cluster end. Port `Cluster#getMagneticBorder` (`Cluster.java:726-758`) into the edge input only if, for a plain
`PACKAGE` partition, the decoration's border is not `MagneticBorderNone`: read `ClusterDecoration`'s text block for the
package style before writing anything.

**Rejected.** *Clip in `renderer-edge.ts`.* Upstream clips in `solveLine`, a layout-phase step, before the extremities
and the label placement read the path.

### D5: The authored fixture set

`partition-link` plus 10 sources in [fixtures/](fixtures/), each rendered by the jar at planning (all draw an ACTIVITY
diagram, one `svek-1.dot` each):

| slug | covers | jar DOT at planning |
|---|---|---|
| `partition-link-to-partition` | group to group | 2 special points, both wrapped |
| `partition-link-from-outside` | a leaf outside to the group | `zaent0004` |
| `partition-link-nested` | links to an inner and an outer partition | 2 special points, nested wrappers |
| `partition-link-label` | a labelled link to a group | wrapped |
| `partition-link-colored` | `-[#red,dashed]->` | wrapped |
| `partition-link-ltr` | `left to right direction` | wrapped |
| `partition-link-self` | `P --> P` | wrapped |
| `partition-link-empty` | an empty partition: `EMPTY_PACKAGE` leaf, no special point | no wrappers |
| `partition-link-swimlane` | `skinparam swimlane true` | `a`/`i` only (D2) |
| `partition-link-kermor` | `!pragma kermor on` | undeclared point (D3) |

They enter `tests/fixtures/activity-legacy/` in T1a, with their jar SVGs, so the manifest test
(`activity-legacy.diff-baseline.ratchet.test.ts:81-85`) holds from the first commit; a fixture not yet at 0 is an
`OPEN_ROWS` entry whose reason names the task that ends it (`#157 T2a`), removed when it reaches 0.

**Rejected.** *Synthesize DOT expectations by hand.* The jar's DOT is the spec (CLAUDE.md, "prefer oracles").

### D6: The bar for `partition-link` is 0 diffs; it is never pushed forward

The issue allows "or named with its mechanism". This brief takes the stricter bar: `partition-link` is a plain
partition on the graphviz path, where the jar's geometry is a target (CLAUDE.md, one layout engine). If it cannot
reach 0, the residue must be a dot-engine finding proven with native `dot` on the jar's DOT (stop 5), journalled with
the diagnosis artifact.

## Operational readiness

- **Observability:** N/A. A pure library; no new operation, log or metric.
- **Rollback:** Reversible. Revert the squash commit; the pins and fixtures go with it.
- **Scalability:** N/A. One extra point node and up to two wrapper subgraphs per linked partition.
- **On-call:** N/A. The failure mode is a wrong wrapper in another engine after T1b, caught by the DOT-parity gates
  (state, class, description, activity-legacy) in `npm test` and by the every-engine survey (stop 1).
- **Backwards compatibility:** no API, option or data format changes. Legacy activity sources that drew an error page
  now draw the diagram, as the jar does.
