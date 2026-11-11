import { describe, expect, it } from 'vitest';
import { measureTeXIcon } from '../../../src/core/latex-metrics.js';
import { measureLatex } from '../../../src/core/latex.js';

/**
 * Jar sizes (width x height) of formulas whose JLaTeXMath box differs from
 * the glyph KaTeX draws, or that depend on rules KaTeX's metrics do not
 * carry. Every size was read from the pinned oracle jar rendering that
 * formula ALONE (`scripts/oracle-render.sh`).
 */
const JAR_SYMBOLS: readonly (readonly [string, number, number])[] = [
  // `PredefinedTeXFormulas`: ne is \not\equals, notin \not\in, bowtie
  // \mathrel\triangleright\joinrel\mathrel\triangleleft, models
  // \mathrel|\joinrel\equals, mapsto \mapstochar\rightarrow.
  ['\\ne', 24, 26],
  ['\\notin', 22, 26],
  ['\\bowtie', 31, 18],
  ['\\mapsto', 28, 16],
  ['\\models', 27, 28],
  // ldots/cdots are \mathinner of three dots; ddots/vdots are DdotsAtom/VdotsAtom.
  ['\\ldots', 34, 11],
  ['\\cdots', 34, 17],
  ['\\ddots', 34, 24],
  ['\\vdots', 14, 24],
  ['\\ ', 15, 8],
];

/** `RowAtom#createBox`'s kern and ligature pass over `jlm_cmr10` and `jlm_cmmi10`. */
const JAR_KERNS: readonly (readonly [string, number, number])[] = [
  ['\\text{f abc}', 52, 22],
  ['\\text{mod}', 47, 22],
  ['\\text{[f]}', 27, 28],
  ['\\text{fi}', 20, 22],
  ['\\text{fl}', 20, 22],
  ['\\text{ffi}', 25, 22],
  ['\\text{office}', 53, 22],
  ['\\text{a--b}', 40, 22],
  ['\\text{a---b}', 50, 22],
  ["\\text{``a''}", 38, 22],
  ['\\text{AV}', 36, 22],
  ['\\text{To}', 31, 22],
  ['{AV}', 40, 22],
  ['{ab}{fo}{xy}', 71, 26],
];

/** `'` is `CumulativeScriptsAtom`: an empty subscript row beside the primes. */
const JAR_PRIMES: readonly (readonly [string, number, number])[] = [
  ["{f}'", 25, 30],
  ["{f}''", 29, 30],
  ["{f}'''", 32, 30],
  ['{f}^{\\prime}', 25, 29],
];

/** `VlineAtom` widens a separator; `vert` has an extension-only chain. */
const JAR_RULES_AND_FENCES: readonly (readonly [string, number, number])[] = [
  ['{\\left[\\begin{array}{c|c|c} {1}&{3}&{4}\\\\{5}&{7}&{8}\\end{array}\\right]}', 121, 56],
  [
    '{\\left[\\begin{array}{c|ccc} {1}&{2}&{\\left|{x}\\right|}&{5}\\\\{3}&{4}&{\\left|{y}\\right|}&{7}\\end{array}\\right]}',
    165,
    68,
  ],
  ['{\\left|\\frac{{x}}{{2}}+{3}\\right|},{\\left|{x}-\\frac{{4}}{{5}}\\right|}', 151, 56],
  ['{2}+{\\left|\\frac{{3}}{{4}}+{1}\\right|}', 106, 56],
  ['{\\left|\\frac{1}{\\frac{2}{3}}\\right|}', 38, 68],
  ['{\\left\\|\\frac{1}{2}\\right\\|}', 46, 56],
  ['{\\left\\langle{2},{3}\\right\\rangle}', 53, 28],
];

describe('measureTeXIcon: symbols JLaTeXMath builds from other atoms', () => {
  it.each(JAR_SYMBOLS)('%s is %i x %i', (tex, width, height) => {
    expect(measureTeXIcon(tex)).toEqual({ width, height, unsupported: [] });
  });

  it('sizes a lone control space through measureLatex without trimming it away', () => {
    expect(measureLatex('\\ ')).toEqual({ width: 15, height: 8 });
  });
});

describe('measureTeXIcon: kerns and ligatures between same-font glyphs', () => {
  it.each(JAR_KERNS)('%s is %i x %i', (tex, width, height) => {
    expect(measureTeXIcon(tex)).toEqual({ width, height, unsupported: [] });
  });
});

describe('measureTeXIcon: primes', () => {
  it.each(JAR_PRIMES)('%s is %i x %i', (tex, width, height) => {
    expect(measureTeXIcon(tex)).toEqual({ width, height, unsupported: [] });
  });
});

describe('measureTeXIcon: column rules and extensible fences', () => {
  it.each(JAR_RULES_AND_FENCES)('%s is %i x %i', (tex, width, height) => {
    expect(measureTeXIcon(tex)).toEqual({ width, height, unsupported: [] });
  });
});

describe('measureTeXIcon: formulas KaTeX rejects that JLaTeXMath accepts', () => {
  // KaTeX throws on each (library divergence); the formula is sized as the
  // empty one and flagged, never thrown at a renderer. The jar sizes are
  // `\boxempty` 24x22, `^` 9x22, `_` 8x25. (`\sech`, `\csch` and `\-` are
  // JLaTeXMath definitions now given to KaTeX as macros, sized below.)
  it.each(['\\boxempty', '^', '_'])('%s is flagged', (tex) => {
    expect(measureTeXIcon(tex)).toEqual({ width: 8, height: 8, unsupported: ['katex-parse-error'] });
  });
});

describe('cmf T3f follow-ups (orchestrator)', () => {
  it.each([
    ['{\\sech{}}', 45, 22], // PredefinedTeXFormulas sech; KaTeX lacks \sech
    ['{\\csch{}}', 45, 22],
    ['{a}\\-lt{b}', 41, 22], // \- is insertBreakMark_macro
    ['\\-lt', 22, 22],
    ['«{2},{3}»', 63, 25], // roxita-24 [14]: « » are guillemotleft/right in jlm_jlmi10
  ])('%s is %ix%i', (tex, width, height) => {
    expect(measureLatex(tex)).toEqual({ width, height });
  });
});
