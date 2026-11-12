import { describe, expect, it } from 'vitest';
import { renderDrawableToFragment } from '../../../src/core/klimt/document-shell-fragment.js';
import { DeterministicMeasurer } from '../../../src/core/measurer-deterministic.js';
import { BpmElement } from '../../../src/diagrams/bpm/BpmElement.js';
import { BpmElementType } from '../../../src/diagrams/bpm/BpmElementType.js';
import { Cell } from '../../../src/diagrams/bpm/Cell.js';
import { ChainImpl } from '../../../src/diagrams/bpm/ChainImpl.js';
import { CleanerEmptyLine } from '../../../src/diagrams/bpm/CleanerEmptyLine.js';
import { CleanerInterleavingLines } from '../../../src/diagrams/bpm/CleanerInterleavingLines.js';
import { CleanerMoveBlock } from '../../../src/diagrams/bpm/CleanerMoveBlock.js';
import { Col } from '../../../src/diagrams/bpm/Col.js';
import { getCoding, toShortString, Where } from '../../../src/diagrams/bpm/ConnectorPuzzle.js';
import { ConnectorPuzzleEmpty } from '../../../src/diagrams/bpm/ConnectorPuzzleEmpty.js';
import { Coord } from '../../../src/diagrams/bpm/Coord.js';
import type { Grid } from '../../../src/diagrams/bpm/Grid.js';
import { Line } from '../../../src/diagrams/bpm/Line.js';
import { Navigators } from '../../../src/diagrams/bpm/Navigators.js';
import { SkinParamFresh } from '../../../src/core/skin/SkinParamFresh.js';
import { stringBounderOf } from './helpers/string-bounder.js';
import { docked, merge, replay } from './helpers/grid-replay.js';

class Item {
  constructor(readonly name: string) {}
}

/** `BpmDiagram#cleanGrid`: loop until no cleaner changes the grid. */
function clean(grid: Grid): void {
  for (;;) {
    const v1 = new CleanerEmptyLine().clean(grid);
    const v2 = new CleanerInterleavingLines().clean(grid);
    const v3 = new CleanerMoveBlock().clean(grid);
    if (!v1 && !v2 && !v3) return;
  }
}

/** Each cell's content, line by line: `.` empty, the puzzle directions, or the element. */
function picture(grid: Grid): string[] {
  return grid
    .lines()
    .toList()
    .map((line) =>
      grid
        .cols()
        .toList()
        .map((col) => {
          const data = grid.getCell(line, col).getData();
          if (data === null) return '.';
          return data.toString();
        })
        .join(' '),
    );
}

describe('ChainImpl (ChainImpl.java)', () => {
  const a = new Item('a');
  const b = new Item('b');
  const c = new Item('c');

  it('inserts after, before, and keeps compare consistent with toList', () => {
    const chain = new ChainImpl(a);
    chain.navigator(a).insertAfter(b);
    expect(chain.toList()).toEqual([a, b]);
    const nav = chain.navigator(a);
    expect(nav.previous()).toBeNull();
    nav.insertBefore(c);
    // previous() moved to -1; insertBefore(-1) adds at negative[0], so c leads.
    expect(chain.toList()).toEqual([c, a, b]);
    expect(chain.compare(c, a)).toBe(-1);
    expect(chain.compare(b, a)).toBe(1);
    expect(chain.compare(a, a)).toBe(0);
    expect(() => chain.compare(new Item('x'), new Item('y'))).toThrow('UnsupportedOperationException');
  });

  it('pads with null past the end, and insertAfter on the last element keeps the pad last', () => {
    const chain = new ChainImpl(a);
    const nav = chain.navigator(a);
    expect(nav.next()).toBeNull();
    expect(chain.toList()).toEqual([a]);
    chain.navigator(a).insertAfter(b);
    expect(chain.toList()).toEqual([a, b]);
    expect(chain.navigator(b).next()).toBeNull();
  });

  it('negatives come first, the far end leading; insertAfter at -1 lands at positive 0', () => {
    const chain = new ChainImpl(a);
    const nav = chain.navigator(a);
    nav.previous();
    nav.insertBefore(b);
    const navB = chain.navigator(b);
    navB.insertBefore(c);
    expect(chain.toList()).toEqual([b, c, a]);
    const d = new Item('d');
    chain.navigator(c).insertAfter(d);
    // c sits at -1 (negative[0]); insertAfter adds at position 0, positive[0].
    expect(chain.toList()).toEqual([b, c, d, a]);
    expect(chain.contains(d)).toBe(true);
  });

  it('throws ConcurrentModificationException on a stale navigator, and on unknown or null data', () => {
    const chain = new ChainImpl(a);
    const stale = chain.navigator(a);
    chain.navigator(a).insertAfter(b);
    expect(() => stale.next()).toThrow('ConcurrentModificationException');
    expect(() => stale.get()).toThrow('ConcurrentModificationException');
    expect(() => chain.navigator(c)).toThrow('IllegalArgumentException');
    expect(() => chain.contains(null as never)).toThrow('NullPointerException');
    expect(chain.contains(c)).toBe(false);
  });

  it('set replaces in place; remove takes the first match from positive then negative', () => {
    const chain = new ChainImpl(a);
    chain.navigator(a).insertAfter(b);
    chain.navigator(b).set(c);
    expect(chain.toList()).toEqual([a, c]);
    const nav = chain.navigator(a);
    nav.previous();
    nav.insertBefore(b);
    expect(chain.remove(b)).toBe(true);
    expect(chain.remove(b)).toBe(false);
    expect(chain.toList()).toEqual([a, c]);
  });
});

