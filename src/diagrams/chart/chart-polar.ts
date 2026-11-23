/**
 * `ChartDiagram`'s pie and radar side (e8ef39dd55c): the kind a keyword belongs
 * to and the check that keeps the kinds apart, the radar's categories, values
 * and radial scale, and the checks on pie values and radar keys. Split out of
 * `ChartDiagram.ts` under the 500-line hook; each Java method keeps its name.
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/chart/ChartDiagram.java:84-89, 163-220, 486-583
 */
import { javaDoubleToString } from '../../core/java-number-format.js';
import { ChartAxis, type ChartTick } from './ChartAxis.js';
import type { LegendPosition } from './chart-modes.js';
import { PieChart } from './PieChart.js';
import type { RadarChart } from './RadarChart.js';
import { SeriesType, type ChartSeries, type ChartValue } from './ChartSeries.js';
import { keyCategories } from './chart-resolve.js';
import { checkRange } from './chart-checks.js';

/**
 * The family of a keyword: cartesian axes, a pie, or a radar. `POLAR` is a keyword
 * a pie and a radar share (`a-axis`).
 * @see ChartDiagram.java:86-89
 */
export const Kind = {
  CARTESIAN: 'CARTESIAN',
  PIE: 'PIE',
  RADAR: 'RADAR',
  POLAR: 'POLAR',
} as const;
export type Kind = (typeof Kind)[keyof typeof Kind];

/** The kind of the keywords written so far, and the first of them. @see ChartDiagram.java:110-111 */
export class ChartKind {
  private kind: Kind | undefined = undefined;
  private kindKeyword: string | undefined = undefined;

  getKind(): Kind | undefined {
    return this.kind;
  }

  /**
   * Whether a keyword can join the ones already written: pie, radar and the
   * cartesian keywords cannot be mixed. The refusal's message, or `undefined`.
   * @see ChartDiagram.java:490-504
   */
  checkKind(keyword: string, wanted: Kind): string | undefined {
    const kind = this.kind;
    if (kind === undefined || kind === wanted || (wanted === Kind.POLAR && isPieOrRadar(kind))) {
      if (kind === undefined) this.kindKeyword = keyword;
      if (kind === undefined || kind === Kind.POLAR) this.kind = wanted;
      return undefined;
    }
    if (kind === Kind.POLAR && isPieOrRadar(wanted)) {
      this.kind = wanted;
      this.kindKeyword = keyword;
      return undefined;
    }
    return `"${keyword}" cannot be used with "${this.kindKeyword!}"`;
  }
}

/** `k == Kind.PIE || k == Kind.RADAR`. @see ChartDiagram.java:491, 497 */
function isPieOrRadar(k: Kind): boolean {
  return k === Kind.PIE || k === Kind.RADAR;
}

/** The kind of a series' keyword. @see ChartDiagram.java:588-589, 745-746 */
export function kindOf(s: ChartSeries): Kind {
  if (s.getType() === SeriesType.PIE) return Kind.PIE;
  if (s.getType() === SeriesType.RADAR) return Kind.RADAR;
  return Kind.CARTESIAN;
}

/** `s.getType().name().toLowerCase(Locale.ROOT)`, the keyword `checkKind` names. */
export function keywordOf(s: ChartSeries): string {
  return s.getType().toLowerCase();
}

/** A pie or a radar. */
export function isPolar(s: ChartSeries): boolean {
  return s.getType() === SeriesType.PIE || s.getType() === SeriesType.RADAR;
}

/**
 * The keys of a radar series must be a-axis categories, when it is given.
 * @see ChartDiagram.java:521-528
 */
export function checkKeys(s: ChartSeries, labels: readonly string[]): string | undefined {
  const keys = s.getKeys();
  if (s.getType() !== SeriesType.RADAR || keys === undefined || labels.length === 0) return undefined;
  for (const key of keys) if (!labels.includes(key)) return `"${key}" is not in a-axis`;
  return undefined;
}

/**
 * A pie's values cannot be negative, and one at least must be above 0.
 * `"" + value` is Java's `Double.toString`.
 * @see ChartDiagram.java:568-581
 */
function checkPieValues(s: ChartSeries, toJavaString: (value: number) => string): string | undefined {
  let positive = false;
  for (const value of s.getValues()) {
    if (value === undefined) continue;
    if (value < 0) return `A pie cannot have a negative value: ${toJavaString(value)}`;
    if (value > 0) positive = true;
  }
  return positive ? undefined : 'A pie needs at least one value greater than 0';
}

/**
 * The radar's categories: the a-axis labels, else the series' keys, then 1..n.
 * @see ChartDiagram.java:169-186
 */
function getRadarCategories(angularLabels: readonly string[], series: readonly ChartSeries[]): readonly string[] {
  if (angularLabels.length > 0) return angularLabels;
  return keyCategories(series);
}

