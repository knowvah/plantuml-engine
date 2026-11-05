# T1a — Seed lines hold the jar's compiled stdlib sprite lines

**Row:** `biluko-70`, `svg/defs/filter/@id` and `text/@filter`. Ours `b1pir1to0b9a7i0`, jar `bmz1zsmol5ic0`.

**Read:** `UmlSource.java:222-233` (`seed()`), `BlockUml.java:150-155`, `CommandSpriteStdlib.java`, `CommandSpriteStdlibSvg.java`, `Stdlib.java:366-385`; `src/core/uml-source-lines.ts`, `src/core/tim/IncludeExecutor.ts:80,105,137,184-190`, `src/core/tim/EaterTheme.ts:92,149`, `src/core/preprocessor.ts:388-410`, `src/core/tim/TContextSubstitution.ts:86`. D2 holds the rule and the rejected options.

**Do:** as D2 Option D. Mark at every stdlib read: `!include`, `!includesub`, `!includedef` and the theme path. Fold in `resultOf` for `dataLines` only. Keep the compile rule a pure function of raw lines plus `<lib>/<path>`, tested on its own, citing the probes as its evidence because upstream's compiler is not in the tree: `Stdlib.java:236` holds only the commented-out reverse.

**Red:** the pure rule, on the four shapes in D2, and the `edgy` procedure form. `seedSource` of an authored two-sprite fixture equals a committed copy of the jar's `-preproc` for it.

**Measure:** the probes, then `c4`, `component`, `unknown`, `sequence`. Any row with `!include <` and a def can move.

## Acceptance
- Given `stdlib-probes.mjs` and `seed-probe.mts`, when run, then every probe prints equal, or the journal names each residual probe with its line and mechanism.
- Given `biluko-70`, when re-read with `row-diffs.mts`, then `filter/@id` and `text/@filter` are gone.
- Given `buildBlockUmls` on a stdlib source, then `preprocessed.lines` is unchanged against the base: no parser moves.

Interface output: `seedSource` keeps its type, `readonly string[]`. Observability N/A. Rollback Reversible.
