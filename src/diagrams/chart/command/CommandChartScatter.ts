/**
 * `CommandChartScatter`: only the trailing `MARKER` group sets the shape, so
 * `scatter <<triangle>> [1]` is a stereotype named triangle and draws a circle.
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/chart/command/CommandChartScatter.java
 */
import { CommandExecutionResult } from '../../../core/command/CommandExecutionResult.js';
import type { ChartDiagram } from '../ChartDiagram.js';
import { MarkerShape, SeriesType } from '../ChartSeries.js';
import { parseCartesianData } from './ChartCartesianData.js';
import { seriesNameOf, seriesNameRegex } from './ChartSeriesName.js';
import {
  addOrOpen,
  decorateSeries,
  LABELS_PART,
  seriesHead,
  seriesOf,
  SP0,
  SP1,
  V2_PART,
  withBadColor,
} from './chart-command-text.js';

/** @see CommandChartScatter.java:64-89 */
export const CHART_SCATTER_RE = new RegExp(
  `${seriesHead('scatter', seriesNameRegex('v2', 'y2', 'labels'))}${V2_PART}${LABELS_PART}` +
    `(?:${SP1}<<(?<MARKER>circle|square|triangle)>>)?${SP0}$`,
  'iu',
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

/** @see CommandChartScatter.java:98-167 */
export function applyChartScatter(diagram: ChartDiagram, match: RegExpExecArray): CommandExecutionResult {
  const g = match.groups!;
  const parsed = parseCartesianData(g['DATA'], true);
  if (parsed.error !== undefined) return CommandExecutionResult.error(parsed.error);

  const series = seriesOf(seriesNameOf(g) ?? `scatter${diagram.getSeries().length}`, SeriesType.SCATTER, parsed);
  return withBadColor(() => {
    decorateSeries(diagram, series, g);
    if (g['MARKER'] !== undefined) series.setMarkerShape(markerShapeOf(g['MARKER']));
    return addOrOpen(diagram, series, g['DATA']);
  });
}
