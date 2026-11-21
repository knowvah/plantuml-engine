/**
 * BarRenderer — single, grouped and stacked bars, vertical or horizontal.
 * `getBarStyle` here does NOT merge `forStereotypeItself` (BarRenderer.java:88-94),
 * unlike `ChartRenderer`'s. A missing value draws nothing (f44b054d131), a bar of
 * no height is not drawn (5808a1c3f9a), a horizontal bar goes from 0 to its value
 * (2117ccb43cd), and several horizontal series are drawn side by side or stacked
 * (6ef6ba87046). `drawGrouped` ignores `BarWidth`.
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/chart/BarRenderer.java
 */
import { HorizontalAlignment } from '../../core/klimt/geom/HorizontalAlignment.js';
import { URectangle } from '../../core/klimt/shape/URectangle.js';
import type { UGraphic } from '../../core/klimt/UGraphic.js';
import { UStroke } from '../../core/klimt/UStroke.js';
import { UTranslate } from '../../core/klimt/UTranslate.js';
import type { Style } from '../../core/style/Style.js';
import type { HColor } from '../../core/style/Value.js';
import type { ChartAxis } from './ChartAxis.js';
import type { ChartSeries } from './ChartSeries.js';
import type { SkinParam } from './chart-skin-param.js';
import {
  asNullable,
  back,
  displayBlock,
  drawLabel,
  fore,
  formatValue,
  getBarStyleSignature,
  lineColorOf,
  mergedStyle,
  plotY,
  valueLabelFontConfiguration,
} from './ChartStyles.js';
import { StackLayout } from './StackLayout.js';

/** The default `BarWidth` ratio. @see BarRenderer.java:117 */
const DEFAULT_BAR_WIDTH_RATIO = 0.6;
/** `BarWidth` is honoured up to here. @see BarRenderer.java:120 */
const MAX_BAR_WIDTH_RATIO = 1.0;
/** `drawGrouped`'s share of a category. @see BarRenderer.java:255, 402 */
const GROUP_WIDTH_RATIO = 0.8;
/** A label's distance from its bar's end. @see BarRenderer.java:169 */
const LABEL_OFFSET = 5;

/** `BarRenderer`'s constructor, grouped for the parameter hook. @see BarRenderer.java:74-83 */
export interface BarRendererParams {
  readonly skinParam: SkinParam;
  readonly plotWidth: number;
  readonly plotHeight: number;
  readonly categoryCount: number;
  readonly axis: ChartAxis;
  readonly horizontal: boolean;
}

/** One rectangle: its colours, stroke and box. */
interface Bar {
  readonly lineColor: HColor;
  readonly stroke: UStroke;
  readonly color: HColor;
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

/** A vertical bar's top and height. */
interface VerticalBar {
  readonly y: number;
  readonly barHeight: number;
}

/** A horizontal bar's left and width. */
interface HorizontalBar {
  readonly x: number;
  readonly barWidth: number;
}

/** The whole bar set, its colours, and the slice `[from, to)` drawn now: Java's last four arguments. */
export interface BarSlice {
  readonly series: readonly ChartSeries[];
  readonly colors: readonly HColor[];
  readonly from: number;
  readonly to: number;
}

export class BarRenderer {
  constructor(private readonly p: BarRendererParams) {}

  /** @see BarRenderer.java:88-94 */
  private getBarStyle(series: ChartSeries): Style {
    const signature = getBarStyleSignature();
    const stereotype = series.getStereotype();
    if (stereotype !== undefined) return mergedStyle(signature.withTOBECHANGED(stereotype), this.p.skinParam);
    return mergedStyle(signature, this.p.skinParam);
  }

  /** @see BarRenderer.java:96-102 */
  draw(ug: UGraphic, series: ChartSeries, color: HColor): void {
    if (this.p.horizontal) this.drawHorizontal(ug, series, color);
    else this.drawVertical(ug, series, color);
  }

  /** From 0, clamped into the plot, to the value. @see BarRenderer.java:145-160 */
  private verticalBar(value: number): VerticalBar {
    const { axis, plotHeight } = this.p;
    const zeroY = Math.max(0, Math.min(plotHeight, plotY(axis, 0, plotHeight)));
    const valueY = plotY(axis, value, plotHeight);
    return value < 0 ? { y: zeroY, barHeight: valueY - zeroY } : { y: valueY, barHeight: zeroY - valueY };
  }

