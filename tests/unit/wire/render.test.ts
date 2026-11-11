/**
 * The wire engine through `renderSync`: document type, size and the embedded path, against the jar's probes and
 * `dogoso-52-labe953`.
 */
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { upstreamTypeOf } from '../../../src/core/block-extractor.js';
import { DeterministicMeasurer } from '../../../src/core/measurer-deterministic.js';
import { renderSync } from '../../../src/index.js';

const FIXTURES = new URL('../../fixtures/wire/', import.meta.url);
const options = { measurer: new DeterministicMeasurer(), jarCompatibleStyleInput: true } as const;

function renderFixture(slug: string): string {
  return renderSync(readFileSync(new URL(`${slug}.puml`, FIXTURES), 'utf8'), options);
}

function dims(svg: string): readonly [number, number] {
  const m = /viewBox="0 0 (\d+) (\d+)"/.exec(svg);
  if (m === null) throw new Error('no viewBox');
  return [Number(m[1]), Number(m[2])];
}

describe('renderSync on @startwire', () => {
  it('marks the document WIRE', () => {
    expect(renderSync('@startwire\n* a\n@endwire', options)).toContain('data-diagram-type="WIRE"');
  });

  it.each([
    ['cov-chrome-all', 71, 204],
    ['cov-title-only', 121, 156],
    ['cov-link-reversed-h', 366, 151],
    ['cov-embedded', 206, 248],
  ])('%s is %d x %d', (slug, width, height) => {
    expect(dims(renderFixture(slug))).toEqual([width, height]);
  });

  it('cov-dark paints the background #1B1B1B', () => {
    expect(renderFixture('cov-dark')).toContain('background:#1B1B1B;');
  });

  it('cov-empty is the Welcome page', () => {
    expect(renderFixture('cov-empty')).toContain('Welcome to PlantUML!');
  });

  it('cov-indent-too-deep is an error page, not a throw', () => {
    const svg = renderFixture('cov-indent-too-deep');
    expect(svg).toContain('You should send a mail');
    expect(svg).not.toContain('data-diagram-type="WIRE"');
  });

  it('upstreamTypeOf("wire") is WIRE', () => {
    expect(upstreamTypeOf('wire')).toBe('WIRE');
  });
});
