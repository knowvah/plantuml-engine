/**
 * The regex fragments and Java text helpers the packet commands share.
 * Regexes are transcribed with Java's classes and compiled `i` without `u`,
 * as `Pattern2` is `CASE_INSENSITIVE` without `UNICODE_CASE` (cep D6): `%s`
 * is Java's ASCII `\s` plus U+00A0 (`Pattern2.java:57`), and `.` excludes
 * Java's five line terminators, one more than JS's. Every packet command is a
 * `SingleLineCommand2` with `doTrim = true` (`SingleLineCommand2.java:56-58`),
 * so the factory matches them against `StringUtils.trin(line)`.
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/regex/Pattern2.java:53-58
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/regex/RegexLeaf.java
 */

/** Java's `\s`. */
export const JAVA_S = String.raw`[ \t\n\x0B\f\r]`;
/** `%s`. @see Pattern2.java:57 */
const SPACE = String.raw`[ \t\n\x0B\f\r\u00A0]`;
/** Java's `.` without DOTALL. */
export const JAVA_DOT = String.raw`[^\n\r\u0085\u2028\u2029]`;

/** `RegexLeaf.spaceZeroOrMore()`. */
export const SP0 = `${SPACE}*`;

/** `Integer.MAX_VALUE` / `MIN_VALUE`, past which `Integer.parseInt` throws. */
const INT_MAX = 2147483647;
const INT_MIN = -2147483648;
/** `Integer.parseInt` over ASCII: optional sign, then digits. */
const JAVA_INT = /^[+-]?\d+$/;

/** `Integer.parseInt(s)`: `undefined` where Java throws `NumberFormatException`. */
export function parseJavaInt(s: string): number | undefined {
  if (!JAVA_INT.test(s)) return undefined;
  const n = Number(s);
  return n < INT_MIN || n > INT_MAX ? undefined : n;
}

/** A `name = value;?` directive: `RegexLeaf.start()`, the name, `%s*=%s*`, the value leaf, `%s*`, `end()`. */
export function directive(name: string, valueGroup: string): RegExp {
  return new RegExp(`^${name}${SP0}=${SP0}${valueGroup};?${SP0}$`, 'i');
}
