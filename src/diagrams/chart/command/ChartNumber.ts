/**
 * ChartNumber — reads the numbers written in a chart. `Double.parseDouble` alone
 * accepts `NaN`, `Infinity` and `-Infinity`, and reads a literal too large for a
 * double (`1e999`) as Infinity, all without throwing; such a value has no place
 * on an axis (fitting a range to it never ended, plantuml/plantuml#3030), so it is
 * rejected here as any other invalid number, and the caller reports its usual
 * message (3a4d96cb3).
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/chart/command/ChartNumber.java
 */
import { parseDouble } from '../../../core/java-number-format.js';

/**
 * The finite value of `text`; `undefined` where Java throws `NumberFormatException`
 * (not a number, or not a finite one), which every caller catches.
 * @see ChartNumber.java:57-62
 */
export function parse(text: string): number | undefined {
  const value = parseDouble(text);
  if (value === undefined) return undefined;
  if (Number.isNaN(value) || value === Number.POSITIVE_INFINITY || value === Number.NEGATIVE_INFINITY) return undefined;
  return value;
}
