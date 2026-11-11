import { describe, expect, it } from 'vitest';

import { BigDecimal } from '../../../src/core/decimal/BigDecimal.js';
import { UTranslate } from '../../../src/core/klimt/UTranslate.js';
import { XPoint2D } from '../../../src/core/klimt/geom/XPoint2D.js';
import { checkSimpleDateFormatPattern } from '../../../src/core/tim/builtin/date-format.js';
import { TimeAxisStategy } from '../../../src/diagrams/timing/TimeAxisStategy.js';
import { TimeTick } from '../../../src/diagrams/timing/TimeTick.js';
import { TimingFormat } from '../../../src/diagrams/timing/TimingFormat.js';
import { TimingStyle } from '../../../src/diagrams/timing/TimingStyle.js';
import { IntricatedPoint } from '../../../src/diagrams/timing/graphic/IntricatedPoint.js';

const CHICAGO = 'America/Chicago';
const AE = 'java.lang.ArithmeticException';

describe('TimingFormat identity', () => {
  it('DECIMAL, HOUR and DATE are distinct singletons and create() makes a fresh one', () => {
    expect(TimingFormat.DECIMAL).not.toBe(TimingFormat.HOUR);
    expect(TimingFormat.HOUR).not.toBe(TimingFormat.DATE);
    const a = TimingFormat.create({ pattern: 'yyyy', zone: 'UTC' });
    expect(a).not.toBe(TimingFormat.create({ pattern: 'yyyy', zone: 'UTC' }));
  });
});

describe('TimingFormat.formatTime', () => {
  it('DECIMAL prints toPlainString, scale included', () => {
    expect(TimingFormat.DECIMAL.formatTime(new BigDecimal('2.50'))).toBe('2.50');
    expect(TimingFormat.DECIMAL.formatTime(new BigDecimal('1E+3'))).toBe('1000');
    expect(TimingFormat.DECIMAL.formatTime(7)).toBe('7');
  });

  it('HOUR prints h:mm:ss (JDK String.format)', () => {
    expect(TimingFormat.HOUR.formatTime(4530)).toBe('1:15:30');
    expect(TimingFormat.HOUR.formatTime(new BigDecimal('4530'))).toBe('1:15:30');
    expect(TimingFormat.HOUR.formatTime(0)).toBe('0:00:00');
    expect(TimingFormat.HOUR.formatTime(-4530)).toBe('-1:-15:-30');
    expect(TimingFormat.HOUR.formatTime(-65)).toBe('0:-1:-5');
  });

  it('HOUR casts to int before the modulo (java:72)', () => {
    // (int) 4294967297L is 1, so seconds is 1 (not 4294967297 % 60 = 17)
    expect(TimingFormat.HOUR.formatTime(4_294_967_297)).toBe('1193046:28:01');
  });

  it('HOUR and DATE of a fractional BigDecimal throw ArithmeticException', () => {
    expect(() => TimingFormat.HOUR.formatTime(new BigDecimal('1.5'))).toThrow(`${AE}: Rounding necessary`);
    expect(() => TimingFormat.DATE.formatTime(new BigDecimal('1.5'))).toThrow(`${AE}: Rounding necessary`);
  });

  it('DATE prints MM/dd of the GMT date', () => {
    expect(TimingFormat.createDate(2020, 7, 4, TimingFormat.DATE).toString()).toBe('07/04');
    expect(TimingFormat.DATE.formatTime(0)).toBe('01/01');
  });

  it('the sdf path formats time * 1000 ms in its zone (cov-date-format, mekivo-95-xafe506)', () => {
    const yy = TimingFormat.create({ pattern: 'YY-MM-dd', zone: CHICAGO });
    expect(TimingFormat.createDate(2020, 7, 4, yy).toString()).toBe('20-07-03');
    expect(TimingFormat.createDate(2020, 7, 10, yy).toString()).toBe('20-07-09');
    const year = TimingFormat.create({ pattern: 'yyyy', zone: CHICAGO });
    expect(TimingFormat.createDate(1992, 1, 1, year).toString()).toBe('1991');
    expect(year.formatTime(new BigDecimal('694224000'))).toBe('1991');
  });
});

