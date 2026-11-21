import { describe, expect, it } from 'vitest';
import { RegexPartialMatch } from '../../../../src/core/regex/RegexPartialMatch.js';

describe('RegexPartialMatch (fixed capacity since e2659a157bf)', () => {
  it('starts empty, every slot null (RegexPartialMatch.java:47-49,66-69)', () => {
    const m = new RegexPartialMatch(2);
    expect(m.size()).toBe(0);
    expect(m.toString()).toBe('{[null, null]}');
    expect(new RegexPartialMatch(0).toString()).toBe('{[]}');
  });

  it('add/size/get keep insertion order (RegexPartialMatch.java:51-64)', () => {
    const m = new RegexPartialMatch(3);
    m.add('a');
    m.add(undefined);
    m.add('c');
    expect(m.size()).toBe(3);
    expect(m.get(0)).toBe('a');
    expect(m.get(1)).toBeUndefined();
    expect(m.get(2)).toBe('c');
  });

  it('get past the filled size is IndexOutOfBounds -> RangeError (RegexPartialMatch.java:60-61)', () => {
    const m = new RegexPartialMatch(2);
    m.add('a');
    expect(() => m.get(1)).toThrow(new RangeError('Index: 1, Size: 1'));
    expect(() => m.get(-1)).toThrow(RangeError);
  });

  it('toString is "{" + Arrays.asList(data) + "}" with null (RegexPartialMatch.java:66-69)', () => {
    const m = new RegexPartialMatch(2);
    m.add('a');
    m.add(undefined);
    expect(m.toString()).toBe('{[a, null]}');
  });
});
