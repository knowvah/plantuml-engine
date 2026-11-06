/**
 * `calculateLegendDimension`, `drawLegend` and `drawLegendScatterMarker`.
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/chart/ChartRenderer.java:1078-1275
 */
import type { StringBounder } from '../../core/klimt/font/StringBounder.js';
import { HorizontalAlignment } from '../../core/klimt/geom/HorizontalAlignment.js';
import { XDimension2D } from '../../core/klimt/geom/XDimension2D.js';
import { ULine } from '../../core/klimt/shape/ULine.js';
import { URectangle } from '../../core/klimt/shape/URectangle.js';
import type { UGraphic } from '../../core/klimt/UGraphic.js';
import { UStroke } from '../../core/klimt/UStroke.js';
import { UTranslate } from '../../core/klimt/UTranslate.js';
import type { Style } from '../../core/style/Style.js';
import type { HColor } from '../../core/style/Value.js';
import { LegendPosition } from './chart-modes.js';
import { SeriesType, type ChartSeries } from './ChartSeries.js';
import {
  asNullable,
  AXIS_LABEL_SPACE,
  back,
  displayBlock,
  fore,
  getAreaStyle,
  getBarStyle,
  getDefaultColor,
  getLegendStyleSignature,
  getLineStyle,
  getScatterStyle,
  LEGEND_ITEM_SPACING,
  LEGEND_MARGIN,
  LEGEND_SYMBOL_SIZE,
  LEGEND_TEXT_SPACING,
  lineColorOf,
  MARGIN,
  mergedStyle,
  type ChartRendererState,
  type StyleFontConfiguration,
} from './ChartStyles.js';
import { LINE_THICKNESS } from './LineRenderer.js';
import { drawMarker, markerShapeOf } from './ScatterRenderer.js';

/** The legend marker's share of a symbol. @see ChartRenderer.java:1238 */
const SCATTER_MARKER_RATIO = 0.7;

function isVerticalList(position: LegendPosition): boolean {
  return position === LegendPosition.LEFT || position === LegendPosition.RIGHT;
}

function legendFontOf(state: ChartRendererState): StyleFontConfiguration {
  const legendStyle = mergedStyle(getLegendStyleSignature(), state.skinParam);
  return legendStyle.getFontConfiguration(state.skinParam.getIHtmlColorSet());
}

/** @see ChartRenderer.java:1078-1112 */
export function calculateLegendDimension(state: ChartRendererState, stringBounder: StringBounder): XDimension2D {
  const { legendPosition, series, skinParam } = state;
  if (legendPosition === LegendPosition.NONE || series.length === 0) return new XDimension2D(0, 0);

  const fontConfig = legendFontOf(state);
  let maxWidth = 0;
  let totalHeight = 0;
  for (const s of series) {
    const dim = displayBlock(skinParam, s.getName(), fontConfig, HorizontalAlignment.LEFT).calculateDimension(
      stringBounder,
    );
    if (isVerticalList(legendPosition)) {
      maxWidth = Math.max(maxWidth, dim.getWidth());
      totalHeight += dim.getHeight() + LEGEND_ITEM_SPACING;
    } else {
      maxWidth += dim.getWidth() + LEGEND_SYMBOL_SIZE + LEGEND_TEXT_SPACING + LEGEND_ITEM_SPACING;
      totalHeight = Math.max(totalHeight, dim.getHeight());
    }
  }

  if (isVerticalList(legendPosition))
    return new XDimension2D(maxWidth + LEGEND_SYMBOL_SIZE + LEGEND_TEXT_SPACING + LEGEND_MARGIN * 2, totalHeight);
  return new XDimension2D(maxWidth, totalHeight + LEGEND_MARGIN * 2);
}

/** What `drawLegend` lays out against. */
export interface LegendFrame {
  readonly leftMargin: number;
  readonly topMargin: number;
  readonly plotWidth: number;
  readonly plotHeight: number;
}

/** The first item's position, or `undefined` for `default: return`, unreachable past the `NONE` test. @see ChartRenderer.java:1130-1151 */
function legendOrigin(state: ChartRendererState, frame: LegendFrame): { x: number; y: number } {
  const { leftMargin, topMargin, plotWidth, plotHeight } = frame;
  switch (state.legendPosition) {
    case LegendPosition.LEFT:
      return { x: MARGIN, y: topMargin };
    case LegendPosition.RIGHT: {
      const y2Space = state.y2Axis !== undefined ? AXIS_LABEL_SPACE : 0;
      return { x: leftMargin + plotWidth + y2Space + LEGEND_MARGIN, y: topMargin };
    }
    case LegendPosition.TOP:
      return { x: leftMargin, y: MARGIN };
    default:
      return { x: leftMargin, y: topMargin + plotHeight + AXIS_LABEL_SPACE + LEGEND_MARGIN };
  }
}

