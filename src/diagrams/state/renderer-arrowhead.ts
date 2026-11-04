/**
 * renderer-arrowhead.ts — mission G4 S1, mechanism 3 ("arrowhead-drawing
 * mechanism"): replaces `state/renderer.ts`'s SVG-`<marker>`-reference
 * arrowhead (`markerEnd: 'url(#arrow-dependency)'`) with the SAME
 * inline-`<polygon>` extremity shape the class/description engines already
 * draw (`core/svek/extremity/ExtremityArrow.ts`, `LinkDecor.ARROW`) — jar's
 * state-diagram corpus contains ZERO `<marker>`/`markerEnd` (grep-verified
 * across every sampled fixture, `plans/g4-state-svg/ledger.md` S0 mechanism
 * 3), same as class/description's.
 *
 * State transitions always resolve to a SINGLE head-side `ARROW` decor (the
 * plain `-->` trailing arrowhead) — unlike class's `EdgeGeo`, `TransitionGeo`
 * carries no tail-decor field at all (state has no `<--`/multi-decor
 * transition syntax), so this module is a head-only simplification of
 * `class/renderer-arrowhead.ts#buildEdgeArrowheads`/`#edgeExtremityInk`,
 * not a full port.
 *
 * mission G4 S15: `buildCircleEndMarkup`/`buildCrossStartMarkup` add the
 * `-->o`/`x-->` decorations (`LinkDecor.ARROW_AND_CIRCLE`/`CIRCLE_CROSS`,
 * `ExtremityArrowAndCircle.java`/`ExtremityCircleCross.java`) — ported as
 * STATE-LOCAL pure functions over `core/svg.ts`'s `ellipse`/`line`
 * primitives rather than extending `core/svek/extremity/link-decor.ts`'s
 * `LinkDecorName` union (OUTSIDE this mission's write-set; that file's own
 * doc comment already notes both decors are UNREACHABLE from the
 * description-diagram grammar it serves, so extending it would be a
 * cross-mission change). Derived empirically against the corpus's ONLY
 * fixture exercising this syntax (`xexika-61-fedu273`, both edges) by
 * reproducing `ExtremityArrowAndCircle`/`ExtremityFactoryArrowAndCircle`'s
 * combined rotate/translate algebra (the factory pre-rotates `angle` by
 * `-PI/2` before the constructor's own `+PI/2` re-adds it, net effect:
 * IDENTICAL polygon shape/placement to the plain `ARROW` decor, translate
 * origin = the RAW untrimmed endpoint, no extra offset) and
 * `ExtremityCircleCross`'s `createUDrawable` (which drops the `angle`
 * parameter entirely — the cross is always axis-aligned at literal
 * ±45°/±135°, never rotated to the edge's own tangent). Both jar-verified
 * byte-exact (ellipse/line coordinates, `fill`/`stroke`/`stroke-width`) —
 * see `plans/g4-state-svg/ledger.md` S15 for the full numeric derivation.
 *
 * **Every function here reads `transition.points`, and since SI32 T2 that is
 * the COMPOUND-CLIPPED path** — clipped once at construction
 * (`state-transition-clip.ts`), for both the ink walk and the renderer. That
 * is upstream's arrangement, not an accident of ordering: `SvekEdge#solveLine`
 * REASSIGNS `dotPath = dotPath.simulateCompound(...)`
 * (`~/git/plantuml/src/main/java/net/sourceforge/plantuml/svek/SvekEdge.java
 * :671-672`) and then builds BOTH extremities from the reassigned path —
 * `getExtremitySimplier(dotPath.getStartPoint(), ..., dotPath.getStartAngle()
 * + Math.PI, ...)` at `:679-681` and `getExtremitySimplier(dotPath
 * .getEndPoint(), ..., dotPath.getEndAngle(), ...)` at `:682-684`. So an
 * arrowhead sitting on the cluster frontier rather than at the in-cluster
 * anchor point is the CORRECT outcome here, and no compensating offset
 * belongs in this module. (Before SI32 the clip was ink-only, and this module
 * deliberately read the unclipped path to match a renderer that also drew it;
 * that asymmetry no longer exists.)
 *
 * "RAW"/"untrimmed" below always means *before `applyHeadTrim`'s
 * `getDecorationLength()` shortening* — never "before the compound clip".
 *
 * @see plans/g4-state-svg/ledger.md (S1 mechanism 3; S15 circle/cross)
 * @see class/renderer-arrowhead.ts (the class-engine precedent this mirrors)
 * @see ~/git/plantuml/.../svek/extremity/ExtremityArrowAndCircle.java
 * @see ~/git/plantuml/.../svek/extremity/ExtremityFactoryArrowAndCircle.java
 * @see ~/git/plantuml/.../svek/extremity/ExtremityCircleCross.java
 */

