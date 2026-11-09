import { describe, expect, it } from 'vitest';
import { MultilinesStrategy } from '../../src/core/command/MultilinesStrategy.js';
import { Trim, trimWith } from '../../src/core/command/Trim.js';
import { BackSlash } from '../../src/core/text/BackSlash.js';
import { LineLocationImpl } from '../../src/core/tim/LineLocationImpl.js';
import { StringLocated } from '../../src/core/tim/StringLocated.js';
import { BlocLines, isSpaceOrTab, nbStartingSpace } from '../../src/core/utils/BlocLines.js';

const of = (...texts: string[]): BlocLines => BlocLines.fromArray(texts);

describe('BlocLines factories and readers', () => {
  it('asList, size, getAt, getFirst, getLast and toString read the lines', () => {
    const lines = of('a', 'b', 'c');

    expect(lines.asList()).toEqual(['a', 'b', 'c']);
    expect(lines.size()).toBe(3);
    expect(lines.getAt(1).getString()).toBe('b');
    expect(lines.getFirst()!.getString()).toBe('a');
    expect(lines.getLast().getString()).toBe('c');
    expect(lines.toString()).toBe('[a][b][c]');
    expect(lines.getLinesAsStringForSprite()).toEqual(['a', 'b', 'c']);
    expect([...lines].map((l) => l.getString())).toEqual(['a', 'b', 'c']);
  });

  it('create is empty: getFirst is undefined, getLast and getAt throw, getLocation is undefined', () => {
    const empty = BlocLines.create();

    expect(empty.size()).toBe(0);
    expect(empty.getFirst()).toBeUndefined();
    expect(() => empty.getLast()).toThrow(RangeError);
    expect(() => empty.getAt(0)).toThrow('Index 0 out of bounds for length 0');
    expect(empty.getLocation()).toBeUndefined();
  });

  it('add and addString answer copies and keep the original', () => {
    const one = BlocLines.single(new StringLocated('x', undefined));
    const two = one.addString('y').add(new StringLocated('z', undefined));

    expect(one.asList()).toEqual(['x']);
    expect(two.asList()).toEqual(['x', 'y', 'z']);
    expect(BlocLines.singleString('s').asList()).toEqual(['s']);
    expect(BlocLines.from([new StringLocated('f', undefined)]).asList()).toEqual(['f']);
  });

  it('getLocation is the first line location', () => {
    const location = new LineLocationImpl('string', undefined, 7);
    const lines = BlocLines.from([new StringLocated('a', location), new StringLocated('b', undefined)]);

    expect(lines.getLocation()).toBe(location);
  });

  it('toDisplay builds a Display of the lines', () => {
    expect(of('one', 'two').toDisplay().asList().map(String)).toEqual(['one', 'two']);
  });
});

