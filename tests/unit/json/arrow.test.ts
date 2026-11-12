import { describe, expect, it } from 'vitest';
import { renderDrawableToFragment } from '../../../src/core/klimt/document-shell-fragment.js';
import { HColors } from '../../../src/core/klimt/color/HColors.js';
import { XPoint2D } from '../../../src/core/klimt/geom/XPoint2D.js';
import { DeterministicMeasurer } from '../../../src/core/measurer-deterministic.js';
import { Arrow } from '../../../src/diagrams/json/Arrow.js';
import { back } from '../../../src/diagrams/git/git-klimt.js';

/** The path `Arrow#drawArrow` draws from `p1` to `p2`, filled black. */
function arrowPath(p1: XPoint2D, p2: XPoint2D): string {
  const drawable = {
    drawU: (ug: Parameters<Arrow['drawArrow']>[0]) => new Arrow(p1, p2).drawArrow(ug.apply(back(HColors.BLACK))),
  };
  return renderDrawableToFragment(drawable, { uid: 'a', width: 0, height: 0, measurer: new DeterministicMeasurer() })
    .body;
}

describe('Arrow (jsondiagram/Arrow.java:43-87)', () => {
  it('draws juzane-95 edge 1: base half-width .4, notch .3 of the length (java:61-66)', () => {
    expect(arrowPath(new XPoint2D(69.5, 75.575), new XPoint2D(69.5, 82.952))).toBe(
      '<path d="M66.549,75.575 L69.5,77.788 L72.451,75.575 L69.5,82.952 L66.549,75.575" style="stroke:none;" fill="#000"/>',
    );
  });

  it('measures alpha from the y axis: atan2(dx, dy), sin on x, cos on y (java:59, 80-84)', () => {
    // juzane-95 edge 2: last point (120.392,130.857), tip (126.344,134.934). Fed the oracle's 3-dp points, the
    // notch lands at 122.178 where the jar, from unrounded engine points, prints 122.177.
    expect(arrowPath(new XPoint2D(120.392, 130.857), new XPoint2D(126.344, 134.934))).toBe(
      '<path d="M118.761,133.238 L122.178,132.08 L122.023,128.476 L126.344,134.934 L118.761,133.238" style="stroke:none;" fill="#000"/>',
    );
  });
});
