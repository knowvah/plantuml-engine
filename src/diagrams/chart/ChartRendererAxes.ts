/**
 * `ChartRenderer`'s axes and grid: `drawYAxis`, `drawVerticalText`,
 * `drawHorizontalAxisTitle`, `drawXAxis`, `drawCategoriesVerticallyOnLeft`,
 * `drawYAxisHorizontally` and `drawGridLines`, split out under the hooks (D5).
 * Each Java method keeps its name.
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/chart/ChartRenderer.java:241-773
 */
import { javaFormatF } from '../../core/java-number-format.js';
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
import { GridMode } from './chart-modes.js';
import {
  asNullable,
  AXIS_LABEL_SPACE,
  displayBlock,
  fore,
  formatAxisValue,
  formatValue,
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

/** `drawYAxis`'s automatic ticks. @see ChartRenderer.java:362 */
const NUM_TICKS = 5;
/** `drawYAxisHorizontally`'s ticks. @see ChartRenderer.java:677 */
const NUM_TICKS_HORIZONTAL = 5;
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
/** The automatic numeric tick count. @see ChartRenderer.java:587 */
const AUTO_TICK_DIVISIONS = 10;
/** `tickInterval * 0.01`, the numeric loops' tolerance. @see ChartRenderer.java:594 */
const TICK_TOLERANCE = 0.01;
/** Half a category: labels sit at category centres. @see ChartRenderer.java:545 */
const CATEGORY_CENTER = 0.5;

/** What `drawYAxis` passes its tick arms. */
interface YAxisContext {
  readonly state: ChartRendererState;
  /** Already carrying the axis colour and stroke. @see ChartRenderer.java:254 */
  readonly ug: UGraphic;
  readonly height: number;
  readonly width: number;
  readonly leftSide: boolean;
  readonly fontConfig: StyleFontConfiguration;
  readonly gridColor: HColor;
  readonly gridStroke: UStroke;
}

/** What `drawYAxis` receives beyond the graphic. */
export interface YAxisArgs {
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
 * One tick of any of `drawYAxis`'s arms, which repeat this body. The grid arm is
 * dead: `xAxis` is never null (`ChartDiagram.java:74`). `drawGridLines` draws instead.
 * @see ChartRenderer.java:294-317
 */
function drawYTick(c: YAxisContext, y: number, label: string): void {
  if (c.leftSide && c.state.yGridMode !== GridMode.OFF && c.state.xAxis === undefined) {
    c.ug.apply(fore(c.gridColor)).apply(c.gridStroke).apply(UTranslate.dy(y)).draw(ULine.hline(c.width));
  }

  c.ug.apply(UTranslate.dy(y)).draw(ULine.hline(c.leftSide ? -TICK_SIZE : TICK_SIZE));

  const textBlock = displayBlock(c.state.skinParam, label, c.fontConfig, HorizontalAlignment.RIGHT);
  const dim = textBlock.calculateDimension(c.ug.getStringBounder());
  const dx = c.leftSide ? -TICK_SIZE - dim.getWidth() - TICK_LABEL_GAP : TICK_SIZE + TICK_LABEL_GAP;
  textBlock.drawU(c.ug.apply(UTranslate.dx(dx).compose(UTranslate.dy(y - dim.getHeight() / 2))));
}

/** The custom-ticks arm. Skips a tick outside the axis. @see ChartRenderer.java:281-318 */
function drawCustomTicks(c: YAxisContext, axis: ChartAxis): void {
  for (const { value, label } of axis.getCustomTicks()!) {
    const y = c.height * (1.0 - (value - axis.getMin()) / (axis.getMax() - axis.getMin()));
    if (y < 0 || y > c.height) continue;
    drawYTick(c, y, label);
  }
}

/** The spacing arm. @see ChartRenderer.java:319-359 */
function drawSpacedTicks(c: YAxisContext, axis: ChartAxis): void {
  const spacing = axis.getTickSpacing()!;
  const range = axis.getMax() - axis.getMin();
  const startValue = Math.ceil(axis.getMin() / spacing) * spacing;
  for (let value = startValue; value <= axis.getMax(); value += spacing) {
    // Upstream's guard against floating point, unreachable under the loop's own test.
    if (value > axis.getMax() + spacing * TICK_TOLERANCE) break;
    drawYTick(c, c.height * (1.0 - (value - axis.getMin()) / range), formatValue(value));
  }
}

/** The automatic arm. @see ChartRenderer.java:360-393 */
function drawAutomaticTicks(c: YAxisContext, axis: ChartAxis): void {
  for (let i = 0; i <= NUM_TICKS; i++) {
    const y = c.height * (1.0 - i / NUM_TICKS);
    const value = axis.getMin() + ((axis.getMax() - axis.getMin()) * i) / NUM_TICKS;
    drawYTick(c, y, formatValue(value));
  }
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

  const grid = gridStyleOf(state, args.lineColor);
  const context: YAxisContext = {
    state,
    ug,
    height,
    width: args.width,
    leftSide,
    fontConfig,
    gridColor: grid.color,
    gridStroke: grid.stroke,
  };
  if (axis.hasCustomTicks()) drawCustomTicks(context, axis);
  else if (axis.hasTickSpacing()) drawSpacedTicks(context, axis);
  else drawAutomaticTicks(context, axis);

  const title = axis.getTitle();
  if (title === '') return;
  if (axis.getLabelPosition() === LabelPosition.TOP) drawHorizontalAxisTitle(state, ug, title, leftSide, fontConfig);
  else drawVerticalText(ug, title, { height, leftSide, axisFontConfig: fontConfig });
}

/**
 * A `UText`, not a `Display`: no creole.
 * @see ChartRenderer.java:407-432
 */
function drawVerticalText(
  ug: UGraphic,
  text: string,
  args: { height: number; leftSide: boolean; axisFontConfig: StyleFontConfiguration },
): void {
  const { height, leftSide } = args;
  const font = bridgeFontConfiguration(args.axisFontConfig);
  const utext = UText.build(text, font).withOrientation(leftSide ? ORIENTATION_LEFT : ORIENTATION_RIGHT);

  const dim = ug.getStringBounder().calculateDimension(font, text);
  const textWidth = dim.getWidth();
  const textHeight = dim.getHeight();
  const xPos = leftSide
    ? -AXIS_LABEL_SPACE + textHeight / 2 - VERTICAL_TEXT_EXTRA_SPACING
    : AXIS_LABEL_SPACE - textHeight / 2 + VERTICAL_TEXT_EXTRA_SPACING;
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
  leftSide: boolean,
  axisFontConfig: StyleFontConfiguration,
): void {
  const textBlock = displayBlock(state.skinParam, text, axisFontConfig, HorizontalAlignment.CENTER);
  const dim = textBlock.calculateDimension(ug.getStringBounder());
  const half = AXIS_LABEL_SPACE / 2;
  const xPos = leftSide ? -half - dim.getWidth() / 2 : half - dim.getWidth() / 2;
  const yPos = -dim.getHeight() - AXIS_TITLE_TOP_GAP;
  textBlock.drawU(ug.apply(UTranslate.dx(xPos).compose(UTranslate.dy(yPos))));
}

/** The categorical arm's vertical grid lines, up and down from the zero line. @see ChartRenderer.java:509-541 */
function drawCategoryGrid(
  state: ChartRendererState,
  ug: UGraphic,
  args: { categoryWidth: number; height: number; color: HColor; stroke: UStroke },
): void {
  const { yAxis, xAxisLabels } = state;
  let distanceToTop = args.height;
  let distanceToBottom = 0;
  if (yAxis.getMin() <= 0 && yAxis.getMax() >= 0) {
    const zeroRatio = (0 - yAxis.getMin()) / (yAxis.getMax() - yAxis.getMin());
    distanceToTop = args.height * (1.0 - zeroRatio);
    distanceToBottom = args.height * zeroRatio;
  }
  const line = ug.apply(fore(args.color)).apply(args.stroke);
  for (let i = 0; i < xAxisLabels.length; i++) {
    const gridX = (i + CATEGORY_CENTER) * args.categoryWidth;
    if (distanceToTop > 0) line.apply(UTranslate.dx(gridX)).draw(ULine.vline(-distanceToTop));
    if (distanceToBottom > 0) line.apply(UTranslate.dx(gridX)).draw(ULine.vline(distanceToBottom));
  }
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
  const grid = gridStyleOf(state, args.lineColor);
  const spacing = xAxisTickSpacing !== undefined && xAxisTickSpacing > 0 ? xAxisTickSpacing : 1;

  if (state.xGridMode !== GridMode.OFF)
    drawCategoryGrid(state, ug, { categoryWidth, height: args.height, color: grid.color, stroke: grid.stroke });

  for (let i = 0; i < xAxisLabels.length; i++) {
    if (i % spacing !== 0) continue;
    const labelX = (i + CATEGORY_CENTER) * categoryWidth;
    ug.apply(UTranslate.dx(labelX)).draw(ULine.vline(TICK_SIZE));
    drawXLabel(state, ug, labelX, xAxisLabels[i]!, args.fontConfig);
  }
  drawXAxisTitle(state, ug, args.width, args.fontConfig);
}

/** The range and start both numeric h-axis loops walk. @see ChartRenderer.java:579-598, 730-745 */
function numericXTicks(state: ChartRendererState, xAxis: ChartAxis): number[] {
  const { xAxisTickSpacing } = state;
  const range = xAxis.getMax() - xAxis.getMin();
  const tickInterval =
    xAxisTickSpacing !== undefined && xAxisTickSpacing > 0 ? xAxisTickSpacing : range / AUTO_TICK_DIVISIONS;
  const startValue = Math.floor(xAxis.getMin() / tickInterval) * tickInterval;
  const tolerance = tickInterval * TICK_TOLERANCE;
  const values: number[] = [];
  for (let value = startValue; value <= xAxis.getMax() + tolerance; value += tickInterval) {
    if (value < xAxis.getMin() - tolerance || value > xAxis.getMax() + tolerance) continue;
    values.push(value);
  }
  return values;
}

/** The numeric arm, for coordinate pairs. @see ChartRenderer.java:577-628 */
function drawNumericXAxis(
  state: ChartRendererState,
  ug: UGraphic,
  args: { xAxis: ChartAxis; width: number; fontConfig: StyleFontConfiguration },
): void {
  for (const value of numericXTicks(state, args.xAxis)) {
    const x = args.xAxis.valueToPixel(value, 0, args.width);
    ug.apply(UTranslate.dx(x)).draw(ULine.vline(TICK_SIZE));
    drawXLabel(state, ug, x, formatAxisValue(value), args.fontConfig);
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
  const range = axis.getMax() - axis.getMin();

  for (let i = 0; i <= NUM_TICKS_HORIZONTAL; i++) {
    const value = axis.getMin() + (i * range) / NUM_TICKS_HORIZONTAL;
    const x = (width * i) / NUM_TICKS_HORIZONTAL;
    ug.apply(UTranslate.dx(x)).draw(ULine.vline(TICK_SIZE));
    drawXLabel(state, ug, x, javaFormatF(value, 0), fontConfig);
  }

  const title = axis.getTitle();
  if (title === '') return;
  const titleBlock = displayBlock(state.skinParam, title, fontConfig, HorizontalAlignment.CENTER);
  const titleWidth = titleBlock.calculateDimension(ug.getStringBounder()).getWidth();
  titleBlock.drawU(ug.apply(UTranslate.dx(width / 2 - titleWidth / 2).compose(UTranslate.dy(X_TITLE_BELOW))));
}

/**
 * `xAxis` is never null, so this always runs, and `drawYAxis`'s grid arm never does.
 * @see ChartRenderer.java:704-773
 */
export function drawGridLines(
  state: ChartRendererState,
  ugIn: UGraphic,
  args: { plotWidth: number; plotHeight: number; lineColor: HColor },
): void {
  const { xAxis, yAxis, xGridMode, yGridMode } = state;
  if (xAxis === undefined) return;

  const { color, stroke } = gridStyleOf(state, args.lineColor);
  const ug = ugIn.apply(fore(color)).apply(stroke);

  if (xGridMode !== GridMode.OFF) {
    for (const value of numericXTicks(state, xAxis)) {
      const x = xAxis.valueToPixel(value, 0, args.plotWidth);
      ug.apply(UTranslate.dx(x)).draw(ULine.vline(args.plotHeight));
    }
  }

  if (yGridMode !== GridMode.OFF) drawHorizontalGridLines(ug, yAxis, args);
}

/** @see ChartRenderer.java:752-771 */
function drawHorizontalGridLines(
  ug: UGraphic,
  yAxis: ChartAxis,
  args: { plotWidth: number; plotHeight: number },
): void {
  const range = yAxis.getMax() - yAxis.getMin();
  const tickInterval = yAxis.hasTickSpacing() ? yAxis.getTickSpacing()! : range / AUTO_TICK_DIVISIONS;
  const startValue = Math.ceil(yAxis.getMin() / tickInterval) * tickInterval;
  const tolerance = tickInterval * TICK_TOLERANCE;

  for (let value = startValue; value <= yAxis.getMax() + tolerance; value += tickInterval) {
    if (value < yAxis.getMin() - tolerance || value > yAxis.getMax() + tolerance) continue;
    const y = args.plotHeight * (1.0 - (value - yAxis.getMin()) / (yAxis.getMax() - yAxis.getMin()));
    ug.apply(UTranslate.dy(y)).draw(ULine.hline(args.plotWidth));
  }
}
