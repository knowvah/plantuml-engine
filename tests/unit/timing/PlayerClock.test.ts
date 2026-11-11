import { describe, expect, it } from 'vitest';

import { Colors } from '../../../src/core/abel/Colors.js';
import { BigDecimal } from '../../../src/core/decimal/BigDecimal.js';
import type { ArrowConfiguration } from '../../../src/diagrams/sequence/sequence-arrowhead.js';
import { TimingRuler } from '../../../src/diagrams/timing/TimingRuler.js';
import { stringBounder } from '../mindmap/helpers/mindmap-skin.js';
import { drawLeft, drawRight, fullHeightOf, leftWidthOf } from './helpers/draw.js';
import {
  CLOCK_C0,
  CLOCK_C1,
  CLOCK_DECIMAL,
  CLOCK_ONLY_PERIOD_TICK,
  CLOCK_TIME_CLK,
  PROJ_CLOCK,
} from './helpers/oracle.js';
import { clockPlayer } from './helpers/players.js';
import { tick, timingSkinParam } from './helpers/timing.js';

const CONFIG: ArrowConfiguration = {
  dressing1: { head: 'NORMAL', part: 'FULL' },
  dressing2: { head: 'NORMAL', part: 'FULL' },
  decoration1: 'NONE',
  decoration2: 'NONE',
  dashed: false,
};

/** A ruler holding the given ticks, as `createPlayerClock` (the period) and `@time` (the others) add them. */
function rulerOf(...ticks: string[]): TimingRuler {
  const ruler = new TimingRuler(timingSkinParam());
  for (const t of ticks) ruler.addTime(tick(t));
  return ruler;
}

describe('PlayerClock (jar fragments)', () => {
  it('draws cov-clock-pulse-offset: half a period high by default, then pulse 15 after offset 10', () => {
    const skinParam = timingSkinParam();
    const ruler = new TimingRuler(skinParam);
    for (const t of ['50', '50', '0', '200']) ruler.addTime(tick(t));
    const c0 = clockPlayer({ title: 'Clock_0', skinParam, ruler, period: '50' });
    const c1 = clockPlayer({ title: 'Clock_1', skinParam, ruler, period: '50', pulse: '15', offset: '10' });
    expect(drawRight(c0, 30, 35)).toEqual(CLOCK_C0);
    expect(drawRight(c1, 30, 80)).toEqual(CLOCK_C1);
    expect(fullHeightOf(c0)).toBe(30);
    expect(leftWidthOf(c0)).toBe(5);
    expect(drawLeft(c0, 25, 35, 5)).toEqual([]);
  });

  it('draws cov-clock-time: an untitled clock of period 1 over ticks counted in periods', () => {
    const ruler = rulerOf('1', '0', '2', '5');
    expect(drawRight(clockPlayer({ title: '', ruler, period: '1' }), 30, 21)).toEqual(CLOCK_TIME_CLK);
  });

  it('draws vega-clock-decimal-period-offset: a 12.5 period and a 0.1 offset, cut at the right end of the ruler', () => {
    const ruler = rulerOf('12.5', '0', '10.5');
    const p = clockPlayer({ title: 'MyClock', ruler, period: '12.5', offset: '0.1' });
    expect(drawRight(p, 30, 35)).toEqual(CLOCK_DECIMAL);
  });

  it('draws vega-clock-message-from-binary: with only the period as a tick the wave starts at x -50', () => {
    const p = clockPlayer({ title: 'Sample Clock', ruler: rulerOf('10'), period: '10' });
    expect(drawRight(p, 30, 35)).toEqual(CLOCK_ONLY_PERIOD_TICK);
  });

  it('draws cov-projections Clk', () => {
    const ruler = rulerOf('0', '50', '100');
    const p = clockPlayer({ title: 'Clk', ruler, period: '50', pulse: '15', offset: '10' });
    expect(drawRight(p, 45.575, 35)).toEqual(PROJ_CLOCK);
  });
});

