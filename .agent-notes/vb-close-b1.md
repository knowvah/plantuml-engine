## Observation: a builtin's output can move rows that only error-page-compare
- **Context**: version-builtin batch-1 close; `%version()` changed from `unknown` to `0.2.0`.
- **Finding**: `c4/kipive-74-lele070` was conformant only because both sides errored at line 5 (`unknown` here, `$version$` in the dev-build jar). `0.2.0` is a line the class engine accepts (in the jar too), so the row became jar-errors-we-draw. The planning grep classified it "errors either way" without rendering it. The activity-only pins and the activity survey could not see it; only the every-engine survey + `verdict-diff.mjs` did.
- **Impact**: when a change alters preprocessed text, render every corpus row whose source reaches it, in its own engine, before predicting a verdict. Do not rely on a "not a command either way" argument.
- **Confidence**: High

## Observation: refusal/routing baselines hold per-row `weErrored`/`ourType` pins that a builtin change can stale
- **Context**: same.
- **Finding**: `refusal-baseline.json` and `routing-baseline.json` pin `kipive-74` (`weErrored`, `engine`, `ourType`). The parts pass when a pinned error starts rendering ("a fall never fails", `[FIXED]` printed only via `console.log`, which the default reporter hides), but `refusal-coverage.test.ts` hard-codes `pinnedErroring`/`pinnedRendering` counts, which move by hand with a derivation line.
- **Impact**: after a re-pin, update both counts in `refusal-coverage.test.ts` with a derivation comment. A passing gate run does not show that a pin went stale.
- **Confidence**: High

## Observation: `docs/catalog.md` quotes each file header's first sentence
- **Context**: same; `npm test` failed `tests/architecture/catalog.test.ts` after T1a rewrote `GetVersion.ts`'s header JSDoc.
- **Finding**: rewording a file-header JSDoc (not only adding exports) drifts the catalog.
- **Impact**: run `npm run catalog` after editing any `src/` file header.
- **Confidence**: High
