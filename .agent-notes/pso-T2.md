# pso-T2: frame colours off the merged partition style

## Observation: rows.mts measures stockError rows raw
- **Context**: full `rows.mts tests/fixtures/diagram-style-scope` measure fed to a pin tool.
- **Finding**: `rows.mts` measures every row with `measureDbgRow`; the ratchet measures a `stockError` pin under the
  error-page rule (`tests/oracle/svg-conformance/diagram-style-scope.ts:92-97`). 12 stockError rows read 5-103
  diffs in `rows.mts` at HEAD and after the change alike, so a naive pin tool reports them as rises.
- **Impact**: any pin tool fed a full `rows.mts` measure must skip `stockError` pins
  (`plans/activity-authored-rows/measurements/lower-dss.mjs:17`, now also `pso/measurements/pin-rows.mjs`).
- **Confidence**: High

## Observation: stale activity__spot-* pins
- **Context**: lowering the diagram-style-scope pins after pso-T2.
- **Finding**: 32 `activity__spot-*` rows were pinned at 2 but measure 0 at the pso base sources too (checked with
  the src changes stashed). An earlier mission fixed them without repinning.
- **Impact**: a full repin lowers rows unrelated to the task; check the count at the base before attributing a lower.
- **Confidence**: High

## Observation: no Theme field carries `skinparam mode dark` to renderers
- **Context**: porting `paintOf(style, name, isDark)` for the frame reads.
- **Finding**: `SkinparamAccumulator.mode` only seeds scalar defaults (`skinparam-theme-builder.ts#applyDarkModeDefaults`);
  the Theme has no dark flag. Under dark mode `style-element-scope.ts#elementScopeColors` writes every element bucket
  off a dark-scheme builder, and those bucket tiers are read first, so renderer-side merged reads pass `isDark=false`
  (as `activity-box-theme.ts:45-46` does).
- **Impact**: a merged-style read placed BEFORE the bucket tiers would need its own dark source.
- **Confidence**: Medium (verified on two authored dark rows, not on the whole dark corpus)
