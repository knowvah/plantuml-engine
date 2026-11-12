/**
 * `MinMaxGolem`: the integer bounding box of golem positions.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/golem/MinMaxGolem.java
 */
import type { Position } from './Position.js';

/** `Integer.MAX_VALUE`. */
const INTEGER_MAX_VALUE = 2147483647;
/** `Integer.MIN_VALUE`. */
const INTEGER_MIN_VALUE = -2147483648;

/** @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/golem/MinMaxGolem.java:38 */
export class MinMaxGolem {
  /** @see MinMaxGolem.java:40-43 */
  private minX = INTEGER_MAX_VALUE;
  private minY = INTEGER_MAX_VALUE;
  private maxX = INTEGER_MIN_VALUE;
  private maxY = INTEGER_MIN_VALUE;

  /** @see MinMaxGolem.java:45-58 */
  manage(x: number, y: number): void {
    if (x < this.minX) this.minX = x;
    if (y < this.minY) this.minY = y;
    if (x > this.maxX) this.maxX = x;
    if (y > this.maxY) this.maxY = y;
  }

  /** `manage(Position)`. @see MinMaxGolem.java:60-63 */
  managePosition(position: Position): void {
    this.manage(position.getXmin(), position.getYmin());
    this.manage(position.getXmax(), position.getYmax());
  }

  /** @see MinMaxGolem.java:65-67 */
  getMinX(): number {
    return this.minX;
  }

  /** @see MinMaxGolem.java:69-71 */
  getMinY(): number {
    return this.minY;
  }

  /** @see MinMaxGolem.java:73-75 */
  getWidth(): number {
    return this.maxX - this.minX + 1;
  }

  /** @see MinMaxGolem.java:77-79 */
  getHeight(): number {
    return this.maxY - this.minY + 1;
  }
}