  /** From 0, clamped into the plot, rightwards or leftwards to the value. @see BarRenderer.java:211-215 */
  private horizontalBar(value: number): HorizontalBar {
    const { axis, plotWidth } = this.p;
    const zeroX = Math.max(0, Math.min(plotWidth, axis.valueToPixel(0, 0, plotWidth)));
    const valueX = axis.valueToPixel(value, 0, plotWidth);
    return { x: Math.min(zeroX, valueX), barWidth: Math.abs(valueX - zeroX) };
  }

  /** The `lineColor` a bar's border takes: its fill only if the style answers null. @see BarRenderer.java:130-133 */
  private borderColor(barStyle: Style, color: HColor): HColor {
    return asNullable(lineColorOf(barStyle, this.p.skinParam)) ?? color;
  }

  /** @see BarRenderer.java:104-175 */
  private drawVertical(ug: UGraphic, series: ChartSeries, color: HColor): void {
    const { categoryCount, plotWidth } = this.p;
    if (categoryCount === 0) return;

    const values = series.getValues();
    const categoryWidth = plotWidth / categoryCount;
    const barStyle = this.getBarStyle(series);
    const barWidth = categoryWidth * barWidthRatioOf(barStyle);
    const barOffset = (categoryWidth - barWidth) / 2;
    const lineColor = this.borderColor(barStyle, color);
    const stroke = strokeOf(barStyle);

    for (let i = 0; i < Math.min(values.length, categoryCount); i++) {
      const value = values[i];
      if (value === undefined) continue;
      const x = i * categoryWidth + barOffset;
      const { y, barHeight } = this.verticalBar(value);

      if (barHeight > 0) drawBar(ug, { lineColor, stroke, color, x, y, width: barWidth, height: barHeight });
      if (series.isShowLabels()) this.drawBarLabel(ug, { value, x: x + barWidth / 2, y, barHeight });
    }
  }

  /** Top for a positive value, bottom for a negative one. @see BarRenderer.java:167-171 */
  private drawBarLabel(ug: UGraphic, b: { value: number; x: number; y: number; barHeight: number }): void {
    const labelY = b.value < 0 ? b.y + b.barHeight + LABEL_OFFSET : b.y - LABEL_OFFSET;
    drawLabel(ug, this.p.skinParam, b.value, b.x, labelY);
  }

  /** @see BarRenderer.java:177-226 */
  private drawHorizontal(ug: UGraphic, series: ChartSeries, color: HColor): void {
    const { categoryCount, plotHeight } = this.p;
    if (categoryCount === 0) return;

    const values = series.getValues();
    const categoryHeight = plotHeight / categoryCount;
    const barStyle = this.getBarStyle(series);
    const barHeight = categoryHeight * barWidthRatioOf(barStyle);
    const barOffset = (categoryHeight - barHeight) / 2;
    const lineColor = this.borderColor(barStyle, color);
    const stroke = strokeOf(barStyle);

    for (let i = 0; i < Math.min(values.length, categoryCount); i++) {
      const value = values[i];
      if (value === undefined) continue;
      const y = i * categoryHeight + barOffset;
      const { x, barWidth } = this.horizontalBar(value);

      if (barHeight > 0 && barWidth > 0)
        drawBar(ug, { lineColor, stroke, color, x, y, width: barWidth, height: barHeight });
      if (series.isShowLabels()) this.drawLabelHorizontal(ug, value, x + barWidth + LABEL_OFFSET, y + barHeight / 2);
    }
  }

  /**
   * Only the series `[from, to)` of a grouped set: every series keeps its own slot,
   * so the others can be drawn at another time (e12b4ccaa3c).
   * @see BarRenderer.java:235-313
   */
  drawGrouped(ug: UGraphic, slice: BarSlice): void {
    const { categoryCount, plotWidth, skinParam } = this.p;
    const { series: barSeries, colors } = slice;
    if (categoryCount === 0 || barSeries.length === 0) return;
    if (this.p.horizontal) {
      this.drawGroupedHorizontal(ug, slice);
      return;
    }

    const categoryWidth = plotWidth / categoryCount;
    const groupWidth = categoryWidth * GROUP_WIDTH_RATIO;
    const barWidth = groupWidth / barSeries.length;
    const groupOffset = (categoryWidth - groupWidth) / 2;
    const barStyle = mergedStyle(getBarStyleSignature(), skinParam);
    const stroke = strokeOf(barStyle);

    this.forEachValue(slice, (series, seriesIndex, categoryIndex, value) => {
      const color = colors[seriesIndex]!;
      const x = categoryIndex * categoryWidth + groupOffset + seriesIndex * barWidth;
      const { y, barHeight } = this.verticalBar(value);
      const lineColor = this.borderColor(barStyle, color);
      if (barHeight > 0) drawBar(ug, { lineColor, stroke, color, x, y, width: barWidth, height: barHeight });
      if (series.isShowLabels()) this.drawBarLabel(ug, { value, x: x + barWidth / 2, y, barHeight });
    });
  }

