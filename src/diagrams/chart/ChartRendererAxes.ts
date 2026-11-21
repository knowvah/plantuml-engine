/**
 * `ChartRenderer`'s axes and grid: `drawYAxis`, `drawVerticalText`,
 * `drawHorizontalAxisTitle`, `drawXAxis`, `drawCategoriesVerticallyOnLeft`,
 * `drawYAxisHorizontally` and `drawGridLines`, split out under the hooks (D5).
 * Each Java method keeps its name.
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/chart/ChartRenderer.java:241-773
 */
import type { StringBounder } from '../../core/klimt/font/StringBounder.js';
import { UFontFactory } from '../../core/klimt/font/UFontFactory.js';
import { bridgeFontConfiguration } from '../../core/klimt/font/FontConfigurationBridge.js';
import { HorizontalAlignment } from '../../core/klimt/geom/HorizontalAlignment.js';
import { ULine } from '../../core/klimt/shape/ULine.js';
import { UText } from '../../core/klimt/shape/UText.js';
import type { UGraphic } from '../../core/klimt/UGraphic.js';
import { UStroke } from '../../core/klimt/UStroke.js';
import { UTranslate } from '../../core/klimt/UTranslate.js';
import type { HColor } from '../../core/style/Value.js';
import { LabelPosition, type ChartAxis } from './ChartAxis.js';
import { GridMode, Orientation } from './chart-modes.js';
import { horizontalValueTicks, numericTicks, valueTicks } from './ChartTicks.js';
import {
  asNullable,
  AXIS_LABEL_SPACE,
  displayBlock,
  fore,
  getAxisStyleSignature,
  getGridStyleSignature,
  lineColorOf,
  mergedStyle,
  plainFontConfiguration,
  SMALL_FONT_SIZE,
  TICK_SIZE,
  type ChartRendererState,
  type StyleFontConfiguration,
} from './ChartStyles.js';

/** Between a tick and its label. @see ChartRenderer.java:314 */
const TICK_LABEL_GAP = 5;
/** Moves a rotated title further from the axis. @see ChartRenderer.java:425 */
const VERTICAL_TEXT_EXTRA_SPACING = 10;
/** `orientation` for the left axis. @see ChartRenderer.java:412 */
const ORIENTATION_LEFT = 90;
/** `orientation` for the right axis. @see ChartRenderer.java:412 */
const ORIENTATION_RIGHT = 270;
/** A top-placed axis title, above the axis. @see ChartRenderer.java:445 */
const AXIS_TITLE_TOP_GAP = 15;
/** A right-placed h-axis title, past the axis end. @see ChartRenderer.java:567 */
const X_TITLE_RIGHT_GAP = 10;
/** `TICK_SIZE + 25`, an h-axis title below the labels. @see ChartRenderer.java:573 */
const X_TITLE_BELOW = TICK_SIZE + 25;
/** Half a category: labels sit at category centres. @see ChartRenderer.java:545 */
const CATEGORY_CENTER = 0.5;

/** Between the widest tick label and the rotated title. @see ChartRenderer.java getYAxisSpace (f8e62ccdc42) */
const AXIS_TITLE_CLEARANCE = 6;

/** What `drawYAxis` passes its tick arms. */
interface YAxisContext {
  readonly state: ChartRendererState;
  /** Already carrying the axis colour and stroke. @see ChartRenderer.java:254 */
  readonly ug: UGraphic;
  readonly height: number;
  readonly width: number;
  readonly leftSide: boolean;
  readonly fontConfig: StyleFontConfiguration;
}

/** What `drawYAxis` receives beyond the graphic. */
export interface YAxisArgs {
  /** The space between the axis and the edge of the plot area, from `getYAxisSpace`. */
  readonly space: number;
  readonly height: number;
  readonly width: number;
  readonly axis: ChartAxis;
  readonly leftSide: boolean;
  readonly lineColor: HColor;
}

