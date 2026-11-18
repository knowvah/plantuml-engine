# T2a: solve and draw a cluster-ended link

**Decisions:** D4, D6. **Input:** the T1a interface (`batch-1/overview.md`).

## Steps

1. Read `SvekEdge.java:618-700` (`solveLine`: reversal, `projectionCluster`, `simulateCompound`, extremities) and
   `DotPath.java:418-490`; compare with `spline-clip.ts` line by line and quote both in the journal.
2. Red: `partition-link.test.ts` asserts `partition-link` at 0 SVG diffs against its jar SVG (the
   `fixtures.mts` comparison), and that `P --> (*)`'s path starts with the tail clip's halvings (jar:
   `M54,187.759 C54,187.807 54,187.855 54,187.904 …`).
3. Green (D4): `nodesOf` skips the special point; `edgesOf` clips a cluster-ended edge's points with
   `clipSplineStart`/`clipSplineEnd` on its `tailCluster`/`headCluster` box, after the reversal and before anything
   reads the end points. Then read `Cluster#getMagneticBorder` for a plain partition: port it into
   `renderer-edge.ts`'s `magnet1`/`magnet2` only if it is not `MagneticBorderNone`.
4. Measure every `partition-link*` slug with `fixtures.mts`. For a fixture above 0, produce the diagnosis artifact
   (mechanism, origin `file:line`, causal chain, ruled out) before any change; after one pass, push it forward
   (README push-forward 2). `partition-link` is never pushed forward (D6).
5. Pin (task contract step 6): every fixture at 0 leaves `OPEN_ROWS`.

## Acceptance
- Given `partition-link`, when measured, then `fixtures.mts` prints 0.
- Given `partition-link-to-partition`, `-nested`, `-self`, then both ends clip to their own partition's box.
- Given `OPEN_ROWS`, then it holds `pragma-elk`, `pragma-elk-if`, `pragma-smetana` and only those `partition-link-*`
  slugs whose reason names a filed issue.
- Given the 102 earlier authored fixtures and the 124 legacy rows, then no weighted score rises.

Observability is N/A. Rollback is Reversible.
