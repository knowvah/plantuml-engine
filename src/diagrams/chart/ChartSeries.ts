/**
 * ChartSeries — one `bar`, `line`, `area` or `scatter`, index-based or by
 * coordinate pairs.
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/chart/ChartSeries.java
 */
import type { Stereotype } from '../../core/stereo/Stereotype.js';
import type { HColor } from '../../core/style/Value.js';

/** @see ChartSeries.java:45-47 */
export const SeriesType = {
  BAR: 'BAR',
  LINE: 'LINE',
  AREA: 'AREA',
  SCATTER: 'SCATTER',
} as const;
export type SeriesType = (typeof SeriesType)[keyof typeof SeriesType];

/** @see ChartSeries.java:49-51 */
export const MarkerShape = {
  CIRCLE: 'CIRCLE',
  SQUARE: 'SQUARE',
  TRIANGLE: 'TRIANGLE',
} as const;
export type MarkerShape = (typeof MarkerShape)[keyof typeof MarkerShape];

export class ChartSeries {
  private readonly name: string;
  private readonly type: SeriesType;
  private readonly values: number[];
  /** `undefined` in index-based mode. @see ChartSeries.java:56 */
  private readonly xValues: readonly number[] | undefined;
  private color: HColor | undefined = undefined;
  private useSecondaryAxis = false;
  private showLabels = false;
  private markerShape: MarkerShape = MarkerShape.CIRCLE;
  private stereotype: Stereotype | undefined = undefined;

  /**
   * Upstream's two constructors as one. Index-based is `(name, type, values)`,
   * coordinate pairs are `(name, type, yValues, xValues)`: the Java order
   * `(name, type, xValues, yValues)` cannot be told from the overload here, so
   * the optional parameter comes last.
   * @see ChartSeries.java:63-80
   */
  constructor(name: string, type: SeriesType, values: readonly number[], xValues?: readonly number[]) {
    this.name = name;
    this.type = type;
    this.values = [...values];
    this.xValues = xValues === undefined ? undefined : [...xValues];
  }

  getName(): string {
    return this.name;
  }

  getType(): SeriesType {
    return this.type;
  }

  getValues(): readonly number[] {
    return this.values;
  }

  getXValues(): readonly number[] | undefined {
    return this.xValues;
  }

  /** @see ChartSeries.java:99-101 */
  hasExplicitXValues(): boolean {
    return this.xValues !== undefined;
  }

  getColor(): HColor | undefined {
    return this.color;
  }

  setColor(color: HColor): void {
    this.color = color;
  }

  isUseSecondaryAxis(): boolean {
    return this.useSecondaryAxis;
  }

  setUseSecondaryAxis(useSecondaryAxis: boolean): void {
    this.useSecondaryAxis = useSecondaryAxis;
  }

  isShowLabels(): boolean {
    return this.showLabels;
  }

  setShowLabels(showLabels: boolean): void {
    this.showLabels = showLabels;
  }

  getMarkerShape(): MarkerShape {
    return this.markerShape;
  }

  setMarkerShape(markerShape: MarkerShape): void {
    this.markerShape = markerShape;
  }

  getStereotype(): Stereotype | undefined {
    return this.stereotype;
  }

  setStereotype(stereotype: Stereotype | undefined): void {
    this.stereotype = stereotype;
  }
}
