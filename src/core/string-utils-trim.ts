/**
 * The trims of `StringUtils`: `isTrimmable`, `trin`, `trim2`. Since upstream 0c54c010cdf both trims treat the
 * non-breaking space U+00A0 as a blank, like `%s` in a command pattern does.
 *
 * Neither is JS `String#trim` (which also removes U+2000-U+200A, U+3000, U+FEFF, ...) nor Java `String#trim`
 * (which keeps U+00A0; ported as `javaTrim` in `java-number-format.ts`). A call site that upstream writes as
 * `.trim()` must not use these.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/StringUtils.java:647-721
 */

/** The highest code unit `c <= ' '` accepts. @see StringUtils.java:655 */
const SPACE_CODE = 0x20;
/** The non-breaking space U+00A0. @see StringUtils.java:655 */
const NBSP_CODE = 0xa0;

function isTrimmableCode(code: number): boolean {
  return code <= SPACE_CODE || code === NBSP_CODE;
}

/**
 * The blanks {@link trin} removes: every control character, the space, and the non-breaking space U+00A0.
 * `c` is one UTF-16 code unit (a Java `char`).
 * @see StringUtils.java:647-656
 */
export function isTrimmable(c: string): boolean {
  return isTrimmableCode(c.charCodeAt(0));
}

/** The `[start, end]` both trims keep, or `start > end` when everything is blank. @see StringUtils.java:665-680 */
function trimBounds(s: string): { start: number; end: number } {
  let start = 0;
  let end = s.length - 1;
  while (start <= end) {
    if (isTrimmableCode(s.charCodeAt(start))) {
      start++;
      continue;
    }
    if (isTrimmableCode(s.charCodeAt(end))) {
      end--;
      continue;
    }
    break;
  }
  return { start, end };
}

/** @see StringUtils.java:658-688 */
export function trin(arg: string): string {
  const len = arg.length;
  if (len === 0) return '';
  const { start, end } = trimBounds(arg);
  if (start === 0 && end === len - 1) return arg;
  if (start > end) return '';
  return arg.substring(start, end + 1);
}

/** `trim2(CharSequence)`; a JS string stands for the `CharSequence`. @see StringUtils.java:690-721 */
export function trim2(s: string): string {
  const len = s.length;
  if (len === 0) return '';
  const { start, end } = trimBounds(s);
  if (start > end) return '';
  if (start === 0 && end === len - 1) return s;
  return s.substring(start, end + 1);
}