describe('PanelsClock#isHighAt through getTimeProjection (java:83-112; oracle cov-projections C@60 y 43, C@75 y 57)', () => {
  const HIGH_Y = 8;
  const LOW_Y = 22;
  const yAt = (p: ReturnType<typeof clockPlayer>, t: string): number | undefined =>
    p.panels().getTimeProjection(stringBounder(), tick(t))?.getPointA().y;
  const pulsed = (): ReturnType<typeof clockPlayer> =>
    clockPlayer({ ruler: rulerOf('0', '50', '100'), period: '50', pulse: '15', offset: '10' });

  it('is high inside the pulse after the offset and low in the remainder', () => {
    const p = pulsed();
    expect(yAt(p, '60')).toBe(HIGH_Y);
    expect(yAt(p, '10')).toBe(HIGH_Y);
    expect(yAt(p, '24.9')).toBe(HIGH_Y);
    expect(yAt(p, '75')).toBe(LOW_Y);
    expect(yAt(p, '25')).toBe(LOW_Y);
  });

  it('is low before the offset', () => {
    expect(yAt(pulsed(), '5')).toBe(LOW_Y);
    expect(yAt(pulsed(), '-20')).toBe(LOW_Y);
  });

  it('takes half a period as the pulse when it is 0', () => {
    const p = clockPlayer({ ruler: rulerOf('0', '100'), period: '50' });
    expect(yAt(p, '24.9')).toBe(HIGH_Y);
    expect(yAt(p, '25')).toBe(LOW_Y);
    expect(yAt(p, '50')).toBe(HIGH_Y);
  });

  it('is always low for a period of 0 or less', () => {
    expect(yAt(clockPlayer({ ruler: rulerOf('0', '100'), period: '0' }), '3')).toBe(LOW_Y);
    expect(yAt(clockPlayer({ ruler: rulerOf('0', '100'), period: '-5' }), '3')).toBe(LOW_Y);
  });

  it('answers the same point twice at x of the tick, and nothing for no tick', () => {
    const pt = pulsed().panels().getTimeProjection(stringBounder(), tick('60'));
    expect(pt?.getPointA()).toEqual({ x: 60, y: HIGH_Y });
    expect(pt?.getPointB()).toBe(pt?.getPointA());
    expect(pulsed().panels().getTimeProjection(stringBounder(), undefined)).toBeUndefined();
  });
});

describe('PanelsClock#drawRightPanel limits (java:114-143)', () => {
  it('draws only the part of the offset that fits when the offset is past the ruler, and no edge', () => {
    const p = clockPlayer({ ruler: rulerOf('0', '100'), period: '10', offset: '1000' });
    // the ruler is 100 px wide (50 px per 100 time units, one interval past the last tick); the line stops there
    // (`Math.min(ruler.getWidth(), xOfTime(endTime))`, Panels.java:178)
    expect(drawRight(p, 0, 0)).toEqual([
      '<line x1="0" y1="22" x2="100" y2="22" style="stroke:#006400;stroke-width:1.5;"/>',
    ]);
  });

  it('stops after 1000 periods when the ruler is still not reached', () => {
    const p = clockPlayer({ ruler: rulerOf('0', '100'), period: '0.01' });
    const elements = drawRight(p, 0, 0);
    expect(elements).toHaveLength(1 + 4 * 1000);
    expect(elements.at(-1)).toContain('x1="5" y1="8"');
  });
});

describe('PlayerClock (java:47-87)', () => {
  it('keeps its period as a BigDecimal', () => {
    const period = clockPlayer({ period: '12.50' }).getPeriod();
    expect(period.toPlainString()).toBe('12.50');
    expect(period.compareTo(new BigDecimal('12.5'))).toBe(0);
  });

  it('has no states and no constraints: every one throws UnsupportedOperationException', () => {
    const p = clockPlayer({ period: '1' });
    expect(() => p.defineState('A', 'a')).toThrow('UnsupportedOperationException');
    expect(() => p.setState(tick('0'), undefined, Colors.empty(), 'x')).toThrow('UnsupportedOperationException');
    expect(() => p.createConstraint(tick('0'), tick('1'), 'm', CONFIG)).toThrow('UnsupportedOperationException');
  });
});