/** `gridStyle`'s colour, then its dead `#D0D0D0` and `lineColor` fallbacks. @see ChartRenderer.java:261-277 */
function gridStyleOf(state: ChartRendererState, lineColor: HColor): { color: HColor; stroke: UStroke } {
  const skinParam = state.skinParam;
  const gridStyle = mergedStyle(getGridStyleSignature(), skinParam);
  const color = asNullable(lineColorOf(gridStyle, skinParam)) ?? lineColor;
  return { color, stroke: UStroke.withThickness(gridStyle.value('LineThickness').asDouble()) };
}

/**
 * One tick of any of `drawYAxis`'s arms, which repeat this body. Grid lines are drawn
 * by `drawGridLines`, at the same ticks (781d73f9b1f, #2636).
 * @see ChartRenderer.java:294-317
 */
function drawYTick(c: YAxisContext, y: number, label: string): void {
  c.ug.apply(UTranslate.dy(y)).draw(ULine.hline(c.leftSide ? -TICK_SIZE : TICK_SIZE));

  const textBlock = displayBlock(c.state.skinParam, label, c.fontConfig, HorizontalAlignment.RIGHT);
  const dim = textBlock.calculateDimension(c.ug.getStringBounder());
  const dx = c.leftSide ? -TICK_SIZE - dim.getWidth() - TICK_LABEL_GAP : TICK_SIZE + TICK_LABEL_GAP;
  textBlock.drawU(c.ug.apply(UTranslate.dx(dx).compose(UTranslate.dy(y - dim.getHeight() / 2))));
}

/**
 * The space between a vertical value axis and the edge of the plot area: the tick, a
 * 5 px gap, the widest tick label and 6 px before the rotated title; never less than
 * `AXIS_LABEL_SPACE` (#2618). A horizontal chart keeps the fixed space.
 * @see ChartRenderer.java getYAxisSpace (f8e62ccdc42)
 */
export function getYAxisSpace(
  state: ChartRendererState,
  stringBounder: StringBounder,
  axis: ChartAxis | undefined,
): number {
  if (axis === undefined || state.orientation === Orientation.HORIZONTAL) return AXIS_LABEL_SPACE;
  const skinParam = state.skinParam;
  const fontConfig = mergedStyle(getAxisStyleSignature(false), skinParam).getFontConfiguration(
    skinParam.getIHtmlColorSet(),
  );
  let labelWidth = 0;
  for (const { label } of valueTicks(axis)) {
    const block = displayBlock(skinParam, label, fontConfig, HorizontalAlignment.RIGHT);
    labelWidth = Math.max(labelWidth, block.calculateDimension(stringBounder).getWidth());
  }
  return Math.max(AXIS_LABEL_SPACE, TICK_SIZE + TICK_LABEL_GAP + labelWidth + AXIS_TITLE_CLEARANCE);
}

/** @see ChartRenderer.java:241-405 */
export function drawYAxis(state: ChartRendererState, ugIn: UGraphic, args: YAxisArgs): void {
  const skinParam = state.skinParam;
  const { axis, leftSide, height } = args;
  const axisStyle = mergedStyle(getAxisStyleSignature(false), skinParam);
  const actualLineColor = asNullable(lineColorOf(axisStyle, skinParam)) ?? args.lineColor;
  const lineThickness = axisStyle.value('LineThickness').asDouble();
  const fontConfig = axisStyle.getFontConfiguration(skinParam.getIHtmlColorSet());

  const ug = ugIn.apply(fore(actualLineColor)).apply(UStroke.withThickness(lineThickness));
  ug.draw(ULine.vline(height));

  const context: YAxisContext = { state, ug, height, width: args.width, leftSide, fontConfig };
  for (const tick of valueTicks(axis)) drawYTick(context, height * (1.0 - tick.ratio), tick.label);

  const title = axis.getTitle();
  if (title === '') return;
  if (axis.getLabelPosition() === LabelPosition.TOP)
    drawHorizontalAxisTitle(state, ug, title, { leftSide, space: args.space, axisFontConfig: fontConfig });
  else drawVerticalText(ug, title, { height, leftSide, space: args.space, axisFontConfig: fontConfig });
}

/**
 * A `UText`, not a `Display`: no creole.
 * @see ChartRenderer.java:407-432
 */
