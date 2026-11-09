/**
 * Legacy activity export: `TextBlockExporter`'s export of the {@link ActivityLegacySvekResult} on the klimt
 * substrate (the board plugin's shape, `board/index.ts`). Canvas = the block's `calculateDimension` plus
 * `calculateMargin`, the block drawn translated by the top-left margin, `scale`/`dpi` resolved against that final
 * dimension. With chrome the fragment is the raw block around `BODY_ANCHOR` carrying its margin as `exportMargin`:
 * chrome composes around the raw block and `finalizeTitledDiagramFragment` applies the margin and scale after.
 *
 * Printed type: the jar writes `data-diagram-type="ACTIVITY"` (D4); the fragment's routing key is
 * {@link ACTIVITY_LEGACY_ROUTE} so activitydiagram3's `ACTIVITY` finalizer is not reached, and
 * `withPrintedDiagramType` (`core/printed-diagram-type.ts`) carries the printed value.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/core/TextBlockExporter.java:153-209, 292-294
 */
import { isDisplayPositionedNull, isEmpty } from '../../core/annotations/index.js';
import type { InkBox } from '../../core/annotations/body-ink.js';
import { addWarnings } from '../../core/annotations/WarningBannerBlock.js';
import type { RenderFragment } from '../../core/dispatcher.js';
import { withPrintedDiagramType } from '../../core/printed-diagram-type.js';
import { toSvgPaint } from '../../core/klimt/color/ColorMapper.js';
import { extractFlatContent, extractViewBoxDims, VERSION_PLACEHOLDER } from '../../core/klimt/document-shell.js';
import { UGraphicHandwritten } from '../../core/klimt/drawing/hand/UGraphicHandwritten.js';
import { lengthAdjustOverride } from '../../core/klimt/drawing/svg/svg-option.js';
import { basicSvgOption } from '../../core/klimt/drawing/svg/svg-graphics-core.js';
import { UGraphicSvg } from '../../core/klimt/drawing/svg/u-graphic-svg.js';
import type { StringBounder } from '../../core/klimt/font/StringBounder.js';
import type { ClockwiseTopRightBottomLeft } from '../../core/klimt/geom/ClockwiseTopRightBottomLeft.js';
import { XDimension2D } from '../../core/klimt/geom/XDimension2D.js';
import type { TextBlock } from '../../core/klimt/shape/TextBlock.js';
import { TextBlockUtils } from '../../core/klimt/shape/TextBlockUtils.js';
import type { UGraphic } from '../../core/klimt/UGraphic.js';
import { UTranslate } from '../../core/klimt/UTranslate.js';
import type { StringMeasurer } from '../../core/measurer.js';
import { isExportScaled, resolveScaleFactor } from '../../core/scale-command.js';
import { BODY_ANCHOR } from '../../core/TextBlockExporter.js';
import { runInkWalk, driverBounderFor } from '../../core/klimt/drawing/ink-walk.js';
import type { ActivityDiagram } from './ActivityDiagram.js';
import type { ActivityLegacyGeometry } from './layout.js';
import { calculateBackColor, calculateMargin, muteColorMapper } from './renderer-document.js';
import { ActivityLegacySvekResult } from './renderer-svek-result.js';

/** The routing key `assemble-svg.ts` finalizes with the titled-diagram tail (D4). */
export const ACTIVITY_LEGACY_ROUTE = 'ACTIVITY_LEGACY';
/** `DiagramType.ACTIVITY.name()`, the printed `data-diagram-type`. @see TextBlockExporter.java:292-294 */
export const DIAGRAM_TYPE_ACTIVITY = 'ACTIVITY';
/** `EntityImageSimpleEmpty#calculateDimension`. @see GraphvizImageBuilder.java:184 */
const EMPTY_SIZE = 10;

/** The geometry and what the draw needs besides it. */
export interface ActivityLegacyRenderInput {
  readonly geometry: ActivityLegacyGeometry;
  readonly diagram: ActivityDiagram;
  readonly measurer: StringMeasurer;
}

