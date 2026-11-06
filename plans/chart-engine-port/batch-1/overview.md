# Batch 1 — model, number text, diagram

New files only; `renderSync` still reaches the old engine (D9).

| ID | Description | Agent | Writes | Depends On | Done |
|---|---|---|---|---|---|
| [T1a](T1a-model-and-number-text.md) | `ChartAxis`, `ChartSeries`, `ChartAnnotation`, Java number text | typescript-pro | `chart/{ChartAxis,ChartSeries,ChartAnnotation}.ts`, `core/java-number-format.ts`, `core/svg-format.ts` | T0 | [x] |
| [T1b](T1b-diagram-and-skin-param.md) | `ChartDiagram` minus its renderer, and the skin param | typescript-pro | `chart/ChartDiagram.ts`, `chart/chart-skin-param.ts` | T1a | [x] |

**Interface T1b gives batch 2:** `ChartDiagram` with upstream's setters and `addSeries`, each returning `CommandExecutionResult`, plus `getSkinParam()`, `annotations`, `sprites`, `scale`. **T3a adds** `getTextBlock()`, `drawU`, `calculateDimension`, `getRenderer`.
