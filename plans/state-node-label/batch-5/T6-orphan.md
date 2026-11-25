# T6: a label whose host is hidden or removed is hidden and removed with it

**Writes:** `src/diagrams/state/state-hidden.ts`, the state remove path (find where `remove`/`restore` filter
entities: `grep -rn "removerestore" src/diagrams/state`), a new small module if either would pass its size cap,
`tests/unit/state/state-node-label-orphan.test.ts`, the gate.

**Reads:** D5; `CucaDiagram.java:778-831`; how the jar drops links whose end is removed (read `CucaDiagram#getLinks`
users in `svek/GraphvizImageBuilder.java` and `Link.java:450-465`); `SvekResult.java:81-99`.

## Steps

1. **Explain `snl-hide-label-host` from the Java first** (README "Measured jar facts"): with `hide` on the target the
   jar keeps 3 nodes on one rank, draws only `A`, and writes no link comment. State the mechanism with `file:line`
   (D5's cross: hidden host ⇒ label removed ⇒ its links leave the graph; confirm or refute) and journal it.
2. **Red.** For each of `-orphaned-by-hide`, `-orphaned-by-remove`, `-remove-then-restore`, `snl-hide-label-host`:
   assert which entities are drawn, which links exist in the DOT, and which comments appear, from the jar svg.
3. **Green.** Port `isOrphanedTransitionLabel` and its two call sites. Only `'transitionLabel'` leaves are affected;
   every existing hide/remove row must stay put.
4. **Smetana.** `snl-vega-smetana-hide`: assert the element set (D5) and hold it OPEN with today's `maxDiffs`.
5. **Measure.** Expected to reach 0: the four rows in step 2; the two remove controls stay 0.

## Acceptance
- Given `hide $fault` on a node-style target, when rendered, then the label between it and its source is not drawn,
  as the jar draws it (0 diffs).
- Given `remove $fault` then `restore $fault`, when rendered, then the output equals the source without either line.
- Given the Smetana row, when rendered, then the label is hidden with its host and the delta is recorded.

Observability: N/A. Rollback: Reversible.
