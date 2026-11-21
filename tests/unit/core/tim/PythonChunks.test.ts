/**
 * `PythonChunks.collapse` (PythonChunks.java:78-178 at 6524b446188): which
 * lines upstream groups into one Python chunk. Each case states the grouping
 * the Java loop gives, read off the method: upstream has no unit test of it,
 * and the jar shows a chunk only through the routing it feeds
 * (`AffectationWithoutDollar.test.ts`).
 */
import { describe, expect, it } from 'vitest';
import { collapse, type PythonSources } from '../../../../src/core/tim/PythonChunks.js';
import { StringLocated } from '../../../../src/core/tim/StringLocated.js';
import { PYTHON_MARKER, getFromLineWithPython } from '../../../../src/core/tim/TLineType.js';

/** The collapsed body: a chunk as `[its source lines]`, any other line as itself. */
function grouped(...lines: string[]): (string | string[])[] {
  const body = lines.map((l) => new StringLocated(l, undefined));
  const sources: PythonSources = new Map();
  return collapse(body, sources).map((sl) =>
    sources.has(sl) ? sources.get(sl)!.map((l) => l.getString()) : sl.getString(),
  );
}

describe('PythonChunks.collapse', () => {
  it('returns the body itself when no line has a "!"', () => {
    const body = [new StringLocated('A -> B', undefined)];
    expect(collapse(body, new Map())).toBe(body);
  });

  it('groups a run of consecutive Python lines, and stops at a text line', () => {
    expect(grouped('!a = 1', '!b = 2', 'A -> B : a', '!c = 3')).toEqual([
      ['!a = 1', '!b = 2'],
      'A -> B : a',
      ['!c = 3'],
    ]);
  });

  it('keeps legacy directives and legacy affectations out of the chunks', () => {
    expect(grouped('!$a = 1', '!a = 2', '!if $a == 1', '!endif')).toEqual([
      '!$a = 1',
      ['!a = 2'],
      '!if $a == 1',
      '!endif',
    ]);
  });

  it('takes a !python block as it is, its lines unindented', () => {
    const body = ['  !python', '  x = 1', '!endpy'].map((l) => new StringLocated(l, undefined));
    const sources: PythonSources = new Map();
    const [chunk] = collapse(body, sources);
    expect(chunk!.getString()).toBe(`${PYTHON_MARKER}x = 1\n`);
    expect(sources.get(chunk!)!.map((l) => l.getString())).toEqual(['  x = 1']);
  });

  it('reports a !python without !endpy, and an !endpy without !python, on their own line', () => {
    expect(grouped('!python', 'x = 1')).toEqual([['!python']]);
    expect(grouped('!endpy', 'A -> B')).toEqual([['!endpy'], 'A -> B']);
  });

  it('takes the text lines deeper than an open block, and stops at a line back at its level', () => {
    expect(grouped('!def f(x):', '  A -> B : x', '', "  ' a comment", '!    return 1', 'A -> B : y')).toEqual([
      ['!def f(x):', '  A -> B : x', '!    return 1'],
      'A -> B : y',
    ]);
  });

  it('ends a block at a "!" line, and keeps a "!!" text line in it', () => {
    expect(grouped('!for i in range(2):', '  !!text', '!$x = 1')).toEqual([
      ['!for i in range(2):', '  !!text'],
      '!$x = 1',
    ]);
  });

  it('takes a tab-indented text line into the open block (the Python lexer reports the tab)', () => {
    expect(grouped('!class A:', '\tA -> B')).toEqual([['!class A:', '\tA -> B']]);
  });

  it('leaves the trailing blank lines of an open block outside the chunk', () => {
    expect(grouped('!def f():', '')).toEqual([['!def f():'], '']);
  });
});

describe('getFromLineWithPython (TLineType.java:149-269)', () => {
  it.each([
    ["' !x = 1", 'COMMENT_SIMPLE'],
    ["/' c '/", 'COMMENT_SIMPLE'],
    ["/' open", 'COMMENT_LONG_START'],
    ['A -> B', 'PLAIN'],
    [`${PYTHON_MARKER}x = 1`, 'PYTHON'],
    ['!{a} -> !{b}', 'PLAIN'],
    ['!define A(x) x', 'LEGACY_DEFINE'],
    ['!$x = 1', 'AFFECTATION'],
    ['!def f():', 'PYTHON'],
    ['!@deco', 'PYTHON'],
    ['!include foo.puml', 'INCLUDE'],
    ['!x = 1', 'PYTHON'],
    ['!"text"', 'PLAIN'],
  ])('%s -> %s', (line, type) => {
    expect(getFromLineWithPython(line)).toBe(type);
  });
});
