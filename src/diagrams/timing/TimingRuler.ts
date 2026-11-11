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
import { createDisplay, fore, timingStyle, type TimingSkinParam } from './timing-klimt.js';

/** `getOptimalTickUnit`'s width cap (`maxDiagramWidth`, TimingRuler.java:99). */
const MAX_DIAGRAM_WIDTH = 4000;
/** `getNbTick`'s cap (TimingRuler.java:177). */
const MAX_NB_TICK = 1000;
/** `getWidth` of a ruler with no time (TimingRuler.java:125). */
const EMPTY_WIDTH = 100;
/** `tickHeight` of both axis kinds (TimingRuler.java:204,230,246). */
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
      const totalTimeRange = this.#getMax().getTime().doubleValue() - this.#getMin().getTime().doubleValue();
      return Math.round(1 + (this.#tickIntervalInPixels * totalTimeRange) / MAX_DIAGRAM_WIDTH);
    }
    return hcfTickUnit;
  }

  /** TimingRuler.java:124-128 */
  public getWidth(): number {
    if (this.#times.length === 0) return EMPTY_WIDTH;
    return this.#calculateDiagramWidth(this.#getOptimalTickUnit());
  }

  /** TimingRuler.java:130-133 */
  #calculateDiagramWidth(tickUnitary: number): number {
    const delta = this.#getMax().getTime().doubleValue() - this.#getMin().getTime().doubleValue();
    return (delta / tickUnitary + 1) * this.#tickIntervalInPixels;
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

  /** TimingRuler.java:177-180 */
  #getPosInPixelInternal(time: number): number {
    const relative = time - this.#getMin().getTime().doubleValue();
    return (relative / this.#getOptimalTickUnit()) * this.#tickIntervalInPixels;
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

  /** TimingRuler.java:211-229. `getStyleTimegrid()` is fetched there and never used; not repeated. */
  public drawTimeAxis(ug: UGraphic, timeAxisStategy: TimeAxisStategy, codes: TimeCodes): void {
    if (timeAxisStategy === TimeAxisStategy.HIDDEN) return;
    const styleTimeline = this.#getStyleTimeline();
    const color = styleTimeline.value('LineColor').asColor(this.#skinParam.getIHtmlColorSet());
    const stroke = styleTimeline.getStroke();
    const drawn = ug.apply(stroke).apply(fore(color));
    if (timeAxisStategy === TimeAxisStategy.AUTOMATIC) this.#drawTimeAxisAutomatic(drawn);
    else this.#drawTimeAxisManual(drawn, codes);
  }

  /** TimingRuler.java:231-251 */
  #drawTimeAxisManual(ug: UGraphic, codes: TimeCodes): void {
    const line = ULine.vline(TICK_HEIGHT);
    const firstTickPosition = this.#getPosInPixelInternal(this.#getFirstPositiveOrZeroValue().doubleValue());
    let nb = 0;
    while (firstTickPosition + nb * this.#tickIntervalInPixels <= this.getWidth()) nb++;
    ug.apply(UTranslate.dx(firstTickPosition)).draw(ULine.hline((nb - 1) * this.#tickIntervalInPixels));
    for (const tick of this.#times) {
      ug.apply(UTranslate.dx(this.getPosInPixel(tick))).draw(line);
      const label = this.#getLabel(tick, codes);
      if (label.length === 0) continue;
      this.#drawLabel(ug, this.#getTimeTextBlock(label), this.getPosInPixel(tick));
    }
  }

  /** TimingRuler.java:253-268 */
  #drawTimeAxisAutomatic(ug: UGraphic): void {
    const line = ULine.vline(TICK_HEIGHT);
    const firstTickPosition = this.#getPosInPixelInternal(this.#getFirstPositiveOrZeroValue().doubleValue());
    let nb = 0;
    while (firstTickPosition + nb * this.#tickIntervalInPixels <= this.getWidth()) {
      ug.apply(UTranslate.dx(firstTickPosition + nb * this.#tickIntervalInPixels)).draw(line);
      nb++;
    }
    ug.apply(UTranslate.dx(firstTickPosition)).draw(ULine.hline((nb - 1) * this.#tickIntervalInPixels));
    for (const round of this.#roundValues()) {
      this.#drawLabel(ug, this.#getTimeTextBlockOfTime(round), this.#getPosInPixelInternal(round));
    }
  }

  /** The label draw shared by both axes: centred on `x`, one pixel under the ticks. */
  #drawLabel(ug: UGraphic, text: TextBlock, x: number): void {
    const dim = text.calculateDimension(ug.getStringBounder());
    text.drawU(ug.apply(new UTranslate(x - dim.getWidth() / 2, TICK_HEIGHT + 1)));
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

  /** TimingRuler.java:286-304 */
  #roundValues(): number[] {
    const result = new Set<number>();
    if (this.#forcedTickUnitary === 0) {
      for (const tick of this.#times) result.add(tick.getTime().longValue());
    } else {
      const nb = this.#getNbTick();
      for (let i = 0; i <= nb; i++) result.add(this.#tickToTime(i));
    }
    // `result.first()` of an empty set throws in Java, but `#getFirstPositiveOrZeroValue` has thrown before.
    const values = [...result];
    // `result.first() < 0 && result.last() > 0`: a set, so an existing 0 is not added twice.
    if (Math.min(...values) < 0 && Math.max(...values) > 0) result.add(0);
    const sorted = [...result].sort((a, b) => a - b);
    return sorted;
  }

  /** TimingRuler.java:306-308 */
  #tickToTime(i: number): number {
    return this.#forcedTickUnitary * i + this.#getMin().getTime().longValue();
  }

  /** TimingRuler.java:310-319 */
  public drawVlines(ug: UGraphic, height: number): void {
    const drawn = TimingRuler.applyForVLines(ug, this.#getStyleTimegrid(), this.#skinParam);
    const line = ULine.vline(height);
    const nb = this.#getNbTick();
    for (let i = 0; i <= nb; i++) drawn.apply(UTranslate.dx(this.#tickIntervalInPixels * i)).draw(line);
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
