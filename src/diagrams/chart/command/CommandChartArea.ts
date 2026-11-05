/**
 * `CommandChartArea`: values only, so `area [(1,2)]` fails `parseValues`.
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/chart/command/CommandChartArea.java
 */
import { CommandExecutionResult } from '../../../core/command/CommandExecutionResult.js';
import type { ChartDiagram } from '../ChartDiagram.js';
import { ChartSeries, SeriesType } from '../ChartSeries.js';
import {
  decorateSeries,
  LABELS_PART,
  parseValues,
  seriesHead,
  SP0,
  V2_PART,
  withBadColor,
} from './chart-command-text.js';

/** @see CommandChartArea.java:62-83 */
export const CHART_AREA_RE = new RegExp(`${seriesHead('area')}${V2_PART}${LABELS_PART}${SP0}$`, 'i');

/** @see CommandChartArea.java:94-130 */
export function applyChartArea(diagram: ChartDiagram, match: RegExpExecArray): CommandExecutionResult {
  const g = match.groups!;
  const values = parseValues(g['DATA']!);
  if (values === undefined) return CommandExecutionResult.error('Invalid number format in area data');

  const series = new ChartSeries(g['NAME'] ?? `area${diagram.getSeries().length}`, SeriesType.AREA, values);
  return withBadColor(() => {
    decorateSeries(diagram, series, g);
    return diagram.addSeries(series);
  });
}
