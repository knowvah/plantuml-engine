# T2a: the two hcl rows above 1 px node Δ

**Rows:** `hcl/function-call` (59 diffs; 2.375 / 1.025 / 1 / 0) and `hcl/for-expression-empty-array` (34 diffs;
1.500 / 1.401 / 1 / 0). **Why:** D4. Both have their largest node residue on `rect/@y`, the in-rank axis of the LR
layout, and both hold an empty container (README table). Both hcl rows the DIVERGENCES table already names sit below 1 px
node Δ, so the planning residue alone names nothing.

## Steps

1. **Parse first.** Dump our `JsonDiagramAST` for each source and compare it with what `HclParser`/`HclTerm` build
   (`net/sourceforge/plantuml/hcl/`). Quote the lines that turn `templatefile("…", {})`, `tostring()` and
   `[for r in var.resources : r.id]` into terms. A different tree (an extra or missing node, a different value
   string) is a port defect, not Smetana: fix it test-first in `src/diagrams/hcl/` with a unit test under
   `tests/unit/hcl/hyogr-*.test.ts` asserting the jar's node set (read from the oracle's `<text>` elements).
2. **Engine input (D4 part 1).** For each node, recover the oracle's rect sizes and push them through
   `createNode` / `getDotLabelMap` / `getDotLabelArray` (`SmetanaForJson.java:233-260,265-295`). Pay attention to
   the empty-container branch: `if (size > 0)` sets the label only for a non-empty node (`:253-254`), and
   DIVERGENCES' empty-container item says what we do instead (`''` label, jff D2). Compare record geometry, not
   label strings.
3. **Layout (D4 part 2).** Dump the DOT dot-engine solves and run real `dot -Tdot` 16.1.0 on it. Compare every node
   position and spline.
4. **Attribute.** Run the E and E+S1 counterfactuals (`yaml-hcl.md:36-40`) in `/tmp` probe code. Record which
   sources (U-REC, U-CLIP, U-ARROW, U-NS) close which part of the residue, in the `hcl/jubete` ledger row's shape
   (`plans/json-family-parity/diagnosis/yaml-hcl.md:78`). If the in-rank 2.375 survives E+S1 and real `dot` equals
   dot-engine, it is an in-rank Smetana position (U-NS); show the node whose rank position differs.
5. **Outcome, per row:**
   - a port defect: fix it (steps 1-2), re-measure per task contract step 5, and pin the row if it reaches zero; if a
     residue remains, its mechanism must be proven again from step 2;
   - dot-engine ≠ `dot`: file `docs/graphviz-issues/<NN>-*.md` + `TRACKER.md` line; the row stays open, named in the
     journal;
   - both D4 parts hold: add the row to the DIVERGENCES.md row table per D3 (residue, mechanisms, ledger =
     this mission's journal row), keep the table sorted by row, and update the `<summary>` count and the "Measured
     result" sentence that counts json/yaml/hcl rows.
6. Journal the diagnosis artifact (mechanism, origin `file:line`, causal chain, ruled out) per row.

## Acceptance
- Given each row, then the journal holds both D4 parts with numbers, and the E / E+S1 residue.
- Given a port defect, then a unit test fails before the fix and passes after, and no json/yaml/hcl ratchet,
  structural or positional row moves away from the jar.
- Given a Smetana outcome, then `DIVERGENCES.md` names the row with the residue `measure-rows.mts` prints and only
  mechanisms the journal proved.

Observability is N/A: there are no new observable operations. Rollback is Reversible.
