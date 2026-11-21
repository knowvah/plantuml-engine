/**
 * cdd-T17 (M8): the ADDITIVE role-label mirror geometry, plus
 * `attachPortLabels` itself -- split out of `class-edge-label-anchor.ts`
 * (500-line hook cap; the role mirror pushed that file over) purely to keep
 * both files under the cap. `class-edge-label-anchor.ts` re-exports
 * `roleLabelAnchors`/`attachPortLabels` so no consumer's import path
 * changed (same split precedent as that file's own header: pre-authorised,
 * "500-line splits into re-exported siblings").
 */
import type { Relationship } from './ast.js';
import type { DotLayoutResult } from '../../core/graph-layout.js';
import type { FontSpec, StringMeasurer } from '../../core/measurer.js';
import type { QuantifierLineGeo } from './class-geo-edge-extras.js';
import type { EdgeGeo } from './layout.js';
import { CARDINALITY_FONT_SIZE } from './class-layout-helpers.js';
import { dotEdgeRunsReversed } from './class-dot-edge-order.js';
import { createRoleBlock, getPosition, type Pt, type RoleBlock } from '../../core/svek/RoleLabels.js';
import { CLASS_ATTRIBUTE_ICON_SIZE_DEFAULT } from '../../core/edge-label-box.js';
import type { VisibilityIconGeo } from './class-edge-visibility.js';
import { PositionableImpl } from '../../core/klimt/geom/PositionableImpl.js';
import { XDimension2D } from '../../core/klimt/geom/XDimension2D.js';
import { manageCollision } from '../../core/svek/quantifier-collision.js';
import type { RectangleArea } from '../../core/svek/FrontierCalculator.js';
import { sampleEdgePath } from './class-edge-constraint.js';
import { drawnEdgePoints } from './class-ink-dot-path.js';
import {
  measureLabelLines,
  labelLinesFromTopLeft,
  placeQuantifierBox,
  portLabelAnchor,
  type PortLabelContext,
} from './class-edge-label-anchor.js';

/**
 * cdd-T17 (M8): the role's own box mirrors the ALREADY-PLACED quantifier
 * box across the line direction (`SvekEdge.java:1025-1063`, `drawRoleLabel`
 * -- doc comment: "Draws a role label on the opposite side of the line from
 * the quantifier. For vertical lines, the role is placed on the other side
 * of the line's X. For horizontal lines, the role is placed on the other
 * side of the line's Y."). No `manageCollision` pass: upstream draws the
 * role straight from this offset, never through `getXY`'s reserved DOT
 * marker (that reservation stays the quantifier's alone -- or the role's
 * OWN text in the fallback case, which never reaches this function; see
 * `class-layout-edge-labels.ts#computeMultiplicityAttrs`).
 *
 * Three branches, `SvekEdge.java:1033-1063`:
 * - Degenerate (`|dirX|+|dirY| < 0.001`, a zero-length line): role sits
 *   directly BELOW the quantifier's own top-left, no gap.
 * - `|dirY| >= |dirX|` (mostly vertical): mirror across the line's OWN x
 *   (`thisEndpoint.x`) -- role sits `gap=2` past whichever side of the
 *   line the quantifier's own CENTER is NOT on, at the quantifier's SAME
 *   y. Jar-verified against `mugobo-34-fede498`'s vertical `User--Item`
 *   link: quantifier box left=6 width=127.319 (`qCenterX=69.66 < lineX=
 *   149.23`) -> role x = 149.23+2 = `151.23`, exactly jar's `<text
 *   x="151.23">1</text>`/`<text x="151.23">items</text>` (both ends share
 *   `lineX` -- the line is perfectly vertical, so `thisEndpoint.x` is the
 *   SAME 149.23 whichever end is queried) -- and role y = quantifier's OWN
 *   box top, landing role and quantifier on the IDENTICAL baseline (jar:
 *   both `y="73.253"` on the tail, both `y="104.032"` on the head).
 * - `|dirY| < |dirX|` (mostly horizontal): the same mirror, across the
 *   line's OWN y instead -- role x = quantifier's own box left.
 *
 * a5731db447f: the role's box position -- upstream's `drawRoleLabel` now
 * asks `RoleLabels#getPosition` (`SvekEdge.java:1054-1060`), which keeps the
 * cdd-T17 mirror of the quantifier across the line as its preferred place
 * and, when that collides with a node of the link, the quantifier or the
 * line itself, falls back to the closest free place
 * (`svek/RoleLabels.java:93-200`, ported at `core/svek/RoleLabels.ts`).
 * `pathSamples` is `dotPath.sample()` (`sampleEdgePath`), `obstacles` the
 * rectangles of the link's two nodes (`SvekEdge#getNodeAreas`).
 */
