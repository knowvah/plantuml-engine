/**
 * One legacy activity link as `SvekEdge#drawU` draws it: the solved {@link ActivityLegacyEdgeGeo} becomes the
 * `SvekEdgeInput` the shared klimt drawing half (`core/svek/SvekEdge.ts`) takes. Colour, stroke and the label font
 * are read the way `SvekEdge#drawU` and `GraphvizImageBuilder#buildImage` read them: the merged `arrow` style, then
 * the link's own colours.
 *
 * Port-only substitutions (journalled, T3b): the label and quantifier are drawn from their plain text by
 * `SvekEdge.ts`'s string-based block builder, not from the `create0` block the DOT measured; a link with a
 * decor other than the plain arrow throws `unported:` (`Kal`).
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/svek/SvekEdge.java:830-948
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/svek/GraphvizImageBuilder.java:228-234
 */
import { ColorType } from '../../core/abel/ColorType.js';
import type { Link } from '../../core/abel/Link.js';
import { LinkDecor } from '../../core/decoration/LinkDecor.js';
import { LinkMiddleDecor } from '../../core/decoration/LinkMiddleDecor.js';
import { HorizontalAlignment } from '../../core/klimt/geom/HorizontalAlignment.js';
import type { StringBounder } from '../../core/klimt/font/StringBounder.js';
import type { Paint } from '../../core/paint.js';
import type { HColorOrPaint } from '../../core/klimt/color/ColorMapper.js';
import { PositionableImpl } from '../../core/klimt/geom/PositionableImpl.js';
import type { TextBlock } from '../../core/klimt/shape/TextBlock.js';
import { manageCollision } from '../../core/svek/quantifier-collision.js';
import type { UGraphic } from '../../core/klimt/UGraphic.js';
import type { UStroke } from '../../core/klimt/UStroke.js';
import type { ResolvedColor } from '../../core/klimt/color/HColorSet.js';
import { HColorGradient } from '../../core/klimt/color/HColorGradient.js';
import { HColorSimple } from '../../core/klimt/color/HColorSimple.js';
import type { FontConfiguration } from '../../core/klimt/shape/UText.js';
import {
  SvekEdge,
  type SvekEdgeEndText,
  type SvekEdgeInput,
  type SvekEdgeLabelNote,
  type SvekLinkNotePosition,
} from '../../core/svek/SvekEdge.js';
import { EntityImageNoteLink } from '../../core/svek/image/EntityImageNoteLink.js';
import type { Style } from '../../core/style/Style.js';
import { StyleSignatureBasic } from '../../core/style/StyleSignatureBasic.js';
import { StyleBuilder } from '../../core/style/StyleBuilder.js';
import { ValueNull } from '../../core/style/ValueNull.js';
import type { ActivityLegacyEdgeGeo, ActivityLegacyNodeGeo } from './layout.js';
import type { ActivityLegacySkinParam } from './activity-legacy-skin-param.js';
import { cardinalityFontOf, labelFontOf } from './activity-legacy-edge-text.js';

/** The only style name of this engine. @see DiagramType.ACTIVITY.getStyleName() */
const STYLE_NAME = 'activityDiagram';

/** `LinkDecor.ARROW`'s head token (`decors2`), and its tail token (`decors1`). @see LinkDecor.java:112 */
const HEAD_ARROW_TOKEN = '>';
const TAIL_ARROW_TOKEN = '<';

/** `HColors.transparent()`'s paint spelling (`HColorSet.java:82-83`). */
const TRANSPARENT: Paint = 'none';

/** `getDefaultStyleDefinition(stereotype).getMergedStyle(builder)`. @see SvekEdge.java:816-821 */
function arrowStyleOf(link: Link): Style {
  const builder = link.getStyleBuilder();
  if (!(builder instanceof StyleBuilder)) throw new Error('ClassCastException: the link has no StyleBuilder');
  const style = StyleSignatureBasic.of('root', 'element', STYLE_NAME, 'arrow')
    .withTOBECHANGED(link.getStereotype())
    .getMergedStyle(builder);
  if (style === undefined) throw new Error('NullPointerException: no arrow style merged for the link');
  return style;
}

/** `WithLinkType#applyStyle` stores the bare `ResolvedColor` its `parseSimpleColor` answers, not an `HColorSimple`. */
function isResolvedColor(color: object): color is ResolvedColor {
  return 'r' in color && 'g' in color && 'b' in color && 'a' in color;
}

/**
 * A klimt `HColor` as the value `Fore`/`Back` take. It stays an `HColorSimple`, never `asPaint()`'s light-only string:
 * the driver maps it (`HColor#toSvg(mapper)`), so a colour with a `@media dark` partner reaches `DARK_MODE` intact
 * (`ColorMapper.java:68-73`) and a reversing mapper is applied once.
 */
