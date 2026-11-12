/**
 * `Path`: a link from one `TileArea` to another.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/golem/Path.java
 */
import type { TileArea } from './TileArea.js';

/** @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/golem/Path.java:41-62 */
export class Path {
  /** @see Path.java:43 */
  private readonly all: TileArea[] = [];

  /** @see Path.java:45-47 */
  static build(start: TileArea, dest: TileArea): Path {
    return new Path(start, dest);
  }

  /** @see Path.java:49-52 */
  private constructor(start: TileArea, dest: TileArea) {
    this.all.push(start);
    this.all.push(dest);
  }

  /** @see Path.java:54-56 */
  getStart(): TileArea {
    return this.all[0]!;
  }

  /** @see Path.java:58-60 */
  getDest(): TileArea {
    return this.all[this.all.length - 1]!;
  }
}
