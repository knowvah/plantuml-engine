/**
 * The regex fragments and Java text helpers the chart commands share. Regexes
 * are transcribed with Java's classes and compiled `i` without `u`, as
 * `Pattern2` is `CASE_INSENSITIVE` without `UNICODE_CASE` (D6): `%s` is
 * `\s` plus U+00A0 with Java's ASCII `\s` (`Pattern2.java:57`), and `.` excludes
 * Java's five line terminators, one more than JS's.
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/regex/Pattern2.java:53-58
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/regex/RegexLeaf.java
 */
import { CommandExecutionResult } from '../../../core/command/CommandExecutionResult.js';
import { javaTrim } from '../../../core/java-number-format.js';
import { NoSuchColorException } from '../../../core/klimt/color/NoSuchColorException.js';
import { Stereotype } from '../../../core/stereo/Stereotype.js';
import type { ChartDiagram } from '../ChartDiagram.js';
import { ChartSeries, type SeriesType } from '../ChartSeries.js';
import type { ChartCartesianData } from './ChartCartesianData.js';
import { BRACKETED } from './ChartDataItems.js';

/** Java's `\s`. */
const JAVA_S = String.raw`[ \t\n\x0B\f\r]`;
/** `%s`. @see Pattern2.java:57 */
const SPACE = String.raw`[ \t\n\x0B\f\r ]`;
/** Java's `.` without DOTALL. */
const JAVA_DOT = String.raw`[^\n\r\u0085  ]`;

/** `RegexLeaf.spaceZeroOrMore()`. */
export const SP0 = `${SPACE}*`;
/** `RegexLeaf.spaceOneOrMore()`. */
export const SP1 = `${SPACE}+`;
/** `"([^"]+)"` under the name `TITLE`, optional. */
export const TITLE_PART = '(?:"(?<TITLE>[^"]+)")?';
/** `(-?[0-9.]+)\s*-?->\s*(-?[0-9.]+)`, optional: `1.2.3` matches here and fails `parseDouble` later. */
export const RANGE_PART = `(?:(?<RANGE_0>-?[0-9.]+)${JAVA_S}*-?->${JAVA_S}*(?<RANGE_1>-?[0-9.]+))?`;
/** `\[(.*)\]`: used for the axes' `DATA` and `TICKS` and the series' `DATA`. */
export function bracketGroup(name: string): string {
  return `\\[(?<${name}>${JAVA_DOT}*)\\]`;
}
/** `ChartDataItems.BRACKETED` without its capturing group, so the command names it `DATA`. */
const BRACKETED_BODY = BRACKETED.slice(1, -1);

/** The optional ` labels` keyword. */
export const LABELS_PART = `(?:${SP1}(?<LABELS>labels))?`;
/** The optional ` v2` or ` y2` keyword. */
export const V2_PART = `(?:${SP1}(?<V2>[vy]2))?`;

/**
 * What every series command opens with, in the `RegexConcat` order they all
 * share: the name is `ChartSeriesName`'s, and the data is optional, a series
 * written without it taking the list items that follow (5ee1a051948). Compiled
 * `iu`, for the name's `\p{L}`.
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/chart/command/CommandChartBar.java:66-79
 */
export function seriesHead(keyword: string, nameRegex: string): string {
  return (
    `^${SP0}${keyword}${SP0}(?:(?<STEREO><<${JAVA_DOT}+?>>))?${SP0}(?:${nameRegex})?${SP0}` +
    `(?:(?<DATA>${BRACKETED_BODY}))?${SP0}(?:#(?<COLOR>[0-9a-fA-F]{6}|[0-9a-fA-F]{3}|\\w+))?`
  );
}

/**
 * The series a parsed data gives: by coordinate pairs or by values, with the keys
 * when every value has one.
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/chart/command/CommandChartLine.java:111-120
 */
export function seriesOf(name: string, type: SeriesType, parsed: ChartCartesianData): ChartSeries {
  const series = parsed.pairs
    ? new ChartSeries(name, type, parsed.values, parsed.xValues)
    : new ChartSeries(name, type, parsed.values);
  if (parsed.keyed) series.setKeys(parsed.keys as readonly string[]);
  return series;
}

/**
 * Written without data, the series takes its values from the list items that
 * follow it; with data, it is added.
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/chart/command/CommandChartLine.java:153-155
 */
export function addOrOpen(
  diagram: ChartDiagram,
  series: ChartSeries,
  data: string | undefined,
): CommandExecutionResult {
  return data === undefined ? diagram.openSeries(series) : diagram.addSeries(series);
}

/**
 * `String#split(",")`: trailing empties dropped, and no match answers the whole
 * string, even empty.
 */
export function javaSplitComma(s: string): string[] {
  if (!s.includes(',')) return [s];
  const parts = s.split(',');
  while (parts.length > 0 && parts[parts.length - 1] === '') parts.pop();
  return parts;
}

/**
 * `parseLabels`, the same in both axis commands. A lone `"` reaches
 * `substring(1, 0)`: Java's `StringIndexOutOfBoundsException`, a crash and not a refusal.
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/chart/command/CommandChartHAxis.java:142-157
 */
export function parseLabels(data: string | undefined): string[] {
  if (data === undefined || javaTrim(data) === '') return [];
  return javaSplitComma(data).map((part) => {
    const label = javaTrim(part);
    if (!label.startsWith('"') || !label.endsWith('"')) return label;
    if (label.length === 1) throw new Error('StringIndexOutOfBoundsException: begin 1, end 0, length 1');
    return label.slice(1, -1);
  });
}

/**
 * The tail every series command shares: the stereotype, then
 * `getColor("#" + colorStr)`, then `V2` and `LABELS` where the regex has them.
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/chart/command/CommandChartLine.java:122-142
 */
export function decorateSeries(
  diagram: ChartDiagram,
  series: ChartSeries,
  groups: Readonly<Record<string, string | undefined>>,
): void {
  const stereo = groups['STEREO'];
  if (stereo !== undefined) series.setStereotype(Stereotype.build(stereo));
  const color = groups['COLOR'];
  if (color !== undefined) series.setColor(diagram.getSkinParam().getIHtmlColorSet().getColor(`#${color}`));
  if (groups['V2'] !== undefined) series.setUseSecondaryAxis(true);
  if (groups['LABELS'] !== undefined) series.setShowLabels(true);
  if (groups['INTERPOLATE'] !== undefined) series.setInterpolate(true);
  if (groups['CONNECT'] !== undefined) series.setConnect(true);
}

/** `SingleLineCommand2`'s `catch (NoSuchColorException e)`. @see command/SingleLineCommand2.java:174-178 */
export function withBadColor(run: () => CommandExecutionResult): CommandExecutionResult {
  try {
    return run();
  } catch (e) {
    if (e instanceof NoSuchColorException) return CommandExecutionResult.badColor();
    throw e;
  }
}