describe('BlocLines transformations', () => {
  it('trim trims every line; removeEmptyLines drops the empty ones', () => {
    expect(of('  a ', ' b').trim().asList()).toEqual(['a', 'b']);
    expect(of('a', '', 'b', '').removeEmptyLines().asList()).toEqual(['a', 'b']);
  });

  it('cleanList(REMOVE_STARTING_QUOTE) drops the comment lines, KEEP_STARTING_QUOTE keeps them', () => {
    const lines = of('a', "  ' c", "'d", 'b');

    expect(lines.cleanList(MultilinesStrategy.REMOVE_STARTING_QUOTE).asList()).toEqual(['a', 'b']);
    expect(lines.cleanList(MultilinesStrategy.KEEP_STARTING_QUOTE).asList()).toEqual(['a', "  ' c", "'d", 'b']);
  });

  it('removeEmptyColumns strips the leading column shared by every non-empty line, repeatedly', () => {
    expect(of('  a', ' b', '', '   c').removeEmptyColumns().asList()).toEqual([' a', 'b', '', '  c']);
    expect(of('  a', '   b').removeEmptyColumns().asList()).toEqual(['a', ' b']);
    expect(of('\t\ta', '\t b').removeEmptyColumns().asList()).toEqual(['a', 'b']);
    expect(of('a', ' b').removeEmptyColumns().asList()).toEqual(['a', ' b']);
    expect(of('', '').removeEmptyColumns().asList()).toEqual(['', '']);
  });

  it('trimSmart removes the starting spaces of the reference line from it on', () => {
    expect(of('  head', '    a', '  b', 'c', '').trimSmart(1).asList()).toEqual(['  head', 'a', 'b', 'c', '']);
    expect(of('x').trimSmart(5).asList()).toEqual(['x']);
  });

  it('subExtract and subList cut the margins', () => {
    expect(of('a', 'b', 'c', 'd').subExtract(1, 1).asList()).toEqual(['b', 'c']);
    expect(of('a', 'b', 'c', 'd').subList(1, 3).asList()).toEqual(['b', 'c']);
  });

  it('removeStartingAndEnding replaces the first line and cuts the end of the last', () => {
    expect(of('first', 'mid', 'last!!').removeStartingAndEnding('F', 2).asList()).toEqual(['F', 'mid', 'last']);
    expect(of('first').removeStartingAndEnding('F', 0).asList()).toEqual(['F']);
    expect(BlocLines.create().removeStartingAndEnding('F', 1).size()).toBe(0);
  });

  it('overrideLastLine keeps the location of the line it replaces', () => {
    const location = new LineLocationImpl('string', undefined, 3);
    const lines = BlocLines.from([new StringLocated('a', undefined), new StringLocated('b', location)]);

    const overridden = lines.overrideLastLine('z');
    expect(overridden.asList()).toEqual(['a', 'z']);
    expect(overridden.getLast().getLocation()).toBe(location);
    expect(BlocLines.create().overrideLastLine('z').size()).toBe(0);
  });

  it('toSingleLineWithHiddenNewLine joins the lines with the hidden newline', () => {
    const nl = BackSlash.hiddenNewLine();

    expect(of('a', 'b').toSingleLineWithHiddenNewLine().asList()).toEqual(['a' + nl + 'b']);
  });

  it('getLastChar is the last character of the last line', () => {
    expect(of('a', 'bc').getLastChar()).toBe('c');
    expect(() => of('a', '').getLastChar()).toThrow(RangeError);
  });

  it('removeFewChars trims nb chars from both ends', () => {
    expect(of('{{a', 'mid', 'b}}').removeFewChars(2).asList()).toEqual(['a', 'mid', 'b']);
  });
});

describe('BlocLines brackets', () => {
  it('eventuallyMoveBracket joins a lone `{` to the line above', () => {
    expect(of('class A', '{', 'x').eventuallyMoveBracket().asList()).toEqual(['class A {', 'x']);
    expect(of('class A {', '{').eventuallyMoveBracket().asList()).toEqual(['class A {', '{']);
    expect(of('only').eventuallyMoveBracket().asList()).toEqual(['only']);
  });

  it('eventuallyMoveAllEmptyBracket joins every lone `{`, dropping one with nothing above', () => {
    expect(of('{', 'a', '{', 'b').eventuallyMoveAllEmptyBracket().asList()).toEqual(['a {', 'b']);
  });
});

describe('Trim and the space helpers', () => {
  const line = new StringLocated('  \t x y  ', undefined);

  it('trimWith: NONE keeps the text, BOTH trims, LEFT_ONLY trims the start only', () => {
    expect(trimWith(Trim.NONE, line)).toBe('  \t x y  ');
    expect(trimWith(Trim.BOTH, line)).toBe('x y');
    expect(trimWith(Trim.LEFT_ONLY, line)).toBe('x y  ');
  });

  it('isSpaceOrTab and nbStartingSpace count spaces and tabs only', () => {
    expect(isSpaceOrTab(' ')).toBe(true);
    expect(isSpaceOrTab('\t')).toBe(true);
    expect(isSpaceOrTab('x')).toBe(false);
    expect(nbStartingSpace(' \t x')).toBe(3);
    expect(nbStartingSpace('')).toBe(0);
  });
});

describe('StringLocated#substring', () => {
  it('keeps the location and the preprocessor error', () => {
    const location = new LineLocationImpl('string', undefined, 2);
    const s = new StringLocated('abcdef', location).withErrorPreprocessor('boom');

    expect(s.substring(1, 3).getString()).toBe('bc');
    expect(s.substring(4).getString()).toBe('ef');
    expect(s.substring(1).getLocation()).toBe(location);
    expect(s.substring(1).getPreprocessorError()).toBe('boom');
  });
});
