/**
 * `CommandChartScatter`: only the trailing `MARKER` group sets the shape, so
 * `scatter <<triangle>> [1]` is a stereotype named triangle and draws a circle.
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/chart/command/CommandChartScatter.java
 */
import { CommandExecutionResult } from '../../../core/command/CommandExecutionResult.js';
import type { ChartDiagram } from '../ChartDiagram.js';
import { ChartSeries, MarkerShape, SeriesType } from '../ChartSeries.js';
import {
  decorateSeries,
  LABELS_PART,
  parseCoordinatePairs,
  parseValues,
  seriesHead,
  SP0,
  SP1,
  V2_PART,
  withBadColor,
} from './chart-command-text.js';

/** @see CommandChartScatter.java:62-87 */
export const CHART_SCATTER_RE = new RegExp(
  `${seriesHead('scatter')}${V2_PART}${LABELS_PART}(?:${SP1}<<(?<MARKER>circle|square|triangle)>>)?${SP0}$`,
  'i',
);

/** The `switch (markerStr.toLowerCase())`, whose `default` joins `circle`. @see CommandChartScatter.java:138-149 */
function markerShapeOf(markerStr: string): MarkerShape {
  switch (markerStr.toLowerCase()) {
    case 'square':
      return MarkerShape.SQUARE;
    case 'triangle':
      return MarkerShape.TRIANGLE;
    default:
      return MarkerShape.CIRCLE;
  }
}

/** @see CommandChartScatter.java:98-165 */
export function applyChartScatter(diagram: ChartDiagram, match: RegExpExecArray): CommandExecutionResult {
  const g = match.groups!;
  const data = g['DATA']!;
  const seriesName = g['NAME'] ?? `scatter${diagram.getSeries().length}`;

  let series: ChartSeries;
  if (data.includes('(')) {
    const pairs = parseCoordinatePairs(data);
    if (pairs === undefined) return CommandExecutionResult.error('Invalid coordinate pair format in scatter data');
    series = new ChartSeries(seriesName, SeriesType.SCATTER, pairs.yValues, pairs.xValues);
  } else {
    const values = parseValues(data);
    if (values === undefined) return CommandExecutionResult.error('Invalid number format in scatter data');
    series = new ChartSeries(seriesName, SeriesType.SCATTER, values);
  }

  return withBadColor(() => {
    decorateSeries(diagram, series, g);
    if (g['MARKER'] !== undefined) series.setMarkerShape(markerShapeOf(g['MARKER']));
    return diagram.addSeries(series);
  });
}
