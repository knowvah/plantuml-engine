/**
 * `shape=octagon`/`hexagon` nodes hand the jar their polygon: `DotStringFactory#solve` reads the `points=` of the
 * node's `<polygon>` and `SvekNode#setPolygon(minX, minY, points)` keeps it translated by `-min`
 * (`DotStringFactory.java:411-421`, `SvekNode.java:412-420`). `layoutGraph` publishes the same points as
 * `DotLayoutResult.nodes[].polygon`, computed by `poly_init` + `poly_gencode` (`shapes.c:1933`, `:2922`).
 * Expected values: the first activity of `activity/japasi-25-pomo480`'s oracle (`sh0007`, 1.518403in x 0.444444in):
 * `points="233.924,63.63,233.924,50.37,201.904,41,156.624,41,124.604,50.37,124.604,63.63,156.624,73,201.904,73,
 * 233.924,63.63"` minus its min (124.604, 41).
 */
import { describe, it, expect } from 'vitest';

import { layoutGraph } from '../../../src/core/graph-layout.js';
import { polygonVertices } from '../../../src/core/graph-layout-polygon.js';

const SVG_PRECISION = 1;
const OCTAGON_ORACLE: ReadonlyArray<readonly [number, number]> = [
  [109.32, 22.63],
  [109.32, 9.37],
  [77.3, 0],
  [32.02, 0],
  [0, 9.37],
  [0, 22.63],
  [32.02, 32],
  [77.3, 32],
  [109.32, 22.63],
];

describe('polygonVertices -- poly_init for a regular-sided shape with an empty label', () => {
  it('places the eight octagon vertices in the order poly_gencode prints them (native y up)', () => {
    const v = polygonVertices(8, 109.325, 32);
    expect(v).toHaveLength(8);
    const minX = Math.min(...v.map((p) => p.x));
    const maxY = Math.max(...v.map((p) => p.y));
    v.forEach((p, i) => {
      const [ox, oy] = OCTAGON_ORACLE[i] as readonly [number, number];
      expect(p.x - minX).toBeCloseTo(ox, SVG_PRECISION);
      // the jar's y runs down: the oracle's y is (maxY - native y)
      expect(maxY - p.y).toBeCloseTo(oy, SVG_PRECISION);
    });
  });
});

describe('layoutGraph -- node polygon', () => {
  it('returns the closed octagon polygon translated by -min, like SvekNode#setPolygon', () => {
    const result = layoutGraph({
      nodes: [{ id: 'sh0007', width: 109.325, height: 32, shape: 'octagon' }],
      edges: [],
    });
    const polygon = result.nodes[0]?.polygon;
    expect(polygon).toHaveLength(9);
    polygon?.forEach((p, i) => {
      const [ox, oy] = OCTAGON_ORACLE[i] as readonly [number, number];
      expect(p.x).toBeCloseTo(ox, SVG_PRECISION);
      expect(p.y).toBeCloseTo(oy, SVG_PRECISION);
    });
  });

  it('gives no polygon to a rect node', () => {
    const result = layoutGraph({ nodes: [{ id: 'a', width: 40, height: 20, shape: 'rect' }], edges: [] });
    expect(result.nodes[0]?.polygon).toBeUndefined();
  });
});
