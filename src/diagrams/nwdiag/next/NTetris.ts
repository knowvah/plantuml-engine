/**
 * NTetris — packs `Staged` elements into the leftmost free column run.
 * `all` is a `LinkedHashMap` (insertion order), a JS `Map`.
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/nwdiag/next/NTetris.java
 */
import { BooleanGrid } from './BooleanGrid.js';
import type { Staged } from './Staged.js';

/** Past this column `add` gives up. @see NTetris.java:61 */
const MAX_COLUMN = 100;

/** @see NTetris.java:42 */
export class NTetris<S extends Staged> {
  /** @see NTetris.java:44 */
  private readonly all = new Map<S, number>();
  /** @see NTetris.java:45 */
  private readonly grid = new BooleanGrid();

  /** @see NTetris.java:52-65 */
  add(element: S): void {
    let x = 0;
    while (true) {
      if (this.grid.isSpaceAvailable(element, x)) {
        this.all.set(element, x);
        this.grid.useSpace(element, x);
        return;
      }
      x++;
      if (x > MAX_COLUMN) throw new Error('IllegalStateException');
    }
  }

  /** `Collections.unmodifiableMap(all)`. @see NTetris.java:67-69 */
  getPositions(): ReadonlyMap<S, number> {
    return this.all;
  }

  /** @see NTetris.java:71-77 */
  getNWidth(): number {
    let max = 0;
    for (const [key, value] of this.all) max = Math.max(max, value + key.getNWidth());
    return max;
  }
}
