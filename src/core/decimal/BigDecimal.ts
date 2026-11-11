import { javaDoubleToString } from '../java-number-format.js';

/**
 * The `java.math.BigDecimal` subset the timing engine reaches (timing-engine-port D3).
 * See `README.md` in this directory for the member list and its call sites.
 *
 * Representation as in the JDK: an unscaled integer (`bigint`) and an `int` scale,
 * value = unscaled * 10^-scale. Scale is observable (`toPlainString`, `toString`) and
 * ignored by `compareTo`.
 *
 * @see https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/math/BigDecimal.html
 */

const JAVA_NFE = 'java.lang.NumberFormatException';
const JAVA_AE = 'java.lang.ArithmeticException';
const MAX_INT = 2_147_483_647;
const MAX_LONG = (1n << 63n) - 1n;
const MIN_LONG = -(1n << 63n);
const LONG_BITS = 64;
const TEN = 10n;
const PLAIN_ADJUSTED_MIN = -6;
/** `longValueExact`'s first test: `precision() - scale > 19` digits cannot fit a long (`BigDecimal.java`). */
const LONG_DIGITS = 19;

/** `Character.isDigit` restricted to the ASCII digits the JDK's `BigDecimal(char[])` accepts for ASCII input. */
const DECIMAL_GRAMMAR = /^([+-]?)([0-9]*)(?:\.([0-9]*))?(?:[eE]([+-]?)([0-9]+))?$/;

function pow10(n: number): bigint {
  return TEN ** BigInt(n);
}

/** `new NumberFormatException(msg)`'s `Throwable#toString`, as `ProtectedCommand` prints it (`ProtectedCommand.java:75`). */
function numberFormat(detail: string | null): Error {
  return new Error(detail === null ? JAVA_NFE : `${JAVA_NFE}: ${detail}`);
}

function arithmetic(detail: string): Error {
  return new Error(`${JAVA_AE}: ${detail}`);
}

/**
 * Diagnose why `s` is not in `BigDecimal(char[])`'s grammar, with the JDK 21 message
 * (`BigDecimal.java` constructor `BigDecimal(char[], int, int, MathContext)`).
 */
function diagnose(s: string): Error {
  if (s.length === 0) return numberFormat(null);
  const body = s.replace(/^[+-]/, '');
  let sawPoint = false;
  let sawDigit = false;
  for (let i = 0; i < body.length; i++) {
    const c = body.charAt(i);
    if (c >= '0' && c <= '9') {
      sawDigit = true;
      continue;
    }
    if (c === '.') {
      if (sawPoint) return numberFormat('Character array contains more than one decimal point.');
      sawPoint = true;
    } else if (c === 'e' || c === 'E') {
      return sawDigit ? diagnoseExponent(body.slice(i + 1)) : numberFormat('No digits found.');
    } else {
      return numberFormat(
        `Character ${c} is neither a decimal digit number, decimal point, nor "e" notation exponential mark.`,
      );
    }
  }
  return numberFormat('No digits found.');
}

/** The text after an `e` in {@link diagnose}: `BigDecimal.java#parseExp` messages (none for a missing digit). */
function diagnoseExponent(rest: string): Error {
  const digits = rest.replace(/^[+-]/, '');
  if (digits.length === 0) return numberFormat(null);
  return numberFormat(/^[0-9]+$/.test(digits) ? 'Too many nonzero exponent digits.' : 'Not a digit.');
}

interface Parts {
  readonly unscaled: bigint;
  readonly scale: number;
}

/** The exponent of a matched `[eE][+-]?digits`, or 0; `BigDecimal(char[])` rejects one outside the int range. */
function parseExponent(sign: string | undefined, digits: string | undefined): number {
  if (digits === undefined) return 0;
  const exponent = Number((sign === '-' ? '-' : '') + digits);
  if (!Number.isSafeInteger(exponent) || Math.abs(exponent) > MAX_INT) {
    throw numberFormat('Too many nonzero exponent digits.');
  }
  return exponent;
}

/** `BigDecimal(String)`'s grammar: `[+-]? digits [. digits]? ([eE] [+-]? digits)?` with at least one mantissa digit. */
function parseDecimal(s: string): Parts {
  const m = DECIMAL_GRAMMAR.exec(s);
  const whole = m?.[2] ?? '';
  const fraction = m?.[3] ?? '';
  if (m === null || whole.length + fraction.length === 0) throw diagnose(s);
  const digits = BigInt(whole + fraction);
  const scale = fraction.length - parseExponent(m[4], m[5]);
  if (scale > MAX_INT || scale < -MAX_INT - 1) throw numberFormat(null);
  return { unscaled: m[1] === '-' ? -digits : digits, scale };
}

export class BigDecimal {
  /** `BigDecimal.ZERO`. */
  public static readonly ZERO: BigDecimal = new BigDecimal('0');

  readonly #unscaled: bigint;
  readonly #scale: number;

  /**
   * `new BigDecimal(String)`: optional sign, digits with an optional point (`.5`, `5.`), optional exponent.
   * Throws an `Error` whose message starts `java.lang.NumberFormatException` otherwise.
   *
   * @see java.math.BigDecimal#BigDecimal(String)
   */
  public constructor(s: string) {
    const parsed = parseDecimal(s);
    this.#unscaled = parsed.unscaled;
    this.#scale = parsed.scale;
  }

  /**
   * `BigDecimal.valueOf(long)` (also `new BigDecimal(long)` / `new BigDecimal(int)`): scale 0.
   * `n` must be an integer in the safe range (a JS `number` stands for the Java `long`).
   *
   * @see java.math.BigDecimal#valueOf(long)
   */
  public static valueOf(n: number): BigDecimal {
    if (!Number.isSafeInteger(n)) throw new RangeError(`BigDecimal.valueOf(long): ${n} is not a safe integer`);
    return BigDecimal.#of(BigInt(n), 0);
  }

