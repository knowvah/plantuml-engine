# T2c — The factory

**Read:** `ChartDiagramFactory.java`, `command/CommonCommands.java`, `command/PSystemCommandFactory.java`, `wbs/WBSDiagramFactory.ts`, `gantt/GanttDiagramFactory.ts:60-100`, `salt/PSystemSaltFactory.ts:15-30`, D2.

**Do:** `parseChart(source, preprocessing)` per D2.

1. **Order differs from wbs:** chart commands first, common commands last (`ChartDiagramFactory.java#initCommandsList`, "so they don't override chart-specific ones"). So `legend right` is `CommandChartLegend`, and a bare `legend` opener reaches `CommandMultilinesLegend`. `grid` is not registered.
2. **Common commands, all of `addCommonCommands1`:** title family through `matchAnnotationCommand`, `CommandNope`, `CommandAssumeTransparent`, sprites, scale, and `CommandRotate`, `CommandMinwidth`, `CommandPage`, `CommandNamespaceSeparator` as `GanttDiagramFactory.ts:65-77` handles them (`page 0x1` errors `Argument must be positive`). `addCommonHides` is `hide empty description` and the by-visibility and by-gender forms: read how `CommandHideShowByGender` acts on a `TitledDiagram`, port the accept-and-ignore it reduces to, and test one of each. A hide form that needs more than that: journal it and treat by D8.
3. Style dispatch, warnings and refusal lines as `WBSDiagramFactory.ts:185-260`.

## Acceptance
- Given `grid v-axis`, then a syntax refusal at that line, as the planning probe.
- Given `rotate`, `page 2x2`, `scale 2`, then no refusal, and `diagram.scale` is set.
- Given `legend right` then `legend bottom`, then `getLegendPosition()` is BOTTOM and `annotations.legend` is empty.
- Given a `<style>` block with a syntax error, then the refusal message starts `Error in style definition:`.
- Given `title T` then `h-axis [A]`, then `annotations.title` holds `T`.

Observability N/A. Rollback Reversible.
