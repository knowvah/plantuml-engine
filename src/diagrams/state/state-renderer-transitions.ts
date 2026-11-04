/**
 * State-diagram transition rendering: path building, endpoint id
 * resolution, local scope naming, and the wrapped transition markup. Split
 * out of `renderer.ts` (line cap); self-contained leaf consumed by renderer.
 */

import { splinePathD } from '../../core/svg-path-builder.js';
import type { StateUrl } from './state-geo-types.js';
import type { TransitionGeo } from './layout.js';
import type { Theme } from '../../core/theme.js';
import type {} from '../../core/dispatcher.js';
import { path, text, linkWrap } from '../../core/svg.js';
import { withContentGradientIds } from '../../core/svg-defs.js';
import { INITIAL_ID, FINAL_ID } from './state-dot-graph.js';
import { zaentId } from './state-composite-classify.js';
import {} from './renderer-uid.js';
import type { StateUidPlan } from './renderer-uid.js';
import { wrapLink } from './renderer-group.js';
import { applyHeadTrim, type TransitionArrowhead } from './renderer-arrowhead.js';
import { buildTransitionDecors } from './state-transition-decors.js';
import {} from './renderer-pseudostate.js';
import {} from './renderer-box.js';
import { STATE_ARROW_BUCKET, stateBucketColor } from './state-bucket-colors.js';
import { TransitionLink, resolveTransitionPaint } from './state-link-style.js';
import { renderStateRuns } from './renderer-box.js';
import { HorizontalAlignment } from '../../core/klimt/geom/HorizontalAlignment.js';
import { VisibilityModifier } from '../../core/skin/VisibilityModifier.js';
import { CLASS_ATTRIBUTE_ICON_SIZE_DEFAULT } from '../../core/edge-label-box.js';
import type { Paint } from '../../core/paint.js';
import { UGraphicSvg } from '../../core/klimt/drawing/svg/u-graphic-svg.js';
import { basicSvgOption } from '../../core/klimt/drawing/svg/svg-graphics.js';
import { UTranslate } from '../../core/klimt/UTranslate.js';
import { extractFlatContent } from '../../core/klimt/document-shell.js';
import {} from './renderer-composite-box.js';
import { renderNoteOnLink } from './renderer-note.js';
import {} from './state-shadow.js';

import { resolveArrowLabelFont } from '../../core/arrow-label-font.js';

/**
 * mission G4 S8 (mechanism 19): `TransitionGeo.points` is a well-formed
 * `1 + 3*n` cubic-bezier spline for every real dot-layout-driven transition
 * -- confirmed by direct inspection of `layoutState()`'s own raw output
 * (`state-manual-arrowheads.test.ts`'s doc comment) -- jar's own `DotPath`
 * draws it as a genuine SVG cubic bezier chain (`Mx,y Cx1,y1 x2,y2 x,y
 * [Cx1,y1 x2,y2 x,y ...]`, repeating the `C` command once per 3-point
 * group), NOT a polyline OR a re-interpolated Catmull-Rom curve through the
 * control points -- the pre-S8 implementation's own Catmull-Rom smoothing
 * was WRONG: it discarded the already-correct bezier control-point
 * structure `applyHeadTrim` (renderer-arrowhead.ts) already assumes and
 * re-derived extra, spurious segments (jar-verified regression:
 * `nelupe-49-xova546`'s `*start*s7_2-to-chat1` -- jar draws ONE 4-point
 * segment, the pre-S8 port drew THREE). Mirrors `class/renderer.ts
 * #buildPathData` exactly (G2 N5), including its straight-`L`-segment
 * fallback for any point list that ISN'T `1 + 3*n`
 * (`points.length < 4` or `(points.length - 1) % 3 !== 0`) -- the
 * degenerate/hand-built 2-point secant case a caller might still construct
 * outside the real layout pipeline (unit tests).
 */
export function buildPathD(points: ReadonlyArray<{ x: number; y: number }>): string {
  return splinePathD(points);
}

