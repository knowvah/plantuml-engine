/**
 * LineRenderer — one `ULine` per segment at the style's `LineThickness`
 * (a0b2949242b), a natural spline for `interpolate` (b42fd8313ee), one segment
 * across each missing value for `connect` (52426da82b1), else a gap at a missing
 * value (f44b054d131). Upstream's `xAxis == null` check prints to `System.err`
 * and returns; `xAxis` is never null, so the guard stays and the print does not.
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/chart/LineRenderer.java
 */
import { HColors } from '../../core/klimt/color/HColors.js';
import { naturalSplineThrough } from '../../core/klimt/geom/NaturalSpline.js';
import { XPoint2D } from '../../core/klimt/geom/XPoint2D.js';
import { ULine } from '../../core/klimt/shape/ULine.js';
import { UPath } from '../../core/klimt/shape/UPath.js';
import type { UGraphic } from '../../core/klimt/UGraphic.js';
import { UStroke } from '../../core/klimt/UStroke.js';
import { UTranslate } from '../../core/klimt/UTranslate.js';
import type { HColor } from '../../core/style/Value.js';
import type { ChartAxis } from './ChartAxis.js';
import type { ChartSeries, ChartValue } from './ChartSeries.js';
import type { SkinParam } from './chart-skin-param.js';
import { back, drawLabel, fore, plotY } from './ChartStyles.js';

/** The area top line's stroke. @see AreaRenderer.java:140 */
export const LINE_THICKNESS = 2.0;
/** A category's centre. @see LineRenderer.java:153 */
const CATEGORY_CENTER = 0.5;
/** A label's gap above its point. @see LineRenderer.java:213 */
const LABEL_GAP = 5;

/** The constructor, grouped for the parameter hook. @see LineRenderer.java:69-78 */
export interface LineRendererParams {
  readonly skinParam: SkinParam;
  readonly plotWidth: number;
  readonly plotHeight: number;
  readonly categoryCount: number;
  readonly axis: ChartAxis;
  readonly xAxis: ChartAxis | undefined;
}

export class LineRenderer {
  constructor(private readonly p: LineRendererParams) {}

  /** The labels come last, so that the line does not cross them. @see LineRenderer.java:80-85 */
  draw(ug: UGraphic, series: ChartSeries, color: HColor, lineThickness: number): void {
    this.drawLine(ug, series, color, lineThickness);
    if (series.isShowLabels()) this.drawLabels(ug, series);
  }

  /** @see LineRenderer.java:87-169 */
  private drawLine(ug: UGraphic, series: ChartSeries, color: HColor, lineThickness: number): void {
    if (this.p.categoryCount === 0 && !series.hasExplicitXValues()) return;
    const stroke = UStroke.withThickness(lineThickness);
    if (series.isInterpolate() && this.drawCurve(ug, series, color, stroke)) return;
    if (series.isConnect()) {
      const points = this.points(series);
      for (let i = 0; i < points.length - 1; i++) drawSegment(ug, color, stroke, [points[i]!, points[i + 1]!]);
      return;
    }
    if (series.hasExplicitXValues()) this.drawCoordinatePairs(ug, series, color, stroke);
    else this.drawIndexed(ug, series, color, stroke);
  }

  /** The natural spline through the points; false when it cannot be built. @see LineRenderer.java:92-103 */
  private drawCurve(ug: UGraphic, series: ChartSeries, color: HColor, stroke: UStroke): boolean {
    const curves = naturalSplineThrough(this.points(series));
    if (curves.length === 0) return false;
    const curve = UPath.none();
    curve.moveTo(curves[0]!.x1, curves[0]!.y1);
    for (const b of curves) curve.cubicTo(b.ctrlx1, b.ctrly1, b.ctrlx2, b.ctrly2, b.x2, b.y2);
    ug.apply(fore(color)).apply(stroke).apply(back(HColors.none())).draw(curve);
    return true;
  }

