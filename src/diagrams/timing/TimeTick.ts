import type { BigDecimal } from '../../core/decimal/BigDecimal.js';
import type { TimingFormat } from './TimingFormat.js';

/**
 * A point on the time axis: a `BigDecimal` and the format that prints it. Ordered by `compareTo` on the
 * time alone (scale and format ignored). There is no `equals`: upstream compares ticks by identity
 * (`TimingRuler#getLabel`), which `===` mirrors.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/timingdiagram/TimeTick.java:39-65
 */
export class TimeTick {
  readonly #time: BigDecimal;
  readonly #format: TimingFormat;

  public constructor(time: BigDecimal, format: TimingFormat) {
    this.#time = time;
    this.#format = format;
  }

  /** @see TimeTick.java:49 */
  public getTime(): BigDecimal {
    return this.#time;
  }

  /** `Comparable<TimeTick>#compareTo` (TimeTick.java:53-55). */
  public compareTo(other: TimeTick): number {
    return this.#time.compareTo(other.#time);
  }

  /** @see TimeTick.java:57-59 */
  public getFormat(): TimingFormat {
    return this.#format;
  }

  /** `format.formatTime(time)` (TimeTick.java:62-64). */
  public toString(): string {
    return this.#format.formatTime(this.#time);
  }
}
