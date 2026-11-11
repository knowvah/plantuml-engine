import { describe, expect, it } from 'vitest';

import { Colors } from '../../../src/core/abel/Colors.js';
import type { ArrowConfiguration } from '../../../src/diagrams/sequence/sequence-arrowhead.js';
import { PanelsAnalog } from '../../../src/diagrams/timing/graphic/PanelsAnalog.js';
import { TimeSeries } from '../../../src/diagrams/timing/TimeSeries.js';
import { timingStyle } from '../../../src/diagrams/timing/timing-klimt.js';
import { TimingRuler } from '../../../src/diagrams/timing/TimingRuler.js';
import { stringBounder } from '../mindmap/helpers/mindmap-skin.js';
import { drawLeft, drawRight, fullHeightOf, leftWidthOf } from './helpers/draw.js';
import {
  ANALOG_CONSTRAINT_LEFT,
  ANALOG_CONSTRAINT_RIGHT,
  ANALOG_VCC_LEFT,
  ANALOG_VCC_RIGHT,
  ANALOG_VDD_LEFT,
  ANALOG_VDD_RIGHT,
  PROJ_ANALOG_LEFT,
  PROJ_ANALOG_RIGHT,
  TICKS_EVERY_LEFT,
  TICKS_EVERY_RIGHT,
} from './helpers/oracle.js';
import { analogPlayer } from './helpers/players.js';
import { tick, timingSkinParam } from './helpers/timing.js';

const NO_COLORS = Colors.empty();
const CONFIG: ArrowConfiguration = {
  dressing1: { head: 'NORMAL', part: 'FULL' },
  dressing2: { head: 'NORMAL', part: 'FULL' },
  decoration1: 'NONE',
  decoration2: 'NONE',
  dashed: false,
};
const set = (p: ReturnType<typeof analogPlayer>, t: string | undefined, v: string): void =>
  p.setState(t === undefined ? undefined : tick(t), undefined, NO_COLORS, v);

function rulerOf(...ticks: string[]): TimingRuler {
  const ruler = new TimingRuler(timingSkinParam());
  for (const t of ticks) ruler.addTime(tick(t));
  return ruler;
}

describe('PlayerAnalog (jar fragments)', () => {
  it('draws cov-analog: the bounds as the scale by default, or the multiples of `ticks num on multiple 3`', () => {
    const ruler = rulerOf('0', '2', '3', '5');
    const vdd = analogPlayer({ title: 'Vcore', ruler });
    const vcc = analogPlayer({ title: 'Vcc', ruler });
    vcc.setBounds('-4.5', '6.5');
    vcc.setTicks(3);
    vdd.setHeight(20);
    for (const [t, v] of [
      ['0', '0'],
      ['2', '0'],
      ['3', '6'],
      ['5', '0.5'],
    ] as const)
      set(vdd, t, v);
    set(vcc, '0', '3');
    set(vcc, '3', '-1.5');
    const available = Math.max(leftWidthOf(vdd), leftWidthOf(vcc));
    expect(available).toBeCloseTo(29.063, 3);
    expect(drawLeft(vdd, 25, 35, available)).toEqual(ANALOG_VDD_LEFT);
    expect(drawRight(vdd, 25 + available, 35)).toEqual(ANALOG_VDD_RIGHT);
    expect(drawLeft(vcc, 25, 70, available)).toEqual(ANALOG_VCC_LEFT);
    expect(drawRight(vcc, 25 + available, 70)).toEqual(ANALOG_VCC_RIGHT);
    expect(fullHeightOf(vdd)).toBe(20);
  });

  it('draws cov-ticks-every: `ticks every 2`, the first value is the initial one', () => {
    const p = analogPlayer({ title: 'A', ticks: ['0', '5', '10'] });
    p.setTicks(2);
    set(p, '0', '1');
    set(p, '5', '4');
    set(p, '10', '2');
    const available = leftWidthOf(p);
    expect(available).toBeCloseTo(24.425, 3);
    expect(drawLeft(p, 25, 35, available)).toEqual(TICKS_EVERY_LEFT);
    expect(drawRight(p, 25 + available, 35)).toEqual(TICKS_EVERY_RIGHT);
  });

  it('draws cov-projections A: bounds 0 and 10 through DeduceFormat as integers', () => {
    const p = analogPlayer({ title: 'A', ticks: ['0', '50', '100'] });
    p.setBounds('0', '10');
    set(p, '0', '2');
    set(p, '100', '8');
    const available = leftWidthOf(p);
    expect(available).toBeCloseTo(20.575, 3);
    expect(drawLeft(p, 25, 125, available)).toEqual(PROJ_ANALOG_LEFT);
    expect(drawRight(p, 25 + available, 125)).toEqual(PROJ_ANALOG_RIGHT);
  });

  it('draws cov-analog-constraint: an explicit initial value, and the constraint at offset 1 below a 17 px band', () => {
    const p = analogPlayer({ title: 'A', ticks: ['0', '10'] });
    p.setBounds('0', '10');
    set(p, undefined, '5');
    set(p, '0', '2');
    set(p, '10', '8');
    p.createConstraint(tick('0'), tick('10'), '{10 ms}', CONFIG);
    const available = leftWidthOf(p);
    expect(drawLeft(p, 25, 35, available)).toEqual(ANALOG_CONSTRAINT_LEFT);
    expect(drawRight(p, 25 + available, 35)).toEqual(ANALOG_CONSTRAINT_RIGHT);
    expect(fullHeightOf(p)).toBe(117);
  });
});

