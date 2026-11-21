/**
 * NaturalSpline — a natural cubic spline through points (second derivative 0 at
 * both ends), each interval written exactly as one cubic Bézier. The curves are
 * {@link Bezier}s, the port's plain-data `XCubicCurve2D` (see `DotPath.ts`).
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/klimt/geom/NaturalSpline.java
 */
import type { Bezier } from '../shape/DotPath.js';
import type { XPoint2D } from './XPoint2D.js';

/** The tridiagonal system's right-hand side factor. @see NaturalSpline.java:62 */
const RHS_FACTOR = 6;

/**
 * Empty when the spline cannot be built: fewer than two points, or x values that
 * do not strictly increase.
 * @see NaturalSpline.java:47-86
 */
export function naturalSplineThrough(pts: readonly XPoint2D[]): Bezier[] {
  const n = pts.length;
  if (n < 2) return [];
  const h: number[] = [];
  for (let i = 0; i < n - 1; i++) {
    h.push(pts[i + 1]!.x - pts[i]!.x);
    if (h[i]! <= 0) return [];
  }
  const m = secondDerivatives(pts, h);
  const result: Bezier[] = [];
  for (let i = 0; i < n - 1; i++) result.push(intervalCurve(pts[i]!, pts[i + 1]!, h[i]!, [m[i]!, m[i + 1]!]));
  return result;
}

/** One interval as an exact cubic Bézier. @see NaturalSpline.java:72-83 */
function intervalCurve(p0: XPoint2D, p1: XPoint2D, hi: number, [m0, m1]: readonly [number, number]): Bezier {
  const slope = (p1.y - p0.y) / hi;
  const start = slope - (hi * (2 * m0 + m1)) / RHS_FACTOR;
  const end = slope + (hi * (m0 + 2 * m1)) / RHS_FACTOR;
  return {
    x1: p0.x,
    y1: p0.y,
    ctrlx1: p0.x + hi / 3,
    ctrly1: p0.y + (start * hi) / 3,
    ctrlx2: p1.x - hi / 3,
    ctrly2: p1.y - (end * hi) / 3,
    x2: p1.x,
    y2: p1.y,
  };
}

/** `m[1..n-2]` from the tridiagonal system, by the Thomas algorithm. @see NaturalSpline.java:58-69 */
function secondDerivatives(pts: readonly XPoint2D[], h: readonly number[]): number[] {
  const n = pts.length;
  const m = new Array<number>(n).fill(0);
  const c = new Array<number>(n).fill(0);
  const d = new Array<number>(n).fill(0);
  for (let i = 1; i < n - 1; i++) {
    const b = 2 * (h[i - 1]! + h[i]!);
    const r = RHS_FACTOR * ((pts[i + 1]!.y - pts[i]!.y) / h[i]! - (pts[i]!.y - pts[i - 1]!.y) / h[i - 1]!);
    const denominator = b - h[i - 1]! * c[i - 1]!;
    c[i] = h[i]! / denominator;
    d[i] = (r - h[i - 1]! * d[i - 1]!) / denominator;
  }
  for (let i = n - 2; i >= 1; i--) m[i] = d[i]! - c[i]! * m[i + 1]!;
  return m;
}
