import { ConnectorPuzzleEmpty } from './ConnectorPuzzleEmpty.js';
import type { Grid } from './Grid.js';
import type { GridCleaner } from './GridCleaner.js';
import type { Col } from './Col.js';
import type { Line } from './Line.js';

/**
 * CleanerMoveBlock — looks for two `NS` puzzles on one line with a gap
 * between them and calls an empty `tryBridge`, so it never changes a cell
 * and always reports `false`. It is ported (D1) because its cursor runs
 * past the last column: `ChainImpl#ensure` pads the column chain with a
 * `null`, which `toList` hides but later list positions see.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/bpm/CleanerMoveBlock.java:38-93
 */
export class CleanerMoveBlock implements GridCleaner {
  /** @see CleanerMoveBlock.java:40-46 */
  clean(grid: Grid): boolean {
    for (const line of grid.lines().toList()) this.tryGrid(grid, line);
    return false;
  }

  /** @see CleanerMoveBlock.java:48-88 */
  private tryGrid(grid: Grid, line: Line): void {
    for (const col1 of grid.cols().toList()) {
      const cell1 = grid.getCell(line, col1).getData();
      if (!(cell1 instanceof ConnectorPuzzleEmpty)) continue;
      if (!cell1.checkDirections('NS')) continue;
      this.scanRight(grid, line, col1);
    }
  }

  /** The `while (true)` walk from `col1` (D11 split). @see CleanerMoveBlock.java:59-85 */
  private scanRight(grid: Grid, line: Line, col1: Col): void {
    const it2 = grid.cols().navigator(col1);
    let cpt = 0;
    while (true) {
      const col2 = it2.next();
      cpt++;
      if (col2 === null) break;
      if (col1 === col2) continue;
      const cell2 = grid.getCell(line, col2).getData();
      if (cell2 === null) continue;
      if (!(cell2 instanceof ConnectorPuzzleEmpty)) break;
      if (!cell2.checkDirections('NS')) continue;
      if (cpt > 1) this.tryBridge();
      break;
    }
  }

  /** Empty upstream: `(Line line, Col col1, Col col2)` are unread. @see CleanerMoveBlock.java:90-92 */
  private tryBridge(): void {
    // Intentionally empty, as upstream's body (a commented-out trace) is.
  }
}
