import { BpmElement } from './BpmElement.js';
import { ConnectorPuzzleEmpty } from './ConnectorPuzzleEmpty.js';
import { Where } from './ConnectorPuzzle.js';
import type { Grid } from './Grid.js';
import type { GridCleaner } from './GridCleaner.js';
import type { Line } from './Line.js';
import type { Placeable } from './Placeable.js';

/** Java's `(ConnectorPuzzleEmpty)` cast. */
function asPuzzle(data: Placeable): ConnectorPuzzleEmpty {
  if (!(data instanceof ConnectorPuzzleEmpty)) throw new Error('ClassCastException: not a connector puzzle');
  return data;
}

/**
 * CleanerInterleavingLines — merges the first pair of adjacent lines whose
 * cells never clash, one merge per pass.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/bpm/CleanerInterleavingLines.java:41-163
 */
export class CleanerInterleavingLines implements GridCleaner {
  /** @see CleanerInterleavingLines.java:43-58 */
  clean(grid: Grid): boolean {
    let previous: Line | null = null;
    for (const line of grid.lines().toList()) {
      if (previous !== null && this.mergeableLines(grid, previous, line)) {
        this.mergeLines(grid, previous, line);
        return true;
      }
      previous = line;
    }
    return false;
  }

  /** @see CleanerInterleavingLines.java:60-69 */
  private mergeLines(grid: Grid, line1: Line, line2: Line): void {
    for (const col of grid.cols().toList()) {
      const cell1 = grid.getCell(line1, col);
      const cell2 = grid.getCell(line2, col);
      cell1.setData(this.merge(cell1.getData(), cell2.getData()));
      cell2.setData(null);
    }
    grid.removeLine(line2);
  }

  /** `mergeable(Grid, Line, Line)`. @see CleanerInterleavingLines.java:71-85 */
  private mergeableLines(grid: Grid, line1: Line, line2: Line): boolean {
    for (const col of grid.cols().toList()) {
      const cell1 = grid.getCell(line1, col).getData();
      const cell2 = grid.getCell(line2, col).getData();
      if (!this.mergeable(cell1, cell2)) return false;
    }
    return true;
  }

  /** An element wins; an `SW` puzzle over an element turns its NORTH stub WEST. @see CleanerInterleavingLines.java:87-110 */
  private merge(data1: Placeable | null, data2: Placeable | null): Placeable | null {
    if (data1 === null) return data2;
    if (data2 === null) return data1;
    if (data1 instanceof BpmElement) return data1;
    if (data2 instanceof BpmElement) {
      const puz1 = asPuzzle(data1);
      if (puz1.checkDirections('SW')) {
        data2.remove(Where.NORTH);
        data2.append(Where.WEST);
      }
      return data2;
    }
    asPuzzle(data1);
    return asPuzzle(data2);
  }

  /** `mergeable(Placeable, Placeable)`. @see CleanerInterleavingLines.java:112-131 */
  private mergeable(data1: Placeable | null, data2: Placeable | null): boolean {
    if (data1 === null || data2 === null) return true;
    if (data1 instanceof ConnectorPuzzleEmpty && data2 instanceof ConnectorPuzzleEmpty)
      return this.mergeableCC(data1, data2);
    if (data1 instanceof ConnectorPuzzleEmpty && data2 instanceof BpmElement) return this.mergeablePuzzleSingle(data1);
    if (data2 instanceof ConnectorPuzzleEmpty && data1 instanceof BpmElement) return this.mergeableSinglePuzzle(data2);
    return false;
  }

  /** `mergeablePuzzleSingle(ConnectorPuzzleEmpty, BpmElement)`. @see CleanerInterleavingLines.java:133-141 */
  private mergeablePuzzleSingle(data1: ConnectorPuzzleEmpty): boolean {
    if (data1.checkDirections('NS')) return true;
    if (data1.checkDirections('SW')) return true;
    return false;
  }

  /** `mergeablePuzzleSingle(BpmElement, ConnectorPuzzleEmpty)`, renamed (no overloads). @see CleanerInterleavingLines.java:143-148 */
  private mergeableSinglePuzzle(data2: ConnectorPuzzleEmpty): boolean {
    return data2.checkDirections('NS');
  }

  /** @see CleanerInterleavingLines.java:150-161 */
  private mergeableCC(puz1: ConnectorPuzzleEmpty, puz2: ConnectorPuzzleEmpty): boolean {
    if (puz1.checkDirections('NS') && puz2.checkDirections('NS')) return true;
    if (puz1.checkDirections('NS') && puz2.checkDirections('NE')) return true;
    if (puz1.checkDirections('NS') && puz2.checkDirections('NW')) return true;
    return false;
  }
}
