/**
 * CartesianChart — a bar, line, area or scatter chart once every line is parsed
 * and every implicit value resolved: the categories (1, 2, ..., n when none is
 * given), the value axes fitted to the data, the series as plotted. Built by
 * `ChartDiagram#resolveCartesian`, read by the renderer. Whatever the
 * orientation, the category axis holds the categories (or the numeric h-axis of
 * coordinate pairs) and the value axis the values.
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/chart/CartesianChart.java
 */
import type { ChartAnnotation } from './ChartAnnotation.js';
import type { ChartAxis, LabelPosition } from './ChartAxis.js';
import type { ChartSeries } from './ChartSeries.js';
import { Orientation, type GridMode, type LegendPosition, type StackMode } from './chart-modes.js';

/** The constructor's arguments, named for the parameter hook. @see CartesianChart.java:67-71 */
export interface CartesianChartFields {
  readonly orientation: Orientation;
  readonly categories: readonly string[];
  readonly categoryTitle: string | undefined;
  readonly categoryTickSpacing: number | undefined;
  readonly categoryLabelPosition: LabelPosition;
  readonly numericAxis: ChartAxis | undefined;
  readonly series: readonly ChartSeries[];
  readonly valueAxis: ChartAxis;
  readonly valueAxis2: ChartAxis | undefined;
  readonly legendPosition: LegendPosition;
  readonly categoryGridMode: GridMode;
  readonly valueGridMode: GridMode;
  readonly stackMode: StackMode;
  readonly annotations: readonly ChartAnnotation[];
}

export class CartesianChart {
  constructor(private readonly f: CartesianChartFields) {}

  getOrientation(): Orientation {
    return this.f.orientation;
  }

  /** @see CartesianChart.java:93-95 */
  isHorizontal(): boolean {
    return this.f.orientation === Orientation.HORIZONTAL;
  }

  /** The labels of the categories, empty when the data are coordinate pairs. */
  getCategories(): readonly string[] {
    return this.f.categories;
  }

  getCategoryTitle(): string | undefined {
    return this.f.categoryTitle;
  }

  getCategoryTickSpacing(): number | undefined {
    return this.f.categoryTickSpacing;
  }

  getCategoryLabelPosition(): LabelPosition {
    return this.f.categoryLabelPosition;
  }

  /** The numeric h-axis of coordinate pairs, or of data spread over an h-axis range. */
  getNumericAxis(): ChartAxis | undefined {
    return this.f.numericAxis;
  }

  getSeries(): readonly ChartSeries[] {
    return this.f.series;
  }

  /** @see CartesianChart.java:130-132 */
  hasCoordinatePairs(): boolean {
    return this.f.series.length > 0 && this.f.series[0]!.hasExplicitXValues();
  }

  getValueAxis(): ChartAxis {
    return this.f.valueAxis;
  }

  /** The secondary value axis (v2-axis), or `undefined`. */
  getValueAxis2(): ChartAxis | undefined {
    return this.f.valueAxis2;
  }

  /** The value axis a series is drawn against. @see CartesianChart.java:148-150 */
  getValueAxisOf(s: ChartSeries): ChartAxis {
    return s.isUseSecondaryAxis() && this.f.valueAxis2 !== undefined ? this.f.valueAxis2 : this.f.valueAxis;
  }

  getLegendPosition(): LegendPosition {
    return this.f.legendPosition;
  }

  getCategoryGridMode(): GridMode {
    return this.f.categoryGridMode;
  }

  getValueGridMode(): GridMode {
    return this.f.valueGridMode;
  }

  getStackMode(): StackMode {
    return this.f.stackMode;
  }

  getAnnotations(): readonly ChartAnnotation[] {
    return this.f.annotations;
  }
}
