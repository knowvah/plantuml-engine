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
import { BarRenderer, type BarSlice } from './BarRenderer.js';
import type { CartesianChart } from './CartesianChart.js';
import type { SkinParam } from './chart-skin-param.js';
import { LegendPosition, Orientation, StackMode } from './chart-modes.js';
import { StackLayout } from './StackLayout.js';
import {
  drawCategoriesVerticallyOnLeft,
  drawGridLines,
  drawXAxis,
  drawYAxis,
  drawYAxisHorizontally,
  getYAxisSpace,
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
  lineThicknessOf,
  MARGIN,
  mergedStyle,
  TITLE_SPACE,
  type ChartRendererState,
} from './ChartStyles.js';
import { LineRenderer } from './LineRenderer.js';
import { ScatterRenderer } from './ScatterRenderer.js';

/** `Math.max(400, labels * 60)`. @see ChartRenderer.java:745 */
const MIN_PLOT_WIDTH = 400;
/** @see ChartRenderer.java:745 */
const PLOT_WIDTH_PER_LABEL = 60;
/** @see ChartRenderer.java:749 */
const PLOT_HEIGHT = 300;
/** Extra height when the x-axis has a title. @see ChartRenderer.java:115 */
const X_AXIS_TITLE_SPACE = 20;
/** The outer stroke. @see ChartRenderer.java:137 */
const OUTER_THICKNESS = 1.0;

export class ChartRenderer {
  private readonly s: ChartRendererState;
  private readonly chart: CartesianChart;

  /** Every field read from the resolved chart. @see ChartRenderer.java:90-106 */
  constructor(skinParam: SkinParam, chart: CartesianChart) {
    this.chart = chart;
    this.s = {
      skinParam,
      orientation: chart.getOrientation(),
      xAxisLabels: chart.getCategories(),
      xAxisTitle: chart.getCategoryTitle(),
      xAxisTickSpacing: chart.getCategoryTickSpacing(),
      xAxisLabelPosition: chart.getCategoryLabelPosition(),
      xAxis: chart.getNumericAxis(),
      yAxis: chart.getValueAxis(),
      y2Axis: chart.getValueAxis2(),
      xGridMode: chart.getCategoryGridMode(),
      yGridMode: chart.getValueGridMode(),
      series: chart.getSeries(),
      legendPosition: chart.getLegendPosition(),
      stackMode: chart.getStackMode(),
      annotations: chart.getAnnotations(),
    };
  }

  /** @see ChartRenderer.java:744-746 */
  private getPlotWidth(): number {
    return Math.max(MIN_PLOT_WIDTH, this.s.xAxisLabels.length * PLOT_WIDTH_PER_LABEL);
  }

  /** @see ChartRenderer.java:748-750 */
  private getPlotHeight(): number {
    return PLOT_HEIGHT;
  }

  /** @see ChartRenderer.java:108-127 */
  calculateDimension(stringBounder: StringBounder): XDimension2D {
    const { y2Axis, xAxisTitle, legendPosition } = this.s;
    const legendDim = calculateLegendDimension(this.s, stringBounder);
    let width =
      MARGIN +
      getYAxisSpace(this.s, stringBounder, this.s.yAxis) +
      this.getPlotWidth() +
      (y2Axis !== undefined ? getYAxisSpace(this.s, stringBounder, y2Axis) : 0) +
      MARGIN;
    let height = MARGIN + TITLE_SPACE + this.getPlotHeight() + AXIS_LABEL_SPACE + MARGIN;

    if (xAxisTitle !== undefined && xAxisTitle !== '') height += X_AXIS_TITLE_SPACE;

    if (legendPosition === LegendPosition.LEFT || legendPosition === LegendPosition.RIGHT)
      width += legendDim.getWidth() + LEGEND_MARGIN;
    else if (legendPosition === LegendPosition.TOP || legendPosition === LegendPosition.BOTTOM)
      height += legendDim.getHeight() + LEGEND_MARGIN;

    return new XDimension2D(width, height);
  }

