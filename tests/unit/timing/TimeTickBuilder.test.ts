import { describe, expect, it } from 'vitest';

import { RegexConcat } from '../../../src/core/regex/RegexConcat.js';
import { RegexLeaf } from '../../../src/core/regex/RegexLeaf.js';
import type { RegexResult } from '../../../src/core/regex/RegexResult.js';
import type { Clocks } from '../../../src/diagrams/timing/Clocks.js';
import type { TimeTick } from '../../../src/diagrams/timing/TimeTick.js';
import { TimingFormat } from '../../../src/diagrams/timing/TimingFormat.js';
import { TimeTickBuilder } from '../../../src/diagrams/timing/command/TimeTickBuilder.js';
import { tick } from './helpers/timing.js';

const NAME = 'T';
const NFE = 'java.lang.NumberFormatException';

/** A `Clocks` over fixed data; every read is recorded. */
function clocks(now: TimeTick | null = tick('10')): Clocks & { reads: string[] } {
  const reads: string[] = [];
  const codes = new Map([
    ['start', tick('20')],
    ['hours', tick('3600', TimingFormat.HOUR)],
  ]);
  return {
    reads,
    getNow: () => now ?? undefined,
    getClockValue: (clockName, nb) => {
      reads.push(`clock ${clockName}*${nb}`);
      return tick(String(nb * 7));
    },
    getCodeValue: (code) => {
      reads.push(`code ${code}`);
      return codes.get(code);
    },
    getTimingFormatDate: () => TimingFormat.DATE,
  };
}

function match(source: string): RegexResult {
  const regex = RegexConcat.build(
    'tick',
    RegexLeaf.start(),
    TimeTickBuilder.expressionAtWithArobase(NAME),
    RegexLeaf.end(),
  );
  const result = regex.matcher(source);
  if (result === undefined) throw new Error(`no match: ${source}`);
  return result;
}

function parse(source: string, clock: Clocks = clocks()): TimeTick | undefined {
  return TimeTickBuilder.parseTimeTick(NAME, match(source), clock);
}

function shown(t: TimeTick | undefined): string | undefined {
  return (
    t &&
    `${t.getTime().toPlainString()}|${t.toString()}|${t.getFormat() === TimingFormat.DECIMAL ? 'dec' : t.getFormat() === TimingFormat.HOUR ? 'hour' : 'other'}`
  );
}

describe('TimeTickBuilder grammar', () => {
  it.each([
    ['@:start', 'CODE'],
    ['@:start+3', 'CODE'],
    ['@2020/07/04', 'DATE'],
    ['@1:15:00', 'HOUR'],
    ['@100', 'DIGIT'],
    ['@+5.5', 'DIGIT'],
    ['@-10', 'DIGIT'],
    ['@clk*2', 'CLOCK'],
    ['@:a.b_c1', 'CODE'],
  ])('%s matches the %s alternative', (source, which) => {
    const result = match(source);
    const alternatives = ['CODE', 'DATE', 'HOUR', 'DIGIT', 'CLOCK'];
    expect(alternatives.filter((a) => result.get(`${NAME}${a}`, 0) !== undefined)).toEqual([which]);
  });

  it('refuses a time without the arobase and one that is not a time', () => {
    const regex = RegexConcat.build(
      'tick',
      RegexLeaf.start(),
      TimeTickBuilder.expressionAtWithArobase(NAME),
      RegexLeaf.end(),
    );
    expect(regex.matcher('100')).toBeUndefined();
    expect(regex.matcher('@12:30')).toBeUndefined();
    expect(regex.matcher('@')).toBeUndefined();
  });

  it('the without-arobase form has no @ and the optional form may match nothing', () => {
    const bare = RegexConcat.build(
      'bare',
      RegexLeaf.start(),
      TimeTickBuilder.expressionAtWithoutArobase(NAME),
      RegexLeaf.end(),
    );
    expect(bare.matcher('100')?.get(`${NAME}DIGIT`, 1)).toBe('100');
    expect(bare.matcher('@100')).toBeUndefined();
    const optional = RegexConcat.build(
      'opt',
      RegexLeaf.start(),
      TimeTickBuilder.optionalExpressionAtWithArobase(NAME),
      RegexLeaf.end(),
    );
    expect(optional.matcher('')?.get(`${NAME}DIGIT`, 1)).toBeUndefined();
    expect(optional.matcher('@7')?.get(`${NAME}DIGIT`, 1)).toBe('7');
  });
});