describe('PanelsAnalog#getTimeProjection (cov-projections: A@25 ends at y 187.6 = 125 + 62.6)', () => {
  const player = (): ReturnType<typeof analogPlayer> => {
    const p = analogPlayer({ ticks: ['0', '50', '100'] });
    p.setBounds('0', '10');
    set(p, '0', '2');
    set(p, '100', '8');
    return p;
  };
  const at = (t: string): { x: number; y: number } | undefined =>
    player().panels().getTimeProjection(stringBounder(), tick(t))?.getPointA();

  it('interpolates between the two values', () => {
    expect(at('25')?.x).toBe(25);
    expect(at('25')?.y).toBeCloseTo(62.6, 10);
  });

  it('takes the stored value on a tick that has one, the last after the last tick, the first before the first', () => {
    expect(at('0')?.y).toBeCloseTo(100 - 8 - (2 * 84) / 10, 10);
    expect(at('100')?.y).toBeCloseTo(100 - 8 - (8 * 84) / 10, 10);
    expect(at('150')?.y).toBeCloseTo(100 - 8 - (8 * 84) / 10, 10);
    expect(at('-50')?.y).toBeCloseTo(100 - 8 - (2 * 84) / 10, 10);
  });

  it('answers both points the same, and nothing for no tick', () => {
    const pt = player().panels().getTimeProjection(stringBounder(), tick('25'));
    expect(pt?.getPointB()).toEqual(pt?.getPointA());
    expect(player().panels().getTimeProjection(stringBounder(), undefined)).toBeUndefined();
  });
});

