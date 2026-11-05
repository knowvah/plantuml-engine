/**
 * ChartRenderer — the frame: `calculateDimension`, `drawU`, `drawSeries`. The axes,
 * legend, annotations and styles live beside it under the hooks (D5). Both constructor
 * arms upstream store the same fields, so the orientation swap is
 * `ChartDiagram#getRenderer`'s.
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/chart/ChartRenderer.java
 */
import type { StringBounder } from '../../core/klimt/font/StringBounder.js';
import { XDimension2D } from '../../core/klimt/geom/XDimension2D.js';
import type { UGraphic } from '../../core/klimt/UGraphic.js';
import { UStroke } from '../../core/klimt/UStroke.js';
import { UTranslate } from '../../core/klimt/UTranslate.js';
import type { HColor } from '../../core/style/Value.js';
import { AreaRenderer } from './AreaRenderer.js';
import { BarRenderer } from './BarRenderer.js';
import type { ChartAxis } from './ChartAxis.js';
import { LegendPosition, Orientation, StackMode } from './chart-modes.js';
import {
  drawCategoriesVerticallyOnLeft,
  drawGridLines,
  drawXAxis,
  drawYAxis,
  drawYAxisHorizontally,
} from './ChartRendererAxes.js';
import { drawAnnotations } from './ChartRendererAnnotations.js';
import { calculateLegendDimension, drawLegend } from './ChartRendererLegend.js';
import { SeriesType, type ChartSeries } from './ChartSeries.js';
import {
  asNullable,
  AXIS_LABEL_SPACE,
  fore,
  getAreaStyle,
  getBarStyle,
  getDefaultColor,
  getLineStyle,
  getScatterStyle,
  getStyleSignature,
  LEGEND_MARGIN,
  lineColorOf,
  MARGIN,
  mergedStyle,
  TITLE_SPACE,
  type ChartRendererState,
} from './ChartStyles.js';
import { LineRenderer } from './LineRenderer.js';
import { ScatterRenderer } from './ScatterRenderer.js';

/** `Math.max(400, labels * 60)`. @see ChartRenderer.java:926 */
const MIN_PLOT_WIDTH = 400;
/** @see ChartRenderer.java:926 */
const PLOT_WIDTH_PER_LABEL = 60;
/** @see ChartRenderer.java:930 */
const PLOT_HEIGHT = 300;
/** Extra height when the x-axis has a title. @see ChartRenderer.java:142 */
const X_AXIS_TITLE_SPACE = 20;
/** The outer stroke. @see ChartRenderer.java:164 */
const OUTER_THICKNESS = 1.0;

export class ChartRenderer {
  constructor(private readonly s: ChartRendererState) {}

  /** @see ChartRenderer.java:925-927 */
  private getPlotWidth(): number {
    return Math.max(MIN_PLOT_WIDTH, this.s.xAxisLabels.length * PLOT_WIDTH_PER_LABEL);
  }

  /** @see ChartRenderer.java:929-931 */
  private getPlotHeight(): number {
    return PLOT_HEIGHT;
  }

  /** @see ChartRenderer.java:135-153 */
  calculateDimension(stringBounder: StringBounder): XDimension2D {
    const { y2Axis, xAxisTitle, legendPosition } = this.s;
    const legendDim = calculateLegendDimension(this.s, stringBounder);
    let width =
      MARGIN + AXIS_LABEL_SPACE + this.getPlotWidth() + (y2Axis !== undefined ? AXIS_LABEL_SPACE : 0) + MARGIN;
    let height = MARGIN + TITLE_SPACE + this.getPlotHeight() + AXIS_LABEL_SPACE + MARGIN;

    if (xAxisTitle !== undefined && xAxisTitle !== '') height += X_AXIS_TITLE_SPACE;

    if (legendPosition === LegendPosition.LEFT || legendPosition === LegendPosition.RIGHT)
      width += legendDim.getWidth() + LEGEND_MARGIN;
    else if (legendPosition === LegendPosition.TOP || legendPosition === LegendPosition.BOTTOM)
      height += legendDim.getHeight() + LEGEND_MARGIN;

    return new XDimension2D(width, height);
  }

  /** The x-axis at zero, when the y range includes it. @see ChartRenderer.java:181-190 */
  private xAxisYOf(topMargin: number, plotHeight: number): number {
    const { orientation, yAxis } = this.s;
    if (orientation !== Orientation.HORIZONTAL && yAxis.getMin() <= 0 && yAxis.getMax() >= 0) {
      const zeroRatio = (0 - yAxis.getMin()) / (yAxis.getMax() - yAxis.getMin());
      return topMargin + plotHeight * (1.0 - zeroRatio);
    }
    return topMargin + plotHeight;
  }

