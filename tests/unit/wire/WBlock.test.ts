import { describe, expect, it } from 'vitest';
import { HColorSet } from '../../../src/core/klimt/color/HColorSet.js';
import { UTranslate } from '../../../src/core/klimt/UTranslate.js';
import { WBlock } from '../../../src/diagrams/wire/WBlock.js';
import { WLinkType } from '../../../src/diagrams/wire/WLinkType.js';
import { record, type RecordedEvent } from '../../helpers/recording-ugraphic.js';
import { measurer, stringBounder, wireSkinParam } from './helpers.js';

const newRoot = (): WBlock => new WBlock('', UTranslate.none(), 0, 0, undefined);

function rootWith(...blocks: readonly (readonly [string, number, number])[]): WBlock {
  const root = newRoot();
  for (const [name, w, h] of blocks) root.addBlock(0, name, w, h, undefined);
  return root;
}

const dims = (b: WBlock): readonly [number, number] => [
  b.getMaxDimension().getWidth(),
  b.getMaxDimension().getHeight(),
];
const at = (b: WBlock): readonly [number, number] => {
  const p = b.getAbsolutePosition('0', '0');
  return [p.getDx(), p.getDy()];
};
const drawn = (events: readonly RecordedEvent[]): readonly string[] => events.map((e) => ('draw' in e ? e.draw : ''));

describe('WBlock#getMaxDimension (WBlock.java:269-279)', () => {
  it.each([
    [0, 50, 100, 50],
    [50, 0, 50, 100],
    [0, 0, 100, 100],
  ])('a leaf [%dx%d] is %dx%d (cov-zero-dim)', (w, h, ew, eh) => {
    expect(dims(rootWith(['a', w, h]).getBlock('a')!)).toEqual([ew, eh]);
  });

  it('a forced parent keeps its forced size even when smaller than a child (cov-forced-with-children)', () => {
    const root = rootWith(['p', 30, 30]);
    root.addBlock(1, 'c', 100, 100, undefined);
    expect(dims(root.getBlock('p')!)).toEqual([30, 30]);
  });

  it('a parent with a zero forced width keeps natural size', () => {
    const root = rootWith(['p', 0, 0]);
    root.addBlock(1, 'c', 40, 40, undefined);
    // c at 10,20 → natural 10 + 40 + 10, 20 + 40 + 10.
    expect(dims(root.getBlock('p')!)).toEqual([60, 70]);
  });
});

describe('WBlock cursor', () => {
  it('stacks the second block at first y + height + 20 (dogoso-52-labe953)', () => {
    const root = rootWith(['A', 100, 50], ['B', 100, 50]);
    expect(at(root.getBlock('A')!)).toEqual([10, 20]);
    expect(at(root.getBlock('B')!)).toEqual([10, 90]);
  });

  it('newColumn at level 0 starts at natural width + 10, y 20 (cov-newcolumn-long, 141 x 91)', () => {
    const root = rootWith(['a', 40, 40]);
    root.newColumn(0);
    root.addBlock(0, 'b', 40, 40, undefined);
    expect(at(root.getBlock('b')!)).toEqual([70, 20]);
    expect(dims(root)).toEqual([120, 70]);
  });

  it('newColumn on an empty block leaves the first block at 10,20 (newcolumn-empty)', () => {
    const root = newRoot();
    root.newColumn(0);
    root.addBlock(0, 'a', 40, 40, undefined);
    expect(at(root.getBlock('a')!)).toEqual([10, 20]);
  });

  it('wgoto resets the cursor and the height to add', () => {
    const root = rootWith(['a', 40, 40]);
    root.wgoto(0, 200, 300);
    root.addBlock(0, 'b', 40, 40, undefined);
    expect(at(root.getBlock('b')!)).toEqual([200, 310]);
  });

  it('wmove shifts the cursor and keeps the height still to add', () => {
    const root = rootWith(['a', 40, 40]);
    root.wmove(0, 5, 7);
    root.addBlock(0, 'b', 40, 40, undefined);
    // cursor 30 + 7 + 10, then a's 40 added lazily.
    expect(at(root.getBlock('b')!)).toEqual([15, 87]);
  });

  it('print advances the cursor by the bounder height', () => {
    const root = rootWith(['a', 40, 40]);
    root.print(stringBounder, wireSkinParam(), 0, 'hi');
    root.addBlock(0, 'b', 40, 40, undefined);
    // a's 40 is added by print's getNextPosition, then print's 10 and addBlock's 10.
    expect(at(root.getBlock('b')!)).toEqual([10, 30 + 40 + 10 + 10]);
  });

  it('recurses to the last child at level 1', () => {
    const root = rootWith(['p', 0, 0]);
    root.wgoto(1, 50, 50);
    root.addBlock(1, 'c', 10, 10, undefined);
    expect(at(root.getBlock('p.c')!)).toEqual([60, 80]);
  });
});

