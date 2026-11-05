/**
 * BarRenderer — single, grouped and stacked bars. `getBarStyle` here does NOT
 * merge `forStereotypeItself` (BarRenderer.java:89-96), unlike `ChartRenderer`'s.
 * `barHeight > 0` guards only the single vertical arm: grouped and stacked draw
 * a zero-height rect. `drawGrouped` ignores `BarWidth`. Zero is clamped for single
 * and grouped, not for stacked; horizontal bars ignore it.
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

/** The default `BarWidth` ratio. @see BarRenderer.java:119 */
const DEFAULT_BAR_WIDTH_RATIO = 0.6;
/** `BarWidth` is honoured up to here. @see BarRenderer.java:122 */
const MAX_BAR_WIDTH_RATIO = 1.0;
/** `drawGrouped`'s share of a category. @see BarRenderer.java:234 */
const GROUP_WIDTH_RATIO = 0.8;
/** A label's distance from its bar's end. @see BarRenderer.java:171 */
const LABEL_OFFSET = 5;

/** `BarRenderer`'s constructor, grouped for the parameter hook. @see BarRenderer.java:75-83 */
export interface BarRendererParams {
  readonly skinParam: SkinParam;
  readonly plotWidth: number;
  readonly plotHeight: number;
  readonly categoryCount: number;
  readonly axis: ChartAxis;
  readonly horizontal: boolean;
}

export class BarRenderer {
  constructor(private readonly p: BarRendererParams) {}

  /** @see BarRenderer.java:85-96 */
  private getBarStyle(series: ChartSeries): Style {
    const signature = getBarStyleSignature();
    const stereotype = series.getStereotype();
    if (stereotype !== undefined) return mergedStyle(signature.withTOBECHANGED(stereotype), this.p.skinParam);
    return mergedStyle(signature, this.p.skinParam);
  }

  /** @see BarRenderer.java:98-104 */
  draw(ug: UGraphic, series: ChartSeries, color: HColor): void {
    if (this.p.horizontal) this.drawHorizontal(ug, series, color);
    else this.drawVertical(ug, series, color);
  }

  /** The Java's `barHeight` for both grouped and single vertical. @see BarRenderer.java:147-160 */
  private verticalBar(value: number): { y: number; barHeight: number } {
    const { axis, plotHeight } = this.p;
    const zeroY = Math.max(0, Math.min(plotHeight, plotY(axis, 0, plotHeight)));
    const valueY = plotY(axis, value, plotHeight);
    return value < 0 ? { y: zeroY, barHeight: valueY - zeroY } : { y: valueY, barHeight: zeroY - valueY };
  }

  /** The `lineColor` a bar's border takes: its fill only if the style answers null. @see BarRenderer.java:132-135 */
  private borderColor(barStyle: Style, color: HColor): HColor {
    return asNullable(lineColorOf(barStyle, this.p.skinParam)) ?? color;
  }

  /** @see BarRenderer.java:106-175 */
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
      const value = values[i]!;
      const x = i * categoryWidth + barOffset;
      const { y, barHeight } = this.verticalBar(value);

