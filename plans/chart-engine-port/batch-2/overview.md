# Batch 2 — commands and factory

New files only. Each command exports its compiled pattern and an `apply` function, the `CommandWBSLink.ts` shape, with the Java's group names as named groups.

| ID | Description | Agent | Writes | Depends On | Done |
|---|---|---|---|---|---|
| [T2a](T2a-axis-commands.md) | `CommandChartHAxis`, `CommandChartVAxis`, shared Java text helpers | typescript-pro | `chart/command/{CommandChartHAxis,CommandChartVAxis,chart-command-text}.ts` | T1b | [x] |
| [T2b](T2b-series-commands.md) | Bar, line, area, scatter, annotation, legend, stack mode, orientation, grid | typescript-pro | the other `chart/command/CommandChart*.ts` | T2a | [x] |
| [T2c](T2c-factory.md) | `ChartDiagramFactory`: registration order and the common commands | typescript-pro | `chart/ChartDiagramFactory.ts` | T2b | [x] |
