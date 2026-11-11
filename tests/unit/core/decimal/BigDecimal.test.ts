import { describe, expect, it } from 'vitest';

import { BigDecimal } from '../../../../src/core/decimal/BigDecimal.js';

const NFE = 'java.lang.NumberFormatException';
const AE = 'java.lang.ArithmeticException';

/** [source, toString, toPlainString, doubleValue, longValue, signum] -- every value measured on JDK 21.0.1. */
const JDK_ROWS: readonly (readonly [string, string, string, number, number, number])[] = [
  ['2.50', '2.50', '2.50', 2.5, 2, 1],
  ['1', '1', '1', 1, 1, 1],
  ['1.0', '1.0', '1.0', 1, 1, 1],
  ['+.5', '0.5', '0.5', 0.5, 0, 1],
  ['5.', '5', '5', 5, 5, 1],
  ['1E+3', '1E+3', '1000', 1000, 1000, 1],
  ['1e3', '1E+3', '1000', 1000, 1000, 1],
  ['1.5E-7', '1.5E-7', '0.00000015', 1.5e-7, 0, 1],
  ['0.0000001', '1E-7', '0.0000001', 1e-7, 0, 1],
  ['0.000001', '0.000001', '0.000001', 1e-6, 0, 1],
  ['123E-2', '1.23', '1.23', 1.23, 1, 1],
  ['-0.00', '0.00', '0.00', 0, 0, 0],
  ['0E+3', '0E+3', '0', 0, 0, 0],
  ['1.0E10', '1.0E+10', '10000000000', 1e10, 10_000_000_000, 1],
  ['007', '7', '7', 7, 7, 1],
  ['-1.5', '-1.5', '-1.5', -1.5, -1, -1],
  ['-2.7', '-2.7', '-2.7', -2.7, -2, -1],
  ['1e-2', '0.01', '0.01', 0.01, 0, 1],
];

describe('BigDecimal(String) against the JDK', () => {
  it.each(JDK_ROWS)('%s', (source, str, plain, dbl, lng, sig) => {
    const b = new BigDecimal(source);
    expect(b.toString()).toBe(str);
    expect(b.toPlainString()).toBe(plain);
    expect(b.doubleValue()).toBe(dbl);
    expect(b.longValue()).toBe(lng);
    expect(b.signum()).toBe(sig);
  });

  it('compareTo ignores scale: 1 and 1.0 are equal', () => {
    expect(new BigDecimal('1').compareTo(new BigDecimal('1.0'))).toBe(0);
    expect(new BigDecimal('1E+3').compareTo(new BigDecimal('1000'))).toBe(0);
  });

  it('compareTo orders by value', () => {
    expect(new BigDecimal('-10').compareTo(new BigDecimal('0'))).toBe(-1);
    expect(new BigDecimal('2.5').compareTo(new BigDecimal('2.25'))).toBe(1);
  });

  it('longValue wraps to the low 64 bits like the JDK', () => {
    expect(new BigDecimal('1E+30').longValue()).toBe(Number(5_076_944_270_305_263_616n));
  });
});

describe('BigDecimal longValueExact', () => {
  it('returns integral values, including a negative scale', () => {
    expect(new BigDecimal('1E+3').longValueExact()).toBe(1000);
    expect(new BigDecimal('2.00').longValueExact()).toBe(2);
    expect(new BigDecimal('0.00').longValueExact()).toBe(0);
    expect(new BigDecimal('-7').longValueExact()).toBe(-7);
  });

  it('throws ArithmeticException "Rounding necessary" on a fraction', () => {
    expect(() => new BigDecimal('2.5').longValueExact()).toThrow(`${AE}: Rounding necessary`);
    expect(() => new BigDecimal('+.5').longValueExact()).toThrow(`${AE}: Rounding necessary`);
  });

  it('throws ArithmeticException "Overflow" beyond the long range', () => {
    expect(() => new BigDecimal('9223372036854775808').longValueExact()).toThrow(`${AE}: Overflow`);
    expect(() => new BigDecimal('1E+30').longValueExact()).toThrow(`${AE}: Overflow`);
    expect(() => new BigDecimal('12345678901234567890.5').longValueExact()).toThrow(`${AE}: Overflow`);
  });
});

describe('BigDecimal constructor errors (JDK 21 messages)', () => {
  it.each([
    ['-.', `${NFE}: No digits found.`],
    ['+', `${NFE}: No digits found.`],
    ['e5', `${NFE}: No digits found.`],
    ['', NFE],
    ['1e', NFE],
    ['1e+', NFE],
    ['1.e', NFE],
    ['1.2.3', `${NFE}: Character array contains more than one decimal point.`],
    ['abc', `${NFE}: Character a is neither a decimal digit number, decimal point, nor "e" notation exponential mark.`],
    [' 1', `${NFE}: Character   is neither a decimal digit number, decimal point, nor "e" notation exponential mark.`],
    ['1e5.5', `${NFE}: Not a digit.`],
    ['1e99999999999', `${NFE}: Too many nonzero exponent digits.`],
  ])('rejects %j', (source, message) => {
    expect(() => new BigDecimal(source)).toThrow(new Error(message));
  });

  it('rejects a scale outside the int range', () => {
    expect(() => new BigDecimal('0.1E-2147483648')).toThrow(NFE);
  });
});

describe('BigDecimal factories and arithmetic', () => {
  it('ZERO is zero with scale 0', () => {
    expect(BigDecimal.ZERO.toString()).toBe('0');
    expect(BigDecimal.ZERO.signum()).toBe(0);
  });

  it('valueOf(long) has scale 0', () => {
    expect(BigDecimal.valueOf(4530).toPlainString()).toBe('4530');
    expect(BigDecimal.valueOf(-3).toString()).toBe('-3');
  });

  it('valueOf(long) rejects a non-integer', () => {
    expect(() => BigDecimal.valueOf(1.5)).toThrow(RangeError);
  });

  it('valueOfDouble follows Double.toString', () => {
    expect(BigDecimal.valueOfDouble(1).toString()).toBe('1.0');
    expect(BigDecimal.valueOfDouble(1e10).toString()).toBe('1.0E+10');
    expect(BigDecimal.valueOfDouble(0.001).toString()).toBe('0.001');
    expect(BigDecimal.valueOfDouble(1.5e-7).toString()).toBe('1.5E-7');
    expect(BigDecimal.valueOfDouble(123_456_789).toString()).toBe('123456789');
    expect(BigDecimal.valueOfDouble(-2.7).toString()).toBe('-2.7');
  });

  it('valueOfDouble rejects NaN and infinity like the JDK', () => {
    expect(() => BigDecimal.valueOfDouble(Number.NaN)).toThrow(`${NFE}: Infinite or NaN`);
    expect(() => BigDecimal.valueOfDouble(Number.POSITIVE_INFINITY)).toThrow(`${NFE}: Infinite or NaN`);
  });

  it('add keeps the larger scale', () => {
    expect(new BigDecimal('2.5').add(new BigDecimal('1.25')).toString()).toBe('3.75');
    expect(new BigDecimal('1E+3').add(new BigDecimal('1')).toString()).toBe('1001');
  });

  it('multiply sums the scales', () => {
    expect(new BigDecimal('1.5').multiply(new BigDecimal('2.00')).toString()).toBe('3.000');
  });
});
