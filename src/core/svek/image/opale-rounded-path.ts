/**
 * The rounded note outline as SVG path data, for the engines that draw a note as a `<path>` string (class, state).
 *
 * Their string builders (`Opale.ts#opalePolygonLeft` and the others, `opaleCorner`) fix `roundCorner` at 0, the value
 * `EntityImageNote.java:270-272` reads off `getSkinParam().getRoundCorner(CornerParam.DEFAULT, null)`, which is the flat
 * `skinparam roundCorner` and nothing else (`SkinParam.java:891-905`). A non-zero value draws the arcs of
 * `Opale.getPolygonNormal`/`getPolygonLeft`/…, `Opale.java:147-229`, which `OpalePolygons.ts` ports on `UPath`; this
 * module serialises those the way `SvgGraphics#svgPath` does (`M`/`L`/`A` per segment, no close).
 */
import type { UPath } from '../../klimt/shape/UPath.js';
import { USegmentType } from '../../klimt/shape/UPath.js';
import { XPoint2D } from '../../klimt/geom/XPoint2D.js';
import { Direction } from '../../abel/Direction.js';
import { arcTo, lineTo, moveTo } from '../../svg-path-builder.js';
import { OPALE_DELTA, corner, getPolygonLinked, polygonNormal } from './OpalePolygons.js';
import type { OpaleBox, OpaleConnector, OpaleDirection } from './Opale.js';
import { OPALE_CORNERSIZE } from './Opale.js';

const DIRECTIONS: Record<OpaleDirection, Direction> = {
  left: Direction.LEFT,
  right: Direction.RIGHT,
  up: Direction.UP,
  down: Direction.DOWN,
};

/** `path` at `(dx, dy)` as `d` data: `SvgGraphics#renderPathSegment`, a close segment writes nothing. */
function pathData(path: UPath, dx: number, dy: number): string {
  const parts: string[] = [];
  for (const { coord: c, segmentType } of path) {
    if (segmentType === USegmentType.SEG_MOVETO) parts.push(moveTo(c[0]! + dx, c[1]! + dy));
    else if (segmentType === USegmentType.SEG_LINETO) parts.push(lineTo(c[0]! + dx, c[1]! + dy));
    else if (segmentType === USegmentType.SEG_ARCTO)
      parts.push(arcTo(c[5]! + dx, c[6]! + dy, c[0]!, c[3]! === 0 ? 0 : 1, c[4]! === 0 ? 0 : 1));
  }
  return parts.join(' ');
}

/**
 * `Opale#drawU`'s outline at `roundCorner` (`k`: the ambient scale; `cornersize`, the corner and the notch's `delta` of
 * `OpalePolygons.ts` scale with it: the jar draws the unscaled `Opale` geometry through a scaled `UGraphic`): the notched polygon of the connector's direction when the note has one
 * (`getPolygonLinked`), else `getPolygonNormal`. @see Opale.java:108-122
 */
export function opaleRoundedOutline(
  box: OpaleBox,
  connector: { readonly direction: OpaleDirection; readonly pp: OpaleConnector } | undefined,
  roundCorner: number,
  k = 1,
): string {
  const { origin, width, height } = box;
  const cornersize = OPALE_CORNERSIZE * k;
  if (connector === undefined)
    return pathData(polygonNormal(width, height, roundCorner * k, cornersize), origin.x, origin.y);
  const bounds = { width, height, roundCorner: roundCorner * k, cornersize, delta: OPALE_DELTA * k };
  const { pp1, pp2 } = connector.pp;
  const polygon = getPolygonLinked(
    DIRECTIONS[connector.direction],
    bounds,
    new XPoint2D(pp1.x, pp1.y),
    new XPoint2D(pp2.x, pp2.y),
  );
  return pathData(polygon, origin.x, origin.y);
}

/** `Opale.getCorner(width, roundCorner)` at `origin`. @see Opale.java:147-161 */
export function opaleRoundedCorner(
  origin: { readonly x: number; readonly y: number },
  width: number,
  roundCorner: number,
  k = 1,
): string {
  return pathData(corner(width, roundCorner * k, OPALE_CORNERSIZE * k), origin.x, origin.y);
}
