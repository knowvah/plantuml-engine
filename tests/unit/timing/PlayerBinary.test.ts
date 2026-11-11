import { describe, expect, it } from 'vitest';

import { Colors } from '../../../src/core/abel/Colors.js';
import { Position } from '../../../src/core/abel/Position.js';
import { Display } from '../../../src/core/klimt/creole/Display.js';
import type { ArrowConfiguration } from '../../../src/diagrams/sequence/sequence-arrowhead.js';
import { TimingRuler } from '../../../src/diagrams/timing/TimingRuler.js';
import { stringBounder } from '../mindmap/helpers/mindmap-skin.js';
import { drawLeft, drawRight, fullHeightOf, leftWidthOf } from './helpers/draw.js';
import {
  BINARY_BASIC,
  BINARY_NOTES,
  BINARY_NO_STATE,
  CLOCK_DECIMAL_BINARY,
  CLOCK_TIME_B,
  PROJ_BINARY,
} from './helpers/oracle.js';
import { binaryPlayer } from './helpers/players.js';
import { tick, timingSkinParam } from './helpers/timing.js';

const NO_COLORS = Colors.empty();
const CONFIG: ArrowConfiguration = {
  dressing1: { head: 'NORMAL', part: 'FULL' },
  dressing2: { head: 'NORMAL', part: 'FULL' },
  decoration1: 'NONE',
  decoration2: 'NONE',
  dashed: false,
};

/** A binary player with `setState(0, state...)` over a ruler of ticks 0 and 10, drawn at the origin. */
const drawn = (...states: string[]): string[] => {
  const p = binaryPlayer({ ticks: ['0', '10'] });
  p.setState(tick('0'), undefined, NO_COLORS, ...states);
  return drawRight(p, 0, 0);
};

describe('PlayerBinary (jar fragments)', () => {
  it('draws cov-binary: a zero-length first line, steps at the changes, the high level 14 px above the low', () => {
    const p = binaryPlayer({ title: 'Enable', ticks: ['0', '5', '10'] });
    p.setState(tick('0'), undefined, NO_COLORS, 'low');
    p.setState(tick('5'), undefined, NO_COLORS, 'high');
    p.setState(tick('10'), undefined, NO_COLORS, 'low');
    expect(drawRight(p, 30, 35)).toEqual(BINARY_BASIC);
    expect(fullHeightOf(p)).toBe(30);
    expect(leftWidthOf(p)).toBe(5);
    expect(drawLeft(p, 25, 35, 5)).toEqual([]);
  });

  it('draws a binary with no state as one low line (vega-clock-message-from-binary)', () => {
    const p = binaryPlayer({ title: 'Threshold Reached', ticks: ['10'] });
    expect(drawRight(p, 30, 80)).toEqual(BINARY_NO_STATE);
  });

  it('draws cov-clock-time B: ticks counted in clock periods', () => {
    const p = binaryPlayer({ title: 'B', ticks: ['0', '1', '2', '5'] });
    p.setState(tick('0'), undefined, NO_COLORS, 'low');
    p.setState(tick('2'), undefined, NO_COLORS, 'high');
    p.setState(tick('5'), undefined, NO_COLORS, 'low');
    expect(drawRight(p, 30, 66)).toEqual(CLOCK_TIME_B);
  });

  it('draws vega-clock-decimal-period-offset B: a change at 10.5 between the 5 px ticks', () => {
    const p = binaryPlayer({ title: 'State', ticks: ['12.5', '0', '10.5'] });
    p.setState(tick('0'), undefined, NO_COLORS, 'low');
    p.setState(tick('10.5'), undefined, NO_COLORS, 'high');
    expect(drawRight(p, 30, 80)).toEqual(CLOCK_DECIMAL_BINARY);
  });

  it('draws cov-projections B', () => {
    const p = binaryPlayer({ title: 'B', ticks: ['0', '50', '100'] });
    p.setState(tick('0'), undefined, NO_COLORS, 'low');
    p.setState(tick('100'), undefined, NO_COLORS, 'high');
    expect(drawRight(p, 45.575, 80)).toEqual(PROJ_BINARY);
  });

  it('draws cov-binary-notes: initial high, a {low,high} hatch, a comment, notes either side, a constraint at 2.5', () => {
    const p = binaryPlayer({ title: 'B', ticks: ['0', '10', '20'] });
    const text = (s: string): Display => Display.getWithNewlines(p.getSkinParam().getPragma(), s);
    p.setState(undefined, undefined, NO_COLORS, 'high');
    p.setState(tick('0'), undefined, NO_COLORS, 'low', 'high');
    p.setState(tick('10'), 'up', NO_COLORS, 'high');
    p.setState(tick('20'), undefined, NO_COLORS, 'low');
    p.addNote(tick('20'), text('top note'), Position.TOP);
    p.addNote(tick('20'), text('bottom note'), Position.BOTTOM);
    p.createConstraint(tick('10'), tick('20'), '{10 ms}', CONFIG);
    expect(drawRight(p, 30, 35)).toEqual(BINARY_NOTES);
    // 17 px constraint band + the two notes (23 + 10 each) + the 30 px ribbon (jar: axis at 148, frame 20 + 15)
    expect(fullHeightOf(p)).toBe(113);
  });
});