  /** The y-axis at zero, when the x range includes it. @see ChartRenderer.java:192-201 */
  private yAxisXOf(leftMargin: number, plotWidth: number): number {
    const { orientation, xAxis } = this.s;
    if (orientation !== Orientation.HORIZONTAL && xAxis !== undefined && xAxis.getMin() <= 0 && xAxis.getMax() >= 0)
      return leftMargin + xAxis.valueToPixel(0, 0, plotWidth);
    return leftMargin;
  }

  /** @see ChartRenderer.java:155-238 */
  drawU(ugIn: UGraphic): void {
    const { skinParam, legendPosition, orientation, y2Axis, yAxis } = this.s;
    const set = skinParam.getIHtmlColorSet();
    const style = mergedStyle(getStyleSignature(), skinParam);
    const lineColor = lineColorOf(style, skinParam);
    const fontColor = style.value('FontColor').asColor(set);

    const ug = ugIn.apply(fore(lineColor)).apply(UStroke.withThickness(OUTER_THICKNESS));

    const legendDim = calculateLegendDimension(this.s, ug.getStringBounder());
    let leftMargin = MARGIN + AXIS_LABEL_SPACE;
    let topMargin = MARGIN + TITLE_SPACE;
    const plotWidth = this.getPlotWidth();
    const plotHeight = this.getPlotHeight();

    if (legendPosition === LegendPosition.LEFT) leftMargin += legendDim.getWidth() + LEGEND_MARGIN;
    else if (legendPosition === LegendPosition.TOP) topMargin += legendDim.getHeight() + LEGEND_MARGIN;

    const at = (dx: number, dy: number): UGraphic => ug.apply(UTranslate.dx(dx).compose(UTranslate.dy(dy)));

    if (orientation === Orientation.HORIZONTAL) {
      drawCategoriesVerticallyOnLeft(this.s, at(leftMargin, topMargin), plotHeight, fontColor);
      drawYAxisHorizontally(this.s, at(leftMargin, topMargin + plotHeight), {
        width: plotWidth,
        axis: yAxis,
        fontColor,
      });
    } else {
      const xAxisY = this.xAxisYOf(topMargin, plotHeight);
      const yAxisX = this.yAxisXOf(leftMargin, plotWidth);
      const yArgs = { height: plotHeight, width: plotWidth, lineColor };
      drawYAxis(this.s, at(yAxisX, topMargin), { ...yArgs, axis: yAxis, leftSide: true });
      if (y2Axis !== undefined)
        drawYAxis(this.s, at(leftMargin + plotWidth, topMargin), { ...yArgs, axis: y2Axis, leftSide: false });
      drawXAxis(this.s, at(leftMargin, xAxisY), { width: plotWidth, height: plotHeight, lineColor });
    }

    const ugPlot = at(leftMargin, topMargin);
    drawGridLines(this.s, ugPlot, { plotWidth, plotHeight, lineColor });
    this.drawSeries(ugPlot, plotWidth, plotHeight);
    drawAnnotations(this.s, ugPlot, { plotWidth, plotHeight }, lineColor);
    drawLegend(this.s, ug, { leftMargin, topMargin, plotWidth, plotHeight });
  }

  /** The series' axis: y2 only when it asks and one exists. */
  private axisOf(s: ChartSeries): ChartAxis {
    return s.isUseSecondaryAxis() && this.s.y2Axis !== undefined ? this.s.y2Axis : this.s.yAxis;
  }

  /** The colour priority `drawSeries` gives a bar: explicit, style, then the dead default. @see ChartRenderer.java:792-803 */
  private barColorOf(s: ChartSeries): HColor {
    const { skinParam, series } = this.s;
    const fromStyle = getBarStyle(s, skinParam).value('BackGroundColor').asColor(skinParam.getIHtmlColorSet());
    return s.getColor() ?? asNullable(fromStyle) ?? getDefaultColor(series.indexOf(s), skinParam);
  }

