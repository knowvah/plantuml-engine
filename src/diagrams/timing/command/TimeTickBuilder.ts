import { BigDecimal } from '../../../core/decimal/BigDecimal.js';
import type { IRegex } from '../../../core/regex/IRegex.js';
import { RegexConcat } from '../../../core/regex/RegexConcat.js';
import { RegexLeaf } from '../../../core/regex/RegexLeaf.js';
import { RegexOptional } from '../../../core/regex/RegexOptional.js';
import { RegexOr } from '../../../core/regex/RegexOr.js';
import type { RegexResult } from '../../../core/regex/RegexResult.js';
import type { Clocks } from '../Clocks.js';
import { TimeTick } from '../TimeTick.js';
import { TimingFormat } from '../TimingFormat.js';
import { parseInt32 } from './parse-int32.js';

const SECONDS_PER_HOUR = 3600;
const SECONDS_PER_MINUTE = 60;

/** `(int) ((3600L * h) + 60 * m + s)`: Java `int` arithmetic wraps at 32 bits. */
function wrapInt(n: number): number {
  return n | 0;
}

/**
 * The grammar of a time (`@0`, `@:code+3`, `@1:15:00`, `@2020/07/04`, `@+5.5`, `@clk*2`) and its reading
 * against the diagram's `Clocks`.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/timingdiagram/command/TimeTickBuilder.java
 */
export class TimeTickBuilder {
  /** TimeTickBuilder.java:45-52: the five alternatives, in this order. */
  public static expressionAtWithoutArobase(name: string): IRegex {
    return new RegexOr(
      new RegexLeaf(2, `${name}CODE`, String.raw`:([%pLN_.]+)([-+][.\d]+)?`),
      new RegexLeaf(3, `${name}DATE`, String.raw`(\d+)/(\d+)/(\d+)`),
      new RegexLeaf(3, `${name}HOUR`, String.raw`(\d+):(\d+):(\d+)`),
      new RegexLeaf(2, `${name}DIGIT`, String.raw`(\+?)(-?\d+\.?\d*)`),
      new RegexLeaf(2, `${name}CLOCK`, String.raw`([%pLN_.@]+)\*(\d+)`),
    );
  }

  /** TimeTickBuilder.java:54-58 */
  public static expressionAtWithArobase(name: string): IRegex {
    return new RegexConcat(new RegexLeaf('@'), TimeTickBuilder.expressionAtWithoutArobase(name));
  }

  /** TimeTickBuilder.java:60-62 */
  public static optionalExpressionAtWithArobase(name: string): IRegex {
    return new RegexOptional(TimeTickBuilder.expressionAtWithArobase(name));
  }

  /**
   * TimeTickBuilder.java:64-112. `undefined` stands for Java's `null` (an unknown code or clock reads as
   * `null`, and so does a `+N` with no `now`). A code delta goes through `new BigDecimal(delta)`, which throws
   * on `+.`; an unknown code with a delta is a `NullPointerException` (`result.getTime()`).
   */
  public static parseTimeTick(name: string, arg: RegexResult, clock: Clocks): TimeTick | undefined {
    const code = arg.get(`${name}CODE`, 0);
    if (code !== undefined) return codeTick(name, arg, clock, code);
    const clockName = arg.get(`${name}CLOCK`, 0);
    if (clockName !== undefined) return clock.getClockValue(clockName, parseInt32(arg.get(`${name}CLOCK`, 1)));
    if (arg.get(`${name}HOUR`, 0) !== undefined) return hourTick(name, arg);
    if (arg.get(`${name}DATE`, 0) !== undefined) return dateTick(name, arg, clock);
    return digitTick(name, arg, clock);
  }
}

/** The `CODE` branch (java:66-75): the code's tick, shifted by an optional `[-+][.\d]+`. */
function codeTick(name: string, arg: RegexResult, clock: Clocks, code: string): TimeTick | undefined {
  const delta = arg.get(`${name}CODE`, 1);
  const result = clock.getCodeValue(code);
  if (delta === undefined) return result;
  if (result === undefined) throw new Error('java.lang.NullPointerException');
  return new TimeTick(result.getTime().add(new BigDecimal(delta)), TimingFormat.DECIMAL);
}

/** The `HOUR` branch (java:84-93): `3600 * h + 60 * m + s` seconds, `int` arithmetic. */
function hourTick(name: string, arg: RegexResult): TimeTick {
  const h = parseInt32(arg.get(`${name}HOUR`, 0));
  const m = parseInt32(arg.get(`${name}HOUR`, 1));
  const s = parseInt32(arg.get(`${name}HOUR`, 2));
  const value = BigDecimal.valueOf(
    wrapInt(wrapInt(Math.imul(SECONDS_PER_HOUR, h) + Math.imul(SECONDS_PER_MINUTE, m)) + s),
  );
  return new TimeTick(value, TimingFormat.HOUR);
}

/** The `DATE` branch (java:94-101): `yyyy/mm/dd` through the lenient GMT calendar, in the diagram's date format. */
function dateTick(name: string, arg: RegexResult, clock: Clocks): TimeTick {
  const yy = parseInt32(arg.get(`${name}DATE`, 0));
  const mm = parseInt32(arg.get(`${name}DATE`, 1));
  const dd = parseInt32(arg.get(`${name}DATE`, 2));
  return TimingFormat.createDate(yy, mm, dd, clock.getTimingFormatDate());
}

/** The `DIGIT` branch (java:102-112): a number, relative to `now` with a leading `+`; none at all is `now`. */
function digitTick(name: string, arg: RegexResult, clock: Clocks): TimeTick | undefined {
  const number = arg.get(`${name}DIGIT`, 1);
  if (number === undefined) return clock.getNow();
  const isRelative = arg.get(`${name}DIGIT`, 0) === '+';
  let value = new BigDecimal(number);
  const now = clock.getNow();
  if (isRelative && now !== undefined) value = now.getTime().add(value);
  return new TimeTick(value, TimingFormat.DECIMAL);
}
