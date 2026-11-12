/**
 * `Tile`: a golem cell identity with its five `TileArea`s, built once.
 *
 * Not ported (flp D1): the `TextBlock` half — `drawU`, `calculateDimension`,
 * `SIZE`, `numberFont`, `fc`. Only `TilesField#drawU` reads it, and
 * `FlowDiagram` never calls that; flow draws `ActivityBox`es instead.
 * The port has no `hashCode`, as upstream has none: maps key a `Tile` by
 * identity (flp D4).
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/golem/Tile.java
 */
import { TileArea } from './TileArea.js';
import { TILE_GEOMETRY_VALUES } from './TileGeometry.js';
import type { TileGeometry } from './TileGeometry.js';

/** @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/golem/Tile.java:58 */
export class Tile {
  /** An `EnumMap`, one area per geometry. @see Tile.java:65 */
  private readonly geometries: ReadonlyMap<TileGeometry, TileArea>;

  /** Package-private upstream: `TilesField` numbers the tiles. @see Tile.java:67-74 */
  constructor(private readonly num: number) {
    const tmp = new Map<TileGeometry, TileArea>();
    for (const g of TILE_GEOMETRY_VALUES) tmp.set(g, new TileArea(this, g));
    this.geometries = tmp;
  }

  /** The `TilesField` sequence number (`num`), read by tests. */
  getNum(): number {
    return this.num;
  }

  /** @see Tile.java:76-78 */
  getArea(geometry: TileGeometry): TileArea {
    // The EnumMap holds every value, so `get` never misses.
    return this.geometries.get(geometry)!;
  }
}
