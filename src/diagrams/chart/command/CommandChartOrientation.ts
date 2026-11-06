/**
 * `CommandChartOrientation`: `orientation vertical|horizontal`.
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/chart/command/CommandChartOrientation.java
 */
import { CommandExecutionResult } from '../../../core/command/CommandExecutionResult.js';
import { Orientation, type ChartDiagram } from '../ChartDiagram.js';
import { SP0, SP1 } from './chart-command-text.js';

/** @see CommandChartOrientation.java:54-61 */
export const CHART_ORIENTATION_RE = new RegExp(
  `^${SP0}orientation${SP1}(?<ORIENTATION>vertical|horizontal)${SP0}$`,
  'i',
);

/** @see CommandChartOrientation.java:72-89 */
export function applyChartOrientation(diagram: ChartDiagram, match: RegExpExecArray): CommandExecutionResult {
  const orientation = match.groups!['ORIENTATION']!;
  switch (orientation.toLowerCase()) {
    case 'vertical':
      return diagram.setOrientation(Orientation.VERTICAL);
    case 'horizontal':
      return diagram.setOrientation(Orientation.HORIZONTAL);
    default:
      return CommandExecutionResult.error(`Invalid orientation: ${orientation}`);
  }
}