/** `'__zaent_'`, derived from {@link zaentId} rather than re-spelled. */
const ZAENT_PREFIX = zaentId('');

/** `Link#idCommentForSvg`-ish `<path id="...">` value — jar names the
 *  pseudo-start/end endpoints `*start*`/`*end*` in this attribute (byte-
 *  compared, unlike `data-qualified-name`) regardless of this port's own
 *  internal `__initial__`/`__final__` ids (`state-dot-graph.ts`).
 *  Jar-verified `moleco-69-sida106` (`id="*start*-to-Main_Libre"`),
 *  `bajelo-54-dixe684` (`id="Track_FSM-to-*end*"`).
 *
 *  mission G4 S7 (discovered while jar-verifying mechanism 10's own fix):
 *  the COMPOSITE pipeline's own scope-local pseudo anchors
 *  (`state-composite-pass.ts#scopedPseudoIds`, `__init_<scopeId>`/
 *  `__final_<scopeId>`) also need this `*start*<name>`/`*end*<name>` form
 *  -- jar's real `StateDiagram#getStart`/`#getEnd` build the SAME
 *  `"*start*" + g.getName()` string upstream regardless of nesting depth,
 *  where `g.getName()` is the OWNING GROUP's own LOCAL (never fully-
 *  qualified) name. For a CONCURRENT_STATE region, that local name is the
 *  bare synthetic `CONC<n>` segment (`StateDiagram#concurrentState`'s own
 *  `getUniqueSequence2(CONCURRENT_PREFIX)`), NOT this port's own
 *  internally-qualified `concurrentRegionScopeId` (`<ownerId>::CONC<n>`,
 *  deliberately over-qualified for THIS port's own cross-region dedup) --
 *  so a `::`-qualified scope id is stripped to its trailing `CONC<n>`
 *  segment. jar-verified `nelupe-49-xova546`: `*start*s7_2-to-chat1`
 *  (owner-level, unqualified already), `*start*toutou9-to-leo` (nested
 *  composite, unqualified already), `*start*CONC1-to-toutou9` (region,
 *  qualified `s7_2::CONC1` stripped to `CONC1`). */
function svgEndpointId(nodeId: string, concurrentGlobalIds: ReadonlyMap<string, number>): string {
  if (nodeId === INITIAL_ID) return '*start*';
  if (nodeId === FINAL_ID) return '*end*';
  // stdd T1a: `Link#idCommentForSvg` (`abel/Link.java:106-114`) prints
  // `Entity#getName`; the zaent anchor is this port's DOT stand-in for the
  // cluster's special point (`Cluster.getSpecialPointId`) and never names an
  // entity, so a cluster endpoint prints the cluster's own name.
  if (nodeId.startsWith(ZAENT_PREFIX)) return nodeId.slice(ZAENT_PREFIX.length);
  const scopedInit = /^__init_(.*)$/.exec(nodeId);
  if (scopedInit !== null) return `*start*${localScopeName(scopedInit[1]!, concurrentGlobalIds)}`;
  const scopedFinal = /^__final_(.*)$/.exec(nodeId);
  if (scopedFinal !== null) return `*end*${localScopeName(scopedFinal[1]!, concurrentGlobalIds)}`;
  return nodeId;
}

/** Strips this port's own `<ownerId>::CONC<n>` internal qualification down
 *  to the bare trailing segment jar's own unqualified `getName()` produces
 *  -- see {@link svgEndpointId}'s own doc comment for the full mechanism.
 *  A non-region scope id (no `::`) is already local, unchanged.
 *
 *  mission G4 S14 (CONC-region bare-name global numbering): a `::`-qualified
 *  region scope id (e.g. `"State2::CONC1"`) is FIRST looked up in
 *  `concurrentGlobalIds` (`StateGeometry.concurrentGlobalIds`, ultimately
 *  `ast.concurrentGlobalIds` -- see that field's own doc comment, ast.ts)
 *  to translate this port's own owner-local region number into jar's real
 *  diagram-global `net.atmp.CucaDiagram#cpt2` one -- e.g. `State2`'s own
 *  FIRST region is locally `"CONC1"` but renders as jar's real `"CONC2"`
 *  when it is the SECOND `--` encountered anywhere in the document
 *  (jar-verified `lalava-26-zosi801`/`tegali-39-molu382`). Falls back to
 *  the pre-S14 bare-suffix strip when the key is absent (a hand-built test
 *  geometry with no `concurrentGlobalIds`, or -- defensively -- an
 *  internal id shape this map was never populated for). */
