import { describe, expect, it } from 'vitest';
import { BlocLines } from '../../../src/core/utils/BlocLines.js';
import { RegexExpression } from '../../../src/diagrams/regex/RegexExpression.js';
import { RegexParsingException } from '../../../src/diagrams/regex/RegexParsingException.js';

/** `RegexExpression.parse` over one source line, as `toString` strings. */
function tokens(line: string): string[] {
  return RegexExpression.parse(BlocLines.fromArray([line]).inspector()).map((t) => t.toString());
}

/** The error `parse` throws on `line`. */
function thrown(line: string): Error {
  try {
    tokens(line);
  } catch (e) {
    return e as Error;
  }
  throw new Error(`no throw for ${line}`);
}

describe('RegexExpression.parse', () => {
  it('reads a lookahead and a negative lookahead (cecave-79-napo327)', () => {
    expect(tokens('A(?=abc)BC(?!not)DE')).toEqual([
      'SIMPLE_CHAR[A]',
      'LOOK_AHEAD[?=]',
      'PARENTHESIS_OPEN[(]',
      'SIMPLE_CHAR[a]',
      'SIMPLE_CHAR[b]',
      'SIMPLE_CHAR[c]',
      'PARENTHESIS_CLOSE[)]',
      'SIMPLE_CHAR[B]',
      'SIMPLE_CHAR[C]',
      'LOOK_AHEAD[?!]',
      'PARENTHESIS_OPEN[(]',
      'SIMPLE_CHAR[n]',
      'SIMPLE_CHAR[o]',
      'SIMPLE_CHAR[t]',
      'PARENTHESIS_CLOSE[)]',
      'SIMPLE_CHAR[D]',
      'SIMPLE_CHAR[E]',
    ]);
  });

  it('reads a lookbehind of both signs', () => {
    expect(tokens('(?<=a)(?<!b)')).toEqual([
      'LOOK_BEHIND[?<=]',
      'PARENTHESIS_OPEN[(]',
      'SIMPLE_CHAR[a]',
      'PARENTHESIS_CLOSE[)]',
      'LOOK_BEHIND[?<!]',
      'PARENTHESIS_OPEN[(]',
      'SIMPLE_CHAR[b]',
      'PARENTHESIS_CLOSE[)]',
    ]);
  });

  it('reads a named group then its parenthesis (tubepu-44-gigu535)', () => {
    expect(tokens('A(?<tld>BCD)Z').slice(0, 3)).toEqual(['SIMPLE_CHAR[A]', 'NAMED_GROUP[tld]', 'PARENTHESIS_OPEN[(]']);
  });

  it('reads the parenthesis forms and drops a comment', () => {
    expect(tokens('(?:')).toEqual(['PARENTHESIS_OPEN[(?:]']);
    expect(tokens('(?!')).toEqual(['LOOK_AHEAD[?!]', 'PARENTHESIS_OPEN[(]']);
    expect(tokens('a(?#note)b')).toEqual(['SIMPLE_CHAR[a]', 'SIMPLE_CHAR[b]']);
  });

  it('reads the class forms', () => {
    expect(tokens('[[:digit:]]')).toEqual(['CLASS[:digit:]']);
    expect(tokens('\\0377')).toEqual(['CLASS[\\0377]']);
    expect(tokens('\\uFFFF')).toEqual(['CLASS[\\uFFFF]']);
    expect(tokens('\\p{L}')).toEqual(['CLASS[\\p{L}]']);
    expect(tokens('\\x{1F600}')).toEqual(['CLASS[\\x{1F600}]']);
    expect(tokens('.\\d\\1')).toEqual(['CLASS[.]', 'CLASS[\\d]', 'CLASS[\\1]']);
  });

  it('reads anchors before escapes (cov-anchors-all)', () => {
    expect(tokens('\\A\\Z\\z\\G\\b\\B^$')).toEqual([
      'ANCHOR[\\A]',
      'ANCHOR[\\Z]',
      'ANCHOR[\\z]',
      'ANCHOR[\\G]',
      'ANCHOR[\\b]',
      'ANCHOR[\\B]',
      'ANCHOR[^]',
      'ANCHOR[$]',
    ]);
  });

  it('reads every escaped character (cov-escaped-all)', () => {
    expect(tokens('\\.\\*\\\\\\?\\^\\$\\|\\(\\)\\[\\]\\{\\}\\<\\>')).toEqual(
      ['.', '*', '\\', '?', '^', '$', '|', '(', ')', '[', ']', '{', '}', '<', '>'].map((c) => `ESCAPED_CHAR[${c}]`),
    );
  });

  it('reads groups, keeping a backslash and its next character', () => {
    expect(tokens('[a-z0-9_][^A-Fx\\]\\-][\\w\\d-]')).toEqual([
      'GROUP[a-z0-9_]',
      'GROUP[^A-Fx\\]\\-]',
      'GROUP[\\w\\d-]',
    ]);
  });

  it('reads quantifiers, lazy ones included', () => {
    expect(tokens('a+?b*?c??d{2,3}e{2}')).toEqual([
      'SIMPLE_CHAR[a]',
      'QUANTIFIER[+?]',
      'SIMPLE_CHAR[b]',
      'QUANTIFIER[*?]',
      'SIMPLE_CHAR[c]',
      'QUANTIFIER[??]',
      'SIMPLE_CHAR[d]',
      'QUANTIFIER[{2,3}]',
      'SIMPLE_CHAR[e]',
      'QUANTIFIER[{2}]',
    ]);
  });

  it('rejects a lazy braced quantifier with the jar message (cov-lazy)', () => {
    const e = thrown('a+?b*?c??d{2,3}?');
    expect(e).toBeInstanceOf(RegexParsingException);
    expect(e.message).toBe('Bad quantifier {2,3}?');
  });

  it('rejects a non-numeric braced quantifier (cov-bad-quantifier, bakuza, tajefa)', () => {
    expect(thrown('a{x}').message).toBe('Bad quantifier {x}');
    expect(thrown('a{([^{}').message).toBe('Bad quantifier {([^{}');
  });

  it('raises the jar messages for truncated input', () => {
    const cases: readonly (readonly [string, string])[] = [
      ['a(?#abc', 'Unclosed comment'],
      ['\\u12', 'Unexpected end of data'],
      ['\\p{L', 'Unexpected end of data'],
      ['\\01', 'Unexpected end of data'],
    ];
    for (const [line, message] of cases) {
      const e = thrown(line);
      expect(e).toBeInstanceOf(RegexParsingException);
      expect(e.message).toBe(message);
    }
  });

  it('throws a plain error from jump past the end on an unclosed posix group (cov-posix-all)', () => {
    const e = thrown('[[:alpha:]][[:space:]]x[[:punct:]');
    expect(e).not.toBeInstanceOf(RegexParsingException);
    expect(e.message).toBe('IllegalStateException');
  });

  it('falls back to a plain parenthesis when a named group is not closed or empty (rep D4)', () => {
    expect(tokens('(?<abc')).toEqual([
      'PARENTHESIS_OPEN[(]',
      'QUANTIFIER[?]',
      'SIMPLE_CHAR[<]',
      'SIMPLE_CHAR[a]',
      'SIMPLE_CHAR[b]',
      'SIMPLE_CHAR[c]',
    ]);
    expect(tokens('(?<>a)').slice(0, 2)).toEqual(['PARENTHESIS_OPEN[(]', 'QUANTIFIER[?]']);
    expect(tokens('(?<a1>b)').slice(0, 2)).toEqual(['PARENTHESIS_OPEN[(]', 'QUANTIFIER[?]']);
  });

  it('reads non-ASCII text one UTF-16 unit at a time (rep D9)', () => {
    expect(tokens('àé€😀')).toEqual([
      'SIMPLE_CHAR[à]',
      'SIMPLE_CHAR[é]',
      'SIMPLE_CHAR[€]',
      'SIMPLE_CHAR[\uD83D]',
      'SIMPLE_CHAR[\uDE00]',
    ]);
  });

  it('reads the trimmed line, blanks inside included (cov-whitespace)', () => {
    expect(tokens('   a b  ')).toEqual(['SIMPLE_CHAR[a]', 'SIMPLE_CHAR[ ]', 'SIMPLE_CHAR[b]']);
  });

  it('reads an empty line as no tokens', () => {
    expect(tokens('')).toEqual([]);
  });
});
