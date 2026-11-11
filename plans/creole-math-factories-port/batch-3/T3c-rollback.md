# T3c — mirror the JLaTeXMath rollback

Read [D5](../decisions.md#d5--a-math-or-math-document-failure-takes-the-rollback-path-not-an-error-box),
[D6](../decisions.md#d6--the-rollback-decision-a-generated-names-only-table-of-jlatexmaths-commands) and
[task-contract.md](../task-contract.md).

**Java:** `math/ScientificEquationSafe.java:91-115, :137-139`; `klimt/shape/GraphicStrings.java` (`createBlackOnWhiteMonospaced`);
`klimt/creole/atom/AtomMath.java`. Evidence: 18 corpus images whose decoded SVG is monospace text (`cunotu` 1, `kebadi` 1, `marese` 7,
`pecafo` 3, `roxita` 1, `rozesu` 3, `vocalo` 1, `xanuke` 1), plus `cov-math-unknown` (40×25, `glb x`), `cov-latex-unknown` (119×25).

**Write:** `plans/creole-math-factories-port/measurements/jlm-commands.mjs` (a `node` tool that reads `oracle/dist/plantuml-oracle.jar`'s
`org/scilab/forge/jlatexmath/TeXSymbols.xml`, `TeXFormulaSettings.xml` and the class files' string constants via `spawnSync('unzip', ...)`,
and writes the table); `src/core/latex-metrics/jlm-commands.ts` (generated, names only, with a provenance header); `src/core/math/ScientificEquationSafe.ts`
(a `getRollback`-equivalent and a "would JLaTeXMath accept this" predicate); `src/core/klimt/creole/atom/AtomMath.ts` and the T1c/T2c
document path (the rollback branch: for a top-level diagram a klimt document through `GraphicStrings.createBlackOnWhiteMonospaced`, for an
atom the `<image>` of that SVG sized by its dimensions); `tests/unit/factories/rollback.test.ts`.

Rollback is decided **by JLaTeXMath's vocabulary**, not by whether KaTeX raised: read each rollback formula and the `\name` it contains.
JLaTeXMath also rejects a command with a missing argument: check `cov-latex-syntax` (`\frac{a` is accepted, 24×45) before assuming.

## Acceptance
- Given `cov-math-unknown` and `cov-latex-unknown`, when rendered, then each is a klimt document of 40×25 and 119×25.
- Given the 18 corpus rollback images, when `row-diffs.mts` runs over their rows, then each image is sized as the oracle's.
- Given a test re-deriving the table from the jar, then it matches `jlm-commands.ts` exactly.
- Given `verdict-diff`, then 0 conformant rows lost in any engine.

Observability: N/A — no new observable operations. Rollback: Reversible (delete `jlm-commands.ts`; D6).
