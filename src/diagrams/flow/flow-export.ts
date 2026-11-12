/**
 * `FlowDiagram`'s export: `TitledDiagram`'s `TextBlockExporter` path with no
 * chrome (no annotation command exists in `FlowDiagramFactory`) and no scale
 * (no `scale` command): the warnings banner, the `{root, document}` margin
 * (else `getDefaultMargins()`, `FlowDiagram`'s `same(0)`), the background
 * of `TitledDiagram#calculateBackColor` (`UgDiagram.java:130`; the block's
 * own `getBackcolor()` is `null` and the exporter never reads it), and
 * `data-diagram-type="FLOW"`. `bpm/bpm-export.ts` is the precedent (flp D3).
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/core/TextBlockExporter.java:159-209
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/TitledDiagram.java:279-289
 */
import { addWarnings } from '../../core/annotations/WarningBannerBlock.js';
import type { RenderFragment } from '../../core/dispatcher.js';
import { ColorMapper, toSvgPaint } from '../../core/klimt/color/ColorMapper.js';
import { HColorGradient } from '../../core/klimt/color/HColorGradient.js';
import { HColors } from '../../core/klimt/color/HColors.js';
import { HColorSimple } from '../../core/klimt/color/HColorSimple.js';
import { extractFlatContent, extractViewBoxDims, VERSION_PLACEHOLDER } from '../../core/klimt/document-shell.js';
import { UGraphicHandwritten } from '../../core/klimt/drawing/hand/UGraphicHandwritten.js';
import { basicSvgOption } from '../../core/klimt/drawing/svg/svg-graphics-core.js';
import { UGraphicSvg } from '../../core/klimt/drawing/svg/u-graphic-svg.js';
import type { ClockwiseTopRightBottomLeft } from '../../core/klimt/geom/ClockwiseTopRightBottomLeft.js';
import type { UGraphic } from '../../core/klimt/UGraphic.js';
import { UTranslate } from '../../core/klimt/UTranslate.js';
import type { StringMeasurer } from '../../core/measurer.js';
import { StyleSignatureBasic } from '../../core/style/StyleSignatureBasic.js';
import { stringBounderFor } from '../../core/UgDiagram.js';
import type { StringBounder as DriverStringBounder } from '../../core/klimt/drawing/svg/driver-text-svg.js';
import type { FlowDiagram } from './FlowDiagram.js';

/** `DiagramType.FLOW`, the root's `data-diagram-type`. */
const DIAGRAM_TYPE_FLOW = 'FLOW';

/** `DiagramType.FLOW.getStyleName()` has no branch and falls through to `SName.activityDiagram`.
 *  @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/core/DiagramType.java:234-295 */
const FLOW_STYLE_NAME = 'activityDiagram';

/** The width-only driver half of `UGraphicSvg`'s two text seams. */
function driverBounderFor(measurer: StringMeasurer): DriverStringBounder {
  return {
    calculateDimension(font, text) {
      return { width: measurer.measure(text, font).width };
    },
  };
}

/**
 * `TitledDiagram#calculateBackColor`: the merged `{root, document, activityDiagram}`
 * style's `BackGroundColor`, `transparent` when it has none.
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/TitledDiagram.java:279-289
 */
function calculateBackColor(diagram: FlowDiagram): HColorSimple | HColorGradient {
  const skinParam = diagram.getSkinParam();
  const style = StyleSignatureBasic.of('root', 'document', FLOW_STYLE_NAME).getMergedStyle(
    skinParam.getCurrentStyleBuilder(),
  );
  const color = style?.value('BackGroundColor').asColor(skinParam.getIHtmlColorSet()) ?? HColors.transparent();
  if (color instanceof HColorSimple || color instanceof HColorGradient) return color;
  throw new Error('ClassCastException: a document BackGroundColor is a simple or gradient colour');
}

/** `TextBlockExporter.Builder#calculateMargin`.
 *  @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/core/TextBlockExporter.java:510-516 */
function calculateMargin(diagram: FlowDiagram): ClockwiseTopRightBottomLeft {
  const style = StyleSignatureBasic.of('root', 'document').getMergedStyle(
    diagram.getSkinParam().getCurrentStyleBuilder(),
  );
  if (style?.hasValue('Margin') === true) return style.getMargin();
  return diagram.getDefaultMargins();
}

/**
 * The fragment `src/index.ts` assembles: the text block plus the margins as
 * `minDim`, the margin translate, `UGraphicHandwritten` when handwritten.
 * `muteColorMapper` is `IDENTITY`: no `skinparam` can set `mode`,
 * `monochrome` or `reversecolor` here.
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/core/TextBlockExporter.java:159-209
 */
export function renderFlow(diagram: FlowDiagram, measurer: StringMeasurer): RenderFragment {
  const mapper = ColorMapper.IDENTITY;
  const textBlock = addWarnings(diagram.getTextBlock(), diagram.getWarnings(), mapper);
  const dim = textBlock.calculateDimension(stringBounderFor(measurer));
  const margin = calculateMargin(diagram);
  const backcolor = calculateBackColor(diagram);
  const option = basicSvgOption({
    minDim: {
      width: dim.getWidth() + margin.getLeft() + margin.getRight(),
      height: dim.getHeight() + margin.getTop() + margin.getBottom(),
    },
    backcolor,
    colorMapper: mapper,
    scale: 1,
    rootAttributes: new Map([['data-diagram-type', DIAGRAM_TYPE_FLOW]]),
  });
  const ug = UGraphicSvg.build(0, option, VERSION_PLACEHOLDER, driverBounderFor(measurer), measurer);
  let drawn: UGraphic = ug.apply(new UTranslate(margin.getLeft(), margin.getTop()));
  if (diagram.isHandwritten()) drawn = new UGraphicHandwritten(drawn);
  textBlock.drawU(drawn);
  const svg = ug.getSvgString();
  const { width, height } = extractViewBoxDims(svg);
  const { body, extraDefs } = extractFlatContent(svg);
  const paint = toSvgPaint(backcolor, mapper);
  const fragment: RenderFragment = { body, width, height, diagramType: DIAGRAM_TYPE_FLOW };
  const withBackground =
    typeof paint === 'string' ? { ...fragment, background: paint } : { ...fragment, backgroundGradient: paint };
  return extraDefs.length > 0 ? { ...withBackground, extraDefs } : withBackground;
}
