/**
 * `CommandChartItem` — a value of a series written without data, on a line of its
 * own, as a Markdown list item or as in Mermaid (5ee1a051948): `* Jan : 10`,
 * `- Feb : 20`, `"Mar": 30`. A line with `*` or `-` may hold a value alone; one
 * without must hold a key. Registered after every other command, the common ones
 * included, so `title Air: composition` keeps its meaning.
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/chart/command/CommandChartItem.java
 */
import { javaTrim } from '../../../core/java-number-format.js';
import { CommandExecutionResult } from '../../../core/command/CommandExecutionResult.js';
import type { ChartDiagram } from '../ChartDiagram.js';
import { isOpening, parseSingle } from './ChartDataItems.js';
import { SP0, SP1 } from './chart-command-text.js';

/** Java's `.` without DOTALL. */
const JAVA_DOT = String.raw`[^\n\r\u0085  ]`;

/** `[^*\-\s]` with Java's ASCII `\s`. @see CommandChartItem.java:76-86 */
export const CHART_ITEM_RE = new RegExp(
  `^${SP0}(?:[*-]${SP1}(?<BULLETED>${JAVA_DOT}*?)|(?<KEYED>[^*\\- \\t\\n\\x0B\\f\\r]${JAVA_DOT}*:${JAVA_DOT}*?))${SP0}$`,
);

/** @see CommandChartItem.java:94-105 */
export function applyChartItem(diagram: ChartDiagram, match: RegExpExecArray): CommandExecutionResult {
  const g = match.groups!;
  const item = g['BULLETED'] ?? g['KEYED']!;
  const data = parseSingle(item, diagram.getSkinParam().getIHtmlColorSet());
  if ('error' in data) {
    if (startsWithPair(item))
      return CommandExecutionResult.error('A coordinate pair cannot be written as a list item: write [(x, y), ...]');
    return CommandExecutionResult.error(data.error);
  }
  return diagram.addItem(data.item.key, data.item.value, data.item.color);
}

/** @see CommandChartItem.java:107-110 */
function startsWithPair(item: string): boolean {
  const trimmed = javaTrim(item);
  return trimmed !== '' && isOpening(trimmed.charAt(0));
}
