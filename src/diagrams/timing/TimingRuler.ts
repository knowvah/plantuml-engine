import { BigDecimal } from '../../core/decimal/BigDecimal.js';
import { Display } from '../../core/klimt/creole/Display.js';
import type { StringBounder } from '../../core/klimt/font/StringBounder.js';
import { HorizontalAlignment } from '../../core/klimt/geom/HorizontalAlignment.js';
import type { TextBlock } from '../../core/klimt/shape/TextBlock.js';
import { ULine } from '../../core/klimt/shape/ULine.js';
import type { UGraphic } from '../../core/klimt/UGraphic.js';
import { UStroke } from '../../core/klimt/UStroke.js';
import { UTranslate } from '../../core/klimt/UTranslate.js';
import type { Style } from '../../core/style/Style.js';
import { javaHashSetOrder } from '../../core/java-hash-set.js';
import { TimeAxisStategy } from './TimeAxisStategy.js';
import { TimeTick } from './TimeTick.js';
import { TimingFormat } from './TimingFormat.js';
import { back as backOf, createDisplay, fore, timingStyle, type TimingSkinParam } from './timing-klimt.js';
import type { HColor } from '../../core/style/Value.js';
import * as breaks from './TimingRulerBreak.js';
import { Break } from './TimingRulerBreak.js';
import { withUnit, type TimeLabel } from './TimingRulerLabel.js';

/** `getOptimalTickUnit`'s width cap (`maxDiagramWidth`, TimingRuler.java:99). */
const MAX_DIAGRAM_WIDTH = 4000;
/** `getNbTick`'s cap (TimingRuler.java:177). */
const MAX_NB_TICK = 1000;
/** `getWidth` of a ruler with no time (TimingRuler.java:125). */
const EMPTY_WIDTH = 100;
/** `TICK_HEIGHT` of both axis kinds. @see TimingRuler.java:69 (upstream a720bdd) */
const TICK_HEIGHT = 5;
const DEFAULT_TICK_INTERVAL_IN_PIXELS = 50;
const NONE_YET = -1;
const NO_SUCH_ELEMENT = 'java.util.NoSuchElementException';

/**
 * `Map<String, TimeTick> codes`: insertion order in, `HashMap` iteration order read by `getLabel` (D6).
 * Re-putting a key keeps its first position in both.
 */
export type TimeCodes = ReadonlyMap<string, TimeTick>;

/**
 * The shared time axis of a timing diagram: ticks to pixels, the vertical grid and the time labels.
 *
 * `TreeSet<TimeTick>` is a sorted array searched on `compareTo` (D6); every `long` is a JS `number`.
 * Mirrored as written: `getFirstPositiveOrZeroValue` throws `IllegalStateException` when every tick is
 * negative (which is what `@1500/01/01` alone draws as a crash page), and `getMax`/`getMin`/`roundValues`
 * throw `NoSuchElementException` on no ticks.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/timingdiagram/TimingRuler.java
 */
export class TimingRuler {
  readonly #times: TimeTick[] = [];
  readonly #skinParam: TimingSkinParam;
  #tickIntervalInPixels = DEFAULT_TICK_INTERVAL_IN_PIXELS;
  #forcedTickUnitary = 0;
  #format: TimingFormat = TimingFormat.DECIMAL;
  #highestCommonFactorInternal = NONE_YET;
  /** `null` is `undefined`. @see TimingRuler.java:81 (upstream a720bdd) */
  #unit: string | undefined = undefined;
  /** Sorted on `from`, never overlapping. @see TimingRuler.java:83 (upstream a720bdd) */
  readonly #breaks: Break[] = [];

  /** TimingRuler.java:92-94 */
  public constructor(skinParam: TimingSkinParam) {
    this.#skinParam = skinParam;
  }