/** Each series' value per category, `undefined` when missing. @see ChartDiagram.java:188-204 */
function getRadarValues(categories: readonly string[], series: readonly ChartSeries[]): ChartValue[][] {
  return series.map((s) => {
    const keys = s.getKeys();
    const values: ChartValue[] = categories.map(() => undefined);
    for (const [i, value] of s.getValues().entries()) {
      const index = keys !== undefined ? categories.indexOf(keys[i]!) : i;
      if (index >= 0 && index < values.length) values[index] = value;
    }
    return values;
  });
}

/** Without an r-axis range, the scale goes from 0 to a round value above the data. @see ChartDiagram.java:206-220 */
function getRadialAxis(radialAxis: ChartAxis, series: readonly ChartSeries[]): ChartAxis {
  if (!radialAxis.isAutoScale()) return radialAxis;
  let min = Number.POSITIVE_INFINITY;
  let max = Number.NEGATIVE_INFINITY;
  for (const s of series)
    for (const value of s.getValues())
      if (value !== undefined) {
        min = Math.min(min, value);
        max = Math.max(max, value);
      }
  if (min > max) return radialAxis;
  return radialAxis.withNiceRange(min, max);
}

/** @see ChartDiagram.java:553, 594 */
export const ERROR_ONE_PIE = 'Only one pie is allowed in a chart';

/** `setRadialAxis`'s arguments, each set only when given. @see ChartDiagram.java:530-531 */
export interface RadialAxisSettings {
  readonly min: number | undefined;
  readonly max: number | undefined;
  readonly customTicks: readonly ChartTick[] | undefined;
  readonly tickSpacing: number | undefined;
  readonly circleGrid: boolean | undefined;
}

/**
 * `ChartDiagram`'s pie and radar fields: the categories around the circle
 * (a-axis), the radial scale (r-axis) and the ring shape, with the methods that
 * set and resolve them.
 * @see ChartDiagram.java:105-108
 */
export class PolarAxes {
  private readonly angularLabels: string[] = [];
  private readonly radialAxis = new ChartAxis();
  private radarCircleGrid = false;

  /** After the kind check: the radar series' keys, then the labels. @see ChartDiagram.java:510-518 */
  setAngularLabels(series: readonly ChartSeries[], labels: readonly string[]): string | undefined {
    for (const s of series) {
      const unknown = checkKeys(s, labels);
      if (unknown !== undefined) return unknown;
    }
    this.angularLabels.length = 0;
    this.angularLabels.push(...labels);
    return undefined;
  }

  /** After the kind check, the shared range check (93ebfacc5). @see ChartDiagram.java:548-560 */
  setRadialAxis(r: RadialAxisSettings): string | undefined {
    const range = checkRange('r-axis', r.min, r.max);
    if (range !== undefined) return range;
    if (r.min !== undefined) this.radialAxis.setMin(r.min);
    if (r.max !== undefined) this.radialAxis.setMax(r.max);
    if (r.customTicks !== undefined) this.radialAxis.setCustomTicks(r.customTicks);
    if (r.tickSpacing !== undefined) this.radialAxis.setTickSpacing(r.tickSpacing);
    if (r.circleGrid !== undefined) this.radarCircleGrid = r.circleGrid;
    return undefined;
  }

  /** @see ChartDiagram.java:151-153 */
  resolvePie(series: readonly ChartSeries[], legendPosition: LegendPosition): PieChart {
    return new PieChart(series[0]!, this.angularLabels, legendPosition);
  }

  /** @see ChartDiagram.java:158-161 */
  resolveRadar(series: readonly ChartSeries[], legendPosition: LegendPosition): RadarChart {
    const categories = getRadarCategories(this.angularLabels, series);
    return {
      categories,
      values: getRadarValues(categories, series),
      series,
      axis: getRadialAxis(this.radialAxis, series),
      circleGrid: this.radarCircleGrid,
      legendPosition,
    };
  }

  /** A pie or radar series written with its data. @see ChartDiagram.java:550-565 */
  checkPolarSeries(series: readonly ChartSeries[], s: ChartSeries): string | undefined {
    if (s.getType() !== SeriesType.PIE) return checkKeys(s, this.angularLabels);
    return series.length > 0 ? ERROR_ONE_PIE : checkPieValues(s, javaDoubleToString);
  }

  /** A list item of a pie (not negative) or a radar (a key in the a-axis). @see ChartDiagram.java:614-619 */
  checkPolarItem(open: ChartSeries, key: string | undefined, value: ChartValue): string | undefined {
    if (open.getType() === SeriesType.PIE && value !== undefined && value < 0)
      return `A pie cannot have a negative value: ${javaDoubleToString(value)}`;
    const labels = this.angularLabels;
    if (open.getType() === SeriesType.RADAR && key !== undefined && labels.length > 0 && !labels.includes(key))
      return `"${key}" is not in a-axis`;
    return undefined;
  }
}

/** A pie written as a list, checked once all its items are read. @see ChartDiagram.java:636-645 */
export function checkFinalPie(series: readonly ChartSeries[]): string | undefined {
  for (const s of series)
    if (s.getType() === SeriesType.PIE) {
      const error = checkPieValues(s, javaDoubleToString);
      if (error !== undefined) return error;
    }
  return undefined;
}
