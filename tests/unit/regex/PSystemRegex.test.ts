/**
 * `PSystemRegex`: the tile stack `addBlocLines` builds, the style its constructor freezes, and the errors it raises.
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/regexdiagram/PSystemRegex.java
 */
import { readdirSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { UTranslate } from '../../../src/core/klimt/UTranslate.js';
import { OptionKey } from '../../../src/core/tim/EaterOption.js';
import { ETileAlternation } from '../../../src/diagrams/ebnf/ETileAlternation.js';
import { ETileBox } from '../../../src/diagrams/ebnf/ETileBox.js';
import { ETileConcatenation } from '../../../src/diagrams/ebnf/ETileConcatenation.js';
import { ETileLookAheadOrBehind } from '../../../src/diagrams/ebnf/ETileLookAheadOrBehind.js';
import { ETileNamedGroup } from '../../../src/diagrams/ebnf/ETileNamedGroup.js';
import { ETileOneOrMore } from '../../../src/diagrams/ebnf/ETileOneOrMore.js';
import { ETileOptional2 } from '../../../src/diagrams/ebnf/ETileOptional2.js';
import { ETileRegexGroup } from '../../../src/diagrams/ebnf/ETileRegexGroup.js';
import { ETileRegexGroupAllBut } from '../../../src/diagrams/ebnf/ETileRegexGroupAllBut.js';
import { ETileZeroOrMore } from '../../../src/diagrams/ebnf/ETileZeroOrMore.js';
import {
  isBracedMaxUnbounded,
  parseBracedMax,
  parseBracedMin,
  type PSystemRegex,
} from '../../../src/diagrams/regex/PSystemRegex.js';
import { body, BOUNDER, newGraphic } from '../ebnf/helpers.js';
import { addLine, regexDiagram, type StyleInput } from './helpers.js';

const REGEX_CACHE = 'test-results/dot-cache/regex';
/** The two rows the jar refuses at line 2 (rep D8). */
const JAR_ERROR_ROWS = new Set(['bakuza-41-bulo451', 'tajefa-31-pefi801']);
/** The common-command and preprocessor lines of the cached rows: not regex text. */
const NOT_REGEX = /^(title |!)/;

/** A diagram after `lines`, each its own `addBlocLines`. */
function diagramOf(lines: readonly string[], input: StyleInput = {}): PSystemRegex {
  const diagram = regexDiagram(input);
  for (const line of lines) {
    const result = addLine(diagram, line);
    if (!result.isOk()) throw new Error(`${line}: ${result.getError()}`);
  }
  return diagram;
}

/** The SVG body `getTextBlock` draws. */
function drawn(diagram: PSystemRegex): string {
  const ug = newGraphic();
  diagram.getTextBlock().drawU(ug.apply(new UTranslate(0, 0)));
  return body(ug);
}

function texts(svg: string): string[] {
  return [...svg.matchAll(/<text[^>]*>([^<]*)<\/text>/g)].map((m) => m[1]!);
}

describe('PSystemRegex#addBlocLines (PSystemRegex.java:131-178)', () => {
  it('leluxe-05-lava324 `abc`: three boxes merge into one', () => {
    const diagram = diagramOf(['abc']);
    expect(diagram.getStack()).toHaveLength(1);
    expect(diagram.getStack()[0]).toBeInstanceOf(ETileBox);
    expect(texts(drawn(diagram))).toEqual(['abc']);
  });

  it('cov-merge-boxes: boxes merge across a plain group and an escape, not across [g]', () => {
    expect(texts(drawn(diagramOf(['ab\\.c(d)ef[g]hi'])))).toEqual(['ab.cdef', 'g', 'hi']);
  });

  it('CLASS and ANCHOR boxes are literals and never merge', () => {
    const top = diagramOf(['\\d\\d']).getStack()[0];
    expect(top).toBeInstanceOf(ETileConcatenation);
    expect(texts(drawn(diagramOf(['^a$'])))).toEqual(['^', 'a', '$']);
  });

  it('cov-multi-line: every line shares the stack and only the top tile is drawn', () => {
    const diagram = diagramOf(['abc', 'x|y']);
    expect(diagram.getStack()).toHaveLength(2);
    expect(diagram.getStack()[0]).toBeInstanceOf(ETileAlternation);
    expect(texts(drawn(diagram))).toEqual(['x', 'y']);
    // The oracle's 96 x 89 is `(int) (x + 1)` (SvgGraphics.java:129-135) of the block plus
    // TitledDiagram#getDefaultMargins, same(10) (TitledDiagram.java:275-277): 75 x 68.
    const dim = diagram.getTextBlock().calculateDimension(BOUNDER);
    expect([dim.getWidth(), dim.getHeight()]).toEqual([75, 68]);
  });

  it('builds the group, lookaround and named-group tiles', () => {
    expect(diagramOf(['[a-z]']).getStack()[0]).toBeInstanceOf(ETileRegexGroup);
    expect(diagramOf(['[^a-z]']).getStack()[0]).toBeInstanceOf(ETileRegexGroupAllBut);
    expect(diagramOf(['(?=a)']).getStack()[0]).toBeInstanceOf(ETileLookAheadOrBehind);
    expect(diagramOf(['(?<!a)']).getStack()[0]).toBeInstanceOf(ETileLookAheadOrBehind);
    expect(diagramOf(['(?<n>a)']).getStack()[0]).toBeInstanceOf(ETileNamedGroup);
  });

  it('nests alternations into one and pushes concatenations onto the first', () => {
    const alt = diagramOf(['a|b|c']).getStack()[0];
    expect(alt).toBeInstanceOf(ETileAlternation);
    expect(texts(drawn(diagramOf(['a|b|c'])))).toEqual(['a', 'b', 'c']);
    expect(texts(drawn(diagramOf(['(a|b)c'])))).toEqual(['a', 'b', 'c']);
    expect(texts(drawn(diagramOf(['c(a|b)'])))).toEqual(['c', 'a', 'b']);
    expect(texts(drawn(diagramOf(['[x]ab'])))).toEqual(['x', 'ab']);
  });

  it('maps the quantifiers onto tiles', () => {
    expect(diagramOf(['a*']).getStack()[0]).toBeInstanceOf(ETileZeroOrMore);
    expect(diagramOf(['a+']).getStack()[0]).toBeInstanceOf(ETileOneOrMore);
    expect(diagramOf(['a?']).getStack()[0]).toBeInstanceOf(ETileOptional2);
    expect(diagramOf(['a*?']).getStack()[0]).toBeInstanceOf(ETileZeroOrMore);
  });

  it('cov-braced-all: the braced forms (PSystemRegex.java:235-258)', () => {
    const top = (q: string) => diagramOf([`a${q}`]).getStack()[0];
    expect(top('{0,}')).toBeInstanceOf(ETileZeroOrMore);
    expect(top('{0}')).toBeInstanceOf(ETileZeroOrMore);
    expect(top('{0,0}')).toBeInstanceOf(ETileZeroOrMore);
    expect(top('{0,1}')).toBeInstanceOf(ETileOptional2);
    expect(top('{0,3}')).toBeInstanceOf(ETileOptional2);
    expect(top('{3}')).toBeInstanceOf(ETileOneOrMore);
    expect(top('{2,}')).toBeInstanceOf(ETileOneOrMore);
    // The oracle's labels, 12 px (fontConfiguration.bigger(-2)).
    const svg = drawn(diagramOf(['a{3}b{2,}c{0,}d{0,1}e{0,3}f{2,5}g{0}h{0,0}']));
    expect(texts(svg)).toEqual(['a', '{3}', 'b', '{2,}', 'c', 'd', 'e', '{0,3}', 'f', '{2,5}', 'g', 'h']);
    expect(svg).toMatch(/font-size="12"[^>]*>\{0,3\}<\/text>/);
  });

  it('returns Error parsing on a RegexParsingException (rep D5 kind 2)', () => {
    const result = addLine(regexDiagram(), 'a{x}');
    expect(result.isOk()).toBe(false);
    expect(result.getError()).toBe('Error parsing: Bad quantifier {x}');
    expect(addLine(regexDiagram(), '(ab').getError()).toBe('Error parsing: PARENTHESIS_OPEN[(]');
  });

  it('lets any other throw escape to ProtectedCommand (rep D5 kind 3)', () => {
    for (const line of ['*', 'a|', 'a)b', '(?<abc', '(?<>a)'])
      expect(() => addLine(regexDiagram(), line)).toThrow('NoSuchElementException');
    expect(() => addLine(regexDiagram(), '[]')).toThrow('IndexOutOfBoundsException');
  });

  it('getTextBlock on an empty stack throws when measured (rep D5 kind 4)', () => {
    const block = regexDiagram().getTextBlock();
    expect(() => block.calculateDimension(BOUNDER)).toThrow('NullPointerException');
    expect(() => block.drawU(newGraphic())).toThrow('NullPointerException');
  });

  it('describes itself as (Regular Expression)', () => {
    expect(regexDiagram().getDescription()).toBe('(Regular Expression)');
  });
});

describe('the constructor freezes the tile style (rep D3, PSystemRegex.java:82-97)', () => {
  it('cov-skinparam: a skinparam never reaches a tile', () => {
    const svg = drawn(diagramOf(['a*'], { skinparam: { defaultFontColor: 'red', defaultFontSize: '18' } }));
    expect(svg).toContain('fill="#000" font-size="14">a</text>');
  });

  it('cov-style-element: an element <style> reaches every stroke', () => {
    const svg = drawn(diagramOf(['a(b|c)+\\d'], { styles: ['element {\n  LineColor green\n  RoundCorner 0\n}'] }));
    expect(svg).toContain('stroke:#008000');
    expect(svg).not.toContain('stroke:#181818');
  });

  it('cov-style-regex: a regex <style> does not match the tile signature', () => {
    const svg = drawn(diagramOf(['a'], { styles: ['regex {\n  LineColor red\n  FontColor blue\n}'] }));
    expect(svg).toContain('fill="#000" font-size="14">a</text>');
  });

  it('a style that does not parse is dropped whole, as printStackTrace', () => {
    const svg = drawn(diagramOf(['a'], { styles: ['element { FontColor blue }', 'node { { }'] }));
    expect(svg).toContain('fill="#000" font-size="14">a</text>');
  });

  it('reads !option useDescriptiveNames through ETileBox', () => {
    const svg = drawn(diagramOf(['\\d'], { options: { [OptionKey.USE_DESCRIPTIVE_NAMES]: 'true' } }));
    // cov-descriptive-names' oracle text: `Digit` (I18n's English bundle).
    expect(texts(svg)).toEqual(['Digit']);
  });
});

describe('the braced helpers (PSystemRegex.java:260-305)', () => {
  it('parses minimum and maximum as Java does', () => {
    expect(parseBracedMin('{,5}')).toBe(0);
    expect(parseBracedMin('{3}')).toBe(3);
    expect(parseBracedMin('{2,5}?')).toBe(2);
    expect(parseBracedMax('{1,2,3}')).toBe(-1);
    expect(parseBracedMin('{99999999999}')).toBe(-1);
    expect(parseBracedMax('{3}')).toBe(3);
    expect(parseBracedMax('{2,}')).toBe(-1);
    expect(parseBracedMax('{2,5}')).toBe(5);
    expect(isBracedMaxUnbounded('{2,}')).toBe(true);
    expect(isBracedMaxUnbounded('{2}')).toBe(false);
    expect(isBracedMaxUnbounded('{2,5}')).toBe(false);
  });
});

describe('the cached rows (rep T2a acceptance)', () => {
  const slugs = readdirSync(REGEX_CACHE);
  const regexLines = (slug: string): string[] =>
    readFileSync(`${REGEX_CACHE}/${slug}/in.puml`, 'utf8')
      .split('\n')
      .slice(1)
      .filter((l) => !/^@end/.test(l) && !NOT_REGEX.test(l.trim()));

  it.each(slugs.filter((s) => !JAR_ERROR_ROWS.has(s)))('%s: every line is ok', (slug) => {
    const diagram = regexDiagram();
    for (const line of regexLines(slug)) {
      const result = addLine(diagram, line);
      expect(result.isOk() ? 'ok' : result.getError()).toBe('ok');
    }
  });

  it.each([...JAR_ERROR_ROWS])('%s: Bad quantifier at its regex line', (slug) => {
    const [line] = regexLines(slug);
    expect(addLine(regexDiagram(), line!).getError()).toBe('Error parsing: Bad quantifier {([^{}');
  });
});
