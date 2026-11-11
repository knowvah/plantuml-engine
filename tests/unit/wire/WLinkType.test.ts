import { describe, expect, it } from 'vitest';
import { WLinkType } from '../../../src/diagrams/wire/WLinkType.js';

describe('WLinkType.from (WLinkType.java:42-50)', () => {
  it.each(['->', '<->', '<-', '-', '-->', '<-->', '<--', '--'])('%s is NORMAL', (style) => {
    expect(WLinkType.from(style)).toBe(WLinkType.NORMAL);
  });

  it.each(['=>', '<=>', '<=', '=', '==>', '<==>', '<==', '=='])('%s is BUS', (style) => {
    expect(WLinkType.from(style)).toBe(WLinkType.BUS);
  });

  it('prefers "-" over "=" (java:43 tests "-" first)', () => {
    expect(WLinkType.from('-=')).toBe(WLinkType.NORMAL);
  });

  it('throws IllegalArgumentException for neither', () => {
    expect(() => WLinkType.from('<>')).toThrow('IllegalArgumentException');
  });
});

describe('WLinkType#spaceForNext (WLinkType.java:52-60)', () => {
  it('is 15 for NORMAL', () => {
    expect(WLinkType.NORMAL.spaceForNext()).toBe(15);
  });

  it('is 25 for BUS', () => {
    expect(WLinkType.BUS.spaceForNext()).toBe(25);
  });
});

describe('WLinkType#toString', () => {
  it('prints its Java name', () => {
    expect(WLinkType.BUS.toString()).toBe('BUS');
  });
});
