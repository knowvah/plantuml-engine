/**
 * The worm copies an activity edge is drawn as: one for a plain arrow, one
 * per `;` member for a rainbow `-[#red;#blue]->`.
 * @see net/sourceforge/plantuml/activitydiagram3/ftile/Snake.java:189-224
 */
import { isTransparentColor } from '../../core/paint.js';
import { PAINT_NONE } from '../../core/svg.js';
import type { Theme } from '../../core/theme.js';
import type { ActivityEdgeGeo } from './activity-geometry.types.js';
import { defaultEdgeLook, type EdgeLook, type LineStroke } from './activity-edge-look.js';
import { tokensLinkStyle } from './layout/edge-link-style.js';
import { LinkStyle } from '../../core/decoration/LinkStyle.js';
import { parseColor, toSvgHex } from '../../core/klimt/color/HColorSet.js';
import { createWormMutation, moveFirstPoint, moveLastPoint } from './worm-mutation.js';

/** `Snake#drawInternal`'s single-colour stroke value (`Snake.java:193`) and the rainbow's separated one (`:215`). */
const SNAKE_STROKE_VALUE = 1.5;
/** `Snake.java:217`: with no separation space the copies overlap -- all but the last at 3.0, the last at 2.0. */
const OVERLAP_STROKE_VALUE = 3.0;
const OVERLAP_LAST_STROKE_VALUE = 2.0;
/** `Snake.java:203`: `move = 2 + colorArrowSeparationSpace`. */
const RAINBOW_BASE_MOVE = 2;

/** One drawn copy of an edge's worm. */
export interface WormCopy {
  readonly points: Array<{ x: number; y: number }>;
  readonly look: EdgeLook;
}

/** What `Snake#drawInternal` draws: the copies in order, and the label's x shift (`Snake.java:222-223`). */
export interface EdgeDrawPlan {
  readonly copies: readonly WormCopy[];
  readonly labelDx: number;
}

/** `HColorSet#getColor` as SVG hex; `undefined` for a non-colour (upstream throws). */
function colorTokenHex(token: string): string | undefined {
  const parsed = parseColor(token);
  if (parsed === undefined) return undefined;
  const hex = toSvgHex(parsed);
  // A transparent arrow colour is written `none` by the SVG driver (`SvgGraphics`, aar-T6a `nevavo-98-cenu680`).
  return isTransparentColor(hex) ? PAINT_NONE : hex;
}

/** `Worm.java:128-131`: the style's own stroke when normal, else `goThickness(value).getStroke3()`. */
function linkStroke(style: LinkStyle, normal: LineStroke, value: number): LineStroke {
  if (style.isNormal()) return normal;
  const s = style.goThickness(value).getStroke3();
  const dash = s.getDashVisible() === 0 ? undefined : `${s.getDashVisible()},${s.getDashSpace()}`;
  return dash === undefined ? { width: s.getThickness() } : { width: s.getThickness(), dash };
}

/**
 * `HtmlColorAndStyle.build` over one `;` member (`HtmlColorAndStyle.java:86-106`): each comma token is a
 * `LinkStyle` keyword or a colour replacing the style's `LineColor`; the head colour is `null` there, so it
 * is the arrow colour (`:66`).
 */
function memberLook(base: EdgeLook, member: string, strokeValue: number): EdgeLook {
  const tokens = member.split(',');
  const style = tokensLinkStyle(tokens);
  let line = base.line;
  for (const token of tokens) {
    if (LinkStyle.fromString1(token).isNormal()) line = colorTokenHex(token) ?? line;
  }
  return { line, head: line, stroke: linkStroke(style, base.stroke, strokeValue), invisible: style.isInvisible() };
}

/** `Rainbow.build`: `colorString.split(";")`, Java dropping trailing empty strings (`Rainbow.java:110-120`). */
function rainbowMembers(color: string): string[] {
  const members = color.split(';');
  while (members.length > 1 && members[members.length - 1] === '') members.pop();
  return members;
}

/** `Snake.java:215-217`. */
function rainbowStrokeValue(i: number, count: number, separation: number): number {
  if (separation !== 0) return SNAKE_STROKE_VALUE;
  return i === count - 1 ? OVERLAP_LAST_STROKE_VALUE : OVERLAP_STROKE_VALUE;
}