describe('PlayerAnalog#setState (java:74-93)', () => {
  const drawnWith = (value: string): string[] => {
    const p = analogPlayer({ ticks: ['0', '10'] });
    p.setBounds('0', '10'); // fixed bounds, or the scale follows the only value and every value draws alike
    set(p, '0', value);
    return drawRight(p, 0, 0);
  };

  it('parses the value as Double.parseDouble does: trimmed, with an exponent', () => {
    expect(drawnWith(' 2.5 ')).toEqual(drawnWith('2.5'));
    expect(drawnWith('2.5e0')).toEqual(drawnWith('2.5'));
    expect(drawnWith('2.5')).not.toEqual(drawnWith('3'));
  });

  it('reads an unparsable value as 0 (the exception is logged upstream, not here)', () => {
    expect(drawnWith('abc')).toEqual(drawnWith('0'));
  });

  it('makes the first value the initial state wherever it is set, and an explicit one replaces it', () => {
    const p = analogPlayer({ ticks: ['0', '10'] });
    set(p, '10', '4');
    set(p, undefined, '9');
    set(p, '0', '1');
    const q = analogPlayer({ ticks: ['0', '10'] });
    set(q, undefined, '9');
    set(q, '10', '4');
    set(q, '0', '1');
    expect(drawRight(p, 0, 0)).toEqual(drawRight(q, 0, 0));
    expect(drawRight(p, 0, 0)[0]).toContain('y1="'); // the first line starts at the initial value 9, not 4 or 1
  });

  it('replaces the value at an equal tick, `@0` then `@0.0` (TreeMap#put)', () => {
    const p = analogPlayer({ ticks: ['0', '10'] });
    set(p, '0', '1');
    set(p, '0.0', '2');
    const q = analogPlayer({ ticks: ['0', '10'] });
    set(q, '0', '1');
    set(q, undefined, '2');
    set(q, '0', '2');
    expect(drawRight(p, 0, 0)).toHaveLength(drawRight(q, 0, 0).length);
  });

  it('throws ArrayIndexOutOfBoundsException for no value, and has no defineState', () => {
    const p = analogPlayer();
    expect(() => p.setState(tick('0'), undefined, NO_COLORS)).toThrow('ArrayIndexOutOfBoundsException');
    expect(() => p.defineState('A', 'a')).toThrow('UnsupportedOperationException');
  });
});

describe('PanelsAnalog#ticks (java:98-102)', () => {
  it('throws ArithmeticException for `ticks every 0` once there is a value to test', () => {
    const p = analogPlayer({ ticks: ['0', '10'] });
    set(p, '0', '1');
    p.setTicks(0);
    expect(() => leftWidthOf(p)).toThrow('ArithmeticException');
    expect(() => drawRight(p, 0, 0)).toThrow('ArithmeticException');
  });

  it('saturates the bounds to a Java int: (int) ceil(-1e12) is -2147483648', () => {
    const p = analogPlayer({ ticks: ['0', '10'] });
    p.setBounds('-1000000000000', '-100000000000');
    p.setTicks(2);
    set(p, '0', '1');
    const labels = drawLeft(p, 0, 0, 100).filter((e) => e.startsWith('<text'));
    expect(labels).toHaveLength(1);
    expect(labels[0]).toContain('>-2147483648</text>');
  });
});

describe('PanelsAnalog built directly (java:62-70, 177-179)', () => {
  const build = (timeSeries: TimeSeries, ticksEvery?: number): PanelsAnalog => {
    const skinParam = timingSkinParam();
    return new PanelsAnalog({
      ruler: new TimingRuler(skinParam),
      skinParam,
      suggestedHeight: 100,
      style: timingStyle(skinParam, 'analog'),
      constraints: undefined,
      timeSeries,
      initialState: undefined,
      ticksEvery,
    });
  };

  it('passes setBounds to its series, which then answers the scale (`-2` and `3` as the left labels)', () => {
    const series = new TimeSeries();
    build(series).setBounds('-2', '3');
    expect([series.getMin(), series.getMax()]).toEqual([-2, 3]);
  });

  it('reads a NaN bound as the int 0 for the tick range ((int) NaN is 0)', () => {
    class NanSeries extends TimeSeries {
      public override getMin(): number {
        return Number.NaN;
      }
    }
    // first = 0, last = floor(10) = 10: the labels 0.0, 5.0 and 10.0, as a series whose min is really 0 gives
    const nan = build(new NanSeries(), 5).getLeftPanelWidth(stringBounder());
    expect(nan).toBe(build(new TimeSeries(), 5).getLeftPanelWidth(stringBounder()));
    expect(nan).toBeGreaterThan(5);
  });
});
