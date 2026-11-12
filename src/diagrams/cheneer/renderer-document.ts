/**
 * The document-level reads of `TitledDiagram` for the Chen export: the back colour, the colour mapper and the
 * exporter's margin, over this diagram. The diagram-level style is `activityDiagram`'s: `DiagramType#getStyleName`
 * has no `CHEN_EER` arm (D4, `DiagramType.java:234-296`). A copy of `activity-legacy/renderer-document.ts` (cheneer
 * D2).
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/TitledDiagram.java:274-313
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/core/TextBlockExporter.java:510-516
 */
import { ColorMapper } from '../../core/klimt/color/ColorMapper.js';
import { fromString as colorOrderFromString } from '../../core/klimt/color/ColorOrder.js';
import { HColorGradient } from '../../core/klimt/color/HColorGradient.js';
import { HColorSimple } from '../../core/klimt/color/HColorSimple.js';
import type { ClockwiseTopRightBottomLeft } from '../../core/klimt/geom/ClockwiseTopRightBottomLeft.js';
import { StyleSignatureBasic } from '../../core/style/StyleSignatureBasic.js';
import type { ChenEerDiagram } from './ChenEerDiagram.js';
import { STYLE_NAME } from './cheneer-edge-text.js';

/** `TitledDiagram#calculateBackColor`. @see TitledDiagram.java:279-289 */
export function calculateBackColor(diagram: ChenEerDiagram): HColorSimple | HColorGradient {
  const skinParam = diagram.getSkinParam();
  const style = StyleSignatureBasic.of('root', 'document', STYLE_NAME).getMergedStyle(
    skinParam.getCurrentStyleBuilder(),
  )!;
  const color = style.value('BackGroundColor').asColor(skinParam.getIHtmlColorSet());
  if (color instanceof HColorSimple || color instanceof HColorGradient) return color;
  throw new Error('ClassCastException: a document BackGroundColor is a simple or gradient colour');
}

/** `reversecolor`'s arms. @see TitledDiagram.java:300-313 */
function reverseColorMapper(reversecolor: string | null): ColorMapper {
  if (reversecolor === null) return ColorMapper.IDENTITY;
  if (reversecolor.toLowerCase() === 'dark') return ColorMapper.LIGTHNESS_INVERSE;
  const order = colorOrderFromString(reversecolor);
  return order === undefined ? ColorMapper.IDENTITY : ColorMapper.reverse(order);
}

/** `TitledDiagram#muteColorMapper(init)` with the identity `init`. @see TitledDiagram.java:291-313 */
export function muteColorMapper(diagram: ChenEerDiagram): ColorMapper {
  const skinParam = diagram.getSkinParam();
  if (skinParam.getValue('mode')?.toLowerCase() === 'dark') return ColorMapper.DARK_MODE;
  const monochrome = skinParam.getValue('monochrome');
  if (monochrome === 'true') return ColorMapper.MONOCHROME;
  if (monochrome === 'reverse') return ColorMapper.MONOCHROME_REVERSE;
  return reverseColorMapper(skinParam.getValue('reversecolor'));
}

/** `TextBlockExporter.Builder#calculateMargin`. @see TextBlockExporter.java:510-516 */
export function calculateMargin(diagram: ChenEerDiagram): ClockwiseTopRightBottomLeft {
  const style = StyleSignatureBasic.of('root', 'document').getMergedStyle(
    diagram.getSkinParam().getCurrentStyleBuilder(),
  );
  if (style?.hasValue('Margin') === true) return style.getMargin();
  return diagram.getDefaultMargins();
}
