/**
 * The texts a `SvekEdge` builds in its constructor and that the DOT reserves a box for: the label (with the
 * `note on link` merged onto it), the quantifiers (the `if` condition is the second one) and the roles. Only their
 * dimensions reach the DOT (`SvekEdge#appendLine`), the renderer (T2c) draws the blocks.
 *
 * Port-only: `StringWithArrow` (the "magic arrow" glyph for a `<`/`>` label guide) has no port, so a link with
 * several guide lines or an arrow direction other than `NONE_OR_SEVERAL` throws `unported:`. The legacy activity
 * commands never set a link arrow (`setLinkArrow` has no caller there), and a label whose lines start with `<`
 * or `>` is the only way into the guide-line branch.
 *
 * The `note on link` merge uses the string measurer's `computeMergedLabelBox` (the state/description engines'
 * shared seam) for the label side; the note operand is the dimension of the `EntityImageNoteLink` block the
 * renderer draws, as `SvekEdge.java:311-312` merges the block it draws.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/svek/SvekEdge.java:223-361
 */
import type { Link } from '../../core/abel/Link.js';
import { LinkArrow } from '../../core/abel/LinkArrow.js';
import { NoteLinkStrategy } from '../../core/abel/NoteLinkStrategy.js';
import { computeMergedLabelBox } from '../../core/edge-label-box-note-merge.js';
import { Display } from '../../core/klimt/creole/Display.js';
import { CreoleMode } from '../../core/klimt/creole/CreoleMode.js';
import type { CreoleRenderContext } from '../../core/klimt/creole/DisplayCreole.js';
import type { StringBounder } from '../../core/klimt/font/StringBounder.js';
import { bridgeFontConfiguration } from '../../core/klimt/font/FontConfigurationBridge.js';
import { HorizontalAlignment } from '../../core/klimt/geom/HorizontalAlignment.js';
import type { TextBlock } from '../../core/klimt/shape/TextBlock.js';
import { TextBlockUtils } from '../../core/klimt/shape/TextBlockUtils.js';
import type { FontConfiguration } from '../../core/klimt/shape/UText.js';
import type { StringMeasurer } from '../../core/measurer.js';
import { EntityImageNoteLink } from '../../core/svek/image/EntityImageNoteLink.js';
import { StyleBuilder } from '../../core/style/StyleBuilder.js';
import type { StyleSignature } from '../../core/style/StyleSignature.js';
import { StyleSignatureBasic } from '../../core/style/StyleSignatureBasic.js';
import type { ActivityLegacySkinParam } from './activity-legacy-skin-param.js';

/** `getMessageTextAlignment`'s default for a non-state diagram. @see SvekEdge.java:376-381 */
const MESSAGE_ALIGNMENT_DEFAULT = HorizontalAlignment.CENTER;
/** `marginLabel` of a link between two different entities (`6` for a self link). @see SvekEdge.java:372 */
const MARGIN_LABEL = 1;
const MARGIN_LABEL_SELF = 6;
/** The `LinkMiddleDecor.NONE` shield: `labelShield`. @see SvekEdge.java:354-358 */
const LABEL_SHIELD_NONE = 0;
/** The only style name of this engine. @see ActivityDiagram.java (`DiagramType.ACTIVITY.getStyleName()`) */
const STYLE_NAME = 'activityDiagram';

/** What the DOT and the renderer read from one link's texts. */
export interface EdgeTexts {
  /** The label block when the link has no `note on link`, `undefined` when it has none (the empty block). */
  readonly labelBlock: TextBlock | undefined;
  /** `labelText.calculateDimension` after the note merge, `undefined` for `EMPTY_TEXT_BLOCK`. */
  readonly labelDim: { readonly width: number; readonly height: number } | undefined;
  readonly startTailText: TextBlock | undefined;
  readonly endHeadText: TextBlock | undefined;
  readonly startTailRoleText: TextBlock | undefined;
  readonly endHeadRoleText: TextBlock | undefined;
  /** `NoteLinkStrategy.HALF_NOT_PRINTED` or `HALF_PRINTED_FULL`. @see SvekEdge.java:314-317 */
  readonly divideLabelWidthByTwo: boolean;
}

