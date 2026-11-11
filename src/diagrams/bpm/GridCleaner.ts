import type { Grid } from './Grid.js';

/**
 * GridCleaner — one simplification pass over the grid; `true` when it
 * changed something.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/bpm/GridCleaner.java:38-42
 */
export interface GridCleaner {
  /** @see GridCleaner.java:40 */
  clean(grid: Grid): boolean;
}
