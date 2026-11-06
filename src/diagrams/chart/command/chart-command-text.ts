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
import { javaTrim, parseDouble } from '../../../core/java-number-format.js';
import { NoSuchColorException } from '../../../core/klimt/color/NoSuchColorException.js';
import { Stereotype } from '../../../core/stereo/Stereotype.js';
import type { ChartDiagram } from '../ChartDiagram.js';
import type { ChartSeries } from '../ChartSeries.js';

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
/** The optional ` labels` keyword. */
export const LABELS_PART = `(?:${SP1}(?<LABELS>labels))?`;
/** The optional ` v2` or ` y2` keyword. */
export const V2_PART = `(?:${SP1}(?<V2>[vy]2))?`;

/**
 * What every series command opens with, in the `RegexConcat` order they all share.
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/chart/command/CommandChartBar.java:62-73
 */
export function seriesHead(keyword: string): string {
  return (
    `^${SP0}${keyword}${SP0}(?:(?<STEREO><<${JAVA_DOT}+?>>))?${SP0}(?:"(?<NAME>[^"]+)")?${SP0}` +
    `${bracketGroup('DATA')}${SP0}(?:#(?<COLOR>[0-9a-fA-F]{6}|[0-9a-fA-F]{3}|\\w+))?`
  );
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
 * `parseValues`, the same in every series command: `undefined` for Java's `null`.
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/chart/command/CommandChartBar.java:123-136
 */
export function parseValues(data: string): number[] | undefined {
  if (javaTrim(data) === '') return [];
  const result: number[] = [];
  for (const part of javaSplitComma(data)) {
    const value = parseDouble(javaTrim(part));
    if (value === undefined) return undefined;
    result.push(value);
  }
  return result;
}

/** `String#split("\\),\\(")`, with `split`'s dropped trailing empties. */
function splitPairs(cleaned: string): string[] {
  const parts = cleaned.split('),(');
  if (parts.length === 1) return parts;
  while (parts.length > 0 && parts[parts.length - 1] === '') parts.pop();
  return parts;
}

/** The coordinates a `line` or `scatter` carries in pair notation. */
export interface CoordinatePairs {
  readonly xValues: readonly number[];
  readonly yValues: readonly number[];
}

/**
 * `parseCoordinatePairs`, the same in `line` and `scatter`: `undefined` for
 * Java's `false`. Its null-or-blank test is unreachable, since the caller saw a `(`.
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/chart/command/CommandChartLine.java:162-191
 */
export function parseCoordinatePairs(data: string): CoordinatePairs | undefined {
  const xValues: number[] = [];
  const yValues: number[] = [];
  for (const pair of splitPairs(data.replace(/[ \t\n\x0B\f\r]+/g, ''))) {
    const trimmedPair = javaTrim(pair)
      .replace(/^[[(]+/, '')
      .replace(/[\])]+$/, '');
    const coords = javaSplitComma(trimmedPair);
    if (coords.length !== 2) return undefined;
    const x = parseDouble(javaTrim(coords[0]!));
    const y = parseDouble(javaTrim(coords[1]!));
    if (x === undefined || y === undefined) return undefined;
    xValues.push(x);
    yValues.push(y);
  }
  return { xValues, yValues };
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
