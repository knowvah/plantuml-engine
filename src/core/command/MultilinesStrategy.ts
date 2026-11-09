/**
 * `MultilinesStrategy`: what `BlocLines#cleanList` does to the lines of a multi-line command before it is
 * matched or run. `REMOVE_STARTING_QUOTE` drops every line whose trimmed text starts with `'` (a PlantUML comment
 * inside the block); `KEEP_STARTING_QUOTE` keeps all of them. As-const object, per project convention.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/command/MultilinesStrategy.java:43-64
 */
import type { StringLocated } from '../tim/StringLocated.js';

export const MultilinesStrategy = {
  REMOVE_STARTING_QUOTE: 'REMOVE_STARTING_QUOTE',
  KEEP_STARTING_QUOTE: 'KEEP_STARTING_QUOTE',
} as const;
export type MultilinesStrategy = (typeof MultilinesStrategy)[keyof typeof MultilinesStrategy];

/** `hasStartingQuote`. @see MultilinesStrategy.java:61-63 */
function hasStartingQuote(s: StringLocated): boolean {
  return s.getTrimmed().getString().startsWith("'");
}

/** `MultilinesStrategy#cleanList`, on a copy. @see MultilinesStrategy.java:45-59 */
export function cleanList(strategy: MultilinesStrategy, lines: readonly StringLocated[]): StringLocated[] {
  if (strategy === MultilinesStrategy.REMOVE_STARTING_QUOTE) return lines.filter((s) => !hasStartingQuote(s));
  return [...lines];
}
