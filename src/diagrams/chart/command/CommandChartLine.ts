/**
 * `CommandChartLine`: coordinate pairs when the data contains a `(`.
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/chart/command/CommandChartLine.java
 */
import { CommandExecutionResult } from '../../../core/command/CommandExecutionResult.js';
import type { ChartDiagram } from '../ChartDiagram.js';
import { ChartSeries, SeriesType } from '../ChartSeries.js';
import {
  decorateSeries,
  LABELS_PART,
  parseCoordinatePairs,
  parseValues,
  seriesHead,
  SP0,
  V2_PART,
  withBadColor,
} from './chart-command-text.js';

/** @see CommandChartLine.java:62-83 */
export const CHART_LINE_RE = new RegExp(`${seriesHead('line')}${V2_PART}${LABELS_PART}${SP0}$`, 'i');

/** @see CommandChartLine.java:94-144 */
export function applyChartLine(diagram: ChartDiagram, match: RegExpExecArray): CommandExecutionResult {
  const g = match.groups!;
  const data = g['DATA']!;
  const seriesName = g['NAME'] ?? `line${diagram.getSeries().length}`;

  let series: ChartSeries;
  if (data.includes('(')) {
    const pairs = parseCoordinatePairs(data);
    if (pairs === undefined) return CommandExecutionResult.error('Invalid coordinate pair format in line data');
    series = new ChartSeries(seriesName, SeriesType.LINE, pairs.yValues, pairs.xValues);
  } else {
    const values = parseValues(data);
    if (values === undefined) return CommandExecutionResult.error('Invalid number format in line data');
    series = new ChartSeries(seriesName, SeriesType.LINE, values);
  }

  return withBadColor(() => {
    decorateSeries(diagram, series, g);
    return diagram.addSeries(series);
  });
}
