import { describe, expect, it } from 'vitest';

import { firstPageAssignments, firstPageOf } from '../../../src/core/preprocessor-first-page.js';
import type { PreprocessorResult } from '../../../src/core/preprocessor.js';

const assignment = (
  key: string,
  value: string,
  position: number,
): PreprocessorResult['skinparamAssignments'] extends readonly (infer A)[] | undefined ? A : never => ({
  key,
  value,
  position,
  order: position,
});

const preprocessed = (lines: readonly string[], positions: readonly number[]): PreprocessorResult => ({
  lines,
  linePositions: positions,
  theme: null,
  styles: ['early', 'late'],
  stylePositions: [1, 9],
  skinparam: new Map([
    ['a', '2'],
    ['b', '3'],
  ]),
  skinparamAssignments: [assignment('a', '1', 2), assignment('a', '2', 3), assignment('b', '3', 8)],
  declarationOrder: {
    skinparam: new Map([
      ['a', 2],
      ['b', 3],
    ]),
    styles: [1, 4],
  },
});

describe('firstPageOf (CommandNewpage.java:68-73)', () => {
  it('drops what follows the first newpage, last value of the first page winning', () => {
    const page = firstPageOf(preprocessed(['x', ' NewPage ', 'y'], [4, 6, 7]));
    expect([...page.skinparam]).toEqual([['a', '2']]);
    expect(page.styles).toEqual(['early']);
    expect(page.stylePositions).toEqual([1]);
    expect(page.declarationOrder?.styles).toEqual([1]);
    expect([...(page.declarationOrder?.skinparam ?? [])]).toEqual([['a', 2]]);
  });

  it('returns the same object when no newpage or nothing follows it', () => {
    const none = preprocessed(['x'], [4]);
    expect(firstPageOf(none)).toBe(none);
    const last = preprocessed(['x', 'newpage'], [4, 20]);
    expect(firstPageOf(last)).toBe(last);
  });

  it('filters assignments alone for a warning source', () => {
    const all = [assignment('handwritten', 'true', 2), assignment('padding', '1', 8)];
    expect(firstPageAssignments(all, ['newpage'], [6]).map((a) => a.key)).toEqual(['handwritten']);
    expect(firstPageAssignments(all, ['x'], [6])).toBe(all);
    expect(firstPageAssignments(all, ['newpage'], undefined)).toBe(all);
  });
});
