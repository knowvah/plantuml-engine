/**
 * Java's number text: `String.format` for `%.Nf`, `%.Ne` and `%d`, and
 * `Double.parseDouble`'s grammar (cep D4). The expected strings are Java's,
 * the first two `javaFormatE` rows as the jar printed them in the planning probe.
 */
import { describe, expect, it } from 'vitest';
import {
  isLongValued,
  javaDoubleToString,
  javaFormatE,
  javaFormatF,
  javaFormatLong,
  javaTrim,
  parseDouble,
} from '../../../src/core/java-number-format.js';

describe('javaFormatF', () => {
  it.each([
    [1.005, 2, '1.01'],
    [12.5, 0, '13'],
    [0, 2, '0.00'],
    [-0, 2, '-0.00'],
    [-0.001, 2, '-0.00'],
    [Number.NaN, 2, 'NaN'],
    [Number.POSITIVE_INFINITY, 2, 'Infinity'],
    [Number.NEGATIVE_INFINITY, 2, '-Infinity'],
    [1e22, 2, '10000000000000000000000.00'],
    [1.5e30, 1, '1500000000000000000000000000000.0'],
    [1e-7, 2, '0.00'],
    [5e-7, 6, '0.000001'],
  ])('(%s, %i) prints %s', (value, decimals, expected) => {
    expect(javaFormatF(value, decimals)).toBe(expected);
  });
});

describe('javaFormatE', () => {
  it.each([
    [0.001, 2, '1.00e-03'],
    [0.0025, 2, '2.50e-03'],
    [-0.00123, 2, '-1.23e-03'],
    [0.009995, 2, '1.00e-02'],
    [1e-100, 2, '1.00e-100'],
    [12345, 1, '1.2e+04'],
    [0, 2, '0.00e+00'],
    [Number.NaN, 2, 'NaN'],
    [Number.NEGATIVE_INFINITY, 2, '-Infinity'],
  ])('(%s, %i) prints %s', (value, decimals, expected) => {
    expect(javaFormatE(value, decimals)).toBe(expected);
  });
});

describe('javaFormatLong and isLongValued', () => {
  it.each([
    [5, '5'],
    [-5.9, '-5'],
    [-0, '0'],
    [2 ** 53, '9007199254740992'],
    [2 ** 63, '9223372036854775807'],
    [1e30, '9223372036854775807'],
    [-1e30, '-9223372036854775808'],
    [Number.NaN, '0'],
  ])('(long) %s prints %s', (value, expected) => {
    expect(javaFormatLong(value)).toBe(expected);
  });

  it.each([
    [5, true],
    [5.5, false],
    [-0, true],
    [2 ** 63, true],
    [1e30, false],
    [Number.NaN, false],
    [Number.POSITIVE_INFINITY, false],
  ])('%s == (long) %s is %s', (value, expected) => {
    expect(isLongValued(value)).toBe(expected);
  });
});

describe('parseDouble', () => {
  it.each([
    ['1', 1],
    ['1d', 1],
    ['1.5f', 1.5],
    ['1.', 1],
    ['.5', 0.5],
    ['1e3', 1000],
    ['+2.5D', 2.5],
    [' 7 ', 7],
    ['NaN', Number.NaN],
    ['-Infinity', Number.NEGATIVE_INFINITY],
    ['0x1p3', 8],
    ['-0X1.8P1', -3],
    ['0x.8p0f', 0.5],
    ['0x1.p1', 2],
  ])('reads %j as %s', (text, expected) => {
    expect(parseDouble(text)).toBe(expected);
  });

  it.each(['', ' ', '0x10', '1.2.3', 'nan', 'infinity', '.', 'e5', '1e', '0xp1', '1_000', ' 1'])(
    'reports %j as a failure where Number would answer or differ',
    (text) => {
      expect(parseDouble(text)).toBeUndefined();
    },
  );
});

describe('javaDoubleToString', () => {
  it.each([
    [12, '12.0'],
    [0, '0.0'],
    [-0, '-0.0'],
    [10.5, '10.5'],
    [-3.25, '-3.25'],
    [0.001, '0.001'],
    [0.0001, '1.0E-4'],
    [1e7, '1.0E7'],
    [1.5e10, '1.5E10'],
    [-2.5e-5, '-2.5E-5'],
    [9999999, '9999999.0'],
    [Number.NaN, 'NaN'],
    [Number.POSITIVE_INFINITY, 'Infinity'],
  ])('(%s) prints %s', (value, expected) => {
    expect(javaDoubleToString(value)).toBe(expected);
  });
});

describe('javaTrim', () => {
  it('strips only up to U+0020', () => {
    expect(javaTrim('\u0001 a \t')).toBe('a');
    expect(javaTrim(' a ')).toBe(' a ');
    expect(javaTrim(' a')).toBe(' a');
  });
});
