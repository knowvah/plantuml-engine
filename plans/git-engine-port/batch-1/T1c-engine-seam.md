# T1c — The Smetana-shaped box in `core/graph-layout`

**Read:** D2, D9; `gitlog/SmetanaForGit.java:145-212`; `src/core/graph-layout-build.ts:100-160`,
`graph-layout-build-special-nodes.ts:58-67` (`addRecordNode`, the precedent); `graph-layout.types.ts` (`DotInputNode`,
`DotInputGraph.rankSep`, `omitSepAttrs`); `graph-layout-result.types.ts:79-110` (`engineNodes`/`engineEdges` under
`read: 'exact'`); `src/diagrams/json/layout.ts:395-413` (how json calls it).

**Write-set:** `src/core/graph-layout.types.ts`, `src/core/graph-layout-build*.ts`, maybe
`src/core/svek-dot-emit*.ts` (if the DOT dump path needs the new kind); `tests/unit/core/**`.

**Do:**
1. Add the node kind (batch-1 interface contract): `shape=box`, `width`/`height` as the caller's inches in Java
   `"" + double` form, **no** `fixedsize` and **no** `label`. Name and document it after `SmetanaForGit#createNode`.
   Find out what `GvGraphBuilder#addNode` does when `label` is absent (the default `\N`), and what measurer graphviz
   sizes that label with in this repo (`core/dot-engine-measurer.ts`). Journal both.
2. Add a raw graph `ranksep` (inches string `0.35`) with no `nodesep` line and no svek floor. `omitSepAttrs` drops
   both, so either extend it or add a sibling option; document the choice against `DotStringFactory.java:117-133`.
3. Inch strings through the existing `javaDoubleToString` (`src/core/java-number-format.ts:105`), which is
   `"" + double` (`SmetanaForGit.java:200-201`).
4. Tests:
   - The emitted DOT for a 2-node git-shaped graph matches the D2 attribute list exactly, in order.
   - `layoutGraph(…, { read: 'exact' })` on it returns `engineNodes` whose sizes equal real `dot -Tdot` 16.1.0 on the
     same DOT, to the printed precision. Run `dot` by hand, and paste the numbers into the test with the command in a
     comment.
   - Every existing caller's DOT is byte-identical: the svek DOT-parity and json ratchets stay green.

## Acceptance
- Given a node of the new kind declared 70.53×17 pt, when laid out, then the engine height equals real `dot`'s on the
  same DOT. Planning measured 24.5 in `dot` and 24.8 in raw dot-engine with no measurer; if they still differ through
  the repo's configured measurer, that is stop 5.
- Given any existing engine, then its `npm test` ratchets and the batch-close full survey show 0 lost and no census
  attribute moving away from the jar.
- Given the new graph option, then the DOT has `ranksep=0.35` and no `nodesep`.

Observability N/A. Rollback Reversible.
