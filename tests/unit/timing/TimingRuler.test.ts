import { describe, expect, it } from 'vitest';

import { TimeAxisStategy } from '../../../src/diagrams/timing/TimeAxisStategy.js';
import type { TimeTick } from '../../../src/diagrams/timing/TimeTick.js';
import { TimingFormat } from '../../../src/diagrams/timing/TimingFormat.js';
import { TimingRuler } from '../../../src/diagrams/timing/TimingRuler.js';
import { RecordingUGraphic } from '../../helpers/recording-ugraphic.js';
import { oracleMeasurer, tick, timingSkinParam } from './helpers/timing.js';

/** The diagram translates its content by this much in every probe (`TimingDiagram`'s margin and left panel). */
const OFFSET = 25;
const LABEL_TOLERANCE = 2; // toBeCloseTo digits: the oracle prints three decimals

interface Axis {
  readonly tickXs: number[];
  readonly hline: number | undefined;
  readonly labels: { readonly text: string; readonly x: number }[];
}

function ruler(...ticks: TimeTick[]): TimingRuler {
  const r = new TimingRuler(timingSkinParam());
  for (const t of ticks) r.addTime(t);
  return r;
}

/** Read an axis off the draw log: the `ULine(0,5)` ticks, the `ULine(w,0)` rule and each label's x. */
function drawAxis(r: TimingRuler, strategy: TimeAxisStategy, codes = new Map<string, TimeTick>()): Axis {
  const ug = new RecordingUGraphic(oracleMeasurer());
  r.drawTimeAxis(ug, strategy, codes);
  const dx = (chain: readonly string[]): number => Number(/translate\(([^,]+),/.exec(chain[2] ?? '')?.[1]);
  const tickXs: number[] = [];
  const labels: { text: string; x: number }[] = [];
  let hline: number | undefined;
  for (const e of ug.log) {
    if (!('draw' in e)) continue;
    if (e.draw === 'ULine(0,5)') tickXs.push(dx(e.chain));
    else if (e.draw.startsWith('ULine(')) hline = Number(/ULine\(([^,]+),0\)/.exec(e.draw)?.[1]);
    else labels.push({ text: e.draw.slice('UText('.length, -1), x: dx(e.chain) });
  }
  return { tickXs, hline, labels };
}

function vlineXs(r: TimingRuler, height: number): { xs: number[]; chain: string } {
  const ug = new RecordingUGraphic(oracleMeasurer());
  r.drawVlines(ug, height);
  const draws = ug.log.filter((e): e is { draw: string; chain: readonly string[] } => 'draw' in e);
  return {
    xs: draws.map((e) => Number(/translate\(([^,]+),/.exec(e.chain[2] ?? '')?.[1])),
    chain: `${draws[0]?.draw} ${draws[0]?.chain.slice(0, 2).join(' ')}`,
  };
}

function expectLabels(axis: Axis, expected: readonly (readonly [string, number])[]): void {
  expect(axis.labels.map((l) => l.text)).toEqual(expected.map(([text]) => text));
  axis.labels.forEach((l, i) =>
    expect(l.x).toBeCloseTo((expected[i] as readonly [string, number])[1] - OFFSET, LABEL_TOLERANCE),
  );
}

describe('TimingRuler positions (cov-concise-basic: ticks 0, 100, 300)', () => {
  const r = ruler(tick('0'), tick('100'), tick('300'));

  it('maps ticks to pixels with the HCF as the unit and 50 px per unit', () => {
    expect([0, 100, 300].map((t) => r.getPosInPixel(tick(String(t))))).toEqual([0, 50, 150]);
    expect(r.getWidth()).toBe(200);
  });

  it('draws the automatic axis exactly as the jar: 5 ticks, the rule, 3 round-value labels', () => {
    const axis = drawAxis(r, TimeAxisStategy.AUTOMATIC);
    expect(axis.tickXs).toEqual([0, 50, 100, 150, 200]);
    expect(axis.hline).toBe(200);
    expectLabels(axis, [
      ['0', 21.941],
      ['100', 65.822],
      ['300', 165.822],
    ]);
  });

  it('draws the dashed grid in the timegrid line colour (3,5,0.5)', () => {
    const grid = vlineXs(r, 54);
    expect(grid.xs).toEqual([0, 50, 100, 150, 200]);
    expect(grid.chain).toBe('ULine(0,54) stroke(3,5,0.5) fore(#333333)');
  });

  it('the axis style is the timeline stroke (thickness 2) in the timeline colour', () => {
    const ug = new RecordingUGraphic(oracleMeasurer());
    r.drawTimeAxis(ug, TimeAxisStategy.AUTOMATIC, new Map());
    const first = ug.log[0];
    expect(first && 'chain' in first ? first.chain.slice(0, 2) : []).toEqual(['stroke(0,0,2)', 'fore(#333333)']);
  });

  it('measures its height from the timeline font (11 pt)', () => {
    expect(r.getHeight(new RecordingUGraphic(oracleMeasurer()).getStringBounder())).toBe(11);
  });
});

describe('TimingRuler scale and hidden axis (cov-scale-hide-axis)', () => {
  it('scaleInPixels(100, 50) gives the same grid and a hidden axis draws nothing', () => {
    const r = ruler(tick('0'), tick('100'), tick('300'));
    r.scaleInPixels(100, 50);
    expect(vlineXs(r, 54).xs).toEqual([0, 50, 100, 150, 200]);
    expect(drawAxis(r, TimeAxisStategy.HIDDEN)).toEqual({ tickXs: [], hline: undefined, labels: [] });
  });

  it('a larger scale stretches the pixels (scale 100 as 100 pixels: ticks at 0, 100, 300)', () => {
    const r = ruler(tick('0'), tick('100'), tick('300'));
    r.scaleInPixels(100, 100);
    expect([0, 100, 300].map((t) => r.getPosInPixel(tick(String(t))))).toEqual([0, 100, 300]);
    expect(r.getWidth()).toBe(400);
  });

  it('rejects a non-positive tick or pixel with IllegalArgumentException', () => {
    const r = ruler(tick('0'));
    expect(() => r.scaleInPixels(0, 50)).toThrow('java.lang.IllegalArgumentException');
    expect(() => r.scaleInPixels(100, 0)).toThrow('java.lang.IllegalArgumentException');
    expect(() => r.scaleInPixels(-1, -1)).toThrow('java.lang.IllegalArgumentException');
  });
});

describe('TimingRuler negative time (cov-negative-time: -10, 0, 20)', () => {
  const r = ruler(tick('-10'), tick('0'), tick('20'));

  it('starts the rule at the first non-negative tick and labels the rounded values', () => {
    const axis = drawAxis(r, TimeAxisStategy.AUTOMATIC);
    expect(axis.tickXs).toEqual([50, 100, 150, 200]);
    expect(axis.hline).toBe(150);
    expectLabels(axis, [
      ['-10', 17.059],
      ['0', 71.941],
      ['20', 168.881],
    ]);
  });

  it('positions ticks from the minimum', () => {
    expect([-10, 0, 20].map((t) => r.getPosInPixel(tick(String(t))))).toEqual([0, 50, 150]);
  });
});

describe('TimingRuler ensureNotEmpty', () => {
  it('adds a zero tick to an empty ruler: a one-tick ruler of width 50', () => {
    const r = ruler();
    r.ensureNotEmpty();
    expect(r.getWidth()).toBe(50);
    expect(r.getPosInPixel(tick('0')) + 0).toBe(0); // -0 in Java too: (0 - 0) / -1 * 50
  });

  it('adds a zero tick when the ticks straddle zero without containing it', () => {
    const r = ruler(tick('-10'), tick('20'));
    r.ensureNotEmpty();
    expect(drawAxis(r, TimeAxisStategy.AUTOMATIC).labels.map((l) => l.text)).toEqual(['-10', '0', '20']);
  });

  it('leaves a ruler with no straddle alone', () => {
    const r = ruler(tick('5'), tick('20'));
    r.ensureNotEmpty();
    expect(drawAxis(r, TimeAxisStategy.AUTOMATIC).labels.map((l) => l.text)).toEqual(['5', '20']);
  });
});

describe('TimingRuler empty and error paths', () => {
  it('has width 100 and height of one label when empty', () => {
    expect(ruler().getWidth()).toBe(100);
  });

  it('throws NoSuchElementException where Java reads first()/last() of no ticks', () => {
    const r = ruler();
    expect(() => r.getPosInPixel(tick('1'))).toThrow('java.util.NoSuchElementException');
    expect(() => r.drawTimeAxis(new RecordingUGraphic(oracleMeasurer()), TimeAxisStategy.AUTOMATIC, new Map())).toThrow(
      'java.lang.IllegalStateException',
    );
    r.scaleInPixels(10, 10);
    expect(() => r.drawVlines(new RecordingUGraphic(oracleMeasurer()), 10)).not.toThrow();
  });

  it('throws IllegalStateException when every tick is negative (cov-date-julian: @1500/01/01 and @1500/03/01)', () => {
    const r = ruler(
      TimingFormat.createDate(1500, 1, 1, TimingFormat.DATE),
      TimingFormat.createDate(1500, 3, 1, TimingFormat.DATE),
    );
    const ug = new RecordingUGraphic(oracleMeasurer());
    expect(() => r.drawTimeAxis(ug, TimeAxisStategy.AUTOMATIC, new Map())).toThrow('java.lang.IllegalStateException');
    expect(() => r.drawTimeAxis(ug, TimeAxisStategy.MANUAL, new Map())).toThrow('java.lang.IllegalStateException');
  });

  it('a single zero tick labels just 0', () => {
    const r = ruler(tick('0'));
    expect(drawAxis(r, TimeAxisStategy.AUTOMATIC).labels.map((l) => l.text)).toEqual(['0']);
  });
});

describe('TimingRuler tick units', () => {
  it('falls back to an approximate unit when the HCF is 1 and the width passes 4000', () => {
    const r = ruler(tick('1'), tick('2'), tick('10000'));
    // unit = round(1 + 50 * 9999 / 4000) = 126; width = (9999 / 126 + 1) * 50
    expect(r.getWidth()).toBeCloseTo((9999 / 126 + 1) * 50, 9);
    expect(r.getPosInPixel(tick('10000'))).toBeCloseTo((9999 / 126) * 50, 9);
  });

  it('keeps an HCF of 1 while the width stays under 4000', () => {
    const r = ruler(tick('0'), tick('1'), tick('2'));
    expect(r.getWidth()).toBe(150);
  });

  it('rounds fractional ticks with longValue for the unit and the labels (cov-relative-time: 0, 10, 15.5)', () => {
    const r = ruler(tick('0'), tick('10'), tick('15.5'));
    const axis = drawAxis(r, TimeAxisStategy.AUTOMATIC);
    expect(axis.tickXs).toEqual([0, 50, 100, 150, 200]);
    expect(axis.hline).toBe(200);
    expectLabels(axis, [
      ['0', 21.941],
      ['10', 118.881],
      ['15', 168.881],
    ]);
  });

  it('a forced unit labels every unit from the minimum (cov-scale-unit: 1 h as 100 pixels over 0:00:00..2:00:00)', () => {
    const r = ruler(tick('0', TimingFormat.HOUR), tick('7200', TimingFormat.HOUR));
    r.scaleInPixels(3600, 100);
    const axis = drawAxis(r, TimeAxisStategy.AUTOMATIC);
    expect(axis.tickXs).toEqual([0, 100, 200, 300]);
    expect(axis.hline).toBe(300);
    expectLabels(axis, [
      ['0:00:00', 6.678],
      ['1:00:00', 106.678],
      ['2:00:00', 206.678],
      ['3:00:00', 306.678],
    ]);
  });

  it('keeps zero between a forced unit across zero (negative minimum)', () => {
    const r = ruler(tick('-20'), tick('20'));
    r.scaleInPixels(10, 50);
    expect(drawAxis(r, TimeAxisStategy.AUTOMATIC).labels.map((l) => l.text)).toEqual([
      '-20',
      '-10',
      '0',
      '10',
      '20',
      '30',
    ]); // i = 0..nb, nb = 1 + 40 / 10
  });

  it('caps the grid at 1000 ticks', () => {
    const r = ruler(tick('0'), tick('1000000'));
    r.scaleInPixels(1, 1);
    expect(vlineXs(r, 1).xs.length).toBe(1001);
  });
});

describe('TimingRuler hour and date ticks', () => {
  it('HOUR ticks (cov-hour-time) label with h:mm:ss and size by the HCF of the seconds', () => {
    const r = ruler(tick('4500', TimingFormat.HOUR), tick('4800', TimingFormat.HOUR), tick('5430', TimingFormat.HOUR));
    expect(r.getWidth()).toBe(1600);
    expectLabels(drawAxis(r, TimeAxisStategy.AUTOMATIC), [
      ['1:15:00', 6.678],
      ['1:20:00', 506.678],
      ['1:30:30', 1556.678],
    ]);
  });

  it('DATE ticks (cov-date-time) label with MM/dd; a later DECIMAL tick keeps the date format', () => {
    const r = ruler(
      TimingFormat.createDate(2020, 7, 4, TimingFormat.DATE),
      TimingFormat.createDate(2020, 7, 10, TimingFormat.DATE),
      TimingFormat.createDate(2020, 7, 20, TimingFormat.DATE),
    );
    r.addTime(tick('1593820800'));
    expect(r.getWidth()).toBe(850);
    expectLabels(drawAxis(r, TimeAxisStategy.AUTOMATIC), [
      ['07/04', 11.25],
      ['07/10', 311.25],
      ['07/20', 811.25],
    ]);
  });

  it('an equal tick (1 and 1.0) is not added twice, yet a duplicate still sets the ruler format', () => {
    const r = ruler(tick('0'), tick('1'));
    r.addTime(tick('1.0', TimingFormat.HOUR));
    expect(r.getWidth()).toBe(100);
    expect(drawAxis(r, TimeAxisStategy.AUTOMATIC).labels.map((l) => l.text)).toEqual(['0:00:00', '0:00:01']);
  });
});

describe('TimingRuler manual axis', () => {
  it('(cov-manual-axis) draws a tick and a label per time, the rule from the first tick', () => {
    const axis = drawAxis(ruler(tick('0'), tick('100')), TimeAxisStategy.MANUAL);
    expect(axis.tickXs).toEqual([0, 50]);
    expect(axis.hline).toBe(100);
    expectLabels(axis, [
      ['0', 21.941],
      ['100', 65.822],
    ]);
  });

  it('prefers a code name when the code holds that very tick (identity, not value)', () => {
    const start = tick('0');
    const same = tick('100');
    const r = ruler(start, same);
    const codes = new Map<string, TimeTick>([
      ['start', start],
      ['lookalike', tick('100')],
    ]);
    expect(drawAxis(r, TimeAxisStategy.MANUAL, codes).labels.map((l) => l.text)).toEqual(['start', '100']);
  });

  it('reads codes in Java HashMap order when two codes name one tick', () => {
    const t = tick('0');
    const r = ruler(t, tick('100'));
    // "b".hashCode() = 98 < "a".hashCode() + 16 buckets: HashMap order is a (97 & 15 = 1) before b (98 & 15 = 2),
    // while the insertion order is b, a
    const codes = new Map<string, TimeTick>([
      ['b', t],
      ['a', t],
    ]);
    expect(drawAxis(r, TimeAxisStategy.MANUAL, codes).labels.map((l) => l.text)).toEqual(['a', '100']);
  });

  it('skips a tick whose label is empty (a code with an empty name)', () => {
    const t = tick('0');
    const r = ruler(t, tick('100'));
    const axis = drawAxis(r, TimeAxisStategy.MANUAL, new Map([['', t]]));
    expect(axis.labels.map((l) => l.text)).toEqual(['100']);
    expect(axis.tickXs).toEqual([0, 50]);
  });

  it('setStopAt is a no-op (WIP upstream)', () => {
    const r = ruler(tick('0'), tick('100'));
    r.setStopAt(tick('50'));
    expect(r.getWidth()).toBe(100);
  });
});
