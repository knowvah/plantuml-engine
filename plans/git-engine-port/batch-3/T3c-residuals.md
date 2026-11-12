# T3c — Residuals: fix or name each remaining diff

**Read:** D2, D9; `DIVERGENCES.md:17-178` (the Smetana entry, its U-REC table and json row table);
`plans/json-family-parity/decisions.md` (D3 proof standard) and its `diagnosis/ledger.md`;
`.claude/memory/dot-engine-blame-needs-real-dot.md`; `.claude/memory/measurement-artifacts-outnumber-defects.md`.

**Write-set:** `src/diagrams/git/**`, the T1c core modules, `DIVERGENCES.md`, `tests/unit/git/**`,
`docs/graphviz-issues/**` + `TRACKER.md` (only for stop 5).

**Do:**
1. **Structural diffs first.** For every row or fixture that is not conformant and not `structural-match`, read its
   first diff, find the Java that decides it, fix, and re-measure (task contract step 6).
2. **Then the D9 proof**, for every row and fixture at `structural-match`:
   1. Dump our DOT and compare it with a hand trace of `SmetanaForGit#initGraph` on that source: node order, names,
      attributes, inch strings, edge order.
   2. Run real `dot -Tdot` 16.1.0 on our DOT and compare it with dot-engine's `engineNodes`/`engineEdges`. A mismatch
      is stop 5.
   3. Attribute the jar-vs-ours residue to U-REC, U-CLIP, U-ARROW, U-NS or the `\N` label half, citing the Smetana side
      through the graphviz 2.38-era C and the modern C. Measure each, e.g. box heights 24 vs ours for the label half,
      and the arrow length for U-ARROW.
3. Add the git row table under the Smetana entry, in the json table's format (row, residue node / path / dw / dh,
   mechanisms, ledger). Add the "node sizing" carve-out D9 names. Write the per-row evidence to
   `plans/git-engine-port/diagnosis/<slug>.md`, which this task creates.
4. A residue that fits no named mechanism and that you cannot fix goes on a `needs-ruling` issue naming the row, its
   residue and what you measured. It is not decided here.

## Acceptance
- Given the 4 rows and every drawn fixture, then each is conformant, or `structural-match` with a git row-table line
  whose mechanisms are each backed by a diagnosis file, or on a named `needs-ruling` issue.
- Given each diagnosed row, then the journal records "our DOT = SmetanaForGit's graph" and "dot-engine = `dot -Tdot`"
  with the command used.
- Given `oracle/accepted-divergences.json`, then it is unchanged.

Observability N/A. Rollback Reversible.
