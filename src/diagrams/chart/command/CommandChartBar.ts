/**
 * `CommandChartBar`: no `V2` group, so `bar [1,2] v2` is a syntax error, and no
 * coordinate pairs (22ed6b6b822).
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/chart/command/CommandChartBar.java
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
  withBadColor,
} from './chart-command-text.js';

/** @see CommandChartBar.java:66-83 */
export const CHART_BAR_RE = new RegExp(`${seriesHead('bar', seriesNameRegex('labels'))}${LABELS_PART}${SP0}$`, 'iu');

/** @see CommandChartBar.java:91-127 */
export function applyChartBar(diagram: ChartDiagram, match: RegExpExecArray): CommandExecutionResult {
  const g = match.groups!;
  const parsed = parseCartesianData(g['DATA'], false);
  if (parsed.error !== undefined) return CommandExecutionResult.error(parsed.error);

  const series = seriesOf(seriesNameOf(g) ?? `bar${diagram.getSeries().length}`, SeriesType.BAR, parsed);
  return withBadColor(() => {
    decorateSeries(diagram, series, g);
    return addOrOpen(diagram, series, g['DATA']);
  });
}
