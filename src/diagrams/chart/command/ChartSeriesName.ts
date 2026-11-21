/**
 * ChartSeriesName — a series' optional name, shown in the legend: quoted, and
 * then may hold spaces (`"Revenue 2024"`), or one word of letters, digits, `_`,
 * `.` and `-` (`Revenue_2024`), separated from the keyword by a blank (31d6742f27f,
 * #2632). An unquoted name is never one of the given keywords: `line labels` is a
 * line with labels, written without data. `\p{L}` makes the series regexes `iu`.
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/chart/command/ChartSeriesName.java
 */
import { SP1 } from './chart-command-text.js';

/** @see ChartSeriesName.java:66-74 */
export function seriesNameRegex(...keywords: readonly string[]): string {
  const exclude = keywords.length === 0 ? '' : `(?!(?:${keywords.join('|')})(?![\\p{L}0-9_.\\-]))`;
  return `(?:"(?<NAME>[^"]+)"|${SP1}${exclude}(?<NAMEWORD>[\\p{L}0-9_][\\p{L}0-9_.\\-]*))`;
}

/** The quoted name, else the word. @see ChartSeriesName.java:76-79 */
export function seriesNameOf(groups: Readonly<Record<string, string | undefined>>): string | undefined {
  return groups['NAME'] ?? groups['NAMEWORD'];
}
