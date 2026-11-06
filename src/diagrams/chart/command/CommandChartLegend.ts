/**
 * `CommandChartLegend`: `legend left|right|top|bottom`. A chart command, so it
 * runs before the common `legend` commands.
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/chart/command/CommandChartLegend.java
 */
import { CommandExecutionResult } from '../../../core/command/CommandExecutionResult.js';
import { LegendPosition, type ChartDiagram } from '../ChartDiagram.js';
import { SP0, SP1 } from './chart-command-text.js';

/** @see CommandChartLegend.java:54-61 */
export const CHART_LEGEND_RE = new RegExp(`^${SP0}legend${SP1}(?<POSITION>left|right|top|bottom)${SP0}$`, 'i');

/** @see CommandChartLegend.java:72-95 */
export function applyChartLegend(diagram: ChartDiagram, match: RegExpExecArray): CommandExecutionResult {
  const position = match.groups!['POSITION']!;
  switch (position.toLowerCase()) {
    case 'left':
      return diagram.setLegendPosition(LegendPosition.LEFT);
    case 'right':
      return diagram.setLegendPosition(LegendPosition.RIGHT);
    case 'top':
      return diagram.setLegendPosition(LegendPosition.TOP);
    case 'bottom':
      return diagram.setLegendPosition(LegendPosition.BOTTOM);
    default:
      return CommandExecutionResult.error(`Invalid legend position: ${position}`);
  }
}