  /** `applyForVLines` (TimingRuler.java:68-73): a 3,5,0.5 dash in the timegrid line colour. */
  public static applyForVLines(ug: UGraphic, style: Style, skinParam: TimingSkinParam): UGraphic {
    const stroke = new UStroke(3, 5, 0.5);
    const color = style.value('LineColor').asColor(skinParam.getIHtmlColorSet());
    return ug.apply(stroke).apply(fore(color));
  }

  /** TimingRuler.java:75-82 */
  public ensureNotEmpty(): void {
    if (this.#times.length === 0) this.#add(zeroTick());
    if (this.#getMax().getTime().signum() > 0 && this.#getMin().getTime().signum() < 0) this.#add(zeroTick());
  }

  /** @see TimingRuler.java:131-133 (upstream a720bdd) */
  public setUnit(unit: string): void {
    this.#unit = unit;
  }

  /** TimingRuler.java:96-101: `pixel` pixels per `tick` time units; both must be positive. */
  public scaleInPixels(tick: number, pixel: number): void {
    if (pixel <= 0 || tick <= 0) throw new Error('java.lang.IllegalArgumentException');
    this.#tickIntervalInPixels = pixel;
    this.#forcedTickUnitary = tick;
  }

  /** TimingRuler.java:103-124 */
  #getOptimalTickUnit(): number {
    if (this.#forcedTickUnitary !== 0) return this.#forcedTickUnitary;
    const hcfTickUnit = this.#calculateHighestCommonFactor();
    if (hcfTickUnit === 1 && this.#calculateDiagramWidth(hcfTickUnit) > MAX_DIAGRAM_WIDTH) {
      // "when the HCF is too small (e.g., equal to 1), the resulting diagram becomes excessively wide":
      // an approximate unit from the pixel width and the time range instead (TimingRuler.java:106-117).
      const totalTimeRange =
        this.#getMax().getTime().doubleValue() -
        this.#getMin().getTime().doubleValue() -
        breaks.getBreaksDuration(this.#breaks);
      return Math.round(1 + (this.#tickIntervalInPixels * totalTimeRange) / MAX_DIAGRAM_WIDTH);
    }
    return hcfTickUnit;
  }

  /** TimingRuler.java:124-128 */
  public getWidth(): number {
    if (this.#times.length === 0) return EMPTY_WIDTH;
    return this.#calculateDiagramWidth(this.#getOptimalTickUnit());
  }

  /** @see TimingRuler.java:170-172 (upstream a720bdd) */
  #calculateDiagramWidth(tickUnitary: number): number {
    return (this.#getPosInTicks(this.#getMax().getTime().doubleValue(), tickUnitary) + 1) * this.#tickIntervalInPixels;
  }

  /** @see TimingRuler.java:174-190 (upstream a720bdd) */
  #getPosInTicks(time: number, tickUnitary: number): number {
    return breaks.getPosInTicks(this.#breaks, this.#getMin().getTime().doubleValue(), time, tickUnitary);
  }

  /**
   * Refused (`false`) when the break overlaps another; kept sorted on `from` (a stable sort, as `Collections.sort`),
   * and both edges become ruler times.
   * @see TimingRuler.java:199-214 (upstream a720bdd)
   */
  public addBreak(from: TimeTick, to: TimeTick): boolean {
    const added = new Break(from.getTime().doubleValue(), to.getTime().doubleValue());
    for (const other of this.#breaks) if (added.overlaps(other)) return false;

    this.#breaks.push(added);
    this.#breaks.sort((b1, b2) => b1.from - b2.from);
    this.addTime(from);
    this.addTime(to);
    return true;
  }

  /** @see TimingRuler.java:216-221 (upstream a720bdd) */
  #getBreakContaining(time: number): Break | undefined {
    return breaks.getBreakContaining(this.#breaks, time);
  }

  /** @see TimingRuler.java:223-245 (upstream a720bdd) */
  #getRegularTimes(first: number): number[] {
    return breaks.getRegularTimes(
      {
        breaks: this.#breaks,
        tickUnitary: this.#getOptimalTickUnit(),
        width: this.getWidth(),
        toPixel: (time) => this.#getPosInPixelInternal(time),
      },
      first,
    );
  }

  /** TimingRuler.java:137-147: the cached HCF of the absolute ticks, -1 until one exists. */
  #calculateHighestCommonFactor(): number {
    if (this.#highestCommonFactorInternal === NONE_YET) {
      for (const tick of this.#getAbsolutesTicks()) {
        this.#highestCommonFactorInternal =
          this.#highestCommonFactorInternal === NONE_YET
            ? tick
            : computeHighestCommonFactor(this.#highestCommonFactorInternal, tick);
      }
    }
    return this.#highestCommonFactorInternal;
  }

  /** TimingRuler.java:149-163: a `TreeSet<Long>` ordered high to low (`o2.compareTo(o1)`) of the positive `|tick|`. */
  #getAbsolutesTicks(): number[] {
    const result = new Set<number>();
    for (const time of this.#times) {
      const value = Math.abs(time.getTime().longValue());
      if (value > 0) result.add(value);
    }
    return [...result].sort((a, b) => b - a);
  }

  /** TimingRuler.java:165-171: `Math.min(1000, (int) (1 + delta / unit))` with `long` division. */
  #getNbTick(): number {
    if (this.#times.length === 0) return 1;
    const delta = this.#getMax().getTime().longValue() - this.#getMin().getTime().longValue();
    return Math.min(MAX_NB_TICK, Math.trunc(1 + Math.trunc(delta / this.#getOptimalTickUnit())));
  }

  /** TimingRuler.java:173-175 */
  public getPosInPixel(when: TimeTick): number {
    return this.#getPosInPixelInternal(when.getTime().doubleValue());
  }

  /** @see TimingRuler.java:287-289 (upstream a720bdd) */
  #getPosInPixelInternal(time: number): number {
    return this.#getPosInTicks(time, this.#getOptimalTickUnit()) * this.#tickIntervalInPixels;
  }

  /** TimingRuler.java:182-189: the format is taken from a non-DECIMAL tick even when the tick was a duplicate. */
  public addTime(time: TimeTick): void {
    this.#highestCommonFactorInternal = NONE_YET;
    this.#add(time);
    if (time.getFormat() !== TimingFormat.DECIMAL) this.#format = time.getFormat();
  }

  /** `TreeSet#add`: an element comparing equal to a member is not added. */
  #add(time: TimeTick): void {
    let lo = 0;
    let hi = this.#times.length - 1;
    while (lo <= hi) {
      const mid = (lo + hi) >>> 1;
      const c = (this.#times[mid] as TimeTick).compareTo(time);
      if (c === 0) return;
      if (c < 0) lo = mid + 1;
      else hi = mid - 1;
    }
    this.#times.splice(lo, 0, time);
  }

  /** TimingRuler.java:191-194 */
  #getStyleTimeline(): Style {
    return timingStyle(this.#skinParam, 'timeline');
  }

  /** TimingRuler.java:196-199 */
  #getStyleTimegrid(): Style {
    return timingStyle(this.#skinParam, 'timegrid');
  }

  /** TimingRuler.java:201-203 (the `long` overload) */
  #getTimeTextBlockOfTime(time: number): TextBlock {
    return this.#getTimeTextBlock(this.#format.formatTime(time));
  }

  /** TimingRuler.java:205-209 */
  #getTimeTextBlock(text: string): TextBlock {
    const display = Display.getWithNewlines(this.#skinParam.getPragma(), text);
    return createDisplay(display, this.#getStyleTimeline(), this.#skinParam, HorizontalAlignment.LEFT);
  }

  /** The ticks and the rule first, then every label (`getTimeLabels`). @see TimingRuler.java:317-336 (upstream a720bdd) */
  public drawTimeAxis(ug: UGraphic, timeAxisStategy: TimeAxisStategy, codes: TimeCodes): void {
    if (timeAxisStategy === TimeAxisStategy.HIDDEN) return;
    const styleTimeline = this.#getStyleTimeline();
    const color = styleTimeline.value('LineColor').asColor(this.#skinParam.getIHtmlColorSet());
    const stroke = styleTimeline.getStroke();
    const drawn = ug.apply(stroke).apply(fore(color));
    if (timeAxisStategy === TimeAxisStategy.AUTOMATIC) this.#drawTicksAutomatic(drawn);
    else this.#drawTicksManual(drawn);
    for (const label of this.#getTimeLabels(drawn.getStringBounder(), timeAxisStategy, codes)) {
      label.text.drawU(drawn.apply(new UTranslate(label.x, TICK_HEIGHT + 1)));
    }
  }

  /** @see TimingRuler.java:338-349 (upstream a720bdd) */
  #drawTicksManual(ug: UGraphic): void {
    const line = ULine.vline(TICK_HEIGHT);
    const firstTickPosition = this.#getFirstTickPosition();
    this.#drawAxisLine(ug, firstTickPosition, this.#getAxisEnd(TimeAxisStategy.MANUAL) - firstTickPosition);
    for (const tick of this.#times) {
      if (this.#getBreakContaining(tick.getTime().doubleValue()) !== undefined) continue;
      ug.apply(UTranslate.dx(this.getPosInPixel(tick))).draw(line);
    }
  }

  /** @see TimingRuler.java:351-370 (upstream a720bdd) */
  #drawTicksAutomatic(ug: UGraphic): void {
    const line = ULine.vline(TICK_HEIGHT);
    const firstTickPosition = this.#getFirstTickPosition();
    if (this.#breaks.length === 0) {
      const axisEnd = this.#getAxisEnd(TimeAxisStategy.AUTOMATIC);
      for (let i = 0; firstTickPosition + i * this.#tickIntervalInPixels <= axisEnd; i++) {
        ug.apply(UTranslate.dx(firstTickPosition + i * this.#tickIntervalInPixels)).draw(line);
      }
      ug.apply(UTranslate.dx(firstTickPosition)).draw(ULine.hline(axisEnd - firstTickPosition));
      return;
    }
    const ticks = this.#getRegularTimes(this.#getFirstPositiveOrZeroValue().doubleValue());
    for (const time of ticks) ug.apply(UTranslate.dx(this.#getPosInPixelInternal(time))).draw(line);
    for (const b of this.#breaks) {
      ug.apply(UTranslate.dx(this.#getPosInPixelInternal(b.from))).draw(line);
      ug.apply(UTranslate.dx(this.#getPosInPixelInternal(b.to))).draw(line);
    }
    // `ticks.get(0)` of an empty list is IndexOutOfBoundsException in Java.
    if (ticks.length === 0) throw new Error('java.lang.IndexOutOfBoundsException: Index 0 out of bounds for length 0');
    const firstPosition = this.#getPosInPixelInternal(ticks[0] as number);
    this.#drawAxisLine(ug, firstPosition, this.#getAxisEnd(TimeAxisStategy.AUTOMATIC) - firstPosition);
  }

  /** @see TimingRuler.java:550-566 (upstream a720bdd) */
  #drawAxisLine(ug: UGraphic, x: number, length: number): void {
    breaks.drawAxisLine(ug, this.#breaks, (time) => this.#getPosInPixelInternal(time), x, length);
  }

  /** @see TimingRuler.java:372-374 (upstream a720bdd) */
  #getFirstTickPosition(): number {
    return this.#getPosInPixelInternal(this.#getFirstPositiveOrZeroValue().doubleValue());
  }

  /** The last regular time with breaks on an automatic axis, else the last tick inside the width. @see TimingRuler.java:376-387 (upstream a720bdd) */
  #getAxisEnd(timeAxisStategy: TimeAxisStategy): number {
    if (timeAxisStategy === TimeAxisStategy.AUTOMATIC && this.#breaks.length !== 0) {
      const ticks = this.#getRegularTimes(this.#getFirstPositiveOrZeroValue().doubleValue());
      const last = ticks[ticks.length - 1];
      if (last === undefined)
        throw new Error('java.lang.IndexOutOfBoundsException: Index -1 out of bounds for length 0');
      return this.#getPosInPixelInternal(last);
    }
    const firstTickPosition = this.#getFirstTickPosition();
    let nb = 0;
    while (firstTickPosition + nb * this.#tickIntervalInPixels <= this.getWidth()) nb++;
    return firstTickPosition + (nb - 1) * this.#tickIntervalInPixels;
  }

  /**
   * Each label at `getLabelX`; a unit is right-aligned on the axis end, dropping the values it would overlap.
   * @see TimingRuler.java:405-445 (upstream a720bdd)
   */
  #getTimeLabels(stringBounder: StringBounder, timeAxisStategy: TimeAxisStategy, codes: TimeCodes): TimeLabel[] {
    const moments: number[] = [];
    const texts: TextBlock[] = [];
    if (timeAxisStategy === TimeAxisStategy.AUTOMATIC) {
      for (const round of this.#roundValues()) {
        moments.push(round);
        texts.push(this.#getTimeTextBlockOfTime(round));
      }
    } else {
      for (const tick of this.#times) {
        if (this.#getBreakContaining(tick.getTime().doubleValue()) !== undefined) continue;
        const label = this.#getLabel(tick, codes);
        if (label.length === 0) continue;
        moments.push(tick.getTime().doubleValue());
        texts.push(this.#getTimeTextBlock(label));
      }
    }
    const result = texts.map((text, i): TimeLabel => {
      const width = text.calculateDimension(stringBounder).getWidth();
      return { text, x: this.#getLabelX(moments[i] as number, width), width };
    });
    if (this.#unit === undefined) return result;

    const unitText = this.#getTimeTextBlock(this.#unit);
    const unitWidth = unitText.calculateDimension(stringBounder).getWidth();
    return withUnit(result, { text: unitText, x: this.#getAxisEnd(timeAxisStategy) - unitWidth, width: unitWidth });
  }

  /** @see TimingRuler.java:527-536 (upstream a720bdd) */
  #getLabelX(time: number, labelWidth: number): number {
    return breaks.getLabelX(this.#breaks, time, this.#getPosInPixelInternal(time), labelWidth);
  }

  /**
   * TimingRuler.java:270-276: the first code (in `HashMap` order) whose tick IS this tick (`equals` is
   * identity), else the formatted time (the `BigDecimal` overload).
   */
  #getLabel(tick: TimeTick, codes: TimeCodes): string {
    for (const key of javaHashSetOrder([...codes.keys()], javaStringHashCode, Object.is)) {
      if (tick === codes.get(key)) return key;
    }
    return this.#format.formatTime(tick.getTime());
  }

  /** TimingRuler.java:278-284 */
  #getFirstPositiveOrZeroValue(): BigDecimal {
    for (const time of this.#times) if (time.getTime().signum() >= 0) return time.getTime();
    throw new Error('java.lang.IllegalStateException');
  }

  /** `(long) time` on a finite double is `Math.trunc`. @see TimingRuler.java:463-493 (upstream a720bdd) */
  #roundValues(): number[] {
    const result = new Set<number>();
    if (this.#forcedTickUnitary === 0) {
      for (const tick of this.#times) result.add(tick.getTime().longValue());
    } else if (this.#breaks.length === 0) {
      const nb = this.#getNbTick();
      for (let i = 0; i <= nb; i++) result.add(this.#tickToTime(i));
    } else {
      const tickUnitary = this.#getOptimalTickUnit();
      for (const time of this.#getRegularTimes(this.#getMin().getTime().doubleValue()))
        if (!breaks.isTooCloseToBreak(this.#breaks, time, tickUnitary)) result.add(Math.trunc(time));
    }
    // `result.first()` of an empty set throws in Java, but `#getFirstPositiveOrZeroValue` has thrown before.
    const values = [...result];
    // `result.first() < 0 && result.last() > 0`: a set, so an existing 0 is not added twice.
    if (Math.min(...values) < 0 && Math.max(...values) > 0) result.add(0);
    for (const b of this.#breaks) {
      result.add(Math.trunc(b.from));
      result.add(Math.trunc(b.to));
    }
    return [...result].filter((round) => this.#getBreakContaining(round) === undefined).sort((a, b) => a - b);
  }

  /** TimingRuler.java:306-308 */
  #tickToTime(i: number): number {
    return this.#forcedTickUnitary * i + this.#getMin().getTime().longValue();
  }

  /** @see TimingRuler.java:499-510 (upstream a720bdd) */
  public drawVlines(ug: UGraphic, height: number): void {
    const drawn = TimingRuler.applyForVLines(ug, this.#getStyleTimegrid(), this.#skinParam);
    const line = ULine.vline(height);
    if (this.#breaks.length === 0) {
      const nb = this.#getNbTick();
      for (let i = 0; i <= nb; i++) drawn.apply(UTranslate.dx(this.#tickIntervalInPixels * i)).draw(line);
      return;
    }
    for (const time of this.#getRegularTimes(this.#getMin().getTime().doubleValue()))
      drawn.apply(UTranslate.dx(this.#getPosInPixelInternal(time))).draw(line);
  }

  /**
   * Masks the squeezed part of each break over a player area, and draws its two zigzag edges.
   * @see TimingRuler.java:568-594 (upstream a720bdd)
   */
  public drawBreaks(ug: UGraphic, height: number, back: HColor): void {
    const styleTimeline = this.#getStyleTimeline();
    const color = styleTimeline.value('LineColor').asColor(this.#skinParam.getIHtmlColorSet());
    for (const b of this.#breaks) {
      const left = breaks.getZigzag(this.#getPosInPixelInternal(b.from), height);
      const right = breaks.getZigzag(this.#getPosInPixelInternal(b.to), height);
      ug.apply(fore(back)).apply(backOf(back)).draw(breaks.getBreakMask(left, right));

      const ugEdge = ug.apply(styleTimeline.getStroke()).apply(fore(color));
      ugEdge.draw(breaks.toPath(left));
      ugEdge.draw(breaks.toPath(right));
    }
  }

  /** TimingRuler.java:321-323 */
  public getHeight(stringBounder: StringBounder): number {
    return this.#getTimeTextBlockOfTime(0).calculateDimension(stringBounder).getHeight();
  }

  /** `times.last()` */
  #getMax(): TimeTick {
    const last = this.#times[this.#times.length - 1];
    if (last === undefined) throw new Error(NO_SUCH_ELEMENT);
    return last;
  }

  /** `times.first()` */
  #getMin(): TimeTick {
    const first = this.#times[0];
    if (first === undefined) throw new Error(NO_SUCH_ELEMENT);
    return first;
  }

  /** TimingRuler.java:337-340: `// WIP`, nothing happens (unreachable: `CommandStopAt` is not registered). */
  public setStopAt(_timeTick: TimeTick): void {
    // WIP
  }
}

/**
 * `String#hashCode()` over UTF-16 code units, as a Java `int`. Local, as other ports keep theirs.
 * @see JDK 21 java/lang/StringLatin1.java `hashCode`
 */
function javaStringHashCode(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  return h;
}

/** `new TimeTick(BigDecimal.ZERO, TimingFormat.DECIMAL)` (TimingRuler.java:83,86). */
function zeroTick(): TimeTick {
  return new TimeTick(BigDecimal.ZERO, TimingFormat.DECIMAL);
}

/** TimingRuler.java:325-334: Euclid on `long`s, `Math.abs` of the result. */
function computeHighestCommonFactor(first: number, second: number): number {
  let a = first;
  let b = second;
  let r = a;
  while (r !== 0) {
    r = a % b;
    a = b;
    b = r;
  }
  return Math.abs(a);
}
