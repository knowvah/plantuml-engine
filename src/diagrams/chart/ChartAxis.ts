/**
 * ChartAxis — one numeric axis: title, range, autoscale, custom ticks, tick
 * spacing and label position.
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/chart/ChartAxis.java
 */

/** @see ChartAxis.java:41-45 */
export const LabelPosition = {
  DEFAULT: 'DEFAULT',
  TOP: 'TOP',
  RIGHT: 'RIGHT',
} as const;
export type LabelPosition = (typeof LabelPosition)[keyof typeof LabelPosition];

/**
 * One entry of upstream's `Map<Double, String>` (a `LinkedHashMap`). A JS `Map`
 * would merge `-0.0` and `0.0`, which `Double#equals` keeps apart, so the
 * command builds an insertion-ordered list that overwrites by `Object.is` (D6).
 */
export interface ChartTick {
  readonly value: number;
  readonly label: string;
}

/** The `new ChartAxis()` range. @see ChartAxis.java:57-58 */
const DEFAULT_MIN = 0;
/** @see ChartAxis.java:58 */
const DEFAULT_MAX = 100;
/** Multipliers of a power of ten accepted as a tick step; 1.5 and 2.5 left out. @see ChartAxis.java:131 */
const NICE_STEPS: readonly number[] = [1, 2, 3, 4, 5, 6, 8];
/** The intervals the automatic value ticks draw. @see ChartAxis.java:134 */
const TICK_INTERVALS = 5;

/**
 * The first `NICE_STEPS` multiple of `magnitude` whose range `start -> start + 5 * step`
 * reaches `hi` with both bounds finite: the body of `withNiceRange`'s inner loop.
 * @see ChartAxis.java:166-172
 */
function niceRangeAt(lo: number, hi: number, magnitude: number): readonly [number, number] | undefined {
  for (const nice of NICE_STEPS) {
    const step = nice * magnitude;
    const start = Math.floor(lo / step) * step;
    const end = start + TICK_INTERVALS * step;
    if (end >= hi && !isInfinite(start) && !isInfinite(end)) return [start, end];
  }
  return undefined;
}

/** Java's `Double.isInfinite`: false for NaN. */
export function isInfinite(value: number): boolean {
  return value === Number.POSITIVE_INFINITY || value === Number.NEGATIVE_INFINITY;
}

export class ChartAxis {
  private title: string;
  private min: number;
  private max: number;
  private autoScale: boolean;
  private customTicks: readonly ChartTick[] | undefined = undefined;
  private tickSpacing: number | undefined = undefined;
  private labelPosition: LabelPosition = LabelPosition.DEFAULT;

  /**
   * Upstream's two constructors: no arguments is an autoscaled 0 to 100,
   * `(title, min, max)` is fixed.
   * @see ChartAxis.java:55-73
   */
  constructor(fixed?: string, min?: number, max?: number) {
    this.title = fixed ?? '';
    this.min = min ?? DEFAULT_MIN;
    this.max = max ?? DEFAULT_MAX;
    this.autoScale = fixed === undefined;
  }

  getTitle(): string {
    return this.title;
  }

  setTitle(title: string): void {
    this.title = title;
  }

  getMin(): number {
    return this.min;
  }

  /** @see ChartAxis.java:87-90 */
  setMin(min: number): void {
    this.min = min;
    this.autoScale = false;
  }

  getMax(): number {
    return this.max;
  }

  /** @see ChartAxis.java:96-99 */
  setMax(max: number): void {
    this.max = max;
    this.autoScale = false;
  }

  isAutoScale(): boolean {
    return this.autoScale;
  }

  setAutoScale(autoScale: boolean): void {
    this.autoScale = autoScale;
  }

  /** @see ChartAxis.java:112-116 */
  valueToPixel(value: number, pixelMin: number, pixelMax: number): number {
    if (this.max === this.min) return pixelMin;
    return pixelMin + ((value - this.min) / (this.max - this.min)) * (pixelMax - pixelMin);
  }

  /** A copy of this axis (title, ticks, label position) with the given range. @see ChartAxis.java:121-127 */
  withRange(newMin: number, newMax: number): ChartAxis {
    const result = new ChartAxis(this.title, newMin, newMax);
    result.customTicks = this.customTicks;
    result.tickSpacing = this.tickSpacing;
    result.labelPosition = this.labelPosition;
    return result;
  }

  /**
   * A copy whose range is the smallest round range holding `dataMin`, `dataMax`
   * and 0: `start + 5 * step`, step being `NICE_STEPS` times a power of ten and
   * start a multiple of step (2117ccb43cd, #2956).
   *
   * Values near the limits of a double may have no round range that is itself a
   * finite double (a stack of 1e308 + 1e308, or -1.7e308 and 1): the axis then goes
   * from lo to hi as they are, which may be infinite, and
   * `ChartDiagram.checkFinalError` reports it (3a4d96cb3, plantuml/plantuml#3030).
   * @see ChartAxis.java:150-176
   */
  withNiceRange(dataMin: number, dataMax: number): ChartAxis {
    const lo = Math.min(0, dataMin);
    const hi = Math.max(0, dataMax);
    if (Number.isNaN(lo) || Number.isNaN(hi)) return this.withRange(lo, hi);
    if (lo === hi) return this.withRange(this.min, this.max);

    let magnitude = Math.pow(10, Math.floor(Math.log10((hi - lo) / TICK_INTERVALS)) - 1);
    // Below the smallest normal double, (hi - lo) / 5 can round to 0 (4.9e-324 / 5)
    if (magnitude === 0) magnitude = Number.MIN_VALUE;
    // Termination: once step >= hi - lo, any multiple start <= lo gives start + 5 * step > hi.
    // When that multiple overflows, magnitude keeps growing until it is infinite.
    while (!isInfinite(magnitude)) {
      const range = niceRangeAt(lo, hi, magnitude);
      if (range !== undefined) return this.withRange(range[0], range[1]);
      magnitude *= 10;
    }
    return this.withRange(lo, hi);
  }

  /**
   * Whether this range can be drawn: both bounds and the distance between them are
   * finite (a distance of 0 is drawn at the start of the axis, see `valueToPixel`).
   * @see ChartAxis.java:182-185
   */
  isDrawable(): boolean {
    const span = this.max - this.min;
    return span >= 0 && !isInfinite(span);
  }

  getCustomTicks(): readonly ChartTick[] | undefined {
    return this.customTicks;
  }

  setCustomTicks(customTicks: readonly ChartTick[]): void {
    this.customTicks = customTicks;
  }

  /** @see ChartAxis.java:147-149 */
  hasCustomTicks(): boolean {
    return this.customTicks !== undefined && this.customTicks.length > 0;
  }

  getTickSpacing(): number | undefined {
    return this.tickSpacing;
  }

  setTickSpacing(tickSpacing: number): void {
    this.tickSpacing = tickSpacing;
  }

  /** @see ChartAxis.java:168-170 */
  hasTickSpacing(): boolean {
    return this.tickSpacing !== undefined && this.tickSpacing > 0;
  }

  getLabelPosition(): LabelPosition {
    return this.labelPosition;
  }

  setLabelPosition(labelPosition: LabelPosition): void {
    this.labelPosition = labelPosition;
  }
}
