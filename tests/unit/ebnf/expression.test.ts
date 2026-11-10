import { describe, expect, it } from 'vitest';
import { HorizontalAlignment } from '../../../src/core/klimt/geom/HorizontalAlignment.js';
import type { TextBlock } from '../../../src/core/klimt/shape/TextBlock.js';
import { TextBlockUtils } from '../../../src/core/klimt/shape/TextBlockUtils.js';
import { UTranslate } from '../../../src/core/klimt/UTranslate.js';
import { OptionKey } from '../../../src/core/tim/EaterOption.js';
import { PreprocessingArtifact } from '../../../src/core/tim/PreprocessingArtifact.js';
import { BlocLines } from '../../../src/core/utils/BlocLines.js';
import { EbnfEngine } from '../../../src/diagrams/ebnf/EbnfEngine.js';
import { EbnfExpression } from '../../../src/diagrams/ebnf/EbnfExpression.js';
import { ShuntingYard } from '../../../src/diagrams/ebnf/ShuntingYard.js';
import { getPriority, isFunction, isOperator, Symbol } from '../../../src/diagrams/ebnf/Symbol.js';
import { Token } from '../../../src/diagrams/ebnf/Token.js';
import { body, ebnfSkinParam, ebnfStyle, newGraphic } from './helpers.js';
import {
  BUTITI,
  COMMENT_ABOVE_BELOW,
  COMPACT,
  EMPTY_RULE,
  INLINE_COMMENTS,
  MULTILINE_RULE,
  NESTED_GROUPS,
  NOT,
  OPERATORS_ALL,
  REPETITION_SYMBOL,
  SYNTAX_ERROR,
  UNICODE_IDS,
} from './oracle-bodies.js';

const skinParam = ebnfSkinParam();
const preprocessing = new PreprocessingArtifact();

interface Rule {
  readonly lines: readonly string[];
  readonly above?: string;
  readonly below?: string;
}

function expression({ lines, above, below }: Rule, compact = false): EbnfExpression {
  return EbnfExpression.create(BlocLines.fromArray(lines).inspector(), compact, above ?? null, below ?? null);
}

/** `PSystemEbnf#getTextBlock`'s `mergeTB(…, LEFT)` stack, drawn at the 10 px document margin. */
function render(rules: readonly Rule[], artifact = preprocessing): string {
  let result: TextBlock | undefined;
  for (const rule of rules) {
    const block = expression(rule).getUDrawable(skinParam, artifact);
    result = result === undefined ? block : TextBlockUtils.mergeTB(result, block, HorizontalAlignment.LEFT);
  }
  const ug = newGraphic();
  result!.drawU(ug.apply(new UTranslate(10, 10)));
  return body(ug);
}

function tokensOf(rule: Rule): string[] {
  return (expression(rule) as unknown as { tokens: Token[] }).tokens.map((t) => t.toString());
}

function queueOf(...tokens: Token[]): string[] {
  return new ShuntingYard(tokens.values()).getOuputQueue().map((t) => t.toString());
}

const lit = (s: string): Token => new Token(Symbol.LITERAL, s);
const op = (s: Symbol): Token => new Token(s, null);

describe('EbnfExpression tokenizer (EbnfExpression.java:69-129)', () => {
  it('tokenises butiti-18-tava797, keeping the blanks inside a comment', () => {
    expect(tokensOf({ lines: ['digit1 = s, (* note a *) {"0", "1"} (* note b *);'] })).toEqual([
      'LITERAL digit1',
      'DEFINITION',
      'LITERAL s',
      'CONCATENATION',
      'COMMENT_TOKEN  note a ',
      'REPETITION_OPEN',
      'TERMINAL_STRING1 0',
      'CONCATENATION',
      'TERMINAL_STRING1 1',
      'REPETITION_CLOSE',
      'COMMENT_TOKEN  note b ',
    ]);
  });

  it('reads -, *, }-, quotes, special sequences, and protect("") as " "', () => {
    expect(tokensOf({ lines: ['r = - a_b-c * \'x\' ? ? "" {d}-;'] })).toEqual([
      'LITERAL r',
      'DEFINITION',
      'NOT',
      'LITERAL a_b-c',
      'REPETITION_SYMBOL',
      'TERMINAL_STRING2 x',
      'SPECIAL_SEQUENCE  ',
      'TERMINAL_STRING1  ',
      'REPETITION_OPEN',
      'LITERAL d',
      'REPETITION_MINUS_CLOSE',
    ]);
  });

  it('drops a blank comment, ends at the input end without ;, and joins a multi-line rule', () => {
    expect(tokensOf({ lines: ['a = (*   *) b'] })).toEqual(['LITERAL a', 'DEFINITION', 'LITERAL b']);
    expect(tokensOf({ lines: ['a =', '"x" |', '"y";'] })).toEqual([
      'LITERAL a',
      'DEFINITION',
      'TERMINAL_STRING1 x',
      'ALTERNATION',
      'TERMINAL_STRING1 y',
    ]);
    expect(tokensOf({ lines: ['a = (* open'] })).toEqual(['LITERAL a', 'DEFINITION', 'COMMENT_TOKEN  open']);
  });

  it('a character no branch accepts clears every token (cov-unparsable)', () => {
    expect(expression({ lines: ['worse = "a" @ "b";'] }).isEmpty()).toBe(true);
    expect(expression({ lines: ['foo @ "a";'] }).isEmpty()).toBe(true);
    expect(expression({ lines: ['été = x;'] }).isEmpty()).toBe(false);
  });

  it('an unterminated string reads past the end into CharInspectorImpl#jump (cov-unterminated)', () => {
    expect(() => expression({ lines: ['broken = "abc;'] })).toThrow('IllegalStateException');
  });
});

