/**
 * renderer-edge.ts — T17: adapts one `DescriptionEdgeGeo` (this port's
 * layout output) into `SvekEdgeInput` (T13's decoupled drawing-half
 * contract — see `SvekEdge.ts`'s "Adapter boundary" doc comment, which
 * explicitly names this as a later task's job) and draws it.
 */
import type { UGraphic } from '../../core/klimt/UGraphic.js';
import type { Paint } from '../../core/paint.js';
import type { Theme } from '../../core/theme.js';
import { SvekEdge, type SvekEdgeInput, type SvekEdgeLabel, type SvekLinkStyle } from '../../core/svek/SvekEdge.js';
import { paintTextColor } from '../../core/decoration/symbol/usymbol-resolve.js';
import { buildLinkNoteBlock } from './link-note-block.js';
import type { DescriptionEdgeGeo } from './layout-helpers.js';
import { cleanStereotypeToken } from '../../core/style-map-element.js';
import { elementGradient } from '../../core/theme-element-resolve.js';
import { bareEntityName } from './namespace-groups.js';
import { resolveArrowLabelFont, resolveCardinalityFont } from '../../core/arrow-label-font.js';
import type { MagneticBorder } from '../../core/klimt/geom/MagneticBorder.js';
import { headPaint, styleFont, stylePaint } from './description-entity-style.js';
import { makeAtomImageResolverFor } from '../../core/creole-atoms-image-resolver.js';
import type { SpriteRegistry } from '../../core/sprite-commands.js';
import type { SvekEdgeEndText } from '../../core/svek/SvekEdge.js';
import type { EdgeEndText } from './layout-helpers-types.js';
import { FontStyle, type FontConfiguration } from '../../core/klimt/shape/UText.js';

/**
 * D2/D4: the main-label `<text>` font AND colour, resolved the SAME way
 * `layout.ts` resolves the DOT-measurement font (`resolveArrowLabelFont`,
 * D2/D3) so the reserved box and the drawn glyph never disagree
 * (`GraphvizImageBuilder.java:234-236`: upstream's `labelFont` is ONE
 * `FontConfiguration` carrying font AND colour). `color` is the resolver's
 * `arrowFontColor` cascade result, defaulting to `#000000`
 * (`ARROW_LABEL_DEFAULT_COLOR`) — NEVER `theme.colors.text` (D3; that is
 * `#181818`, a different role). `weight`/`style` map to
 * `FontStyle.BOLD`/`FontStyle.ITALIC` the same way
 * `class-member-creole.ts:207-209` already does for the class engine.
 */
export function arrowLabelFontConfig(theme: Theme): FontConfiguration {
  const font = resolveArrowLabelFont(theme);
  const styles = new Set<FontStyle>();
  if (font.weight === 'bold') styles.add(FontStyle.BOLD);
  if (font.style === 'italic') styles.add(FontStyle.ITALIC);
  return { family: font.family, size: font.size, color: font.color, styles };
}

/** `SvekEdge.java:260-262`: the link's own `Colors` mute the label font (TEXT). */
function edgeLabelFont(edge: DescriptionEdgeGeo, theme: Theme): FontConfiguration {
  const resolved = arrowLabelFontConfig(theme);
  // dss T3a site 1: `{root,element,<diagram>,arrow}`'s `FontColor` as the style engine resolved it (`T2a`,
  // `style-element-scope.ts`); `graph.arrowFontColor` is the flat path it supersedes (`GraphvizImageBuilder.java:234-235`).
  const scoped = theme.colors.elements?.arrow?.font;
  // `getDefaultStyleDefinitionArrow(stereotype).getMergedStyle(link.getStyleBuilder()).getFontConfiguration`
  // (`GraphvizImageBuilder.java:235-236`).
  const font =
    styleFont(edge.arrowStyle) ?? (scoped === undefined ? resolved : { ...resolved, color: paintTextColor(scoped) });
  // The link's own `Colors` mute the style-resolved font AFTER it (SvekEdge.java:260-262), so `text:` outranks the
  // stereotype-signed arrow `FontColor` (`SvekEdge.java:816-821`), which outranks the theme's arrow font colour.
  const color = edge.styleTextColor ?? (edge.arrowStyle === undefined ? tagStyle(edge, theme)?.fontColor : undefined);
  return color === undefined ? font : { ...font, color };
}

/** `SvekEdge#getSvekNode1/2().getMagneticBorder()`, or the cluster's: the border an end is pulled to (`SvekEdge.java:923-942`). */
export type EdgeMagnets = (id: string) => MagneticBorder | undefined;

interface EdgeEnds {
  readonly fromUid: string;
  readonly toUid: string;
  readonly magnet1: MagneticBorder | undefined;
  readonly magnet2: MagneticBorder | undefined;
  readonly sprites: SpriteRegistry | undefined;
}

