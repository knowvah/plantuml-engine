/**
 * RadarRenderer — one spoke per category (a-axis), clockwise from 12 o'clock,
 * rings at the ticks of the radial scale (r-axis), and one filled polygon per
 * series (e8ef39dd55c).
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/chart/RadarRenderer.java
 */
import { HColors } from '../../core/klimt/color/HColors.js';
import { HColorSimple } from '../../core/klimt/color/HColorSimple.js';
import type { StringBounder } from '../../core/klimt/font/StringBounder.js';
import type { XDimension2D } from '../../core/klimt/geom/XDimension2D.js';
import type { XPoint2D } from '../../core/klimt/geom/XPoint2D.js';
import { HorizontalAlignment } from '../../core/klimt/geom/HorizontalAlignment.js';
import type { TextBlock } from '../../core/klimt/shape/TextBlock.js';
import { UEllipse } from '../../core/klimt/shape/UEllipse.js';
import { ULine } from '../../core/klimt/shape/ULine.js';
import { UPolygon } from '../../core/klimt/shape/UPolygon.js';
import type { UGraphic } from '../../core/klimt/UGraphic.js';
import { UStroke } from '../../core/klimt/UStroke.js';
import { UTranslate } from '../../core/klimt/UTranslate.js';
import type { Style } from '../../core/style/Style.js';
import type { HColor } from '../../core/style/Value.js';
import { ChartLegendBlock } from './ChartLegendBlock.js';
import { LegendPosition } from './chart-modes.js';
import type { ChartSeries, ChartValue } from './ChartSeries.js';
import type { SkinParam } from './chart-skin-param.js';
import {
  asNullable,
  back,
  displayBlock,
  fore,
  getDefaultColor,
  getGridStyleSignature,
  getPolarAxisStyleSignature,
  getRadarStyleSignature,
  getStyleSignature,
  lineColorOf,
  lineThicknessOf,
  mergedStyle,
  stereotypedStyle,
  type StyleFontConfiguration,
} from './ChartStyles.js';
import { formatValue, valueTicks } from './ChartTicks.js';
import { type Bounds, drawPolarFrame, include, outside, polar, polarDimension, POLAR_RADIUS } from './PieRenderer.js';
import type { RadarChart } from './RadarChart.js';

/** @see RadarRenderer.java:69 */
const NAME_GAP = 8;
/** @see RadarRenderer.java:71 */
const MARKER_SIZE = 6;
/** The inside's opacity, so the series below stay visible. @see RadarRenderer.java:73 */
const FILL_ALPHA = 64;
/** A ring's label, right of the first spoke. @see RadarRenderer.java:290 */
const TICK_LABEL_DX = 3;

/** `HColor#equals`: `XColor` equality for a simple colour, identity otherwise. */
function sameColor(a: HColor, b: HColor): boolean {
  return a instanceof HColorSimple ? a.equals(b) : a === b;
}

export class RadarRenderer {
  private readonly axisFont: StyleFontConfiguration;

  /** @see RadarRenderer.java:84-94 */
  constructor(
    private readonly skinParam: SkinParam,
    private readonly chart: RadarChart,
  ) {
    this.axisFont = mergedStyle(getPolarAxisStyleSignature(), skinParam).getFontConfiguration(
      skinParam.getIHtmlColorSet(),
    );
  }

  /** @see RadarRenderer.java:96-98 */
  private angle(i: number): number {
    return (2 * Math.PI * i) / this.chart.categories.length;
  }

  /** A value's distance from the centre, kept inside the scale. @see RadarRenderer.java:101-106 */
  private radius(value: number): number {
    const { axis } = this.chart;
    const range = axis.getMax() - axis.getMin();
    if (range <= 0) return 0;
    return POLAR_RADIUS * Math.max(0, Math.min(1, (value - axis.getMin()) / range));
  }

  private text(s: string): TextBlock {
    return displayBlock(this.skinParam, s, this.axisFont, HorizontalAlignment.CENTER);
  }