import type { Point2D } from '../../core/klimt/UTranslate.js';
import { DotPath, type Bezier } from '../../core/klimt/shape/DotPath.js';
import type { Paint } from '../../core/paint.js';
import { UGraphicSvg } from '../../core/klimt/drawing/svg/u-graphic-svg.js';
import { basicSvgOption } from '../../core/klimt/drawing/svg/svg-graphics.js';
import { Fore } from '../../core/klimt/Fore.js';
import { Back } from '../../core/klimt/Back.js';
import { UStroke } from '../../core/klimt/UStroke.js';
import { place } from '../../core/svek/svek-edge-extremity.js';
import type { ExtremityArrow } from '../../core/svek/extremity/ExtremityArrow.js';
import { extractFlatContent } from '../../core/klimt/document-shell.js';
import { LimitFinder } from '../../core/klimt/drawing/LimitFinder.js';
import type { TransitionGeo } from './state-geo-types.js';
import { XDimension2D } from '../../core/klimt/geom/XDimension2D.js';
import type { StringBounder } from '../../core/klimt/font/StringBounder.js';
import { ellipse, line } from '../../core/svg.js';

/** Extremities never draw text (the ARROW decor is a pure shape) — exists
 *  only to satisfy `UGraphicSvg.build`'s required 4th parameter, mirroring
 *  `class/renderer-arrowhead.ts#NO_TEXT_BOUNDER`. */
const NO_TEXT_BOUNDER = { calculateDimension: (): { width: number } => ({ width: 0 }) };

/** `Math.atan2` from `from` toward `to` — matches `DotPath#getEndAngle`'s
 *  own `atan2(last - secondToLast)` formula (see `class/renderer-arrowhead
 *  .ts#segmentAngle`'s identical doc comment for the upstream citation). */
function segmentAngle(from: Point2D, to: Point2D): number {
  return Math.atan2(to.y - from.y, to.x - from.x);
}

/** Draws the ARROW extremity via a throwaway klimt document, matching
 *  `SvekEdge#drawExtremity`'s draw-context construction (`Fore` then a
 *  thickness-only `solid` stroke then `Back`) — see `class/renderer-
 *  arrowhead.ts#drawExtremityMarkup`'s identical doc comment. */
/**
 * `SvekEdge#drawRainbow` (`SvekEdge.java:1113-1140`): the head is stroked in the head colour at
 * `stroke.onlyThickness()` and, for a `isFill` decor, filled with the LINE colour (`color.bg()`);
 * a transparent head colour draws `ExtremityArrow#drawLineIfTransparent` in the line colour instead.
 */
function drawArrowMarkup(
  point: Point2D,
  angle: number,
  paint: { readonly color: Paint; readonly headColor: Paint | undefined },
  strokeWidth: number,
): { body: string; extraDefs: string; trim: Point2D } {
  const placed = place('ARROW', point, angle, 'none');
  const ug = UGraphicSvg.build(0, basicSvgOption(), '$version$', NO_TEXT_BOUNDER);
  const thicknessOnlyStroke = UStroke.withThickness(strokeWidth);
  if (paint.headColor === undefined) {
    const context = ug.apply(new Fore(paint.color)).apply(thicknessOnlyStroke);
    (placed.drawable as ExtremityArrow).drawLineIfTransparent(context);
  } else {
    const context = ug.apply(new Fore(paint.headColor)).apply(thicknessOnlyStroke).apply(new Back(paint.color));
    placed.drawable.drawU(context);
  }
  const drawn = extractFlatContent(ug.getSvgString());
  return { ...drawn, trim: placed.trim };
}