function localScopeName(scopeId: string, concurrentGlobalIds: ReadonlyMap<string, number>): string {
  const globalId = concurrentGlobalIds.get(scopeId);
  if (globalId !== undefined) return `CONC${globalId}`;
  const i = scopeId.lastIndexOf('::');
  return i === -1 ? scopeId : scopeId.slice(i + 2);
}

/** T7/D3/D4/T5: the transition-label `<text>` font attrs (family/size/
 *  weight/style) AND fill colour, resolved the SAME way
 *  `state-dot-graph.ts`/`state-composite-pass.ts` resolve the DOT-
 *  measurement font (`resolveArrowLabelFont`, D2/D3) so the reserved box
 *  and the drawn glyph never disagree (`GraphvizImageBuilder.java:234-235`),
 *  NOT `theme.fontSize`/`theme.colors.text` (14/`#181818`, the STATE
 *  body/title-text defaults). `color` defaults to `#000000`, the jar's
 *  root `FontColor black` (`skin/plantuml.skin:9`; the `arrow` block at
 *  `:306-310` sets no FontColor of its own -- D3). Mirrors
 *  `description/renderer-edge.ts#arrowLabelFontConfig`'s weight/style
 *  mapping. */
function transitionLabelFontAttrs(theme: Theme): {
  fontFamily: string;
  fontSize: number;
  fontWeight?: 'bold';
  fontStyle?: 'italic';
  color: string;
} {
  const font = resolveArrowLabelFont(theme);
  return {
    fontFamily: font.family,
    fontSize: font.size,
    ...(font.weight === 'bold' ? { fontWeight: 'bold' } : {}),
    ...(font.style === 'italic' ? { fontStyle: 'italic' } : {}),
    color: font.color,
  };
}

/** Split out of {@link buildTransitionInnerMarkup} to stay under this
 *  project's per-function NLOC cap -- the transition label `<text>`,
 *  font AND fill both from {@link transitionLabelFontAttrs} (T5/D3).
 *
 *  T4 (`note-on-link`): `transition.label.noteLines !== undefined` ⇒ a
 *  `note ... on link` -- draw the real `EntityImageNoteLink`/
 *  `ComponentRoseNote` folded-corner box (`renderer-note.ts#renderNoteOnLink`)
 *  instead of a plain `<text>` glyph; `label.x`/`label.y`/`label.width`/
 *  `label.height` are then the box's own top-left corner + dims
 *  (`TransitionGeo.label`'s own doc comment), not a baseline anchor. */
function buildTransitionLabelMarkup(transition: TransitionGeo, theme: Theme): string {
  if (transition.label === undefined) return '';
  if (transition.label.noteLines !== undefined) return buildLinkNoteMarkup(transition.label, theme);
  return buildInlineLabelMarkup(transition.label, theme);
}

/** An ordinary inline label: the `arrow` signature's font colour, the label's own font. */
function buildInlineLabelMarkup(label: InlineLabel, theme: Theme): string {
  const { color, ...fontAttrs } = transitionLabelFontAttrs(theme);
  // dss T3c site 9: the label's FontColor is the `arrow` style's
  // (`SvekEdge.java:817-819`); `core/arrow-label-font.ts` is outside T3c's
  // write-set, so the scoped colour overrides its answer here.
  const fill = stateBucketColor(theme, STATE_ARROW_BUCKET, 'font') ?? color;
  if (label.lines !== undefined && label.ascent !== undefined) return buildLabelBlockMarkup(label, theme, fill);
  return text(label.x, label.y, label.text, {
    ...fontAttrs,
    fill,
    ...(label.textLength !== undefined ? { textLength: label.textLength } : {}),
  });
}

