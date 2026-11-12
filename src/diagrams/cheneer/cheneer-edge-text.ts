/**
 * The texts a `SvekEdge` builds in its constructor and that the DOT reserves a box for: the label (a Chen
 * cardinality, `CommandAssociate.java:112-117`), the quantifiers and the roles. Only their dimensions reach the DOT
 * (`SvekEdge#appendLine`), the renderer draws the blocks. Adapted from `activity-legacy/activity-legacy-edge-text.ts`
 * (cheneer D2): Chen has no `note on link`, so the `HALF_*` merge arm is absent, and its arrow style is
 * `activityDiagram`'s (D4: `DiagramType#getStyleName` has no `CHEN_EER` arm, `DiagramType.java:234-296`).
 *
 * Port-only: `StringWithArrow` (the "magic arrow" glyph for a `<`/`>` label guide) has no port, so a link with
 * several guide lines or an arrow direction other than `NONE_OR_SEVERAL` throws `unported:`. No Chen command sets a
 * link arrow.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/svek/SvekEdge.java:225-361
 */
import type { Link } from '../../core/abel/Link.js';
import { LinkArrow } from '../../core/abel/LinkArrow.js';
import { LinkMiddleDecor } from '../../core/decoration/LinkMiddleDecor.js';
import { Display } from '../../core/klimt/creole/Display.js';
import { CreoleMode } from '../../core/klimt/creole/CreoleMode.js';
import type { CreoleRenderContext } from '../../core/klimt/creole/DisplayCreole.js';
import type { StringBounder } from '../../core/klimt/font/StringBounder.js';
import { bridgeFontConfiguration } from '../../core/klimt/font/FontConfigurationBridge.js';
import { HorizontalAlignment } from '../../core/klimt/geom/HorizontalAlignment.js';
import type { TextBlock } from '../../core/klimt/shape/TextBlock.js';
import { TextBlockUtils } from '../../core/klimt/shape/TextBlockUtils.js';
import type { FontConfiguration } from '../../core/klimt/shape/UText.js';
import { StyleBuilder } from '../../core/style/StyleBuilder.js';
import type { StyleSignature } from '../../core/style/StyleSignature.js';
import { StyleSignatureBasic } from '../../core/style/StyleSignatureBasic.js';
import type { ChenEerSkinParam } from './cheneer-skin-param.js';

/** `getMessageTextAlignment`'s default for a non-state diagram. @see SvekEdge.java:376-381 */
const MESSAGE_ALIGNMENT_DEFAULT = HorizontalAlignment.CENTER;
/** `marginLabel` of a link between two different entities (`6` for a self link). @see SvekEdge.java:372 */
const MARGIN_LABEL = 1;
const MARGIN_LABEL_SELF = 6;
/** `labelShield` of a link with a middle decor. @see SvekEdge.java:353-356 */
const LABEL_SHIELD_MIDDLE_DECOR = 7;
/** `DiagramType.CHEN_EER.getStyleName()`: no arm, so the trailing `activityDiagram`. @see DiagramType.java:234-296 */
export const STYLE_NAME = 'activityDiagram';

/** What the DOT and the renderer read from one link's texts. */
export interface ChenEdgeTexts {
  /** The label block, `undefined` when the link has none (the empty block). */
  readonly labelBlock: TextBlock | undefined;
  /** `labelText.calculateDimension`, `undefined` for `EMPTY_TEXT_BLOCK`. */
  readonly labelDim: { readonly width: number; readonly height: number } | undefined;
  readonly startTailText: TextBlock | undefined;
  readonly endHeadText: TextBlock | undefined;
  readonly startTailRoleText: TextBlock | undefined;
  readonly endHeadRoleText: TextBlock | undefined;
  /** `labelShield`: 7 with a middle decor, else 0. @see SvekEdge.java:353-356 */
  readonly labelShield: number;
}

/** What `new SvekEdge(...)` reads: the skin param and the measuring seam. */
export interface ChenEdgeTextContext {
  readonly skinParam: ChenEerSkinParam;
  readonly stringBounder: StringBounder;
}

/** `getDefaultStyleDefinitionArrow`. @see GraphvizImageBuilder.java:112-118 */
function arrowSignature(link: Link): StyleSignature {
  return StyleSignatureBasic.of('root', 'element', STYLE_NAME, 'arrow').withTOBECHANGED(link.getStereotype());
}

/** `getStyleArrowCardinality`. @see GraphvizImageBuilder.java:120-126 */
function cardinalitySignature(link: Link): StyleSignature {
  return StyleSignatureBasic.of('root', 'element', STYLE_NAME, 'arrow', 'cardinality').withTOBECHANGED(
    link.getStereotype(),
  );
}

/** `link.getStyleBuilder()`: the builder current when the link was made (typed `object` on the `abel` stub). */
function styleBuilderOf(link: Link): StyleBuilder {
  const builder = link.getStyleBuilder();
  if (!(builder instanceof StyleBuilder)) throw new Error('ClassCastException: the link has no StyleBuilder');
  return builder;
}