export interface TransitionArrowhead {
  /** The head-side extremity's inline-polygon markup, or `''` when the
   *  transition has fewer than two points to anchor a direction on. */
  readonly markup: string;
  readonly extraDefs: string;
  /** The connecting `<path>`'s endpoint shift so the line stops at the
   *  arrow's outer edge instead of running underneath it (`decorTrim`'s
   *  own `getDecorationLength()`-based delta) — `undefined` when
   *  `markup === ''`. */
  readonly trim?: Point2D;
}

const EMPTY_ARROWHEAD: TransitionArrowhead = { markup: '', extraDefs: '' };

/** Builds the head-side inline-polygon arrowhead markup for one transition
 *  — the replacement for `renderer.ts`'s old `markerEnd: 'url(#arrow-
 *  dependency)'` path attribute. */
/** Which end of the path a decor sits at: `SvekEdge.java:680-684` draws `decor2` at the start, `decor1` at the end. */
export type DecorSide = 'start' | 'end';

/** The decor's anchor point and the direction it points (`dotPath.getStartAngle() + PI` / `getEndAngle()`). */
function decorPlacement(points: TransitionGeo['points'], side: DecorSide): { point: Point2D; angle: number } {
  if (side === 'start') return { point: points[0]!, angle: segmentAngle(points[1]!, points[0]!) };
  const last = points[points.length - 1]!;
  return { point: last, angle: segmentAngle(points[points.length - 2]!, last) };
}

export function buildTransitionArrowhead(
  transition: TransitionGeo,
  paint: Paint | { readonly color: Paint; readonly headColor: Paint | undefined },
  strokeWidth: number,
  side: DecorSide = 'end',
): TransitionArrowhead {
  const points = transition.points;
  if (points.length < 2) return EMPTY_ARROWHEAD;
  const { point, angle } = decorPlacement(points, side);
  const colors = typeof paint === 'object' && 'color' in paint ? paint : { color: paint, headColor: paint };
  const drawn = drawArrowMarkup(point, angle, colors, strokeWidth);
  return { markup: drawn.body, extraDefs: drawn.extraDefs, trim: drawn.trim };
}

/** Shortens `points` so the connecting `<path>` stops at the outer edge of
 *  the drawn arrowhead — the render-side counterpart of `SvekEdge#drawU`'s
 *  `dotPath.moveEndPoint` call, applied to the flat `TransitionGeo.points`
 *  list `buildPathD` consumes. Mirrors `class/renderer-arrowhead.ts
 *  #applyDecorTrim`'s head-side branch exactly (state has no tail decor to
 *  mirror the tail branch for). */
export function applyHeadTrim(
  points: TransitionGeo['points'],
  trim: Point2D | undefined,
  side: DecorSide = 'end',
): TransitionGeo['points'] {
  if (trim === undefined || points.length < 2) return points;
  // stdd T6c: the move is `DotPath#moveStartPoint`/`#moveEndPoint` itself (`SvekEdge.java:559-562`):
  // the start move drops the first bezier when it is at least that bezier's length and carries the
  // difference over (`DotPath.java:206-216`); the end move only shifts the last anchor and its control
  // (`:229-234`). kotagu-43's `SubComposite-backto-*start*CompositeState` starts on a 4.6 px bezier.
  const path = dotPathOf(points);
  if (path !== undefined) {
    if (side === 'end') path.moveEndPoint(trim.x, trim.y);
    else path.moveStartPoint(trim.x, trim.y);
    return pointsOf(path);
  }
  const out = points.map((p) => ({ ...p }));
  // stdd T2b: `dotPath.moveStartPoint` for a start-side decor (`SvekEdge.java:921-931`), the mirror of the end.
  const tip = side === 'end' ? out.length - 1 : 0;
  const control = side === 'end' ? tip - 1 : 1;
  out[tip] = { x: out[tip]!.x + trim.x, y: out[tip]!.y + trim.y };
  if (out.length >= 4) out[control] = { x: out[control]!.x + trim.x, y: out[control]!.y + trim.y };
  return out;
}

