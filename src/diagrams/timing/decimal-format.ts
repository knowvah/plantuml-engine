/**
 * The `java.text.DecimalFormat` subset `DeduceFormat#getDecimalFormat` can build (timing-engine-port D5):
 * pattern `[+]?(0|#,##0)(.0*)?`, `Locale.US` symbols with a replaceable decimal and grouping separator,
 * `RoundingMode.HALF_EVEN`, explicit minimum and maximum fraction digits, grouping size 3 when used.
 * Nothing else of `DecimalFormat` (exponents, percent, currency, parsing, other rounding modes) is reached.
 *
 * Digits follow `DigitList#set`: the shortest round-trip digits of the double (JS's, as `Double.toString`'s
 * since JDK 19), rounded half-even where an exact tie on those digits is decided by the double's exact
 * binary value (`DigitList#shouldRoundUp`: `valueExactAsDecimal`, `alreadyRounded`). JDK 21's
 * `FloatingDecimal` digit generator can differ from the shortest digits on rare inputs; not mirrored.
 *
 * @see java.text.DecimalFormat#format(double, StringBuffer, FieldPosition)
 * @see java.text.DigitList#set(boolean, double, int, boolean)
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/timingdiagram/DeduceFormat.java:85-111
 */

/** `DecimalFormat#DOUBLE_FRACTION_DIGITS`: `format(double)` never prints more fraction digits than this. */
const DOUBLE_FRACTION_DIGITS = 340;
const GROUPING_SIZE = 3;
const INFINITY_SYMBOL = '∞';
const NAN_SYMBOL = 'NaN';
const EXPONENT_BIAS = 1075;
const MANTISSA_BITS = 52n;
const MANTISSA_MASK = (1n << MANTISSA_BITS) - 1n;
const HIDDEN_BIT = 1n << MANTISSA_BITS;
const EXPONENT_MASK = 0x7ffn;
const TEN = 10n;

/** What the pattern and the symbols say. `groupingSeparator` is `undefined` when grouping is not used. */
export interface DecimalFormatSpec {
  readonly forceSign: boolean;
  readonly groupingSeparator: string | undefined;
  readonly decimalSeparator: string;
  readonly minimumFractionDigits: number;
  readonly maximumFractionDigits: number;
}

interface Digits {
  /** Significant digits, no leading or trailing zero; empty for zero. */
  readonly digits: string;
  /** Position of the decimal point: value = 0.digits * 10^pt. */
  readonly pt: number;
}

const ZERO: Digits = { digits: '', pt: 0 };

/** The shortest digits of `abs` (> 0, finite) and the decimal point position. */
function shortestDigits(abs: number): Digits {
  const [mantissa, exponent] = abs.toExponential().split('e') as [string, string];
  return { digits: mantissa.replace('.', ''), pt: Number(exponent) + 1 };
}

/** `abs` as `m * 2^e` with integer `m`. */
function exactBinary(abs: number): readonly [bigint, number] {
  const bits = new DataView(new ArrayBuffer(8));
  bits.setFloat64(0, abs);
  const raw = bits.getBigUint64(0);
  const biased = Number((raw >> MANTISSA_BITS) & EXPONENT_MASK);
  const fraction = raw & MANTISSA_MASK;
  return biased === 0 ? [fraction, 1 - EXPONENT_BIAS] : [fraction | HIDDEN_BIT, biased - EXPONENT_BIAS];
}

/**
 * Sign of `exact(abs) - shortest`: positive when the double is above its shortest decimal. Only called when
 * rounding drops digits of a non-integral value, so `e < 0` and `q < 0` (digits past the point, `f >= 0`):
 * compares `m * 10^-q` with `N * 2^-e`, both scaled by `2^-e * 10^-q`.
 */
function compareToShortest(abs: number, shortest: Digits): number {
  const [m, e] = exactBinary(abs);
  const q = shortest.pt - shortest.digits.length;
  const left = m * TEN ** BigInt(-q);
  const right = BigInt(shortest.digits) * (1n << BigInt(-e));
  if (left === right) return 0;
  return left > right ? 1 : -1;
}

