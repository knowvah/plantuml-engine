# T1a: the authored gate

**Writes:** `tests/fixtures/usecase-title-style/*.{puml,svg}`,
`tests/oracle/svg-conformance/usecase-title-style.authored.test.ts`.
**Reads:** `tests/oracle/svg-conformance/edge-label-embed.authored.test.ts` (the model),
`tests/oracle/svg-conformance/unresolved-colour.authored.test.ts` (its `ZERO`/`OPEN` comment style), D3.

## Steps

1. `git mv` the 6 probes and their jar SVGs from `plans/usecase-title-style/measurements/probes/` (and `probes/jar/`)
   to `tests/fixtures/usecase-title-style/<name>.puml` + `<name>.svg`. The measurer then finds them under `FIXTURES`;
   `measurements/probes/` is left empty (delete it).
2. Re-render every oracle with `scripts/oracle-render.sh <abs tests/fixtures/usecase-title-style> <puml...>`, delete
   the `svek-N.dot` files, and confirm `git diff --stat` shows no SVG change (the oracle is stable).
3. Write the gate per D3. Every row is `OPEN` with its T0 diff count and `reason: '#148 T1b'`. A file on disk with no
   `ZERO`/`OPEN` entry fails, and an entry with no file fails.
4. Run the gate alone and read the count: 6 rows, all passing.

## Acceptance
- Given the 6 fixtures, when the gate runs at the base `src/`, then it passes with 6 `OPEN` rows at the README's diff
  counts.
- Given a `.puml` added to the fixture directory with no entry, when the gate runs, then it fails naming the file.
- Given the measurer, when run, then it prints `rows 6 zero 0 open 6 error 0`.

Observability is N/A. Rollback is Reversible.
