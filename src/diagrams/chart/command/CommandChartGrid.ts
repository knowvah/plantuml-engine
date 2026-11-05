/**
 * `CommandChartGrid`. Ported and deliberately NOT registered:
 * `ChartDiagramFactory.java:65-79` does not add it, so `grid v-axis` is a syntax
 * error in the jar. The `equals` tests are case-sensitive after a
 * case-insensitive regex, so `H-axis` reaches the error arm.
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/chart/command/CommandChartGrid.java
 */
import { CommandExecutionResult } from '../../../core/command/CommandExecutionResult.js';
import { GridMode, type ChartDiagram } from '../ChartDiagram.js';
import { SP0, SP1 } from './chart-command-text.js';

/** @see CommandChartGrid.java:54-61 */
export const CHART_GRID_RE = new RegExp(`^${SP0}grid${SP1}(?<AXIS>[hx]-axis|[vy]-axis)${SP0}$`, 'i');

/** @see CommandChartGrid.java:72-86 */
export function applyChartGrid(diagram: ChartDiagram, match: RegExpExecArray): CommandExecutionResult {
  const axis = match.groups!['AXIS']!;
  const gridMode = GridMode.MAJOR;
  if (axis === 'h-axis' || axis === 'x-axis') return diagram.setXGridMode(gridMode);
  if (axis === 'v-axis' || axis === 'y-axis') return diagram.setYGridMode(gridMode);
  return CommandExecutionResult.error(`Invalid axis: ${axis}`);
}
