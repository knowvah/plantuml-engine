# T1a: the authored gate

**Writes:** `tests/fixtures/usymbol-group-scale/*.{puml,svg}`,
`tests/oracle/svg-conformance/usymbol-group-scale.authored.test.ts`.
**Reads:** `tests/oracle/svg-conformance/usecase-title-style.authored.test.ts` (the model: same `ZERO`/`OPEN` shape,
same render path), and the "Measurement surface" decision in `decisions.md`.

## Steps

1. `git mv` the 29 probes from `plans/usymbol-group-scale/measurements/probes/` to
   `tests/fixtures/usymbol-group-scale/<name>.puml`, and their jar SVGs from `probes/jar/` to `<name>.svg` beside them.
   The measurer then finds them under `FIXTURES`. Delete the empty `measurements/probes/`.
2. Re-render every oracle with `scripts/oracle-render.sh <abs tests/fixtures/usymbol-group-scale> <puml...>`, delete
   the `svek-N.dot` files, and confirm `git diff --stat` shows no SVG change (the oracle is stable).
3. Write the gate.
   - `ZERO`: `scale-folder`, `scale-package`, `desc-rectangle`.
   - `OPEN`: every other row, at its T0 diff count, with the reason `'#149 T1b'` or `'#149 T1c'` from the README table's
     Task column. A row both tasks touch (`node-thick-dashed`) names both.
   - `scale-group`, `scale-partition` and `package-fontsize` get `'#149 T2: file D3 R1'` and `'… R2'` until T2 files
     them.
   - A file on disk with no entry fails the gate, and so does an entry with no file.
4. Run the gate alone and read the count: 29 rows, all passing.

## Acceptance
- Given the 29 fixtures, when the gate runs at the base `src/`, then it passes with 3 `ZERO` and 26 `OPEN` rows at the
  README's diff counts.
- Given a `.puml` added to the fixture directory with no entry, when the gate runs, then it fails naming the file.
- Given the measurer, when it runs, then it prints `rows 29 zero 3 open 26 error 0`.

Observability is N/A. Rollback is Reversible.
