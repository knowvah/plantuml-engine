/**
 * Role labels of an association (`A "1"/"owner" --> B`): where the block is
 * drawn. Upstream `RoleLabels` is shared by the Graphviz, Smetana and ELK
 * engines; this port serves the Graphviz (svek) and ELK paths.
 *
 * Upstream `RoleLabels#create` builds a text block; {@link createRoleBlock}
 * is its data half (text with the leading visibility character stripped,
 * plus the icon block's reserved size) and the class renderer draws it.
 *
 * Param bundling: upstream `getPosition` takes seven positional parameters;
 * the project caps functions at five, so the three label boxes and the four
 * line inputs ride in two objects. Every field keeps its upstream name.
 *
 * @see net/sourceforge/plantuml/svek/RoleLabels.java (upstream a5731db447f)
 */
import type { RectangleArea } from './FrontierCalculator.js';
import { VisibilityModifier } from '../skin/VisibilityModifier.js';

export interface Pt {
  readonly x: number;
  readonly y: number;
}

export interface Dim {
  readonly width: number;
  readonly height: number;
}

/** The quantifier and the role boxes (`qDim`, `rDim`, `quantifierPos`). */
export interface RoleLabelBoxes {
  readonly qDim: Dim;
  readonly rDim: Dim;
  readonly quantifierPos: Pt;
}

/** The line the label hangs on (`thisEndpoint`, `otherEndpoint`,
 *  `pathSamples`). `pathSamples` undefined means "use the straight segment
 *  between the two endpoints" (`getPosition`'s `null`). */
export interface RoleLabelLine {
  readonly thisEndpoint: Pt;
  readonly otherEndpoint: Pt;
  readonly pathSamples?: readonly Pt[] | undefined;
}

/** What a role is made of: its text (a leading visibility character
 *  stripped) and, when it had one, the icon merged LEFT of it. */
export interface RoleBlock {
  readonly text: string;
  readonly icon?: {
    /** `VisibilityModifier#name`, the `data-visibility-modifier` value. */
    readonly modifier: string;
    /** The block's reserved size: `withMargin(icon, 0, 1, 2, 0)` of the
     *  `size + 1` square, i.e. `size + 2` by `size + 3`
     *  (`TextBlockUtils.withMargin`, `SvekEdge#addVisibilityModifier`). */
    readonly width: number;
    readonly height: number;
  };
}

/**
 * `RoleLabels#create`'s data half. "A role is a property of the class, so it
 * gets the icons of the fields (hollow), as the attributes do, and not the
 * ones of the methods (filled)" -- hence `getVisibilityModifier(role, true)`.
 *
 * @see RoleLabels.java#create (`:72-96`)
 */
export function createRoleBlock(role: string, classAttributeIconSize: number): RoleBlock {
  if (classAttributeIconSize <= 0) return { text: role };
  const modifier = VisibilityModifier.getVisibilityModifier(role, true);
  if (modifier === null) return { text: role };
  return {
    text: role.slice(1).trim(),
    icon: { modifier: modifier.name, width: classAttributeIconSize + 2, height: classAttributeIconSize + 3 },
  };
}

/** `RoleLabels.java:67`. */
const GAP = 2;
/** `RoleLabels.java:68`. */
const MIN_DISTANCE_FOR_DIRECTION = 15;
/** `RoleLabels.java:69`. */
const SEARCH_STEP = 2;
/** `RoleLabels.java:70`. */
const SEARCH_RANGE = 30;
/** `RoleLabels.java:101` — a direction shorter than this is degenerate. */
const DEGENERATE_DIRECTION = 0.001;

const dist = (a: Pt, b: Pt): number => Math.hypot(a.x - b.x, a.y - b.y);

/**
 * Computes the top-left corner of the role label: preferably the mirror of
 * the quantifier across the line, else the closest free place.
 *
 * @see RoleLabels.java#getPosition (`:93-120`)
 */