/** One klimt pass over the text block. */
interface DrawPass {
  readonly textBlock: TextBlock;
  readonly minDim: XDimension2D;
  readonly scale: number;
  readonly translate: UTranslate;
}

/** `fileFormatOption.getDefaultStringBounder(...)`. */
function stringBounderFor(measurer: StringMeasurer): StringBounder {
  return UGraphicSvg.build(
    0,
    basicSvgOption(),
    VERSION_PLACEHOLDER,
    driverBounderFor(measurer),
    measurer,
  ).getStringBounder();
}

function svgGraphic(diagram: ActivityDiagram, measurer: StringMeasurer, pass: DrawPass): UGraphicSvg {
  const option = basicSvgOption({
    ...lengthAdjustOverride(diagram.getSkinParam().getlengthAdjust()),
    minDim: { width: pass.minDim.getWidth(), height: pass.minDim.getHeight() },
    backcolor: calculateBackColor(diagram),
    colorMapper: muteColorMapper(diagram),
    scale: pass.scale,
    rootAttributes: new Map([['data-diagram-type', DIAGRAM_TYPE_ACTIVITY]]),
  });
  return UGraphicSvg.build(0, option, VERSION_PLACEHOLDER, driverBounderFor(measurer), measurer);
}

/** The text block drawn per `pass` (TextBlockExporter.java:165-176). */
function drawSvg(diagram: ActivityDiagram, measurer: StringMeasurer, pass: DrawPass): string {
  const ug = svgGraphic(diagram, measurer, pass);
  let drawn: UGraphic = ug.apply(pass.translate);
  if (diagram.isHandwritten()) drawn = new UGraphicHandwritten(drawn);
  pass.textBlock.drawU(drawn);
  return ug.getSvgString();
}

/** Draws per `pass` and unwraps the document to a fragment whose body is the flat drawing. @see TextBlockExporter.java:159-176 */
function drawFragment(diagram: ActivityDiagram, measurer: StringMeasurer, pass: DrawPass): RenderFragment {
  const backcolor = toSvgPaint(calculateBackColor(diagram), muteColorMapper(diagram));
  const svg = drawSvg(diagram, measurer, pass);
  const { width, height } = extractViewBoxDims(svg);
  const { body, extraDefs } = extractFlatContent(svg);
  const lengthAdjust = diagram.getSkinParam().getlengthAdjust();
  const fragment: RenderFragment = {
    body,
    width,
    height,
    diagramType: ACTIVITY_LEGACY_ROUTE,
    ...(lengthAdjust === undefined ? {} : { lengthAdjust }),
  };
  // A gradient backcolor leaves `backcolorString` null (SvgGraphics.java:178-183): no root `background:`.
  const withBackground =
    typeof backcolor === 'string'
      ? { ...fragment, background: backcolor }
      : { ...fragment, backgroundGradient: backcolor };
  const drawn = extraDefs.length > 0 ? { ...withBackground, extraDefs } : withBackground;
  return withPrintedDiagramType(drawn, DIAGRAM_TYPE_ACTIVITY);
}

/** `TextBlockUtils.getMinMax(block, sb, false)`: the ink a mainframe frames (`DiagramChromeFactory.java:332-337`). */
function textBlockInk(textBlock: TextBlock, stringBounder: StringBounder): InkBox {
  const minMax = TextBlockUtils.getMinMax(textBlock, stringBounder, false);
  return { minX: minMax.getMinX(), minY: minMax.getMinY(), maxX: minMax.getMaxX(), maxY: minMax.getMaxY() };
}

interface ExportedBlock {
  readonly textBlock: TextBlock;
  readonly dim: XDimension2D;
  readonly margin: ClockwiseTopRightBottomLeft;
}

