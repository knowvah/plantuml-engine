/**
 * `TileArea`: one side (or the centre) of a tile, the end of a `Path`.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/golem/TileArea.java
 */
import type { Tile } from './Tile.js';
import type { TileGeometry } from './TileGeometry.js';

/** @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/golem/TileArea.java:38-55 */
export class TileArea {
  /** Package-private upstream: only `Tile`'s constructor builds one. @see TileArea.java:43-46 */
  constructor(
    private readonly tile: Tile,
    private readonly position: TileGeometry,
  ) {}

  /** @see TileArea.java:48-50 */
  getTile(): Tile {
    return this.tile;
  }

  /** @see TileArea.java:52-54 */
  getGeometry(): TileGeometry {
    return this.position;
  }
}