  /** @see RadarRenderer.java:113-115 */
  private hasLegend(): boolean {
    return this.chart.legendPosition !== LegendPosition.NONE && this.chart.series.length > 0;
  }

  /** @see RadarRenderer.java:117-122 */
  private getLegend(): ChartLegendBlock {
    const legend = new ChartLegendBlock(this.skinParam, this.chart.legendPosition);
    for (const [i, s] of this.chart.series.entries()) legend.add(s.getName(), this.getLineColor(i));
    return legend;
  }

  /** @see RadarRenderer.java:124-126 */
  private getStyle(s: ChartSeries): Style {
    return stereotypedStyle(getRadarStyleSignature(), s, this.skinParam);
  }

  /**
   * A colour the series' style gives, or `undefined` when it is only the one the
   * diagram passes down, so the series are told apart by the default colours.
   * @see RadarRenderer.java:131-138
   */
  private getStyledColor(s: ChartSeries, name: 'LineColor' | 'BackGroundColor'): HColor | undefined {
    const set = this.skinParam.getIHtmlColorSet();
    const color = asNullable(this.getStyle(s).value(name).asColor(set));
    const inherited = mergedStyle(getStyleSignature(), this.skinParam).value(name).asColor(set);
    if (color === undefined || sameColor(color, inherited)) return undefined;
    return color;
  }

  /** Explicit colour > style `LineColor` > default colour. @see RadarRenderer.java:141-149 */
  private getLineColor(index: number): HColor {
    const s = this.chart.series[index]!;
    return s.getColor() ?? this.getStyledColor(s, 'LineColor') ?? getDefaultColor(index, this.skinParam);
  }

  /** Style `BackGroundColor`, else the line colour made translucent. @see RadarRenderer.java:152-161 */
  private getFillColor(index: number, lineColor: HColor): HColor {
    const color = this.getStyledColor(this.chart.series[index]!, 'BackGroundColor');
    if (color !== undefined) return color;
    if (lineColor instanceof HColorSimple) {
      const c = lineColor.getAwtColor();
      return HColorSimple.create({ r: c.r, g: c.g, b: c.b, a: FILL_ALPHA });
    }
    return HColors.transparent();
  }

  /** The box around the rings and the categories' names. @see RadarRenderer.java:165-176 */
  private getBounds(stringBounder: StringBounder): Bounds {
    const bounds: Bounds = [-POLAR_RADIUS, -POLAR_RADIUS, POLAR_RADIUS, POLAR_RADIUS];
    for (const [i, category] of this.chart.categories.entries()) {
      const dim = this.text(category).calculateDimension(stringBounder);
      include(bounds, outside(POLAR_RADIUS + NAME_GAP, this.angle(i), dim), dim);
    }
    return bounds;
  }

  /** @see RadarRenderer.java:178-193 */
  calculateDimension(stringBounder: StringBounder): XDimension2D {
    const legend = this.hasLegend() ? this.getLegend().calculateDimension(stringBounder) : undefined;
    return polarDimension(this.getBounds(stringBounder), legend, this.chart.legendPosition);
  }

  /** @see RadarRenderer.java:195-238 */
  drawU(ug: UGraphic): void {
    const stringBounder = ug.getStringBounder();
    const layout = {
      bounds: this.getBounds(stringBounder),
      dim: this.calculateDimension(stringBounder),
      position: this.chart.legendPosition,
    };
    const ugCenter = drawPolarFrame(ug, layout, this.hasLegend() ? this.getLegend() : undefined);
    this.drawGrid(ugCenter);
    for (let i = 0; i < this.chart.series.length; i++) this.drawSeries(ugCenter, i);
    this.drawTickLabels(ugCenter);
  }

