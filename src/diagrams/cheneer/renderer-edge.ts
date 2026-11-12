/**
 * One Chen link as `SvekEdge#drawU` draws it: the solved {@link ChenEdgeGeo} becomes the `SvekEdgeInput` the shared
 * klimt drawing half (`core/svek/SvekEdge.ts`) takes. Colour, stroke and the label font are read the way
 * `SvekEdge#drawU` and `GraphvizImageBuilder#buildImage` read them: the merged `arrow` style (`activityDiagram`'s,
 * D4), then the link's own colours. Adapted from `activity-legacy/renderer-edge.ts` (cheneer D2).
 *
 * What Chen reaches: a plain line (bold for `=`), a `#line:` colour, the cardinality label and the subset/superset
 * middle decor. It never reaches a head or tail decor, a quantifier, a role or a url: `LinkArg.build(label, length)`
 * sets none of them (`CommandAssociate.java:112-117`), so a link with a decor other than `NONE` or a middle decor
 * other than `SUBSET`/`SUPERSET` throws `unported:`.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/svek/SvekEdge.java:830-948, 982-990
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/svek/GraphvizImageBuilder.java:228-234
 */
import { ColorType } from '../../core/abel/ColorType.js';
import type { Link } from '../../core/abel/Link.js';
import { LinkDecor } from '../../core/decoration/LinkDecor.js';
import { LinkMiddleDecor } from '../../core/decoration/LinkMiddleDecor.js';
import { HorizontalAlignment } from '../../core/klimt/geom/HorizontalAlignment.js';
import type { Paint } from '../../core/paint.js';
import type { HColorOrPaint } from '../../core/klimt/color/ColorMapper.js';
import type { UGraphic } from '../../core/klimt/UGraphic.js';
import type { UStroke } from '../../core/klimt/UStroke.js';
import type { ResolvedColor } from '../../core/klimt/color/HColorSet.js';
import { HColorGradient } from '../../core/klimt/color/HColorGradient.js';
import { HColorSimple } from '../../core/klimt/color/HColorSimple.js';
import type { MiddleDecor } from '../../core/svek/extremity/MiddleCircleDecor.js';
import { SvekEdge, type SvekEdgeInput } from '../../core/svek/SvekEdge.js';
import type { Style } from '../../core/style/Style.js';
import { StyleSignatureBasic } from '../../core/style/StyleSignatureBasic.js';
import { StyleBuilder } from '../../core/style/StyleBuilder.js';
import { ValueNull } from '../../core/style/ValueNull.js';
import { labelFontOf, STYLE_NAME } from './cheneer-edge-text.js';
import type { ChenEerSkinParam } from './cheneer-skin-param.js';
import type { ChenEdgeGeo } from './layout.js';

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
 * A klimt `HColor` as the value `Fore`/`Back` take. It stays an `HColorSimple`, never `asPaint()`'s light-only
 * string: the driver maps it (`HColor#toSvg(mapper)`), so a colour with a `@media dark` partner reaches `DARK_MODE`
 * intact (`ColorMapper.java:68-73`) and a reversing mapper is applied once.
 */
function paintOf(color: object): HColorOrPaint {
  if (isResolvedColor(color)) return HColorSimple.create(color);
  if (color instanceof HColorSimple) return color;
  if (color instanceof HColorGradient) return color;
  throw new Error('ClassCastException: colour is not an HColorSimple or HColorGradient');
}

/** `SvekEdgeInput#backgroundColor` is a `Paint`: the light colour only (the Chen decors read none of it). */
export function lightPaintOf(color: object): Paint {
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
  skinParam: ChenEerSkinParam,
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

/** `LinkMiddleDecor` as the lowercase `MiddleDecor` `SvekEdgeInput` carries; `undefined` for `NONE`. */
function middleDecorOf(link: Link): MiddleDecor | undefined {
  const decor = link.getType().getMiddleDecor();
  if (decor === LinkMiddleDecor.NONE) return undefined;
  if (decor === LinkMiddleDecor.SUBSET) return 'subset';
  if (decor === LinkMiddleDecor.SUPERSET) return 'superset';
  throw new Error(`unported: Chen link middle decor ${String(decor)}`);
}

/** `SvekEdge.java:982-990`: the decor drawn at the path's middle (`MiddleFactorySubset` reads neither colour). */
function middleDecorFields(link: Link, backgroundColor: Paint): Partial<SvekEdgeInput> {
  const decor = middleDecorOf(link);
  if (decor === undefined) return {};
  return { middleDecor: { decor, backColor: backgroundColor, diagramBackColor: backgroundColor } };
}

function labelTextOf(link: Link): string | undefined {
  const label = link.getLabel();
  return label.isNull ? undefined : label.asList().map(String).join('\n');
}

/** The main label, centred on its table. @see SvekEdge.java:951-954 */
function labelFields(edge: ChenEdgeGeo, skinParam: ChenEerSkinParam): Partial<SvekEdgeInput> {
  const { labelDim } = edge.texts;
  const text = labelTextOf(edge.link);
  if (text === undefined || labelDim === undefined || edge.labelX === undefined || edge.labelY === undefined) return {};
  return {
    label: {
      text,
      x: edge.labelX,
      y: edge.labelY,
      w: Math.trunc(labelDim.width),
      h: Math.trunc(labelDim.height),
    },
    labelFont: labelFontOf(edge.link, skinParam),
    labelAlignment: skinParam.getDefaultTextAlignment(HorizontalAlignment.CENTER),
  };
}

/** Refuses a head or tail decor: a Chen link is created with `LinkDecor.NONE` on both sides. */
function requireNoDecor(link: Link): void {
  const type = link.getType();
  if (type.getDecor1() !== LinkDecor.NONE || type.getDecor2() !== LinkDecor.NONE)
    throw new Error(`unported: Chen link decor on ${link.getUid()}`);
}

/** The input of `SvekEdge.ts` for `edge`. */
export function edgeInputOf(edge: ChenEdgeGeo, skinParam: ChenEerSkinParam): SvekEdgeInput {
  const { link } = edge;
  requireNoDecor(link);
  const style = arrowStyleOf(link);
  const { color, headColor } = colorsOf(link, style, skinParam);
  const backgroundColor = lightPaintOf(skinParam.getBackgroundColor());
  const sourceLine = link.getLocation()?.getPosition();
  return {
    uid: link.getUid(),
    points: edge.points,
    from: link.getEntity1().getName(),
    to: link.getEntity2().getName(),
    fromUid: link.getEntity1().getUid(),
    toUid: link.getEntity2().getUid(),
    ...(sourceLine === undefined ? {} : { sourceLine }),
    // `stroke` is given, so `style` is not read (`SvekEdge.ts#drawU`).
    style: 'solid',
    stroke: strokeOf(link, style, skinParam.getThickness('arrow')),
    color,
    headColor,
    backgroundColor,
    ...middleDecorFields(link, backgroundColor),
    ...labelFields(edge, skinParam),
  };
}

/** Builds and draws one edge; a hidden one draws only its comment. @see SvekResult.java:98-103 */
export function drawEdge(ug: UGraphic, edge: ChenEdgeGeo, input: SvekEdgeInput, ids: Set<string>): void {
  const svekEdge = new SvekEdge(input);
  svekEdge.setSharedIds(ids);
  if (edge.link.isHidden()) svekEdge.drawHiddenU(ug);
  else svekEdge.drawU(ug);
}
