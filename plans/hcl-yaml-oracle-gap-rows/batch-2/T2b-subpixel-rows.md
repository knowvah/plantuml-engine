# T2b: the three sub-pixel hcl rows

**Rows:** `hcl/array-values` (23 diffs; 0.150 / 1.555 / 0 / 0), `hcl/multiple-top-level-blocks` (59; 0.619 / 1.068 /
0 / 0), `hcl/nested-object-value` (26; 0.425 / 1.834 / 0 / 0). **Why:** D4. Their residue is in the range of
`hcl/jubete-32-sutu417` and `hcl/vocago-35-xodu446` (U-REC, U-ARROW, U-CLIP), which is a lead only.

Re-measure first: a T2a fix may have moved these rows.

## Steps

Follow T2a steps 1 to 6 for each row ([T2a-empty-container-rows.md](T2a-empty-container-rows.md)): parse tree
against `HclParser`, D4 part 1 (engine input), D4 part 2 (real `dot -Tdot`), E and E+S1 attribution, outcome, and
the journal artifact. Where all three rows share one mechanism and one probe result shape, one journal row may cover
them, with each row's numbers listed separately.

## Acceptance
- Given each row, then the journal holds both D4 parts with numbers, and the E / E+S1 residue.
- Given a Smetana outcome, then `DIVERGENCES.md` names the row with the residue `measure-rows.mts` prints and only
  mechanisms the journal proved.
- Given a port defect, then a failing unit test precedes the fix, and no json/yaml/hcl bar moves away from the jar.

Observability is N/A: there are no new observable operations. Rollback is Reversible.
