/**
 * EBNF plugin — `PSystemEbnfFactory` (parse), then `TextBlockExporter`'s
 * export of `PSystemEbnf#getTextBlock` on the klimt substrate: canvas = the
 * text block's `calculateDimension` plus `calculateMargin` (`TitledDiagram`'s
 * `same(10)` by default, TitledDiagram.java:273-276), the block drawn translated
 * by the top-left margin, `scale`/`dpi` resolved against that final dimension
 * (TextBlockExporter.java:159-209). `nwdiag/index.ts`'s shape (eep D2).
 *
 * With chrome (title/caption/legend/header/footer/mainframe) the fragment is
 * the raw block around `BODY_ANCHOR` carrying its `calculateMargin` result as
 * `exportMargin`: chrome composes around the raw block and
 * `core/TextBlockExporter.ts#finalizeTitledDiagramFragment` applies the margin
 * and `scale` after (UgDiagram.java:123-131).
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/ebnf/PSystemEbnfFactory.java
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/core/TextBlockExporter.java:153-209
 */
import { isDisplayPositionedNull, isEmpty } from '../../core/annotations/index.js';
import type { UmlSource } from '../../core/block-extractor.js';
import type { InkBox } from '../../core/annotations/body-ink.js';
import { addWarnings } from '../../core/annotations/WarningBannerBlock.js';
import type { RenderFragment, SyncPlugin } from '../../core/dispatcher.js';
import { ColorMapper, toSvgPaint } from '../../core/klimt/color/ColorMapper.js';
import { fromString as colorOrderFromString } from '../../core/klimt/color/ColorOrder.js';
import { HColorGradient } from '../../core/klimt/color/HColorGradient.js';
import { HColorSimple } from '../../core/klimt/color/HColorSimple.js';
import { extractFlatContent, extractViewBoxDims, VERSION_PLACEHOLDER } from '../../core/klimt/document-shell.js';
import { UGraphicHandwritten } from '../../core/klimt/drawing/hand/UGraphicHandwritten.js';
import type { StringBounder as DriverStringBounder } from '../../core/klimt/drawing/svg/driver-text-svg.js';
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
import { StyleSignatureBasic } from '../../core/style/StyleSignatureBasic.js';
import { BODY_ANCHOR } from '../../core/TextBlockExporter.js';
import { PreprocessingArtifact } from '../../core/tim/PreprocessingArtifact.js';
import type { PSystemEbnf } from './PSystemEbnf.js';
import { parseEbnf } from './PSystemEbnfFactory.js';
import { internalEmojiStoreFrom } from '../../core/internal-emoji-store.js';

/** `DiagramType.EBNF.name()`, the root `data-diagram-type` value.
 *  @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/core/TextBlockExporter.java:292-294 */
const DIAGRAM_TYPE_EBNF = 'EBNF';

/** `DiagramType.EBNF.getStyleName()`.
 *  @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/core/DiagramType.java:280-281 */
const EBNF_STYLE_NAME = 'ebnf';

/** The parsed diagram and the measurer its text is sized with. */
export interface EbnfGeometry {
  readonly diagram: PSystemEbnf;
  readonly measurer: StringMeasurer;
}

/** The width-only driver half of `UGraphicSvg`'s two text seams (the
 *  mindmap/salt plugins' local adapter). */