function paintOf(color: object): HColorOrPaint {
  if (isResolvedColor(color)) return HColorSimple.create(color);
  if (color instanceof HColorSimple) return color;
  if (color instanceof HColorGradient) return color;
  throw new Error('ClassCastException: colour is not an HColorSimple or HColorGradient');
}

/** `SvekEdgeInput#backgroundColor` is a `Paint`: the light colour only (no legacy decor reads it under a mapper). */
function lightPaintOf(color: object): Paint {
  const painted = paintOf(color);
  if (painted instanceof HColorSimple || painted instanceof HColorGradient) return painted.asPaint();
  return painted;
}

/**
 * `Rainbow.build(styleLine, set)` then the link's own colours: `LineColor`, `HeadColor` (the line colour when the
 * style has none, transparent when it is not a colour), replaced by `getColors().getColor(ARROW, LINE)`.
 * @see Rainbow.java:80-92, SvekEdge.java:874-893
 */
function colorsOf(
  link: Link,
  style: Style,
  skinParam: ActivityLegacySkinParam,
): { color: HColorOrPaint; headColor: HColorOrPaint } {
  const set = skinParam.getIHtmlColorSet();
  const line = style.value('LineColor').asColor(set);
  const head = style.value('HeadColor');
  const colorHead = head instanceof ValueNull ? line : head.asColor(set);
  const own = link.getColors().getColor(ColorType.ARROW, ColorType.LINE);
  if (own !== undefined) return { color: paintOf(own), headColor: paintOf(own) };
  return { color: paintOf(line), headColor: colorHead === undefined ? TRANSPARENT : paintOf(colorHead) };
}

/**
 * The stroke `drawU` applies: `suggestedStroke == null || !isNormal() ? getStroke3(defaultThickness)
 * : getStroke3(suggestedStroke)`, then the link's own specific stroke.
 * @see SvekEdge.java:895-905
 */
function strokeOf(link: Link, style: Style, defaultThickness: UStroke | null): UStroke {
  const linkType = link.getType();
  const suggested = style.getStroke();
  const stroke = linkType.getStyle().isNormal()
    ? linkType.getStroke3(suggested)
    : linkType.getStroke3(defaultThickness);
  const specific = link.getColors().getSpecificLineStroke();
  return specific === undefined ? stroke : specific;
}

/** `skinParam.getThickness(LineParam.arrow, null)`: `arrowthickness` as a plain stroke, when it is a number. */
function defaultThicknessOf(skinParam: ActivityLegacySkinParam): UStroke | null {
  return skinParam.getThickness('arrow');
}

/** The decor a `LinkType` side carries as the token `SvekEdge.ts` resolves; only the plain arrow is reachable. */
function decorToken(decor: LinkDecor, arrow: string, link: Link): string | undefined {
  if (decor === LinkDecor.NONE) return undefined;
  if (decor === LinkDecor.ARROW) return arrow;
  throw new Error(`unported: legacy activity link decor ${String(decor)} on ${link.getUid()}`);
}

/** What an edge reads besides its own geometry. */
export interface EdgeContext {
  readonly skinParam: ActivityLegacySkinParam;
  readonly stringBounder: StringBounder;
  /** Every node, in `Bibliotekon#allNodes` order: `manageCollision` pushes the quantifiers clear of them. */
  readonly nodes: readonly ActivityLegacyNodeGeo[];
}

/**
 * A quantifier or role label: `startTailLabelXY`/`endHeadLabelXY` is the corner of the table graphviz placed (the
 * centre minus half the `(int)`-truncated table), moved clear of the nodes by `manageCollision`.
 * @see SvekEdge.java:750-767, 1205-1218
 */
function endText(
  block: TextBlock | undefined,
  centre: { x: number | undefined; y: number | undefined },
  font: FontConfiguration,
  ctx: EdgeContext,
): SvekEdgeEndText | undefined {
  if (block === undefined || centre.x === undefined || centre.y === undefined) return undefined;
  const dim = block.calculateDimension(ctx.stringBounder);
  const corner = new PositionableImpl(
    centre.x - Math.trunc(dim.getWidth()) / 2,
    centre.y - Math.trunc(dim.getHeight()) / 2,
    dim,
  );
  const placed = manageCollision(corner, ctx.nodes).getPosition();
  return { text: '', block, x: placed.getX(), y: placed.getY(), font };
}

function labelTextOf(link: Link): string | undefined {
  const label = link.getLabel();
  return label.isNull ? undefined : label.asList().map(String).join('\n');
}

/**
 * The `EntityImageNoteLink` `SvekEdge.java:312-326` merges beside the label.
 * @see SvekEdge.java:310-312
 */