  /** The x-axis at zero, when the y range includes it. @see ChartRenderer.java:154-163 */
  private xAxisYOf(topMargin: number, plotHeight: number): number {
    const { orientation, yAxis } = this.s;
    if (orientation !== Orientation.HORIZONTAL && yAxis.getMin() <= 0 && yAxis.getMax() >= 0) {
      const zeroRatio = (0 - yAxis.getMin()) / (yAxis.getMax() - yAxis.getMin());
      return topMargin + plotHeight * (1.0 - zeroRatio);
    }
    return topMargin + plotHeight;
  }

  /** The y-axis at zero, when the x range includes it. @see ChartRenderer.java:165-174 */
  private yAxisXOf(leftMargin: number, plotWidth: number): number {
    const { orientation, xAxis } = this.s;
    if (orientation !== Orientation.HORIZONTAL && xAxis !== undefined && xAxis.getMin() <= 0 && xAxis.getMax() >= 0)
      return leftMargin + xAxis.valueToPixel(0, 0, plotWidth);
    return leftMargin;
  }

  /** @see ChartRenderer.java:129-211 */
  drawU(ugIn: UGraphic): void {
    const { skinParam, legendPosition, orientation, y2Axis, yAxis } = this.s;
    const set = skinParam.getIHtmlColorSet();
    const style = mergedStyle(getStyleSignature(), skinParam);
    const lineColor = lineColorOf(style, skinParam);
    const fontColor = style.value('FontColor').asColor(set);

    const ug = ugIn.apply(fore(lineColor)).apply(UStroke.withThickness(OUTER_THICKNESS));

    const legendDim = calculateLegendDimension(this.s, ug.getStringBounder());
    const leftSpace = getYAxisSpace(this.s, ug.getStringBounder(), yAxis);
    const y2Space = getYAxisSpace(this.s, ug.getStringBounder(), y2Axis);
    let leftMargin = MARGIN + leftSpace;
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
      drawYAxis(this.s, at(yAxisX, topMargin), { ...yArgs, axis: yAxis, leftSide: true, space: leftSpace });
      if (y2Axis !== undefined)
        drawYAxis(this.s, at(leftMargin + plotWidth, topMargin), {
          ...yArgs,
          axis: y2Axis,
          leftSide: false,
          space: y2Space,
        });
      drawXAxis(this.s, at(leftMargin, xAxisY), { width: plotWidth, height: plotHeight, lineColor });
    }

