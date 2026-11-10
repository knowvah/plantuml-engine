import { describe, expect, it } from 'vitest';
import { BlocLines } from '../../../../src/core/utils/BlocLines.js';

const NUL = '\0';

describe('CharInspectorImpl (CharInspectorImpl.java:38-84)', () => {
  it('walks trimmed lines, skipping empty ones, then returns NUL', () => {
    const it = BlocLines.fromArray(["  a = 'b' ;  ", '', 'c']).inspector();
    const seen: string[] = [];
    for (let i = 0; i < 8; i++) {
      seen.push(it.peek(0));
      it.jump();
    }
    expect(seen).toEqual(['a', ' ', '=', ' ', "'", 'b', "'", ' ']);
    expect(it.peek(0)).toBe(';');
    expect(it.peek(1)).toBe(NUL);
    it.jump();
    expect(it.peek(0)).toBe('c');
    it.jump();
    expect(it.peek(0)).toBe(NUL);
    expect(() => it.jump()).toThrow('IllegalStateException');
  });

  it('peeks ahead within the current line only', () => {
    const it = BlocLines.fromArray(['ab', 'cd']).inspector();
    expect(it.peek(1)).toBe('b');
    expect(it.peek(2)).toBe(NUL);
  });

  it('does not skip a leading empty line before the first jump (line starts at 0)', () => {
    const it = BlocLines.fromArray(['', 'x']).inspector();
    expect(it.peek(0)).toBe(NUL);
    it.jump();
    expect(it.peek(0)).toBe('x');
  });

  it('inspectorWithNewlines yields \\n at each line end', () => {
    const it = BlocLines.fromArray(['a', 'b']).inspectorWithNewlines();
    const seen: string[] = [];
    for (let i = 0; i < 4; i++) {
      seen.push(it.peek(0));
      it.jump();
    }
    expect(seen).toEqual(['a', '\n', 'b', '\n']);
    expect(it.peek(0)).toBe(NUL);
  });
});