function labelNoteOf(link: Link, skinParam: ActivityLegacySkinParam): SvekEdgeLabelNote | undefined {
  const note = link.getNote();
  if (note === undefined) return undefined;
  const builder = link.getStyleBuilder();
  if (!(builder instanceof StyleBuilder)) throw new Error('ClassCastException: the link has no StyleBuilder');
  return {
    block: new EntityImageNoteLink(note.getDisplay(), note.getColors(), skinParam, builder),
    position: note.getPosition().toLowerCase() as SvekLinkNotePosition,
  };
}

/** The main label, centred on its table; a `note on link` is merged beside it. @see SvekEdge.java:951-954 */
function labelFields(edge: ActivityLegacyEdgeGeo, skinParam: ActivityLegacySkinParam): Partial<SvekEdgeInput> {
  const { labelDim } = edge.texts;
  const note = labelNoteOf(edge.link, skinParam);
  // A note with no label text still draws: `labelOnly` is `EMPTY_TEXT_BLOCK` (`SvekEdge.java:281-283`).
  const text = labelTextOf(edge.link) ?? (note === undefined ? undefined : '');
  if (text === undefined || labelDim === undefined || edge.labelX === undefined || edge.labelY === undefined) return {};
  return {
    label: {
      text,
      ...(note === undefined ? {} : { note }),
      x: edge.labelX,
      y: edge.labelY,
      w: Math.trunc(labelDim.width),
      h: Math.trunc(labelDim.height),
    },
    labelFont: labelFontOf(edge.link, skinParam),
    labelAlignment: skinParam.getDefaultTextAlignment(HorizontalAlignment.CENTER),
  };
}

/** Both quantifiers (`if` conditions are the second one). @see SvekEdge.java:330-340 */
function quantifierFields(edge: ActivityLegacyEdgeGeo, ctx: EdgeContext): Partial<SvekEdgeInput> {
  const { link, texts } = edge;
  const font = cardinalityFontOf(link, ctx.skinParam);
  const tail = endText(
    texts.startTailText ?? texts.startTailRoleText,
    { x: edge.tailLabelX, y: edge.tailLabelY },
    font,
    ctx,
  );
  const head = endText(
    texts.endHeadText ?? texts.endHeadRoleText,
    { x: edge.headLabelX, y: edge.headLabelY },
    font,
    ctx,
  );
  return {
    ...(tail === undefined ? {} : { tailQuantifier: tail }),
    ...(head === undefined ? {} : { headQuantifier: head }),
  };
}

function decorFields(link: Link): Partial<SvekEdgeInput> {
  const linkType = link.getType();
  const tailDecor = decorToken(linkType.getDecor2(), TAIL_ARROW_TOKEN, link);
  const headDecor = decorToken(linkType.getDecor1(), HEAD_ARROW_TOKEN, link);
  return {
    ...(tailDecor === undefined ? {} : { tailDecor }),
    ...(headDecor === undefined ? {} : { headDecor }),
  };
}

/** Refuses what the shared drawing half cannot draw for this engine yet. */
function requireDrawable(link: Link): void {
  if (link.getType().getMiddleDecor() !== LinkMiddleDecor.NONE) throw new Error('unported: a link middle decor');
}

/** The input of `SvekEdge.ts` for `edge`. */
export function edgeInputOf(edge: ActivityLegacyEdgeGeo, ctx: EdgeContext): SvekEdgeInput {
  const { link } = edge;
  const { skinParam } = ctx;
  requireDrawable(link);
  const style = arrowStyleOf(link);
  const { color, headColor } = colorsOf(link, style, skinParam);
  const sourceLine = link.getLocation()?.getPosition();
  const url = link.getUrl();
  return {
    uid: link.getUid(),
    points: edge.points,
    from: link.getEntity1().getName(),
    to: link.getEntity2().getName(),
    fromUid: link.getEntity1().getUid(),
    toUid: link.getEntity2().getUid(),
    ...(sourceLine === undefined ? {} : { sourceLine }),
    ...(url === undefined ? {} : { url: { url: url.getUrl(), tooltip: url.getTooltip() } }),
    // `stroke` is given, so `style` is not read (`SvekEdge.ts#drawU`).
    style: 'solid',
    stroke: strokeOf(link, style, defaultThicknessOf(skinParam)),
    color,
    headColor,
    backgroundColor: lightPaintOf(skinParam.getBackgroundColor()),
    ...decorFields(link),
    ...quantifierFields(edge, ctx),
    ...labelFields(edge, skinParam),
  };
}

/** Builds and draws one edge; a hidden one draws only its comment. @see SvekResult.java:98-103 */
export function drawEdge(ug: UGraphic, edge: ActivityLegacyEdgeGeo, input: SvekEdgeInput, ids: Set<string>): void {
  const svekEdge = new SvekEdge(input);
  svekEdge.setSharedIds(ids);
  if (edge.link.isHidden()) svekEdge.drawHiddenU(ug);
  else svekEdge.drawU(ug);
}
