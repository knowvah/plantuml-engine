import { describe, expect, it } from 'vitest';
import { WArrowDirection } from '../../../src/diagrams/wire/WArrowDirection.js';

describe('WArrowDirection.from (WArrowDirection.java:41-52)', () => {
  it.each([
    ['->', WArrowDirection.NORMAL],
    ['<->', WArrowDirection.BOTH],
    ['<-', WArrowDirection.REVERSE],
    ['-', WArrowDirection.NONE],
    ['-->', WArrowDirection.NORMAL],
    ['<-->', WArrowDirection.BOTH],
    ['<--', WArrowDirection.REVERSE],
    ['--', WArrowDirection.NONE],
    ['=>', WArrowDirection.NORMAL],
    ['<=>', WArrowDirection.BOTH],
    ['<=', WArrowDirection.REVERSE],
    ['=', WArrowDirection.NONE],
    ['==>', WArrowDirection.NORMAL],
    ['<==>', WArrowDirection.BOTH],
    ['<==', WArrowDirection.REVERSE],
    ['==', WArrowDirection.NONE],
  ])('%s', (style, expected) => {
    expect(WArrowDirection.from(style)).toBe(expected);
  });

  it('prints its Java name', () => {
    expect(WArrowDirection.REVERSE.toString()).toBe('REVERSE');
  });
});