/** `Snake#drawRainbow` (`Snake.java:200-224`); `undefined` where upstream's `WormMutation` would throw. */
function drawRainbow(
  edge: ActivityEdgeGeo,
  members: readonly string[],
  base: EdgeLook,
  separation: number,
): EdgeDrawPlan | undefined {
  const mutation = createWormMutation(edge.points, RAINBOW_BASE_MOVE + separation);
  if (mutation === undefined) return undefined;
  const ordered = mutation.isDxNegative ? [...members].reverse() : members;
  const globalMove = (-1 * (ordered.length - 1)) / 2;
  let current = moveFirstPoint(edge.points, { dx: mutation.first.dx * globalMove, dy: mutation.first.dy * globalMove });
  if (mutation.size > 2) {
    current = moveLastPoint(current, { dx: mutation.last.dx * globalMove, dy: mutation.last.dy * globalMove });
  }
  const copies: WormCopy[] = [];
  for (let i = 0; i < ordered.length; i++) {
    const look = memberLook(base, ordered[i]!, rainbowStrokeValue(i, ordered.length, separation));
    copies.push({ points: current, look });
    current = mutation.mute(current);
  }
  return { copies, labelDx: mutation.textTranslateDx(ordered.length) };
}

/** `plan` with each copy's points replaced by the compressed ones (`rainbowCopies`), where compression ran. */
function withCompressedCopies(plan: EdgeDrawPlan, compressed: ActivityEdgeGeo['rainbowCopies']): EdgeDrawPlan {
  if (compressed === undefined || compressed.length !== plan.copies.length) return plan;
  return { ...plan, copies: plan.copies.map((c, i) => ({ ...c, points: compressed[i]! })) };
}

const SEPARATION_KEY: unique symbol = Symbol('activity.colorArrowSeparationSpace');

type ThemeWithSeparation = Theme & { readonly [SEPARATION_KEY]?: number };

/** `theme` carrying the diagram's `colorArrowSeparationSpace` under a module symbol, off the public `Theme` (D7). */
export function withSeparationSpace(theme: Theme, space: number | undefined): Theme {
  return space === undefined ? theme : ({ ...theme, [SEPARATION_KEY]: space } as ThemeWithSeparation);
}

/** {@link withSeparationSpace}'s value; absent = 0 (`SkinParam.java:1107`). */
export function separationSpaceOf(theme: Theme): number {
  return (theme as ThemeWithSeparation)[SEPARATION_KEY] ?? 0;
}

/** `SkinParam#getAsInt` (`SkinParam.java:1166-1172`): digits only, else the default. */
function colorArrowSeparationSpaceOf(skinparam: ReadonlyMap<string, string> | undefined): number | undefined {
  const raw = skinparam?.get('colorarrowseparationspace');
  return raw !== undefined && /^\d+$/.test(raw) ? Number.parseInt(raw, 10) : undefined;
}

/** `ast` with the block's `colorArrowSeparationSpace`, the step `activityPlugin#parse` and the conformance harness
 *  share. */
export function withColorArrowSeparationSpace<T extends { colorArrowSeparationSpace?: number }>(
  ast: T,
  styleSource: { readonly skinparam?: ReadonlyMap<string, string> } | undefined,
): T {
  const space = colorArrowSeparationSpaceOf(styleSource?.skinparam);
  return space === undefined ? ast : { ...ast, colorArrowSeparationSpace: space };
}

/**
 * `Snake#drawInternal` (`Snake.java:189-198`): `color.size() > 1` is the rainbow, else one copy at stroke 1.5.
 * `colorArrowSeparationSpace` is `Rainbow#getColorArrowSeparationSpace`, i.e. the skinparam at parse time.
 */
export function planEdgeDraw(edge: ActivityEdgeGeo, theme: Theme): EdgeDrawPlan {
  const base = defaultEdgeLook(theme, edge);
  if (edge.color === undefined) return { copies: [{ points: edge.points, look: base }], labelDx: 0 };
  const members = rainbowMembers(edge.color);
  if (members.length > 1) {
    const plan = drawRainbow(edge, members, base, separationSpaceOf(theme));
    if (plan !== undefined) return withCompressedCopies(plan, edge.rainbowCopies);
  }
  return { copies: [{ points: edge.points, look: memberLook(base, members[0]!, SNAKE_STROKE_VALUE) }], labelDx: 0 };
}
