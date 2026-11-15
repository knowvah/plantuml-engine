# T3: the four yaml twins

**Rows:** `yaml/YAML-attribute-hierarchy-0`, `yaml/YAML-attribute-hierarchy-1`, `yaml/YAML-list-key-value-pair-0`,
`yaml/YAML-space-indent-0`. **Why:** D5.

## Steps

1. **Prove the oracle and source twins** with `cmp` (dated), as the README table says:
   - `-list-key-value-pair-0` / `-space-indent-0`: `in.puml` and `in.svg` against the row without `-0`;
   - `-attribute-hierarchy-0`: `in.svg` against `YAML-attribute-hierarchy`; `in.puml` against that row's first
     `@startyaml` … `@endyaml` block;
   - `-attribute-hierarchy-1`: `in.puml` and `in.svg` against `yaml/vaceci-80-lezo436`.
2. **Prove the render twins:** for each pair, render both sources with `renderFixtureJson(src, new
   DeterministicMeasurer())` and compare the strings. Use a `/tmp` script. They must be identical. For
   `-attribute-hierarchy-0`, the two-block source renders its first block through the cache harness, as the survey
   does.
3. **Check the named row still holds its table residue:** `measure-rows.mts` on the 4 rows against the DIVERGENCES
   table rows for their twins (`YAML-attribute-hierarchy` 0.654 / 1.742 / 1 / 0, `vaceci-80-lezo436` 1.100 / 2.583 /
   1 / 0, `YAML-list-key-value-pair` 0.451 / 1.011 / 1 / 0, `YAML-space-indent` 0.750 / 2.146 / 1 / 0). If T2a
   changed `src/`, use the live numbers and update both twins' table rows together.
4. **Name them** in `DIVERGENCES.md`, after the table, in the shape of the `unknown/jubete-32-sutu417` paragraph: each
   `-N` row is the named row filed again by `classify-corpus.ts`'s per-block split (#142), byte-identical source and
   oracle (`cmp`, date) and byte-identical render, so the same Smetana delta (U-REC, U-ARROW, U-CLIP) names it.
5. If a pair's render differs (step 2), the row is not a twin: give it T2a's full D4 diagnosis in its own commit, and
   journal why.

## Acceptance
- Given the 4 pairs, then the journal records the `cmp` results and the render comparison for each.
- Given `DIVERGENCES.md`, then each of the 4 slugs is named with its twin, and no table row's residue disagrees with
  `measure-rows.mts`.

Observability is N/A: there are no new observable operations. Rollback is Reversible.
