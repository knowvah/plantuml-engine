/**
 * `TilesField`: the golem grid. The root tile sits at `(0,0)-(1,1)`; each
 * new tile goes 2 units from its start in a direction, shifting the field
 * east until that spot is free, and every link is a `Path` between two
 * adjoining tile sides.
 *
 * Insertion order (flp D4): upstream's `positions` is a
 * `HashMap<Tile, Position>` and `Tile` has no `hashCode`, so the jar
 * iterates it in identity-hash order, which changes per run
 * (`cov-shift-east`: 2 layouts in 6 renders, `cov-many-shift`: 3 in 4). A JS
 * `Map` iterates in insertion order, one order a `HashMap` can produce, and
 * a `set` on an existing key keeps its slot as `HashMap#put` does.
 *
 * Not ported (flp D1): the `TextBlockMemoized` base and its `drawU`,
 * `getPoint2D`, `calculateDimensionSlow`, and the private
 * `getXmin`/`getYmin`/`getXmax`/`getYmax` only those read. `FlowDiagram`
 * reads `getPosition` and `getPaths` alone.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/golem/TilesField.java
 */
import { Path } from './Path.js';
import { Position } from './Position.js';
import { Tile } from './Tile.js';
import type { TileArea } from './TileArea.js';
import { opposite, TileGeometry } from './TileGeometry.js';

/** `getFreePosition`'s and `moveAllToEast`'s step: a tile is 2 units wide. @see TilesField.java:150,170 */
const TILE_STEP = 2;

/** `buildPath`'s and `isAdjoining`'s throw. @see TilesField.java:97,111 */
function illegalArgument(why: string): never {
  throw new Error(`IllegalArgumentException: ${why}`);
}

/** `isAdjoining`'s `EAST` case. @see TilesField.java:119-121 */
function adjoinsEast(pos1: Position, pos2: Position): boolean {
  return (
    pos1.getYmin() === pos2.getYmin() && pos1.getYmax() === pos2.getYmax() && pos1.getXmax() + 1 === pos2.getXmin()
  );
}

/** `isAdjoining`'s `WEST` case. @see TilesField.java:122-124 */
function adjoinsWest(pos1: Position, pos2: Position): boolean {
  return (
    pos1.getYmin() === pos2.getYmin() && pos1.getYmax() === pos2.getYmax() && pos1.getXmin() === pos2.getXmax() + 1
  );
}

/** `isAdjoining`'s `SOUTH` case. @see TilesField.java:125-127 */
function adjoinsSouth(pos1: Position, pos2: Position): boolean {
  return (
    pos1.getXmin() === pos2.getXmin() && pos1.getXmax() === pos2.getXmax() && pos1.getYmax() + 1 === pos2.getYmin()
  );
}

/** `isAdjoining`'s `NORTH` case. @see TilesField.java:128-130 */
function adjoinsNorth(pos1: Position, pos2: Position): boolean {
  return (
    pos1.getXmin() === pos2.getXmin() && pos1.getXmax() === pos2.getXmax() && pos1.getYmin() === pos2.getYmax() + 1
  );
}

/** `isAdjoining`'s switch on `geom1`, one helper per case (flp D10). @see TilesField.java:118-136 */
function adjoinsOn(geom1: TileGeometry, pos1: Position, pos2: Position): boolean {
  switch (geom1) {
    case TileGeometry.EAST:
      return adjoinsEast(pos1, pos2);
    case TileGeometry.WEST:
      return adjoinsWest(pos1, pos2);
    case TileGeometry.SOUTH:
      return adjoinsSouth(pos1, pos2);
    case TileGeometry.NORTH:
      return adjoinsNorth(pos1, pos2);
    case TileGeometry.CENTER:
      return false;
  }
}

/** @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/golem/TilesField.java:55 */
export class TilesField {
  /** @see TilesField.java:57 */
  private size = 1;
  /** @see TilesField.java:58 */
  private readonly root = new Tile(0);
  /** A `HashMap` upstream; insertion-ordered here (flp D4). @see TilesField.java:59 */
  private readonly positions = new Map<Tile, Position>();
  /** @see TilesField.java:60 */
  private readonly paths: Path[] = [];

  /** @see TilesField.java:62-64 */
  constructor() {
    this.positions.set(this.root, new Position(0, 0, 1, 1));
  }

  /** @see TilesField.java:66-68 */
  getRoot(): Tile {
    return this.root;
  }

