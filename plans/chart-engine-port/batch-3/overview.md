# Batch 3 — renderers

New files only, per D5's split. Unit tests here draw through `UGraphicSvg` and assert the bytes of the matching cached oracle's elements (`test-results/dot-cache/chart/<slug>/in.svg`) or authored values.

| ID | Description | Agent | Writes | Depends On | Done |
|---|---|---|---|---|---|
| [T3a](T3a-axes-and-draw.md) | `ChartRenderer` frame, axes, grid, `ChartStyles`, `ChartDiagram#getRenderer` | typescript-pro | `chart/{ChartRenderer,ChartRendererAxes,ChartStyles,ChartDiagram}.ts` | T1b | [x] |
| [T3b](T3b-series-renderers.md) | `drawSeries` and the four series renderers | typescript-pro | `chart/{BarRenderer,LineRenderer,AreaRenderer,ScatterRenderer,ChartRenderer}.ts` | T3a | [x] |
| [T3c](T3c-legend-and-annotations.md) | Legend and annotations | typescript-pro | `chart/{ChartRendererLegend,ChartRendererAnnotations,ChartRenderer}.ts` | T3b | [x] |