describe('Navigators (Navigators.java)', () => {
  it('iterates backward when the target comes first, and a reversed navigator cannot insert', () => {
    const a = new Item('a');
    const b = new Item('b');
    const chain = new ChainImpl(a);
    chain.navigator(a).insertAfter(b);
    const back = Navigators.iterate(chain, b, a);
    expect(back.get()).toBe(b);
    expect(back.next()).toBe(a);
    expect(back.previous()).toBe(b);
    back.set(b);
    expect(() => back.insertAfter(a)).toThrow('UnsupportedOperationException');
    expect(() => back.insertBefore(a)).toThrow('UnsupportedOperationException');
    expect(Navigators.iterate(chain, a, b).next()).toBe(b);
  });
});

describe('Coord, Cell, Where, ConnectorPuzzleEmpty', () => {
  it('Coord requires both halves and compares by reference', () => {
    const line = new Line();
    const col = new Col();
    expect(new Coord(line, col).equals(new Coord(line, col))).toBe(true);
    expect(new Coord(line, col).equals(new Coord(line, new Col()))).toBe(false);
    expect(() => new Coord(undefined, col)).toThrow('NullPointerException');
  });

  it('Cell connects only to elements', () => {
    const cell = new Cell();
    expect(() => cell.addConnectionTo2(new ConnectorPuzzleEmpty())).toThrow('IllegalArgumentException');
    const element = new BpmElement('x', BpmElementType.MERGE);
    cell.addConnectionTo2(element);
    expect(cell.getDestinations2()).toEqual([element]);
  });

  it('Where codes and initials', () => {
    expect([Where.NORTH, Where.EAST, Where.SOUTH, Where.WEST].map(getCoding)).toEqual([1, 2, 4, 8]);
    expect(toShortString(Where.SOUTH)).toBe('S');
  });

  it('a puzzle parses initials, prints its EnumSet, and draws blue stubs in a 20x20 cell', () => {
    const puzzle = ConnectorPuzzleEmpty.get('SWN');
    expect(puzzle.toString()).toBe('[NORTH, SOUTH, WEST]');
    expect(new ConnectorPuzzleEmpty().toString()).toBe('NONE');
    expect(puzzle.checkDirections('NSW')).toBe(true);
    expect(puzzle.checkDirections('NS')).toBe(false);
    expect(() => puzzle.getId()).toThrow('UnsupportedOperationException');
    expect(() => puzzle.remove(Where.EAST)).toThrow('IllegalArgumentException');
    const all = ConnectorPuzzleEmpty.get('NESW');
    const svg = renderDrawableToFragment(all, {
      uid: 'p',
      width: 0,
      height: 0,
      measurer: new DeterministicMeasurer(),
    }).body;
    expect(svg).toBe(
      '<line x1="10" y1="0" x2="10" y2="10" style="stroke:#00F;stroke-width:1;"/>' +
        '<line x1="10" y1="10" x2="20" y2="10" style="stroke:#00F;stroke-width:1;"/>' +
        '<line x1="10" y1="10" x2="10" y2="20" style="stroke:#00F;stroke-width:1;"/>' +
        '<line x1="0" y1="10" x2="10" y2="10" style="stroke:#00F;stroke-width:1;"/>',
    );
  });
});

