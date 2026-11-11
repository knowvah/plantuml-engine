import { describe, expect, it } from 'vitest';

import { DeduceFormat } from '../../../src/diagrams/timing/DeduceFormat.js';

/** `DeduceFormatTest#testDeduceFormat` cases, `DeduceFormatTest.java:34-61` (`expected` undefined = `expectNull`). */
const DEDUCE_CASES: readonly (readonly [string, string | undefined])[] = [
  ['123456', 'DeduceFormat{forceSign=false, groupingSep=none, decimalSep=none, fractionDigits=0}'],
  ['1234,50', "DeduceFormat{forceSign=false, groupingSep=none, decimalSep=',', fractionDigits=2}"],
  ['+1234.50', "DeduceFormat{forceSign=true, groupingSep=none, decimalSep='.', fractionDigits=2}"],
  ['1,234.50', "DeduceFormat{forceSign=false, groupingSep=',', decimalSep='.', fractionDigits=2}"],
  ['1.234,50', "DeduceFormat{forceSign=false, groupingSep='.', decimalSep=',', fractionDigits=2}"],
  ['1 234,560', "DeduceFormat{forceSign=false, groupingSep=' ', decimalSep=',', fractionDigits=3}"],
  ["-2'000.00", "DeduceFormat{forceSign=false, groupingSep=''', decimalSep='.', fractionDigits=2}"],
  ['+42,00', "DeduceFormat{forceSign=true, groupingSep=none, decimalSep=',', fractionDigits=2}"],
  ['12 345,67', "DeduceFormat{forceSign=false, groupingSep=' ', decimalSep=',', fractionDigits=2}"],
  ["1_234'567,89", undefined],
  ['+42,000', "DeduceFormat{forceSign=true, groupingSep=none, decimalSep=',', fractionDigits=3}"],
  ["-2'000.1234", "DeduceFormat{forceSign=false, groupingSep=''', decimalSep='.', fractionDigits=4}"],
  ['12 345,6', "DeduceFormat{forceSign=false, groupingSep=' ', decimalSep=',', fractionDigits=1}"],
  ['1234,', "DeduceFormat{forceSign=false, groupingSep=none, decimalSep=',', fractionDigits=0}"],
];

/** `DeduceFormatTest#testFormatting` cases, `DeduceFormatTest.java:72-74`. */
const FORMAT_CASES: readonly (readonly [string, number, string])[] = [
  ['1234', 5678, '5678'],
  ['+123 456.91', 5678, '+5 678.00'],
  ['-123456,91', 5678, '5678,00'],
];

describe('DeduceFormatTest', () => {
  it.each(DEDUCE_CASES)('testDeduceFormat "%s"', (input, expected) => {
    const df = DeduceFormat.from(input);
    if (expected === undefined) expect(df).toBeUndefined();
    else expect(df?.toString()).toBe(expected);
  });

  it.each(FORMAT_CASES)('testFormatting from("%s").format(%d) = "%s"', (sample, value, expected) => {
    expect(DeduceFormat.from(sample)?.getDecimalFormat().format(value)).toBe(expected);
  });

  it('testMerge', () => {
    const format1 = DeduceFormat.from('123.45') as DeduceFormat;
    const format2 = DeduceFormat.from('123.4500') as DeduceFormat;
    const merged = format1.mergeWith(format2);
    expect(merged.toString()).toBe(
      "DeduceFormat{forceSign=false, groupingSep=none, decimalSep='.', minFractionDigits=2, maxFractionDigits=4}",
    );
    const df = merged.getDecimalFormat();
    expect(df.format(1)).toBe('1.00');
    expect(df.format(1.2)).toBe('1.20');
    expect(df.format(1.23)).toBe('1.23');
    expect(df.format(1.23456)).toBe('1.2346');
  });
});

describe('DeduceFormat beyond upstream tests', () => {
  it('mergeWith(null) returns this', () => {
    const f = DeduceFormat.from('1.5') as DeduceFormat;
    expect(f.mergeWith(undefined)).toBe(f);
  });

  it('merges sign, decimal and grouping like the Java', () => {
    const a = DeduceFormat.from('+1,234.5') as DeduceFormat;
    const b = DeduceFormat.from('1 234.5') as DeduceFormat;
    expect(a.mergeWith(b).toString()).toBe(
      "DeduceFormat{forceSign=true, groupingSep=none, decimalSep='.', fractionDigits=1}",
    );
    const none = DeduceFormat.from('12') as DeduceFormat; // all expectations below measured on the real DeduceFormat.java
    expect(none.mergeWith(a).toString()).toBe(
      "DeduceFormat{forceSign=true, groupingSep=',', decimalSep='.', minFractionDigits=0, maxFractionDigits=1}",
    );
    expect(a.mergeWith(none).toString()).toBe(
      "DeduceFormat{forceSign=true, groupingSep=',', decimalSep='.', minFractionDigits=0, maxFractionDigits=1}",
    );
  });

  it('drops a grouping separator equal to the merged decimal separator', () => {
    const a = DeduceFormat.from('1,5') as DeduceFormat; // decimal ','
    const b = DeduceFormat.from('1,234.5') as DeduceFormat; // grouping ',', decimal '.'
    expect(a.mergeWith(b).toString()).toBe(
      "DeduceFormat{forceSign=false, groupingSep=none, decimalSep=',', fractionDigits=1}",
    );
  });

  it('from("") throws like String#charAt(0)', () => {
    expect(() => DeduceFormat.from('')).toThrow(
      'java.lang.StringIndexOutOfBoundsException: Index 0 out of bounds for length 0',
    );
  });

  it('counts repeated separators and rejects a third distinct one (a valid hex float)', () => {
    expect(DeduceFormat.from('1,234,567.89')?.toString()).toBe(
      "DeduceFormat{forceSign=false, groupingSep=',', decimalSep='.', fractionDigits=2}",
    );
    expect(DeduceFormat.from('1,2.3.4')?.toString()).toBe(
      "DeduceFormat{forceSign=false, groupingSep=',', decimalSep='.', fractionDigits=2}",
    );
    expect(DeduceFormat.from('1e-5')?.toString()).toBe(
      "DeduceFormat{forceSign=false, groupingSep='e', decimalSep='-', fractionDigits=1}",
    );
    expect(DeduceFormat.from('0x1.8p1')).toBeUndefined();
  });
});