function drawVerticalText(
  ug: UGraphic,
  text: string,
  args: { height: number; leftSide: boolean; space: number; axisFontConfig: StyleFontConfiguration },
): void {
  const { height, leftSide, space } = args;
  const font = bridgeFontConfiguration(args.axisFontConfig);
  const utext = UText.build(text, font).withOrientation(leftSide ? ORIENTATION_LEFT : ORIENTATION_RIGHT);

  const dim = ug.getStringBounder().calculateDimension(font, text);
  const textWidth = dim.getWidth();
  const textHeight = dim.getHeight();
  const xPos = leftSide
    ? -space + textHeight / 2 - VERTICAL_TEXT_EXTRA_SPACING
    : space - textHeight / 2 + VERTICAL_TEXT_EXTRA_SPACING;
  const yPos = leftSide ? height / 2 + textWidth / 2 : height / 2 - textWidth / 2;

  ug.apply(UTranslate.dx(xPos).compose(UTranslate.dy(yPos))).draw(utext);
}

/**
 * `isVerticalAxis` is `true` at its only caller, so the other arm is dead and not ported.
 * @see ChartRenderer.java:434-453
 */
function drawHorizontalAxisTitle(
  state: ChartRendererState,
  ug: UGraphic,
  text: string,
  args: { leftSide: boolean; space: number; axisFontConfig: StyleFontConfiguration },
): void {
  const { leftSide, axisFontConfig } = args;
  const textBlock = displayBlock(state.skinParam, text, axisFontConfig, HorizontalAlignment.CENTER);
  const dim = textBlock.calculateDimension(ug.getStringBounder());
  const half = args.space / 2;
  const xPos = leftSide ? -half - dim.getWidth() / 2 : half - dim.getWidth() / 2;
  const yPos = -dim.getHeight() - AXIS_TITLE_TOP_GAP;
  textBlock.drawU(ug.apply(UTranslate.dx(xPos).compose(UTranslate.dy(yPos))));
}

/** An h-axis label centred below its tick. @see ChartRenderer.java:553-556, 606-609 */
function drawXLabel(
  state: ChartRendererState,
  ug: UGraphic,
  x: number,
  label: string,
  fontConfig: StyleFontConfiguration,
): void {
  const textBlock = displayBlock(state.skinParam, label, fontConfig, HorizontalAlignment.CENTER);
  const textWidth = textBlock.calculateDimension(ug.getStringBounder()).getWidth();
  textBlock.drawU(ug.apply(UTranslate.dx(x - textWidth / 2).compose(UTranslate.dy(TICK_SIZE + TICK_LABEL_GAP))));
}

/** The h-axis title, the same on both arms. @see ChartRenderer.java:560-576, 612-628 */
function drawXAxisTitle(
  state: ChartRendererState,
  ug: UGraphic,
  width: number,
  fontConfig: StyleFontConfiguration,
): void {
  const { xAxisTitle, skinParam } = state;
  if (xAxisTitle === undefined || xAxisTitle === '') return;
  if (state.xAxisLabelPosition === LabelPosition.RIGHT) {
    const titleBlock = displayBlock(skinParam, xAxisTitle, fontConfig, HorizontalAlignment.LEFT);
    const textHeight = titleBlock.calculateDimension(ug.getStringBounder()).getHeight();
    titleBlock.drawU(ug.apply(UTranslate.dx(width + X_TITLE_RIGHT_GAP).compose(UTranslate.dy(-textHeight / 2))));
    return;
  }
  const titleBlock = displayBlock(skinParam, xAxisTitle, fontConfig, HorizontalAlignment.CENTER);
  const titleWidth = titleBlock.calculateDimension(ug.getStringBounder()).getWidth();
  titleBlock.drawU(ug.apply(UTranslate.dx(width / 2 - titleWidth / 2).compose(UTranslate.dy(X_TITLE_BELOW))));
}

