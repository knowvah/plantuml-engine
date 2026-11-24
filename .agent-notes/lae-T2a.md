## Observation: MyElkEdge#getStyle signs the diagram's own style name on upstream master
- **Context**: porting the legacy ELK adapter's `getArrowStyle` (lae T2a, #158).
- **Finding**: `MyElkEdge.java:140-144` merges `StyleQueries.ARROW.add(diagram.getDiagramType().getStyleName()).withStereotype(link.getStereotype())` on `skinParam.getCurrentStyleBuilder()`. The `SName.classDiagram` passed at `MyElkDrawing.java:202` is only the constructor's `styleName` field. `cheneer-elk-adapter.ts` (`ELK_EDGE_STYLE_NAME = 'classDiagram'`, link style builder) predates the re-pin; Chen maps to `activityDiagram` anyway, so its 8 fixtures do not see it.
- **Impact**: a `<style> classDiagram { arrow {...} }` rule would colour Chen's ELK edges but not the jar's; a diagram-name rule would do the opposite. Worth a check when Chen is next touched.
- **Confidence**: High (read on the pinned master `b066ee08c`)

## Observation: legacy `if` condition is quantifier 2, drawn in the FontParam.ARROW skin font under ELK
- **Context**: T2a red test on `pragma-elk-if`.
- **Finding**: `UBrexCommandIf.java:212-215` puts the condition in `linkArg.withQuantifier(null, ifLabel)`. Under ELK it draws through the maker's `getQuantifier` with `FontConfiguration.create(skinParam, FontParam.ARROW, null)` (size 11 in ACTIVITY, `FontParam.java:159-162`), not the svek path's `arrow cardinality` style. `ActivityLegacySkinParam#getFont` was unported, so `activity-legacy-font-param.ts` ports that one call.
- **Impact**: a `<style>` arrow rule does not reach the `if` condition under ELK; `skinparam arrowFontSize` does.
- **Confidence**: High