  /** Every present value of the slice, category by category. @see BarRenderer.java:266-274 */
  private forEachValue(
    slice: BarSlice,
    body: (series: ChartSeries, seriesIndex: number, categoryIndex: number, value: number) => void,
  ): void {
    for (let categoryIndex = 0; categoryIndex < this.p.categoryCount; categoryIndex++) {
      for (let seriesIndex = slice.from; seriesIndex < slice.to; seriesIndex++) {
        const series = slice.series[seriesIndex]!;
        const value = series.getValues()[categoryIndex];
        if (value === undefined) continue;
        body(series, seriesIndex, categoryIndex, value);
      }
    }
  }

  /**
   * Only the series `[from, to)` of a stacked set: the ones before still count, as
   * they are under; positive values pile up from 0, negative ones down (StackLayout).
   * @see BarRenderer.java:318-395
   */
  drawStacked(ug: UGraphic, slice: BarSlice): void {
    const { categoryCount, plotWidth, skinParam } = this.p;
    const { series: barSeries, colors } = slice;
    if (categoryCount === 0 || barSeries.length === 0) return;
    if (this.p.horizontal) {
      this.drawStackedHorizontal(ug, slice);
      return;
    }

    const categoryWidth = plotWidth / categoryCount;
    const barStyle = mergedStyle(getBarStyleSignature(), skinParam);
    const barWidth = categoryWidth * barWidthRatioOf(barStyle);
    const barOffset = (categoryWidth - barWidth) / 2;
    const stack = StackLayout.bars(barSeries);
    const stroke = strokeOf(barStyle);

    this.forEachStacked(slice, stack, (series, seriesIndex, categoryIndex, value) => {
      const color = colors[seriesIndex]!;
      const x = categoryIndex * categoryWidth + barOffset;
      const baseY = this.toY(stack.getBase(seriesIndex, categoryIndex));
      const topY = this.toY(stack.getTop(seriesIndex, categoryIndex));
      const y = Math.min(baseY, topY);
      const barHeight = Math.abs(baseY - topY);
      const lineColor = this.borderColor(barStyle, color);
      if (barHeight > 0) drawBar(ug, { lineColor, stroke, color, x, y, width: barWidth, height: barHeight });
      if (series.isShowLabels()) this.drawBarLabel(ug, { value, x: x + barWidth / 2, y, barHeight });
    });
  }

  /** Every value of the slice that has a segment in the stack. @see BarRenderer.java:361-368 */
  private forEachStacked(
    slice: BarSlice,
    stack: StackLayout,
    body: (series: ChartSeries, seriesIndex: number, categoryIndex: number, value: number) => void,
  ): void {
    for (let categoryIndex = 0; categoryIndex < this.p.categoryCount; categoryIndex++) {
      for (let seriesIndex = slice.from; seriesIndex < slice.to; seriesIndex++) {
        if (!stack.has(seriesIndex, categoryIndex)) continue;
        const series = slice.series[seriesIndex]!;
        body(series, seriesIndex, categoryIndex, series.getValues()[categoryIndex]!);
      }
    }
  }

  /** Horizontal grouped: `drawGrouped`'s layout turned. @see BarRenderer.java:399-431 */
  private drawGroupedHorizontal(ug: UGraphic, slice: BarSlice): void {
    const { plotHeight, categoryCount, skinParam } = this.p;
    const categoryHeight = plotHeight / categoryCount;
    const groupHeight = categoryHeight * GROUP_WIDTH_RATIO;
    const barHeight = groupHeight / slice.series.length;
    const groupOffset = (categoryHeight - groupHeight) / 2;
    const barStyle = mergedStyle(getBarStyleSignature(), skinParam);
    const stroke = strokeOf(barStyle);

    this.forEachValue(slice, (series, seriesIndex, categoryIndex, value) => {
      const y = categoryIndex * categoryHeight + groupOffset + seriesIndex * barHeight;
      const { x, barWidth } = this.horizontalBar(value);
      const color = slice.colors[seriesIndex]!;
      this.drawBarHorizontal(ug, barStyle, { stroke, color, x, y, width: barWidth, height: barHeight });
      if (series.isShowLabels()) this.drawLabelHorizontal(ug, value, x + barWidth + LABEL_OFFSET, y + barHeight / 2);
    });
  }

