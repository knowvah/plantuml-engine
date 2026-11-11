/**
 * A hand replay of `BpmDiagram#createGrid`'s three moves, for grid-core
 * tests that run before `BpmDiagram` exists: a docked element gets a new
 * column after the current one, `resume`/`goto` a new line under the
 * target (BpmDiagram.java:93-146).
 */
import { BpmElement } from '../../../../src/diagrams/bpm/BpmElement.js';
import { BpmElementType } from '../../../../src/diagrams/bpm/BpmElementType.js';
import type { Cell } from '../../../../src/diagrams/bpm/Cell.js';
import { Col } from '../../../../src/diagrams/bpm/Col.js';
import { Coord } from '../../../../src/diagrams/bpm/Coord.js';
import { Grid } from '../../../../src/diagrams/bpm/Grid.js';
import { Line } from '../../../../src/diagrams/bpm/Line.js';

export type Op = { readonly add: BpmElement } | { readonly resume: string } | { readonly goto: string };

export const docked = (label: string): Op => ({ add: new BpmElement(null, BpmElementType.DOCKED_EVENT, label) });
export const merge = (id: string): Op => ({ add: new BpmElement(id, BpmElementType.MERGE) });

export function replay(ops: readonly Op[]): Grid {
  const grid = new Grid();
  let current = grid.getRoot();
  let last: Cell = grid.getCell(current);
  grid.getCell(current).setData(new BpmElement(null, BpmElementType.START));
  for (const op of ops) {
    if ('add' in op) {
      const nav = grid.colsOf(current);
      const newRow = new Col();
      nav.insertAfter(newRow);
      current = new Coord(current.getLine(), newRow);
      grid.getCell(current).setData(op.add);
      last.addConnectionTo2(grid.getCell(current).getData());
      last = grid.getCell(current);
      continue;
    }
    const target = grid.getById('resume' in op ? op.resume : op.goto);
    const src = last;
    last = grid.getCell(target);
    const newLine = new Line();
    grid.linesOf(target!).insertAfter(newLine);
    current = new Coord(newLine, target!.getCol());
    if ('goto' in op) src.addConnectionTo2(last.getData());
  }
  grid.addConnections();
  return grid;
}
