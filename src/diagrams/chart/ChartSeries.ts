/**
 * ChartSeries — one `bar`, `line`, `area` or `scatter`, index-based or by
 * coordinate pairs, or a `pie` or `radar` (e8ef39dd55c). A missing value is
 * `undefined`, Java's `null` (f44b054d131).
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
  PIE: 'PIE',
  RADAR: 'RADAR',
} as const;
export type SeriesType = (typeof SeriesType)[keyof typeof SeriesType];

/** @see ChartSeries.java:49-51 */
export const MarkerShape = {
  CIRCLE: 'CIRCLE',
  SQUARE: 'SQUARE',
  TRIANGLE: 'TRIANGLE',
} as const;
export type MarkerShape = (typeof MarkerShape)[keyof typeof MarkerShape];

/** A value, or `undefined` for a missing one (Java's `null` `Double`). */
export type ChartValue = number | undefined;

export class ChartSeries {
  private readonly name: string;
  private readonly type: SeriesType;
  private readonly values: ChartValue[];
  /** `undefined` in index-based mode. @see ChartSeries.java:55 */
  private readonly xValues: readonly number[] | undefined;
  private color: HColor | undefined = undefined;
  private useSecondaryAxis = false;
  private showLabels = false;
  private interpolate = false;
  private connect = false;
  private markerShape: MarkerShape = MarkerShape.CIRCLE;
  private stereotype: Stereotype | undefined = undefined;
  /** Data written as `[key: value, ...]`: the key of each value. @see ChartSeries.java:64-65 */
  private keys: string[] | undefined = undefined;
  /** A colour written after a value (`[Dogs: 386 #3366CC]`), one per value. @see ChartSeries.java:66-67 */
  private itemColors: (HColor | undefined)[] | undefined = undefined;
  /** Pie only: show percentages. @see ChartSeries.java:68-69 */
  private showPercent = false;
  /** Pie only: the size of a donut's hole, 0 for a plain pie. @see ChartSeries.java:70 */
  private donutHole = 0;

  /**
   * Upstream's two constructors as one. Index-based is `(name, type, values)`,
   * coordinate pairs are `(name, type, yValues, xValues)`: the Java order
   * `(name, type, xValues, yValues)` cannot be told from the overload here, so
   * the optional parameter comes last.
   * @see ChartSeries.java:72-94
   */
  constructor(name: string, type: SeriesType, values: readonly ChartValue[], xValues?: readonly number[]) {
    this.name = name;
    this.type = type;
    this.values = [...values];
    this.xValues = xValues === undefined ? undefined : [...xValues];
  }

  /** The same series with the given x values, as if written as coordinate pairs. @see ChartSeries.java:96-100 */
  withXValues(xValues: readonly number[]): ChartSeries {
    return this.copyAttributesTo(new ChartSeries(this.name, this.type, this.values, xValues));
  }

  /** The same series with other values and no keys. @see ChartSeries.java:102-108 */
  withValues(newValues: readonly ChartValue[]): ChartSeries {
    const result = this.copyAttributesTo(new ChartSeries(this.name, this.type, newValues));
    result.keys = undefined;
    return result;
  }

  /** @see ChartSeries.java:110-122 */
  private copyAttributesTo(result: ChartSeries): ChartSeries {
    result.color = this.color;
    result.useSecondaryAxis = this.useSecondaryAxis;
    result.showLabels = this.showLabels;
    result.interpolate = this.interpolate;
    result.connect = this.connect;
    result.markerShape = this.markerShape;
    result.stereotype = this.stereotype;
    result.keys = this.keys;
    result.itemColors = this.itemColors;
    result.showPercent = this.showPercent;
    result.donutHole = this.donutHole;
    return result;
  }

  getName(): string {
    return this.name;
  }

  getType(): SeriesType {
    return this.type;
  }

  getValues(): readonly ChartValue[] {
    return this.values;
  }

  getXValues(): readonly number[] | undefined {
    return this.xValues;
  }

  /** @see ChartSeries.java:140-142 */
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

  isInterpolate(): boolean {
    return this.interpolate;
  }

  setInterpolate(interpolate: boolean): void {
    this.interpolate = interpolate;
  }

  isConnect(): boolean {
    return this.connect;
  }

  setConnect(connect: boolean): void {
    this.connect = connect;
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

  getKeys(): readonly string[] | undefined {
    return this.keys;
  }

  /** @see ChartSeries.java:204-206 */
  hasKeys(): boolean {
    return this.keys !== undefined;
  }

  /** @see ChartSeries.java:208-210 */
  setKeys(keys: readonly string[] | undefined): void {
    this.keys = keys === undefined ? undefined : [...keys];
  }

  /**
   * A value at the end, as written on a line of a list. The key is `undefined`
   * for a value without key: the caller checks that either every value has a key,
   * or none has.
   * @see ChartSeries.java:212-232
   */
  addItem(key: string | undefined, value: ChartValue, itemColor: HColor | undefined): void {
    this.values.push(value);
    if (key !== undefined) {
      this.keys ??= [];
      this.keys.push(key);
    }
    if (itemColor !== undefined && this.itemColors === undefined)
      this.itemColors = new Array<HColor | undefined>(this.values.length - 1).fill(undefined);
    this.itemColors?.push(itemColor);
  }

  /** The colour written after the i-th value. @see ChartSeries.java:234-238 */
  getItemColor(i: number): HColor | undefined {
    if (this.itemColors === undefined || i >= this.itemColors.length) return undefined;
    return this.itemColors[i];
  }

  /** @see ChartSeries.java:240-242 */
  setItemColors(itemColors: readonly (HColor | undefined)[] | undefined): void {
    this.itemColors = itemColors === undefined ? undefined : [...itemColors];
  }

  isShowPercent(): boolean {
    return this.showPercent;
  }

  setShowPercent(showPercent: boolean): void {
    this.showPercent = showPercent;
  }

  getDonutHole(): number {
    return this.donutHole;
  }

  setDonutHole(donutHole: number): void {
    this.donutHole = donutHole;
  }
}
