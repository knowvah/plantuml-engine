# T2: DIVERGENCES.md, and the empty-nested residue

**Read:** `DIVERGENCES.md:55-200` (the "Smetana-backed diagram types" section), the #187 body
(`gh issue view 187`), `plans/hcl-yaml-oracle-gap-rows/decision-journal.md` row 6, `/tmp/ebi-t1.txt`,
`~/git/graphviz/lib/common/shapes.c:3430-3440`, `jsondiagram/SmetanaForJson.java:200-260`.

**Writes:** `DIVERGENCES.md`, `planning/next-missions.md`.

## Steps

1. **The sentence (D3).** Replace "the explicit `''` label already reproduces Smetana's outcome, no text extent, …"
   with the measured mechanism and the ruling's date. Keep the clause about the labelless call (node name plus PAD
   gives 29.5, jfp T4b) if it is still true; check it against the jfp journal before keeping it.
2. **The "Measured result" paragraph.** Replace "await a ruling on #187" with what the ruling decided: K landed (the
   canvas half), the label half named under the 2026-08-09 ruling.
3. **The row table.** Add `hcl/for-expression-empty-array` and `hcl/function-call` in sort order, with the residue
   from `/tmp/ebi-t1.txt`, mechanisms `empty-label, U-REC, U-ARROW, U-CLIP`, and ledger
   `empty-block-ink/decision-journal.md` row <n>. Recount the table and the aligned-row sentence from
   `oracle/goldens/json-family-positional.json` and the table; state the recount method in the journal.
4. **empty-nested (D4).** Under `/tmp/ebi-probe/`, apply E (U-REC emulation) and L (each empty node at 15 × 17) to a
   copy of the pipeline, as #187's probe did, and measure `authored:json/empty-nested`. Journal each counterfactual's
   node / path / dw / dh.
   - If E+L leaves only the U-CLIP class (≤ 1 px, spot `cx` and paths), add a short paragraph after the yaml twins
     paragraph naming the row, its residue and its mechanisms.
   - Otherwise file a `needs-ruling` issue (title `json: authored empty-nested residue after #187`) with the numbers,
     and name it in the journal. Not a stop.
5. **next-missions.md.** Strike the #187 item (line ~160) with a one-line result, in the file's existing struck-item
   pattern.
6. `npx prettier --check DIVERGENCES.md planning/next-missions.md`, then commit:
   `docs(divergences): name the #187 empty-container rows`, footer `Refs: #187`.

## Acceptance

- Given DIVERGENCES.md, when read, then no sentence claims `''` reproduces Smetana's outcome, and the replacement
  cites `shapes.c:3436-3438` and `labels__c.java:119-122` with 19.75 × 25.5 against 15 × 17.
- Given the row table, when counted, then its summary count equals its row count and both hcl rows appear with
  `/tmp/ebi-t1.txt` residue.
- Given D4's probe, when it finishes, then `authored:json/empty-nested` is either named with measured mechanisms or on
  a new `needs-ruling` issue the journal names.

Observability is N/A. Rollback is Reversible: revert the commit.
