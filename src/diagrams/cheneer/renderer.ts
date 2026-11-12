/**
 * Chen EER export: `TextBlockExporter`'s export of the {@link ChenSvekResult} on the klimt substrate (the board
 * plugin's shape, `board/index.ts`). Canvas = the block's `calculateDimension` plus `calculateMargin`, the block
 * drawn translated by the top-left margin, `scale`/`dpi` resolved against that final dimension. With chrome the
 * fragment is the raw block around `BODY_ANCHOR` carrying its margin as `exportMargin`: chrome composes around the
 * raw block and `finalizeTitledDiagramFragment` applies the margin and scale after. Adapted from
 * `activity-legacy/renderer.ts` (cheneer D2).
 *
 * Printed type: the jar writes `data-diagram-type="CHEN_EER"` (D4), which is also the fragment's routing key
 * ({@link CHEN_EER_ROUTE}), so `assemble-svg.ts` finalizes it with the titled-diagram tail and no separate printed
 * type is carried.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/core/TextBlockExporter.java:153-209, 292-294
 */
import { isDisplayPositionedNull, isEmpty } from '../../core/annotations/index.js';
import type { InkBox } from '../../core/annotations/body-ink.js';
import { addWarnings } from '../../core/annotations/WarningBannerBlock.js';
import type { RenderFragment } from '../../core/dispatcher.js';
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
import type { ChenEerDiagram } from './ChenEerDiagram.js';
import { EntityImageDegenerated } from '../../core/svek/EntityImageDegenerated.js';
import type { ChenGeometry } from './layout.js';
import { calculateBackColor, calculateMargin, muteColorMapper } from './renderer-document.js';
import { ChenSvekResult } from './renderer-svek-result.js';

/**
 * `DiagramType.CHEN_EER.name()`: the printed `data-diagram-type` and the routing key `assemble-svg.ts` finalizes
 * with the titled-diagram tail (D4). @see TextBlockExporter.java:292-294
 */
export const CHEN_EER_ROUTE = 'CHEN_EER';
/** `EntityImageSimpleEmpty#calculateDimension`. @see GraphvizImageBuilder.java:184 */
const EMPTY_SIZE = 10;

/** The geometry and what the draw needs besides it. */
export interface ChenRenderInput {
  readonly geometry: ChenGeometry;
  readonly diagram: ChenEerDiagram;
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

function svgGraphic(diagram: ChenEerDiagram, measurer: StringMeasurer, pass: DrawPass): UGraphicSvg {
  const option = basicSvgOption({
    ...lengthAdjustOverride(diagram.getSkinParam().getlengthAdjust()),
    minDim: { width: pass.minDim.getWidth(), height: pass.minDim.getHeight() },
    backcolor: calculateBackColor(diagram),
    colorMapper: muteColorMapper(diagram),
    scale: pass.scale,
    rootAttributes: new Map([['data-diagram-type', CHEN_EER_ROUTE]]),
  });
  return UGraphicSvg.build(0, option, VERSION_PLACEHOLDER, driverBounderFor(measurer), measurer);
}

/** The text block drawn per `pass` (TextBlockExporter.java:165-176). */
function drawSvg(diagram: ChenEerDiagram, measurer: StringMeasurer, pass: DrawPass): string {
  const ug = svgGraphic(diagram, measurer, pass);
  let drawn: UGraphic = ug.apply(pass.translate);
  if (diagram.isHandwritten()) drawn = new UGraphicHandwritten(drawn);
  pass.textBlock.drawU(drawn);
  return ug.getSvgString();
}

/** Draws per `pass` and unwraps the document to a fragment whose body is the flat drawing. @see TextBlockExporter.java:159-176 */
function drawFragment(diagram: ChenEerDiagram, measurer: StringMeasurer, pass: DrawPass): RenderFragment {
  const backcolor = toSvgPaint(calculateBackColor(diagram), muteColorMapper(diagram));
  const svg = drawSvg(diagram, measurer, pass);
  const { width, height } = extractViewBoxDims(svg);
  const { body, extraDefs } = extractFlatContent(svg);
  const lengthAdjust = diagram.getSkinParam().getlengthAdjust();
  const fragment: RenderFragment = {
    body,
    width,
    height,
    diagramType: CHEN_EER_ROUTE,
    ...(lengthAdjust === undefined ? {} : { lengthAdjust }),
  };
  // A gradient backcolor leaves `backcolorString` null (SvgGraphics.java:178-183): no root `background:`.
  const withBackground =
    typeof backcolor === 'string'
      ? { ...fragment, background: backcolor }
      : { ...fragment, backgroundGradient: backcolor };
  const drawn = extraDefs.length > 0 ? { ...withBackground, extraDefs } : withBackground;
  return drawn;
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
function exportTextBlock(diagram: ChenEerDiagram, measurer: StringMeasurer, block: ExportedBlock): RenderFragment {
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
  diagram: ChenEerDiagram,
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

/** The text block `getTextBlock` returns for `input`. @see GraphvizImageBuilder.java:145-158 */
function textBlockOf(input: ChenRenderInput): TextBlock {
  const { geometry, diagram, measurer } = input;
  if (geometry.elk !== undefined) return geometry.elk;
  if (geometry.nodes.length === 0) return emptyBlock();
  if (geometry.degenerate) return new EntityImageDegenerated(geometry.nodes[0]!.image);
  return new ChenSvekResult({
    geometry,
    skinParam: diagram.getSkinParam(),
    inkWalk: (draw) => runInkWalk(draw, driverBounderFor(measurer), measurer),
  });
}

/** The diagram as the fragment `src/index.ts` chromes and assembles. */
export function renderChen(input: ChenRenderInput): RenderFragment {
  const { diagram, measurer } = input;
  const stringBounder = stringBounderFor(measurer);
  // `DiagramChromeFactory.create`'s first step, `addWarnings` (DiagramChromeFactory.java:128).
  const textBlock = addWarnings(textBlockOf(input), diagram.getWarnings(), muteColorMapper(diagram));
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
