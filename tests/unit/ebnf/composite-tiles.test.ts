import { describe, expect, it } from 'vitest';
import { UTranslate } from '../../../src/core/klimt/UTranslate.js';
import type { ETile } from '../../../src/diagrams/ebnf/ETile.js';
import { ETileAlternation } from '../../../src/diagrams/ebnf/ETileAlternation.js';
import { ETileConcatenation } from '../../../src/diagrams/ebnf/ETileConcatenation.js';
import { ETileEmpty } from '../../../src/diagrams/ebnf/ETileEmpty.js';
import { ETileNot } from '../../../src/diagrams/ebnf/ETileNot.js';
import { ETileOneOrMore } from '../../../src/diagrams/ebnf/ETileOneOrMore.js';
import { ETileOptional2 } from '../../../src/diagrams/ebnf/ETileOptional2.js';
import { ETileWithCircles } from '../../../src/diagrams/ebnf/ETileWithCircles.js';
import { ETileZeroOrMore } from '../../../src/diagrams/ebnf/ETileZeroOrMore.js';
import { Symbol } from '../../../src/diagrams/ebnf/Symbol.js';
import { body, BOUNDER, box, ebnfSkinParam, ebnfStyle, newGraphic } from './helpers.js';
import { BUTITI, EMPTY_RULE, NOT, OPERATORS_ALL, REPETITION_SYMBOL } from './oracle-bodies.js';

const skinParam = ebnfSkinParam();
const { style, fc } = ebnfStyle(skinParam);
const lineColor = style.value('LineColor').asColor(skinParam.getIHtmlColorSet());
const colorSet = skinParam.getIHtmlColorSet();

/** Every rule's railroad sits at (10, 34): the 10 px document margin, the 14 px title, `withMargin(main, 0, 0, 10, 15)`. */
function drawRule(tile: ETile): string {
  const ug = newGraphic();
  new ETileWithCircles(tile, lineColor).drawU(ug.apply(new UTranslate(10, 34)));
  return body(ug);
}

/** The oracle body after its first element (the bold title `<text>`). */
function afterTitle(oracle: string): string {
  return oracle.substring(oracle.indexOf('</text>') + '</text>'.length);
}

/** `concat.push(…)` prepends, so the engine's operand order is reversed here. */
function concat(...tiles: ETile[]): ETileConcatenation {
  const result = new ETileConcatenation();
  for (const tile of [...tiles].reverse()) result.push(tile);
  return result;
}

function alternation(...tiles: ETile[]): ETileAlternation {
  const result = new ETileAlternation();
  for (const tile of [...tiles].reverse()) result.push(tile);
  return result;
}

describe('composite tiles against the jar', () => {
  it('butiti-18-tava797: s, {"0", "1"} with notes above and below the loop', () => {
    const loop = new ETileZeroOrMore(
      concat(box('0', Symbol.TERMINAL_STRING1), box('1', Symbol.TERMINAL_STRING1)),
      skinParam,
    );
    loop.addCommentAbove(' note a ');
    loop.addCommentBelow(' note b ');
    expect(drawRule(concat(box('s', Symbol.LITERAL), loop))).toBe(afterTitle(BUTITI));
  });

  it('cov-empty-rule: ETileWithCircles around ETileEmpty is 60 wide', () => {
    const tile = new ETileWithCircles(new ETileEmpty(), lineColor);
    expect(tile.getWidth(BOUNDER)).toBe(60);
    expect(drawRule(new ETileEmpty())).toBe(afterTitle(EMPTY_RULE));
  });

  it('cov-not: "a" - "b" is a concatenation of "a" and NOT "b"', () => {
    const not = new ETileNot(box('b', Symbol.TERMINAL_STRING1), fc, style, colorSet, skinParam);
    expect(drawRule(concat(box('a', Symbol.TERMINAL_STRING1), not))).toBe(afterTitle(NOT));
  });

  it('cov-repetition-symbol: 3 * "x" is a loop labelled 3× at bigger(-2) under a brace', () => {
    const loop = new ETileOneOrMore(box('x', Symbol.TERMINAL_STRING1), '3×', { ...fc, size: fc.size - 2 }, skinParam);
    const ours = drawRule(loop);
    expect(afterTitle(REPETITION_SYMBOL).startsWith(ours)).toBe(true);
    expect(ours).toContain('>3×</text>');
  });

  it('cov-operators-all: the optional, the loops, the alternation and the three box kinds', () => {
    const optional = new ETileOptional2(box('b', Symbol.TERMINAL_STRING1), skinParam);
    const zeroOrMore = new ETileZeroOrMore(box('c', Symbol.TERMINAL_STRING1), skinParam);
    const group = alternation(box('d', Symbol.TERMINAL_STRING1), box('e', Symbol.TERMINAL_STRING1));
    const oneOrMore = new ETileOneOrMore(box('f', Symbol.TERMINAL_STRING1));
    const tile = concat(
      box('a', Symbol.TERMINAL_STRING1),
      optional,
      zeroOrMore,
      group,
      box(' spec ', Symbol.SPECIAL_SEQUENCE),
      box('single', Symbol.TERMINAL_STRING2),
      box('lit', Symbol.LITERAL),
      oneOrMore,
    );
    expect(drawRule(tile)).toBe(afterTitle(OPERATORS_ALL));
  });
});

