# aar-T2b — fork / split / merge labels, note after end split

## Observation: stubbed seams carry their own "until a port fills" note
- **Context**: `gtile-fork.ts` `tallestLabelHeight([])` / `suppForIncomingArrow(0, ...)`.
- **Finding**: the Java was ported but fed zeros; the branch tiles already carried `inLabel`/`outLabel`. Filling the seam closed 5 authored + 9 corpus rows. `GtileMerge`/`GtileSplit` never received `theme`, so any theme-dependent measure in `GtileFork` silently returned 0 for them.
- **Impact**: grep for "until a ... port fills" / "no ... tracked yet" before building anew.
- **Confidence**: High

## Observation: tests can pin a residual with `.not.toBe(golden)`
- **Context**: two fixture tests asserted canvas width != jar.
- **Finding**: they fail the moment the gap closes; flip them to `toBe` with the Java citation.
- **Impact**: expect such failures as good news when a mechanism lands.
- **Confidence**: High