describe('ShuntingYard (ShuntingYard.java:45-181)', () => {
  it('orders by Symbol priority: , binds tighter than |', () => {
    expect(queueOf(lit('a'), op(Symbol.ALTERNATION), lit('b'), op(Symbol.CONCATENATION), lit('c'))).toEqual([
      'LITERAL a',
      'LITERAL b',
      'LITERAL c',
      'CONCATENATION',
      'ALTERNATION',
    ]);
    expect(
      queueOf(
        op(Symbol.GROUPING_OPEN),
        lit('a'),
        op(Symbol.ALTERNATION),
        lit('b'),
        op(Symbol.GROUPING_CLOSE),
        op(Symbol.CONCATENATION),
        lit('c'),
      ),
    ).toEqual(['LITERAL a', 'LITERAL b', 'ALTERNATION', 'LITERAL c', 'CONCATENATION']);
  });

  it('an unclosed [ or { clears the queue, and a mismatched close throws', () => {
    expect(queueOf(op(Symbol.OPTIONAL_OPEN), lit('a'))).toEqual([]);
    expect(queueOf(op(Symbol.REPETITION_OPEN), lit('a'))).toEqual([]);
    expect(() => queueOf(op(Symbol.REPETITION_OPEN), lit('a'), op(Symbol.OPTIONAL_CLOSE))).toThrow(
      'IllegalStateException',
    );
    expect(() => queueOf(lit('a'), op(Symbol.GROUPING_CLOSE))).toThrow('NullPointerException');
    expect(() => queueOf(op(Symbol.DEFINITION))).toThrow('UnsupportedOperationException: DEFINITION');
  });

  it('}- queues REPETITION_ONE_OR_MORE; a trailing comment leaves as COMMENT_BELOW', () => {
    expect(
      queueOf(
        op(Symbol.REPETITION_OPEN),
        lit('a'),
        op(Symbol.REPETITION_MINUS_CLOSE),
        new Token(Symbol.COMMENT_TOKEN, 'c'),
      ),
    ).toEqual(['LITERAL a', 'REPETITION_ONE_OR_MORE', 'COMMENT_BELOW c']);
    const yard = new ShuntingYard([].values());
    expect(yard.thereIsAFunctionAtTheTopOfTheOperatorStack()).toBe(false);
  });
});

describe('Symbol and Token', () => {
  it('priorities, operators, functions (Symbol.java:69-87)', () => {
    expect([Symbol.REPETITION_SYMBOL, Symbol.CONCATENATION, Symbol.ALTERNATION].map(getPriority)).toEqual([3, 2, 1]);
    expect(() => getPriority(Symbol.LITERAL)).toThrow('UnsupportedOperationException');
    expect(isOperator(Symbol.CONCATENATION)).toBe(true);
    expect(isOperator(Symbol.OPTIONAL)).toBe(false);
    expect(isFunction(Symbol.REPETITION_ZERO_OR_MORE)).toBe(true);
    expect(isFunction(Symbol.ALTERNATION)).toBe(false);
  });

  it('an empty data is IllegalArgumentException (Token.java:46-47)', () => {
    expect(() => new Token(Symbol.LITERAL, '')).toThrow('IllegalArgumentException');
  });
});