type InlineLabel = Pick<
  NonNullable<TransitionGeo['label']>,
  'text' | 'x' | 'y' | 'textLength' | 'lines' | 'align' | 'blockWidth' | 'ascent' | 'visibility'
>;

/**
 * stdd T2c: the label as a `TextBlock` (`SvekEdge.java:287-300`, `Display#create0`): one line after
 * another at the block's alignment, each run drawn by the state creole renderer (tab stops, leading
 * spaces, `textLength` per run), after `addVisibilityModifier`'s icon (`:363-374`) when the first line
 * carried a visibility character. `y` is the first line's baseline, so the block top is `y - ascent`.
 */
function buildLabelBlockMarkup(label: InlineLabel, theme: Theme, fill: string): string {
  const font = resolveArrowLabelFont(theme);
  const lines = label.lines!;
  const blockWidth = label.blockWidth ?? Math.max(0, ...lines.map((l) => l.width));
  const iconWidth = label.visibility?.iconWidth ?? 0;
  const textLeft = label.x + iconWidth;
  const top = label.y - label.ascent!;
  const style = {
    fontFamily: font.family,
    fill,
    ...(font.weight === 'bold' ? { fontWeight: '700' as const } : {}),
  };
  let out = label.visibility === undefined ? '' : buildLabelVisibilityIcon(label, theme, top);
  let lineTop = top;
  for (const line of lines) {
    const height = line.height === 0 ? font.size : line.height;
    const x = textLeft + alignedLineOffset(label.align, blockWidth, line.width);
    out += renderStateRuns(line.runs, x, lineTop, height, style);
    lineTop += height;
  }
  return out;
}

/** `TextBlockSimple`'s per-line x for the block's `HorizontalAlignment` (`TextBlockSimple.java`). */
function alignedLineOffset(align: HorizontalAlignment | undefined, blockWidth: number, lineWidth: number): number {
  if (align === HorizontalAlignment.LEFT) return 0;
  if (align === HorizontalAlignment.RIGHT) return blockWidth - lineWidth;
  return (blockWidth - lineWidth) / 2;
}

/**
 * `addVisibilityModifier` (`SvekEdge.java:363-374`): `getUBlock(classAttributeIconSize, fore)` with
 * `withMargin(0, 1, 2, 0)`, merged LR with the text block, `VerticalAlignment.CENTER`: the icon's own
 * `size + 1` box sits 2 below the merged block's top, centred against the text height.
 */
function buildLabelVisibilityIcon(label: InlineLabel, theme: Theme, blockTop: number): string {
  const vis = label.visibility!;
  const modifier = VISIBILITY_BY_NAME[vis.modifier];
  const icon = ICON_SKINPARAM_COLOR[vis.modifier];
  if (modifier === undefined || icon === undefined) return '';
  const font = resolveArrowLabelFont(theme);
  const textHeight = label.lines!.reduce((sum, l) => sum + (l.height === 0 ? font.size : l.height), 0);
  const mergedHeight = Math.max(textHeight, vis.iconHeight);
  const y = blockTop + (mergedHeight - vis.iconHeight) / 2 + VISIBILITY_ICON_MARGIN_TOP;
  const ug = UGraphicSvg.build(0, basicSvgOption(), '$version$', NO_LABEL_TEXT_BOUNDER);
  const context = ug.apply(new UTranslate(label.x, y));
  // `rose.getHtmlColor(skinParam, visibilityModifier.getForeground())` (`SvekEdge.java:366-367`): the
  // `iconPublic` family skinparam, else `ColorParam`'s default.
  const fore = modifier.getForeground();
  const color = icon(theme) ?? fore.defaultValue;
  const size = theme.classAttributeIconSize ?? CLASS_ATTRIBUTE_ICON_SIZE_DEFAULT;
  modifier.getUDrawable(size, color, null).drawU(context);
  // `VisibilityModifier#drawWithGroup` opens the `<g data-visibility-modifier>` itself (`:113`).
  return extractFlatContent(ug.getSvgString()).body;
}

