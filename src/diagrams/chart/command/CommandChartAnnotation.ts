/**
 * `CommandChartAnnotation`: `annotation "text" at (x, y) [<<arrow>>]`.
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/chart/command/CommandChartAnnotation.java
 */
import { CommandExecutionResult } from '../../../core/command/CommandExecutionResult.js';
import { javaTrim, parseDouble } from '../../../core/java-number-format.js';
import { ChartAnnotation } from '../ChartAnnotation.js';
import type { ChartDiagram } from '../ChartDiagram.js';
import { SP0, SP1 } from './chart-command-text.js';

/** @see CommandChartAnnotation.java:61-82 */
export const CHART_ANNOTATION_RE = new RegExp(
  `^${SP0}annotation${SP1}"(?<TEXT>[^"]+)"${SP1}at${SP0}\\(${SP0}(?<XPOS>[^,]+)${SP0},${SP0}(?<YPOS>[^)]+)${SP0}\\)` +
    `${SP0}(?:<<(?<ARROW>arrow)>>)?${SP0}$`,
  'i',
);

/** @see CommandChartAnnotation.java:93-121 */
export function applyChartAnnotation(diagram: ChartDiagram, match: RegExpExecArray): CommandExecutionResult {
  const g = match.groups!;
  const xPosStr = javaTrim(g['XPOS']!);
  const yPosStr = javaTrim(g['YPOS']!);

  const yPosition = parseDouble(yPosStr);
  if (yPosition === undefined) return CommandExecutionResult.error(`Y position must be a numeric value: ${yPosStr}`);

  // Not a number: a categorical label.
  const xPosition = parseDouble(xPosStr) ?? xPosStr;
  return diagram.addAnnotation(new ChartAnnotation(g['TEXT']!, xPosition, yPosition, g['ARROW'] !== undefined));
}
