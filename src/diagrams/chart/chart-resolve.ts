/**
 * `ChartDiagram`'s resolution of a cartesian chart once every line is parsed:
 * the fitted value axes, the categories, the keyed values aligned on them, the
 * numeric h-axis of coordinate pairs and the values spread over an h-axis range.
 * Split out of `ChartDiagram.ts` under the 500-line hook; each Java method keeps
 * its name and takes the diagram fields it reads.
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/chart/ChartDiagram.java:230-481
 */
import { naturalSplineThrough } from '../../core/klimt/geom/NaturalSpline.js';
import type { Bezier } from '../../core/klimt/shape/DotPath.js';
import { XPoint2D } from '../../core/klimt/geom/XPoint2D.js';
import type { ChartAnnotation } from './ChartAnnotation.js';
import { ChartAxis, type LabelPosition } from './ChartAxis.js';
import { CartesianChart, type CartesianChartFields } from './CartesianChart.js';
import { SeriesType, type ChartSeries, type ChartValue } from './ChartSeries.js';
import { Orientation, StackMode, type GridMode, type LegendPosition } from './chart-modes.js';
import { StackLayout } from './StackLayout.js';

/**
 * Samples per interval of an interpolated line, whose natural spline overshoots
 * its points: its extent is sampled so the curve stays inside the axis.
 * @see ChartDiagram.java:330
 */
const CURVE_SAMPLES = 32;
/** The share of a point's height an arrow annotation asks above it. @see ChartDiagram.java:320 */
const ARROW_HEADROOM = 0.25;

/** What `getValueAxis` reads of the diagram. */
export interface ValueAxisContext {
  readonly y2Axis: ChartAxis | undefined;
  readonly stackMode: StackMode;
  readonly orientation: Orientation;
  readonly annotations: readonly ChartAnnotation[];
}

/** A running `[min, max]`, Java's two locals. */
interface Extent {
  min: number;
  max: number;
}

function include(e: Extent, value: number): void {
  e.min = Math.min(e.min, value);
  e.max = Math.max(e.max, value);
}

/** `(s.isUseSecondaryAxis() && y2Axis != null) == secondary`. */
function onAxis(s: ChartSeries, c: ValueAxisContext, secondary: boolean): boolean {
  return (s.isUseSecondaryAxis() && c.y2Axis !== undefined) === secondary;
}

/**
 * Without a range, a value axis is fitted to the values drawn against it, once
 * every line is parsed: a `v2-axis` may follow the series using it, and stacked
 * bars and areas reach the top of their stack (2117ccb43cd, #2956).
 * @see ChartDiagram.java:262-323
 */
export function getValueAxis(
  axis: ChartAxis,
  secondary: boolean,
  series: readonly ChartSeries[],
  c: ValueAxisContext,
): ChartAxis {
  if (!axis.isAutoScale()) return axis;
  const extent: Extent = { min: Number.POSITIVE_INFINITY, max: Number.NEGATIVE_INFINITY };
  const drawn = series.filter((s) => onAxis(s, c, secondary));
  includeSeries(extent, drawn, c.stackMode);
  if (extent.min > extent.max) return axis;
  if (!secondary) includeAnnotations(extent, c);
  return axis.withNiceRange(extent.min, extent.max);
}

/** The values, stack tops and spline samples of the series on one axis. @see ChartDiagram.java:268-303 */
function includeSeries(extent: Extent, series: readonly ChartSeries[], stackMode: StackMode): void {
  const bars = series.filter((s) => s.getType() === SeriesType.BAR);
  const areas = series.filter((s) => s.getType() === SeriesType.AREA);
  const barStack = StackLayout.bars(bars);
  const areaStack = StackLayout.areas(areas);
  for (const s of series) {
    for (const [i, value] of s.getValues().entries()) {
      if (value === undefined) continue;
      if (s.getType() === SeriesType.AREA) include(extent, areaStack.getTop(areas.indexOf(s), i));
      else if (s.getType() === SeriesType.BAR && stackMode === StackMode.STACKED)
        include(extent, barStack.getTop(bars.indexOf(s), i));
      else include(extent, value);
    }
    if (s.getType() === SeriesType.LINE && s.isInterpolate()) includeSpline(extent, s);
  }
}