/**
 * Fallback raw decor token when `DescriptionEdgeGeo.tailDecor`/`.headDecor`
 * (T17 write-set expansion — see `layout-helpers.ts`'s doc comment) are
 * BOTH absent: derived from the lossy `arrowHead` open/filled/none
 * classification alone. Reachable only for geometries built before the
 * expansion (e.g. hand-constructed test fixtures) — every geometry built by
 * `layoutDescription` today carries `tailDecor`/`headDecor` directly,
 * per-side, straight from `DescriptiveLink` (`layout-geo-post.ts:107-110`).
 *
 * CORRECTION (G1 I3, mission g1-description-svg): `buildInput` previously
 * called this whenever `edge.headDecor` alone was absent, regardless of
 * whether `edge.tailDecor` already carried the link's real (single-sided)
 * decor. `edge.arrowHead` is an independent, aggregate open/filled/none
 * classification of the WHOLE link (not "which side"), so for a real
 * tail-only-decorated link (e.g. `B <-- A`: `tailDecor: '<'`, `headDecor`
 * absent, `arrowHead: 'open'`) the old call synthesized a PHANTOM `'>'`
 * head decor from `arrowHead` alone, turning a single-sided link into a
 * both-sides-decorated one for `looksLikeRevertedForSvg`/
 * `looksLikeNoDecorAtAllSvg` (`link-decor.ts`) — collapsing the jar's
 * `X-backto-Y` path id (`Link#idCommentForSvg`, Link.java:106-114) into a
 * bare `X-Y`. Now gated on `edge.tailDecor === undefined` too, so the
 * fallback only fires when NEITHER raw token is present (the legacy/
 * hand-built-geometry case this function's own doc comment already
 * claimed was the only reachable one).
 */
function fallbackHeadToken(arrowHead: DescriptionEdgeGeo['arrowHead']): string | undefined {
  if (arrowHead === 'filled') return '>>';
  if (arrowHead === 'open') return '>';
  return undefined;
}

function edgeStyle(edge: DescriptionEdgeGeo): SvekLinkStyle {
  return edge.style;
}

/** A label placed from its table (`label.w`/`h`) is ONE block: the jar's
 *  `labelText` holds the stereotype line above the label (`SvekEdge.java
 *  :296-300`; sized the same way by `link-edge-attrs.ts#mainLabelText`).
 *  `undefined` for a label without a table (the `note on link` path). */
function tabledLabelText(edge: DescriptionEdgeGeo, visibleStereotype: string | undefined): string | undefined {
  const label = edge.label;
  if (label?.w === undefined || label.h === undefined) return undefined;
  return [
    ...(visibleStereotype === undefined ? [] : [`«${visibleStereotype}»`]),
    ...(label.text === '' ? [] : [label.text]),
  ].join('\n');
}

/**
 * The stereotype-signed arrow style of a link: `getDefaultStyleDefinition(stereotype)` is the arrow signature
 * `.withTOBECHANGED(stereotype)` (`SvekEdge.java:816-821`). The link keeps one label (`DescriptiveLink.stereotype`);
 * the cascade is keyed by the cleaned tag (`StyleSignatureBasic#clean`).
 */
function tagStyle(
  edge: DescriptionEdgeGeo,
  theme: Theme,
): { color?: string; thickness?: number; fontColor?: string } | undefined {
  const cascade = theme.colors.graph.descriptionArrowTagCascade;
  if (edge.stereotype === undefined || cascade === undefined) return undefined;
  return cascade[cleanStereotypeToken(edge.stereotype)];
}

/** `SvekEdge.java:265,876,897-904`: the three inputs `strokeOfLink` chooses between. */
function strokeFields(
  edge: DescriptionEdgeGeo,
  theme: Theme,
): Pick<SvekEdgeInput, 'styleThickness' | 'defaultThickness' | 'suggestedStroke'> {
  const defaultThickness = theme.colors.graph.arrowThickness;
  const suggested = edge.arrowStyle?.getStroke();
  const tagThickness = suggested === undefined ? tagStyle(edge, theme)?.thickness : undefined;
  return {
    ...(edge.styleThickness === undefined ? {} : { styleThickness: edge.styleThickness }),
    ...(defaultThickness === undefined && tagThickness === undefined
      ? {}
      : { defaultThickness: tagThickness ?? (defaultThickness as number) }),
    ...(suggested === undefined ? {} : { suggestedStroke: suggested }),
  };
}

