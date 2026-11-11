import { describe, expect, it } from 'vitest';
import { BlocLines } from '../../../src/core/utils/BlocLines.js';
import { ReToken } from '../../../src/diagrams/regex/ReToken.js';
import { needImplicitConcatenation, ReTokenType } from '../../../src/diagrams/regex/ReTokenType.js';
import { RegexExpression } from '../../../src/diagrams/regex/RegexExpression.js';
import { RegexParsingException } from '../../../src/diagrams/regex/RegexParsingException.js';
import { ShuntingYard } from '../../../src/diagrams/regex/ShuntingYard.js';

/**
 * Java's `addImplicitConcatenation`, written inline from its rule: a `CONCATENATION_IMPLICIT` between every two
 * tokens that need one. @see PSystemRegex.java:180-189
 */
function withConcatenation(tokens: readonly ReToken[]): ReToken[] {
  const result: ReToken[] = [];
  for (const token of tokens) {
    const last = result[result.length - 1];
    if (last !== undefined && needImplicitConcatenation(last.getType(), token.getType()))
      result.push(new ReToken(ReTokenType.CONCATENATION_IMPLICIT, ''));
    result.push(token);
  }
  return result;
}

/** The postfix queue of one source line. */
function queue(line: string): string[] {
  const tokens = withConcatenation(RegexExpression.parse(BlocLines.fromArray([line]).inspector()));
  return new ShuntingYard(tokens[Symbol.iterator]()).getOuputQueue().map((t) => t.toString());
}

describe('ShuntingYard', () => {
  it('queues concatenation before alternation', () => {
    expect(queue('ab|c')).toEqual([
      'SIMPLE_CHAR[a]',
      'SIMPLE_CHAR[b]',
      'CONCATENATION_IMPLICIT[]',
      'SIMPLE_CHAR[c]',
      'ALTERNATIVE[|]',
    ]);
  });

  it('moves a named group to the queue when its parenthesis closes', () => {
    expect(queue('(?<n>b)c')).toEqual([
      'SIMPLE_CHAR[b]',
      'NAMED_GROUP[n]',
      'SIMPLE_CHAR[c]',
      'CONCATENATION_IMPLICIT[]',
    ]);
  });

  it('moves a lookahead to the queue when its parenthesis closes', () => {
    expect(queue('a(?=bc)')).toEqual([
      'SIMPLE_CHAR[a]',
      'SIMPLE_CHAR[b]',
      'SIMPLE_CHAR[c]',
      'CONCATENATION_IMPLICIT[]',
      'LOOK_AHEAD[?=]',
      'CONCATENATION_IMPLICIT[]',
    ]);
  });

  it('queues a quantifier as an operand after its target', () => {
    expect(queue('(ab)+')).toEqual(['SIMPLE_CHAR[a]', 'SIMPLE_CHAR[b]', 'CONCATENATION_IMPLICIT[]', 'QUANTIFIER[+]']);
  });

  it('leaves an unclosed parenthesis in the queue (cov-unbalanced-open)', () => {
    expect(queue('(ab')).toEqual([
      'SIMPLE_CHAR[a]',
      'SIMPLE_CHAR[b]',
      'CONCATENATION_IMPLICIT[]',
      'PARENTHESIS_OPEN[(]',
    ]);
  });

  it('throws NoSuchElementException on an unmatched close (cov-unbalanced-close)', () => {
    let error: unknown;
    try {
      queue('a)b');
    } catch (e) {
      error = e;
    }
    expect(error).toBeInstanceOf(Error);
    expect(error).not.toBeInstanceOf(RegexParsingException);
    expect((error as Error).message).toBe('NoSuchElementException');
  });

  it('rejects a token type it has no branch for', () => {
    const tokens = [new ReToken(ReTokenType.PARENTHESIS_CLOSE, ')'), new ReToken(ReTokenType.ALTERNATIVE, '|')];
    expect(() => new ShuntingYard(tokens.slice(1).concat(tokens[0]!)[Symbol.iterator]())).toThrow(
      'NoSuchElementException',
    );
    const unknown = new ReToken('BOGUS' as ReTokenType, 'x');
    expect(() => new ShuntingYard([unknown][Symbol.iterator]())).toThrow('UnsupportedOperationException: BOGUS[x]');
  });

  it('shunts every drawn cached regex row without a throw', () => {
    for (const line of [
      'A(?=abc)BC(?!not)DE',
      'A(?<tld>BCD)Z',
      '([^\\s%g{}\\[\\]]+?)',
      '(?<=a(?=b))c(?<!d|e)f',
      '(a|b|c)|(d|(e|f))',
      '(?:ab)(?!cd)e',
      'ab\\.c(d)ef[g]hi',
    ])
      expect(queue(line).length).toBeGreaterThan(0);
  });
});