function roleBoxTopLeft(
  quantifierBox: { pos: { x: number; y: number }; maxWidth: number; totalHeight: number },
  roleDim: { width: number; height: number },
  line: RoleLine,
): { x: number; y: number } {
  return getPosition(
    {
      qDim: { width: quantifierBox.maxWidth, height: quantifierBox.totalHeight },
      rDim: roleDim,
      quantifierPos: quantifierBox.pos,
    },
    { thisEndpoint: line.thisEnd, otherEndpoint: line.otherEnd, pathSamples: line.pathSamples },
    line.obstacles ?? [],
  );
}

/** One end's line inputs to {@link roleBoxTopLeft}: this end / the other end
 *  (`SvekEdge.java:962-964`), plus -- absent for a hand-built straight
 *  segment -- the path samples and node areas. */
export interface RoleLine {
  readonly thisEnd: { x: number; y: number };
  readonly otherEnd: { x: number; y: number };
  readonly pathSamples?: readonly Pt[] | undefined;
  readonly obstacles?: readonly RectangleArea[] | undefined;
}

/** {@link placeRoleLabel}'s result: the role's text lines and, when its
 *  first character was a visibility character, the icon merged LEFT of them. */
export interface RolePlacement {
  readonly lines: QuantifierLineGeo[];
  readonly icon?: VisibilityIconGeo;
}

/** The size/measuring inputs of {@link placeRoleLabel}: bundled to stay under
 *  the project's per-function param cap. */
export interface RoleLabelInput {
  readonly measurer: StringMeasurer;
  readonly font: FontSpec;
  /** `SkinParam#classAttributeIconSize()`; undefined is upstream's default. */
  readonly classAttributeIconSize?: number | undefined;
}

/** `TextBlockUtils.withMargin(visibility, 0, 1, 2, 0)`'s top margin
 *  (`SvekEdge#addVisibilityModifier`; `RoleLabels#create`). */
const ICON_MARGIN_Y1 = 2;

/**
 * The ADDITIVE role label -- its text lines plus visibility icon -- present
 * only alongside a real quantifier on the SAME end (see {@link
 * roleBoxTopLeft}'s doc comment). The merged block is
 * `mergeLR(withMargin(icon, 0, 1, 2, 0), text, CENTER)` (`RoleLabels#create`,
 * upstream a5731db447f): widths add, heights max, each operand centred on the
 * other (`TextBlockHorizontal.java:79-91`), the icon `2` below its block top
 * (`marginY1`).
 */
export function placeRoleLabel(
  roleText: string,
  quantifierBox: { pos: { x: number; y: number }; maxWidth: number; totalHeight: number },
  line: RoleLine,
  input: RoleLabelInput,
): RolePlacement {
  const m = roleBlockMetrics(roleText, input);
  const pos = roleBoxTopLeft(quantifierBox, { width: m.width, height: m.height }, line);
  return layoutRoleBlock(m, pos, input);
}

/** A role's merged block: its text (visibility character stripped), the
 *  icon's reserved size, and the block's own dimensions. */
interface RoleBlockMetrics {
  readonly block: RoleBlock;
  readonly measured: ReturnType<typeof measureLabelLines>;
  readonly iconWidth: number;
  readonly iconHeight: number;
  readonly width: number;
  readonly height: number;
}

function roleBlockMetrics(roleText: string, input: RoleLabelInput): RoleBlockMetrics {
  const block = createRoleBlock(roleText, input.classAttributeIconSize ?? CLASS_ATTRIBUTE_ICON_SIZE_DEFAULT);
  const measured = measureLabelLines(block.text, input.font, input.measurer);
  const iconWidth = block.icon?.width ?? 0;
  const iconHeight = block.icon?.height ?? 0;
  return {
    block,
    measured,
    iconWidth,
    iconHeight,
    width: iconWidth + measured.maxWidth,
    height: Math.max(iconHeight, measured.totalHeight),
  };
}

/** Where the two operands of the merged block land once its top-left is
 *  known: the text `iconWidth` to the right, each centred on the other. */