  /** Horizontal stacked: positive bars grow rightwards from 0, negative leftwards. @see BarRenderer.java:433-475 */
  private drawStackedHorizontal(ug: UGraphic, slice: BarSlice): void {
    const { plotHeight, plotWidth, categoryCount, skinParam, axis } = this.p;
    const categoryHeight = plotHeight / categoryCount;
    const barStyle = mergedStyle(getBarStyleSignature(), skinParam);
    const barHeight = categoryHeight * barWidthRatioOf(barStyle);
    const barOffset = (categoryHeight - barHeight) / 2;
    const stroke = strokeOf(barStyle);
    const stack = StackLayout.bars(slice.series);

    this.forEachStacked(slice, stack, (series, seriesIndex, categoryIndex, value) => {
      const y = categoryIndex * categoryHeight + barOffset;
      const baseX = axis.valueToPixel(stack.getBase(seriesIndex, categoryIndex), 0, plotWidth);
      const topX = axis.valueToPixel(stack.getTop(seriesIndex, categoryIndex), 0, plotWidth);
      const x = Math.min(baseX, topX);
      const barWidth = Math.abs(topX - baseX);
      const color = slice.colors[seriesIndex]!;
      this.drawBarHorizontal(ug, barStyle, { stroke, color, x, y, width: barWidth, height: barHeight });
      // A negative segment has the positive ones on its right: its label goes on its left.
      if (series.isShowLabels()) {
        const labelX = value < 0 ? x - LABEL_OFFSET : x + barWidth + LABEL_OFFSET;
        this.drawLabelHorizontal(ug, value, labelX, y + barHeight / 2, value < 0);
      }
    });
  }

  /** The vertical position of a value in the plot. @see BarRenderer.java:478-480 */
  private toY(value: number): number {
    return plotY(this.p.axis, value, this.p.plotHeight);
  }

  /** Nothing for an empty box; the border is the style's line colour, else the fill. @see BarRenderer.java:482-492 */
  private drawBarHorizontal(ug: UGraphic, barStyle: Style, b: Omit<Bar, 'lineColor'>): void {
    if (b.height <= 0 || b.width <= 0) return;
    drawBar(ug, { ...b, lineColor: this.borderColor(barStyle, b.color) });
  }

  /** The label starts at `x`, or ends there when `endsAtX`. @see BarRenderer.java:511-531 */
  private drawLabelHorizontal(ug: UGraphic, value: number, x: number, y: number, endsAtX = false): void {
    const { skinParam } = this.p;
    const fontConfig = valueLabelFontConfiguration(skinParam);
    const textBlock = displayBlock(skinParam, formatValue(value), fontConfig, HorizontalAlignment.LEFT);
    const textDim = textBlock.calculateDimension(ug.getStringBounder());
    const labelX = endsAtX ? x - textDim.getWidth() : x;
    textBlock.drawU(ug.apply(UTranslate.dx(labelX).compose(UTranslate.dy(y - textDim.getHeight() / 2))));
  }
}

/**
 * `BarWidth`: an unset `ValueNull` answers 0, which fails `> 0`, so 0.6 stands.
 * Java's `catch` covers a non-numeric value, `Double.parseDouble`'s throw.
 * @see BarRenderer.java:117-125
 */
function barWidthRatioOf(barStyle: Style): number {
  try {
    const styleBarWidth = barStyle.value('BarWidth').asDouble();
    if (styleBarWidth > 0 && styleBarWidth <= MAX_BAR_WIDTH_RATIO) return styleBarWidth;
  } catch {
    // Use default, as Java's `catch (Exception e)` does.
  }
  return DEFAULT_BAR_WIDTH_RATIO;
}

function strokeOf(barStyle: Style): UStroke {
  return UStroke.withThickness(barStyle.value('LineThickness').asDouble());
}

/** `ug.apply(lineColor).apply(stroke).apply(color.bg()).apply(translate).draw(rect)`. */
function drawBar(ug: UGraphic, b: Bar): void {
  ug.apply(fore(b.lineColor))
    .apply(b.stroke)
    .apply(back(b.color))
    .apply(UTranslate.dx(b.x).compose(UTranslate.dy(b.y)))
    .draw(URectangle.build(b.width, b.height));
}