  /** @see ChartRenderer.java:806-826 */
  private drawBars(ug: UGraphic, plotWidth: number, plotHeight: number): void {
    const { series, skinParam, xAxisLabels, orientation, stackMode } = this.s;
    const barSeries = series.filter((s) => s.getType() === SeriesType.BAR);
    if (barSeries.length === 0) return;
    const barColors = barSeries.map((s) => this.barColorOf(s));
    const barRenderer = new BarRenderer({
      skinParam,
      plotWidth,
      plotHeight,
      categoryCount: xAxisLabels.length,
      axis: this.axisOf(barSeries[0]!),
      horizontal: orientation === Orientation.HORIZONTAL,
    });
    if (barSeries.length === 1) barRenderer.draw(ug, barSeries[0]!, barColors[0]!);
    else if (stackMode === StackMode.STACKED) barRenderer.drawStacked(ug, barSeries, barColors);
    else barRenderer.drawGrouped(ug, barSeries, barColors);
  }

  /** A line or scatter's colour: explicit, `LineColor`, then the dead default. @see ChartRenderer.java:869-878 */
  private lineOrScatterColorOf(s: ChartSeries): HColor {
    const { skinParam, series } = this.s;
    const style = s.getType() === SeriesType.LINE ? getLineStyle(s, skinParam) : getScatterStyle(s, skinParam);
    return s.getColor() ?? asNullable(lineColorOf(style, skinParam)) ?? getDefaultColor(series.indexOf(s), skinParam);
  }

  /** An area's colour: explicit, `BackGroundColor`, then two dead fallbacks. @see ChartRenderer.java:839-850 */
  private areaColorOf(s: ChartSeries): HColor {
    const { skinParam, series } = this.s;
    const areaStyle = getAreaStyle(s, skinParam);
    return (
      s.getColor() ??
      asNullable(areaStyle.value('BackGroundColor').asColor(skinParam.getIHtmlColorSet())) ??
      asNullable(lineColorOf(areaStyle, skinParam)) ??
      getDefaultColor(series.indexOf(s), skinParam)
    );
  }

  /** @see ChartRenderer.java:852-889 */
  private drawLineOrScatter(ug: UGraphic, s: ChartSeries, plotWidth: number, plotHeight: number): void {
    const { skinParam, xAxisLabels, xAxis } = this.s;
    const base = { plotWidth, plotHeight, categoryCount: xAxisLabels.length, axis: this.axisOf(s), xAxis };
    const color = this.lineOrScatterColorOf(s);
    if (s.getType() === SeriesType.LINE) new LineRenderer(base).draw(ug, s, color);
    else new ScatterRenderer({ ...base, skinParam }).draw(ug, s, color);
  }

  /** @see ChartRenderer.java:892-922 */
  private drawAreas(ug: UGraphic, areaSeries: readonly ChartSeries[], plotWidth: number, plotHeight: number): void {
    if (areaSeries.length === 0) return;
    const { skinParam, xAxisLabels } = this.s;
    const areaRenderer = new AreaRenderer({
      skinParam,
      plotWidth,
      plotHeight,
      categoryCount: xAxisLabels.length,
      axis: this.axisOf(areaSeries[0]!),
    });

    let cumulativeValues: number[] | undefined = undefined;
    for (const areaSer of areaSeries) {
      areaRenderer.draw(ug, areaSer, this.areaColorOf(areaSer), cumulativeValues);
      cumulativeValues = addToCumulative(cumulativeValues, areaSer.getValues());
    }
  }

  /** Bars first whatever the source order, then line and scatter in order, then areas. @see ChartRenderer.java:775-923 */
  private drawSeries(ug: UGraphic, plotWidth: number, plotHeight: number): void {
    const { series, xAxisLabels } = this.s;
    const hasCoordinatePairs = series[0]?.hasExplicitXValues() === true;
    if ((xAxisLabels.length === 0 && !hasCoordinatePairs) || series.length === 0) return;

    this.drawBars(ug, plotWidth, plotHeight);
    for (const s of series) {
      if (s.getType() === SeriesType.LINE || s.getType() === SeriesType.SCATTER)
        this.drawLineOrScatter(ug, s, plotWidth, plotHeight);
    }
    this.drawAreas(
      ug,
      series.filter((s) => s.getType() === SeriesType.AREA),
      plotWidth,
      plotHeight,
    );
  }
}

/** A copy of the first area's values, then grown per `:908-920`. */
function addToCumulative(cumulative: number[] | undefined, values: readonly number[]): number[] {
  if (cumulative === undefined) return [...values];
  for (let j = 0; j < Math.min(values.length, cumulative.length); j++) cumulative[j]! += values[j]!;
  for (let j = cumulative.length; j < values.length; j++) cumulative.push(values[j]!);
  return cumulative;
}