function layoutRoleBlock(m: RoleBlockMetrics, pos: { x: number; y: number }, input: RoleLabelInput): RolePlacement {
  const textTopLeft = { x: pos.x + m.iconWidth, y: pos.y + (m.height - m.measured.totalHeight) / 2 };
  const lines = labelLinesFromTopLeft(m.measured, textTopLeft, input.font, input.measurer);
  if (m.block.icon === undefined) return { lines };
  const y = pos.y + (m.height - m.iconHeight) / 2 + ICON_MARGIN_Y1;
  return { lines, icon: { x: pos.x, y, modifier: m.block.icon.modifier } };
}

/** The role lines alone -- {@link placeRoleLabel} for a caller that draws no
 *  icon (the cdd-T17 entry point). */
export function roleLabelAnchors(
  roleText: string,
  quantifierBox: { pos: { x: number; y: number }; maxWidth: number; totalHeight: number },
  endpoints: RoleLine,
  measurer: StringMeasurer,
  font: FontSpec,
): QuantifierLineGeo[] {
  return placeRoleLabel(roleText, quantifierBox, endpoints, { measurer, font }).lines;
}

/** One end's multiplicity/role inputs to {@link attachEndPortLabel} --
 *  bundled to stay under the project's per-function param cap. `role` is
 *  ALREADY swap-resolved by the caller, same as `multiplicity`. */
interface EndLabelInput {
  readonly multiplicity: string | undefined;
  readonly role: string | undefined;
  readonly centerX: number | undefined;
  readonly centerY: number | undefined;
  readonly thisEnd: { x: number; y: number } | undefined;
  readonly otherEnd: { x: number; y: number } | undefined;
  /** a5731db447f: `dotPath.sample()` and the link's node areas. */
  readonly pathSamples: readonly Pt[];
  readonly obstacles: readonly RectangleArea[];
  readonly classAttributeIconSize: number | undefined;
}

/** One end's computed anchors -- the legacy single anchor (`tailLabel`/
 *  `headLabel`, T6's note: "the renderer no longer reads" this, kept for
 *  the hand-built-literal fallback `renderer-edge-extras.ts
 *  #renderEdgeCardinalityLabels` still carries), the split quantifier-or-
 *  role-fallback lines, and the additive role lines (empty when this end
 *  carries no ADDITIVE role). */
interface EndLabelResult {
  readonly anchor?: { text: string; x: number; y: number; width: number };
  readonly lines: QuantifierLineGeo[];
  readonly roleLines: QuantifierLineGeo[];
  /** a5731db447f: the visibility icon of this end's role. */
  readonly roleIcon?: VisibilityIconGeo | undefined;
}

/**
 * One end (tail or head) of {@link attachPortLabels} -- factored out so
 * that function stays under the project's per-function NLOC cap once the
 * role mirror joined the quantifier/fallback logic it already ran twice
 * (tail, head). `text = input.multiplicity ?? input.role` mirrors
 * `class-layout-edge-labels.ts#computeMultiplicityAttrs`'s IDENTICAL
 * fallback exactly (`SvekEdge.java:447-466`) -- the reserved DOT position
 * this function reads (`input.centerX`/`centerY`) only exists because that
 * function reserved a box for ONE of the two, so re-deriving the same
 * `??` here is what keeps the two in sync, not a coincidence.
 */
function attachEndPortLabel(
  input: EndLabelInput,
  cardinalityFont: FontSpec,
  splitFont: FontSpec,
  measurer: StringMeasurer,
  nodes: DotLayoutResult['nodes'],
): EndLabelResult {
  const text = input.multiplicity ?? input.role;
  if (text === undefined || input.centerX === undefined || input.centerY === undefined) {
    return { lines: [], roleLines: [] };
  }
  const center = { x: input.centerX, y: input.centerY };
  const roleInput: RoleLabelInput = {
    measurer,
    font: splitFont,
    classAttributeIconSize: input.classAttributeIconSize,
  };
  // a5731db447f: an end with a role but no multiplicity -- the role IS the
  // reserved label, icon block and all.
  if (input.multiplicity === undefined) {
    return standInRoleLabel(input.role!, center, { cardinalityFont, roleInput, nodes });
  }
  const anchor = portLabelAnchor(text, center, measurer, cardinalityFont, nodes);
  const placed = placeQuantifierBox(text, center, measurer, splitFont, nodes);
  const lines = labelLinesFromTopLeft(placed, placed.pos, splitFont, measurer);
  // T17/M8: ADDITIVE only when BOTH a multiplicity and a role are present
  // on this end -- an end with a role but no multiplicity took the stand-in
  // path above, and its role ink is already fully drawn via `lines`.
  if (input.role === undefined || input.thisEnd === undefined || input.otherEnd === undefined) {
    return { anchor, lines, roleLines: [] };
  }
  const line = {
    thisEnd: input.thisEnd,
    otherEnd: input.otherEnd,
    pathSamples: input.pathSamples,
    obstacles: input.obstacles,
  };
  const role = placeRoleLabel(input.role, placed, line, roleInput);
  return { anchor, lines, roleLines: role.lines, roleIcon: role.icon };
}

