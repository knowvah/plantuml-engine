import { describe, expect, it } from 'vitest';
import { GroupSplitter } from '../../../src/diagrams/regex/GroupSplitter.js';

const splitter = new GroupSplitter();

describe('GroupSplitter', () => {
  it('splits ranges and single characters', () => {
    expect(splitter.split('a-z0-9_')).toEqual(['a-z', '0-9', '_']);
  });

  it('keeps a letter escape and reduces any other (faporu-75-biso094 texts)', () => {
    expect(splitter.split('^\\s%g{}\\[\\]')).toEqual(['^', '\\s', '%', 'g', '{', '}', '[', ']']);
  });

  it('reads a range before an escape, and a trailing hyphen alone', () => {
    expect(splitter.split('\\w\\d-')).toEqual(['\\w', '\\d', '-']);
    expect(splitter.split('a-')).toEqual(['a', '-']);
    expect(splitter.split('-a')).toEqual(['-', 'a']);
    expect(splitter.split('x\\-')).toEqual(['x', '-']);
  });

  it('keeps a trailing backslash alone and returns a frozen list', () => {
    const result = splitter.split('a\\');
    expect(result).toEqual(['a', '\\']);
    expect(Object.isFrozen(result)).toBe(true);
    expect(splitter.split('')).toEqual([]);
  });
});
