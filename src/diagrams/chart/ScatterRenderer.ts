/**
 * ScatterRenderer. `getScatterStyle` here does NOT merge `forStereotypeItself`.
 * The marker colour is the inline colour, else a `MarkerColor` the style sets
 * (`Style.hasValue`), else the series colour `ChartRenderer` computed (#2965); an
 * unset `MarkerColor` answers `ValueNull`'s black, so it is never read unguarded.
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/chart/ScatterRenderer.java
 */
import { UEllipse } from '../../core/klimt/shape/UEllipse.js';
import { UPolygon } from '../../core/klimt/shape/UPolygon.js';
import { URectangle } from '../../core/klimt/shape/URectangle.js';
import type { UGraphic } from '../../core/klimt/UGraphic.js';
import { UTranslate } from '../../core/klimt/UTranslate.js';
import type { Style } from '../../core/style/Style.js';
import type { HColor } from '../../core/style/Value.js';
import type { ChartAxis } from './ChartAxis.js';
import { MarkerShape, type ChartSeries } from './ChartSeries.js';
import type { SkinParam } from './chart-skin-param.js';
import { asNullable, back, drawLabel, fore, getScatterStyleSignature, mergedStyle, plotY } from './ChartStyles.js';

/** @see ScatterRenderer.java:115 */
const DEFAULT_MARKER_SIZE = 8.0;
/** A label's anchor above a marker's edge. @see ScatterRenderer.java:162 */
const LABEL_OFFSET = 8;
/** A category's centre. @see ScatterRenderer.java:172 */
const CATEGORY_CENTER = 0.5;

/** The constructor, grouped for the parameter hook. @see ScatterRenderer.java:69-77 */
export interface ScatterRendererParams {
  readonly skinParam: SkinParam;
  readonly plotWidth: number;
  readonly plotHeight: number;
  readonly categoryCount: number;
  readonly axis: ChartAxis;
  readonly xAxis: ChartAxis | undefined;
}

/**
 * The style's `MarkerShape`: a string switch ignoring unknown values, shared with
 * `drawLegend`, which has the same arms.
 * @see ScatterRenderer.java:125-144
 */
export function markerShapeOf(style: Style, series: ChartSeries): MarkerShape {
  switch (style.value('MarkerShape').asString()?.toLowerCase()) {
    case 'circle':
      return MarkerShape.CIRCLE;
    case 'square':
      return MarkerShape.SQUARE;
    case 'triangle':
      return MarkerShape.TRIANGLE;
    default:
      return series.getMarkerShape();
  }
}

export class ScatterRenderer {
  constructor(private readonly p: ScatterRendererParams) {}

  /** @see ScatterRenderer.java:79-90 */
  private getScatterStyle(series: ChartSeries): Style {
    const signature = getScatterStyleSignature();
    const stereotype = series.getStereotype();
    if (stereotype !== undefined) return mergedStyle(signature.withTOBECHANGED(stereotype), this.p.skinParam);
    return mergedStyle(signature, this.p.skinParam);
  }

  /** @see ScatterRenderer.java:92-183 */
  draw(ug: UGraphic, series: ChartSeries, color: HColor): void {
    const { categoryCount, skinParam } = this.p;
    if (categoryCount === 0 && !series.hasExplicitXValues()) return;

    const scatterStyle = this.getScatterStyle(series);
    const set = skinParam.getIHtmlColorSet();
    // Marker colour: inline > MarkerColor > the series colour. @see ScatterRenderer.java:102-105 (c7e65a2d642)
    const markerColor =
      series.getColor() === undefined && scatterStyle.hasValue('MarkerColor')
        ? (asNullable(scatterStyle.value('MarkerColor').asColor(set)) ?? color)
        : color;
    // Label colour: inline > FontColor. @see ScatterRenderer.java:107-109 (f4c38043a26)
    const labelColor = series.getColor() ?? asNullable(scatterStyle.value('FontColor').asColor(set)) ?? color;
    const markerSize = markerSizeOf(scatterStyle);
    const markerShape = markerShapeOf(scatterStyle, series);

    const marker = { color: markerColor, size: markerSize, shape: markerShape };
    this.drawPoints(ug, series, marker, labelColor);
  }

  /** The markers, a missing value leaving its place empty (f44b054d131, 9cfe7a05d1b). @see ScatterRenderer.java:140-187 */
  private drawPoints(ug: UGraphic, series: ChartSeries, marker: Omit<MarkerArgs, 'x' | 'y'>, labelColor: HColor): void {
    const { categoryCount, skinParam, axis, plotHeight, plotWidth } = this.p;
    const values = series.getValues();
    const xValues = series.getXValues();
    const count = xValues !== undefined ? values.length : Math.min(values.length, categoryCount);
    const categoryWidth = plotWidth / categoryCount;

    for (let i = 0; i < count; i++) {
      const value = values[i];
      if (value === undefined) continue;
      const x =
        xValues !== undefined
          ? this.p.xAxis!.valueToPixel(xValues[i]!, 0, plotWidth)
          : (i + CATEGORY_CENTER) * categoryWidth;
      const y = plotY(axis, value, plotHeight);

      drawMarker(ug, { ...marker, x, y });
      if (series.isShowLabels()) drawLabel(ug, skinParam, value, x, y - marker.size / 2 - LABEL_OFFSET, labelColor);
    }
  }
}

/** `MarkerSize` under `> 0`; Java's `catch` covers a non-numeric value. @see ScatterRenderer.java:114-123 */
function markerSizeOf(style: Style): number {
  try {
    const styleMarkerSize = style.value('MarkerSize').asDouble();
    if (styleMarkerSize > 0) return styleMarkerSize;
  } catch {
    // Use default, as Java's `catch (Exception e)` does.
  }
  return DEFAULT_MARKER_SIZE;
}

/** `drawMarker` and `ChartRenderer#drawLegendScatterMarker`, which draws the same three shapes. */
export interface MarkerArgs {
  readonly color: HColor;
  readonly x: number;
  readonly y: number;
  readonly size: number;
  readonly shape: MarkerShape;
}

/** @see ScatterRenderer.java:185-218 */
export function drawMarker(ug: UGraphic, m: MarkerArgs): void {
  const { color, x, y, size, shape } = m;
  const painted = ug.apply(fore(color)).apply(back(color));
  if (shape === MarkerShape.TRIANGLE) {
    const triangle = new UPolygon();
    triangle.addPoint(0, -size / 2);
    triangle.addPoint(-size / 2, size / 2);
    triangle.addPoint(size / 2, size / 2);
    painted.apply(UTranslate.dx(x).compose(UTranslate.dy(y))).draw(triangle);
    return;
  }
  const at = painted.apply(UTranslate.dx(x - size / 2).compose(UTranslate.dy(y - size / 2)));
  at.draw(shape === MarkerShape.SQUARE ? URectangle.build(size, size) : UEllipse.build(size, size));
}