/**
 * The role standing in for an absent quantifier (`SvekEdge.java:447-466`,
 * `drawU` `:988-990`): the merged icon + text block is what graphviz
 * reserved (`appendTable(startTailRoleText.calculateDimension(...))`) and
 * what `asPositionable(forSize = startTailRoleText, ...)` collision-manages,
 * so the box is centred at the reserved marker at the MERGED size.
 */
function standInRoleLabel(
  role: string,
  center: { x: number; y: number },
  ctx: { cardinalityFont: FontSpec; roleInput: RoleLabelInput; nodes: DotLayoutResult['nodes'] },
): EndLabelResult {
  const { cardinalityFont, roleInput, nodes } = ctx;
  const m = roleBlockMetrics(role, roleInput);
  const anchor = portLabelAnchor(m.block.text, center, roleInput.measurer, cardinalityFont, nodes);
  const box = new PositionableImpl(
    center.x - Math.trunc(m.width) / 2,
    center.y - Math.trunc(m.height) / 2,
    new XDimension2D(m.width, m.height),
  );
  const pos = manageCollision(box, nodes).getPosition();
  const placed = layoutRoleBlock(m, { x: pos.getX(), y: pos.getY() }, roleInput);
  return { anchor, lines: placed.lines, roleLines: [], roleIcon: placed.icon };
}

/**
 * The tail/head {@link EndLabelInput} pair -- factored out of
 * {@link attachPortLabels} purely to keep that function under the project's
 * per-function NLOC/CCN caps once the role mirror joined the pre-existing
 * swap logic.
 *
 * T11: `edgeResult.tailLabelX/Y` and `headLabelX/Y` are @knowvah/dot-engine's
 * placement for the DOT `taillabel`/`headlabel` attributes -- which
 * `class-dot-edges.ts#buildDotEdgeAttrs` now reserves from the SWAPPED
 * quantifier pair whenever `dotEdgeRunsReversed(rel)` is true (same root
 * this function must follow, or the rendered `<text>` carries the wrong
 * string at the right position -- the second consumer T3's diagnosis named,
 * `.agent-notes/m3-tail-head-swap.md`). `swap` is pure over `rel`, so
 * recomputing it here reproduces `class-dot-edges.ts`'s own `swap` exactly
 * (`class-dot-graph.ts#computeSwappedEdges` builds its `swappedEdges` set
 * the identical way).
 *
 * T17/M8: `Link.java:116-117`'s `getInv()` swaps `role2`/`role1` the SAME
 * way it swaps `quantifier2`/`quantifier1` -- reproduced here, unlike
 * `class-dot-edges.ts#swappedRel`, which does NOT yet swap `fromRole`/
 * `toRole` for the DOT-reservation fallback (see `class-layout-edge-labels
 * .ts#computeMultiplicityAttrs`'s own doc comment: unreached by the corpus,
 * filed as a follow-on).
 *
 * cdd-T13 (M1): `edgeGeo.points[0]`/`.at(-1)` run entity1 -> entity2
 * (`class-edge-geo.ts#buildEdgeGeos`'s own doc comment on `matchesFromTo`)
 * -- the SAME endpoints upstream's `dotPath.getStartPoint()`/`getEndPoint()`
 * name for `startTailRoleText`/`endHeadRoleText`'s own `drawRoleLabel` calls
 * (`SvekEdge.java:962-964,975-977`) on every corpus fixture this task
 * jar-verified (`dotEdgeReversed === false`, no distance-check flip).
 */
