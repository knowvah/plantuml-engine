import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { renderSync } from '../../../src/index.js';
import { DeterministicMeasurer } from '../../../src/core/measurer-deterministic.js';

/**
 * stdd T1b: `EntityImageStateBorder#drawU`
 * (`svek/image/EntityImageStateBorder.java:79-104`) opens no group (unlike
 * `EntityImageState.java:117`'s `UGroupType.CLASS, "entity"`) and draws
 * `desc` before `entityPosition.drawSymbol`. Shape from the jar's `in.svg`
 * of `lulozu-10-bopu547`.
 */

const CACHE = 'test-results/dot-cache/state';
const measurer = new DeterministicMeasurer();

function contentGroup(slug: string): string {
  const puml = readFileSync(`${CACHE}/${slug}/in.puml`, 'utf8');
  const svg = renderSync(puml, { measurer, jarCompatibleStyleInput: true } as Parameters<typeof renderSync>[1]);
  const start = svg.indexOf('<g font-family');
  return svg.slice(start);
}

/** Tag names of the direct children of the content `<g>`, with their class. */
function topLevelTags(body: string): string[] {
  const out: string[] = [];
  let depth = 0;
  for (const m of body.matchAll(/<(\/?)([a-zA-Z]+)([^>]*?)(\/?)>/g)) {
    const [, close, tag, attrs, selfClose] = m;
    if (tag === 'g' && close === '') {
      depth++;
      if (depth === 2) out.push(`g.${/class="([^"]+)"/.exec(attrs!)?.[1] ?? ''}`);
      continue;
    }
    if (tag === 'g' && close === '/') {
      depth--;
      continue;
    }
    if (depth === 1 && close === '' && (selfClose === '/' || tag === 'text')) out.push(tag!);
  }
  return out;
}

describe('stdd T1b: border points', () => {
  it('lulozu-10: label, then symbol, as direct children of the content group', () => {
    const tags = topLevelTags(contentGroup('lulozu-10-bopu547'));
    expect(tags).toEqual(['g.cluster', 'text', 'ellipse', 'text', 'ellipse']);
  });

  it('cinoni-00: an exit point is also unwrapped, label first', () => {
    const body = contentGroup('cinoni-00-sere847');
    expect(body).not.toMatch(/<g class="entity"[^>]*data-qualified-name="[^"]*EC"/);
    const tags = topLevelTags(body);
    expect(tags).toHaveLength(11);
  });
});
