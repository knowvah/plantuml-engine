/**
 * `CommandChartHAxis`: `h-axis` or `x-axis`.
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/chart/command/CommandChartHAxis.java
 */
import { CommandExecutionResult } from '../../../core/command/CommandExecutionResult.js';
import { parseDouble } from '../../../core/java-number-format.js';
import { LabelPosition } from '../ChartAxis.js';
import { GridMode, type ChartDiagram } from '../ChartDiagram.js';
import { bracketGroup, parseLabels, RANGE_PART, SP0, SP1, TITLE_PART } from './chart-command-text.js';

/** `Integer.MAX_VALUE`, past which `Integer.parseInt` throws. */
const INT_MAX = 2147483647;

/** @see CommandChartHAxis.java:59-79 */
export const CHART_H_AXIS_RE = new RegExp(
  `^${SP0}[hx]-axis${SP0}${TITLE_PART}${SP0}${RANGE_PART}${SP0}(?:${bracketGroup('DATA')})?${SP0}` +
    `(?:spacing${SP1}(?<SPACING>[0-9]+))?${SP0}(?:(?<LABELRIGHT>label-right))?${SP0}(?:(?<GRID>grid))?${SP0}$`,
  'i',
);

/**
 * Spacing, `label-right` and `grid` apply before any return. A numeric range
 * returns without reading `DATA`; otherwise a missing title overwrites an earlier one.
 * @see CommandChartHAxis.java:91-140
 */
export function applyChartHAxis(diagram: ChartDiagram, match: RegExpExecArray): CommandExecutionResult {
  const g = match.groups!;
  const title = g['TITLE'];

  if (g['SPACING'] !== undefined) {
    const spacing = Number(g['SPACING']);
    if (spacing > INT_MAX) return CommandExecutionResult.error('Invalid number format in spacing value');
    if (spacing <= 0) return CommandExecutionResult.error('X-axis spacing must be greater than 0');
    diagram.setXAxisTickSpacing(spacing);
  }
  if (g['LABELRIGHT'] !== undefined) diagram.setXAxisLabelPosition(LabelPosition.RIGHT);
  if (g['GRID'] !== undefined) diagram.setXGridMode(GridMode.MAJOR);

  if (g['RANGE_0'] !== undefined && g['RANGE_1'] !== undefined) {
    const min = parseDouble(g['RANGE_0']);
    const max = parseDouble(g['RANGE_1']);
    if (min === undefined || max === undefined)
      return CommandExecutionResult.error('Invalid number format in axis range');
    return diagram.setXAxis(title, min, max);
  }

  const labels = parseLabels(g['DATA']);
  diagram.setXAxisTitle(title);
  return diagram.setXAxisLabels(labels);
}