/** `TextBlockUtils.withMargin(visibility, 0, 1, 2, 0)`'s `marginY1`. */
const VISIBILITY_ICON_MARGIN_TOP = 2;
const NO_LABEL_TEXT_BOUNDER = { calculateDimension: (): { width: number } => ({ width: 0 }) };
/** `VisibilityModifier#name()` to the instance and to the icon character (`class/renderer-edge-extras.ts`). */
const VISIBILITY_BY_NAME: Record<string, VisibilityModifier> = {
  PRIVATE_METHOD: VisibilityModifier.PRIVATE_METHOD,
  PROTECTED_METHOD: VisibilityModifier.PROTECTED_METHOD,
  PACKAGE_PRIVATE_METHOD: VisibilityModifier.PACKAGE_PRIVATE_METHOD,
  PUBLIC_METHOD: VisibilityModifier.PUBLIC_METHOD,
  IE_MANDATORY: VisibilityModifier.IE_MANDATORY,
};
/** The `skinparam icon<Kind>Color` each modifier's foreground `ColorParam` reads (`Rose#getHtmlColor`). */
const ICON_SKINPARAM_COLOR: Record<string, (theme: Theme) => Paint | undefined> = {
  PRIVATE_METHOD: (theme) => theme.colors.graph.iconPrivateColor,
  PROTECTED_METHOD: (theme) => theme.colors.graph.iconProtectedColor,
  PACKAGE_PRIVATE_METHOD: (theme) => theme.colors.graph.iconPackageColor,
  PUBLIC_METHOD: (theme) => theme.colors.graph.iconPublicColor,
  IE_MANDATORY: () => undefined,
};

/** A link's note, with its inline label when it has one. dss T3e: `SvekEdge.java:307-325,950-954` draws
 *  both operands of the merged block, in `TextBlockVertical`/`TextBlockHorizontal` order (the note first
 *  for `Position.LEFT`/`TOP`, else the label first). */
function buildLinkNoteMarkup(label: NonNullable<TransitionGeo['label']>, theme: Theme): string {
  const { x, y, width = 0, height = 0, noteLines = [], linkLabel } = label;
  const note = renderNoteOnLink({ x, y, width, height }, noteLines, theme, label.noteColor);
  if (linkLabel === undefined) return note;
  const inline = buildInlineLabelMarkup(
    {
      text: linkLabel.text,
      x: x + linkLabel.dx,
      y: y + linkLabel.dy,
      ...(linkLabel.textLength !== undefined ? { textLength: linkLabel.textLength } : {}),
    },
    theme,
  );
  return label.noteFirst === true ? note + inline : inline + note;
}

/** `LinkStyle.DASHED`'s `7,7` as the jar writes it on a note's line. */
const NOTE_LINK_DASH = '7,7';
/** `data-link-type` of a link with no decor at either end. */
const NOTE_LINK_TYPE = 'association';

/** Path + inline arrowhead + optional label — the wrapped `<g class=
 *  "link">`'s inner content, split out of {@link renderTransitionWrapped}
 *  to stay under this project's per-function NLOC cap. mission G4 S1
 *  mechanism 3: inline `<polygon>` arrowhead instead of a `<marker>`
 *  reference -- `ExtremityArrow`'s decorationLength-based path trim
 *  (`applyHeadTrim`) must run BEFORE `buildPathD` so the connecting line
 *  stops at the arrow's outer edge, matching jar exactly. mission G4 S15:
 *  `circleEnd`/`crossStart` decorations (`renderer-arrowhead.ts
 *  #buildCircleEndMarkup`/`#buildCrossStartMarkup`) draw AT the transition's
 *  own RAW (pre-trim) endpoints -- neither decoration changes `applyHeadTrim`
 *  itself (see that module's own top doc comment for the jar-verified
 *  derivation showing the head trim is UNCHANGED by `circleEnd`). */