function driverBounderFor(measurer: StringMeasurer): DriverStringBounder {
  return {
    calculateDimension(font, text) {
      return { width: measurer.measure(text, font).width };
    },
  };
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

/**
 * `TitledDiagram#calculateBackColor`: `root, document, ebnf`'s
 * `BackGroundColor`. Kept an `HColor` so a `@media dark` partner survives to
 * the mapper. java:284-285's `== null` fallback to `HColors.transparent()`
 * is not reachable: the port's `asColor` is typed non-null (the
 * `PSystemSalt#calculateBackColor` precedent).
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/TitledDiagram.java:279-289
 */
export function calculateBackColor(diagram: PSystemEbnf): HColorSimple | HColorGradient {
  const skinParam = diagram.getSkinParam();
  // `getMergedStyle` answers undefined only for an undefined builder; ebnf's always exists.
  const style = StyleSignatureBasic.of('root', 'document', EBNF_STYLE_NAME).getMergedStyle(
    skinParam.getCurrentStyleBuilder(),
  )!;
  const color = style.value('BackGroundColor').asColor(skinParam.getIHtmlColorSet());
  if (color instanceof HColorSimple || color instanceof HColorGradient) return color;
  throw new Error('ClassCastException: a document BackGroundColor is a simple or gradient colour');
}

/** `reversecolor`'s arms: `dark` (any case) is `LIGTHNESS_INVERSE`, a
 *  `ColorOrder` name is `reverse(order)`, anything else (or unset) `init`.
 *  @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/TitledDiagram.java:300-313 */
function reverseColorMapper(reversecolor: string | null): ColorMapper {
  if (reversecolor === null) return ColorMapper.IDENTITY;
  if (reversecolor.toLowerCase() === 'dark') return ColorMapper.LIGTHNESS_INVERSE;
  const order = colorOrderFromString(reversecolor);
  return order === undefined ? ColorMapper.IDENTITY : ColorMapper.reverse(order);
}

/**
 * `TitledDiagram#muteColorMapper(init)` with `init` the identity (the
 * `FileFormatOption` default): `mode dark` (`SkinParam.isDark`,
 * SkinParam.java:114-116), else `monochrome true|reverse`, else the
 * `reversecolor` arms. Seeds `SvgOption.colorMapper`
 * (`fileFormatOption.withColorMapper(mutedMapper)`, UgDiagram.java:134-135).
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/TitledDiagram.java:291-313
 */
export function muteColorMapper(diagram: PSystemEbnf): ColorMapper {
  const skinParam = diagram.getSkinParam();
  if (skinParam.getValue('mode')?.toLowerCase() === 'dark') return ColorMapper.DARK_MODE;
  const monochrome = skinParam.getValue('monochrome');
  if (monochrome === 'true') return ColorMapper.MONOCHROME;
  if (monochrome === 'reverse') return ColorMapper.MONOCHROME_REVERSE;
  return reverseColorMapper(skinParam.getValue('reversecolor'));
}

/**
 * `TextBlockExporter.Builder#calculateMargin`: the merged `{root, document}`
 * style's `Margin` when it has one, else `getDefaultMargins()` (`none()`,
 * TitledDiagram.java:273-276).
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/core/TextBlockExporter.java:510-516
 */
export function calculateMargin(diagram: PSystemEbnf): ClockwiseTopRightBottomLeft {
  const style = StyleSignatureBasic.of('root', 'document').getMergedStyle(
    diagram.getSkinParam().getCurrentStyleBuilder(),
  );
  if (style?.hasValue('Margin') === true) return style.getMargin();
  return diagram.getDefaultMargins();
}

/** One klimt pass over the text block. */
interface DrawPass {
  readonly textBlock: TextBlock;
  readonly minDim: XDimension2D;
  readonly scale: number;
  readonly translate: UTranslate;
}

function svgGraphic(diagram: PSystemEbnf, measurer: StringMeasurer, pass: DrawPass): UGraphicSvg {
  const lengthAdjust = diagram.getSkinParam().getlengthAdjust();
  const option = basicSvgOption({
    ...lengthAdjustOverride(lengthAdjust),
    minDim: { width: pass.minDim.getWidth(), height: pass.minDim.getHeight() },
    backcolor: calculateBackColor(diagram),
    colorMapper: muteColorMapper(diagram),
    scale: pass.scale,
    rootAttributes: new Map([['data-diagram-type', DIAGRAM_TYPE_EBNF]]),
  });
  return UGraphicSvg.build(0, option, VERSION_PLACEHOLDER, driverBounderFor(measurer), measurer);
}

/** The text block drawn per `pass` (TextBlockExporter.java:165-176): the
 *  margin translate, then `UGraphicHandwritten` when handwritten. */
function drawSvg(diagram: PSystemEbnf, measurer: StringMeasurer, pass: DrawPass): string {
  const ug = svgGraphic(diagram, measurer, pass);
  let drawn: UGraphic = ug.apply(pass.translate);
  if (diagram.isHandwritten()) drawn = new UGraphicHandwritten(drawn);
  pass.textBlock.drawU(drawn);
  return ug.getSvgString();
}

/**
 * Draws the text block per `pass` and unwraps the document to a fragment
 * whose body is the flat drawing (the klimt graphic paints a non-white
 * background `<rect>` itself). The fragment's `background` is the same
 * `backcolor.toSvg(mapper)` the klimt graphic paints (SvgGraphics.java:176-188).
 * @see TextBlockExporter.java:159-176
 */
function drawFragment(diagram: PSystemEbnf, measurer: StringMeasurer, pass: DrawPass): RenderFragment {
  const backcolor = toSvgPaint(calculateBackColor(diagram), muteColorMapper(diagram));
  const svg = drawSvg(diagram, measurer, pass);
  const { width, height } = extractViewBoxDims(svg);
  const { body, extraDefs } = extractFlatContent(svg);
  const lengthAdjust = diagram.getSkinParam().getlengthAdjust();
  const fragment: RenderFragment = {
    body,
    width,
    height,
    diagramType: DIAGRAM_TYPE_EBNF,
    ...(lengthAdjust === undefined ? {} : { lengthAdjust }),
  };
  // A gradient backcolor leaves `backcolorString` null (SvgGraphics.java:178-183):
  // no root `background:`, which `RenderFragment.backgroundGradient` carries.
  const withBackground =
    typeof backcolor === 'string'
      ? { ...fragment, background: backcolor }
      : { ...fragment, backgroundGradient: backcolor };
  return extraDefs.length > 0 ? { ...withBackground, extraDefs } : withBackground;
}

/** `TextBlockUtils.getMinMax(block, sb, false)`: the ink a mainframe
 *  frames (`DiagramChromeFactory.java:332-337`). */
function textBlockInk(textBlock: TextBlock, stringBounder: StringBounder): InkBox {
  const minMax = TextBlockUtils.getMinMax(textBlock, stringBounder, false);
  return { minX: minMax.getMinX(), minY: minMax.getMinY(), maxX: minMax.getMaxX(), maxY: minMax.getMaxY() };
}

/** The block `TextBlockExporter` exports: `addWarnings(getTextBlock)`, its
 *  dimension, and the `calculateMargin` result. */
interface ExportedBlock {
  readonly textBlock: TextBlock;
  readonly dim: XDimension2D;
  readonly margin: ClockwiseTopRightBottomLeft;
}

/**
 * `TextBlockExporter#exportTo` for SVG, no chrome: `calculateFinalDimension`
 * (the text block plus the margins, java:198-202) as `minDim`, the scale
 * resolved against it (`computeScaleFactor`, java:205-209), the margin
 * translate (java:173), then `textBlock.drawU`.
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/core/TextBlockExporter.java:159-209
 */
function exportTextBlock(diagram: PSystemEbnf, measurer: StringMeasurer, block: ExportedBlock): RenderFragment {
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
  const translate = new UTranslate(margin.getLeft(), margin.getTop());
  return drawFragment(diagram, measurer, { textBlock, minDim, scale, translate });
}

/**
 * With chrome, upstream decorates the RAW block (`UgDiagram#getExporter` →
 * `addChrome`, UgDiagram.java:123-131) and exports the result with the margin
 * and scale (TextBlockExporter.java:159-209). The chrome is composed outside
 * klimt here, so the fragment is the raw block's dimension around
 * `BODY_ANCHOR`, carrying the margin, `scale` and `dpi` for
 * `core/TextBlockExporter.ts#finalizeTitledDiagramFragment`, which calls
 * `drawBodyAt` once with the resolved factor and the anchor's translate.
 * The first pass at scale 1 supplies the background and the `<defs>` a
 * gradient colour needs (the mindmap plugin's shape): the text block's `drawU`
 * draws from the tile tree each time, so a second draw repeats the first.
 */
function rawTextBlock(
  diagram: PSystemEbnf,
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
    // Upstream draws the chrome through the document's one scaled `UGraphic`, so each
    // chrome number is formatted once, after the multiply (TextBlockExporter.java:165-177,
    // SvgGraphics.java:468-475): a scaled export draws its chrome deferred, as board does.
    ...(isExportScaled(diagram.scale, dpi) ? { numbersDeferred: true as const } : {}),
    ...frameInk,
  };
  return diagram.scale === undefined ? anchored : { ...anchored, scaleSpec: diagram.scale };
}

