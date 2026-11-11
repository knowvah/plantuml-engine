import { DecimalFormat } from './decimal-format.js';

/**
 * What an analog player's bounds look like as typed (`1,234.50`, `+42,00`): sign, separators and fraction
 * digits, deduced from a number's text so labels print the way the user wrote the bounds.
 * `'\0'` stands for "none" exactly as in the Java.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/timingdiagram/DeduceFormat.java
 */

const NONE = '\0';
/** `Character.isDigit(char)`: Unicode category Nd for a single UTF-16 unit. */
const DIGIT = /^\p{Nd}$/u;

class CharCount {
  public ch = NONE;
  public count = 0;

  /** @see DeduceFormat.java CharCount#init */
  public init(newOne: string): void {
    this.ch = newOne;
    this.count = 1;
  }
}

export class DeduceFormat {
  readonly #forceSign: boolean;
  readonly #groupingSep: string;
  readonly #decimalSep: string;
  readonly #minFractionDigits: number;
  readonly #maxFractionDigits: number;

  private constructor(
    forceSign: boolean,
    groupingSep: string,
    decimalSep: string,
    minFractionDigits: number,
    maxFractionDigits: number,
  ) {
    this.#forceSign = forceSign;
    this.#groupingSep = groupingSep;
    this.#decimalSep = decimalSep;
    this.#minFractionDigits = minFractionDigits;
    this.#maxFractionDigits = maxFractionDigits;
  }

  /** @see DeduceFormat.java:57-83 (`mergeWith`; `other == null` returns `this`) */
  public mergeWith(other: DeduceFormat | undefined): DeduceFormat {
    if (other === undefined) return this;
    const decimal = this.#decimalSep !== NONE ? this.#decimalSep : other.#decimalSep;
    let grouping = mergeGrouping(this.#groupingSep, other.#groupingSep);
    if (grouping !== NONE && decimal !== NONE && grouping === decimal) grouping = NONE;
    return new DeduceFormat(
      this.#forceSign || other.#forceSign,
      grouping,
      decimal,
      Math.min(this.#minFractionDigits, other.#minFractionDigits),
      Math.max(this.#maxFractionDigits, other.#maxFractionDigits),
    );
  }

  /**
   * The `DecimalFormat` of pattern `[+]?(#,##0|0)(.0*)?` (java:85-111), with the deduced separators and
   * the deduced minimum and maximum fraction digits.
   */
  public getDecimalFormat(): DecimalFormat {
    return new DecimalFormat({
      forceSign: this.#forceSign,
      groupingSeparator: this.#groupingSep === NONE ? undefined : this.#groupingSep,
      decimalSeparator: this.#decimalSep === NONE ? '.' : this.#decimalSep,
      minimumFractionDigits: this.#minFractionDigits,
      maximumFractionDigits: this.#maxFractionDigits,
    });
  }

  /**
   * Scan `number`: an optional sign, then digits and at most two distinct non-digit characters (grouping
   * and decimal separators). `undefined` (Java `null`) for a third distinct non-digit (java:113-165).
   * An empty string throws like `String#charAt(0)`.
   */
  public static from(number: string): DeduceFormat | undefined {
    if (number.length === 0) {
      throw new Error('java.lang.StringIndexOutOfBoundsException: Index 0 out of bounds for length 0');
    }
    const sign = number.startsWith('+') || number.startsWith('-') ? number.charAt(0) : NONE;
    const body = sign === NONE ? number : number.slice(1);
    const scan = scanSeparators(body);
    if (scan === undefined) return undefined;
    const { first, second, fractionDigits } = scan;
    if (first.count > 0 && second.count > 0) {
      return new DeduceFormat(sign === '+', first.ch, second.ch, fractionDigits, fractionDigits);
    }
    return new DeduceFormat(sign === '+', NONE, first.ch, fractionDigits, fractionDigits);
  }

  /** @see DeduceFormat.java toString (two shapes: equal or distinct fraction bounds) */
  public toString(): string {
    const head = `DeduceFormat{forceSign=${this.#forceSign}, groupingSep=${quoted(this.#groupingSep)}, decimalSep=${quoted(this.#decimalSep)}, `;
    if (this.#minFractionDigits === this.#maxFractionDigits) {
      return `${head}fractionDigits=${this.#minFractionDigits}}`;
    }
    return `${head}minFractionDigits=${this.#minFractionDigits}, maxFractionDigits=${this.#maxFractionDigits}}`;
  }
}

function quoted(ch: string): string {
  return ch === NONE ? 'none' : `'${ch}'`;
}

/** The grouping-separator merge of `mergeWith` (java:63-70). */
function mergeGrouping(a: string, b: string): string {
  if (a === NONE) return b;
  if (b === NONE) return a;
  return a === b ? a : NONE;
}

interface Scan {
  readonly first: CharCount;
  readonly second: CharCount;
  readonly fractionDigits: number;
}

/** The loop of `from` (java:122-146): which non-digits occur, and the digits after the last separator seen first. */
function scanSeparators(number: string): Scan | undefined {
  const first = new CharCount();
  const second = new CharCount();
  let fractionDigits = 0;
  for (let i = 0; i < number.length; i++) {
    const ch = number.charAt(i);
    if (DIGIT.test(ch)) {
      if (first.count > 0) fractionDigits++;
    } else if (first.count === 0) {
      first.init(ch);
      fractionDigits = 0;
    } else if (first.ch === ch) {
      first.count++;
    } else if (second.count === 0) {
      second.init(ch);
      fractionDigits = 0;
    } else if (second.ch === ch) {
      second.count++;
    } else {
      return undefined;
    }
  }
  return { first, second, fractionDigits };
}