  /** The rings at the scale's ticks, then the spokes and the names at their ends. @see RadarRenderer.java:240-274 */
  private drawGrid(ug: UGraphic): void {
    const set = this.skinParam.getIHtmlColorSet();
    const gridStyle = mergedStyle(getGridStyleSignature(), this.skinParam);
    const gridColor = lineColorOf(gridStyle, this.skinParam);
    const ugGrid = ug
      .apply(fore(gridColor))
      .apply(back(HColors.transparent()))
      .apply(UStroke.withThickness(lineThicknessOf(gridStyle)));
    const { categories, circleGrid, axis } = this.chart;
    for (const tick of valueTicks(axis)) {
      const r = POLAR_RADIUS * tick.ratio;
      if (r <= 0) continue;
      if (circleGrid || categories.length < 3) ugGrid.apply(new UTranslate(-r, -r)).draw(UEllipse.build(2 * r, 2 * r));
      else ugGrid.draw(this.polygon(r));
    }

    const axisStyle = mergedStyle(getPolarAxisStyleSignature(), this.skinParam);
    const axisColor = asNullable(axisStyle.value('LineColor').asColor(set)) ?? gridColor;
    const ugAxis = ug.apply(fore(axisColor)).apply(UStroke.withThickness(lineThicknessOf(axisStyle)));
    for (const [i, category] of categories.entries()) {
      const end = polar(POLAR_RADIUS, this.angle(i));
      ugAxis.draw(new ULine(end.x, end.y));
      const name = this.text(category);
      name.drawU(
        ug.apply(outside(POLAR_RADIUS + NAME_GAP, this.angle(i), name.calculateDimension(ug.getStringBounder()))),
      );
    }
  }

  /** A ring with a corner on each spoke. @see RadarRenderer.java:277-282 */
  private polygon(r: number): UPolygon {
    const result = new UPolygon();
    for (let i = 0; i < this.chart.categories.length; i++) result.addPoint(polar(r, this.angle(i)));
    return result;
  }

  /** Each ring's value, just inside it right of the first spoke; the centre is not labelled. @see RadarRenderer.java:286-293 */
  private drawTickLabels(ug: UGraphic): void {
    for (const tick of valueTicks(this.chart.axis)) {
      if (tick.ratio <= 0) continue;
      this.text(tick.label).drawU(ug.apply(new UTranslate(TICK_LABEL_DX, -POLAR_RADIUS * tick.ratio)));
    }
  }

  /** A missing value is drawn at the centre, without a marker. @see RadarRenderer.java:295-327 */
  private drawSeries(ug: UGraphic, index: number): void {
    const s = this.chart.series[index]!;
    const seriesValues = this.chart.values[index]!;
    if (this.chart.categories.length === 0) return;
    const lineColor = this.getLineColor(index);
    const fillColor = this.getFillColor(index, lineColor);
    const thickness = lineThicknessOf(this.getStyle(s));
    const points = this.chart.categories.map((_, i) => {
      const value = seriesValues[i];
      return polar(value === undefined ? 0 : this.radius(value), this.angle(i));
    });
    ug.apply(fore(lineColor)).apply(back(fillColor)).apply(UStroke.withThickness(thickness)).draw(new UPolygon(points));
    this.drawMarkers(ug.apply(fore(lineColor)).apply(back(lineColor)), { s, seriesValues, points }, ug);
  }

  /** @see RadarRenderer.java:313-326 */
  private drawMarkers(
    ugMarker: UGraphic,
    d: { s: ChartSeries; seriesValues: readonly ChartValue[]; points: readonly XPoint2D[] },
    ug: UGraphic,
  ): void {
    for (const [i, pt] of d.points.entries()) {
      const value = d.seriesValues[i];
      if (value === undefined) continue;
      ugMarker
        .apply(new UTranslate(pt.x - MARKER_SIZE / 2, pt.y - MARKER_SIZE / 2))
        .draw(UEllipse.build(MARKER_SIZE, MARKER_SIZE));
      if (!d.s.isShowLabels()) continue;
      const text = this.text(formatValue(value));
      const dim = text.calculateDimension(ug.getStringBounder());
      text.drawU(ug.apply(outside(this.radius(value) + MARKER_SIZE, this.angle(i), dim)));
    }
  }
}