function buildEndLabelInputs(
  rel: Relationship,
  edgeGeo: EdgeGeo,
  edgeResult: DotLayoutResult['edges'][number],
  roleCtx: {
    drawn: EdgeGeo['points'];
    obstacles: readonly RectangleArea[];
    classAttributeIconSize: number | undefined;
  },
): { tail: EndLabelInput; head: EndLabelInput } {
  const swap = dotEdgeRunsReversed(rel);
  // a5731db447f: `drawRoleLabel` reads `dotPath`, which
  // `SvekEdge#getExtremitySimplier` already trimmed in place (`:585-588`) --
  // the endpoints and the samples are those of the DRAWN path.
  const { drawn } = roleCtx;
  const thisEndTail = drawn[0];
  const otherEndTail = drawn.at(-1);
  const roleLine = {
    pathSamples: hasRole(rel) ? sampleEdgePath(drawn) : [],
    obstacles: roleCtx.obstacles,
    classAttributeIconSize: roleCtx.classAttributeIconSize,
  };
  return {
    tail: {
      multiplicity: swap ? rel.toMultiplicity : rel.fromMultiplicity,
      role: swap ? rel.toRole : rel.fromRole,
      centerX: edgeResult.tailLabelX,
      centerY: edgeResult.tailLabelY,
      thisEnd: thisEndTail,
      otherEnd: otherEndTail,
      ...roleLine,
    },
    head: {
      multiplicity: swap ? rel.fromMultiplicity : rel.toMultiplicity,
      role: swap ? rel.fromRole : rel.toRole,
      centerX: edgeResult.headLabelX,
      centerY: edgeResult.headLabelY,
      thisEnd: otherEndTail,
      otherEnd: thisEndTail,
      ...roleLine,
    },
  };
}

const hasRole = (rel: Relationship): boolean => rel.fromRole !== undefined || rel.toRole !== undefined;

/** `SvekEdge#getNodeAreas` (upstream a5731db447f): the rectangles of the
 *  link's two nodes -- those the layout laid out; an endpoint with no node
 *  of its own id (a package anchor) contributes none, as upstream skips a
 *  null `getSvekNode1()`/`getSvekNode2()`. */
function nodeAreas(rel: Relationship, nodes: DotLayoutResult['nodes']): RectangleArea[] {
  return nodes
    .filter((n) => n.id === rel.from || n.id === rel.to)
    .map((n) => ({ minX: n.x, minY: n.y, maxX: n.x + n.width, maxY: n.y + n.height }));
}

/** Attach `tailLabel`/`headLabel` (G2/N25) if `graph-layout.ts` computed a
 *  position for them -- absent when the relationship carries no
 *  `fromMultiplicity`/`toMultiplicity`/`fromRole`/`toRole` (`edgeLabelAttrs`
 *  then never set `tailLabel`/`headLabel` on the DOT input, so
 *  `extractPortLabelPositions` never ran for this edge). */
export function attachPortLabels(
  edgeGeo: EdgeGeo,
  rel: Relationship,
  edgeResult: DotLayoutResult['edges'][number],
  ctx: PortLabelContext,
): void {
  const { measurer, fontFamily, nodes } = ctx;
  const cardinalityFont: FontSpec = { family: fontFamily, size: CARDINALITY_FONT_SIZE };
  // A2a/M10: the resolved `arrow.cardinality` font feeds the SPLIT anchors
  // only -- see `PortLabelContext.cardinalityFont`.
  const splitFont = ctx.cardinalityFont ?? cardinalityFont;
  const { tail: tailInput, head: headInput } = buildEndLabelInputs(rel, edgeGeo, edgeResult, {
    // Only a role is placed against the drawn path; skip the extremity walk otherwise.
    drawn: hasRole(rel) ? drawnEdgePoints(edgeGeo) : edgeGeo.points,
    obstacles: nodeAreas(rel, nodes),
    classAttributeIconSize: ctx.classAttributeIconSize,
  });
  const tail = attachEndPortLabel(tailInput, cardinalityFont, splitFont, measurer, nodes);
  const head = attachEndPortLabel(headInput, cardinalityFont, splitFont, measurer, nodes);
  if (tail.anchor !== undefined) edgeGeo.tailLabel = tail.anchor;
  if (head.anchor !== undefined) edgeGeo.headLabel = head.anchor;
  if (tail.lines.length > 0 || head.lines.length > 0) edgeGeo.quantifierLines = [tail.lines, head.lines];
  if (tail.roleLines.length > 0 || head.roleLines.length > 0) edgeGeo.roleLines = [tail.roleLines, head.roleLines];
  if (tail.roleIcon !== undefined || head.roleIcon !== undefined) edgeGeo.roleIcons = [tail.roleIcon, head.roleIcon];
}