/** The categorical arm. @see ChartRenderer.java:482-576 */
function drawCategoryXAxis(
  state: ChartRendererState,
  ug: UGraphic,
  args: { width: number; height: number; lineColor: HColor; fontConfig: StyleFontConfiguration },
): void {
  const { xAxisLabels, xAxisTickSpacing } = state;
  const categoryWidth = args.width / xAxisLabels.length;
  const spacing = xAxisTickSpacing !== undefined && xAxisTickSpacing > 0 ? xAxisTickSpacing : 1;

  for (let i = 0; i < xAxisLabels.length; i++) {
    if (i % spacing !== 0) continue;
    const labelX = (i + CATEGORY_CENTER) * categoryWidth;
    ug.apply(UTranslate.dx(labelX)).draw(ULine.vline(TICK_SIZE));
    drawXLabel(state, ug, labelX, xAxisLabels[i]!, args.fontConfig);
  }
  drawXAxisTitle(state, ug, args.width, args.fontConfig);
}

/** The numeric arm, for coordinate pairs. @see ChartRenderer.java:577-628 */
function drawNumericXAxis(
  state: ChartRendererState,
  ug: UGraphic,
  args: { xAxis: ChartAxis; width: number; fontConfig: StyleFontConfiguration },
): void {
  for (const tick of numericTicks(args.xAxis, state.xAxisTickSpacing)) {
    const x = args.xAxis.valueToPixel(tick.value, 0, args.width);
    ug.apply(UTranslate.dx(x)).draw(ULine.vline(TICK_SIZE));
    drawXLabel(state, ug, x, tick.label, args.fontConfig);
  }
  drawXAxisTitle(state, ug, args.width, args.fontConfig);
}

/** The vertical-orientation body of `drawXAxis`; the horizontal arm returns earlier. @see ChartRenderer.java:455-630 */
export function drawXAxis(
  state: ChartRendererState,
  ugIn: UGraphic,
  args: { width: number; height: number; lineColor: HColor },
): void {
  const skinParam = state.skinParam;
  const axisStyle = mergedStyle(getAxisStyleSignature(true), skinParam);
  const actualLineColor = asNullable(lineColorOf(axisStyle, skinParam)) ?? args.lineColor;
  const lineThickness = axisStyle.value('LineThickness').asDouble();
  const fontConfig = axisStyle.getFontConfiguration(skinParam.getIHtmlColorSet());

  const ug = ugIn.apply(fore(actualLineColor)).apply(UStroke.withThickness(lineThickness));
  ug.draw(ULine.hline(args.width));

  if (state.xAxisLabels.length > 0) drawCategoryXAxis(state, ug, { ...args, fontConfig });
  else if (state.xAxis !== undefined)
    drawNumericXAxis(state, ug, { xAxis: state.xAxis, width: args.width, fontConfig });
}

/**
 * Keeps the outer `ug`, at stroke `1.0` and the merged `lineColor`.
 * @see ChartRenderer.java:632-656
 */
export function drawCategoriesVerticallyOnLeft(
  state: ChartRendererState,
  ug: UGraphic,
  height: number,
  fontColor: HColor,
): void {
  ug.draw(ULine.vline(height));

  const { xAxisLabels, skinParam } = state;
  if (xAxisLabels.length === 0) return;

  const fontConfig = plainFontConfiguration(UFontFactory.sansSerif(SMALL_FONT_SIZE), fontColor);
  const categoryHeight = height / xAxisLabels.length;

  for (let i = 0; i < xAxisLabels.length; i++) {
    const y = (i + CATEGORY_CENTER) * categoryHeight;
    ug.apply(UTranslate.dx(-TICK_SIZE).compose(UTranslate.dy(y))).draw(ULine.hline(TICK_SIZE));

    const textBlock = displayBlock(skinParam, xAxisLabels[i]!, fontConfig, HorizontalAlignment.RIGHT);
    const dim = textBlock.calculateDimension(ug.getStringBounder());
    const dx = -TICK_SIZE - dim.getWidth() - TICK_LABEL_GAP;
    textBlock.drawU(ug.apply(UTranslate.dx(dx).compose(UTranslate.dy(y - dim.getHeight() / 2))));
  }
}

