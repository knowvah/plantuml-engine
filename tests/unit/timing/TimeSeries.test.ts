import { describe, expect, it } from 'vitest';

import { BigDecimal } from '../../../src/core/decimal/BigDecimal.js';
import { TimeSeries } from '../../../src/diagrams/timing/TimeSeries.js';
import { TimeTick } from '../../../src/diagrams/timing/TimeTick.js';
import type { TimingFormat } from '../../../src/diagrams/timing/TimingFormat.js';

/** `TimeSeriesTest#tt`: `new TimeTick(BigDecimal.valueOf(t), null)`; Java passes a null format, never read here. */
function tt(t: number): TimeTick {
  return new TimeTick(BigDecimal.valueOfDouble(t), null as unknown as TimingFormat);
}

function assertAlmostEquals(expected: number, actual: number): void {
  expect(Math.abs(expected - actual)).toBeLessThanOrEqual(1e-12);
}

describe('TimeSeriesTest', () => {
  it('testPutAndGet', () => {
    const ts = new TimeSeries();
    ts.put(tt(1.0), 42.0);
    ts.put(tt(2.0), -3.5);
    expect(ts.get(tt(1.0))).toBe(42.0);
    expect(ts.get(tt(2.0))).toBe(-3.5);
    expect(ts.get(tt(3.0))).toBeUndefined();
  });

  it('testMinMaxWithoutOverrides', () => {
    const ts = new TimeSeries();
    assertAlmostEquals(0.0, ts.getMin());
    assertAlmostEquals(10.0, ts.getMax());
    ts.put(tt(1), 2.0);
    ts.put(tt(2), 5.0);
    assertAlmostEquals(0.0, ts.getMin());
    assertAlmostEquals(5.0, ts.getMax());
    ts.put(tt(3), -7.0);
    assertAlmostEquals(-7.0, ts.getMin());
    assertAlmostEquals(5.0, ts.getMax());
    const tsNeg = new TimeSeries();
    tsNeg.put(tt(1), -1.0);
    tsNeg.put(tt(2), -3.0);
    assertAlmostEquals(-3.0, tsNeg.getMin());
    assertAlmostEquals(10.0, tsNeg.getMax());
  });

  it('testMinMaxWithOverrides', () => {
    const ts = new TimeSeries();
    ts.put(tt(1), -2.0);
    ts.put(tt(2), 8.0);
    ts.setBounds('1.0', '9.5');
    expect(Math.abs(ts.getMin() - 1.0)).toBeLessThanOrEqual(1e-12);
    expect(Math.abs(ts.getMax() - 9.5)).toBeLessThanOrEqual(1e-12);
    expect(ts.getDisplayValue(1.0)).toBe('1.0');
    expect(ts.getDisplayValue(9.5)).toBe('9.5');
  });

  it('testDisplayValueFormatting', () => {
    const ts = new TimeSeries();
    expect(ts.getDisplayValue(3.0)).toBe('3.0');
    expect(ts.getDisplayValue(3.5)).toBe('3.5');
    expect(ts.getDisplayValue(0.0)).toBe('0.0');
    expect(ts.getDisplayValue(-2.0)).toBe('-2.0');
  });

  it('testGetValueAtExactTick', () => {
    const ts = new TimeSeries();
    ts.put(tt(0), 0.0);
    ts.put(tt(10), 10.0);
    assertAlmostEquals(0.0, ts.getValueAt(tt(0)));
    assertAlmostEquals(10.0, ts.getValueAt(tt(10)));
  });

  it('testGetValueAtInterpolation', () => {
    const ts = new TimeSeries();
    ts.put(tt(0), 0.0);
    ts.put(tt(10), 10.0);
    assertAlmostEquals(5.0, ts.getValueAt(tt(5)));
    assertAlmostEquals(2.0, ts.getValueAt(tt(2)));
  });

  it('testGetValueAtBeforeFirst', () => {
    const ts = new TimeSeries();
    ts.put(tt(10), 7.0);
    ts.put(tt(20), 12.0);
    assertAlmostEquals(7.0, ts.getValueAt(tt(5)));
  });

  it('testGetValueAtAfterLast', () => {
    const ts = new TimeSeries();
    ts.put(tt(1), 2.0);
    ts.put(tt(3), 6.0);
    assertAlmostEquals(6.0, ts.getValueAt(tt(4)));
  });

  it('testGetValueAtEmptySeries', () => {
    const ts = new TimeSeries();
    expect(() => ts.getValueAt(tt(0))).toThrow('NullPointerException');
  });
});

describe('TimeSeries beyond upstream tests', () => {
  it('a put at an equal tick (1 and 1.0) keeps the first key and takes the new value (D6)', () => {
    const ts = new TimeSeries();
    const first = tt(1);
    ts.put(first, 1);
    ts.put(new TimeTick(new BigDecimal('1.00'), null as unknown as TimingFormat), 9);
    expect(ts.entrySet().length).toBe(1);
    expect(ts.entrySet()[0]?.key).toBe(first);
    expect(ts.values()).toEqual([9]);
  });

  it('keeps entries in tick order whatever the insertion order', () => {
    const ts = new TimeSeries();
    ts.put(tt(5), 50);
    ts.put(tt(1), 10);
    ts.put(tt(3), 30);
    expect(ts.entrySet().map((e) => e.key.getTime().toPlainString())).toEqual(['1.0', '3.0', '5.0']);
    expect(ts.values()).toEqual([10, 30, 50]);
  });

  it('bounds rejects a non-number like Double.parseDouble, keeping the min parsed first', () => {
    const ts = new TimeSeries();
    expect(() => ts.setBounds('x', '1')).toThrow('java.lang.NumberFormatException: For input string: "x"');
    expect(() => ts.setBounds('2', ' ')).toThrow('java.lang.NumberFormatException: empty String');
    expect(ts.getMin()).toBe(2);
  });

  it('a min that is a valid double with three separators (hex float) is a NullPointerException', () => {
    const ts = new TimeSeries();
    ts.setBounds('1', '2');
    expect(ts.getMax()).toBe(2);
    expect(() => new TimeSeries().setBounds('0x1.8p1', '1')).toThrow('NullPointerException');
    // a max DeduceFormat rejects is tolerated: mergeWith(null) returns this
    const tolerant = new TimeSeries();
    tolerant.setBounds('1.5', '0x1.8p1');
    expect(tolerant.getDisplayValue(3)).toBe('3.0');
  });

  it('labels the analog probes: cov-analog axis (-4.5..6.5 and none) and cov-ticks-every', () => {
    const vcc = new TimeSeries();
    vcc.setBounds('-4.5', '6.5');
    expect([-3, 0, 3, 6].map((v) => vcc.getDisplayValue(v))).toEqual(['-3.0', '0.0', '3.0', '6.0']);
    const vdd = new TimeSeries();
    expect([0, 6].map((v) => vdd.getDisplayValue(v))).toEqual(['0.0', '6.0']);
    expect([0, 2, 4].map((v) => vdd.getDisplayValue(v))).toEqual(['0.0', '2.0', '4.0']);
  });

  it('HALF_EVEN under a 0.00 bound: 0.125 -> 0.12 and 0.135 -> 0.14', () => {
    const ts = new TimeSeries();
    ts.setBounds('0.00', '1.00');
    expect(ts.getDisplayValue(0.125)).toBe('0.12');
    expect(ts.getDisplayValue(0.135)).toBe('0.14');
  });
});
