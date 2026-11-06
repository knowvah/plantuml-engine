/**
 * LineRenderer — one `ULine` per segment at stroke 2.0. Upstream's `xAxis == null`
 * safety check prints to `System.err` and returns; `xAxis` is never null
 * (`ChartDiagram.java:74`), so the guard stays and the print does not.
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/chart/LineRenderer.java
 */
import { ULine } from '../../core/klimt/shape/ULine.js';
import type { UGraphic } from '../../core/klimt/UGraphic.js';
import { UStroke } from '../../core/klimt/UStroke.js';
import { UTranslate } from '../../core/klimt/UTranslate.js';
import type { HColor } from '../../core/style/Value.js';
import type { ChartAxis } from './ChartAxis.js';
import type { ChartSeries } from './ChartSeries.js';
import { fore, plotY } from './ChartStyles.js';

/** @see LineRenderer.java:94 */
export const LINE_THICKNESS = 2.0;
/** A category's centre. @see LineRenderer.java:105 */
const CATEGORY_CENTER = 0.5;

/** The constructor, grouped for the parameter hook; `skinParam` is unused upstream. @see LineRenderer.java:55-63 */
export interface LineRendererParams {
  readonly plotWidth: number;
  readonly plotHeight: number;
  readonly categoryCount: number;
  readonly axis: ChartAxis;
  readonly xAxis: ChartAxis | undefined;
}

export class LineRenderer {
  constructor(private readonly p: LineRendererParams) {}

  /** @see LineRenderer.java:65-115 */
  draw(ug: UGraphic, series: ChartSeries, color: HColor): void {
    const { categoryCount } = this.p;
    if (categoryCount === 0 && !series.hasExplicitXValues()) return;
    if (series.hasExplicitXValues()) this.drawCoordinatePairs(ug, series, color);
    else this.drawIndexed(ug, series, color);
  }

  /** @see LineRenderer.java:71-95 */
  private drawCoordinatePairs(ug: UGraphic, series: ChartSeries, color: HColor): void {
    const { xAxis, axis, plotWidth, plotHeight } = this.p;
    if (xAxis === undefined) return;
    const values = series.getValues();
    const xValues = series.getXValues()!;
    for (let i = 0; i < values.length - 1; i++) {
      const x1 = xAxis.valueToPixel(xValues[i]!, 0, plotWidth);
      const y1 = plotY(axis, values[i]!, plotHeight);
      const x2 = xAxis.valueToPixel(xValues[i + 1]!, 0, plotWidth);
      const y2 = plotY(axis, values[i + 1]!, plotHeight);
      drawSegment(ug, color, { x1, y1, x2, y2 });
    }
  }

  /** @see LineRenderer.java:96-114 */
  private drawIndexed(ug: UGraphic, series: ChartSeries, color: HColor): void {
    const { categoryCount, axis, plotWidth, plotHeight } = this.p;
    const values = series.getValues();
    const categoryWidth = plotWidth / categoryCount;
    for (let i = 0; i < Math.min(values.length - 1, categoryCount - 1); i++) {
      const x1 = (i + CATEGORY_CENTER) * categoryWidth;
      const y1 = plotY(axis, values[i]!, plotHeight);
      const x2 = (i + 1 + CATEGORY_CENTER) * categoryWidth;
      const y2 = plotY(axis, values[i + 1]!, plotHeight);
      drawSegment(ug, color, { x1, y1, x2, y2 });
    }
  }
}

/** One segment, as `LineRenderer` and `AreaRenderer` draw it. @see LineRenderer.java:93-94 */
export function drawSegment(ug: UGraphic, color: HColor, s: { x1: number; y1: number; x2: number; y2: number }): void {
  ug.apply(fore(color))
    .apply(UStroke.withThickness(LINE_THICKNESS))
    .apply(UTranslate.dx(s.x1).compose(UTranslate.dy(s.y1)))
    .draw(new ULine(s.x2 - s.x1, s.y2 - s.y1));
}