export function getPosition(boxes: RoleLabelBoxes, line: RoleLabelLine, obstacles: readonly RectangleArea[]): Pt {
  const { qDim, rDim, quantifierPos } = boxes;
  const { thisEndpoint, otherEndpoint } = line;
  const samples = line.pathSamples ?? sampleSegment(thisEndpoint, otherEndpoint);
  const towards = getPointAwayFrom(thisEndpoint, otherEndpoint, samples);
  const dirX = towards.x - thisEndpoint.x;
  const dirY = towards.y - thisEndpoint.y;
  if (Math.abs(dirX) + Math.abs(dirY) < DEGENERATE_DIRECTION) {
    return { x: quantifierPos.x, y: quantifierPos.y + qDim.height };
  }
  const dir = { x: dirX, y: dirY };
  const preferred = getMirroredPosition(boxes, thisEndpoint, dir, samples);
  const forbidden: RectangleArea[] = [
    ...obstacles,
    {
      minX: quantifierPos.x,
      minY: quantifierPos.y,
      maxX: quantifierPos.x + qDim.width,
      maxY: quantifierPos.y + qDim.height,
    },
  ];
  if (isFree(preferred, rDim, forbidden, undefined)) return preferred;
  return searchFreePosition(boxes, { endpoint: thisEndpoint, dir, samples }, forbidden) ?? preferred;
}

/** @see RoleLabels.java#getMirroredPosition (`:122-160`) */
function getMirroredPosition(boxes: RoleLabelBoxes, thisEndpoint: Pt, dir: Pt, samples: readonly Pt[]): Pt {
  const { qDim, rDim, quantifierPos } = boxes;
  if (Math.abs(dir.y) >= Math.abs(dir.x)) {
    // Mostly vertical: mirror across the line X
    const roleY = quantifierPos.y;
    const qCenterX = quantifierPos.x + qDim.width / 2;
    const lineX = thisEndpoint.x;
    const atHeight = samples.filter((pt) => pt.y >= roleY - GAP && pt.y <= roleY + rDim.height + GAP);
    if (qCenterX < lineX) {
      return { x: Math.max(lineX + GAP, ...atHeight.map((pt) => pt.x + GAP)), y: roleY };
    }
    return { x: Math.min(lineX - rDim.width - GAP, ...atHeight.map((pt) => pt.x - rDim.width - GAP)), y: roleY };
  }
  // Mostly horizontal: mirror across the line Y
  const roleX = quantifierPos.x;
  const qCenterY = quantifierPos.y + qDim.height / 2;
  const lineY = thisEndpoint.y;
  const atWidth = samples.filter((pt) => pt.x >= roleX - GAP && pt.x <= roleX + rDim.width + GAP);
  if (qCenterY < lineY) {
    return { x: roleX, y: Math.max(lineY + GAP, ...atWidth.map((pt) => pt.y + GAP)) };
  }
  return { x: roleX, y: Math.min(lineY - rDim.height - GAP, ...atWidth.map((pt) => pt.y - rDim.height - GAP)) };
}

/** What {@link searchFreePosition} slides along: the line end, its
 *  direction (not normalised) and the path samples to keep clear of. */
interface SearchLine {
  readonly endpoint: Pt;
  readonly dir: Pt;
  readonly samples: readonly Pt[];
}

/** The centre of the mirror image of the quantifier across the line, and the
 *  unit tangent of the line (`searchFreePosition`'s `idealX`/`idealY`,
 *  `tx`/`ty`). */
function idealCentre(
  boxes: RoleLabelBoxes,
  line: SearchLine,
): { idealX: number; idealY: number; tx: number; ty: number } {
  const { qDim, quantifierPos } = boxes;
  const { endpoint, dir } = line;
  const length = Math.hypot(dir.x, dir.y);
  const tx = dir.x / length;
  const ty = dir.y / length;
  const qx = quantifierPos.x + qDim.width / 2;
  const qy = quantifierPos.y + qDim.height / 2;
  const along = (qx - endpoint.x) * tx + (qy - endpoint.y) * ty;
  return { idealX: 2 * (endpoint.x + tx * along) - qx, idealY: 2 * (endpoint.y + ty * along) - qy, tx, ty };
}