/** `TextBlockExporter#exportTo` for SVG, no chrome. @see TextBlockExporter.java:159-209 */
function exportTextBlock(diagram: ActivityDiagram, measurer: StringMeasurer, block: ExportedBlock): RenderFragment {
  const { textBlock, dim, margin } = block;
  const minDim = new XDimension2D(
    dim.getWidth() + margin.getLeft() + margin.getRight(),
    dim.getHeight() + margin.getTop() + margin.getBottom(),
  );
  const scale = resolveScaleFactor(
    diagram.scale,
    minDim.getWidth(),
    minDim.getHeight(),
    diagram.getSkinParam().getDpi(),
  );
  return drawFragment(diagram, measurer, {
    textBlock,
    minDim,
    scale,
    translate: new UTranslate(margin.getLeft(), margin.getTop()),
  });
}

/**
 * With chrome, upstream decorates the RAW block and exports the result with the margin and scale
 * (UgDiagram.java:123-131): the fragment is the raw block's dimension around `BODY_ANCHOR`, with the margin,
 * `scale` and `dpi` for `finalizeTitledDiagramFragment`, which calls `drawBodyAt` once with the resolved factor.
 */
function rawTextBlock(
  diagram: ActivityDiagram,
  measurer: StringMeasurer,
  block: ExportedBlock,
  frameInk: { frameInk?: InkBox },
): RenderFragment {
  const { textBlock, dim, margin } = block;
  const background = drawFragment(diagram, measurer, {
    textBlock,
    minDim: dim,
    scale: 1,
    translate: new UTranslate(0, 0),
  });
  const drawBodyAt = (scale: number, dx: number, dy: number): Pick<RenderFragment, 'body' | 'width' | 'height'> =>
    drawFragment(diagram, measurer, { textBlock, minDim: dim, scale, translate: new UTranslate(dx, dy) });
  const dpi = diagram.getSkinParam().getDpi();
  const anchored: RenderFragment = {
    ...background,
    body: BODY_ANCHOR,
    width: dim.getWidth(),
    height: dim.getHeight(),
    dpi,
    exportMargin: margin,
    drawBodyAt,
    ...(isExportScaled(diagram.scale, dpi) ? { numbersDeferred: true as const } : {}),
    ...frameInk,
  };
  return diagram.scale === undefined ? anchored : { ...anchored, scaleSpec: diagram.scale };
}

/** `EntityImageSimpleEmpty`: a block of nothing, 10x10. @see GraphvizImageBuilder.java:146-147, 184 */
function emptyBlock(): TextBlock {
  return TextBlockUtils.empty(EMPTY_SIZE, EMPTY_SIZE);
}

/** The text block `getTextBlock` returns for `input`. */
function textBlockOf(input: ActivityLegacyRenderInput, stringBounder: StringBounder): TextBlock {
  const { geometry, diagram, measurer } = input;
  if (geometry.nodes.length === 0) return emptyBlock();
  return new ActivityLegacySvekResult({
    geometry,
    skinParam: diagram.getSkinParam(),
    inkWalk: (draw) => runInkWalk(draw, driverBounderFor(measurer), measurer),
    stringBounder,
  });
}

/** The diagram as the fragment `src/index.ts` chromes and assembles. */
export function renderActivityLegacy(input: ActivityLegacyRenderInput): RenderFragment {
  const { diagram, measurer } = input;
  const stringBounder = stringBounderFor(measurer);
  // `DiagramChromeFactory.create`'s first step, `addWarnings` (DiagramChromeFactory.java:128).
  const textBlock = addWarnings(textBlockOf(input, stringBounder), diagram.getWarnings(), muteColorMapper(diagram));
  const block: ExportedBlock = {
    textBlock,
    dim: textBlock.calculateDimension(stringBounder),
    margin: calculateMargin(diagram),
  };
  if (isEmpty(diagram.annotations)) return exportTextBlock(diagram, measurer, block);
  const frameInk = isDisplayPositionedNull(diagram.annotations.mainFrame)
    ? {}
    : { frameInk: textBlockInk(textBlock, stringBounder) };
  return rawTextBlock(diagram, measurer, block, frameInk);
}
