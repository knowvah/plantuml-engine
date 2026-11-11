import { describe, expect, it } from 'vitest';

import { DecimalFormat, type DecimalFormatSpec } from '../../../src/diagrams/timing/decimal-format.js';

function fmt(spec: Partial<DecimalFormatSpec>): DecimalFormat {
  return new DecimalFormat({
    forceSign: false,
    groupingSeparator: undefined,
    decimalSeparator: '.',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
    ...spec,
  });
}

const TWO = { minimumFractionDigits: 2, maximumFractionDigits: 2 };

/** Every row measured on JDK 21.0.1 `java.text.DecimalFormat` with `DeduceFormat#getDecimalFormat`'s construction. */
describe('DecimalFormat (HALF_EVEN, JDK 21 values)', () => {
  it.each([
    [0.125, '0.12'],
    [0.135, '0.14'],
    [-0.125, '-0.12'],
    [0, '0.00'],
    [-0, '-0.00'],
    [0.5, '0.50'],
    [1234567.891, '1234567.89'],
    [-1234567.891, '-1234567.89'],
    [1e-7, '0.00'],
    [-1e-7, '-0.00'],
    [0.001, '0.00'],
    [-0.001, '-0.00'],
    [1.005, '1.00'],
    [999.995, '1000.00'],
    [1e21, '1000000000000000000000.00'],
    [123456789012345678, '123456789012345680.00'],
    [4.9e-324, '0.00'],
    [0.005, '0.01'],
    [0.015, '0.01'],
    [0.025, '0.03'],
    [0.045, '0.04'],
    [0.055, '0.06'],
    [2.675, '2.67'],
    [0.995, '0.99'],
    [9.995, '9.99'],
  ])('0.00 of %d is %s', (value, expected) => {
    expect(fmt(TWO).format(value)).toBe(expected);
  });

  it('0 digits rounds half-even and keeps the sign of a negative zero', () => {
    const f = fmt({});
    expect(['0.5', '1.5', '2.5', '-2.5', '-0.5', '999.995'].map((s) => f.format(Number(s)))).toEqual([
      '0',
      '2',
      '2',
      '-2',
      '-0',
      '1000',
    ]);
    expect(f.format(1e300)).toBe(`1${'0'.repeat(300)}`);
  });

  it('prints NaN and infinities with the Locale.US symbols', () => {
    const f = fmt(TWO);
    expect([Number.NaN, Infinity, -Infinity].map((v) => f.format(v))).toEqual(['NaN', '∞', '-∞']);
  });

  it('a + pattern gives a -+ negative prefix', () => {
    const f = fmt({ ...TWO, forceSign: true });
    expect([0, -0, 0.125, -0.125, 5678, Infinity, -Infinity, Number.NaN].map((v) => f.format(v))).toEqual([
      '+0.00',
      '-+0.00',
      '+0.12',
      '-+0.12',
      '+5678.00',
      '+∞',
      '-+∞',
      'NaN',
    ]);
  });

  it('groups in threes with the symbol separator', () => {
    const f = fmt({ ...TWO, groupingSeparator: ',' });
    expect([1234567.891, 5678, 999.995, 1e21, 0].map((v) => f.format(v))).toEqual([
      '1,234,567.89',
      '5,678.00',
      '1,000.00',
      '1,000,000,000,000,000,000,000.00',
      '0.00',
    ]);
    expect(fmt({ ...TWO, forceSign: true, groupingSeparator: ' ' }).format(-1234567.891)).toBe('-+1 234 567.89');
  });

  it('uses a replaced decimal separator, with grouping when asked', () => {
    expect(fmt({ ...TWO, decimalSeparator: ',' }).format(-1234567.891)).toBe('-1234567,89');
    const f = fmt({
      minimumFractionDigits: 0,
      maximumFractionDigits: 3,
      groupingSeparator: '.',
      decimalSeparator: ',',
    });
    expect([0.125, 5678, 1234567.891, 0, 1e-7, 999.995].map((v) => f.format(v))).toEqual([
      '0,125',
      '5.678',
      '1.234.567,891',
      '0',
      '0',
      '999,995',
    ]);
  });

  it('shows between min and max fraction digits', () => {
    const f = fmt({ minimumFractionDigits: 2, maximumFractionDigits: 4 });
    expect([0.125, 1.005, 0.1, 0.001, 5678, 999.995].map((v) => f.format(v))).toEqual([
      '0.125',
      '1.005',
      '0.10',
      '0.001',
      '5678.00',
      '999.995',
    ]);
  });

  it('caps the fraction digits at 340 like format(double)', () => {
    const f = fmt({ minimumFractionDigits: 0, maximumFractionDigits: 400 });
    expect(f.format(0.1)).toBe('0.1');
  });

  it('decides a tie on the exact binary value of a subnormal (JDK 21)', () => {
    const f = fmt({ minimumFractionDigits: 1, maximumFractionDigits: 323 });
    expect(f.format(4.9e-324)).toBe('0.0');
    expect(f.format(1.5e-323)).toBe(`0.${'0'.repeat(322)}1`);
    expect(f.format(2.5e-323)).toBe(`0.${'0'.repeat(322)}2`);
  });
});
