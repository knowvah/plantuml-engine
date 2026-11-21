/**
 * `CommandChartRadar` — one series of a radar, its data between brackets or as
 * the list items that follow (e8ef39dd55c, 5ee1a051948).
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/chart/command/CommandChartRadar.java
 */
import { CommandExecutionResult } from '../../../core/command/CommandExecutionResult.js';
import type { ChartDiagram } from '../ChartDiagram.js';
import { ChartSeries, SeriesType } from '../ChartSeries.js';
import { applyTo, parseDataItems } from './ChartDataItems.js';
import { seriesNameOf, seriesNameRegex } from './ChartSeriesName.js';
import { addOrOpen, decorateSeries, LABELS_PART, seriesHead, SP0, withBadColor } from './chart-command-text.js';

/** @see CommandChartRadar.java:71-89 */
export const CHART_RADAR_RE = new RegExp(
  `${seriesHead('radar', seriesNameRegex('labels'))}${LABELS_PART}${SP0}$`,
  'iu',
);

/** @see CommandChartRadar.java:97-122 */
export function applyChartRadar(diagram: ChartDiagram, match: RegExpExecArray): CommandExecutionResult {
  const g = match.groups!;
  const data = parseDataItems(g['DATA'], diagram.getSkinParam().getIHtmlColorSet());
  if (data.error !== undefined) return CommandExecutionResult.error(data.error);

  const name = seriesNameOf(g) ?? `radar${diagram.getSeries().length}`;
  const series = new ChartSeries(name, SeriesType.RADAR, data.values);
  applyTo(data, series);
  return withBadColor(() => {
    decorateSeries(diagram, series, g);
    return addOrOpen(diagram, series, g['DATA']);
  });
}
