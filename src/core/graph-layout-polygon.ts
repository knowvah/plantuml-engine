/**
 * The vertices graphviz gives a regular-sided polygon node (`shape=octagon`/`hexagon`), which the jar reads back
 * off the node's `<polygon points=...>` (`DotStringFactory.java:411-421`, `SvekNode#setPolygon`,
 * `SvekNode.java:412-420`) and `EntityImageActivity#drawOctagon` draws (`EntityImageActivity.java:108-118`).
 * @knowvah/dot-engine's `NodeGeometry` carries only the centre and the size, so the C is ported here.
 *
 * Scope: the only nodes Svek declares with these shapes carry `label=""` and a `width`/`height`
 * (`SvekNode#appendShapeInternal`, `SvekNode.java:327-350`; `svek-N.dot`: `shape=octagon,label="",width=..,
 * height=..`), so the label dimension is 0 and `poly_init` starts from `bb = (width, height)`; orientation,
 * distortion and skew are the builtins' 0 (`p_octagon`/`p_hexagon`, `shapes.c:112-114`, one periphery); the extra
 * peripheries/outline vertices (`:2321-2370`) never move the base vertices drawn.
 */

import { svekPoint, type SvekFrame } from './graph-layout-svek-read.js';

/** A vertex in graphviz's native (y up) frame, relative to the node centre. */
export interface PolygonVertex {
  readonly x: number;
  readonly y: number;
}

/**
 * `poly_init`'s base vertices (`shapes.c:2213-2271`) scaled to the node box (`:2275-2290`), in the order
 * `poly_gencode` prints them (`:2922`; `xsize`/`ysize` are 1 for an unrotated node, `:2950-2951`).
 * @param sides the polygon's side count (`p_octagon.sides` 8, `p_hexagon.sides` 6, `shapes.c:112-114`)
 * @param width `ND_width` in points (`INCH2PS`), `shapes.c:1957`
 * @param height `ND_height` in points
 */
export function polygonVertices(sides: number, width: number, height: number): PolygonVertex[] {
  const sectorangle = (2 * Math.PI) / sides; // :2222
  const sidelength = Math.sin(sectorangle / 2); // :2223
  const skewdist = Math.hypot(0, 1); // :2224, distortion = skew = 0
  let angle = (sectorangle - Math.PI) / 2; // :2227
  let rx = 0.5 * Math.cos(angle); // :2230
  let ry = 0.5 * Math.sin(angle);
  let xmax = 0;
  let ymax = 0;
  angle += (Math.PI - sectorangle) / 2; // :2232
  const raw: PolygonVertex[] = [];
  for (let i = 0; i < sides; i++) {
    angle += sectorangle; // :2236
    rx += sidelength * Math.cos(angle);
    ry += sidelength * Math.sin(angle);
    // distort and skew: both 0 (`:2245-2247`); orient with orientation 0 (`:2250-2254`)
    const px = rx * skewdist;
    const py = ry;
    const alpha = Math.atan2(py, px);
    const len = Math.hypot(px, py);
    const x = len * Math.cos(alpha) * width; // scale for label (`:2257-2258`)
    const y = len * Math.sin(alpha) * height;
    xmax = Math.max(Math.abs(x), xmax); // :2260-2261
    ymax = Math.max(Math.abs(y), ymax);
    raw.push({ x, y });
  }
  xmax *= 2; // :2275-2276
  ymax *= 2;
  const bbx = Math.max(width, xmax); // :2277
  const bby = Math.max(height, ymax);
  const scalex = bbx / xmax; // :2280-2281
  const scaley = bby / ymax;
  return raw.map((p) => ({ x: p.x * scalex, y: p.y * scaley }));
}

/** The side counts of the shapes the jar reads through the polygon branch. @see DotStringFactory.java:411 */
const POLYGON_SIDES: ReadonlyMap<string, number> = new Map([
  ['octagon', 8], // p_octagon, shapes.c:114
  ['hexagon', 6], // p_hexagon, shapes.c:112
]);

/**
 * `SvekNode#getPolygon` for a node `DotStringFactory#solve` placed: the printed `points=` of its `<polygon>`
 * (closed by repeating the first vertex, `poly_gencode`'s `gvrender_polygon(job, AF, sides, filled)`), parsed into
 * the jar's frame (`svekPoint`) and translated by `-min` (`SvekNode.java:414-416`). `undefined` for a shape the jar
 * reads another way.
 * @see DotStringFactory.java:411-421
 */
export function svekNodePolygon(
  frame: SvekFrame,
  node: { readonly x: number; readonly y: number; readonly width: number; readonly height: number },
  shape: string | undefined,
): PolygonVertex[] | undefined {
  const sides = shape === undefined ? undefined : POLYGON_SIDES.get(shape);
  if (sides === undefined) return undefined;
  const vertices = polygonVertices(sides, node.width, node.height);
  const printed = [...vertices, vertices[0] as PolygonVertex].map((v) =>
    svekPoint(frame, { x: node.x + v.x, y: node.y + v.y }),
  );
  const minX = Math.min(...printed.map((p) => p.x));
  const minY = Math.min(...printed.map((p) => p.y));
  return printed.map((p) => ({ x: p.x - minX, y: p.y - minY }));
}