/** `DigitList#shouldRoundUp` for `RoundingMode.HALF_EVEN` at index `count`. */
function shouldRoundUp(abs: number, shortest: Digits, count: number): boolean {
  const { digits } = shortest;
  const at = digits.charAt(count);
  if (at > '5') return true;
  if (at < '5') return false;
  if (count < digits.length - 1) return true;
  const cmp = compareToShortest(abs, shortest);
  if (cmp !== 0) return cmp > 0;
  return count > 0 && Number(digits.charAt(count - 1)) % 2 !== 0;
}

/** `kept` plus one in the last place; a carry out of the front adds a digit and moves the point. */
function increment(kept: string, pt: number): Digits {
  if (kept.length === 0) return { digits: '1', pt: pt + 1 };
  const text = (BigInt(kept) + 1n).toString();
  return { digits: stripTrailingZeros(text), pt: text.length > kept.length ? pt + 1 : pt };
}

function stripTrailingZeros(s: string): string {
  return s.replace(/0+$/, '');
}

/** `DigitList#round` to `maxFraction` fractional digits (`set(..., fixedPoint = true)`). */
function roundTo(abs: number, shortest: Digits, maxFraction: number): Digits {
  const count = shortest.pt + maxFraction;
  if (count >= shortest.digits.length) return shortest;
  if (count < 0) return ZERO;
  const kept = shortest.digits.slice(0, count);
  if (shouldRoundUp(abs, shortest, count)) return increment(kept, shortest.pt);
  return { digits: stripTrailingZeros(kept), pt: shortest.pt };
}

/** The integer digits of a rounded value (`0` when there are none). */
function integerPart(d: Digits): string {
  if (d.digits.length === 0 || d.pt <= 0) return '0';
  return d.digits.slice(0, d.pt).padEnd(d.pt, '0');
}

/** The fraction digits of a rounded value, padded to `min` with zeros. */
function fractionPart(d: Digits, min: number): string {
  if (d.digits.length === 0) return '0'.repeat(min);
  const fraction = '0'.repeat(Math.max(0, -d.pt)) + d.digits.slice(Math.max(d.pt, 0));
  return fraction.padEnd(min, '0');
}

/** Insert `separator` every three digits from the right. */
function group(integer: string, separator: string): string {
  const parts: string[] = [];
  for (let end = integer.length; end > 0; end -= GROUPING_SIZE) {
    parts.unshift(integer.slice(Math.max(0, end - GROUPING_SIZE), end));
  }
  return parts.join(separator);
}

export class DecimalFormat {
  readonly #spec: DecimalFormatSpec;

  public constructor(spec: DecimalFormatSpec) {
    this.#spec = spec;
  }

  /**
   * `DecimalFormat#format(double)` (and `format(long)` for the integral values a `number` carries).
   * A negative number, `-0.0` and a negative that rounds to zero all keep the sign; with a `+` pattern the
   * negative prefix is `-+`, since the pattern has no negative subpattern (`DecimalFormat#applyPattern`).
   */
  public format(value: number): string {
    if (Number.isNaN(value)) return NAN_SYMBOL;
    const negative = value < 0 || Object.is(value, -0);
    const prefix = (negative ? '-' : '') + (this.#spec.forceSign ? '+' : '');
    if (!Number.isFinite(value)) return prefix + INFINITY_SYMBOL;
    return prefix + this.#magnitude(Math.abs(value));
  }

  #magnitude(abs: number): string {
    const { minimumFractionDigits: min, maximumFractionDigits: max, decimalSeparator, groupingSeparator } = this.#spec;
    const rounded = abs === 0 ? ZERO : roundTo(abs, shortestDigits(abs), Math.min(max, DOUBLE_FRACTION_DIGITS));
    const integer = integerPart(rounded);
    const fraction = fractionPart(rounded, min);
    const shown = groupingSeparator === undefined ? integer : group(integer, groupingSeparator);
    return fraction.length === 0 ? shown : shown + decimalSeparator + fraction;
  }
}
