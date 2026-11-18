# T1a: `%version()` returns `versionString()`

**Decisions:** D1, D2. **Writes:** `src/core/tim/builtin/TimEnvironment.ts`, `src/core/tim/builtin/GetVersion.ts`,
`tests/unit/core/tim/builtin/env-functions.test.ts`, `tests/unit/core/tim/builtin/string-functions.test.ts`, and one
preprocess-level test. **Reads:** the task-contract spine.

## Steps

1. **Red.**
   - `env-functions.test.ts:34`: expect `env.getVersionString()` to be `versionString()` (import from
     `src/core/version.ts`).
   - `string-functions.test.ts` `describe('GetVersion')`: keep the injected-seam test; add one that
     `new GetVersion(createDefaultTimEnvironment())` returns `VERSION`.
   - A preprocess-level test: find the preprocessor unit tests with `grep -rln "preprocessOrError" tests/unit`, and
     assert that a line `Version %version()` preprocesses to `Version ${VERSION}`. If no such home fits, add a
     `renderSync` test that a `legend` containing `%version()` draws a `<text>` reading
     `Rendered with Plantuml Version ${VERSION}` (the `rekefe-90` legend line).
   - Run them; all three fail on `unknown`.
2. **Green.** In `createDefaultTimEnvironment()`, `getVersionString: () => versionString()`, importing from
   `../../version.js`. Update the `getVersionString` JSDoc (`TimEnvironment.ts:116-117`) and `GetVersion.ts`'s header to
   cite `GetVersion.java:63-66`, `Version.java:47-49` and ruling #155 (2026-11-09). Do not add a `0.0.999` branch (D2).
3. **Check the inert-default prose.** `TimEnvironment.ts`'s header and `createDefaultTimEnvironment`'s JSDoc say the
   default returns inert values; `DIVERGENCES.md`'s "File, environment, clock, and RNG builtins are inert by default"
   does not list `%version`, so it needs no change. Adjust the JSDoc wording only if it now misstates the version.
4. **Measure** per the task contract: the activity pins and the activity survey. Journal the new
   `rekefe-90-baju604` record (verdict, `maxDelta`, `firstDiff`, `maxDeltaPath`) for T1b. Every other activity row
   keeps its verdict and diff count. Revert `parity-activity.json` here if only `generatedAt` and this row moved; T1b
   commits it.
5. **Commit:** `fix(tim): return this port's version from %version()`, body citing the ruling, footer `Refs: #155`.

## Acceptance
- Given the default environment, when `%version()` runs, then it returns `versionString()` (`0.2.0`).
- Given an injected environment answering `'1.2.3'`, when `%version()` runs, then it returns `'1.2.3'` (seam kept).
- Given `rekefe-90-baju604`, when the activity survey runs, then its legend text reads `… Version 0.2.0` and the row
  is still `diverged` only on the 5 legend attributes.
- Given every other activity row, when the survey runs, then no verdict or diff count moves.

Observability is N/A. Rollback is Reversible.
