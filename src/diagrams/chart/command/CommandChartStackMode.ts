/**
 * `CommandChartStackMode`: `stackMode grouped|stacked`.
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/chart/command/CommandChartStackMode.java
 */
import { CommandExecutionResult } from '../../../core/command/CommandExecutionResult.js';
import { StackMode, type ChartDiagram } from '../ChartDiagram.js';
import { SP0, SP1 } from './chart-command-text.js';

/** @see CommandChartStackMode.java:54-61 */
export const CHART_STACK_MODE_RE = new RegExp(`^${SP0}stackMode${SP1}(?<MODE>grouped|stacked)${SP0}$`, 'i');

/** @see CommandChartStackMode.java:72-89 */
export function applyChartStackMode(diagram: ChartDiagram, match: RegExpExecArray): CommandExecutionResult {
  const mode = match.groups!['MODE']!;
  switch (mode.toLowerCase()) {
    case 'grouped':
      return diagram.setStackMode(StackMode.GROUPED);
    case 'stacked':
      return diagram.setStackMode(StackMode.STACKED);
    default:
      return CommandExecutionResult.error(`Invalid stack mode: ${mode}`);
  }
}