/** The diagram as the fragment `src/index.ts` chromes and assembles. */
export function renderEbnf(diagram: PSystemEbnf, measurer: StringMeasurer): RenderFragment {
  const stringBounder = stringBounderFor(measurer);
  // `DiagramChromeFactory.create`'s first step, `addWarnings` (DiagramChromeFactory.java:128).
  const textBlock = addWarnings(diagram.getTextBlock(), diagram.getWarnings(), muteColorMapper(diagram));
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

/** The `!option` directives the preprocessor collected, as `EaterOption` defines them on the artifact. */
function preprocessingArtifactOf(source: UmlSource): PreprocessingArtifact {
  const artifact = new PreprocessingArtifact();
  for (const [key, value] of source.styleSource?.options ?? []) artifact.getOption().define(key, value);
  return artifact;
}

export const ebnfPlugin: SyncPlugin<PSystemEbnf, EbnfGeometry> = {
  type: 'ebnf',

  parse(source, options) {
    const emoji = options?.assetStore === undefined ? undefined : internalEmojiStoreFrom(options.assetStore);
    return parseEbnf(source, preprocessingArtifactOf(source), emoji);
  },

  layoutSync(ast, _theme, measurer) {
    return { diagram: ast, measurer };
  },

  render(geo) {
    return renderEbnf(geo.diagram, geo.measurer);
  },
};