    const ugPlot = at(leftMargin, topMargin);
    drawGridLines(this.s, ugPlot, { plotWidth, plotHeight, lineColor });
    this.drawSeries(ugPlot, plotWidth, plotHeight);
    drawAnnotations(this.s, ugPlot, { plotWidth, plotHeight }, lineColor);
    drawLegend(this.s, ug, {
      leftMargin,
      topMargin,
      plotWidth,
      plotHeight,
      y2Space: y2Axis !== undefined ? y2Space : 0,
    });
  }

  /** The colour priority `drawSeries` gives a bar: explicit, style, then the dead default. @see ChartRenderer.java:584-597 */
  private barColorOf(s: ChartSeries): HColor {
    const { skinParam, series } = this.s;
    const fromStyle = getBarStyle(s, skinParam).value('BackGroundColor').asColor(skinParam.getIHtmlColorSet());
    return s.getColor() ?? asNullable(fromStyle) ?? getDefaultColor(series.indexOf(s), skinParam);
  }

  /**
   * The bar series from `from` (included) to `to` (excluded) among all of them,
   * laid out as the whole set. A single bar series takes the simple path.
   * @see ChartRenderer.java:644-667
   */
  private drawBars(ug: UGraphic, plot: PlotSize, bars: BarSlice): void {
    const { skinParam, xAxisLabels, orientation, stackMode } = this.s;
    const barRenderer = new BarRenderer({
      skinParam,
      plotWidth: plot.width,
      plotHeight: plot.height,
      categoryCount: xAxisLabels.length,
      axis: this.chart.getValueAxisOf(bars.series[0]!),
      horizontal: orientation === Orientation.HORIZONTAL,
    });
    if (bars.series.length === 1) barRenderer.draw(ug, bars.series[0]!, bars.colors[0]!);
    else if (stackMode === StackMode.STACKED) barRenderer.drawStacked(ug, bars);
    else barRenderer.drawGrouped(ug, bars);
  }

  /** An area's colour: explicit, `BackGroundColor`, then two dead fallbacks. @see ChartRenderer.java:669-687 */
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

  /** A line's style `LineThickness` (a0b2949242b, #2992), a scatter's colour. @see ChartRenderer.java:689-727 */
  private drawLineOrScatter(ug: UGraphic, plot: PlotSize, s: ChartSeries): void {
    const { skinParam, xAxisLabels, xAxis, series } = this.s;
    const base = {
      skinParam,
      plotWidth: plot.width,
      plotHeight: plot.height,
      categoryCount: xAxisLabels.length,
      axis: this.chart.getValueAxisOf(s),
      xAxis,
    };
    const style = s.getType() === SeriesType.LINE ? getLineStyle(s, skinParam) : getScatterStyle(s, skinParam);
    const color =
      s.getColor() ?? asNullable(lineColorOf(style, skinParam)) ?? getDefaultColor(series.indexOf(s), skinParam);
    if (s.getType() === SeriesType.LINE) new LineRenderer(base).draw(ug, s, color, lineThicknessOf(style));
    else new ScatterRenderer(base).draw(ug, s, color);
  }

  /**
   * The area series from `from` to `to`; the ones before `from` are not drawn but
   * still are the baseline of the next ones (`StackLayout`).
   * @see ChartRenderer.java:729-742
   */
  private drawAreas(ug: UGraphic, plot: PlotSize, areas: BarSlice): void {
    const areaRenderer = new AreaRenderer({
      skinParam: this.s.skinParam,
      plotWidth: plot.width,
      plotHeight: plot.height,
      categoryCount: this.s.xAxisLabels.length,
      axis: this.chart.getValueAxisOf(areas.series[0]!),
    });
    const stack = StackLayout.areas(areas.series);
    for (let i = areas.from; i < areas.to; i++)
      areaRenderer.draw(ug, areas.series[i]!, areas.colors[i]!, stack.getAreaBaseline(i));
  }

  /**
   * Series are drawn in the order they are written, a later one on top (#2973,
   * 8962a60262c). Bars and areas are laid out together, but a run of consecutive
   * bars (or areas) is drawn at its own place in the source (e12b4ccaa3c).
   * @see ChartRenderer.java:574-641
   */
  private drawSeries(ug: UGraphic, plotWidth: number, plotHeight: number): void {
    const { series, xAxisLabels } = this.s;
    if ((xAxisLabels.length === 0 && !this.chart.hasCoordinatePairs()) || series.length === 0) return;
    const plot: PlotSize = { width: plotWidth, height: plotHeight };
    const barSeries = series.filter((s) => s.getType() === SeriesType.BAR);
    const bars: SeriesSet = { series: barSeries, colors: barSeries.map((s) => this.barColorOf(s)) };
    const areaSeries = series.filter((s) => s.getType() === SeriesType.AREA);
    const areas: SeriesSet = { series: areaSeries, colors: areaSeries.map((s) => this.areaColorOf(s)) };

    const done = { [SeriesType.BAR]: 0, [SeriesType.AREA]: 0 };
    let index = 0;
    while (index < series.length) {
      const type = series[index]!.getType();
      if (type !== SeriesType.BAR && type !== SeriesType.AREA) {
        this.drawLineOrScatter(ug, plot, series[index]!);
        index++;
        continue;
      }
      let end = index;
      while (end < series.length && series[end]!.getType() === type) end++;
      const from = done[type];
      done[type] += end - index;
      if (type === SeriesType.BAR) this.drawBars(ug, plot, { ...bars, from, to: done[type] });
      else this.drawAreas(ug, plot, { ...areas, from, to: done[type] });
      index = end;
    }
  }
}

/** The plot's size, as every series path receives it. */
interface PlotSize {
  readonly width: number;
  readonly height: number;
}

/** All the bar (or area) series and their colours, index for index. */
interface SeriesSet {
  readonly series: readonly ChartSeries[];
  readonly colors: readonly HColor[];
}
