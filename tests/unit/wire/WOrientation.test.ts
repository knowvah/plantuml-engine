import { describe, expect, it } from 'vitest';
import { WOrientation } from '../../../src/diagrams/wire/WOrientation.js';

describe('WOrientation.from (WOrientation.java:42-47)', () => {
  it.each(['->', '<->', '<-', '-', '=>', '<=>', '<=', '='])('%s is HORIZONTAL', (style) => {
    expect(WOrientation.from(style)).toBe(WOrientation.HORIZONTAL);
  });

  it.each(['-->', '<-->', '<--', '--', '==>', '<==>', '<==', '=='])('%s is VERTICAL', (style) => {
    expect(WOrientation.from(style)).toBe(WOrientation.VERTICAL);
  });
});

describe('WOrientation#toString', () => {
  it('prints its Java name', () => {
    expect(WOrientation.VERTICAL.toString()).toBe('VERTICAL');
  });
});
