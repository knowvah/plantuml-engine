import type { Grid } from './Grid.js';
import type { GridCleaner } from './GridCleaner.js';

/**
 * CleanerEmptyLine — removes every line no cell of which holds data.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/bpm/CleanerEmptyLine.java:38-52
 */
export class CleanerEmptyLine implements GridCleaner {
  /** @see CleanerEmptyLine.java:40-50 */
  clean(grid: Grid): boolean {
    let result = false;
    for (const line of grid.lines().toList()) {
      if (grid.usedColsOf(line).size === 0) {
        grid.removeLine(line);
        result = true;
      }
    }
    return result;
  }
}
