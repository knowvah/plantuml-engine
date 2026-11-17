# T1c: kermor's undeclared special point

**Decisions:** D3. **Fixture:** `partition-link-kermor`.

The jar's kermor DOT writes the edges first, then `sh0012`, then `cluster6beta { cluster6gamma { sh0010; sh0011 } }`.
`zaent0001` appears only in `sh0011->zaent0001` and `zaent0001->sh0012`.

## Steps

1. Read `ClusterDotStringKermor.java:69-196` and confirm no path declares the special point for a plain partition.
   Quote the line in the journal.
2. Read how `src/core/svek-dot-emit*.ts` and `src/core/graph-layout-build.ts` treat an edge end with no
   `DotInputNode`, and how `@knowvah/dot-engine` creates a node an edge names (read its source in `node_modules`, never
   edit it). Run native `dot -Tdot /tmp/lpl-oracle/partition-link-kermor/svek-1.dot` and record the implicit node's
   `width`/`height`/`label`.
3. Red: `partition-link.test.ts` asserts the kermor DOT equal to the jar's (no `zaent0001` statement).
4. Green: the edge names `getSpecialPointId(group)`, no node is declared, and the layout gets graphviz's implicit node.
   If that needs a dot-engine capability it lacks, or dot-engine sizes it unlike native `dot`, file it (stop 5) and
   push the fixture forward (README push-forward 2).
5. Pin (task contract step 6), or record the open row and its issue.

## Acceptance
- Given `partition-link-kermor`, then its DOT is EQUAL, or `OPEN_ROWS` names a filed issue with the mechanism.
- Given `swimlane-kermor` (no group link), then its pinned DOT is unchanged.

Observability is N/A. Rollback is Reversible.
