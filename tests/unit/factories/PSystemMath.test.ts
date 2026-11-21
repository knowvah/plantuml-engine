/**
 * `@startmath` / `@startlatex` since upstream `aa79d2d80ee` (the a720bdd oracle): the formula is a TextBlock
 * exported through `TextBlockExporter` with the formula's scale and a transparent back colour
 * (`ScientificEquationSafe.java:162-172`); a background colour paints a rectangle of the formula's size
 * (:129-133); a formula that cannot be made is its source as monospace text (:124-128). Only the glyphs differ:
 * the jar draws JLaTeXMath's outlines as `<path>`s, the port KaTeX's image (DIVERGENCES.md, "LaTeX rendering
 * engine"), so every comparison below allows exactly that and nothing else.
 */
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { HColorGradient } from '../../../src/core/klimt/color/HColorGradient.js';
import { HColorSimple } from '../../../src/core/klimt/color/HColorSimple.js';
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
const AUTHORED = new URL('../../fixtures/factories/', import.meta.url);

/** The jar draws the glyphs as paths where the port draws one image: the only diffs the divergence allows. */
const GLYPH_DIFF = /^svg\/g\[1\](?:\[childCount\]|\/image\[1\])$/;

function corpus(slug: string, file: 'in.puml' | 'in.svg'): string {
  return readFileSync(new URL(`${slug}/${file}`, CORPUS), 'utf8');
}

function authored(name: string, ext: 'puml' | 'svg'): string {
  return readFileSync(new URL(`${name}.${ext}`, AUTHORED), 'utf8');
}

function render(text: string): string {
  const parsed = text.startsWith('@startlatex') ? parseLatexDiagram(sourceOf(text)) : parseMathDiagram(sourceOf(text));
  if (parsed instanceof PSystemMath || parsed instanceof PSystemLatex) return parsed.exportDiagram(0, MEASURER);
  throw new Error(`refused: ${parseRefusalOf(parsed)?.message}`);
}

function math(text: string): PSystemMath {
  const parsed = parseMathDiagram(sourceOf(text));
  if (!(parsed instanceof PSystemMath)) throw new Error(`refused: ${parseRefusalOf(parsed)?.message}`);
  return parsed;
}

function size(svg: string): string {
  return /width="(\d+)px" height="(\d+)px"/.exec(svg)!.slice(1).join('x');
}

/** The diffs against the jar that are not the glyph structure. */
function nonGlyphDiffs(ours: string, jar: string): string[] {
  return compareSvg(ours, jar, 'deterministic')
    .diffs.map((d) => d.path)
    .filter((p) => !GLYPH_DIFF.test(p));
}