describe('WBlock#getBlock (WBlock.java:145-155)', () => {
  it('walks dotted names', () => {
    const root = rootWith(['p', 0, 0]);
    root.addBlock(1, 'q', 0, 0, undefined);
    root.addBlock(2, 'r', 10, 10, undefined);
    expect(root.getBlock('p.q.r')).toBeInstanceOf(WBlock);
    expect(at(root.getBlock('p.q.r')!)).toEqual([30, 60]);
  });

  it('answers undefined for an unknown tail or head', () => {
    const root = rootWith(['a', 10, 10]);
    expect(root.getBlock('a.z')).toBeUndefined();
    expect(root.getBlock('z.a')).toBeUndefined();
    expect(root.getBlock('z')).toBeUndefined();
  });
});

describe('WBlock#getAbsolutePosition (WBlock.java:82-92)', () => {
  it('on the root ignores both arguments', () => {
    expect(newRoot().getAbsolutePosition('50%', '7')).toEqual(UTranslate.none());
  });

  it.each([
    ['100%-5', 105],
    ['50%+20', 80],
    ['0%+10', 20],
    ['-5%', 5],
    ['-5', 5],
    ['+20', 30],
  ])('parseWidth %s on a 100-wide block at x=10 is %d', (value, x) => {
    expect(rootWith(['a', 100, 40]).getBlock('a')!.getAbsolutePosition(value, '0').getDx()).toBe(x);
  });

  it.each([
    ['100%-5', 55],
    ['50%+20', 60],
    ['-5%', 18],
    ['7', 27],
  ])('parseHeight %s on a 40-high block at y=20 is %d', (value, y) => {
    expect(rootWith(['a', 100, 40]).getBlock('a')!.getAbsolutePosition('0', value).getDy()).toBe(y);
  });

  it('adds the parent position to a nested block', () => {
    const root = rootWith(['p', 0, 0]);
    root.addBlock(1, 'c', 10, 10, undefined);
    expect(root.getBlock('p.c')!.getAbsolutePosition('1', '2')).toEqual(new UTranslate(21, 42));
  });
});

describe('WBlock link starts (cov-link-stacking)', () => {
  const a = (): WBlock => rootWith(['a', 100, 100]).getBlock('a')!;
  const xy = (p: UTranslate): readonly [number, number] => [p.getDx(), p.getDy()];

  it('horizontal: starts at 100%,5 then steps +15 NORMAL, +25 BUS', () => {
    const block = a();
    expect(xy(block.getNextOutHorizontal(undefined, undefined, WLinkType.NORMAL))).toEqual([110, 25]);
    expect(xy(block.getNextOutHorizontal(undefined, undefined, WLinkType.BUS))).toEqual([110, 40]);
    expect(xy(block.getNextOutHorizontal(undefined, undefined, WLinkType.NORMAL))).toEqual([110, 65]);
  });

  it('horizontal: an explicit (x,y) also moves the next start', () => {
    const block = a();
    expect(xy(block.getNextOutHorizontal('100%', '80', WLinkType.NORMAL))).toEqual([110, 100]);
    expect(xy(block.getNextOutHorizontal(undefined, undefined, WLinkType.NORMAL))).toEqual([110, 115]);
  });

  it('horizontal: a lone x is not an explicit point (java:296 needs both)', () => {
    expect(xy(a().getNextOutHorizontal('7', undefined, WLinkType.NORMAL))).toEqual([110, 25]);
  });

  it('vertical: starts at 5,100% then steps in x', () => {
    const block = a();
    expect(xy(block.getNextOutVertical(undefined, undefined, WLinkType.NORMAL))).toEqual([15, 120]);
    expect(xy(block.getNextOutVertical(undefined, undefined, WLinkType.BUS))).toEqual([30, 120]);
    expect(xy(block.getNextOutVertical(undefined, undefined, WLinkType.NORMAL))).toEqual([55, 120]);
  });

  it('vertical: an explicit (x,y) also moves the next start', () => {
    const block = a();
    expect(xy(block.getNextOutVertical('50%', '100%', WLinkType.BUS))).toEqual([60, 120]);
    expect(xy(block.getNextOutVertical(undefined, undefined, WLinkType.NORMAL))).toEqual([85, 120]);
  });
});

