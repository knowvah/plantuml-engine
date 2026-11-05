/**
 * `CommandChartBar`: no `V2` group, so `bar [1,2] v2` is a syntax error, and
 * values only, so `bar [(1,2)]` fails `parseValues`.
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/chart/command/CommandChartBar.java
 */
import { CommandExecutionResult } from '../../../core/command/CommandExecutionResult.js';
import type { ChartDiagram } from '../ChartDiagram.js';
import { ChartSeries, SeriesType } from '../ChartSeries.js';
import { decorateSeries, LABELS_PART, parseValues, seriesHead, SP0, withBadColor } from './chart-command-text.js';

/** @see CommandChartBar.java:62-79 */
export const CHART_BAR_RE = new RegExp(`${seriesHead('bar')}${LABELS_PART}${SP0}$`, 'i');

/** @see CommandChartBar.java:91-121 */
export function applyChartBar(diagram: ChartDiagram, match: RegExpExecArray): CommandExecutionResult {
  const g = match.groups!;
  const values = parseValues(g['DATA']!);
  if (values === undefined) return CommandExecutionResult.error('Invalid number format in bar data');

  const series = new ChartSeries(g['NAME'] ?? `bar${diagram.getSeries().length}`, SeriesType.BAR, values);
  return withBadColor(() => {
    decorateSeries(diagram, series, g);
    return diagram.addSeries(series);
  });
}