describe('PSystemMath / PSystemLatex: the TextBlockExporter document', () => {
  it.each(['caruta-83-deta919', 'tijica-43-sesu519', 'seluva-39-xebe172', 'renice-72-peda344'])(
    '%s: everything but the glyphs is the jar document',
    (slug) => {
      const jar = corpus(slug, 'in.svg');
      const ours = render(corpus(slug, 'in.puml'));
      expect(size(ours)).toBe(size(jar));
      expect(nonGlyphDiffs(ours, jar)).toEqual([]);
    },
  );

  it.each([
    'cov-math-back',
    'cov-math-back-transparent',
    'cov-math-color',
    'cov-math-color-bad',
    'cov-math-color-hex',
    'cov-math-dpi-zero',
    'cov-math-last-wins',
    'cov-math-only-directive',
    'cov-math-scale-bad',
    'cov-math-scale-zero',
    'cov-math-trim',
    'cov-math-unknown',
    'cov-math-upper',
    'cov-latex-color',
    'cov-latex-dollar',
    'cov-latex-unknown',
  ])('authored %s: everything but the glyphs is the jar document', (name) => {
    expect(nonGlyphDiffs(render(authored(name, 'puml')), authored(name, 'svg'))).toEqual([]);
  });

  it("caruta-83-deta919: the background is the formula's box, 319 x 44, under a 320 x 45 page", () => {
    const ours = render(corpus('caruta-83-deta919', 'in.puml'));
    expect(ours).toContain('<rect x="0" y="0" width="319" height="44" fill="#FF0" style="stroke:none;"/>');
    expect(size(ours)).toBe('320x45');
  });

  it('scale and dpi reach the SVG (cov-math-upper: SCALE 2 is 56 x 54; tijica-43-sesu519: scale 5)', () => {
    expect(size(render(authored('cov-math-upper', 'puml')))).toBe('56x54');
    expect(size(render(corpus('tijica-43-sesu519', 'in.puml')))).toBe('1760x276');
    expect(math('@startmath\ndpi 192\nx^2\n@endmath').getFormulaScale()).toBe(2);
  });

  it('the rollback is the formula source in monospace text (cov-math-unknown)', () => {
    const ours = render('@startmath\nglb x\n@endmath');
    expect(ours).toMatch(/<text x="5" y="19" [^>]*font-family="monospace">glb.x<\/text>/);
    expect(ours).not.toContain('<image');
  });

  it('directives are case-insensitive; bad scale and dpi 0 are ignored', () => {
    expect(math('@startmath\nCOLOR red\nSCALE 2\nx^2\n@endmath').getFormulaScale()).toBe(2);
    expect(math('@startmath\nscale abc\nx^2\n@endmath').getFormulaScale()).toBe(1);
    expect(math('@startmath\ndpi 0\nx^2\n@endmath').getFormulaScale()).toBe(1);
  });

  it('reads an indented directive argument from the untrimmed line: "  backgroundcolor red" is "r red", white', () => {
    expect(render('@startmath\n  backgroundcolor red\nx\n@endmath')).toMatch(/<rect x="0" y="0" [^>]*fill="#FFF"/);
  });

  it('answers Empty description for an empty block and describes itself', () => {
    expect(parseMathDiagram(sourceOf('@startmath\n@endmath'))).toMatchObject({ message: 'Empty description' });
    expect(parseLatexDiagram(sourceOf('@startlatex\n@endlatex'))).toMatchObject({ message: 'Empty description' });
    expect(math('@startmath\nx\n@endmath').getDescription()).toBe('(Math)');
    expect(parseLatexDiagram(sourceOf('@startlatex\nx\n@endlatex'))).toBeInstanceOf(PSystemLatex);
  });

  it('parseJavaFloat follows Float.parseFloat', () => {
    expect(parseJavaFloat(' 2.5f ')).toBe(2.5);
    expect(parseJavaFloat('1e1')).toBe(10);
    expect(parseJavaFloat('.5')).toBe(0.5);
    expect(parseJavaFloat('abc')).toBeUndefined();
    expect(parseJavaFloat('')).toBeUndefined();
  });

  it('getColor keeps the HColor: a gradient stays a gradient; automatic has no paint here', () => {
    expect(getColor('red|blue')).toBeInstanceOf(HColorGradient);
    expect(getColor('notacolor')).toBeInstanceOf(HColorSimple);
    expect(() => getColor('automatic')).toThrow(/UnsupportedOperationException/);
  });

  it('getFormulaBlock is the exported block (FormulaDiagram)', () => {
    const diagram = math('@startmath\nx^2\n@endmath');
    expect(
      diagram
        .getFormulaBlock()
        .calculateDimension({} as never)
        .getWidth(),
    ).toBe(27);
    const latex = parseLatexDiagram(sourceOf('@startlatex\n\\frac{a}{b}\n@endlatex')) as PSystemLatex;
    expect(
      latex
        .getFormulaBlock()
        .calculateDimension({} as never)
        .getHeight(),
    ).toBe(45);
    expect(latex.getFormulaScale()).toBe(1);
    expect(latex.getFormulaBackground()).toBeInstanceOf(HColorSimple);
  });
});
