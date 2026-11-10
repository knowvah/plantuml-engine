/**
 * The EBNF plugin end to end through `renderSync`: routing, the canvas, the chrome and `{{ebnf}}`.
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/ebnf/PSystemEbnfFactory.java
 */
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { upstreamTypeOf } from '../../../src/core/block-extractor.js';
import { DeterministicMeasurer } from '../../../src/core/measurer-deterministic.js';
import { renderSync } from '../../../src/index.js';

const DIR = 'tests/fixtures/ebnf';

function ours(slug: string): string {
  return renderSync(readFileSync(`${DIR}/${slug}.puml`, 'utf8'), {
    jarCompatibleStyleInput: true,
    measurer: new DeterministicMeasurer(),
  } as Parameters<typeof renderSync>[1]);
}

function viewBox(svg: string): string | undefined {
  return /viewBox="([^"]+)"/.exec(svg)?.[1];
}

describe('ebnf plugin', () => {
  it('routes @startebnf to EBNF at the oracle canvas (cov-multiline-rule, 184 × 118)', () => {
    const svg = ours('cov-multiline-rule');
    expect(svg).toContain('data-diagram-type="EBNF"');
    expect(viewBox(svg)).toBe('0 0 184 118');
    expect(upstreamTypeOf('ebnf')).toBe('EBNF');
  });

  it('composes title, caption, legend, header and footer (cov-chrome-all, 146 × 241)', () => {
    expect(viewBox(ours('cov-chrome-all'))).toBe('0 0 146 241');
  });

  it('draws {{ebnf}} inside a sequence note as the jar draws it, a 214 × 118 image (cov-embedded, 339 × 235)', () => {
    const svg = ours('cov-embedded');
    expect(svg).toContain('data-diagram-type="SEQUENCE"');
    expect(viewBox(svg)).toBe('0 0 339 235');
    expect(svg).toContain('<image width="214" height="118" x="94.919" y="57"');
  });

  it('!option useDescriptiveNames reaches the boxes (cov-descriptive-names)', () => {
    expect(ours('cov-descriptive-names')).toContain('>AnyChar</text>');
    expect(ours('cov-descriptive-names-fr')).toContain('>ToutCaractère</text>');
  });
});
