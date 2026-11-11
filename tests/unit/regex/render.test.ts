/**
 * The regex plugin through production `renderSync` (rep T3a): routing, the export size, chrome, the embedded path
 * and the crash path.
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/PSystemBuilder.java:197
 */
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { upstreamTypeOf } from '../../../src/core/block-extractor.js';
import { compareSvg } from '../../oracle/svg-conformance/compare.js';
import { readAuthoredRegexFixture, renderFixtureRegex } from '../../oracle/svg-conformance/render-fixture-regex.js';

const REGEX_CACHE = 'test-results/dot-cache/regex';

/** The root `width`/`height` attributes of an SVG. */
function size(svg: string): [number, number] {
  const match = /<svg[^>]* width="(\d+)px" height="(\d+)px"/.exec(svg);
  if (match === null) throw new Error('no svg size');
  return [Number(match[1]), Number(match[2])];
}

function renderFixture(slug: string): string {
  return renderFixtureRegex(readAuthoredRegexFixture(slug).markup);
}

describe('the regex plugin (PSystemBuilder.java:197)', () => {
  it('upstreamTypeOf("regex") is REGEX', () => {
    expect(upstreamTypeOf('regex')).toBe('REGEX');
  });

  it('leluxe-05-lava324 draws REGEX at the cached size, byte-identical', () => {
    const svg = renderFixtureRegex(readFileSync(`${REGEX_CACHE}/leluxe-05-lava324/in.puml`, 'utf8'));
    const golden = readFileSync(`${REGEX_CACHE}/leluxe-05-lava324/in.svg`, 'utf8');
    expect(svg).toContain('data-diagram-type="REGEX"');
    expect(size(svg)).toEqual(size(golden));
    expect(compareSvg(svg, golden, 'deterministic').diffs).toEqual([]);
  });

  it.each([
    ['cov-chrome-all', [212, 246]],
    ['cov-multi-line', [96, 89]],
    ['cov-embedded', [361, 233]],
  ] as const)('%s renders at the oracle size %j', (slug, expected) => {
    expect(size(renderFixture(slug))).toEqual(expected);
  });

  it('cov-embedded draws {{regex}} inside a sequence note', () => {
    const svg = renderFixture('cov-embedded');
    expect(svg).toContain('data-diagram-type="SEQUENCE"');
    expect(compareSvg(svg, readAuthoredRegexFixture('cov-embedded').golden!, 'deterministic').diffs).toEqual([]);
  });

  it('cov-title-only renders an error page rather than throwing out of renderSync (rep D5 kind 4)', () => {
    const svg = renderFixture('cov-title-only');
    expect(svg).not.toContain('data-diagram-type="REGEX"');
    expect(svg).toContain('NullPointerException');
  });

  it('vokasi-57-zupa746 draws the preprocessor warning "No such !option foo"', () => {
    const svg = renderFixtureRegex(readFileSync(`${REGEX_CACHE}/vokasi-57-zupa746/in.puml`, 'utf8'));
    // The jar's warning text separates words with U+00A0 (the cached in.svg).
    expect(svg).toContain('>No\u00a0such\u00a0!option\u00a0foo</text>');
    expect(
      compareSvg(svg, readFileSync(`${REGEX_CACHE}/vokasi-57-zupa746/in.svg`, 'utf8'), 'deterministic').diffs,
    ).toEqual([]);
  });
});