/** @see ChartDiagram.java:296-302 */
function includeSpline(extent: Extent, s: ChartSeries): void {
  for (const curve of naturalSplineThrough(valuePoints(s)))
    for (let k = 1; k < CURVE_SAMPLES; k++) include(extent, bezierY(curve, k / CURVE_SAMPLES));
}

/**
 * Annotations sit on the primary axis. An arrow is drawn downwards only with
 * about 55 px above its point, so the range asks for the point plus 25% of its
 * height (vertical charts only).
 * @see ChartDiagram.java:313-321
 */
function includeAnnotations(extent: Extent, c: ValueAxisContext): void {
  for (const annotation of c.annotations) {
    const y = annotation.getYPosition();
    include(extent, y);
    if (annotation.isShowArrow() && c.orientation === Orientation.VERTICAL)
      extent.max = Math.max(extent.max, y + ARROW_HEADROOM * (y - Math.min(0, extent.min)));
  }
}

/** The points of a series in value space (x = explicit x, or index), missing values left out. @see ChartDiagram.java:333-340 */
function valuePoints(s: ChartSeries): XPoint2D[] {
  const result: XPoint2D[] = [];
  const xValues = s.getXValues();
  for (const [i, value] of s.getValues().entries())
    if (value !== undefined) result.push(new XPoint2D(xValues !== undefined ? xValues[i]! : i, value));
  return result;
}

/** @see ChartDiagram.java:342-346 */
function bezierY(c: Bezier, t: number): number {
  const u = 1 - t;
  return u * u * u * c.y1 + 3 * u * u * t * c.ctrly1 + 3 * u * t * t * c.ctrly2 + t * t * t * c.y2;
}

/**
 * The keys of the series with keys, first seen first, then 2, 3, ..., n for the
 * longest series without keys. Shared by `getCategories` and the radar.
 * @see ChartDiagram.java:357-372
 */
export function keyCategories(series: readonly ChartSeries[]): string[] {
  const categories: string[] = [];
  for (const s of series) for (const key of s.getKeys() ?? []) if (!categories.includes(key)) categories.push(key);
  let count = 0;
  for (const s of series) if (!s.hasKeys()) count = Math.max(count, s.getValues().length);
  for (let i = categories.length + 1; i <= count; i++) categories.push(String(i));
  return categories;
}

/**
 * Without category labels, index-based data is drawn against the series' keys,
 * then 1, 2, ..., n, as if `h-axis [1, 2, ..., n]` had been written (d68b839c457).
 * @see ChartDiagram.java:348-373
 */
export function getCategories(labels: readonly string[], series: readonly ChartSeries[]): readonly string[] {
  if (labels.length > 0 || series.length === 0 || series[0]!.hasExplicitXValues()) return labels;
  return keyCategories(series);
}

/**
 * The keyed series with their values in category order, a missing category a
 * missing value: `[Feb: 20, Jan: 10]` on `[Jan, Feb, Mar]` is `[10, 20, ]`.
 * @see ChartDiagram.java:375-395
 */
export function alignKeys(series: readonly ChartSeries[], categories: readonly string[]): ChartSeries[] {
  return series.map((s) => {
    const keys = s.getKeys();
    if (keys === undefined) return s;
    const values: ChartValue[] = categories.map(() => undefined);
    for (const [i, value] of s.getValues().entries()) {
      const index = categories.indexOf(keys[i]!);
      if (index >= 0) values[index] = value;
    }
    return s.withValues(values);
  });
}

/**
 * Coordinate pairs without an h-axis range are drawn against `min -> max` of
 * their x values, or `x - 1 -> x + 1` when all are equal (dddab579e13, #2954).
 * @see ChartDiagram.java:433-454
 */
export function getHAxis(xAxis: ChartAxis, series: readonly ChartSeries[]): ChartAxis {
  if (!xAxis.isAutoScale() || !hasCoordinatePairs(series)) return xAxis;
  let min = Number.POSITIVE_INFINITY;
  let max = Number.NEGATIVE_INFINITY;
  for (const s of series)
    for (const x of s.getXValues() ?? []) {
      min = Math.min(min, x);
      max = Math.max(max, x);
    }
  if (min === max) {
    min = min - 1;
    max = max + 1;
  }
  return new ChartAxis(xAxis.getTitle(), min, max);
}

