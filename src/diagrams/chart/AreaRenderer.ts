/**
 * AreaRenderer — a polygon, top then bottom, drawn with no stroke set, so it
 * inherits the outer 1.0; then its top line at 2.0; then labels at `y - 8`.
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/chart/AreaRenderer.java
 */
import { UPolygon } from '../../core/klimt/shape/UPolygon.js';
import type { UGraphic } from '../../core/klimt/UGraphic.js';
import type { HColor } from '../../core/style/Value.js';
import type { ChartAxis } from './ChartAxis.js';
import type { ChartSeries } from './ChartSeries.js';
import type { SkinParam } from './chart-skin-param.js';
import { back, drawLabel, fore, plotY } from './ChartStyles.js';
import { drawSegment } from './LineRenderer.js';

/** A category's centre. @see AreaRenderer.java:94 */
const CATEGORY_CENTER = 0.5;
/** A label's anchor above the area. @see AreaRenderer.java:151 */
const LABEL_OFFSET = 8;

/** The constructor, grouped for the parameter hook. @see AreaRenderer.java:63-70 */
export interface AreaRendererParams {
  readonly skinParam: SkinParam;
  readonly plotWidth: number;
  readonly plotHeight: number;
  readonly categoryCount: number;
  readonly axis: ChartAxis;
}

export class AreaRenderer {
  constructor(private readonly p: AreaRendererParams) {}

  /** @see AreaRenderer.java:76-154 */
  draw(ug: UGraphic, series: ChartSeries, color: HColor, baselineValues: readonly number[] | undefined): void {
    const { categoryCount, plotWidth } = this.p;
    if (categoryCount === 0) return;

    const values = series.getValues();
    const categoryWidth = plotWidth / categoryCount;

    ug.apply(fore(color))
      .apply(back(color))
      .draw(this.polygonOf(values, categoryWidth, baselineValues));
    this.drawTopLine(ug, { values, categoryWidth, baselineValues, color });
    if (series.isShowLabels()) this.drawLabels(ug, { values, categoryWidth, baselineValues });
  }

  /** `value` on top of the previous series, where there is one. @see AreaRenderer.java:90-93 */
  private topValue(value: number, i: number, baselineValues: readonly number[] | undefined): number {
    return baselineValues !== undefined && i < baselineValues.length ? baselineValues[i]! + value : value;
  }

  /** @see AreaRenderer.java:83-108 */
  private polygonOf(
    values: readonly number[],
    categoryWidth: number,
    baselineValues: readonly number[] | undefined,
  ): UPolygon {
    const { categoryCount, axis, plotHeight } = this.p;
    const count = Math.min(values.length, categoryCount);
    const polygon = new UPolygon();
    for (let i = 0; i < count; i++) {
      const topValue = this.topValue(values[i]!, i, baselineValues);
      polygon.addPoint((i + CATEGORY_CENTER) * categoryWidth, plotY(axis, topValue, plotHeight));
    }
    for (let i = count - 1; i >= 0; i--) {
      const baselineValue =
        baselineValues !== undefined && i < baselineValues.length ? baselineValues[i]! : axis.getMin();
      polygon.addPoint((i + CATEGORY_CENTER) * categoryWidth, plotY(axis, baselineValue, plotHeight));
    }
    return polygon;
  }

  /** @see AreaRenderer.java:113-138 */
  private drawTopLine(
    ug: UGraphic,
    a: {
      values: readonly number[];
      categoryWidth: number;
      baselineValues: readonly number[] | undefined;
      color: HColor;
    },
  ): void {
    const { categoryCount, axis, plotHeight } = this.p;
    const { values, categoryWidth, baselineValues, color } = a;
    for (let i = 0; i < Math.min(values.length - 1, categoryCount - 1); i++) {
      const topValue1 = this.topValue(values[i]!, i, baselineValues);
      const topValue2 = this.topValue(values[i + 1]!, i + 1, baselineValues);
      drawSegment(ug, color, {
        x1: (i + CATEGORY_CENTER) * categoryWidth,
        y1: plotY(axis, topValue1, plotHeight),
        x2: (i + 1 + CATEGORY_CENTER) * categoryWidth,
        y2: plotY(axis, topValue2, plotHeight),
      });
    }
  }

  /** @see AreaRenderer.java:140-153 */
  private drawLabels(
    ug: UGraphic,
    a: { values: readonly number[]; categoryWidth: number; baselineValues: readonly number[] | undefined },
  ): void {
    const { categoryCount, axis, plotHeight, skinParam } = this.p;
    const { values, categoryWidth, baselineValues } = a;
    for (let i = 0; i < Math.min(values.length, categoryCount); i++) {
      const value = values[i]!;
      const x = (i + CATEGORY_CENTER) * categoryWidth;
      const y = plotY(axis, this.topValue(value, i, baselineValues), plotHeight);
      drawLabel(ug, skinParam, value, x, y - LABEL_OFFSET);
    }
  }
}