/** `Rainbow.build(styleLine, set)`'s head colour (`Rainbow.java:83-90`): `HeadColor` where the style has one. A link's own colour replaces both (`SvekEdge.java:884-893`). */
function headColorField(edge: DescriptionEdgeGeo): Pick<SvekEdgeInput, 'headColor'> {
  if (edge.styleColor !== undefined) return {};
  const head = edge.arrowStyle === undefined ? undefined : headPaint(edge.arrowStyle);
  return head === undefined ? {} : { headColor: head };
}

/** `SvekEdge.java:330-340`, `Display.getWithNewlines(...).create(cardinalityFont, CENTER, skinParam)`. */
function endText(end: EdgeEndText | undefined, font: FontConfiguration): SvekEdgeEndText | undefined {
  return end === undefined ? undefined : { ...end, font };
}

function cardinalityFontConfig(edge: DescriptionEdgeGeo, theme: Theme): FontConfiguration {
  const styled = styleFont(edge.cardinalityStyle);
  if (styled !== undefined) return styled;
  const font = resolveCardinalityFont(theme);
  const styles = new Set<FontStyle>();
  if (font.weight === 'bold') styles.add(FontStyle.BOLD);
  if (font.style === 'italic') styles.add(FontStyle.ITALIC);
  return { family: font.family, size: font.size, color: font.color, styles };
}

/** `SvekEdge.java:291-294`, the wrap width, with the label's atoms and the link's own inversion. */
function labelFields(
  edge: DescriptionEdgeGeo,
  theme: Theme,
  sprites: SpriteRegistry | undefined,
): Pick<SvekEdgeInput, 'linkInverted' | 'labelMaxWidth' | 'resolveAtomImage'> {
  const styleWidth = edge.arrowStyle?.wrapWidth().getMaxWidth() ?? 0;
  const maxWidth = styleWidth > 0 ? styleWidth : (theme.maxMessageSize ?? 0);
  return {
    ...(edge.linkInverted === true ? { linkInverted: true } : {}),
    ...(maxWidth > 0 ? { labelMaxWidth: maxWidth } : {}),
    ...(sprites === undefined ? {} : { resolveAtomImage: makeAtomImageResolverFor(sprites) }),
  };
}

/** `SvekEdge.java:266-268,986`: `arrowLollipopColor`, defaulting to the background. */
function middleDecorField(edge: DescriptionEdgeGeo, theme: Theme): Pick<SvekEdgeInput, 'middleDecor'> {
  if (edge.middleDecor === undefined) return {};
  const diagramBackColor = theme.colors.background;
  const backColor = theme.colors.arrowLollipopColor ?? diagramBackColor;
  return { middleDecor: { decor: edge.middleDecor, backColor, diagramBackColor } };
}

/** The label, with its `note on link` block (`SvekEdge.java:312-326`) when the link has one and a table to draw in. */
function edgeLabel(edge: DescriptionEdgeGeo, theme: Theme, blockText: string | undefined): SvekEdgeLabel {
  const label = edge.label!;
  const text = blockText === undefined ? label : { ...label, text: blockText };
  if (edge.linkNote === undefined || text.w === undefined || text.h === undefined) return text;
  return {
    ...text,
    note: {
      block: buildLinkNoteBlock(edge.linkNote.text, theme, undefined, edge.linkNote.color),
      position: edge.linkNote.position,
    },
  };
}

/** `SvekEdge.java:874-876`, line colour: the bracket's, the link tag's, then the `arrow` signature's merged `LineColor`. */
function edgeLineColor(edge: DescriptionEdgeGeo, theme: Theme): Paint {
  return (
    edge.styleColor ??
    stylePaint(edge.arrowStyle, 'LineColor') ??
    tagStyle(edge, theme)?.color ??
    elementGradient(theme, 'arrow', 'border') ??
    theme.colors.graph.descriptionCascadeArrowColor ??
    theme.colors.arrow
  );
}

