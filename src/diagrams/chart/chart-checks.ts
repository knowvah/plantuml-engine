/**
 * `ChartDiagram`'s checks on cartesian data as it is written: keys against the
 * category axis, coordinate pairs against the h-axis, one data format for every
 * series. Split out of `ChartDiagram.ts` under the 500-line hook; each Java
 * method keeps its name and takes the diagram fields it reads.
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/chart/ChartDiagram.java:400-431, 742-807
 */
import { javaDoubleToString } from '../../core/java-number-format.js';
import type { ChartAxis } from './ChartAxis.js';
import { SeriesType, type ChartSeries } from './ChartSeries.js';
import { Orientation } from './chart-modes.js';

/** @see ChartDiagram.java:758-759 */
const ERROR_PAIRS_LINE_SCATTER_ONLY = 'Coordinate pair notation (x:y) is only supported for line and scatter charts';
/** @see ChartDiagram.java:649-650, 760-761 */
export const ERROR_PAIRS_NEED_NUMERIC =
  'Coordinate pair notation requires numeric h-axis (e.g., h-axis "x" -5 --> 5), not categorical labels';
/** @see ChartDiagram.java:770-771 */
const ERROR_PAIRS_NEED_RANGE = 'Coordinate pair notation requires explicit h-axis range (e.g., h-axis "x" -5 --> 5)';
/** @see ChartDiagram.java:600-601, 774-775, 795-796 */
export const ERROR_SAME_FORMAT =
  'All series must use the same data format (either all coordinate pairs or all index-based)';
/** @see ChartDiagram.java:402-403, 423-424, 692-693 */
export const ERROR_KEYS_NEED_CATEGORIES = 'Keyed values (key: value) need h-axis categories, not an h-axis range';

/** What the cartesian checks read of the diagram. */
export interface CartesianCheckState {
  readonly orientation: Orientation;
  readonly xAxis: ChartAxis;
  readonly xAxisLabels: readonly string[];
  readonly series: readonly ChartSeries[];
}

/** `"key" is not in h-axis`, or v-axis for a horizontal chart. @see ChartDiagram.java:406-407 */
function notInCategories(c: CartesianCheckState, key: string): string {
  return `"${key}" is not in ${c.orientation === Orientation.HORIZONTAL ? 'v-axis' : 'h-axis'}`;
}

/** A list item's key, checked as a series' keys are. @see ChartDiagram.java:400-409 */
export function checkCartesianKey(c: CartesianCheckState, key: string, labels: readonly string[]): string | undefined {
  if (c.orientation === Orientation.VERTICAL && !c.xAxis.isAutoScale()) return ERROR_KEYS_NEED_CATEGORIES;
  if (labels.length > 0 && !labels.includes(key)) return notInCategories(c, key);
  return undefined;
}

/**
 * A series' keys must be categories when labels are given, and categories must
 * exist: a vertical chart with an h-axis range has none.
 * @see ChartDiagram.java:419-431
 */
export function checkCartesianKeys(
  c: CartesianCheckState,
  s: ChartSeries,
  labels: readonly string[],
): string | undefined {
  const keys = s.getKeys();
  if (keys === undefined) return undefined;
  if (c.orientation === Orientation.VERTICAL && !c.xAxis.isAutoScale()) return ERROR_KEYS_NEED_CATEGORIES;
  if (labels.length > 0) for (const key of keys) if (!labels.includes(key)) return notInCategories(c, key);
  return undefined;
}

/** Without an h-axis range, the h-axis spans the x values (dddab579e13). @see ChartDiagram.java:752-789 */
export function checkCoordinatePairs(c: CartesianCheckState, series: ChartSeries): string | undefined {
  if (series.getType() !== SeriesType.LINE && series.getType() !== SeriesType.SCATTER)
    return ERROR_PAIRS_LINE_SCATTER_ONLY;
  if (c.xAxisLabels.length > 0) return ERROR_PAIRS_NEED_NUMERIC;
  const ranged = !c.xAxis.isAutoScale();
  if (ranged && c.xAxis.getMax() === c.xAxis.getMin()) return ERROR_PAIRS_NEED_RANGE;
  return checkSameFormat(c, series) ?? (ranged ? checkInRange(c.xAxis, series.getXValues()!) : undefined);
}

/** Every x within the given h-axis range. @see ChartDiagram.java:783-788 */
function checkInRange(xAxis: ChartAxis, xValues: readonly number[]): string | undefined {
  for (const x of xValues) {
    if (x < xAxis.getMin() || x > xAxis.getMax()) {
      const range = `[${javaDoubleToString(xAxis.getMin())}, ${javaDoubleToString(xAxis.getMax())}]`;
      return `X-coordinate ${javaDoubleToString(x)} is outside h-axis range ${range}`;
    }
  }
  return undefined;
}

/** @see ChartDiagram.java:773-778, 794-799 */
export function checkSameFormat(c: CartesianCheckState, series: ChartSeries): string | undefined {
  const first = c.series[0];
  if (first !== undefined && first.hasExplicitXValues() !== series.hasExplicitXValues()) return ERROR_SAME_FORMAT;
  return undefined;
}
