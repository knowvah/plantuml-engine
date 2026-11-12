## Observation: plans/.../fixtures.mts cannot measure ELK fixtures
- **Context**: measuring `cov-elk` after wiring the ELK path.
- **Finding**: `plans/chen-eer-engine-port/measurements/fixtures.mts` calls `renderSync` without `options.elk`, so every ELK fixture throws `ELK_RENDER_SYNC_UNSUPPORTED`, which `renderSync` turns into an error page (first diff `svg/@background #000000`). `scripts/svg-parity-survey.ts` awaits `loadElk()` once and passes it; `tests/oracle/svg-conformance/render-fixture-cheneer.ts#renderFixtureCheneer` also passes none.
- **Impact**: a plan-script run reports the 8 `cov-elk*` fixtures as diffs. A copy with `elk: await loadElk()` reports 90/90 at 0. The svg-cheneer ratchet helper needs the same `elk` option before it counts ELK rows.
- **Confidence**: High

## Observation: Chen under ELK matches the jar with no elkjs delta
- **Context**: 8 ELK fixtures (cov-elk, one leaf, empty, cardinality + bold + colour, subset/superset, self link, style, rankdir).
- **Finding**: all 8 are 0 diffs. Upstream has no empty-diagram or degenerate shortcut on the ELK path (`CucaDiagramFileMakerElk.java:477-499`), so an empty diagram is 26x26 and one leaf is 55x120; `left to right direction` changes nothing under ELK (cov-elk-rankdir equals cov-elk).
- **Impact**: no library-forced delta to record for Chen; the ELK adapter is a thin abel-model reader (no classify/size re-derivation as description needs).
- **Confidence**: High (jar-variants: all 7 authored oracles stable over 3 runs)

## Observation: MyElkEdge styles arrows as classDiagram, the label as the diagram's own
- **Context**: `getArrowStyle` vs `getLabel` in the Chen adapter.
- **Finding**: `MyElkDrawing.java:202` hard-codes `SName.classDiagram` for the edge colour/stroke, while the label font and wrap width come from `skinParam.getDiagramType().getStyleName()` (CHEN_EER -> activityDiagram, cheneer D4, `CucaDiagramFileMakerElk.java:157-163`). The adapter reads each from its own signature.
- **Impact**: a `<style>` rule on `activityDiagram { arrow {...} }` colours the dot path and the label but not the ELK line.
- **Confidence**: Medium (cov-elk-style matches, but exercises only `.dashed`/skinparam, not a diagram-name rule)
