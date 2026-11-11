import { existsSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { JLM_NAMES } from '../../../src/core/latex-metrics/jlm-commands.js';
import { jlmAccepts } from '../../../src/core/latex-metrics/jlm-accepts.js';
import { DeterministicMeasurer } from '../../../src/core/measurer-deterministic.js';
import { ScientificEquationSafe } from '../../../src/core/math/ScientificEquationSafe.js';
import { renderSync } from '../../../src/index.js';

const JAR = new URL('../../../oracle/dist/plantuml-oracle.jar', import.meta.url);
const TOOL = new URL('../../../plans/creole-math-factories-port/measurements/jlm-commands.mjs', import.meta.url);

function render(text: string): string {
  return renderSync(text, { measurer: new DeterministicMeasurer() });
}

/** The `<image>` sizes of a document, in order. */
function imageSizes(svg: string): string[] {
  return [...svg.matchAll(/<image width="([\d.]+)" height="([\d.]+)"/g)].map((m) => `${m[1]}x${m[2]}`);
}

describe('JLaTeXMath vocabulary (D6)', () => {
  it.skipIf(!existsSync(JAR) || !existsSync(TOOL))(
    'jlm-commands.ts is exactly what the pinned jar yields',
    async () => {
      const tool = (await import(TOOL.href)) as { deriveJlmNames(): string[] };
      expect([...JLM_NAMES]).toEqual(tool.deriveJlmNames());
    },
  );

  it('holds commands, predefined formulas and symbols, not the names JLaTeXMath rejects', () => {
    for (const name of ['frac', 'sqrt', 'qquad', 'ne', 'bowtie', 'lceil', '\\', 'matrix@env', 'textrm', 'operatorname'])
      expect(JLM_NAMES.has(name)).toBe(true);
    for (const name of ['glb', 'lub', 'Sin', 'Log', 'Lim', 'cancel', 'twoheadrightarrowtail'])
      expect(JLM_NAMES.has(name)).toBe(false);
  });
});

describe('jlmAccepts mirrors TeXParser throws', () => {
  it.each([
    ['\\glb{x}', false], // processEscape: unknown name (cov-math-unknown)
    ['\\notacommand{x}', false], // cov-latex-unknown
    ['{\\Sin{{\\left({x}\\right)}}}', false],
    ['{\\:}}', false], // parse: "Found a closing '}' without an opening '{'!" (AsciiMath `:}`)
    ['\\frac{a', true], // a missing closing brace typesets (cov-latex-syntax, 24x45)
    ['{\\left({x}\\right)}', true],
    ['x\\right)', false], // \right outside \left
    ['a&b', false], // '&' outside array mode
    ['\\begin{matrix}a&b\\end{matrix}', true],
    ['\\begin{nosuchenv}a\\end{nosuchenv}', false], // firstpass: unknown environment
    ['\\text{hi}', true],
    ['x\\', true], // a lone trailing backslash is the empty command
  ])('%s -> %s', (tex, accepted) => {
    expect(jlmAccepts(tex)).toBe(accepted);
  });

  it('an AsciiMath conversion failure has no equation, so it rolls back', () => {
    expect(ScientificEquationSafe.fromLatex('x^2').typesets()).toBe(true);
    expect(ScientificEquationSafe.fromAsciiMath('glb x').typesets()).toBe(false);
  });
});

describe('the rollback document (D5)', () => {
  it.each([
    ['@startmath\nglb x\n@endmath', 'width:40px;height:25px', />glb\u00A0x<\/text>/], // the space is drawn as U+00A0, as the jar's // cov-math-unknown
    ['@startlatex\n\\notacommand{x}\n@endlatex', 'width:119px;height:25px', />\\notacommand\{x\}<\/text>/], // cov-latex-unknown
  ])('a top-level formula JLaTeXMath rejects is a klimt document', (text, size, run) => {
    const svg = render(text);
    expect(svg).toContain(size);
    expect(svg).toMatch(run);
    expect(svg).toContain('font-family="monospace"');
    expect(svg).not.toContain('Batik');
  });

  it('a creole <math> atom draws the rollback image at the corpus sizes', () => {
    const svg = render(
      '@startcreole\n<math>glb</math> <math>Lim</math> <math>:}</math> <math>>->></math> <math>cancel(x)</math>\n@endcreole',
    );
    // cunotu-47 / rozesu-56 / marese-34 corpus images: glb 29x25, Lim 33x25, :} 19x25, >->> 40x25, cancel(x) 67x25.
    expect(imageSizes(svg)).toEqual(['29x25', '33x25', '19x25', '40x25', '67x25']);
  });

  it('a creole <latex> atom rolls back too', () => {
    expect(imageSizes(render('@startcreole\n<latex>\\glb</latex>\n@endcreole'))).toEqual(['33x25']); // jar: 33x25
  });
});
