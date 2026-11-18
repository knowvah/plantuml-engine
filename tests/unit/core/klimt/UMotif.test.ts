/**
 * `UMotif` (ipe D4). The coordinates are `convertPoint`'s and were checked at
 * planning against the jar's own PNG pixels for `path ABCabc`
 * (`plans/insecure-path-egg/measurements/decode-motif.py`).
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/klimt/UMotif.java
 */
import { describe, expect, it } from 'vitest';
import { UMotif } from '../../../../src/core/klimt/UMotif.js';
import type { UGraphic } from '../../../../src/core/klimt/UGraphic.js';
import type { UShape } from '../../../../src/core/klimt/UShape.js';
import type { DotPath, Bezier } from '../../../../src/core/klimt/shape/DotPath.js';

const MOTIF = 'ABCabc';
/** `ABCabc` accumulated by `last.move` (java:62-65). */
const MOTIF_POINTS = [
  [-3, -3],
  [-5, -6],
  [-6, -9],
  [-4, -9],
  [-1, -9],
  [-4, -8],
];
/** `GraphicsPath.java:81`: `drawHorizontal(ug, 20, 20, 1)`. */
const ORIGIN = 20;
/** The jar PNG's ink for `path ABCabc`: (20,20) then these. */
const JAR_POINTS = [
  [20, 20],
  [17, 17],
  [15, 14],
  [14, 11],
  [16, 11],
  [19, 11],
  [16, 12],
];

function xy(b: Bezier): number[][] {
  return [
    [b.x1, b.y1],
    [b.ctrlx1, b.ctrly1],
    [b.ctrlx2, b.ctrly2],
    [b.x2, b.y2],
  ];
}

function recordingUg(): { ug: UGraphic; drawn: UShape[] } {
  const drawn: UShape[] = [];
  const ug = { draw: (shape: UShape) => drawn.push(shape) } as unknown as UGraphic;
  return { ug, drawn };
}

describe('UMotif(String)', () => {
  it('accumulates convertPoint steps from (0, 0)', () => {
    expect(new UMotif(MOTIF).getPoints().map((p) => [p.getX(), p.getY()])).toEqual(MOTIF_POINTS);
  });

  it('reports the distance from the first point to the last as its length', () => {
    expect(new UMotif(MOTIF).getLength()).toBeCloseTo(Math.hypot(-1, -5), 12);
  });
});

describe('UMotif.fromInts', () => {
  it('reads (x, y) pairs as absolute points', () => {
    const motif = UMotif.fromInts(1, 2, 3, 4);
    expect(motif.getPoints().map((p) => [p.getX(), p.getY()])).toEqual([
      [1, 2],
      [3, 4],
    ]);
  });
});

describe('UMotif.convertFromChar', () => {
  it.each([
    ['A', 0],
    ['Z', 25],
    ['a', 26],
    ['w', 48],
  ])('maps %s to %i', (c, v) => {
    expect(UMotif.convertFromChar(c)).toBe(v);
  });

  it.each(['x', '0', '-'])('throws IllegalArgumentException for %s', (c) => {
    expect(() => UMotif.convertFromChar(c)).toThrow(expect.objectContaining({ name: 'IllegalArgumentException' }));
  });

  it('throws from the constructor on a character outside A-Z/a-w', () => {
    expect(() => new UMotif('abc123')).toThrow('IllegalArgumentException');
  });
});

describe('UMotif.convertPoint', () => {
  it('centres the 7-wide grid on (0, 0)', () => {
    expect(UMotif.convertPoint('A')).toMatchObject({ x: -3, y: -3 });
    expect(UMotif.convertPoint('w')).toMatchObject({ x: 3, y: 3 });
  });
});

describe('UMotif#drawHorizontal', () => {
  it("builds degenerate cubics through the jar PNG's points", () => {
    const path = new UMotif(MOTIF).drawHorizontal(ORIGIN, ORIGIN, 1);
    const beziers = path.getBeziers();
    expect(beziers.map((b) => [b.x1, b.y1])).toEqual(JAR_POINTS.slice(0, -1));
    expect(beziers.map((b) => [b.x2, b.y2])).toEqual(JAR_POINTS.slice(1));
    for (const b of beziers) {
      expect(xy(b)).toEqual([
        [b.x1, b.y1],
        [b.x1, b.y1],
        [b.x2, b.y2],
        [b.x2, b.y2],
      ]);
    }
  });

  it("starts the second repetition at the first one's end point", () => {
    const path = new UMotif(MOTIF).drawHorizontal(ORIGIN, ORIGIN, 2);
    const beziers = path.getBeziers();
    expect(beziers).toHaveLength(12);
    expect([beziers[6]!.x1, beziers[6]!.y1]).toEqual([16, 12]);
    expect(path.getEndPoint()).toEqual({ x: 12, y: 4 });
  });

  it('draws the built path on the UGraphic', () => {
    const { ug, drawn } = recordingUg();
    new UMotif(MOTIF).drawHorizontal(ug, ORIGIN, ORIGIN, 1);
    expect(drawn).toHaveLength(1);
    expect((drawn[0] as DotPath).getBeziers().map((b) => [b.x2, b.y2])).toEqual(JAR_POINTS.slice(1));
  });

  it('builds an empty path for zero repetitions', () => {
    expect(new UMotif(MOTIF).drawHorizontal(0, 0, 0).getBeziers()).toEqual([]);
  });
});

describe('UMotif#drawVertical', () => {
  it('swaps x and y', () => {
    const path = new UMotif(MOTIF).drawVertical(ORIGIN, ORIGIN, 2);
    const beziers = path.getBeziers();
    expect(beziers.map((b) => [b.x2, b.y2]).slice(0, 6)).toEqual(JAR_POINTS.slice(1).map(([x, y]) => [y, x]));
    expect([beziers[6]!.x1, beziers[6]!.y1]).toEqual([12, 16]);
    expect(beziers[0]!).toMatchObject({ ctrlx1: 20, ctrly1: 20, ctrlx2: 17, ctrly2: 17 });
  });

  it('draws the built path on the UGraphic', () => {
    const { ug, drawn } = recordingUg();
    new UMotif(MOTIF).drawVertical(ug, ORIGIN, ORIGIN, 1);
    expect((drawn[0] as DotPath).getEndPoint()).toEqual({ x: 12, y: 16 });
  });
});

describe('UMotif#getRectangle', () => {
  it('runs floor(w / L) horizontal then floor(h / L) vertical repetitions', () => {
    const motif = UMotif.fromInts(0, 0, 2, 0);
    // L = 2; 5 / 2 -> 2 horizontal, 7 / 2 -> 3 vertical, each one segment from (0,0) plus one to (2,0).
    const rectangle = motif.getRectangle(5, 7);
    expect(rectangle.getBeziers()).toHaveLength(2 * 2 + 3 * 2);
    expect(rectangle.getEndPoint()).toEqual({ x: 4, y: 6 });
  });
});
