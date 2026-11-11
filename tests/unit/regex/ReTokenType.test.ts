import { describe, expect, it } from 'vitest';
import { ReToken } from '../../../src/diagrams/regex/ReToken.js';
import {
  isNamedGroupOrLookAheadOrLookBehind,
  needImplicitConcatenation,
  ReTokenType,
} from '../../../src/diagrams/regex/ReTokenType.js';
import { RegexParsingException } from '../../../src/diagrams/regex/RegexParsingException.js';

/** Java's declaration order. @see ReTokenType.java:40-52 */
const JAVA_ORDER = [
  'SIMPLE_CHAR',
  'ESCAPED_CHAR',
  'CLASS',
  'QUANTIFIER',
  'ANCHOR',
  'GROUP',
  'NAMED_GROUP',
  'LOOK_AHEAD',
  'LOOK_BEHIND',
  'ALTERNATIVE',
  'PARENTHESIS_OPEN',
  'PARENTHESIS_CLOSE',
  'CONCATENATION_IMPLICIT',
];

describe('ReTokenType', () => {
  it('keeps the Java names and order', () => {
    expect(Object.values(ReTokenType)).toEqual(JAVA_ORDER);
  });

  it('flags only NAMED_GROUP, LOOK_AHEAD and LOOK_BEHIND as group openers', () => {
    const flagged = Object.values(ReTokenType).filter(isNamedGroupOrLookAheadOrLookBehind);
    expect(flagged).toEqual(['NAMED_GROUP', 'LOOK_AHEAD', 'LOOK_BEHIND']);
  });

  it('needs an implicit concatenation only between two operands', () => {
    const { SIMPLE_CHAR, ALTERNATIVE, QUANTIFIER, PARENTHESIS_OPEN, PARENTHESIS_CLOSE, LOOK_AHEAD, GROUP } =
      ReTokenType;
    expect(needImplicitConcatenation(SIMPLE_CHAR, SIMPLE_CHAR)).toBe(true);
    expect(needImplicitConcatenation(PARENTHESIS_CLOSE, PARENTHESIS_OPEN)).toBe(true);
    expect(needImplicitConcatenation(QUANTIFIER, GROUP)).toBe(true);
    expect(needImplicitConcatenation(LOOK_AHEAD, PARENTHESIS_OPEN)).toBe(false);
    expect(needImplicitConcatenation(ALTERNATIVE, SIMPLE_CHAR)).toBe(false);
    expect(needImplicitConcatenation(SIMPLE_CHAR, ALTERNATIVE)).toBe(false);
    expect(needImplicitConcatenation(SIMPLE_CHAR, QUANTIFIER)).toBe(false);
    expect(needImplicitConcatenation(PARENTHESIS_OPEN, SIMPLE_CHAR)).toBe(false);
    expect(needImplicitConcatenation(SIMPLE_CHAR, PARENTHESIS_CLOSE)).toBe(false);
  });
});

describe('ReToken', () => {
  it('prints type[data] with the Java enum name', () => {
    const token = new ReToken(ReTokenType.PARENTHESIS_OPEN, '(');
    expect(token.toString()).toBe('PARENTHESIS_OPEN[(]');
    expect(token.getType()).toBe('PARENTHESIS_OPEN');
    expect(token.getData()).toBe('(');
  });
});

describe('RegexParsingException', () => {
  it('is a named Error carrying the message', () => {
    const e = new RegexParsingException('Bad quantifier {x}');
    expect(e).toBeInstanceOf(Error);
    expect(e.name).toBe('RegexParsingException');
    expect(e.message).toBe('Bad quantifier {x}');
  });
});
