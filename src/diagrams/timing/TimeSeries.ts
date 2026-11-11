import { javaDoubleToString, javaTrim, parseDouble } from '../../core/java-number-format.js';
import type { DecimalFormat } from './decimal-format.js';
import { DeduceFormat } from './DeduceFormat.js';
import type { TimeTick } from './TimeTick.js';

/** One `Map.Entry<TimeTick, Double>`. */
export interface TimeSeriesEntry {
  readonly key: TimeTick;
  value: number;
}

const DEFAULT_MAX = 10;

/** `Double.parseDouble`'s `NumberFormatException` messages (`FloatingDecimal#readJavaFormatString`). */
function parseDoubleOrThrow(text: string): number {
  const value = parseDouble(text);
  if (value !== undefined) return value;
  const trimmed = javaTrim(text);
  const detail = trimmed.length === 0 ? 'empty String' : `For input string: "${trimmed}"`;
  throw new Error(`java.lang.NumberFormatException: ${detail}`);
}

/**
 * The values of an analog player over ticks. Java's `TreeMap<TimeTick, Double>` is a sorted array searched
 * on `compareTo` (D6): `put` at an equal tick keeps the first key and takes the new value, so `1` and
 * `1.0` are one entry.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/timingdiagram/TimeSeries.java:41-139
 */
export class TimeSeries {
  readonly #entries: TimeSeriesEntry[] = [];
  #minOverride: number | undefined;
  #maxOverride: number | undefined;
  #format: DecimalFormat | undefined;

  /** `values.values()`, in key order. */
  public values(): number[] {
    return this.#entries.map((e) => e.value);
  }

  /** `values.get(tick)`: `undefined` for Java's `null`. */
  public get(tick: TimeTick): number | undefined {
    const at = this.#search(tick);
    return at.found ? this.#entries[at.index]?.value : undefined;
  }

  /** `values.entrySet()`, in key order. */
  public entrySet(): readonly TimeSeriesEntry[] {
    return this.#entries;
  }

  /** `values.put(now, value)`. */
  public put(now: TimeTick, value: number): void {
    const at = this.#search(now);
    if (at.found) {
      (this.#entries[at.index] as TimeSeriesEntry).value = value;
    } else {
      this.#entries.splice(at.index, 0, { key: now, value });
    }
  }

  /** Binary search on `compareTo`: the index of an equal key, or where one would be inserted. */
  #search(tick: TimeTick): { found: boolean; index: number } {
    let lo = 0;
    let hi = this.#entries.length - 1;
    while (lo <= hi) {
      const mid = (lo + hi) >>> 1;
      const c = (this.#entries[mid] as TimeSeriesEntry).key.compareTo(tick);
      if (c === 0) return { found: true, index: mid };
      if (c < 0) lo = mid + 1;
      else hi = mid - 1;
    }
    return { found: false, index: lo };
  }

  /** java:64-75 */
  public getMin(): number {
    if (this.#minOverride !== undefined) return this.#minOverride;
    let min = 0;
    for (const val of this.values()) min = Math.min(min, val);
    return min;
  }

  /** java:77-92: an all-zero (or empty) series is 10 high. */
  public getMax(): number {
    if (this.#maxOverride !== undefined) return this.#maxOverride;
    let max = 0;
    for (const val of this.values()) max = Math.max(max, val);
    return max === 0 ? DEFAULT_MAX : max;
  }

  /**
   * java:94-103. The bounds are parsed in order (`min` is kept even if `max` then throws); a bound whose
   * text `DeduceFormat.from` rejects makes `format1.mergeWith` a `NullPointerException` when it is `min`.
   */
  public setBounds(min: string, max: string): void {
    this.#minOverride = parseDoubleOrThrow(min);
    this.#maxOverride = parseDoubleOrThrow(max);
    const format1 = DeduceFormat.from(min);
    const format2 = DeduceFormat.from(max);
    if (format1 === undefined) throw new Error('java.lang.NullPointerException');
    this.#format = format1.mergeWith(format2).getDecimalFormat();
  }

  /** java:105-110: the deduced format, else `"" + value` (`Double.toString`). */
  public getDisplayValue(value: number): string {
    return this.#format === undefined ? javaDoubleToString(value) : this.#format.format(value);
  }

  /**
   * java:112-133: the stored value, else the linear interpolation between the neighbours (the first or the
   * last value outside the range). An empty series throws `NullPointerException` (`last.getValue()`).
   */
  public getValueAt(tick: TimeTick): number {
    const result = this.get(tick);
    if (result !== undefined) return result;
    let last: TimeSeriesEntry | undefined;
    for (const ent of this.#entries) {
      if (ent.key.compareTo(tick) > 0) return interpolate(last, ent, tick);
      last = ent;
    }
    if (last === undefined) throw new Error('java.lang.NullPointerException');
    return last.value;
  }
}

/** The branch of `getValueAt` at the first entry after `tick` (java:120-130). */
function interpolate(last: TimeSeriesEntry | undefined, next: TimeSeriesEntry, tick: TimeTick): number {
  const v2 = next.value;
  if (last === undefined) return v2;
  const t2 = next.key.getTime().doubleValue();
  const v1 = last.value;
  const t1 = last.key.getTime().doubleValue();
  const p = (tick.getTime().doubleValue() - t1) / (t2 - t1);
  return v1 + (v2 - v1) * p;
}