function buildTransitionInnerMarkup(
  transition: TransitionGeo,
  theme: Theme,
  concurrentGlobalIds: ReadonlyMap<string, number>,
  sharedIds: Set<string>,
): string {
  // mission G4 S16: <style> stateDiagram { arrow { LineColor HeadColor
  // } } } -- see state-render-colors.ts#resolveStateArrowLineColor's own
  // doc comment.
  //
  // dss T3c sites 7-8: `SvekEdge.java:817-819,857-861` signs `root, element,
  // stateDiagram, arrow`; `Rainbow.build(Style, HColorSet)`
  // (`Rainbow.java:84-95`) takes LineColor for the line and HeadColor, which
  // falls back to that same LineColor, for the head. The scoped LineColor
  // (`arrow` bucket) comes first, as it is the builder's merge of every
  // selector; the flat `stateArrow*Color` fields keep their own tiers below.
  // stdd T2a: the link's `applyStyle` result and `SvekEdge.java:874-905`'s reads
  // (`state-link-style.ts`). A hidden link (`SvekResult.java:95`, `UHidden`) emits nothing.
  const link = new TransitionLink(transition);
  if (link.isHidden()) return '';
  const paint = resolveTransitionPaint(transition, link, theme);
  // dss T3f: a note's `Link` is `LinkType(NONE, NONE).goDashed()`
  // (`CommandFactoryNoteOnEntity.java:342`): no decor, the `DotPath` whole.
  if (transition.noteLinkId !== undefined) {
    return path(buildPathD(transition.points), {
      stroke: paint.color,
      strokeWidth: 1,
      strokeDasharray: NOTE_LINK_DASH,
      id: uniq(sharedIds, transition.noteLinkId),
    });
  }
  const strokeWidth = paint.stroke.getThickness();
  const decors = buildTransitionDecors(transition, link, paint, theme);
  // `SvekEdge#getExtremitySimplier` moves the path at BOTH ends by each extremity's own decoration length
  // (`SvekEdge.java:559-562`): the head's (an arrow 5, an arrow-and-circle 8) and, for `x-->`, the tail's 8.
  const headTrimmed = applyHeadTrim(transition.points, decors.headTrim, decors.headSide);
  const points = applyHeadTrim(headTrimmed, decors.tailTrim, decors.tailSide);
  const d = buildPathD(points);
  if (d === '') return '';

  // mission G4 S15 (`Link#idCommentForSvg`): the `-to-` separator only
  // fires when EXACTLY ONE side carries a non-NONE decor -- a plain forward
  // transition always has a non-NONE HEAD decor (the trailing arrowhead), so
  // `crossStart` (a non-NONE TAIL decor too) makes BOTH sides non-NONE,
  // collapsing to a bare `-` separator (`looksLikeNoDecorAtAllSvg`, already
  // ported in `core/svek/extremity/link-decor.ts` for the class engine's own
  // use -- jar-verified `xexika-61-fedu273`'s own self-loop:
  // `id="foo-foo"`, not `"foo-to-foo"`). `circleEnd` alone does not
  // trigger this (the head side was already non-NONE) -- jar-verified
  // `id="*start*-to-foo"` on the SAME fixture's other edge.
  // stdd T2b: `Link#idCommentForSvg` (`Link.java:106-114`) over the link's own decors, which
  // `TransitionLink` carries inversed for a LEFT/UP link.
  const dash = paint.stroke.getDasharraySvg();
  const pathEl = path(d, {
    stroke: paint.color,
    strokeWidth,
    ...(dash !== undefined ? { strokeDasharray: `${dash[0]},${dash[1]}` } : {}),
    id: uniq(
      sharedIds,
      link.idCommentForSvg(
        svgEndpointId(transition.from, concurrentGlobalIds),
        svgEndpointId(transition.to, concurrentGlobalIds),
      ),
    ),
  });

  const labelEl = buildTransitionLabelMarkup(transition, theme);

  return pathEl + decors.crossStart + arrowheadWithDefs(decors.arrowhead) + decors.circleEnd + labelEl;
}

