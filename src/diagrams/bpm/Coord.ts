import type { Col } from './Col.js';
import type { Line } from './Line.js';

/**
 * Coord — a (line, column) pair of the BPM grid. `equals` is reference
 * equality on both halves. `hashCode` (java:63-66, identity hashes) is not
 * ported: `Grid` keys its cells by a per-grid identity key instead (D4).
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/bpm/Coord.java:40-74
 */
export class Coord {
  /** @see Coord.java:42 */
  private readonly line: Line;
  /** @see Coord.java:43 */
  private readonly col: Col;

  /** `Objects.requireNonNull` on both. @see Coord.java:45-48 */
  constructor(line: Line | undefined, row: Col | undefined) {
    if (line === undefined || row === undefined) throw new Error('NullPointerException: Coord needs a line and a col');
    this.line = line;
    this.col = row;
  }

  /** @see Coord.java:50-52 */
  getCol(): Col {
    return this.col;
  }

  /** @see Coord.java:59-61 */
  getLine(): Line {
    return this.line;
  }

  /** @see Coord.java:68-72 */
  equals(other: Coord): boolean {
    return this.line === other.line && this.col === other.col;
  }
}
