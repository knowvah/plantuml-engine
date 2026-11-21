/**
 * `CommandChartArea`: values only, no coordinate pairs (22ed6b6b822).
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/chart/command/CommandChartArea.java
 */
import { CommandExecutionResult } from '../../../core/command/CommandExecutionResult.js';
import type { ChartDiagram } from '../ChartDiagram.js';
import { SeriesType } from '../ChartSeries.js';
import { parseCartesianData } from './ChartCartesianData.js';
import { seriesNameOf, seriesNameRegex } from './ChartSeriesName.js';
import {
  addOrOpen,
  decorateSeries,
  LABELS_PART,
  seriesHead,
  seriesOf,
  SP0,
  V2_PART,
  withBadColor,
} from './chart-command-text.js';

/** @see CommandChartArea.java:64-85 */
export const CHART_AREA_RE = new RegExp(
  `${seriesHead('area', seriesNameRegex('v2', 'y2', 'labels'))}${V2_PART}${LABELS_PART}${SP0}$`,
  'iu',
);

/** @see CommandChartArea.java:94-138 */
export function applyChartArea(diagram: ChartDiagram, match: RegExpExecArray): CommandExecutionResult {
  const g = match.groups!;
  const parsed = parseCartesianData(g['DATA'], false);
  if (parsed.error !== undefined) return CommandExecutionResult.error(parsed.error);

  const series = seriesOf(seriesNameOf(g) ?? `area${diagram.getSeries().length}`, SeriesType.AREA, parsed);
  return withBadColor(() => {
    decorateSeries(diagram, series, g);
    return addOrOpen(diagram, series, g['DATA']);
  });
}