/**
 * Keeps the outer `ug`, sans-serif 10. The unused `gridColor` is not ported.
 * @see ChartRenderer.java:658-702
 */
export function drawYAxisHorizontally(
  state: ChartRendererState,
  ug: UGraphic,
  args: { width: number; axis: ChartAxis; fontColor: HColor },
): void {
  const { width, axis } = args;
  ug.draw(ULine.hline(width));

  const fontConfig = plainFontConfiguration(UFontFactory.sansSerif(SMALL_FONT_SIZE), args.fontColor);

  for (const tick of horizontalValueTicks(axis)) {
    const x = width * tick.ratio;
    ug.apply(UTranslate.dx(x)).draw(ULine.vline(TICK_SIZE));
    drawXLabel(state, ug, x, tick.label, fontConfig);
  }

  const title = axis.getTitle();
  if (title === '') return;
  const titleBlock = displayBlock(state.skinParam, title, fontConfig, HorizontalAlignment.CENTER);
  const titleWidth = titleBlock.calculateDimension(ug.getStringBounder()).getWidth();
  titleBlock.drawU(ug.apply(UTranslate.dx(width / 2 - titleWidth / 2).compose(UTranslate.dy(X_TITLE_BELOW))));
}

/**
 * Every grid line falls on a tick of its own axis (#2636): `x` is the category (or
 * numeric h-) axis and `y` the value axis whatever the orientation, because
 * `ChartDiagram` swaps the grid modes for a horizontal chart.
 * @see ChartRenderer.java:509-571 (781d73f9b1f)
 */
export function drawGridLines(
  state: ChartRendererState,
  ugIn: UGraphic,
  args: { plotWidth: number; plotHeight: number; lineColor: HColor },
): void {
  const { yAxis, xGridMode, yGridMode } = state;
  const { plotWidth, plotHeight } = args;
  const { color, stroke } = gridStyleOf(state, args.lineColor);
  const ug = ugIn.apply(fore(color)).apply(stroke);
  const horizontal = state.orientation === Orientation.HORIZONTAL;

  if (xGridMode !== GridMode.OFF) drawCategoryGrid(state, ug, args);

  if (yGridMode === GridMode.OFF) return;
  if (horizontal)
    for (const { ratio } of horizontalValueTicks(yAxis))
      ug.apply(UTranslate.dx(plotWidth * ratio)).draw(ULine.vline(plotHeight));
  else
    for (const { ratio } of valueTicks(yAxis))
      ug.apply(UTranslate.dy(plotHeight * (1.0 - ratio))).draw(ULine.hline(plotWidth));
}

/**
 * The x grid: one line per labelled category (every spacing), or per tick of a
 * numeric h-axis. `ug` already carries the grid colour and stroke.
 * @see ChartRenderer.java:544-561
 */
function drawCategoryGrid(
  state: ChartRendererState,
  ug: UGraphic,
  args: { plotWidth: number; plotHeight: number },
): void {
  const { xAxis, xAxisLabels, xAxisTickSpacing } = state;
  const { plotWidth, plotHeight } = args;
  const horizontal = state.orientation === Orientation.HORIZONTAL;
  if (xAxisLabels.length > 0) {
    const spacing = horizontal || xAxisTickSpacing === undefined || xAxisTickSpacing <= 0 ? 1 : xAxisTickSpacing;
    const count = xAxisLabels.length;
    for (let i = 0; i < count; i += spacing)
      if (horizontal)
        ug.apply(UTranslate.dy(((i + CATEGORY_CENTER) * plotHeight) / count)).draw(ULine.hline(plotWidth));
      else ug.apply(UTranslate.dx(((i + CATEGORY_CENTER) * plotWidth) / count)).draw(ULine.vline(plotHeight));
  } else if (xAxis !== undefined && !horizontal) {
    // Same ticks as drawXAxis.
    for (const tick of numericTicks(xAxis, xAxisTickSpacing))
      ug.apply(UTranslate.dx(xAxis.valueToPixel(tick.value, 0, plotWidth))).draw(ULine.vline(plotHeight));
  }
}
