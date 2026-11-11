/**
 * BooleanGrid — the burned cells of a Tetris packing, keyed `x + (y << 16)`.
 * `burned` is a Java `HashSet<Integer>` read only through `add`/`contains`
 * (nwp D4), so a JS `Set` matches.
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/nwdiag/next/BooleanGrid.java
 */
import type { Staged } from './Staged.js';

/** @see BooleanGrid.java:40 */
export class BooleanGrid {
  /** @see BooleanGrid.java:42 */
  private readonly burned = new Set<number>();

  /** JS `<<` is 32-bit, as Java's `int` shift is. @see BooleanGrid.java:44-46 */
  private merge(x: number, y: number): number {
    return (x + (y << 16)) | 0;
  }

  /** @see BooleanGrid.java:48-53 */
  burn(x: number, y: number): void {
    const key = this.merge(x, y);
    if (this.burned.has(key)) throw new Error('Already present');
    this.burned.add(key);
  }

  /** @see BooleanGrid.java:55-57 */
  isBurned(x: number, y: number): boolean {
    return this.burned.has(this.merge(x, y));
  }

  /** @see BooleanGrid.java:59-64 */
  burnRect(x1: number, y1: number, x2: number, y2: number): void {
    this.check(x1, y1, x2, y2);
    for (let x = x1; x <= x2; x++) for (let y = y1; y <= y2; y++) this.burn(x, y);
  }

  /** @see BooleanGrid.java:66-73 */
  isBurnRect(x1: number, y1: number, x2: number, y2: number): boolean {
    this.check(x1, y1, x2, y2);
    for (let x = x1; x <= x2; x++) for (let y = y1; y <= y2; y++) if (this.isBurned(x, y)) return true;
    return false;
  }

  /** Java's three `IllegalArgumentException`s. @see BooleanGrid.java:75-85 */
  private check(x1: number, y1: number, x2: number, y2: number): void {
    if (x1 < 0 || y1 < 0 || x2 < 0 || y2 < 0) throw new Error('IllegalArgumentException');
    if (x2 < x1) throw new Error('IllegalArgumentException');
    if (y2 < y1) throw new Error('IllegalArgumentException');
  }

  /** @see BooleanGrid.java:89-94 */
  isSpaceAvailable(element: Staged, x: number): boolean {
    if (this.isBurnRect(x, element.getStart().getNumber(), x + element.getNWidth() - 1, element.getEnd().getNumber()))
      return false;
    return true;
  }

  /** @see BooleanGrid.java:96-98 */
  useSpace(element: Staged, x: number): void {
    this.burnRect(x, element.getStart().getNumber(), x + element.getNWidth() - 1, element.getEnd().getNumber());
  }
}
