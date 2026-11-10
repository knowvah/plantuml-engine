/**
 * The layout half of nwdiag's `next/`: stages, bars, boxes, the Tetris
 * packing, the boolean grid, the play field and the server array.
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/nwdiag/next/
 */
import { describe, expect, it } from 'vitest';
import { BooleanGrid } from '../../../../src/diagrams/nwdiag/next/BooleanGrid.js';
import { NBar } from '../../../../src/diagrams/nwdiag/next/NBar.js';
import { NBox } from '../../../../src/diagrams/nwdiag/next/NBox.js';
import { NPlayField } from '../../../../src/diagrams/nwdiag/next/NPlayField.js';
import { NStage } from '../../../../src/diagrams/nwdiag/next/NStage.js';
import { NTetris } from '../../../../src/diagrams/nwdiag/next/NTetris.js';
import { NwArray } from '../../../../src/diagrams/nwdiag/next/NwArray.js';
import type { NServerDraw } from '../../../../src/diagrams/nwdiag/next/NServerDraw.js';

/** A bar over the given stage numbers of `field`. */
function bar(field: NPlayField, ...stages: number[]): NBar {
  const result = new NBar();
  for (const s of stages) result.addStage(field.getStage(s));
  return result;
}

describe('NStage', () => {
  it('orders by number and names itself S<n> (java:46-53)', () => {
    const [a, b] = [new NStage(1), new NStage(3)];
    expect([a.compareTo(b), b.compareTo(a), a.compareTo(new NStage(1))]).toEqual([-1, 1, 0]);
    expect([a.toString(), a.getNumber()]).toEqual(['S1', 1]);
  });

  it('getMin/getMax keep the second stage on a tie (java:59-71)', () => {
    const [x, y] = [new NStage(2), new NStage(2)];
    expect(NStage.getMin(x, y)).toBe(y);
    expect(NStage.getMax(x, y)).toBe(y);
    expect(NStage.getMin(new NStage(0), x).getNumber()).toBe(0);
    expect(NStage.getMax(new NStage(5), x).getNumber()).toBe(5);
  });
});

describe('NBar', () => {
  it('spans the stages it was given and contains the ones between (java:68-87)', () => {
    const field = new NPlayField();
    const b = bar(field, 2, 0);
    expect([b.getStart().getNumber(), b.getEnd().getNumber(), b.getNWidth()]).toEqual([0, 2, 1]);
    expect([b.contains(field.getStage(1)), b.contains(field.getStage(3))]).toEqual([true, false]);
    expect(b.toString()).toBe('S0->S2');
    expect(new NBar().toString()).toBe('null->null');
  });

  it('refuses a null stage (Objects.requireNonNull, java:69)', () => {
    expect(() => new NBar().addStage(null)).toThrow('NullPointerException');
  });
});

describe('BooleanGrid', () => {
  it('refuses to burn a cell twice (java:48-53)', () => {
    const grid = new BooleanGrid();
    grid.burn(1, 2);
    expect(grid.isBurned(1, 2)).toBe(true);
    expect(grid.isBurned(2, 1)).toBe(false);
    expect(() => grid.burn(1, 2)).toThrow('Already present');
  });

  it("check's three cases throw (java:75-85)", () => {
    const grid = new BooleanGrid();
    expect(() => grid.burnRect(-1, 0, 0, 0)).toThrow('IllegalArgumentException');
    expect(() => grid.isBurnRect(2, 0, 1, 0)).toThrow('IllegalArgumentException');
    expect(() => grid.isBurnRect(0, 2, 0, 1)).toThrow('IllegalArgumentException');
  });

  it('burns a rectangle inclusively (java:59-73)', () => {
    const grid = new BooleanGrid();
    grid.burnRect(0, 0, 1, 1);
    expect([grid.isBurned(1, 1), grid.isBurnRect(2, 0, 3, 3), grid.isBurnRect(1, 1, 2, 2)]).toEqual([
      true,
      false,
      true,
    ]);
  });
});