/** A square symbol: bar and area. @see ChartRenderer.java:1168-1171 */
function drawSquareSymbol(ug: UGraphic, color: HColor, x: number, y: number): void {
  ug.apply(fore(color))
    .apply(back(color))
    .apply(UTranslate.dx(x).compose(UTranslate.dy(y)))
    .draw(URectangle.build(LEGEND_SYMBOL_SIZE, LEGEND_SYMBOL_SIZE));
}

/** The `BackGroundColor` a bar or area takes when no explicit colour: its `!= null` is always true. @see ChartRenderer.java:1160-1167 */
function backGroundOr(style: Style, state: ChartRendererState, color: HColor, s: ChartSeries): HColor {
  if (s.getColor() !== undefined) return color;
  return asNullable(style.value('BackGroundColor').asColor(state.skinParam.getIHtmlColorSet())) ?? color;
}

/** @see ChartRenderer.java:1201-1239 */
function drawScatterSymbol(
  ug: UGraphic,
  state: ChartRendererState,
  s: ChartSeries,
  at: { color: HColor; x: number; y: number },
): void {
  const skinParam = state.skinParam;
  const scatterStyle = getScatterStyle(s, skinParam);
  const styleMarkerColor = asNullable(scatterStyle.value('MarkerColor').asColor(skinParam.getIHtmlColorSet()));
  // The `LineColor` arm needs a null `MarkerColor`, which `ValueNull` never answers.
  const markerColor = styleMarkerColor ?? at.color;
  drawMarker(ug, {
    color: markerColor,
    x: at.x + LEGEND_SYMBOL_SIZE / 2,
    y: at.y + LEGEND_SYMBOL_SIZE / 2,
    size: LEGEND_SYMBOL_SIZE * SCATTER_MARKER_RATIO,
    shape: markerShapeOf(scatterStyle, s),
  });
}

/** One item's symbol, by series type. @see ChartRenderer.java:1158-1239 */
function drawLegendSymbol(
  ug: UGraphic,
  state: ChartRendererState,
  s: ChartSeries,
  at: { color: HColor; x: number; y: number },
): void {
  const skinParam = state.skinParam;
  const { color, x, y } = at;
  switch (s.getType()) {
    case SeriesType.BAR:
      drawSquareSymbol(ug, backGroundOr(getBarStyle(s, skinParam), state, color, s), x, y);
      break;
    case SeriesType.LINE: {
      const styleColor =
        s.getColor() === undefined ? asNullable(lineColorOf(getLineStyle(s, skinParam), skinParam)) : undefined;
      ug.apply(fore(styleColor ?? color))
        .apply(UStroke.withThickness(LINE_THICKNESS))
        .apply(UTranslate.dx(x).compose(UTranslate.dy(y + LEGEND_SYMBOL_SIZE / 2)))
        .draw(ULine.hline(LEGEND_SYMBOL_SIZE));
      break;
    }
    case SeriesType.AREA:
      drawSquareSymbol(ug, backGroundOr(getAreaStyle(s, skinParam), state, color, s), x, y);
      break;
    default:
      drawScatterSymbol(ug, state, s, at);
  }
}

/** @see ChartRenderer.java:1114-1255 */
export function drawLegend(state: ChartRendererState, ug: UGraphic, frame: LegendFrame): void {
  const { legendPosition, series, skinParam } = state;
  if (legendPosition === LegendPosition.NONE || series.length === 0) return;

  const fontConfig = legendFontOf(state);
  const origin = legendOrigin(state, frame);
  let currentX = origin.x;
  let currentY = origin.y;

  for (let i = 0; i < series.length; i++) {
    const s = series[i]!;
    const color = s.getColor() ?? getDefaultColor(i, skinParam);
    drawLegendSymbol(ug, state, s, { color, x: currentX, y: currentY });

    const textBlock = displayBlock(skinParam, s.getName(), fontConfig, HorizontalAlignment.LEFT);
    const textDim = textBlock.calculateDimension(ug.getStringBounder());
    textBlock.drawU(
      ug.apply(UTranslate.dx(currentX + LEGEND_SYMBOL_SIZE + LEGEND_TEXT_SPACING).compose(UTranslate.dy(currentY))),
    );

    if (isVerticalList(legendPosition)) currentY += textDim.getHeight() + LEGEND_ITEM_SPACING;
    else currentX += LEGEND_SYMBOL_SIZE + LEGEND_TEXT_SPACING + textDim.getWidth() + LEGEND_ITEM_SPACING;
  }
}
