/**
 * `Position`: an immutable golem rectangle `(xmin,ymin)-(xmax,ymax)` in
 * half-cell units; every tile is 2 wide.
 *
 * Not ported (flp D1): `hashCode` and `toString`. The port keys its maps by
 * `Tile` identity, so nothing reads either.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/golem/Position.java
 */
import { TileGeometry } from './TileGeometry.js';

/** @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/golem/Position.java:38 */
export class Position {
  /** @see Position.java:45-50 */
  constructor(
    private readonly xmin: number,
    private readonly ymin: number,
    private readonly xmax: number,
    private readonly ymax: number,
  ) {}

  /** By value. @see Position.java:52-56 */
  equals(other: Position): boolean {
    return this.xmin === other.xmin && this.xmax === other.xmax && this.ymin === other.ymin && this.ymax === other.ymax;
  }

  /** @see Position.java:68-84 */
  move(position: TileGeometry | null, sizeMove: number): Position {
    if (position === null || position === TileGeometry.CENTER) {
      throw new Error('IllegalArgumentException: Position.move needs a side');
    }
    switch (position) {
      case TileGeometry.NORTH:
        return new Position(this.xmin, this.ymin - sizeMove, this.xmax, this.ymax - sizeMove);
      case TileGeometry.SOUTH:
        return new Position(this.xmin, this.ymin + sizeMove, this.xmax, this.ymax + sizeMove);
      case TileGeometry.WEST:
        return new Position(this.xmin - sizeMove, this.ymin, this.xmax - sizeMove, this.ymax);
      case TileGeometry.EAST:
        return new Position(this.xmin + sizeMove, this.ymin, this.xmax + sizeMove, this.ymax);
    }
  }

  /** @see Position.java:86-88 */
  getXmin(): number {
    return this.xmin;
  }

  /** @see Position.java:90-92 */
  getXmax(): number {
    return this.xmax;
  }

  /** @see Position.java:94-96 */
  getYmin(): number {
    return this.ymin;
  }

  /** @see Position.java:98-100 */
  getYmax(): number {
    return this.ymax;
  }

  /**
   * The parity guard is kept though no command reaches it: every tile is 2
   * wide and moves by 2 (flp D5).
   * @see Position.java:102-107
   */
  getCenterX(): number {
    if ((this.xmin + this.xmax + 1) % 2 !== 0) throw new Error('IllegalStateException: odd Position width');
    return (this.xmin + this.xmax + 1) / 2;
  }

  /** @see Position.java:109-114 */
  getCenterY(): number {
    if ((this.ymin + this.ymax + 1) % 2 !== 0) throw new Error('IllegalStateException: odd Position height');
    return (this.ymin + this.ymax + 1) / 2;
  }
}