function fontOf(signature: StyleSignature, link: Link, skinParam: ChenEerSkinParam): FontConfiguration {
  const style = signature.getMergedStyle(styleBuilderOf(link));
  if (style === undefined) throw new Error('NullPointerException: no arrow style merged for the link');
  return bridgeFontConfiguration(style.getFontConfiguration(skinParam.getIHtmlColorSet()));
}

/** `labelFont` of `GraphvizImageBuilder#buildImage`. @see GraphvizImageBuilder.java:228-231 */
export function labelFontOf(link: Link, skinParam: ChenEerSkinParam): FontConfiguration {
  return fontOf(arrowSignature(link), link, skinParam);
}

/** `cardinalityFont` of `GraphvizImageBuilder#buildImage`. @see GraphvizImageBuilder.java:232-234 */
export function cardinalityFontOf(link: Link, skinParam: ChenEerSkinParam): FontConfiguration {
  return fontOf(cardinalitySignature(link), link, skinParam);
}

function contextOf(font: FontConfiguration, skinParam: ChenEerSkinParam): CreoleRenderContext {
  return { fontConfiguration: font, spriteContainer: skinParam, atomOps: skinParam.atomOps };
}

/** `addVisibilityModifier` without a visibility modifier: just the margin. @see SvekEdge.java:362-374 */
function addVisibilityModifier(block: TextBlock, link: Link): TextBlock {
  const marginLabel = link.getEntity1() === link.getEntity2() ? MARGIN_LABEL_SELF : MARGIN_LABEL;
  return TextBlockUtils.withMargin(block, marginLabel, marginLabel);
}

/**
 * The link label's creole block: the arrow style's wrap width, else `skinparam maxMessageSize`, `SIMPLE_LINE` mode.
 * The part of `labelOnly` both `SvekEdge` (SvekEdge.java:294-300) and `CucaDiagramFileMakerElk#getLabel`
 * (CucaDiagramFileMakerElk.java:213-224) build alike, before each adds its own margin.
 */
export function createLabelBlock(link: Link, font: FontConfiguration, skinParam: ChenEerSkinParam): TextBlock {
  const arrowStyle = arrowSignature(link).getMergedStyle(styleBuilderOf(link));
  const styleWidth = arrowStyle?.wrapWidth();
  const wrapWidth = styleWidth !== undefined && styleWidth.getMaxWidth() > 0 ? styleWidth : skinParam.maxMessageSize();
  const alignment = skinParam.getDefaultTextAlignment(MESSAGE_ALIGNMENT_DEFAULT);
  return link.getLabel().create0(contextOf(font, skinParam), alignment, wrapWidth, CreoleMode.SIMPLE_LINE);
}

/** The `labelOnly` block. @see SvekEdge.java:279-303 */
function buildLabelOnly(link: Link, font: FontConfiguration, skinParam: ChenEerSkinParam): TextBlock {
  if (link.getLinkArrow() !== LinkArrow.NONE_OR_SEVERAL) throw new Error('unported: StringWithArrow#addMagicArrow');
  const label = link.getLabel();
  if (label.isNull) return TextBlockUtils.EMPTY_TEXT_BLOCK;

  if (label.hasSeveralGuideLines()) throw new Error('unported: StringWithArrow#addSeveralMagicArrows');
  return addVisibilityModifier(createLabelBlock(link, font, skinParam), link);
}

function quantifierBlock(
  text: string | undefined,
  font: FontConfiguration,
  skinParam: ChenEerSkinParam,
): TextBlock | undefined {
  if (text === undefined) return undefined;
  return Display.getWithNewlines(skinParam.getPragma(), text).create(
    contextOf(font, skinParam),
    HorizontalAlignment.CENTER,
  );
}

/**
 * The texts of `link`, as `SvekEdge`'s constructor builds them.
 * @see SvekEdge.java:279-351
 */
export function buildEdgeTexts(link: Link, ctx: ChenEdgeTextContext): ChenEdgeTexts {
  const { skinParam } = ctx;
  const font = labelFontOf(link, skinParam);
  const cardinalityFont = cardinalityFontOf(link, skinParam);
  const labelOnly = buildLabelOnly(link, font, skinParam);
  const hasLabel = labelOnly !== TextBlockUtils.EMPTY_TEXT_BLOCK;
  const dim = hasLabel ? labelOnly.calculateDimension(ctx.stringBounder) : undefined;
  return {
    labelBlock: hasLabel ? labelOnly : undefined,
    labelDim: dim === undefined ? undefined : { width: dim.getWidth(), height: dim.getHeight() },
    startTailText: quantifierBlock(link.getQuantifier1(), cardinalityFont, skinParam),
    endHeadText: quantifierBlock(link.getQuantifier2(), cardinalityFont, skinParam),
    startTailRoleText: quantifierBlock(link.getRole1(), cardinalityFont, skinParam),
    endHeadRoleText: quantifierBlock(link.getRole2(), cardinalityFont, skinParam),
    labelShield: link.getType().getMiddleDecor() === LinkMiddleDecor.NONE ? 0 : LABEL_SHIELD_MIDDLE_DECOR,
  };
}
