## Observation: label="" on a record is not "no text extent" in graphviz
- **Context**: D4 part 1 on the hcl empty-container rows (#142 T2a, #187).
- **Finding**: graphviz gives an empty record field a single space as its text (`~/git/graphviz/lib/common/shapes.c:3436-3438`) and then PADs it. `n [shape=record,label="",width=0.208333,height=0]` solves to 19.75 × 25.5 in real `dot` 16.1.0 and in dot-engine alike. Smetana's labelless empty node is 15 × 17 (default label (0,16), no PAD, `labels__c.java:119-122`). DIVERGENCES' "empty-container label half" sentence (from jff D2) says `''` reproduces Smetana's "no text extent". That is false, and it costs 2.375 px of node Δ on `hcl/function-call`.
- **Impact**: An empty container's block is drawn (19.75 − 15)/2 off-centre in-rank. Any row with an empty leaf carries this, on top of U-REC.
- **Confidence**: High

## Observation: document-dimensions over-counts an empty block's ink by 1
- **Context**: dw 1 that survives E+S1+L on the same two rows.
- **Finding**: `document-dimensions.ts:84-85` adds `x+w`/`y+h` for every node. The jar's `LimitFinder` sees only the rectangle of an empty block (`x+w−1`, `LimitFinder.java:184-188`). Non-empty blocks reach `x+w`/`y+h` through each cell's `UEmpty` (`TextBlockMarged.java:83`). With −1 on rowless nodes, 10 rows move toward the jar and `authored:json/empty-nested` dw goes 0→1, a U-REC cancellation that E+K confirms. Not landed: it raises a ceiling (stop 2), so it is on #187.
- **Impact**: Whoever lands #187's ruling has the fix and its measured effect; see the hyogr journal T2a row.
- **Confidence**: High

## Observation: a reusable D4 probe kit (not committed)
- **Context**: Re-proving jfp D3 for new json-family rows.
- **Finding**: These probes, all in a `/tmp` copy of `src`/`tests` with `node_modules` and `test-results/dot-cache` symlinked, reproduce the jfp ledger exactly (jubete E 0.425/1.641, E+S1 0.425/0.426, D3(1) 0.426→0.002):
  - E: `Math.round` the declared size and encode each column 8 smaller (clamp ≥ 0);
  - S1: edge `penwidth=0`, which needs one line in `graph-layout-build-edges.ts` because `penwidth` is not forwarded;
  - `render(b.graph,'dot')` dumped in `layoutGraph`.
  Real `dot` cannot decode `_dim_`, so part 2 blanks those texts.
- **Impact**: Saves rebuilding the probe kit next time. Edge `penwidth` is silently dropped by `addEdges`, so an S1 probe that sets only the attribute measures nothing.
- **Confidence**: High
