/**
 * `golem`: the values come from jar renders — `bemixo-79-xulu250`'s cached
 * oracle and the planning probes (`plans/flow-engine-port/probes/`).
 * A box centre is `(xmin + 1) * 100, (ymin + 1) * 35` when `minX = minY = 0`
 * (`FlowDiagram#drawU`, `SINGLE_SIZE_X/Y`), so each expected position below
 * is read off the oracle's `rect` centre.
 */
import { describe, expect, it } from 'vitest';
import { MinMaxGolem } from '../../../src/core/golem/MinMaxGolem.js';
import { Position } from '../../../src/core/golem/Position.js';
import type { Tile } from '../../../src/core/golem/Tile.js';
import { fromString, opposite, TileGeometry } from '../../../src/core/golem/TileGeometry.js';
import { TilesField } from '../../../src/core/golem/TilesField.js';

const { NORTH, SOUTH, EAST, WEST, CENTER } = TileGeometry;

/** `[xmin, ymin, xmax, ymax]` of a tile. */
function box(field: TilesField, tile: Tile): readonly number[] {
  const p = field.getPosition(tile);
  return [p.getXmin(), p.getYmin(), p.getXmax(), p.getYmax()];
}

describe('TileGeometry', () => {
  it('opposite pairs the four sides and throws on CENTER', () => {
    expect([NORTH, SOUTH, EAST, WEST].map(opposite)).toEqual([SOUTH, NORTH, WEST, EAST]);
    expect(() => opposite(CENTER)).toThrow('UnsupportedOperationException');
  });

  it('fromString reads the first character upper-cased (cov-upper-orientation)', () => {
    expect(['n', 'S', 'east', 'w'].map(fromString)).toEqual([NORTH, SOUTH, EAST, WEST]);
    expect(() => fromString('x')).toThrow('IllegalArgumentException');
  });
});

describe('Position', () => {
  it('moves by value and keeps the parity guard on centres', () => {
    const p = new Position(0, 0, 1, 1);
    expect(p.move(SOUTH, 2).equals(new Position(0, 2, 1, 3))).toBe(true);
    expect(p.move(NORTH, 2).equals(new Position(0, -2, 1, -1))).toBe(true);
    expect(p.move(WEST, 2).equals(new Position(-2, 0, -1, 1))).toBe(true);
    expect([p.move(EAST, 2).getCenterX(), p.getCenterY()]).toEqual([3, 1]);
    expect(() => p.move(CENTER, 2)).toThrow('IllegalArgumentException');
    expect(() => p.move(null, 2)).toThrow('IllegalArgumentException');
    expect(() => new Position(0, 0, 2, 2).getCenterX()).toThrow('IllegalStateException');
    expect(() => new Position(0, 0, 2, 2).getCenterY()).toThrow('IllegalStateException');
  });
});

describe('MinMaxGolem', () => {
  it('spans the managed positions, inclusive', () => {
    const mm = new MinMaxGolem();
    mm.managePosition(new Position(0, 0, 1, 1));
    mm.managePosition(new Position(-2, 2, -1, 3));
    expect([mm.getMinX(), mm.getMinY(), mm.getWidth(), mm.getHeight()]).toEqual([-2, 0, 4, 4]);
  });
});

describe('TilesField', () => {
  it('replays bemixo-79-xulu250 to the oracle box centres', () => {
    const field = new TilesField();
    const start = field.getRoot();
    const chain = [start];
    for (let k = 0; k < 5; k++) chain.push(field.createTile(chain[chain.length - 1]!, SOUTH));
    const dynamic = field.createTile(chain[5]!, EAST);
    const findData = field.createTile(dynamic, EAST);
    const buffer = field.createTile(findData, NORTH);
    // `w 50`: a same-row WEST->EAST pair, 2 cells apart (buildPath java:92-95).
    field.addPath(buffer, chain[4]!, WEST);
    expect(chain.map((t) => box(field, t))).toEqual([
      [0, 0, 1, 1],
      [0, 2, 1, 3],
      [0, 4, 1, 5],
      [0, 6, 1, 7],
      [0, 8, 1, 9],
      [0, 10, 1, 11],
    ]);
    expect([dynamic, findData, buffer].map((t) => box(field, t))).toEqual([
      [2, 10, 3, 11],
      [4, 10, 5, 11],
      [4, 8, 5, 9],
    ]);
    expect(field.getPaths().map((p) => [p.getStart().getGeometry(), p.getDest().getGeometry()])).toEqual([
      ...Array.from({ length: 5 }, () => [SOUTH, NORTH]),
      [EAST, WEST],
      [EAST, WEST],
      [NORTH, SOUTH],
      [WEST, EAST],
    ]);
    expect(buffer.getNum()).toBe(8);
  });

  /**
   * cov-shift-east (`10 "A"`, `e 20 "B"`, `w 30 "C"`): `C` lands on `A`, so
   * `moveAllToEast` moves A and B; A then shares B's old spot and map order
   * picks which tile moves again. The jar gave 2 layouts in 6 renders (flp
   * D4); insertion order moves A twice, the layout of planning's
   * `/tmp/flp-plan/variants/run1/cov-shift-east.svg` (A x=485.319, B
   * x=285.319, C x=84.925).
   */
  it('shifts east in insertion order (flp D4, cov-shift-east)', () => {
    const field = new TilesField();
    const a = field.getRoot();
    const b = field.createTile(a, EAST);
    const c = field.createTile(b, WEST);
    expect([a, b, c].map((t) => box(field, t))).toEqual([
      [4, 0, 5, 1],
      [2, 0, 3, 1],
      [0, 0, 1, 1],
    ]);
  });

  it('throws on a non-adjoining pair; the same position adjoins', () => {
    const field = new TilesField();
    const a = field.getRoot();
    const b = field.createTile(a, SOUTH);
    const c = field.createTile(b, SOUTH);
    expect(() => field.addPath(c, a, SOUTH)).toThrow('IllegalArgumentException');
    expect(() => field.addPath(a, c, EAST)).toThrow('IllegalArgumentException');
    // Same position, opposite areas: adjoining (cov-link-self draws).
    field.addPath(b, b, SOUTH);
    expect(field.getPaths()).toHaveLength(3);
    // `isAdjoining`'s same-area throw (java:110-112) has no public route:
    // `addPath` and `createTile` always pair a side with its opposite.
    expect(() => field.addPath(b, c, NORTH)).toThrow('IllegalArgumentException');
  });

  it('getPosition throws on a tile of another field', () => {
    const other = new TilesField().getRoot();
    expect(() => new TilesField().getPosition(other)).toThrow('NullPointerException');
  });
});
