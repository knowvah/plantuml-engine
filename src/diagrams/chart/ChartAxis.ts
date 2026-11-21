/**
 * ChartAxis — one numeric axis: title, range, autoscale, custom ticks, tick
 * spacing and label position.
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/chart/ChartAxis.java
 */
import { javaDoubleToString } from '../../core/java-number-format.js';

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

/** A magnitude the nice-range loop can grow from. @see ChartAxis.java:167-169 (efe6d85e5f3) */
function isUsableMagnitude(magnitude: number): boolean {
  return magnitude > 0 && Number.isFinite(magnitude);
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
   * The loop needs finite numbers: NaN, Infinity, or a start that overflows near
   * `-Double.MAX_VALUE` never pass the test, and a magnitude of 0 never grows, so
   * it stops once the magnitude is no longer finite and positive, and throws
   * (plantuml/plantuml#3030, efe6d85e5f3, mirrored ahead of a release).
   * @see ChartAxis.java:145-169 (efe6d85e5f3)
   */
  withNiceRange(dataMin: number, dataMax: number): ChartAxis {
    const lo = Math.min(0, dataMin);
    const hi = Math.max(0, dataMax);
    if (lo === hi) return this.withRange(this.min, this.max);

    let magnitude = Math.pow(10, Math.floor(Math.log10((hi - lo) / TICK_INTERVALS)) - 1);
    // Termination: once step >= hi - lo, any multiple start <= lo gives start + 5 * step > hi.
    while (isUsableMagnitude(magnitude)) {
      for (const nice of NICE_STEPS) {
        const step = nice * magnitude;
        const start = Math.floor(lo / step) * step;
        if (start + TICK_INTERVALS * step >= hi) return this.withRange(start, start + TICK_INTERVALS * step);
      }
      magnitude *= 10;
    }
    throw new Error(
      `IllegalArgumentException: No axis range for values from ${javaDoubleToString(dataMin)} to ${javaDoubleToString(dataMax)}`,
    );
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
