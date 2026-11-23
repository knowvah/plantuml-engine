/**
 * `CommandChartPie` — a pie, its data between brackets or as the list items that
 * follow (e8ef39dd55c, 5ee1a051948). Options, in any order: `labels` shows each
 * slice's value, `percent` its share, `donut` (optionally followed by the hole's
 * size, 50% by default) draws a ring. A pie has no name of its own: Java passes
 * a null name, here an empty one, which nothing draws.
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/chart/command/CommandChartPie.java
 */
import { CommandExecutionResult } from '../../../core/command/CommandExecutionResult.js';
import { Stereotype } from '../../../core/stereo/Stereotype.js';
import type { ChartDiagram } from '../ChartDiagram.js';
import { ChartSeries, SeriesType } from '../ChartSeries.js';
import { applyTo, BRACKETED, parseDataItems } from './ChartDataItems.js';
import * as ChartNumber from './ChartNumber.js';
import { seriesNameOf, seriesNameRegex } from './ChartSeriesName.js';
import { addOrOpen, SP0 } from './chart-command-text.js';

/** Java's ASCII `\s`. */
const JAVA_S = String.raw`[ \t\n\x0B\f\r]`;
/** Java's `.` without DOTALL. */
const JAVA_DOT = String.raw`[^\n\r\u0085  ]`;
/** The default donut hole, in percent. @see CommandChartPie.java:121 */
const DEFAULT_HOLE = 50;
/** The largest donut hole, in percent. @see CommandChartPie.java:129 */
const MAX_HOLE = 90;
/** Percent to a share. @see CommandChartPie.java:131 */
const PERCENT = 100;

/** @see CommandChartPie.java:77-89 */
export const CHART_PIE_RE = new RegExp(
  `^${SP0}pie${SP0}(?:(?<STEREO><<${JAVA_DOT}+?>>))?${SP0}(?:${seriesNameRegex('labels', 'percent', 'donut')})?${SP0}` +
    `(?:(?<DATA>${BRACKETED.slice(1, -1)}))?` +
    `(?<OPTIONS>(?:${JAVA_S}+(?:labels|percent|donut(?:${JAVA_S}+[0-9.]+%)?))*)${SP0}$`,
  'iu',
);

/** @see CommandChartPie.java:97-138 */
export function applyChartPie(diagram: ChartDiagram, match: RegExpExecArray): CommandExecutionResult {
  const g = match.groups!;
  const data = parseDataItems(g['DATA'], diagram.getSkinParam().getIHtmlColorSet());
  if (data.error !== undefined) return CommandExecutionResult.error(data.error);

  const series = new ChartSeries(seriesNameOf(g) ?? '', SeriesType.PIE, data.values);
  applyTo(data, series);
  if (g['STEREO'] !== undefined) series.setStereotype(Stereotype.build(g['STEREO']));
  const optionsError = applyOptions(series, g['OPTIONS']!);
  if (optionsError !== undefined) return CommandExecutionResult.error(optionsError);
  return addOrOpen(diagram, series, g['DATA']);
}

/** `options.trim().split("\\s+")`, each word in turn. @see CommandChartPie.java:111-134 */
function applyOptions(series: ChartSeries, options: string): string | undefined {
  const words = options.replace(/^[\x00-\x20]+|[\x00-\x20]+$/g, '').split(new RegExp(`${JAVA_S}+`));
  for (let i = 0; i < words.length; i++) {
    if (words[i] === 'labels') series.setShowLabels(true);
    else if (words[i] === 'percent') series.setShowPercent(true);
    else if (words[i] === 'donut') {
      const sized = i + 1 < words.length && words[i + 1]!.endsWith('%');
      if (sized) i++;
      const error = applyDonut(series, sized ? words[i] : undefined);
      if (error !== undefined) return error;
    }
  }
  return undefined;
}

/** The hole, `50%` unless given, between 1% and 90%. @see CommandChartPie.java:119-131 */
function applyDonut(series: ChartSeries, word: string | undefined): string | undefined {
  let hole = DEFAULT_HOLE;
  if (word !== undefined) {
    const parsed = ChartNumber.parse(word.substring(0, word.length - 1));
    if (parsed === undefined) return `Invalid donut size ${word}`;
    hole = parsed;
  }
  if (hole <= 0 || hole > MAX_HOLE) return 'The donut size must be between 1% and 90%';
  series.setDonutHole(hole / PERCENT);
  return undefined;
}
