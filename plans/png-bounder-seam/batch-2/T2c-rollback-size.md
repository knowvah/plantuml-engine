# T2c — the rollback atom is sized by its PNG export (D5)

**Read first:**
- `klimt/creole/atom/AtomMath.java:55-95`.
- `math/ScientificEquationSafe.java:85-151`.
- `core/TextBlockExporter.java` (builder defaults, `calculateFinalDimension`, `createUGraphic` PNG arm, and
  `createUGraphicPNG:335-346`).
- `klimt/shape/GraphicStrings.java` (`createBlackOnWhiteMonospaced`).
- `src/core/klimt/creole/atom/AtomMath.ts:120-155`, `src/core/math/ScientificEquationSafe.ts:150-215`,
  `src/core/TextBlockExporter.ts`.

## Steps

1. **Author fixtures first.** No committed oracle has a creole rollback outside #170's 8 rows (README). Author
   `tests/fixtures/factories/cov-rollback-*.puml` covering:
   - a short rollback in a class note (`<math>glb x</math>`);
   - two rollbacks on consecutive creole lines (the line-advance seam);
   - a rollback wider than the rest of its block (the width seam);
   - a rollback in a sequence note;
   - `<latex>\glb{x}</latex>` in a creole line.

   Render their oracles with `scripts/oracle-render.sh /abs/out <puml>`. `oracle/dist` now holds the seam-5 jar. Each
   fixture's oracle must contain a `ROLLBACK_DOCUMENT` image: check with `classify-movers.mjs`'s regex.
2. **Red.** Assert jar values:
   - In `tests/unit/factories/rollback.test.ts`, the `<image>` size and the next line's `y`, for `cunotu-47-bute165` and
     two new fixtures.
   - In `tests/unit/core/klimt/creole/atom/AtomMath.test.ts`, `calculateDimensionSlow` for `glb x` under a
     `DeterministicMeasurer`: the PNG export's `(int)` dimensions, read from a seam-5 oracle, never computed by hand.
3. **Green.**
   - Add `ScientificEquationSafe#getImageDimension(stringBounder)`, or the closest upstream-named shape. It mirrors
     `getImage`'s rollback arm:
     - build `getRollback()` (`ScientificEquationSafe.java:137-139`);
     - compute `TextBlockExporter`'s final dimension with `FileFormat.PNG`'s builder defaults (no skin param, margin
       `none()`, the block's own back colour), measured with `pngDefaultStringBounder(measurerOf(stringBounder))`;
     - truncate each axis as `createUGraphicPNG` does (`(int) (dim.getWidth() * scaleFactor)`, `TextBlockExporter.java:343-344`).
   - `AtomMath#calculateDimensionSlow` uses it when `!typesets()`. `drawU` still draws `rollbackSvg(...)` (`AtomMath.java:88-90`).
   - Keep the existing doc comment's claim about "PNG and SVG exports share `calculateFinalDimension`" only if it is
     still true, and say which bounder each uses.
4. Measure, alone:
   - `npm run svg:survey -- unknown --out /tmp/pbs-T2c/parity-unknown.json`, then `verdict-diff.mjs <base> /tmp/pbs-T2c`.
     It lists every moved row against `<base>`'s committed survey.
   - Expect `cunotu`, `marese`, `pecafo`, `vocalo` and `xanuke` to be conformant. `kebadi`, `rozesu` and `roxita` keep
     only their named mechanisms: re-read their diffs to prove it.
   - Every engine whose rows carry `<math>`/`<latex>` atoms (class, sequence, state, description): survey them too. A
     non-rollback atom must not move: `typesets()` rows take the `measureLatex` arm unchanged.
5. Commit `fix(creole): size a math rollback by its PNG export` (`Refs: #170`).

## Acceptance

- Given `cunotu-47-bute165` rendered with a `DeterministicMeasurer`, then it is conformant against its seam-5 oracle.
- Given `kebadi`, `rozesu` and `roxita`, then each remaining diff is one of its `DIVERGENCES.md`-named mechanisms.
- Given each `cov-rollback-*` fixture, then it is at 0 diffs against its oracle.
- Given a formula JLaTeXMath typesets, then its atom size is unchanged from the base sha.

Observability: N/A, no new observable operations. Rollback: Reversible (revert the commit).