describe('EbnfExpression#getUDrawable against the jar', () => {
  it.each([
    ['butiti-18-tava797', [{ lines: ['digit1 = s, (* note a *) {"0", "1"} (* note b *);'] }], BUTITI],
    ['cov-empty-rule', [{ lines: ['nothing = ;'] }], EMPTY_RULE],
    ['cov-not', [{ lines: ['except = "a" - "b";'] }], NOT],
    ['cov-repetition-symbol', [{ lines: ['three = 3 * "x";'] }, { lines: ['zero = 0 * "y";'] }], REPETITION_SYMBOL],
    [
      'cov-operators-all',
      [{ lines: ['all = "a", [ "b" ], { "c" }, ( "d" | "e" ), ? spec ?, \'single\', lit, { "f" }-;'] }],
      OPERATORS_ALL,
    ],
    ['cov-syntax-error', [{ lines: ['bad = "a" , , ;'] }, { lines: ['also = | "x";'] }], SYNTAX_ERROR],
    [
      'cov-nested-groups',
      [{ lines: ['deep = ( "a" | ( "b", [ "c" | { "d" } ] ) ), { [ "e" ] | "f" };'] }],
      NESTED_GROUPS,
    ],
    ['cov-unicode-ids', [{ lines: ['été = "chaud" | hiver;'] }, { lines: ['hiver = "froid";'] }], UNICODE_IDS],
    ['cov-multiline-rule', [{ lines: ['rule =', '"a",', '"b" |', '"c";'] }], MULTILINE_RULE],
    ['cov-compact', [{ lines: ['rule = "a", [ "b" ], { "c" | "d" };'] }], COMPACT],
    [
      'cov-inline-comments',
      [{ lines: ['digits = (* lead *) "0" (* trail *), { "1" (* inner *) };'] }],
      INLINE_COMMENTS,
    ],
    [
      'cov-comment-above-below',
      [{ lines: ['rule = "a", "b";'], above: ' above ', below: ' below ' }],
      COMMENT_ABOVE_BELOW,
    ],
  ])('%s', (_slug, rules, oracle) => {
    expect(render(rules)).toBe(oracle);
  });

  it('a lone name or a missing = is Syntax error!', () => {
    expect(render([{ lines: ['lonely'] }])).toContain('>Syntax error!</text>');
    expect(render([{ lines: ['a b;'] }])).toContain('>Syntax error!</text>');
    expect(render([{ lines: ['"a" = ( ;'] }])).toContain('>Syntax error!</text>');
  });

  it('useDescriptiveNames reaches the boxes through the preprocessing options', () => {
    const artifact = new PreprocessingArtifact();
    artifact.getOption().define(OptionKey.USE_DESCRIPTIVE_NAMES, 'true');
    expect(render([{ lines: ['d = "\\d";'] }], artifact)).toContain('>Digit</text>');
  });
});

describe('EbnfEngine (EbnfEngine.java:54-171)', () => {
  it('a comment on an empty stack is IllegalStateException; a stack of two is Syntax error!', () => {
    const engine = new EbnfEngine(skinParam, new Map());
    expect(() => engine.commentAbove('x')).toThrow('IllegalStateException');
    expect(() => engine.commentBelow('x')).toThrow('IllegalStateException');
    expect(() => engine.optional()).toThrow('NoSuchElementException');
    engine.push(new Token(Symbol.LITERAL, 'a'));
    engine.push(new Token(Symbol.LITERAL, 'b'));
    const ug = newGraphic();
    engine.getTextBlock().drawU(ug);
    expect(body(ug)).toContain('>Syntax error!</text>');
  });

  it('alternation and concatenation merge into an existing tile from either side', () => {
    const engine = new EbnfEngine(skinParam, new Map());
    for (const s of ['a', 'b', 'c', 'd']) engine.push(new Token(Symbol.LITERAL, s));
    engine.alternation(); // arg1 d, arg2 c: a new alternation [c, d]
    engine.alternation(); // arg1 is the alternation: push(b) → [b, c, d]
    engine.concatenation(); // arg1 the alternation, arg2 a: a new concatenation [a, alt]
    engine.push(new Token(Symbol.LITERAL, 'e'));
    engine.concatenation(); // arg1 e, arg2 the concatenation: pushLast(e)
    engine.push(new Token(Symbol.LITERAL, 'f'));
    engine.alternation(); // arg1 f, arg2 the concatenation… then an alternation on top: arg2 branch
    engine.push(new Token(Symbol.LITERAL, 'g'));
    engine.alternation(); // arg1 g, arg2 the alternation: arg2.push(g)
    engine.repetitionOneOrMore();
    engine.repetitionZeroOrMore();
    engine.not();
    const { fc } = ebnfStyle(skinParam);
    expect(fc.size).toBe(14);
    const ug = newGraphic();
    engine.getTextBlock().drawU(ug);
    expect(body(ug)).toContain('>NOT</text>');
  });
});