/**
 * The free place closest to the mirror image of the quantifier across the
 * line, in the neighbourhood of the end of the line.
 *
 * @see RoleLabels.java#searchFreePosition (`:166-200`)
 */
function searchFreePosition(
  boxes: RoleLabelBoxes,
  line: SearchLine,
  forbidden: readonly RectangleArea[],
): Pt | undefined {
  const { rDim } = boxes;
  const { endpoint, samples } = line;
  const { idealX, idealY, tx, ty } = idealCentre(boxes, line);
  let best: Pt | undefined;
  let bestDistance = Number.MAX_VALUE;
  for (let x = endpoint.x - rDim.width - SEARCH_RANGE; x <= endpoint.x + SEARCH_RANGE; x += SEARCH_STEP) {
    for (let y = endpoint.y - rDim.height - SEARCH_RANGE; y <= endpoint.y + SEARCH_RANGE; y += SEARCH_STEP) {
      // Sliding along the line is preferred to moving away from it
      const deltaX = x + rDim.width / 2 - idealX;
      const deltaY = y + rDim.height / 2 - idealY;
      const distance = Math.abs(deltaX * tx + deltaY * ty) + 2 * Math.abs(-deltaX * ty + deltaY * tx);
      if (distance >= bestDistance) continue;
      const candidate = { x, y };
      if (isFree(candidate, rDim, forbidden, samples)) {
        best = candidate;
        bestDistance = distance;
      }
    }
  }
  return best;
}

/** The box `[x1,x2] x [y1,y2]` (a role label at `pos`) — shared by the two
 *  `isFree` tests. */
interface LabelRect {
  readonly x1: number;
  readonly y1: number;
  readonly x2: number;
  readonly y2: number;
}

const overlaps = (r: LabelRect, area: RectangleArea): boolean =>
  r.x1 < area.maxX && r.x2 > area.minX && r.y1 < area.maxY && r.y2 > area.minY;

const nearPoint = (r: LabelRect, pt: Pt): boolean =>
  pt.x >= r.x1 - GAP && pt.x <= r.x2 + GAP && pt.y >= r.y1 - GAP && pt.y <= r.y2 + GAP;

/** @see RoleLabels.java#isFree (`:202-219`) */
function isFree(pos: Pt, dim: Dim, forbidden: readonly RectangleArea[], samples: readonly Pt[] | undefined): boolean {
  const r = { x1: pos.x, y1: pos.y, x2: pos.x + dim.width, y2: pos.y + dim.height };
  if (forbidden.some((area) => overlaps(r, area))) return false;
  return samples === undefined || !samples.some((pt) => nearPoint(r, pt));
}

/**
 * The point of the line the closest to the endpoint, among the ones far
 * enough from it to give a meaningful direction.
 *
 * @see RoleLabels.java#getPointAwayFrom (`:221-235`)
 */
function getPointAwayFrom(endpoint: Pt, otherEndpoint: Pt, samples: readonly Pt[]): Pt {
  let result = otherEndpoint;
  let best = Number.MAX_VALUE;
  for (const pt of samples) {
    const distance = dist(pt, endpoint);
    if (distance >= MIN_DISTANCE_FOR_DIRECTION && distance < best) {
      best = distance;
      result = pt;
    }
  }
  return result;
}

/** @see RoleLabels.java#sampleSegment (`:237-246`) */
function sampleSegment(p1: Pt, p2: Pt): Pt[] {
  const result: Pt[] = [];
  const steps = Math.max(1, Math.ceil(dist(p1, p2) / 2));
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    result.push({ x: p1.x + (p2.x - p1.x) * t, y: p1.y + (p2.y - p1.y) * t });
  }
  return result;
}
