/**
 * The nwdiag plugin end to end through `renderSync`: routing, the canvas,
 * the chrome path and the `{{nwdiag}}` embed, against the jar's renders of
 * the planning probes (tests/fixtures/nwdiag/<slug>.svg).
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/PSystemBuilder.java:155
 */
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { upstreamTypeOf } from '../../../src/core/block-extractor.js';
import { DeterministicMeasurer } from '../../../src/core/measurer-deterministic.js';
import { renderSync } from '../../../src/index.js';

const DIR = 'tests/fixtures/nwdiag';

function ours(slug: string): string {
  return renderSync(readFileSync(`${DIR}/${slug}.puml`, 'utf8'), {
    jarCompatibleStyleInput: true,
    measurer: new DeterministicMeasurer(),
  } as Parameters<typeof renderSync>[1]);
}

function viewBox(svg: string): string | undefined {
  return /viewBox="([^"]+)"/.exec(svg)?.[1];
}

describe('nwdiag plugin', () => {
  it('routes @startnwdiag to NWDIAG at the oracle canvas (cov-no-wrapper, 210 × 117)', () => {
    const svg = ours('cov-no-wrapper');
    expect(svg).toContain('data-diagram-type="NWDIAG"');
    expect(viewBox(svg)).toBe('0 0 210 117');
    expect(upstreamTypeOf('nwdiag')).toBe('NWDIAG');
  });

  it('composes title, caption, legend, header and footer (cov-chrome-all, 210 × 240)', () => {
    const svg = ours('cov-chrome-all');
    expect(viewBox(svg)).toBe(viewBox(readFileSync(`${DIR}/cov-chrome-all.svg`, 'utf8')));
    expect(viewBox(svg)).toBe('0 0 210 240');
  });

  it('draws {{nwdiag}} inside a sequence note (cov-embedded)', () => {
    const svg = ours('cov-embedded');
    expect(svg).toContain('data-diagram-type="SEQUENCE"');
    const oracle = readFileSync(`${DIR}/cov-embedded.svg`, 'utf8');
    expect(viewBox(svg)).toBe(viewBox(oracle));
    expect(svg).toContain('fill="#E2E2F0"');
  });

  it('a description outside any network is an error page at line 3 (cov-description-outside)', () => {
    const svg = ours('cov-description-outside');
    expect(svg).toContain('[From string (line 3) ]');
    expect(svg).toContain('NullPointerException');
  });
});