describe('WBlock#addBlock errors (WBlock.java:199-219)', () => {
  it('returns Component exists already for a sibling duplicate', () => {
    const root = rootWith(['a', 10, 10]);
    expect(root.addBlock(0, 'a', 10, 10, undefined).getError()).toBe('Component exists already');
  });

  it('checks every level it passes through (cov-duplicate-nested-root-name)', () => {
    const root = rootWith(['a', 10, 10]);
    expect(root.addBlock(1, 'a', 10, 10, undefined).getError()).toBe('Component exists already');
  });

  it('allows one name under two parents (cov-duplicate-sibling-parents)', () => {
    const root = rootWith(['a', 10, 10], ['b', 10, 10]);
    expect(root.addBlock(1, 'x', 10, 10, undefined).isOk()).toBe(true);
  });

  it('throws on a dotted name, which CommandComponent cannot produce', () => {
    expect(() => newRoot().addBlock(0, 'a.b', 1, 1, undefined)).toThrow('IllegalArgumentException');
  });
});

describe('WBlock at a level with no child: the Java NPE (wrp D4, D5)', () => {
  it('addBlock throws', () => {
    expect(() => newRoot().addBlock(1, 'a', 1, 1, undefined)).toThrow(TypeError);
  });
  it('newColumn throws', () => {
    expect(() => newRoot().newColumn(1)).toThrow(TypeError);
  });
  it('wgoto throws', () => {
    expect(() => newRoot().wgoto(1, 0, 0)).toThrow(TypeError);
  });
  it('wmove throws', () => {
    expect(() => newRoot().wmove(1, 0, 0)).toThrow(TypeError);
  });
  it('print throws', () => {
    expect(() => newRoot().print(stringBounder, wireSkinParam(), 1, 'x')).toThrow(TypeError);
  });
});

describe('WBlock#drawMe (WBlock.java:237-267)', () => {
  it('draws rectangle, children, prints, then the name at dx 5', () => {
    const root = rootWith(['p_q', 40, 30]);
    root.addBlock(1, 'c', 10, 10, undefined);
    root.print(stringBounder, wireSkinParam(), 1, 'hi');
    const events = record(measurer, (ug) => root.getBlock('p_q')!.drawMe(ug));
    expect(drawn(events)).toEqual(['URectangle(40,30)', 'URectangle(10,10)', 'UText(c)', 'UText(hi)', 'UText(p q)']);
  });

  it('replaces every underscore in the name', () => {
    const root = rootWith(['a_b_c', 40, 30]);
    const events = record(measurer, (ug) => root.getBlock('a_b_c')!.drawMe(ug));
    expect(drawn(events)).toEqual(['URectangle(40,30)', 'UText(a b c)']);
  });

  it('fills with its colour', () => {
    const root = newRoot();
    root.addBlock(0, 'a', 10, 20, HColorSet.instance().getColor('#FF0000'));
    const events = record(measurer, (ug) => root.getBlock('a')!.drawMe(ug));
    expect(events[0]).toEqual({ draw: 'URectangle(10,20)', chain: ['fore(#000000)', 'back(#FF0000)'] });
  });

  it('the root has no rectangle and draws its empty name (every jar row)', () => {
    const root = rootWith(['a', 10, 10]);
    const events = record(measurer, (ug) => root.drawMe(ug));
    expect(drawn(events)).toEqual(['URectangle(10,10)', 'UText(a)', 'UText( )']);
  });

  it('toString names the block and its position', () => {
    const root = rootWith(['a', 10, 10]);
    expect(root.getBlock('a')!.toString()).toBe('a ' + new UTranslate(10, 20).toString());
  });
});
