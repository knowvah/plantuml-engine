/**
 * `CommandChartHAxis`: `h-axis` or `x-axis`.
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/chart/command/CommandChartHAxis.java
 */
import * as ChartNumber from './ChartNumber.js';
import { CommandExecutionResult } from '../../../core/command/CommandExecutionResult.js';
import { LabelPosition } from '../ChartAxis.js';
import { GridMode, Kind, type ChartDiagram } from '../ChartDiagram.js';
import { bracketGroup, parseLabels, RANGE_PART, SP0, SP1, TITLE_PART } from './chart-command-text.js';

/** `Integer.MAX_VALUE`, past which `Integer.parseInt` throws. */
const INT_MAX = 2147483647;

/** @see CommandChartHAxis.java:59-79 */
export const CHART_H_AXIS_RE = new RegExp(
  `^${SP0}[hx]-axis${SP0}${TITLE_PART}${SP0}${RANGE_PART}${SP0}(?:${bracketGroup('DATA')})?${SP0}` +
    `(?:spacing${SP1}(?<SPACING>[0-9]+))?${SP0}(?:(?<LABELRIGHT>label-right))?${SP0}(?:(?<GRID>grid))?${SP0}$`,
  'i',
);

/** `spacing N`: an int above 0. @see CommandChartHAxis.java:107-117 */
function applySpacing(diagram: ChartDiagram, spacingStr: string | undefined): CommandExecutionResult | undefined {
  if (spacingStr === undefined) return undefined;
  const spacing = Number(spacingStr);
  if (spacing > INT_MAX) return CommandExecutionResult.error('Invalid number format in spacing value');
  if (spacing <= 0) return CommandExecutionResult.error('X-axis spacing must be greater than 0');
  diagram.setXAxisTickSpacing(spacing);
  return undefined;
}

/**
 * Spacing, `label-right` and `grid` apply before any return. A numeric range
 * returns without reading `DATA`; otherwise a missing title overwrites an earlier one.
 * @see CommandChartHAxis.java:91-140
 */
export function applyChartHAxis(diagram: ChartDiagram, match: RegExpExecArray): CommandExecutionResult {
  // @see CommandChartHAxis.java:97-99 (e8ef39dd55c)
  const kindError = diagram.checkKind('h-axis', Kind.CARTESIAN);
  if (kindError !== undefined) return kindError;
  const g = match.groups!;
  const title = g['TITLE'];

  const spacingError = applySpacing(diagram, g['SPACING']);
  if (spacingError !== undefined) return spacingError;
  if (g['LABELRIGHT'] !== undefined) diagram.setXAxisLabelPosition(LabelPosition.RIGHT);
  if (g['GRID'] !== undefined) diagram.setXGridMode(GridMode.MAJOR);

  if (g['RANGE_0'] !== undefined && g['RANGE_1'] !== undefined) {
    const min = ChartNumber.parse(g['RANGE_0']);
    const max = ChartNumber.parse(g['RANGE_1']);
    if (min === undefined || max === undefined)
      return CommandExecutionResult.error('Invalid number format in axis range');
    return diagram.setXAxis(title, min, max);
  }

  const labels = parseLabels(g['DATA']);
  diagram.setXAxisTitle(title);
  return diagram.setXAxisLabels(labels);
}
