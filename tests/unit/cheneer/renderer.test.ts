/**
 * The Chen renderer through `chenPlugin` (cheneer T2d): the svek draw order, the edge adapter, the chrome route that
 * prints `CHEN_EER`, and the one-leaf `EntityImageDegenerated` canvas. The oracles are the jar's renders of the
 * fixtures (`tests/fixtures/cheneer/<slug>.svg`, ceep T3b).
 */
import { describe, expect, it } from 'vitest';
import { compareSvg } from '../../oracle/svg-conformance/compare.js';
import { chenDrawnProbeSlugs, oracleSvg, probeSource } from './oracle-fixtures.js';
import { renderChen } from './render-chen.js';

/** The diffs of a probe's render against its jar oracle. */
function probeDiffs(slug: string): { path: string; actual: unknown; expected: unknown }[] {
  return compareSvg(renderChen(probeSource(slug)), oracleSvg(slug), 'deterministic').diffs;
}

describe('renderer: probes conformant against the jar', () => {
  it.each([
    ['cov-rel-link', 'a relationship with an attribute and links'],
    ['cov-cardinality', 'cardinality labels on association links'],
    ['cov-entity-colors', 'entity and attribute colours'],
    ['cov-title-chrome', 'title chrome around a single entity'],
    ['cov-scale', 'scale through the exporter'],
    ['cov-skinparam', 'skinparam background and font'],
  ])('%s (%s) has 0 diffs', (slug) => {
    expect(probeDiffs(slug)).toEqual([]);
  });
});

describe('renderer: every fixture the jar drew as CHEN_EER without ELK', () => {
  it('lists the 70 graphviz-path fixtures (ceep T3b-T3c: 84 sources minus 13 error pages and cov-elk)', () => {
    expect(chenDrawnProbeSlugs()).toHaveLength(70);
  });

  it.each(chenDrawnProbeSlugs())('%s has 0 diffs', (slug) => {
    expect(probeDiffs(slug)).toEqual([]);
  });
});

describe('renderer: the printed type and the one-leaf canvas', () => {
  it('prints CHEN_EER through its own routing key', () => {
    const svg = renderChen(probeSource('cov-entity-empty'));
    expect(svg).toContain('data-diagram-type="CHEN_EER"');
  });

  it('sizes an entity alone as the leaf plus delta 7 plus the 5px margin', () => {
    const svg = renderChen(probeSource('cov-entity-empty'));
    expect(svg).toContain('width="49px" height="54px" viewBox="0 0 49 54"');
    expect(svg).toContain('<rect x="7" y="7" width="29.363" height="34"');
  });

  it('sizes a relationship alone the same way', () => {
    const svg = renderChen(probeSource('cov-relationship'));
    expect(svg).toContain('width="106px" height="63px" viewBox="0 0 106 63"');
    expect(svg).toContain('points="7,28.537,50.074,7,93.148,28.537,50.074,50.074"');
  });
});
