/**
 * The t-axis breaks of `TimingRuler` (upstream baf98040f42, #2981): the private nested `Break` class and the pieces of
 * break arithmetic that read no ruler field, kept beside `TimingRuler.ts` so that file stays under the size limit.
 * Each function names the `TimingRuler.java` method it is; the ruler passes its own state in.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/timingdiagram/TimingRuler.java
 */
import { XPoint2D } from '../../core/klimt/geom/XPoint2D.js';
import { ULine } from '../../core/klimt/shape/ULine.js';
import { UPath } from '../../core/klimt/shape/UPath.js';
import type { UGraphic } from '../../core/klimt/UGraphic.js';
import { UTranslate } from '../../core/klimt/UTranslate.js';

/** Each break takes this many tick intervals, whatever its duration. @see TimingRuler.java:85 */
export const BREAK_IN_TICKS = 0.5;
/** Amplitude of the zigzag edges of a break. @see TimingRuler.java:512-513 */
const BREAK_MARK = 3;
/** `getRegularTimes`' bound on the number of times (`result.size() <= 1000`). @see TimingRuler.java:232 */
const MAX_REGULAR_TIMES = 1000;

/**
 * A discontinuity of the time axis: the whole range between `from` and `to` is squeezed into `BREAK_IN_TICKS` tick
 * interval.
 *
 * @see TimingRuler.java:87-109
 */
export class Break {
  /** java:96-99 */
  public constructor(
    public readonly from: number,
    public readonly to: number,
  ) {}

  /** java:101-103 */
  public isStrictlyInside(time: number): boolean {
    return time > this.from && time < this.to;
  }

  /** java:105-107 */
  public overlaps(other: Break): boolean {
    return this.from < other.to && other.from < this.to;
  }
}

/** Whether a time is the `from` or the `to` of a break. @see TimingRuler.java:418-423 (upstream b066ee08c) */
export function isBreakEdge(breaks: readonly Break[], time: number): boolean {
  for (const b of breaks) if (time === b.from || time === b.to) return true;
  return false;
}

/** Position of a time on the axis, in tick intervals from `min` (the smallest time). @see TimingRuler.java:174-190 */
export function getPosInTicks(breaks: readonly Break[], min: number, time: number, tickUnitary: number): number {
  let shift = 0;
  for (const b of breaks) {
    if (time <= b.from) break;
    if (time < b.to) return (b.from - min) / tickUnitary + shift + (BREAK_IN_TICKS * (time - b.from)) / (b.to - b.from);
    shift += BREAK_IN_TICKS - (b.to - b.from) / tickUnitary;
  }
  return (time - min) / tickUnitary + shift;
}

/** @see TimingRuler.java:192-197 */
export function getBreaksDuration(breaks: readonly Break[]): number {
  let result = 0;
  for (const b of breaks) result += b.to - b.from;
  return result;
}

/** `null` is `undefined`. @see TimingRuler.java:216-221 */
export function getBreakContaining(breaks: readonly Break[], time: number): Break | undefined {
  for (const b of breaks) if (b.isStrictlyInside(time)) return b;
  return undefined;
}

/** What `getRegularTimes` reads from the ruler: its tick unit, width and time-to-pixel mapping. */
export interface RegularTimesRuler {
  readonly breaks: readonly Break[];
  readonly tickUnitary: number;
  readonly width: number;
  readonly toPixel: (time: number) => number;
}

/**
 * Regularly spaced times starting at `first`, jumping over breaks, up to the end of the axis.
 * `(long) Math.ceil(...)` on a finite double is `Math.ceil`.
 * @see TimingRuler.java:223-245
 */
export function getRegularTimes(ruler: RegularTimesRuler, first: number): number[] {
  const result: number[] = [];
  let i = 0;
  while (result.length <= MAX_REGULAR_TIMES) {
    const time = first + i * ruler.tickUnitary;
    if (ruler.toPixel(time) > ruler.width) break;
    const inside = getBreakContaining(ruler.breaks, time);
    if (inside === undefined) {
      result.push(time);
      i++;
    } else {
      i = Math.max(i + 1, Math.ceil((inside.to - first) / ruler.tickUnitary));
    }
  }
  return result;
}

/**
 * Labels are centred on their tick (`x`), except at the edges of a break where they are pushed away from it, so that
 * both edges stay readable.
 * @see TimingRuler.java:523-536
 */
export function getLabelX(breaks: readonly Break[], time: number, x: number, labelWidth: number): number {
  for (const b of breaks) if (time === b.to) return x;
  for (const b of breaks) if (time === b.from) return x - labelWidth;
  return x - labelWidth / 2;
}

/** A regular label that would collide with the label of a break edge. @see TimingRuler.java:538-548 */
export function isTooCloseToBreak(breaks: readonly Break[], time: number, tickUnitary: number): boolean {
  for (const b of breaks) {
    if (time !== b.from && Math.abs(time - b.from) < tickUnitary) return true;
    if (time !== b.to && Math.abs(time - b.to) < tickUnitary) return true;
  }
  return false;
}

/**
 * The axis rule from `x` over `length`, interrupted at each break (`getBreakStart`/`getBreakEnd` are `toPixel` of
 * `from`/`to`, java:515-521).
 * @see TimingRuler.java:550-566
 */
export function drawAxisLine(
  ug: UGraphic,
  breaks: readonly Break[],
  toPixel: (time: number) => number,
  x: number,
  length: number,
): void {
  const end = x + length;
  let current = x;
  for (const b of breaks) {
    const start = toPixel(b.from);
    const stop = toPixel(b.to);
    if (stop <= current || start >= end) continue;
    if (start > current) ug.apply(UTranslate.dx(current)).draw(ULine.hline(start - current));
    current = stop;
  }
  if (current === x) ug.apply(UTranslate.dx(x)).draw(ULine.hline(length));
  else if (end > current) ug.apply(UTranslate.dx(current)).draw(ULine.hline(end - current));
}

/** `(int) Math.round(...)`: Java rounds half up, as `Math.round` does. @see TimingRuler.java:596-608 */
export function getZigzag(x: number, height: number): XPoint2D[] {
  const result: XPoint2D[] = [];
  const nb = Math.max(1, Math.round(height / (2 * BREAK_MARK)));
  for (let i = 0; i <= nb; i++) {
    let dx: number;
    if (i === 0 || i === nb) dx = 0;
    else dx = i % 2 === 0 ? -BREAK_MARK / 2 : BREAK_MARK / 2;
    result.push(new XPoint2D(x + dx, (height * i) / nb));
  }
  return result;
}

/** The mask between the two zigzag edges: down the left one, back up the right one. @see TimingRuler.java:579-587 */
export function getBreakMask(left: readonly XPoint2D[], right: readonly XPoint2D[]): UPath {
  const mask = UPath.none();
  for (const pt of left) {
    if (mask.isEmpty()) mask.moveTo(pt);
    else mask.lineTo(pt);
  }
  for (let i = right.length - 1; i >= 0; i--) mask.lineTo(right[i] as XPoint2D);
  mask.closePath();
  return mask;
}

/** @see TimingRuler.java:610-616 */
export function toPath(points: readonly XPoint2D[]): UPath {
  const result = UPath.none();
  result.moveTo(points[0] as XPoint2D);
  for (let i = 1; i < points.length; i++) result.lineTo(points[i] as XPoint2D);
  return result;
}