/** What `new SvekEdge(...)` reads: the skin param, the two measuring seams and the pragma. */
export interface EdgeTextContext {
  readonly skinParam: ActivityLegacySkinParam;
  readonly stringBounder: StringBounder;
  /** The string measurer the `note on link` merge uses (see the module comment). */
  readonly measurer: StringMeasurer;
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

function fontOf(signature: StyleSignature, link: Link, skinParam: ActivityLegacySkinParam): FontConfiguration {
  const style = signature.getMergedStyle(styleBuilderOf(link));
  if (style === undefined) throw new Error('NullPointerException: no arrow style merged for the link');
  return bridgeFontConfiguration(style.getFontConfiguration(skinParam.getIHtmlColorSet()));
}

/** `labelFont` of `GraphvizImageBuilder#buildImage`. @see GraphvizImageBuilder.java:228-231 */
export function labelFontOf(link: Link, skinParam: ActivityLegacySkinParam): FontConfiguration {
  return fontOf(arrowSignature(link), link, skinParam);
}

/** `cardinalityFont` of `GraphvizImageBuilder#buildImage`. @see GraphvizImageBuilder.java:232-234 */
export function cardinalityFontOf(link: Link, skinParam: ActivityLegacySkinParam): FontConfiguration {
  return fontOf(cardinalitySignature(link), link, skinParam);
}

function contextOf(font: FontConfiguration, skinParam: ActivityLegacySkinParam): CreoleRenderContext {
  return { fontConfiguration: font, spriteContainer: skinParam, atomOps: skinParam.atomOps };
}

/** `startUid.equalsId(endUid)`: a link from an entity to itself. @see SvekEdge.java:371 */
function isSelfLink(link: Link): boolean {
  return link.getEntity1() === link.getEntity2();
}

/** `addVisibilityModifier` without a visibility modifier: just the margin. @see SvekEdge.java:362-374 */
function addVisibilityModifier(block: TextBlock, link: Link): TextBlock {
  const marginLabel = isSelfLink(link) ? MARGIN_LABEL_SELF : MARGIN_LABEL;
  return TextBlockUtils.withMargin(block, marginLabel, marginLabel);
}

/** The `labelOnly` block. @see SvekEdge.java:279-303 */
function buildLabelOnly(link: Link, font: FontConfiguration, ctx: EdgeTextContext): TextBlock {
  if (link.getLinkArrow() !== LinkArrow.NONE_OR_SEVERAL) throw new Error('unported: StringWithArrow#addMagicArrow');
  const label = link.getLabel();
  if (label.isNull) return TextBlockUtils.EMPTY_TEXT_BLOCK;

  if (label.hasSeveralGuideLines()) throw new Error('unported: StringWithArrow#addSeveralMagicArrows');
  const { skinParam } = ctx;
  const arrowStyle = arrowSignature(link).getMergedStyle(styleBuilderOf(link));
  const styleWidth = arrowStyle?.wrapWidth();
  const wrapWidth = styleWidth !== undefined && styleWidth.getMaxWidth() > 0 ? styleWidth : skinParam.maxMessageSize();
  const alignment = skinParam.getDefaultTextAlignment(MESSAGE_ALIGNMENT_DEFAULT);
  const block = label.create0(contextOf(font, skinParam), alignment, wrapWidth, CreoleMode.SIMPLE_LINE);
  return addVisibilityModifier(block, link);
}

/** The `labelOnly`'s text, for the string-based note merge: one line per display element. */
function labelPlainText(link: Link): string {
  const label = link.getLabel();
  return label.isNull ? '' : label.asList().map(String).join('\n');
}

/** The note merged onto the label: `HALF_*` strategies halve the width (`dimNote` is divided later). */
function mergedNoteDim(
  link: Link,
  font: FontConfiguration,
  ctx: EdgeTextContext,
): { dim: { width: number; height: number }; half: boolean } {
  const note = link.getNote()!;
  const strategy = note.getStrategy();
  const half = strategy === NoteLinkStrategy.HALF_NOT_PRINTED || strategy === NoteLinkStrategy.HALF_PRINTED_FULL;
  const builder = link.getStyleBuilder();
  if (!(builder instanceof StyleBuilder)) throw new Error('ClassCastException: the link has no StyleBuilder');
  // SvekEdge.java:311-312: the drawn block itself, so creole the block applies (a hidden stereotype) is measured too.
  const noteBlock = new EntityImageNoteLink(note.getDisplay(), note.getColors(), ctx.skinParam, builder);
  const drawn = noteBlock.calculateDimension(ctx.stringBounder);
  const noteDim = { width: drawn.getWidth(), height: drawn.getHeight() };
  // `half` is applied by `eventuallyDivideByTwo` at the DOT, not here: the merge is full-width.
  const box = computeMergedLabelBox({
    label: labelPlainText(link),
    noteDim,
    position: note.getPosition().toLowerCase() as 'left' | 'right' | 'top' | 'bottom',
    halfWidth: false,
    hasMiddleDecor: false,
    font: { family: font.family, size: font.size },
    measurer: ctx.measurer,
    maxWidth: ctx.skinParam.maxMessageSize().getMaxWidth(),
  });
  // The un-truncated merge: `getHorizontalDzeta` sums the raw `calculateDimension`, `(int)` is the DOT's. @see SvekEdge.java:1170
  return { dim: { width: box.measuredWidth, height: box.measuredHeight }, half };
}

function quantifierBlock(
  text: string | undefined,
  font: FontConfiguration,
  ctx: EdgeTextContext,
): TextBlock | undefined {
  if (text === undefined) return undefined;
  return Display.getWithNewlines(ctx.skinParam.getPragma(), text).create(
    contextOf(font, ctx.skinParam),
    HorizontalAlignment.CENTER,
  );
}

/**
 * The texts of `link`, as `SvekEdge`'s constructor builds them.
 * @see SvekEdge.java:279-351
 */
export function buildEdgeTexts(link: Link, ctx: EdgeTextContext): EdgeTexts {
  const font = labelFontOf(link, ctx.skinParam);
  const cardinalityFont = cardinalityFontOf(link, ctx.skinParam);
  const labelOnly = buildLabelOnly(link, font, ctx);
  const hasNote = link.getNote() !== undefined;
  const merged = hasNote ? mergedNoteDim(link, font, ctx) : undefined;

  let labelDim: EdgeTexts['labelDim'];
  if (merged !== undefined) labelDim = merged.dim;
  else if (labelOnly !== TextBlockUtils.EMPTY_TEXT_BLOCK) {
    const dim = labelOnly.calculateDimension(ctx.stringBounder);
    labelDim = { width: dim.getWidth(), height: dim.getHeight() };
  }

  return {
    labelBlock: merged === undefined && labelOnly !== TextBlockUtils.EMPTY_TEXT_BLOCK ? labelOnly : undefined,
    labelDim,
    startTailText: quantifierBlock(link.getQuantifier1(), cardinalityFont, ctx),
    endHeadText: quantifierBlock(link.getQuantifier2(), cardinalityFont, ctx),
    startTailRoleText: quantifierBlock(link.getRole1(), cardinalityFont, ctx),
    endHeadRoleText: quantifierBlock(link.getRole2(), cardinalityFont, ctx),
    divideLabelWidthByTwo: merged?.half ?? false,
  };
}

/** `labelShield`: 7 with a middle decor, else 0 (a legacy activity link has none). @see SvekEdge.java:354-358 */
export const LABEL_SHIELD = LABEL_SHIELD_NONE;