describe('composite tile contracts', () => {
  it('push on a leaf-wrapping tile throws', () => {
    const leaf = box('x', Symbol.TERMINAL_STRING1);
    for (const tile of [
      new ETileOptional2(leaf, skinParam),
      new ETileOneOrMore(leaf),
      new ETileNot(leaf, fc, style, colorSet, skinParam),
      new ETileWithCircles(leaf, lineColor),
    ])
      expect(() => tile.push(leaf)).toThrow('UnsupportedOperationException');
  });

  it('concatenation pushLast appends, overideFirst replaces, getFirst reads', () => {
    const a = box('a', Symbol.TERMINAL_STRING1);
    const b = box('b', Symbol.TERMINAL_STRING1);
    const c = box('c', Symbol.TERMINAL_STRING1);
    const tile = new ETileConcatenation();
    expect(() => tile.getFirst()).toThrow('IndexOutOfBoundsException');
    tile.push(a);
    tile.pushLast(b);
    expect(tile.getFirst()).toBe(a);
    tile.overideFirst(c);
    expect(tile.getFirst()).toBe(c);
    expect(tile.getWidth(BOUNDER)).toBe(c.getWidth(BOUNDER) + 20 + b.getWidth(BOUNDER));
  });

  it('an alternation of three draws its middle branch with corners on both rails', () => {
    const tile = alternation(
      box('a', Symbol.TERMINAL_STRING1),
      box('b', Symbol.TERMINAL_STRING1),
      box('c', Symbol.TERMINAL_STRING1),
    );
    expect(tile.getH1(BOUNDER)).toBe(12);
    expect(tile.getH2(BOUNDER)).toBe(12 + 2 * (24 + 10));
    const ug = newGraphic();
    tile.drawU(ug);
    // Three branches: two side corners per non-first branch on the rails, plus the rails' own four corners.
    expect(body(ug).match(/<path d="M[^"]*C/g)).toHaveLength(2 + 4);
  });

  it('the deprecated setInZeroOrMore switches the alternation to its loop drawing', () => {
    const tile = alternation(box('a', Symbol.TERMINAL_STRING1), box('b', Symbol.TERMINAL_STRING1));
    tile.setInZeroOrMore(false);
    const ug = newGraphic();
    tile.drawU(ug);
    // Every branch gets an SW and an SE corner, and the two rails run from 0.
    expect(body(ug).match(/<path d="M[^"]*C/g)).toHaveLength(4);
    expect(body(ug)).toContain('<line x1="12" y1="0" x2="12" y2="34"');
  });

  it('ETileOptional2 with notes is taller by each note plus its 10 px margin', () => {
    const plain = new ETileOptional2(box('b', Symbol.TERMINAL_STRING1), skinParam);
    const noted = new ETileOptional2(box('b', Symbol.TERMINAL_STRING1), skinParam);
    noted.addCommentAbove('up');
    noted.addCommentBelow('down');
    expect(noted.getH1(BOUNDER)).toBe(plain.getH1(BOUNDER) + 23 + 10);
    expect(noted.getH2(BOUNDER)).toBe(plain.getH2(BOUNDER) + 23 + 10);
    const ug = newGraphic();
    noted.drawU(ug);
    expect(body(ug)).toContain('>up</text>');
    expect(body(ug)).toContain('>down</text>');
  });
});
