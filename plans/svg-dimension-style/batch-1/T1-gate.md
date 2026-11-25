# T1: the authored gate

**Writes:** `tests/fixtures/svg-dimension-style/*.{puml,svg}`,
`tests/oracle/svg-conformance/svg-dimension-style.authored.test.ts`.
**Reads:** `tests/oracle/svg-conformance/usecase-title-style.authored.test.ts` (the model: header, row lists, the
"a file with no entry fails" check), `measurements/measure-sds.mts` (`rootOf`, `withoutDims`), D3.

## Steps

1. `git mv` the 33 probes from `plans/svg-dimension-style/measurements/probes/<name>.puml` and
   `probes/jar/<name>.svg` to `tests/fixtures/svg-dimension-style/<name>.puml` + `<name>.svg`. Delete the then-empty
   `probes/` directory. The measurer then finds them under `FIXTURES`.
2. Re-render every oracle with `scripts/oracle-render.sh <abs tests/fixtures/svg-dimension-style> <puml...>`. Delete
   the `svek-N.dot` files and `seq-newpage_001.svg`, and confirm `git diff --stat` shows no SVG change (the oracle is
   stable).
3. Write the gate per D3:
   - `EXACT`: the 10 `ctl-*` rows;
   - `OPEN`: the 23 gap rows, each with `reason: '#193 T2'`, `'#193 T3'` or `'#193 T4'` per the batch-2 overview;
   - a header comment citing `TextBlockExporter.java:418-421`, `SkinParam.java:1216-1218` and
     `SvgGraphics.java:795-799`.
4. Run the gate alone and read the count: 33 rows plus the shape checks, all passing.

## Acceptance
- Given the 33 fixtures, when the gate runs at the base `src/`, then it passes with 23 `OPEN` and 10 `EXACT` rows.
- Given a `.puml` added to the fixture directory with no entry, when the gate runs, then it fails naming the file.
- Given an `OPEN` row whose engine starts omitting the attributes, when the gate runs, then it fails, telling you to
  move the row to `EXACT`.
- Given the measurer, when run, then it prints `rows 33 exact 10 dims 23 other 0`.

Observability is N/A. Rollback is Reversible.