describe('NTetris', () => {
  it('stacks overlapping bars into columns 0 and 1', () => {
    const field = new NPlayField();
    const [wide, mid] = [bar(field, 0, 1, 2), bar(field, 1)];
    const tetris = new NTetris<NBar>();
    tetris.add(wide);
    tetris.add(mid);
    expect([...tetris.getPositions().values()]).toEqual([0, 1]);
    expect(tetris.getNWidth()).toBe(2);
  });

  it('lets disjoint bars share column 0', () => {
    const field = new NPlayField();
    const tetris = new NTetris<NBar>();
    tetris.add(bar(field, 0));
    tetris.add(bar(field, 2));
    expect([...tetris.getPositions().values()]).toEqual([0, 0]);
    expect(tetris.getNWidth()).toBe(1);
  });

  it('throws past column 100 (java:61-62)', () => {
    const field = new NPlayField();
    const tetris = new NTetris<NBar>();
    for (let i = 0; i <= 100; i++) tetris.add(bar(field, 0));
    expect(() => tetris.add(bar(field, 0))).toThrow('IllegalStateException');
  });
});

describe('NBox', () => {
  it('spans its bars and packs them side by side (java:46-84)', () => {
    const field = new NPlayField();
    const box = new NBox();
    const [a, b] = [bar(field, 1, 2), bar(field, 0, 1)];
    box.add(a);
    box.add(b);
    box.add(a);
    expect([box.getStart().getNumber(), box.getEnd().getNumber(), box.getNWidth()]).toEqual([0, 2, 2]);
    expect([box.getPositions().get(a), box.getPositions().get(b)]).toEqual([0, 1]);
    expect([box.contains(field.getStage(2)), box.contains(field.getStage(3))]).toEqual([true, false]);
  });

  it('an empty box throws on getStart/getEnd (bars.get(0))', () => {
    expect(() => new NBox().getStart()).toThrow('IndexOutOfBoundsException');
    expect(() => new NBox().getEnd()).toThrow('IndexOutOfBoundsException');
  });
});

describe('NPlayField', () => {
  it('grows stages on demand; getLast is null when empty (java:54-70)', () => {
    const field = new NPlayField();
    expect(field.getLast()).toBeNull();
    expect(field.createNewStage().getNumber()).toBe(0);
    expect(field.getStage(3).getNumber()).toBe(3);
    expect(field.getLast()?.getNumber()).toBe(3);
    expect(field.createNewStage().getNumber()).toBe(4);
  });

  it('doLayout maps each bar to its box position plus bar position (java:83-101)', () => {
    const field = new NPlayField();
    const a = bar(field, 0, 1);
    const group = new NBox();
    const [g1, g2] = [bar(field, 0), bar(field, 0)];
    for (const b of [g1, g2]) {
      group.add(b);
      b.setParent(group);
    }
    field.addInPlayfield(a);
    field.addInPlayfield(g1);
    field.addInPlayfield(g2);
    const layout = field.doLayout();
    expect([layout.get(a), layout.get(g1), layout.get(g2)]).toEqual([0, 1, 2]);
    expect(a.getParent()).not.toBeNull();
  });
});

describe('NwArray', () => {
  it('starts all null and stores cells (java:42-69)', () => {
    const array = new NwArray(2, 3);
    expect([array.getNbLines(), array.getNbCols(), array.get(1, 2)]).toEqual([2, 3, null]);
    const cell = {} as NServerDraw;
    array.set(1, 2, cell);
    expect(array.get(1, 2)).toBe(cell);
    expect(array.getLine(1)).toEqual([null, null, cell]);
    expect(array.toString()).toBe('lines=2 cols=3');
  });

  it('getNbCols throws with no lines (data[0].length, nwp D4)', () => {
    expect(() => new NwArray(0, 0).getNbCols()).toThrow('ArrayIndexOutOfBoundsException');
  });
});
