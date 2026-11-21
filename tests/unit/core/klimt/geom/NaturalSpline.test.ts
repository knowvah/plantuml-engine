/**
 * `NaturalSpline.through`: exact cubic Béziers through the points, second
 * derivative 0 at both ends.
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/klimt/geom/NaturalSpline.java
 */
import { describe, expect, it } from 'vitest';
import { naturalSplineThrough } from '../../../../../src/core/klimt/geom/NaturalSpline.js';
import { XPoint2D } from '../../../../../src/core/klimt/geom/XPoint2D.js';

const pts = (...xy: number[][]): XPoint2D[] => xy.map(([x, y]) => new XPoint2D(x!, y!));

describe('naturalSplineThrough', () => {
  it('is empty below two points, or when x does not strictly increase', () => {
    expect(naturalSplineThrough(pts([0, 0]))).toEqual([]);
    expect(naturalSplineThrough(pts([0, 0], [0, 1]))).toEqual([]);
    expect(naturalSplineThrough(pts([0, 0], [2, 1], [1, 3]))).toEqual([]);
  });

  it('draws two points as the straight segment, thirds for control points', () => {
    expect(naturalSplineThrough(pts([0, 0], [3, 6]))).toEqual([
      { x1: 0, y1: 0, ctrlx1: 1, ctrly1: 2, ctrlx2: 2, ctrly2: 4, x2: 3, y2: 6 },
    ]);
  });

  it('bends through a peak and joins the intervals smoothly', () => {
    const [a, b] = naturalSplineThrough(pts([0, 0], [1, 6], [2, 0]));
    expect([a!.x2, a!.y2, b!.x1, b!.y1]).toEqual([1, 6, 1, 6]);
    // m1 = 6 * (-6 - 6) / 4 = -18; start slope 6 + 18 / 6 = 9.
    expect(a!.ctrly1).toBeCloseTo(3, 12);
    expect(a!.ctrly2).toBeCloseTo(6, 12);
    expect(b!.ctrly1).toBeCloseTo(6, 12);
  });
});
