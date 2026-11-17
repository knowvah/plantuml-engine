# T1a: the authored gate

**Writes:** `tests/fixtures/emoji-edge-artwork/*.{puml,svg}`,
`tests/oracle/svg-conformance/emoji-edge-artwork.authored.test.ts`.
**Reads:** `tests/oracle/svg-conformance/usymbol-group-scale.authored.test.ts` (the model: same `ZERO`/`OPEN` shape),
`tests/helpers/emoji-assets-store.ts`, and the "Measurement surface" decision in `decisions.md`.

## Steps

1. `git mv` the 8 probes from `plans/emoji-edge-artwork/measurements/probes/` to
   `tests/fixtures/emoji-edge-artwork/<name>.puml`, and their jar SVGs from `probes/jar/` to `<name>.svg` beside them.
   The measurer then finds them under `FIXTURES`. Delete the empty `measurements/probes/`.
2. Re-render every oracle with `scripts/oracle-render.sh <abs tests/fixtures/emoji-edge-artwork> <puml...>`, delete
   the `svek-N.dot` files, and confirm `git diff --stat` shows no SVG change (the oracle is stable).
3. Write the gate. It renders each row with `renderSync(puml, { measurer: new DeterministicMeasurer(), assetStore })`,
   where `assetStore` is one `buildEmojiAssetsStore()` for the file.
   - `ZERO`: `desc-stereo-emoji`.
   - `OPEN`: every other row at its T0 diff count, with the reason from the README table's Task column
     (`'#150 T1b'`, `'#150 T1c'`, `'#150 T1d'`).
   - `class-edge-emoji`, `class-quantifier-emoji`, `desc-cluster-title-emoji` and `state-edge-emoji` get
     `'#150 T2: file D3 R1'`, `'… R2'` and `'… R3'` until T2 files them.
   - A file on disk with no entry fails the gate, and so does an entry with no file.
4. Run the gate alone and read the count: 8 rows, all passing.

## Acceptance
- Given the 8 fixtures, when the gate runs at the base `src/`, then it passes with 1 `ZERO` and 7 `OPEN` rows at the
  README's diff counts.
- Given a `.puml` added to the fixture directory with no entry, when the gate runs, then it fails naming the file.
- Given the measurer, when it runs, then it prints `rows 9 zero 1 open 8 error 0` (the issue's fixture plus the 8).

Observability is N/A. Rollback is Reversible.
