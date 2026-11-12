import { BpmElement } from './BpmElement.js';
import type { Placeable } from './Placeable.js';

/**
 * Cell — one grid cell: what it holds, and the elements it connects to in
 * event order.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/bpm/Cell.java:42-75
 */
export class Cell {
  /** @see Cell.java:44 */
  private data: Placeable | null = null;
  /** @see Cell.java:45 */
  private readonly destinations: Placeable[] = [];

  /** @see Cell.java:47-49 */
  getData(): Placeable | null {
    return this.data;
  }

  /** @see Cell.java:51-53 */
  setData(data: Placeable | null): void {
    this.data = data;
  }

  /** Throws for a non-element, "should be an assert" upstream (D8). @see Cell.java:63-69 */
  addConnectionTo2(other: Placeable | null): void {
    if (!(other instanceof BpmElement)) throw new Error('IllegalArgumentException: a cell connects only to an element');
    this.destinations.push(other);
  }

  /** @see Cell.java:71-73 */
  getDestinations2(): readonly Placeable[] {
    return this.destinations;
  }
}