/** A cubic point list (`1 + 3n` points) as a `DotPath`; `undefined` for any other shape (a two-point line). */
function dotPathOf(points: TransitionGeo['points']): DotPath | undefined {
  if (points.length < 4 || (points.length - 1) % 3 !== 0) return undefined;
  const beziers: Bezier[] = [];
  for (let i = 0; i + 3 < points.length; i += 3) {
    const [p0, c1, c2, p1] = [points[i]!, points[i + 1]!, points[i + 2]!, points[i + 3]!];
    beziers.push({ x1: p0.x, y1: p0.y, ctrlx1: c1.x, ctrly1: c1.y, ctrlx2: c2.x, ctrly2: c2.y, x2: p1.x, y2: p1.y });
  }
  return DotPath.fromBeziers(beziers);
}

function pointsOf(path: DotPath): TransitionGeo['points'] {
  const beziers = path.getBeziers();
  const out: { x: number; y: number }[] = [{ x: beziers[0]!.x1, y: beziers[0]!.y1 }];
  for (const b of beziers) {
    out.push({ x: b.ctrlx1, y: b.ctrly1 }, { x: b.ctrlx2, y: b.ctrly2 }, { x: b.x2, y: b.y2 });
  }
  return out;
}

/** Extremities never draw text — this stub is never actually invoked
 *  (mirrors `class/renderer-arrowhead.ts#INK_STRING_BOUNDER`). */
/** `Extremity#getDecorationLength` (`Extremity.java:83-85`): 8 for every extremity that does not override it --
 *  `ExtremityCircleCross` and `ExtremityArrowAndCircle` among them (`ExtremityArrow` says 5). */
export const DEFAULT_DECORATION_LENGTH = 8;

/** `new UTranslate(decorationLength, 0).rotate(angle - Math.PI)` (`SvekEdge.java:559-562`): the path's move at
 *  `side` for a decoration of `length`, in `decorPlacement`'s own angle. stdd T6c, viguto-81's `X-->`/`-->O`. */
export function decorationTrim(points: TransitionGeo['points'], side: DecorSide, length: number): Point2D | undefined {
  if (points.length < 2) return undefined;
  const theta = decorPlacement(points, side).angle - Math.PI;
  return { x: length * Math.cos(theta), y: length * Math.sin(theta) };
}

/** `ExtremityArrowAndCircle`'s polygon sits `radius` behind the path end (`polygon.translate(p1.x + radius *
 *  sin(angle), p1.y - radius * cos(angle))`, `ExtremityArrowAndCircle.java`), the circle on the end itself: the
 *  same arrow drawn on a tip pulled back by `distance` along the last segment. */
export function pullTipBack(
  points: TransitionGeo['points'],
  side: DecorSide,
  distance: number,
): TransitionGeo['points'] {
  if (points.length < 2) return points;
  const { angle } = decorPlacement(points, side);
  const tip = side === 'end' ? points.length - 1 : 0;
  const out = [...points];
  out[tip] = { x: out[tip]!.x - distance * Math.cos(angle), y: out[tip]!.y - distance * Math.sin(angle) };
  return out;
}

const INK_STRING_BOUNDER: StringBounder = {
  calculateDimension: () => new XDimension2D(0, 0),
};

export interface TransitionArrowheadInk {
  readonly minX: number;
  readonly minY: number;
  readonly maxX: number;
  readonly maxY: number;
}