/**
 * With an h-axis range and no h-axis labels, index-based values are spread evenly
 * over the range, a single one in the middle (55e6dabc863, #2955).
 * @see ChartDiagram.java:456-477
 */
export function getPlottedSeries(
  series: readonly ChartSeries[],
  xAxis: ChartAxis,
  xAxisLabels: readonly string[],
): readonly ChartSeries[] {
  if (xAxis.isAutoScale() || xAxisLabels.length > 0 || series.length === 0 || hasCoordinatePairs(series)) return series;
  let count = 0;
  for (const s of series) count = Math.max(count, s.getValues().length);
  const min = xAxis.getMin();
  const max = xAxis.getMax();
  return series.map((s) =>
    s.withXValues(s.getValues().map((_, i) => (count === 1 ? (min + max) / 2 : min + ((max - min) * i) / (count - 1)))),
  );
}

/** @see ChartDiagram.java:479-481 */
export function hasCoordinatePairs(series: readonly ChartSeries[]): boolean {
  return series.length > 0 && series[0]!.hasExplicitXValues();
}

/** The diagram fields `resolveCartesian` reads. */
export interface CartesianSource extends ValueAxisContext {
  readonly xAxisLabels: readonly string[];
  readonly xAxisTitle: string | undefined;
  readonly xAxisTickSpacing: number | undefined;
  readonly xAxisLabelPosition: LabelPosition;
  readonly xAxis: ChartAxis;
  readonly yAxisLabels: readonly string[];
  readonly yAxis: ChartAxis;
  readonly series: readonly ChartSeries[];
  readonly legendPosition: LegendPosition;
  readonly xGridMode: GridMode;
  readonly yGridMode: GridMode;
}

/** The fields `resolveCartesian`'s two arms set apart. */
type ArmFields =
  | 'categories'
  | 'categoryTitle'
  | 'categoryTickSpacing'
  | 'series'
  | 'valueAxis'
  | 'valueAxis2'
  | 'categoryGridMode'
  | 'valueGridMode';

/**
 * A horizontal chart takes its categories from the v-axis, down the left side,
 * and its values against the h-axis range, with the grid modes swapped.
 * @see ChartDiagram.java:230-243
 */
export function resolveCartesian(d: CartesianSource): CartesianChart {
  const hAxis = getHAxis(d.xAxis, d.series);
  const common = {
    orientation: d.orientation,
    categoryLabelPosition: d.xAxisLabelPosition,
    numericAxis: hAxis,
    legendPosition: d.legendPosition,
    stackMode: d.stackMode,
    annotations: d.annotations,
  };
  if (d.orientation !== Orientation.HORIZONTAL) return resolveVertical(d, common);
  const categories = getCategories(d.yAxisLabels, d.series);
  const resolved = alignKeys(d.series, categories);
  return new CartesianChart({
    ...common,
    categories,
    categoryTitle: d.yAxis.getTitle(),
    categoryTickSpacing: undefined,
    series: resolved,
    valueAxis: hasCoordinatePairs(d.series) ? hAxis : getValueAxis(d.xAxis, false, resolved, d),
    valueAxis2: undefined,
    categoryGridMode: d.yGridMode,
    valueGridMode: d.xGridMode,
  });
}

/** The vertical arm: an h-axis range is kept as it is. @see ChartDiagram.java:244-254 */
function resolveVertical(d: CartesianSource, common: Omit<CartesianChartFields, ArmFields>): CartesianChart {
  const title = d.xAxis.getTitle();
  const categories = d.xAxis.isAutoScale() ? getCategories(d.xAxisLabels, d.series) : d.xAxisLabels;
  const resolved = alignKeys(d.series, categories);
  return new CartesianChart({
    ...common,
    categories,
    categoryTitle: title !== '' ? title : d.xAxisTitle,
    categoryTickSpacing: d.xAxisTickSpacing,
    series: getPlottedSeries(resolved, d.xAxis, d.xAxisLabels),
    valueAxis: getValueAxis(d.yAxis, false, resolved, d),
    valueAxis2: d.y2Axis === undefined ? undefined : getValueAxis(d.y2Axis, true, resolved, d),
    categoryGridMode: d.xGridMode,
    valueGridMode: d.yGridMode,
  });
}
