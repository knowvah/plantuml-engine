# lic T1 — license page text (2026-11-24)

## Observation: a UFont passed to StringBounder#calculateDimension passes vitest and fails tsc
- **Context**: deriving the license page's `textLength` rows in `tests/unit/version/PSystemLicense.test.ts` from `stringBounderFor(measurer)`.
- **Finding**: `StringBounder#calculateDimension` takes `{ family, size }` (`src/core/klimt/font/StringBounder.ts:49`); `UFont` carries `fontStack` and `size` (`UFont.ts:48-54`) and no `family`. vitest does not typecheck, so the call ran with `family: undefined` and the deterministic measurer still produced the SansSerif widths; only `npm run typecheck` caught it. The right shape is `{ family: font.getFontStack().getFullDefinition(), size: font.getSize() }`, as `FontConfigurationBridge.ts:56` builds it.
- **Impact**: a test that measures text directly should build that shape; a green `npx vitest run` is not evidence the test typechecks.
- **Confidence**: High

## Observation: a page-text task whose authored row rises cannot close its batch green alone
- **Context**: T1 changed the `license` page; the authored ratchet (`utility.diff-baseline.ratchet.test.ts`) is part of `npm test`.
- **Finding**: the three `cov-licen*` rows rose 145 -> 188 at T1, as the brief expected, so `npm test` is red until T2a re-pins them. The mission folded batch 1's close into batch 2's.
- **Impact**: when planning, put the re-pin in the same batch as the change that moves an authored row.
- **Confidence**: High