/**
 * One `SvgGraphics` draws all of it upstream (`SvekEdge#drawU`); the extremity's throwaway document numbered its own
 * gradient, so that def rides inline under its content id (`svg-defs.ts#withContentGradientIds`).
 */
function arrowheadWithDefs(arrowhead: TransitionArrowhead): string {
  const head = withContentGradientIds(arrowhead.extraDefs, arrowhead.markup);
  return head.defs + head.body;
}

/**
 * `SvekEdge#uniq` (`svek/SvekEdge.java:1093-1106`): the first link to claim a
 * comment keeps it; every later one appends `-1`, `-2`, ... until the set
 * accepts it. `sharedIds` is the set `SvekResult#drawU` creates once per
 * result and hands every line (`SvekResult.java:93-99`).
 */
function uniq(ids: Set<string>, comment: string): string {
  if (!ids.has(comment)) {
    ids.add(comment);
    return comment;
  }
  for (let i = 1; ; i++) {
    const candidate = `${comment}-${i}`;
    if (!ids.has(candidate)) {
      ids.add(candidate);
      return candidate;
    }
  }
}

/** The per-result identity inputs: `sharedIds` is one set per svek result (`SvekResult#drawU`'s `ids`, {@link uniq}). */
export interface TransitionIds {
  readonly uidPlan: StateUidPlan;
  readonly concurrentGlobalIds: ReadonlyMap<string, number>;
  readonly sharedIds: Set<string>;
}

/** stdd T3d: `activeUrl` is the enclosing entity's open link, re-opened inside the line's group
 *  (`SvgGraphics#startGroup`, `addTopOpenedLinkIfNeeded`). */
export function renderTransitionWrapped(
  transition: TransitionGeo,
  theme: Theme,
  ids: TransitionIds,
  activeUrl?: StateUrl,
): string {
  const { uidPlan, concurrentGlobalIds, sharedIds } = ids;
  // stdd T5a: `Link#isHidden` (`Link.java:458-460`): `-[hidden]->` or a hidden end; `SvekResult.java:98`
  // keeps the `UComment` only.
  const hidden = transition.hidden === true || new TransitionLink(transition).isHidden();
  const built = hidden ? '' : buildTransitionInnerMarkup(transition, theme, concurrentGlobalIds, sharedIds);
  if (built === '' && !hidden) return '';
  const inner = activeUrl === undefined ? built : linkWrap(built, activeUrl);
  const uid = uidPlan.edgeUid.get(transition) ?? '';
  // stdd T2b: `Link#commentForSvg` (`Link.java:117-119`) -- `reverse link` for an inverted link.
  const reverse = transition.noteLinkId === undefined && new TransitionLink(transition).looksLikeRevertedForSvg();
  // `Link#commentForSvg` prints `Entity#getName` (`Link.java:117-121`), as the path id does.
  return wrapLink(
    {
      from: svgEndpointId(transition.from, concurrentGlobalIds),
      to: svgEndpointId(transition.to, concurrentGlobalIds),
      uid,
      fromUid: uidPlan.resolveNodeUid(transition.from),
      toUid: uidPlan.resolveNodeUid(transition.to),
      ...(transition.noteLinkId !== undefined ? { linkType: NOTE_LINK_TYPE } : {}),
      ...(reverse ? { reverse: true } : {}),
      ...(activeUrl !== undefined ? { activeUrl } : {}),
      ...(hidden ? { hidden: true } : {}),
    },
    inner,
  );
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------