describe('TimingFormat.createDate', () => {
  it('returns a tick in the given format with the JDK seconds', () => {
    const tick = TimingFormat.createDate(2020, 7, 4, TimingFormat.DATE);
    expect(tick.getTime().toPlainString()).toBe('1593820800');
    expect(tick.getFormat()).toBe(TimingFormat.DATE);
  });

  it('is lenient: 2020/13/45 is 02/14 (cov-date-lenient)', () => {
    expect(TimingFormat.createDate(2020, 13, 45, TimingFormat.DATE).toString()).toBe('02/14');
  });

  it('is Julian before 1582-10-15 (cov-date-julian ticks are negative)', () => {
    const tick = TimingFormat.createDate(1500, 1, 1, TimingFormat.DATE);
    expect(tick.getTime().toPlainString()).toBe('-14830992000');
    expect(tick.getTime().signum()).toBe(-1);
  });
});

describe('TimeTick', () => {
  it('compares on time only, ignoring scale and format', () => {
    const a = new TimeTick(new BigDecimal('1'), TimingFormat.DECIMAL);
    const b = new TimeTick(new BigDecimal('1.0'), TimingFormat.HOUR);
    const c = new TimeTick(new BigDecimal('2'), TimingFormat.DECIMAL);
    expect(a.compareTo(b)).toBe(0);
    expect(a.compareTo(c)).toBe(-1);
    expect(c.compareTo(a)).toBe(1);
    expect(a).not.toBe(b);
  });

  it('toString formats through its format and exposes time and format', () => {
    const tick = new TimeTick(new BigDecimal('4530'), TimingFormat.HOUR);
    expect(tick.toString()).toBe('1:15:30');
    expect(tick.getTime().toPlainString()).toBe('4530');
    expect(tick.getFormat()).toBe(TimingFormat.HOUR);
  });
});

describe('simple types', () => {
  it('TimeAxisStategy and TimingStyle carry the Java constants in Java order', () => {
    expect(Object.values(TimeAxisStategy)).toEqual(['AUTOMATIC', 'HIDDEN', 'MANUAL']);
    expect(Object.values(TimingStyle)).toEqual(['ROBUST', 'CONCISE', 'RECTANGLE']);
  });

  it('IntricatedPoint translates both points', () => {
    const p = new IntricatedPoint(new XPoint2D(1, 2), new XPoint2D(3, 4)).translated(new UTranslate(10, 20));
    expect([p.getPointA().x, p.getPointA().y, p.getPointB().x, p.getPointB().y]).toEqual([11, 22, 13, 24]);
  });
});

describe('checkSimpleDateFormatPattern', () => {
  it.each(['yyyy', 'YY-MM-dd', "'q'", "'it''s'", 'é', 'HH:mm:ss.SSS Z'])('accepts %s', (pattern) => {
    expect(checkSimpleDateFormatPattern(pattern)).toBeUndefined();
  });

  it('rejects an unquoted letter outside GyMdkHmsSEDFwWahKzZYuXL', () => {
    expect(() => checkSimpleDateFormatPattern('qq')).toThrow(
      new Error("java.lang.IllegalArgumentException: Illegal pattern character 'q'"),
    );
    expect(() => checkSimpleDateFormatPattern("q'")).toThrow("Illegal pattern character 'q'");
    expect(() => checkSimpleDateFormatPattern('B')).toThrow("Illegal pattern character 'B'");
  });

  it('rejects an unterminated quote', () => {
    expect(() => checkSimpleDateFormatPattern("'abc")).toThrow(
      new Error('java.lang.IllegalArgumentException: Unterminated quote'),
    );
  });
});
