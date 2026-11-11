import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { DeterministicMeasurer } from '../../../src/core/measurer-deterministic.js';
import { parseRefusalOf } from '../../../src/core/parse-refusal.js';
import { PSystemLatex } from '../../../src/diagrams/math/PSystemLatex.js';
import { parseLatexDiagram } from '../../../src/diagrams/math/PSystemLatexFactory.js';
import { getColor, parseJavaFloat, PSystemMath } from '../../../src/diagrams/math/PSystemMath.js';
import { parseMathDiagram } from '../../../src/diagrams/math/PSystemMathFactory.js';
import { compareSvg } from '../../oracle/svg-conformance/compare.js';
import { sourceOf } from '../../helpers/utility-single-line.js';

const MEASURER = new DeterministicMeasurer();

const CORPUS = new URL('../../../test-results/dot-cache/unknown/', import.meta.url);

function corpus(slug: string, file: 'in.puml' | 'in.svg'): string {
  return readFileSync(new URL(`${slug}/${file}`, CORPUS), 'utf8');
}

function math(text: string): PSystemMath {
  const parsed = parseMathDiagram(sourceOf(text));
  if (!(parsed instanceof PSystemMath)) throw new Error(`refused: ${parseRefusalOf(parsed)?.message}`);
  return parsed;
}

function latex(text: string): PSystemLatex {
  const parsed = parseLatexDiagram(sourceOf(text));
  if (!(parsed instanceof PSystemLatex)) throw new Error(`refused: ${parseRefusalOf(parsed)?.message}`);
  return parsed;
}

function size(svg: string): string {
  return /width="(\d+)" height="(\d+)" xmlns=/.exec(svg)!.slice(1).join('x');
}

/** The background paint group's style. */
function paint(svg: string): string {
  return /<g style="([^"]*)"\n {4}><rect/.exec(svg)![1]!;
}

describe('PSystemMath / PSystemLatex', () => {
  it('caruta-83-deta919: 319x44 on yellow, root identical to the jar', () => {
    const svg = math(corpus('caruta-83-deta919', 'in.puml')).exportDiagram(0, MEASURER);
    expect(size(svg)).toBe('319x44');
    expect(paint(svg)).toBe('fill:yellow; stroke:yellow;');
    for (const d of compareSvg(svg, corpus('caruta-83-deta919', 'in.svg'), 'deterministic').diffs)
      expect(d.path).toMatch(/^svg\/g\[1\]/);
  });

  it.each(['tijica-43-sesu519', 'geravi-79-nafu641'])('%s: scale and dpi never reach SVG (439x68)', (slug) => {
    const diagram = math(corpus(slug, 'in.puml'));
    expect(size(diagram.exportDiagram(0, MEASURER))).toBe('439x68');
    expect(diagram.getScale()).toBe(slug.startsWith('tijica') ? 5 : Math.fround(300) / 96);
  });

  it('seluva-39-xebe172: a $-wrapped latex formula sizes as fajagi-98-funo863 (109x71)', () => {
    expect(size(latex(corpus('seluva-39-xebe172', 'in.puml')).exportDiagram(0, MEASURER))).toBe('109x71');
    expect(size(latex(corpus('fajagi-98-funo863', 'in.puml')).exportDiagram(0, MEASURER))).toBe('109x71');
  });

  it('the last formula line wins (renice-72-peda344: a^3, 27x26; cov-math-last-wins: 25x26)', () => {
    expect(size(math(corpus('renice-72-peda344', 'in.puml')).exportDiagram(0, MEASURER))).toBe('27x26');
    expect(size(math('@startmath\na\nb\nc^2\n@endmath').exportDiagram(0, MEASURER))).toBe('25x26');
  });

  it('a bad colour is white (cov-math-color-bad); gold is rgb(255,215,0) (cov-latex-color)', () => {
    expect(paint(math('@startmath\ncolor notacolor\nx^2\n@endmath').exportDiagram(0, MEASURER))).toBe(
      'fill:white; stroke:white;',
    );
    const gold = latex('@startlatex\ncolor blue\nbackgroundcolor gold\n\\frac{a}{b}\n@endlatex').exportDiagram(
      0,
      MEASURER,
    );
    expect(paint(gold)).toBe('fill:rgb(255,215,0); stroke:rgb(255,215,0);');
    expect(size(gold)).toBe('24x45');
    expect(gold).toContain('color:blue');
  });

  it('directives are case-insensitive; bad scale and dpi 0 are ignored (cov-math-upper, -scale-bad, -dpi-zero)', () => {
    const upper = math('@startmath\nCOLOR red\nSCALE 2\nx^2\n@endmath');
    expect(upper.getScale()).toBe(2);
    expect(upper.exportDiagram(0, MEASURER)).toContain('color:red');
    expect(math('@startmath\nscale abc\nx^2\n@endmath').getScale()).toBe(1);
    expect(math('@startmath\ndpi 0\nx^2\n@endmath').getScale()).toBe(1);
  });

  it('reads an indented directive argument from the untrimmed line: "  color red" is "or red", white', () => {
    expect(math('@startmath\n  color red\nx\n@endmath').exportDiagram(0, MEASURER)).toContain('color:white');
  });

  it('keeps a formula line untrimmed (cov-math-trim: 27x26) and draws an empty formula 8x8 (cov-math-only-directive)', () => {
    expect(size(math('@startmath\n   x^2   \n@endmath').exportDiagram(0, MEASURER))).toBe('27x26');
    expect(size(math('@startmath\ncolor red\n@endmath').exportDiagram(0, MEASURER))).toBe('8x8');
  });

  it('strips math-mode dollars as JLaTeXMath does (cov-latex-dollar: 27x26)', () => {
    expect(size(latex('@startlatex\n$$x^2$$\n@endlatex').exportDiagram(0, MEASURER))).toBe('27x26');
  });

  it('answers Empty description for an empty block and describes itself', () => {
    expect(parseMathDiagram(sourceOf('@startmath\n@endmath'))).toMatchObject({ message: 'Empty description' });
    expect(parseLatexDiagram(sourceOf('@startlatex\n@endlatex'))).toMatchObject({ message: 'Empty description' });
    expect(math('@startmath\nx\n@endmath').getDescription()).toBe('(Math)');
    expect(latex('@startlatex\nx\n@endlatex').getDescription()).toBe('(Latex)');
  });

  it('parseJavaFloat follows Float.parseFloat', () => {
    expect(parseJavaFloat(' 2.5f ')).toBe(2.5);
    expect(parseJavaFloat('1e1')).toBe(10);
    expect(parseJavaFloat('.5')).toBe(0.5);
    expect(parseJavaFloat('abc')).toBeUndefined();
    expect(parseJavaFloat('')).toBeUndefined();
  });

  it('getColor: a gradient answers its first colour; automatic throws as HColor#toColor does', () => {
    expect(getColor('red|blue')).toEqual({ r: 255, g: 0, b: 0, a: 255 });
    expect(() => getColor('automatic')).toThrow(/UnsupportedOperationException/);
  });
});
