import { BigDecimal } from '../../core/decimal/BigDecimal.js';
import { formatDate } from '../../core/tim/builtin/date-format.js';
import { epochSecondsOfLenientDate, monthDayOfEpochSeconds } from '../../core/time/GregorianCalendarGmt.js';
import { TimeTick } from './TimeTick.js';

/**
 * What `new SimpleDateFormat(pattern, Locale.US)` carries for timing: the pattern, and the zone it formats
 * in. The JDK formats in the JVM default zone; the port injects it (`Clock.zone`, timing-engine-port D4).
 * Validate `pattern` with `checkSimpleDateFormatPattern` first.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/timingdiagram/TimingDiagram.java:409-415
 */
export interface SimpleDateFormatSpec {
  readonly pattern: string;
  readonly zone: string;
}

const MILLIS_PER_SECOND = 1000;
const SECONDS_PER_HOUR = 3600;
const SECONDS_PER_MINUTE = 60;

/** `%02d` of a Java int: zero-padded to width 2 counting the sign. */
function pad2(n: number): string {
  return n < 0 ? String(n) : String(n).padStart(2, '0');
}

/** Java `(int) x`: the low 32 bits. */
function toInt(x: number): number {
  return x | 0;
}

/**
 * The three built-in formats and the user's `use date format` one. `DECIMAL`, `HOUR` and `DATE` are distinct
 * singletons because upstream compares them by identity (`TimingFormat.java:46-48,62,68,79`).
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/timingdiagram/TimingFormat.java:44-102
 */
export class TimingFormat {
  public static readonly DECIMAL: TimingFormat = new TimingFormat(undefined);
  public static readonly HOUR: TimingFormat = new TimingFormat(undefined);
  public static readonly DATE: TimingFormat = new TimingFormat(undefined);

  readonly #sdf: SimpleDateFormatSpec | undefined;

  private constructor(sdf: SimpleDateFormatSpec | undefined) {
    this.#sdf = sdf;
  }

  /** `TimingFormat.create(SimpleDateFormat)` (java:56-58): a fresh, non-singleton format. */
  public static create(sdf: SimpleDateFormatSpec): TimingFormat {
    return new TimingFormat(sdf);
  }

  /**
   * Both `formatTime` overloads. A `BigDecimal` of an HOUR, DATE or sdf format goes through
   * `longValueExact()` (java:61-66: throws `ArithmeticException` on a fraction); otherwise
   * `toPlainString()`. A `number` stands for the `long` overload (java:68-93).
   */
  public formatTime(time: BigDecimal | number): string {
    if (typeof time === 'number') return this.#formatSeconds(time);
    if (this === TimingFormat.HOUR || this === TimingFormat.DATE || this.#sdf !== undefined) {
      return this.#formatSeconds(time.longValueExact());
    }
    return time.toPlainString();
  }

  #formatSeconds(time: number): string {
    if (this.#sdf !== undefined) return formatDate(time * MILLIS_PER_SECOND, this.#sdf.pattern, this.#sdf.zone);
    if (this === TimingFormat.HOUR) return formatHour(time);
    if (this === TimingFormat.DATE) return monthDayOfEpochSeconds(time);
    return `${time}`;
  }

  /**
   * `gc.setTimeInMillis(0); gc.set(yyyy, mm - 1, dd)` in a lenient GMT `GregorianCalendar`, as a tick of
   * `format` (java:95-102). Julian before 1582-10-15.
   */
  public static createDate(yyyy: number, mm: number, dd: number, format: TimingFormat): TimeTick {
    return new TimeTick(BigDecimal.valueOf(epochSecondsOfLenientDate(yyyy, mm - 1, dd)), format);
  }
}

/**
 * `String.format("%d:%02d:%02d", h, m, s)`; the `int` casts come before the `%` and `/` as written
 * (java:72-77: `(int) time % 60` casts first).
 */
function formatHour(time: number): string {
  const s = toInt(time) % SECONDS_PER_MINUTE;
  const m = toInt(Math.trunc(time / SECONDS_PER_MINUTE)) % SECONDS_PER_MINUTE;
  const h = toInt(Math.trunc(time / SECONDS_PER_HOUR));
  return `${h}:${pad2(m)}:${pad2(s)}`;
}