describe('PlayerBinary#setState (java:76-96)', () => {
  const HIGH = drawn('high');
  const LOW = drawn('low');

  it('maps 1 and high in any case to the high level, anything else to the low one', () => {
    for (const s of ['1', 'high', 'HIGH', 'High']) expect(drawn(s)).toEqual(HIGH);
    for (const s of ['0', 'low', 'foo', 'higher', '']) expect(drawn(s)).toEqual(LOW);
    expect(HIGH.at(-1)).toContain('y1="8"');
    expect(LOW.at(-1)).toContain('y1="22"');
  });

  it('keeps two states and drops a third', () => {
    expect(drawn('low', 'high', 'high')).toEqual(drawn('low', 'high'));
    expect(drawn('low', 'high')).not.toEqual(HIGH);
  });

  it('throws ArrayIndexOutOfBoundsException for no state', () => {
    expect(() => binaryPlayer().setState(tick('0'), undefined, NO_COLORS)).toThrow('ArrayIndexOutOfBoundsException');
  });

  it('replaces the value at an equal tick, `@0` then `@0.0` (TreeMap#put)', () => {
    const p = binaryPlayer({ ticks: ['0', '10'] });
    p.setState(tick('0'), undefined, NO_COLORS, 'low');
    p.setState(tick('0.0'), undefined, NO_COLORS, 'high');
    expect(drawRight(p, 0, 0)).toEqual(HIGH);
  });

  it('has no defineState', () => {
    expect(() => binaryPlayer().defineState('A', 'a')).toThrow('UnsupportedOperationException');
  });
});

describe('PanelsBinary#getTimeProjection (java:81-87)', () => {
  const player = (): ReturnType<typeof binaryPlayer> => {
    const p = binaryPlayer({ ticks: ['0', '50', '100'] });
    p.setState(tick('0'), undefined, NO_COLORS, 'low');
    p.setState(tick('100'), undefined, NO_COLORS, 'high');
    return p;
  };

  it('is the high level for any tick, even in a low stretch (oracle cov-projections: B@100 and B@5 both end at y 88 = 80 + 8)', () => {
    const at = (t: string): unknown => player().panels().getTimeProjection(stringBounder(), tick(t))?.getPointA();
    expect(at('100')).toEqual({ x: 100, y: 8 });
    expect(at('5')).toEqual({ x: 5, y: 8 });
  });

  it('answers both points the same, and nothing for no tick', () => {
    const pt = player().panels().getTimeProjection(stringBounder(), tick('5'));
    expect(pt?.getPointB()).toEqual(pt?.getPointA());
    expect(player().panels().getTimeProjection(stringBounder(), undefined)).toBeUndefined();
  });

  it('counts the constraint band and the top note in y (cov-binary-notes: 8 + 17 + 33 = 58)', () => {
    const skinParam = timingSkinParam();
    const p = binaryPlayer({ skinParam, ruler: new TimingRuler(skinParam), ticks: ['0', '10', '20'] });
    p.setState(tick('0'), undefined, NO_COLORS, 'low');
    p.addNote(tick('20'), Display.getWithNewlines(skinParam.getPragma(), 'top note'), Position.TOP);
    p.createConstraint(tick('10'), tick('20'), '{10 ms}', CONFIG);
    expect(p.panels().getTimeProjection(stringBounder(), tick('10'))?.getPointA().y).toBe(58);
  });
});
