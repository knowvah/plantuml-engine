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

  /** @see ChartAxis.java:121-128 */
  includeValue(value: number): void {
    if (this.autoScale) {
      if (value < this.min) this.min = value;
      if (value > this.max) this.max = value;
    }
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
