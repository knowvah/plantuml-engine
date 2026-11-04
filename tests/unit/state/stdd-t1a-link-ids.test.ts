import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { renderSync } from '../../../src/index.js';
import { DeterministicMeasurer } from '../../../src/core/measurer-deterministic.js';

/**
 * stdd T1a: a `<path id>` is `Link#idCommentForSvg` (`abel/Link.java:106-114`)
 * over `Entity#getName`, made unique by `SvekEdge#uniq`
 * (`svek/SvekEdge.java:1093-1106`) with a set `SvekResult#drawU` shares
 * across every line of one result (`SvekResult.java:93-99`). Values are the
 * jar's own `in.svg` for each cached fixture.
 */

const CACHE = 'test-results/dot-cache/state';
const measurer = new DeterministicMeasurer();

function pathIds(slug: string): string[] {
  const puml = readFileSync(`${CACHE}/${slug}/in.puml`, 'utf8');
  const svg = renderSync(puml, { measurer, jarCompatibleStyleInput: true } as Parameters<typeof renderSync>[1]);
  return [...svg.matchAll(/<path [^>]*\bid="([^"]*)"/g)].map((m) => m[1]!);
}

describe('stdd T1a: link path ids', () => {
  it('bupani-17: a cluster endpoint prints its entity name, never the zaent anchor', () => {
    const ids = pathIds('bupani-17-puxi938');
    expect(ids).toEqual(['A-to-AInternal']);
  });

  it('lobela-82: both directions of a cluster endpoint', () => {
    const ids = pathIds('lobela-82-colu615');
    expect(ids).toContain('*start*-to-Super');
    expect(ids).toContain('Super-to-DND');
    expect(ids.join(' ')).not.toContain('__zaent_');
  });

  it('xupefu-98: the second parallel link gets `-1`', () => {
    const ids = pathIds('xupefu-98-roni234');
    expect(ids.filter((id) => id.startsWith('compound-to-state1'))).toEqual([
      'compound-to-state1',
      'compound-to-state1-1',
    ]);
  });

  it('zofaxi-81: a deep-history endpoint is unique the same way', () => {
    expect(pathIds('zofaxi-81-jupa375')).toEqual(['A-to-*deephistory*B', 'A-to-*deephistory*B-1']);
  });

  it('fomusu-59: two `-to-*end*` links from one state', () => {
    const ids = pathIds('fomusu-59-fupe538');
    expect(ids.filter((id) => id.startsWith('State3-to-*end*'))).toEqual(['State3-to-*end*', 'State3-to-*end*-1']);
  });
});
