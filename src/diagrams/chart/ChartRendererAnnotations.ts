/**
 * `drawAnnotations`. A numeric x on a vertical chart reads `yAxis` and sets `x`,
 * and on a horizontal chart sets `y`: it looks wrong and it is the jar.
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/chart/ChartRenderer.java:1277-1420
 */
import type { FontConfiguration } from '../../core/abel/FontConfiguration.js';
import { HorizontalAlignment } from '../../core/klimt/geom/HorizontalAlignment.js';
import type { TextBlock } from '../../core/klimt/shape/TextBlock.js';
import { ULine } from '../../core/klimt/shape/ULine.js';
import { UPolygon } from '../../core/klimt/shape/UPolygon.js';
import type { UGraphic } from '../../core/klimt/UGraphic.js';
import { UStroke } from '../../core/klimt/UStroke.js';
import { UTranslate } from '../../core/klimt/UTranslate.js';
import type { HColor } from '../../core/style/Value.js';
import type { ChartAnnotation } from './ChartAnnotation.js';
import { Orientation } from './chart-modes.js';
import {
  asNullable,
  back,
  displayBlock,
  fore,
  getAnnotationStyleSignature,
  lineColorOf,
  mergedStyle,
  type ChartRendererState,
} from './ChartStyles.js';

/** Space kept for the arrow, also the text's distance from the point. @see ChartRenderer.java:1354 */
const ARROW_SPACE = 40;
/** The arrow's gap from the text and from the point. @see ChartRenderer.java:1366-1367 */
const ARROW_GAP = 5;
/** Half the arrowhead's width. @see ChartRenderer.java:1379 */
const ARROWHEAD_HALF_WIDTH = 5;
/** The arrowhead's height. @see ChartRenderer.java:1379 */
const ARROWHEAD_HEIGHT = 8;
/** A text with no arrow, above its point. @see ChartRenderer.java:1417 */
const NO_ARROW_GAP = 5;
/** A category's centre. @see ChartRenderer.java:1330 */
const CATEGORY_CENTER = 0.5;

/** What the plot gives `drawAnnotations`. */
interface AnnotationPlot {
  readonly plotWidth: number;
  readonly plotHeight: number;
}

/** The point, or `undefined` for an unknown label's `continue`. @see ChartRenderer.java:1306-1344 */
function annotationPoint(
  state: ChartRendererState,
  annotation: ChartAnnotation,
  plot: AnnotationPlot,
): { x: number; y: number } | undefined {
  const { yAxis, orientation, xAxisLabels } = state;
  const { plotWidth, plotHeight } = plot;
  const horizontal = orientation === Orientation.HORIZONTAL;
  const range = yAxis.getMax() - yAxis.getMin();
  let x = 0;
  let y = 0;

  const xPosition = annotation.getXPosition();
  if (typeof xPosition === 'number') {
    if (horizontal) y = plotHeight * (1.0 - (xPosition - yAxis.getMin()) / range);
    else x = plotWidth * ((xPosition - yAxis.getMin()) / range);
  } else {
    const index = xAxisLabels.indexOf(xPosition);
    if (index < 0) return undefined;
    if (horizontal) y = (plotHeight * (index + CATEGORY_CENTER)) / xAxisLabels.length;
    else x = (plotWidth * (index + CATEGORY_CENTER)) / xAxisLabels.length;
  }

  if (horizontal) x = plotWidth * ((annotation.getYPosition() - yAxis.getMin()) / range);
  else y = plotHeight * (1.0 - (annotation.getYPosition() - yAxis.getMin()) / range);
  return { x, y };
}

/** The arrow and head, drawn from `arrowStartY` towards the point. */
interface ArrowArgs {
  readonly x: number;
  readonly arrowStartY: number;
  readonly arrowEndY: number;
  readonly arrowColor: HColor;
  readonly arrowThickness: number;
}

/** @see ChartRenderer.java:1370-1384, 1398-1412 */
function drawArrow(ug: UGraphic, a: ArrowArgs): void {
  const delta = a.arrowEndY - a.arrowStartY;
  ug.apply(fore(a.arrowColor))
    .apply(UStroke.withThickness(a.arrowThickness))
    .apply(UTranslate.dx(a.x).compose(UTranslate.dy(a.arrowStartY)))
    .draw(new ULine(0, delta));

  const direction = delta > 0 ? -1 : 1;
  const arrowhead = new UPolygon();
  arrowhead.addPoint(0, 0);
  arrowhead.addPoint(-ARROWHEAD_HALF_WIDTH, direction * ARROWHEAD_HEIGHT);
  arrowhead.addPoint(ARROWHEAD_HALF_WIDTH, direction * ARROWHEAD_HEIGHT);
  ug.apply(fore(a.arrowColor))
    .apply(back(a.arrowColor))
    .apply(UTranslate.dx(a.x).compose(UTranslate.dy(a.arrowEndY)))
    .draw(arrowhead);
}

/** Text above and the arrow pointing down, or below and pointing up. @see ChartRenderer.java:1352-1413 */
function drawWithArrow(
  ug: UGraphic,
  textBlock: TextBlock,
  point: { x: number; y: number },
  arrow: { arrowColor: HColor; arrowThickness: number },
): void {
  const { x, y } = point;
  const textDim = textBlock.calculateDimension(ug.getStringBounder());
  const textX = x - textDim.getWidth() / 2;
  const placeAbove = y > textDim.getHeight() + ARROW_SPACE;
  const textY = placeAbove ? y - textDim.getHeight() - ARROW_SPACE : y + ARROW_SPACE;
  textBlock.drawU(ug.apply(UTranslate.dx(textX).compose(UTranslate.dy(textY))));

  const arrowStartY = placeAbove ? textY + textDim.getHeight() + ARROW_GAP : textY - ARROW_GAP;
  const arrowEndY = placeAbove ? y - ARROW_GAP : y + ARROW_GAP;
  const arrowLength = placeAbove ? arrowEndY - arrowStartY : arrowStartY - arrowEndY;
  if (arrowLength > 0) drawArrow(ug, { x, arrowStartY, arrowEndY, ...arrow });
}

/** @see ChartRenderer.java:1277-1419 */
export function drawAnnotations(
  state: ChartRendererState,
  ug: UGraphic,
  plot: AnnotationPlot,
  lineColor: HColor,
): void {
  const { annotations, skinParam } = state;
  if (annotations.length === 0) return;

  const annotationStyle = mergedStyle(getAnnotationStyleSignature(), skinParam);
  const fontConfig: FontConfiguration = annotationStyle.getFontConfiguration(skinParam.getIHtmlColorSet());
  // Java's `== null` chain ends in `#000000` then `lineColor`: the first read never answers null.
  const arrowColor = asNullable(lineColorOf(annotationStyle, skinParam)) ?? lineColor;
  const arrowThickness = annotationStyle.value('LineThickness').asDouble();

  for (const annotation of annotations) {
    const point = annotationPoint(state, annotation, plot);
    if (point === undefined) continue;

    const textBlock = displayBlock(skinParam, annotation.getText(), fontConfig, HorizontalAlignment.LEFT);
    if (annotation.isShowArrow()) {
      drawWithArrow(ug, textBlock, point, { arrowColor, arrowThickness });
    } else {
      const textDim = textBlock.calculateDimension(ug.getStringBounder());
      const dx = point.x - textDim.getWidth() / 2;
      const dy = point.y - textDim.getHeight() - NO_ARROW_GAP;
      textBlock.drawU(ug.apply(UTranslate.dx(dx).compose(UTranslate.dy(dy))));
    }
  }
}