function buildInput(edge: DescriptionEdgeGeo, theme: Theme, uid: string, ends: EdgeEnds): SvekEdgeInput {
  const { fromUid, toUid } = ends;
  const cardinality = cardinalityFontConfig(edge, theme);
  const tailQuantifier = endText(edge.tailQuantifier, cardinality);
  const headQuantifier = endText(edge.headQuantifier, cardinality);
  const headDecor = edge.headDecor ?? (edge.tailDecor === undefined ? fallbackHeadToken(edge.arrowHead) : undefined);
  // G1 I5e: only the POST-colon-embedded stereotype form is ever drawn as
  // visible edge text upstream -- see `DescriptiveLink.stereotypeIsLinkLabel`'s
  // doc comment. The PRE-colon form (e.g. an auto-created endpoint's own
  // `Name<<tag>>`) is a style-selector/`remove` input only.
  const visibleStereotype = edge.stereotypeIsLinkLabel === true ? edge.stereotype : undefined;
  const hasLabelText = visibleStereotype !== undefined || edge.label !== undefined;
  const blockText = tabledLabelText(edge, visibleStereotype);
  return {
    uid,
    points: edge.points,
    // `SvekEdgeInput.from`/`.to` are DISPLAY names (`Link#getEntity().
    // getName()`, SvekEdge.ts's own doc comment) -- `edge.from`/`.to`
    // are the `dotKeyFor` DOT/geo identity key (may carry the internal
    // `SCOPE_KEY_SEP` disambiguation separator for a collision-resolved
    // qualified endpoint); `bareEntityName` strips that back to the
    // bare leaf name for display, matching `Quark#getName()`.
    from: edge.fromName ?? bareEntityName(edge.from),
    to: edge.toName ?? bareEntityName(edge.to),
    fromUid,
    toUid,
    style: edgeStyle(edge),
    // `SvekEdge.java:265` defaultThickness = `getThickness(LineParam.arrow)`
    // (`skinparam arrowThickness`), applied at `:899` unless the link
    // carries its own bracket thickness -- as class-edge-geo.ts does.
    ...strokeFields(edge, theme),
    ...labelFields(edge, theme, ends.sprites),
    ...headColorField(edge),
    ...middleDecorField(edge, theme),
    ...(tailQuantifier === undefined ? {} : { tailQuantifier }),
    ...(headQuantifier === undefined ? {} : { headQuantifier }),
    ...(edge.supplementaryColors === undefined ? {} : { supplementaryColors: edge.supplementaryColors }),
    ...(ends.magnet1 === undefined ? {} : { magnet1: ends.magnet1 }),
    ...(ends.magnet2 === undefined ? {} : { magnet2: ends.magnet2 }),
    // A bracket `#color` override feeds BOTH the line AND the (same-color)
    // filled extremity upstream (`svek/SvekEdge.java:884-893`) -- this
    // port's `SvekEdgeInput.color` already serves that dual role (no
    // multi-color Rainbow, see `SvekEdge.ts`'s class doc comment), so the
    // override simply replaces the theme default here.
    color: edgeLineColor(edge, theme),
    backgroundColor: theme.colors.background,
    ...(edge.tailDecor !== undefined ? { tailDecor: edge.tailDecor } : {}),
    ...(headDecor !== undefined ? { headDecor } : {}),
    ...(visibleStereotype !== undefined && blockText === undefined ? { stereotype: visibleStereotype } : {}),
    ...(edge.label !== undefined ? { label: edgeLabel(edge, theme, blockText) } : {}),
    ...(hasLabelText ? { labelFont: edgeLabelFont(edge, theme) } : {}),
    // `SvekEdge.java:376-381`: `skinparam defaultTextAlignment` (the root style bucket, as for a cluster title).
    ...(theme.colors.elements?.root?.horizontalAlignment !== undefined
      ? { labelAlignment: theme.colors.elements.root.horizontalAlignment }
      : {}),
  };
}

/** Builds and draws one edge. `nodeUid` maps AST node ids (both leaf and
 *  container — `edge.from`/`edge.to` are the link's own endpoint ids,
 *  never a synthetic group-anchor id) to their assigned `ent%04d` uid.
 *  `sharedIds` mirrors upstream `SvekResult#drawU`'s single `Set<String>
 *  ids` (SvekResult.java:93-101, one instance created per diagram, passed
 *  to every `SvekEdge#setSharedIds` before its own `drawU`) — the caller
 *  owns the Set's lifetime (one per `renderDescription` call), so two
 *  links whose `idCommentForSvg()` collide get the jar's `-1`/`-2`-suffixed
 *  disambiguation (`SvekEdge#uniq`, SvekEdge.java:1093) instead of a
 *  duplicate bare id. */
export function drawEdge(
  ug: UGraphic,
  edge: DescriptionEdgeGeo,
  theme: Theme,
  uid: string,
  plan: {
    readonly nodeUid: ReadonlyMap<string, string>;
    readonly magnets: EdgeMagnets;
    readonly sprites?: SpriteRegistry | undefined;
  },
  sharedIds: Set<string>,
  hidden = false,
): void {
  const fromUid = plan.nodeUid.get(edge.from) ?? edge.from;
  const toUid = plan.nodeUid.get(edge.to) ?? edge.to;
  const ends: EdgeEnds = {
    fromUid,
    toUid,
    magnet1: plan.magnets(edge.from),
    magnet2: plan.magnets(edge.to),
    sprites: plan.sprites,
  };
  const svekEdge = new SvekEdge(buildInput(edge, theme, uid, ends));
  svekEdge.setSharedIds(sharedIds);
  if (hidden) svekEdge.drawHiddenU(ug);
  else svekEdge.drawU(ug);
}