      if (barHeight > 0) drawBar(ug, { lineColor, stroke, color, x, y, width: barWidth, height: barHeight });
      if (series.isShowLabels()) this.drawBarLabel(ug, { value, x: x + barWidth / 2, y, barHeight });
    }
  }

  /** Top for a positive value, bottom for a negative one. @see BarRenderer.java:169-173 */
  private drawBarLabel(ug: UGraphic, b: { value: number; x: number; y: number; barHeight: number }): void {
    const labelY = b.value < 0 ? b.y + b.barHeight + LABEL_OFFSET : b.y - LABEL_OFFSET;
    drawLabel(ug, this.p.skinParam, b.value, b.x, labelY);
  }

  /** Never guards, and `Math.abs` makes a negative value a positive width from `x = 0`. @see BarRenderer.java:177-222 */
  private drawHorizontal(ug: UGraphic, series: ChartSeries, color: HColor): void {
    const { categoryCount, plotHeight, plotWidth, axis } = this.p;
    if (categoryCount === 0) return;

    const values = series.getValues();
    const categoryHeight = plotHeight / categoryCount;
    const barStyle = this.getBarStyle(series);
    const barHeight = categoryHeight * barWidthRatioOf(barStyle);
    const barOffset = (categoryHeight - barHeight) / 2;
    const lineColor = this.borderColor(barStyle, color);
    const stroke = strokeOf(barStyle);

    for (let i = 0; i < Math.min(values.length, categoryCount); i++) {
      const value = values[i]!;
      const y = i * categoryHeight + barOffset;
      const barWidth = Math.abs(((value - axis.getMin()) / (axis.getMax() - axis.getMin())) * plotWidth);

      drawBar(ug, { lineColor, stroke, color, x: 0, y, width: barWidth, height: barHeight });
      if (series.isShowLabels()) this.drawLabelHorizontal(ug, value, barWidth + LABEL_OFFSET, y + barHeight / 2);
    }
  }

  /** @see BarRenderer.java:227-291 */
  drawGrouped(ug: UGraphic, barSeries: readonly ChartSeries[], colors: readonly HColor[]): void {
    const { categoryCount, plotWidth, skinParam } = this.p;
    if (categoryCount === 0 || barSeries.length === 0) return;

    const categoryWidth = plotWidth / categoryCount;
    const seriesCount = barSeries.length;
    const groupWidth = categoryWidth * GROUP_WIDTH_RATIO;
    const barWidth = groupWidth / seriesCount;
    const groupOffset = (categoryWidth - groupWidth) / 2;
    const barStyle = mergedStyle(getBarStyleSignature(), skinParam);
    const stroke = strokeOf(barStyle);

    for (let categoryIndex = 0; categoryIndex < categoryCount; categoryIndex++) {
      for (let seriesIndex = 0; seriesIndex < seriesCount; seriesIndex++) {
        const series = barSeries[seriesIndex]!;
        const color = colors[seriesIndex]!;
        const values = series.getValues();
        if (categoryIndex >= values.length) continue;

        const value = values[categoryIndex]!;
        const x = categoryIndex * categoryWidth + groupOffset + seriesIndex * barWidth;
        const { y, barHeight } = this.verticalBar(value);
        const lineColor = this.borderColor(barStyle, color);

        drawBar(ug, { lineColor, stroke, color, x, y, width: barWidth, height: barHeight });
        if (series.isShowLabels()) this.drawBarLabel(ug, { value, x: x + barWidth / 2, y, barHeight });
      }
    }
  }

  /** Upstream's `cumulativeHeights` map is never read and is not ported. @see BarRenderer.java:296-379 */
  drawStacked(ug: UGraphic, barSeries: readonly ChartSeries[], colors: readonly HColor[]): void {
    const { categoryCount, plotWidth, skinParam } = this.p;
    if (categoryCount === 0 || barSeries.length === 0) return;

    const categoryWidth = plotWidth / categoryCount;
    const barStyle = mergedStyle(getBarStyleSignature(), skinParam);
    const barWidth = categoryWidth * barWidthRatioOf(barStyle);
    const barOffset = (categoryWidth - barWidth) / 2;
    const stroke = strokeOf(barStyle);

    for (let categoryIndex = 0; categoryIndex < categoryCount; categoryIndex++) {
      const x = categoryIndex * categoryWidth + barOffset;
      this.drawStackedCategory(ug, { categoryIndex, x, barWidth, stroke, barStyle }, barSeries, colors);
    }
  }

  /** One category's stack, whose zero is not clamped. @see BarRenderer.java:327-378 */
  private drawStackedCategory(
    ug: UGraphic,
    c: { categoryIndex: number; x: number; barWidth: number; stroke: UStroke; barStyle: Style },
    barSeries: readonly ChartSeries[],
    colors: readonly HColor[],
  ): void {
    const { axis, plotHeight } = this.p;
    const zeroY = plotY(axis, 0, plotHeight);
    let cumulativePositiveY = zeroY;
    let cumulativeNegativeY = zeroY;

    for (let seriesIndex = 0; seriesIndex < barSeries.length; seriesIndex++) {
      const series = barSeries[seriesIndex]!;
      const color = colors[seriesIndex]!;
      const values = series.getValues();
      if (c.categoryIndex >= values.length) continue;

      const value = values[c.categoryIndex]!;
      const valueY = plotY(axis, value, plotHeight);
      let y: number;
      let barHeight: number;
      if (value < 0) {
        barHeight = valueY - zeroY;
        y = cumulativeNegativeY;
        cumulativeNegativeY += barHeight;
      } else {
        barHeight = zeroY - valueY;
        cumulativePositiveY -= barHeight;
        y = cumulativePositiveY;
      }

      const lineColor = this.borderColor(c.barStyle, color);
      drawBar(ug, { lineColor, stroke: c.stroke, color, x: c.x, y, width: c.barWidth, height: barHeight });
      if (series.isShowLabels()) this.drawBarLabel(ug, { value, x: c.x + c.barWidth / 2, y, barHeight });
    }
  }

  /** @see BarRenderer.java:398-412 */
  private drawLabelHorizontal(ug: UGraphic, value: number, x: number, y: number): void {
    const { skinParam } = this.p;
    const fontConfig = valueLabelFontConfiguration(skinParam);
    const textBlock = displayBlock(skinParam, formatValue(value), fontConfig, HorizontalAlignment.LEFT);
    const textDim = textBlock.calculateDimension(ug.getStringBounder());
    textBlock.drawU(ug.apply(UTranslate.dx(x).compose(UTranslate.dy(y - textDim.getHeight() / 2))));
  }
}

/**
 * `BarWidth`: an unset `ValueNull` answers 0, which fails `> 0`, so 0.6 stands.
 * Java's `catch` covers a non-numeric value, `Double.parseDouble`'s throw.
 * @see BarRenderer.java:119-127
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
function drawBar(
  ug: UGraphic,
  b: { lineColor: HColor; stroke: UStroke; color: HColor; x: number; y: number; width: number; height: number },
): void {
  ug.apply(fore(b.lineColor))
    .apply(b.stroke)
    .apply(back(b.color))
    .apply(UTranslate.dx(b.x).compose(UTranslate.dy(b.y)))
    .draw(URectangle.build(b.width, b.height));
}
