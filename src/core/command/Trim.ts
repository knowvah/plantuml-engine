/**
 * `Trim`: how a multi-line command trims the last line before matching its end pattern. `LEFT_ONLY` removes the
 * leading `\s+`, `NONE` leaves the text, `BOTH` is `StringLocated#getTrimmed`.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/command/Trim.java:41-62
 */
import type { StringLocated } from '../tim/StringLocated.js';

export const Trim = {
  BOTH: 'BOTH',
  LEFT_ONLY: 'LEFT_ONLY',
  NONE: 'NONE',
} as const;
export type Trim = (typeof Trim)[keyof typeof Trim];

/** `Trim.LTRIM`: `^\s+`, Java's `\s` (ASCII whitespace). @see Trim.java:60 */
const LTRIM = /^[ \t\n\x0B\f\r]+/;

/** `Trim#trim(StringLocated)`. @see Trim.java:47-55 */
export function trimWith(trim: Trim, s: StringLocated): string {
  if (trim === Trim.NONE) return s.getString();
  if (trim === Trim.BOTH) return s.getTrimmed().getString();
  return s.getString().replace(LTRIM, '');
}