  /** A missing value (spread over an h-axis range) leaves a gap. @see LineRenderer.java:117-146 */
  private drawCoordinatePairs(ug: UGraphic, series: ChartSeries, color: HColor, stroke: UStroke): void {
    const { xAxis, axis, plotWidth, plotHeight } = this.p;
    if (xAxis === undefined) return;
    const values = series.getValues();
    const xValues = series.getXValues()!;
    for (let i = 0; i < values.length - 1; i++) {
      const [v1, v2] = [values[i], values[i + 1]];
      if (v1 === undefined || v2 === undefined) continue;
      const p1 = new XPoint2D(xAxis.valueToPixel(xValues[i]!, 0, plotWidth), plotY(axis, v1, plotHeight));
      const p2 = new XPoint2D(xAxis.valueToPixel(xValues[i + 1]!, 0, plotWidth), plotY(axis, v2, plotHeight));
      drawSegment(ug, color, stroke, [p1, p2]);
    }
  }

  /** No segment touches a missing value, so the line has a gap there. @see LineRenderer.java:147-168 */
  private drawIndexed(ug: UGraphic, series: ChartSeries, color: HColor, stroke: UStroke): void {
    const { categoryCount, axis, plotWidth, plotHeight } = this.p;
    const values = series.getValues();
    const categoryWidth = plotWidth / categoryCount;
    for (let i = 0; i < Math.min(values.length - 1, categoryCount - 1); i++) {
      const [v1, v2] = [values[i], values[i + 1]];
      if (v1 === undefined || v2 === undefined) continue;
      const p1 = new XPoint2D((i + CATEGORY_CENTER) * categoryWidth, plotY(axis, v1, plotHeight));
      const p2 = new XPoint2D((i + 1 + CATEGORY_CENTER) * categoryWidth, plotY(axis, v2, plotHeight));
      drawSegment(ug, color, stroke, [p1, p2]);
    }
  }

  /** The points of the series in pixels, missing values left out. @see LineRenderer.java:172-192 */
  private points(series: ChartSeries): XPoint2D[] {
    const { xAxis, plotWidth, categoryCount } = this.p;
    const values = series.getValues();
    const xValues = series.getXValues();
    if (xValues !== undefined) {
      if (xAxis === undefined) return [];
      return this.present(values, values.length, (i) => xAxis.valueToPixel(xValues[i]!, 0, plotWidth));
    }
    const categoryWidth = plotWidth / categoryCount;
    return this.present(values, Math.min(values.length, categoryCount), (i) => (i + CATEGORY_CENTER) * categoryWidth);
  }

  /** The first `count` present values at their x. */
  private present(values: readonly ChartValue[], count: number, xOf: (i: number) => number): XPoint2D[] {
    const result: XPoint2D[] = [];
    for (let i = 0; i < count; i++) {
      const value = values[i];
      if (value !== undefined) result.push(new XPoint2D(xOf(i), plotY(this.p.axis, value, this.p.plotHeight)));
    }
    return result;
  }

  /** The value of each point, above it; a missing value has no label. @see LineRenderer.java:195-215 */
  private drawLabels(ug: UGraphic, series: ChartSeries): void {
    const { categoryCount, axis, xAxis, plotWidth, plotHeight, skinParam } = this.p;
    const values = series.getValues();
    const xValues = series.getXValues();
    if (xValues !== undefined && xAxis === undefined) return;
    const count = xValues !== undefined ? values.length : Math.min(values.length, categoryCount);
    const categoryWidth = categoryCount === 0 ? 0 : plotWidth / categoryCount;
    for (let i = 0; i < count; i++) {
      const value = values[i];
      if (value === undefined) continue;
      const x =
        xValues !== undefined ? xAxis!.valueToPixel(xValues[i]!, 0, plotWidth) : (i + CATEGORY_CENTER) * categoryWidth;
      drawLabel(ug, skinParam, value, x, plotY(axis, value, plotHeight) - LABEL_GAP);
    }
  }
}

/** One segment from `p1` to `p2`. @see LineRenderer.java:108-110 */
function drawSegment(ug: UGraphic, color: HColor, stroke: UStroke, segment: readonly [XPoint2D, XPoint2D]): void {
  const [p1, p2] = segment;
  ug.apply(fore(color))
    .apply(stroke)
    .apply(UTranslate.dx(p1.x).compose(UTranslate.dy(p1.y)))
    .draw(new ULine(p2.x - p1.x, p2.y - p1.y));
}

/** A segment at stroke 2.0, as `AreaRenderer` draws its top line. @see AreaRenderer.java:138-141 */
export function drawThickSegment(ug: UGraphic, color: HColor, p1: XPoint2D, p2: XPoint2D): void {
  drawSegment(ug, color, UStroke.withThickness(LINE_THICKNESS), [p1, p2]);
}
