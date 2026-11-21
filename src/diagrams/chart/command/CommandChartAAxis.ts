/**
 * `CommandChartAAxis` — the categories around a pie or a radar (e8ef39dd55c):
 * `a-axis [Dev, "Ops, Run", QA]`.
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/chart/command/CommandChartAAxis.java
 */
import { CommandExecutionResult } from '../../../core/command/CommandExecutionResult.js';
import type { ChartDiagram } from '../ChartDiagram.js';
import { parseLabels } from './ChartDataItems.js';
import { bracketGroup, SP0 } from './chart-command-text.js';

/** @see CommandChartAAxis.java:67-75 */
export const CHART_A_AXIS_RE = new RegExp(`^${SP0}a-axis${SP0}${bracketGroup('DATA')}${SP0}$`, 'i');

/** @see CommandChartAAxis.java:83-90 */
export function applyChartAAxis(diagram: ChartDiagram, match: RegExpExecArray): CommandExecutionResult {
  const labels = parseLabels(match.groups!['DATA']);
  if (labels === undefined) return CommandExecutionResult.error('Unbalanced quotes in a-axis');
  return diagram.setAngularLabels(labels);
}