/** Returns the ink extent of a transition's head-side ARROW extremity, or
 *  `undefined` when the transition has fewer than two points — mirrors
 *  `class/renderer-arrowhead.ts#edgeExtremityInk`'s identical mechanism
 *  (real `LimitFinder` walk over the placed `Extremity#drawU`). Consumed
 *  by `layout-ink-extent.ts#computeStateDocumentDims`. */
export function transitionArrowheadInk(transition: TransitionGeo): TransitionArrowheadInk | undefined {
  const points = transition.points;
  if (points.length < 2) return undefined;
  // stdd T2b: an inverted link's head is `decor2`, at the path start.
  const { point, angle } = decorPlacement(points, transition.inverted === true ? 'start' : 'end');
  const finder = LimitFinder.create(INK_STRING_BOUNDER, false);
  place('ARROW', point, angle, 'none').drawable.drawU(finder);
  return { minX: finder.getMinX(), minY: finder.getMinY(), maxX: finder.getMaxX(), maxY: finder.getMaxY() };
}

// ---------------------------------------------------------------------------
// mission G4 S15: `-->o`/`x-->` arrow decorations
// ---------------------------------------------------------------------------

/** `ExtremityArrowAndCircle`'s own `radius` field. */
export const CIRCLE_END_RADIUS = 5;
/** Both decors' own `UStroke.withThickness(1.5)` circle stroke. */
const DECOR_CIRCLE_STROKE_WIDTH = 1.5;
/** `ExtremityCircleCross`'s own `radius` field. */
const CROSS_START_RADIUS = 7;

/**
 * `LinkDecor.ARROW_AND_CIRCLE` (`-->o`) -- a background-filled `<ellipse>`
 * centered at the transition's RAW (pre-trim) head endpoint, drawn AFTER
 * the plain arrowhead polygon `buildTransitionArrowhead` already produces
 * (same polygon shape/position -- see this module's own top doc comment
 * for the rotate/translate derivation showing the two decors coincide).
 * `''` when the transition has no points to anchor on, mirroring
 * `buildTransitionArrowhead`'s own empty-points guard.
 */
export function buildCircleEndMarkup(
  transition: TransitionGeo,
  color: Paint,
  background: Paint,
  side: DecorSide = 'end',
): string {
  const points = transition.points;
  if (points.length === 0) return '';
  const last = side === 'end' ? points[points.length - 1]! : points[0]!;
  return ellipse(last.x, last.y, CIRCLE_END_RADIUS, CIRCLE_END_RADIUS, {
    fill: background,
    stroke: color,
    'stroke-width': DECOR_CIRCLE_STROKE_WIDTH,
  });
}

/**
 * `LinkDecor.CIRCLE_CROSS` (`x-->`) -- a background-filled `<ellipse>` plus
 * two diagonal `<line>`s forming an "X", centered at the transition's RAW
 * (untrimmed) TAIL endpoint (`points[0]`). Jar-verified
 * (`ExtremityFactoryCircleCross#createUDrawable`): the cross is ALWAYS
 * axis-aligned at literal +-45deg/+-135deg -- the edge's own tangent
 * `angle` is accepted by the factory but never read by the constructor it
 * calls, so this decoration never rotates with the line direction, unlike
 * every other extremity this module draws.
 */
export function buildCrossStartMarkup(
  transition: TransitionGeo,
  color: Paint,
  background: Paint,
  side: DecorSide = 'start',
): string {
  const points = transition.points;
  if (points.length === 0) return '';
  const p = side === 'start' ? points[0]! : points[points.length - 1]!;
  const circle = ellipse(p.x, p.y, CROSS_START_RADIUS, CROSS_START_RADIUS, {
    fill: background,
    stroke: color,
    'stroke-width': DECOR_CIRCLE_STROKE_WIDTH,
  });
  const d = CROSS_START_RADIUS * Math.SQRT1_2;
  const diag1 = line(p.x + d, p.y + d, p.x - d, p.y - d, { stroke: color, strokeWidth: 1 });
  const diag2 = line(p.x + d, p.y - d, p.x - d, p.y + d, { stroke: color, strokeWidth: 1 });
  return circle + diag1 + diag2;
}
