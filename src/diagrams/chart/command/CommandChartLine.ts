/**
 * `CommandChartLine`: values or coordinate pairs (22ed6b6b822), and the trailing
 * `v2`, `labels`, `interpolate` (b42fd8313ee) and `connect` (52426da82b1) keywords.
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/chart/command/CommandChartLine.java
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
  SP1,
  V2_PART,
  withBadColor,
} from './chart-command-text.js';

/** The optional ` interpolate` keyword. @see CommandChartLine.java:81-84 */
const INTERPOLATE_PART = `(?:${SP1}(?<INTERPOLATE>interpolate))?`;
/** The optional ` connect` keyword. @see CommandChartLine.java:85-88 */
const CONNECT_PART = `(?:${SP1}(?<CONNECT>connect))?`;

/** @see CommandChartLine.java:62-91 */
export const CHART_LINE_RE = new RegExp(
  `${seriesHead('line', seriesNameRegex('v2', 'y2', 'labels', 'interpolate', 'connect'))}` +
    `${V2_PART}${LABELS_PART}${INTERPOLATE_PART}${CONNECT_PART}${SP0}$`,
  'iu',
);

/** @see CommandChartLine.java:100-156 */
export function applyChartLine(diagram: ChartDiagram, match: RegExpExecArray): CommandExecutionResult {
  const g = match.groups!;
  const parsed = parseCartesianData(g['DATA'], true);
  if (parsed.error !== undefined) return CommandExecutionResult.error(parsed.error);

  const series = seriesOf(seriesNameOf(g) ?? `line${diagram.getSeries().length}`, SeriesType.LINE, parsed);
  return withBadColor(() => {
    decorateSeries(diagram, series, g);
    return addOrOpen(diagram, series, g['DATA']);
  });
}