  /**
   * `BigDecimal.valueOf(double)` = `new BigDecimal(Double.toString(d))`.
   *
   * @see java.math.BigDecimal#valueOf(double)
   */
  public static valueOfDouble(d: number): BigDecimal {
    if (!Number.isFinite(d)) throw numberFormat('Infinite or NaN');
    return new BigDecimal(javaDoubleToString(d));
  }

  /** Build from parts through the string grammar, so the scale range check is the constructor's. */
  static #of(unscaled: bigint, scale: number): BigDecimal {
    return new BigDecimal(`${unscaled}E${-scale}`);
  }

  /** `BigDecimal#add(BigDecimal)`: result scale is `max(this.scale, o.scale)`. */
  public add(o: BigDecimal): BigDecimal {
    const scale = Math.max(this.#scale, o.#scale);
    return BigDecimal.#of(this.#rescaled(scale) + o.#rescaled(scale), scale);
  }

  /** `BigDecimal#multiply(BigDecimal)`: result scale is the sum of the scales. */
  public multiply(o: BigDecimal): BigDecimal {
    return BigDecimal.#of(this.#unscaled * o.#unscaled, this.#scale + o.#scale);
  }

  /** `BigDecimal#compareTo(BigDecimal)`: numeric, ignoring scale (`1` and `1.0` compare 0). */
  public compareTo(o: BigDecimal): number {
    const scale = Math.max(this.#scale, o.#scale);
    const a = this.#rescaled(scale);
    const b = o.#rescaled(scale);
    if (a === b) return 0;
    return a < b ? -1 : 1;
  }

  /** `BigDecimal#signum()`. */
  public signum(): -1 | 0 | 1 {
    if (this.#unscaled === 0n) return 0;
    return this.#unscaled < 0n ? -1 : 1;
  }

  /** `BigDecimal#doubleValue()`: the correctly rounded double. */
  public doubleValue(): number {
    return Number(`${this.#unscaled}e${-this.#scale}`);
  }

  /**
   * `BigDecimal#longValue()`: truncates toward zero, keeping the low 64 bits as Java's narrowing does.
   * The result is a JS `number`, exact up to 2^53.
   */
  public longValue(): number {
    return Number(BigInt.asIntN(LONG_BITS, this.#truncated()));
  }

  /**
   * `BigDecimal#longValueExact()`: throws `java.lang.ArithmeticException` ("Rounding necessary" on a
   * fraction, "Overflow" outside the long range).
   */
  public longValueExact(): number {
    if (this.#unscaled === 0n) return 0;
    if (this.#precision() - this.#scale > LONG_DIGITS) throw arithmetic('Overflow');
    if (this.#scale > 0 && this.#unscaled % pow10(this.#scale) !== 0n) throw arithmetic('Rounding necessary');
    const value = this.#truncated();
    if (value > MAX_LONG || value < MIN_LONG) throw arithmetic('Overflow');
    return Number(value);
  }

  /** `BigDecimal#toPlainString()`: never an exponent; keeps the scale (`2.50`). */
  public toPlainString(): string {
    if (this.#scale === 0) return this.#unscaled.toString();
    if (this.#scale < 0) {
      return this.signum() === 0 ? '0' : this.#unscaled.toString() + '0'.repeat(-this.#scale);
    }
    return this.#plainWithPoint();
  }

  /**
   * `BigDecimal#toString()` (`layoutChars(true)`): plain when `scale >= 0` and the adjusted exponent is
   * at least -6, otherwise computerized scientific notation (`1E+3`, `1.5E-7`).
   */
  public toString(): string {
    if (this.#scale === 0) return this.#unscaled.toString();
    const negative = this.#unscaled < 0n;
    const coeff = (negative ? -this.#unscaled : this.#unscaled).toString();
    const adjusted = -this.#scale + (coeff.length - 1);
    const sign = negative ? '-' : '';
    if (this.#scale >= 0 && adjusted >= PLAIN_ADJUSTED_MIN) return sign + BigDecimal.#plain(coeff, this.#scale);
    let out = sign + coeff.charAt(0);
    if (coeff.length > 1) out += '.' + coeff.slice(1);
    if (adjusted !== 0) out += 'E' + (adjusted > 0 ? '+' : '') + adjusted;
    return out;
  }

  /** `BigDecimal#precision()`: the number of digits of the unscaled value. */
  #precision(): number {
    return (this.#unscaled < 0n ? -this.#unscaled : this.#unscaled).toString().length;
  }

  #rescaled(scale: number): bigint {
    return this.#unscaled * pow10(scale - this.#scale);
  }

  #truncated(): bigint {
    if (this.#scale <= 0) return this.#unscaled * pow10(-this.#scale);
    return this.#unscaled / pow10(this.#scale);
  }

  #plainWithPoint(): string {
    const negative = this.#unscaled < 0n;
    const coeff = (negative ? -this.#unscaled : this.#unscaled).toString();
    return (negative ? '-' : '') + BigDecimal.#plain(coeff, this.#scale);
  }

  /** Insert the decimal point `scale` digits from the right of `coeff` (`BigDecimal.java#layoutChars`). */
  static #plain(coeff: string, scale: number): string {
    const pad = scale - coeff.length;
    if (pad >= 0) return '0.' + '0'.repeat(pad) + coeff;
    return coeff.slice(0, -pad) + '.' + coeff.slice(-pad);
  }
}
