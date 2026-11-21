/**
 * AreaRenderer — each run of present values is a polygon, top then bottom,
 * drawn with no stroke set, so it inherits the outer 1.0; then its top line at
 * 2.0; then labels at `y - 8`. A missing value breaks the area (f44b054d131), and
 * a value lies on the previous areas only where they reach it (StackLayout).
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/chart/AreaRenderer.java
 */
import { XPoint2D } from '../../core/klimt/geom/XPoint2D.js';
import { UPolygon } from '../../core/klimt/shape/UPolygon.js';
import type { UGraphic } from '../../core/klimt/UGraphic.js';
import type { HColor } from '../../core/style/Value.js';
import type { ChartAxis } from './ChartAxis.js';
import type { ChartSeries, ChartValue } from './ChartSeries.js';
import type { SkinParam } from './chart-skin-param.js';
import { back, drawLabel, fore, plotY } from './ChartStyles.js';
import { drawThickSegment } from './LineRenderer.js';

/** A category's centre. @see AreaRenderer.java:145 */
const CATEGORY_CENTER = 0.5;
/** A label's anchor above the area. @see AreaRenderer.java:104 */
const LABEL_OFFSET = 8;

/** The constructor, grouped for the parameter hook. @see AreaRenderer.java:64-71 */
export interface AreaRendererParams {
  readonly skinParam: SkinParam;
  readonly plotWidth: number;
  readonly plotHeight: number;
  readonly categoryCount: number;
  readonly axis: ChartAxis;
}

/** The base of each value, `undefined` where no previous area reaches it. */
type Baseline = readonly ChartValue[] | undefined;

export class AreaRenderer {
  constructor(private readonly p: AreaRendererParams) {}

  /** @see AreaRenderer.java:77-106 */
  draw(ug: UGraphic, series: ChartSeries, color: HColor, baselineValues: Baseline): void {
    if (this.p.categoryCount === 0) return;
    const values = series.getValues();
    const count = Math.min(values.length, this.p.categoryCount);

    let i = 0;
    while (i < count) {
      if (values[i] === undefined) {
        i++;
        continue;
      }
      let end = i;
      while (end + 1 < count && values[end + 1] !== undefined) end++;
      this.drawRun(ug, { values, first: i, last: end, color, baselineValues });
      i = end + 1;
    }
    if (series.isShowLabels()) this.drawLabels(ug, values.slice(0, count), baselineValues);
  }

  /** @see AreaRenderer.java:99-105 */
  private drawLabels(ug: UGraphic, values: readonly ChartValue[], baselineValues: Baseline): void {
    for (const [k, value] of values.entries())
      if (value !== undefined)
        drawLabel(ug, this.p.skinParam, value, this.x(k), this.y(top(baselineValues, k, value)) - LABEL_OFFSET);
  }

  /** The area of the values from `first` to `last`, all present. @see AreaRenderer.java:109-142 */
  private drawRun(
    ug: UGraphic,
    r: { values: readonly ChartValue[]; first: number; last: number; color: HColor; baselineValues: Baseline },
  ): void {
    const { values, first, last, color, baselineValues } = r;
    const topOf = (i: number): XPoint2D => new XPoint2D(this.x(i), this.y(top(baselineValues, i, values[i]!)));
    const polygon = new UPolygon();
    for (let i = first; i <= last; i++) polygon.addPoint(this.x(i), this.y(top(baselineValues, i, values[i]!)));
    for (let i = last; i >= first; i--)
      polygon.addPoint(this.x(i), this.y(hasBaseline(baselineValues, i) ? baselineValues![i]! : this.p.axis.getMin()));
    ug.apply(fore(color)).apply(back(color)).draw(polygon);
    for (let i = first; i < last; i++) drawThickSegment(ug, color, topOf(i), topOf(i + 1));
  }

  /** @see AreaRenderer.java:144-147 */
  private x(i: number): number {
    return (i + CATEGORY_CENTER) * (this.p.plotWidth / this.p.categoryCount);
  }

  /** @see AreaRenderer.java:149-151 */
  private y(value: number): number {
    return plotY(this.p.axis, value, this.p.plotHeight);
  }
}

/** The base of the i-th value is the previous areas' top, where they reach it. @see AreaRenderer.java:155-157 */
function hasBaseline(baselineValues: Baseline, i: number): boolean {
  return baselineValues !== undefined && i < baselineValues.length && baselineValues[i] !== undefined;
}

/** @see AreaRenderer.java:159-163 */
function top(baselineValues: Baseline, i: number, value: number): number {
  if (hasBaseline(baselineValues, i)) return baselineValues![i]! + value;
  return value;
}