describe('Grid replays (zaxuce-77, rikosu-08 oracles)', () => {
  it('zaxuce-77: 2 lines x 6 cols, an EW puzzle over the resumed column and an NE corner under it', () => {
    const grid = replay([
      docked('login'),
      merge('20'),
      docked('show new message1'),
      merge('30'),
      { resume: '20' },
      docked('show new task2'),
    ]);
    clean(grid);
    expect(picture(grid)).toEqual([
      'START(NULL) DOCKED_EVENT([login]) MERGE(20) [EAST, WEST] DOCKED_EVENT([show new message1]) MERGE(30)',
      '. . [NORTH, EAST] DOCKED_EVENT([show new task2]) . .',
    ]);
  });

  it('getById returns the earliest-inserted duplicate (D4), and undefined on a miss', () => {
    const grid = replay([merge('m'), merge('m')]);
    const first = grid.getById('m');
    expect(first).toBeDefined();
    expect(grid.getCell(first).getData()).toBe(
      grid.getCell(grid.lines().toList()[0], grid.cols().toList()[1]).getData(),
    );
    expect(grid.getById('nope')).toBeUndefined();
    expect(() => grid.getCell(undefined)).toThrow('NullPointerException');
  });

  it('a route across an element throws the ClassCastException (cov-goto-back)', () => {
    expect(() => replay([merge('a'), docked('x'), merge('b'), { goto: 'a' }])).toThrow('ClassCastException');
  });

  it('a goto to the cell itself throws IllegalStateException', () => {
    expect(() => replay([merge('a'), { goto: 'a' }])).toThrow('IllegalStateException');
  });

  it('CleanerMoveBlock reports false and pads the column chain past its end', () => {
    const grid = replay([
      docked('login'),
      merge('20'),
      docked('one'),
      docked('two'),
      { resume: '20' },
      docked('three'),
      { goto: '20' },
    ]);
    const cols = grid.cols().toList();
    expect(new CleanerMoveBlock().clean(grid)).toBe(false);
    expect(grid.cols().toList()).toEqual(cols);
    expect(
      grid
        .cols()
        .navigator(cols[cols.length - 1]!)
        .next(),
    ).toBeNull();
  });

  it('removeLine refuses a line with data and an unknown line; getCell refuses foreign coordinates', () => {
    const grid = replay([docked('a')]);
    expect(() => grid.removeLine(grid.getRoot().getLine())).toThrow('IllegalStateException');
    expect(() => grid.removeLine(new Line())).toThrow('IllegalArgumentException');
    expect(() => grid.getCell(new Line(), new Col())).toThrow('IllegalArgumentException');
    expect(() => grid.getCell(grid.getRoot().getLine(), new Col())).toThrow('IllegalArgumentException');
    const cell = grid.getCell(grid.getRoot());
    expect(grid.linesOf(cell).get()).toBe(grid.getRoot().getLine());
    expect(grid.colsOf(cell).get()).toBe(grid.getRoot().getCol());
    expect(() => grid.getCoord(new Cell())).toThrow('IllegalArgumentException');
  });
});

describe('BpmElement END (unreachable from source, kept per D8)', () => {
  it('draws its type in red serif 14 when it has no label, and its label otherwise', () => {
    const skin = new SkinParamFresh();
    const measurer = new DeterministicMeasurer();
    const end = new BpmElement(null, BpmElementType.END);
    expect(end.toString()).toBe('END(NULL)');
    const svg = renderDrawableToFragment(end.toTextBlock(skin), { uid: 'e', width: 0, height: 0, measurer }).body;
    expect(svg).toMatch(/<text [^>]*fill="#F00" font-size="14"[^>]*font-family="serif">END<\/text>/);
    const labelled = new BpmElement('e', BpmElementType.END, 'bye');
    expect(labelled.toString()).toBe('END(e)');
    const svg2 = renderDrawableToFragment(labelled.toTextBlock(skin), { uid: 'e', width: 0, height: 0, measurer }).body;
    expect(svg2).toContain('>bye</text>');
    expect(labelled.getType()).toBe(BpmElementType.END);
    expect(labelled.getDisplay().toString()).toBe('[bye]');
    const dim = labelled.getDimension(stringBounderOf(measurer), skin);
    expect(labelled.getDimension(stringBounderOf(measurer), skin)).toBe(dim);
  });
});