describe('TimeTickBuilder.parseTimeTick', () => {
  it('@:start+3 is the code tick plus 3, as DECIMAL', () => {
    const c = clocks();
    expect(shown(parse('@:start+3', c))).toBe('23|23|dec');
    expect(c.reads).toEqual(['code start']);
  });

  it('@:start-1.5 keeps the scale of the delta', () => {
    expect(shown(parse('@:start-1.5'))).toBe('18.5|18.5|dec');
  });

  it('@:start is the code tick itself (same object, own format)', () => {
    const c = clocks();
    const t = parse('@:hours', c);
    expect(shown(t)).toBe('3600|1:00:00|hour');
    expect(parse('@:hours', c)).toBe(parse('@:hours', c));
  });

  it('an unknown code is null, and null plus a delta is a NullPointerException', () => {
    expect(parse('@:nope')).toBeUndefined();
    expect(() => parse('@:nope+1')).toThrow('java.lang.NullPointerException');
  });

  it('a code delta of "+." reaches new BigDecimal and throws NumberFormatException (D7)', () => {
    expect(() => parse('@:start+.')).toThrow(`${NFE}: No digits found.`);
  });

  it('@clk*2 reads the clock value', () => {
    const c = clocks();
    expect(shown(parse('@clk*2', c))).toBe('14|14|dec');
    expect(c.reads).toEqual(['clock clk*2']);
  });

  it('@1:15:00 is 4500 seconds in the HOUR format', () => {
    expect(shown(parse('@1:15:00'))).toBe('4500|1:15:00|hour');
    expect(shown(parse('@0:0:0'))).toBe('0|0:00:00|hour');
  });

  it('HOUR uses int arithmetic: it wraps like Java and rejects an int overflow', () => {
    expect(shown(parse('@1000000:5:7'))?.split('|')[0]).toBe('-694966989');
    expect(shown(parse('@0:99:99'))?.split('|')[0]).toBe('6039');
    expect(() => parse('@1:2:99999999999')).toThrow(`${NFE}: For input string: "99999999999"`);
  });

  it("@2020/07/04 is a date tick in the diagram's date format", () => {
    const t = parse('@2020/07/04');
    expect(t?.getTime().toPlainString()).toBe('1593820800');
    expect(t?.getFormat()).toBe(TimingFormat.DATE);
    expect(t?.toString()).toBe('07/04');
  });

  it('@2020/13/45 stays lenient', () => {
    expect(parse('@2020/13/45')?.toString()).toBe('02/14');
  });

  it('plain numbers keep their scale, sign and a trailing point', () => {
    expect(shown(parse('@100'))).toBe('100|100|dec');
    expect(shown(parse('@2.50'))).toBe('2.50|2.50|dec');
    expect(shown(parse('@-10'))).toBe('-10|-10|dec');
    expect(shown(parse('@5.'))).toBe('5|5|dec');
  });

  it('@+5.5 and @+10 are relative to now (cov-relative-time: 10 then 15.5)', () => {
    expect(shown(parse('@+5.5'))).toBe('15.5|15.5|dec');
    expect(shown(parse('@+0'))).toBe('10|10|dec');
  });

  it('a relative time with no now is the plain number', () => {
    expect(shown(parse('@+5.5', clocks(null)))).toBe('5.5|5.5|dec');
  });

  it('a match with no time at all is now', () => {
    const now = tick('10');
    const optional = RegexConcat.build(
      'opt',
      RegexLeaf.start(),
      TimeTickBuilder.optionalExpressionAtWithArobase(NAME),
      RegexLeaf.end(),
    );
    const result = optional.matcher('') as RegexResult;
    expect(TimeTickBuilder.parseTimeTick(NAME, result, clocks(now))).toBe(now);
  });

  it('rejects a clock number past the int range', () => {
    expect(() => parse('@clk*99999999999')).toThrow(`${NFE}: For input string: "99999999999"`);
  });
});
