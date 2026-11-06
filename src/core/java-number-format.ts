/**
 * Java's number text: `String.format("%.Nf" | "%.Ne" | "%d")` (Locale.US) and
 * `Double.parseDouble`'s grammar. `Number.prototype.toFixed` and `toExponential`
 * round the exact binary value and print `1.00e-3`; Java rounds the shortest
 * decimal HALF_UP (`FormattedFloatingDecimal`) and prints `1.00e-03`. `Number`
 * accepts `''`, `0x10` and blanks, and refuses `1d`, `0x1p3`.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/chart/ChartRenderer.java:933-939
 */
import { javaFixedN } from './svg-format.js';

/** `Long.MAX_VALUE`, the saturated `(long)` of a large double. */
const LONG_MAX = 9223372036854775807n;
/** `Long.MIN_VALUE`, the saturated `(long)` of a large negative double. */
const LONG_MIN = -9223372036854775808n;
/** `2^63`, the first double past `Long.MAX_VALUE`. */
const TWO_63 = 2 ** 63;
/** `String#trim`'s upper bound: U+0020. */
const TRIM_MAX_CODE = 0x20;
/** `%e`'s minimum exponent width (`Formatter`: "at least two digits"). */
const EXPONENT_MIN_DIGITS = 2;
/** The shift a hex digit carries in a hex float's fraction. */
const BITS_PER_HEX_DIGIT = 4;
/** First rounded digit at or above this is HALF_UP. */
const ROUND_UP_DIGIT = 5;
const CHAR_CODE_ZERO = 48;
/** `Double#toString` prints plain decimals from here. */
const PLAIN_DOUBLE_MIN = 1e-3;
/** ...and up to here. */
const PLAIN_DOUBLE_MAX = 1e7;

/** `FloatingPointLiteral` minus the hex form. @see java.lang.Double#valueOf(String) */
const DECIMAL_FLOAT = /^[+-]?(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?[fFdD]?$/;
/** `HexFloatingPointLiteral`: the `p` exponent is required. @see java.lang.Double#valueOf(String) */
const HEX_FLOAT = /^([+-]?)0[xX](?:([0-9a-fA-F]+)\.?([0-9a-fA-F]*)|\.([0-9a-fA-F]+))[pP]([+-]?\d+)[fFdD]?$/;
/** Exactly these spellings, case-sensitive, with no type suffix. */
const NAMED_FLOAT = /^([+-]?)(NaN|Infinity)$/;

/** `String#trim`: strips code points up to U+0020 only, unlike JS `trim`. */
export function javaTrim(s: string): string {
  let start = 0;
  let end = s.length;
  while (start < end && s.charCodeAt(start) <= TRIM_MAX_CODE) start++;
  while (end > start && s.charCodeAt(end - 1) <= TRIM_MAX_CODE) end--;
  return s.slice(start, end);
}

/** The non-finite spellings both `%f` and `%e` print. Undefined for a finite value. */
function nonFiniteText(value: number): string | undefined {
  if (Number.isNaN(value)) return 'NaN';
  if (value === Number.POSITIVE_INFINITY) return 'Infinity';
  if (value === Number.NEGATIVE_INFINITY) return '-Infinity';
  return undefined;
}

/** `String.format("%.<decimals>f", value)`. */
export function javaFormatF(value: number, decimals: number): string {
  const nonFinite = nonFiniteText(value);
  if (nonFinite !== undefined) return nonFinite;
  if (Object.is(value, -0)) return `-${javaFixedN(0, decimals)}`;
  return javaFixedN(value, decimals);
}

/** `String.format("%.<decimals>e", value)`: HALF_UP on the shortest decimal, exponent of at least two digits. */
export function javaFormatE(value: number, decimals: number): string {
  const nonFinite = nonFiniteText(value);
  if (nonFinite !== undefined) return nonFinite;
  const sign = value < 0 || Object.is(value, -0) ? '-' : '';
  const [mantissa, exponentText] = Math.abs(value).toExponential().split('e') as [string, string];
  const padded = mantissa.replace('.', '') + '0'.repeat(decimals + 1);
  let kept = padded.slice(0, decimals + 1);
  let exponent = Number(exponentText);
  if (padded.charCodeAt(decimals + 1) - CHAR_CODE_ZERO >= ROUND_UP_DIGIT) {
    const rounded = (BigInt(kept) + 1n).toString();
    if (rounded.length > kept.length) exponent++;
    kept = rounded.slice(0, decimals + 1);
  }
  const fraction = decimals === 0 ? '' : `.${kept.slice(1)}`;
  const exponentDigits = String(Math.abs(exponent)).padStart(EXPONENT_MIN_DIGITS, '0');
  return `${sign}${kept.charAt(0)}${fraction}e${exponent < 0 ? '-' : '+'}${exponentDigits}`;
}

/** Java's `(long) value`: truncating, saturating, and 0 for NaN. */
function toLong(value: number): bigint {
  if (Number.isNaN(value)) return 0n;
  if (value >= TWO_63) return LONG_MAX;
  if (value <= -TWO_63) return LONG_MIN;
  return BigInt(Math.trunc(value));
}

/** `String.format("%d", (long) value)`. */
export function javaFormatLong(value: number): string {
  return toLong(value).toString();
}

/** `value == (long) value`, the long widened back to a double. */
export function isLongValued(value: number): boolean {
  return value === Number(toLong(value));
}

/**
 * `Double.toString`: at least one fraction digit, computerized scientific
 * notation outside `[1e-3, 1e7)`. The digits are the shortest round trip, as JS's are.
 */
export function javaDoubleToString(value: number): string {
  const nonFinite = nonFiniteText(value);
  if (nonFinite !== undefined) return nonFinite;
  if (Object.is(value, -0)) return '-0.0';
  const magnitude = Math.abs(value);
  const sign = value < 0 ? '-' : '';
  if (magnitude === 0 || (magnitude >= PLAIN_DOUBLE_MIN && magnitude < PLAIN_DOUBLE_MAX)) {
    const plain = magnitude.toString();
    return `${sign}${plain}${plain.includes('.') ? '' : '.0'}`;
  }
  const [mantissa, exponent] = magnitude.toExponential().split('e') as [string, string];
  return `${sign}${mantissa}${mantissa.includes('.') ? '' : '.0'}E${exponent.replace('+', '')}`;
}

/** A matched `HEX_FLOAT`: mantissa digits scaled by the binary exponent. */
function hexFloatValue(match: RegExpExecArray): number {
  const whole = match[2] ?? '';
  const fraction = match[3] ?? match[4] ?? '';
  const mantissa = Number(BigInt(`0x${whole}${fraction}`));
  const magnitude = mantissa * 2 ** (Number(match[5]) - BITS_PER_HEX_DIGIT * fraction.length);
  return match[1] === '-' ? -magnitude : magnitude;
}

/**
 * `Double.parseDouble`, with `undefined` where Java throws
 * `NumberFormatException`. Java trims first (`FloatingDecimal#readJavaFormatString`).
 */
export function parseDouble(text: string): number | undefined {
  const s = javaTrim(text);
  const named = NAMED_FLOAT.exec(s);
  if (named !== null) {
    if (named[2] === 'NaN') return Number.NaN;
    return named[1] === '-' ? Number.NEGATIVE_INFINITY : Number.POSITIVE_INFINITY;
  }
  if (DECIMAL_FLOAT.test(s)) return Number(s.replace(/[fFdD]$/, ''));
  const hex = HEX_FLOAT.exec(s);
  return hex === null ? undefined : hexFloatValue(hex);
}