  /** @see TilesField.java:70-76 */
  createTile(start: Tile, position: TileGeometry): Tile {
    const result = new Tile(this.size++);
    const p = this.getFreePosition(start, position);
    this.positions.set(result, p);
    this.paths.push(this.buildPath(start.getArea(position), result.getArea(opposite(position))));
    return result;
  }

  /** @see TilesField.java:78-80 */
  addPath(start: Tile, dest: Tile, startDirection: TileGeometry): void {
    this.paths.push(this.buildPath(start.getArea(startDirection), dest.getArea(opposite(startDirection))));
  }

  /**
   * Adjoining areas, or a same-row `WEST`→`EAST` pair at any distance
   * (`cov-link-same-row-far`); anything else throws (`cov-link-nonadjoining`).
   * @see TilesField.java:82-98
   */
  private buildPath(tileArea1: TileArea, tileArea2: TileArea): Path {
    if (this.isAdjoining(tileArea1, tileArea2)) return Path.build(tileArea1, tileArea2);

    const pos1 = this.getPosition(tileArea1.getTile());
    const pos2 = this.getPosition(tileArea2.getTile());
    const geom1 = tileArea1.getGeometry();
    const geom2 = tileArea2.getGeometry();
    if (
      pos1.getYmin() === pos2.getYmin() &&
      pos1.getYmax() === pos2.getYmax() &&
      geom1 === TileGeometry.WEST &&
      geom2 === TileGeometry.EAST
    ) {
      return Path.build(tileArea1, tileArea2);
    }
    return illegalArgument('the tiles do not adjoin');
  }

  /**
   * The same position counts as adjoining unless the geometries match
   * (`cov-link-self` draws). Upstream's `if (TeaVM.a()) assert tile1 == tile2;`
   * (java:108-109) is a no-op in the jar and is left out.
   * @see TilesField.java:100-138
   */
  private isAdjoining(tileArea1: TileArea, tileArea2: TileArea): boolean {
    const pos1 = this.getPosition(tileArea1.getTile());
    const pos2 = this.getPosition(tileArea2.getTile());
    const geom1 = tileArea1.getGeometry();
    const geom2 = tileArea2.getGeometry();
    if (pos1.equals(pos2)) {
      if (geom1 === geom2) illegalArgument('the same area twice');
      return true;
    }
    if (geom1 !== opposite(geom2)) return false;
    return adjoinsOn(geom1, pos1, pos2);
  }

  /**
   * The first tile at `p` in map order: after a `moveAllToEast` two tiles can
   * share `p`, and upstream's identity-hash order picks which one moves
   * again (flp D4). Insertion order picks the older tile.
   * @see TilesField.java:140-147
   */
  private getTileAt(p: Position): Tile | null {
    for (const [tile, position] of this.positions) {
      if (p.equals(position)) return tile;
    }
    return null;
  }

  /** @see TilesField.java:149-156 */
  private getFreePosition(start: Tile, position: TileGeometry): Position {
    const p = this.getPosition(start).move(position, TILE_STEP);
    while (this.isOccuped(p)) {
      // p = p.move(TileGeometry.EAST, 2);
      this.moveAllToEast(p);
    }
    return p;
  }

  /**
   * Collect first, then move each by re-looking its tile up by position.
   * The re-lookup is upstream's, and with it map order decides which of two
   * tiles sharing a spot moves twice (flp D4: `cov-shift-east` gave 2
   * layouts in 6 jar renders).
   * @see TilesField.java:158-173
   */
  private moveAllToEast(startingPosition: Position): void {
    const toMove: Position[] = [];
    for (const p of this.positions.values()) {
      if (p.getXmax() < startingPosition.getXmin()) continue;
      if (p.getYmax() < startingPosition.getYmin()) continue;
      toMove.push(p);
    }
    for (const p of toMove) {
      // `getTileAt(p)` cannot miss: `p` was read from `positions`, and a
      // moved tile leaves at most another tile at that spot.
      this.positions.set(this.getTileAt(p)!, p.move(TileGeometry.EAST, TILE_STEP));
    }
  }

  /** @see TilesField.java:175-182 */
  private isOccuped(test: Position): boolean {
    for (const p of this.positions.values()) {
      if (p.equals(test)) return true;
    }
    return false;
  }

  /** `Objects.requireNonNull(positions.get(tile))`. @see TilesField.java:184-187 */
  getPosition(tile: Tile): Position {
    const result = this.positions.get(tile);
    if (result === undefined) throw new Error('NullPointerException: the tile is not in this field');
    return result;
  }

  /** @see TilesField.java:233-235 */
  getPaths(): readonly Path[] {
    return this.paths;
  }
}
