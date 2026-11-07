# aar-T2a — arrow labels around while / repeat / backward

## Observation: tile builders discarded `tileNodes(...).trailing`
- **Context**: `->label;` before `endwhile` / `repeat while` drew nothing.
- **Finding**: `tileWhile`/`tileRepeat` read only `.tiles`; the trailing pending arrow IS upstream's `incoming(...)` (while) / `endRepeatLinkRendering` (repeat). Any compound builder that calls `tileNodes` and ignores `trailing` is suspect.
- **Impact**: grep `tileNodes(` call sites for `.tiles` only when a label goes missing at a block end.
- **Confidence**: High

## Observation: renderSync is not the conformance render
- **Context**: a unit test asserting jar coordinates via `renderSync`.
- **Finding**: `renderSync` measures with the default measurer; jar numbers need `renderFixtureActivity(markup, new DeterministicMeasurer())` (`tests/oracle/svg-conformance/render-fixture-activity.ts`).
- **Impact**: assert jar x/y only through the fixture seam.
- **Confidence**: High

## Observation: tile tests build themes with no measurer
- **Context**: `edgeLabelBlockSize` inside `GtileWhile` threw in `gtile-while.test.ts`.
- **Finding**: `edgeLabelBlockSize`'s default measurer is `activityMeasurer(theme)`, which throws on a bare theme; `measureSide(text, bounder, theme, mode)` measures the same block through the tile's own `bounder`.
- **Impact**: inside tiles, measure label blocks with `measureSide`, not `edgeLabelBlockSize`.
- **Confidence**: High

## Observation: census away-from-jar needed a tool
- **Context**: re-pin step 3.
- **Finding**: `plans/activity-authored-rows/measurements/census-away.mjs <ref>` lists every style/text/swimlane census attribute whose ours-vs-jar distance grew since `<ref>`.
- **Impact**: run it after every `repin-activity-baselines.ts --write`.
- **Confidence**: High
