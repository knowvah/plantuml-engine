import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { renderSync } from '../../../src/index.js';
import { DeterministicMeasurer } from '../../../src/core/measurer-deterministic.js';
import { compareSvg } from '../../oracle/svg-conformance/compare.js';

/**
 * stdd T6b, history pseudostates and qualified endpoints.
 * - `Entity#leafs()` returns a group's quark children in creation order (`Entity.java:649-657`) and
 *   `GraphvizImageBuilder#printEntities` walks that list (`GraphvizImageBuilder.java:348-354`); every link runs on
 *   pass TWO (`CommandLinkStateCommon.java:70-72`), so a `[*]` made by `[*] --> A` (tick 2) prints before the `[H]`
 *   made by `[H] --> A` (tick 11) and takes the left column in `Comp` (butigu-57, diteme-18). The same walk orders
 *   the root's own leafs and `[*]` (polodo-05: `[*] -> State1` first).
 * - a state id is `[%pLN_.:]+` (`CommandLinkStateCommon.java:75-76`), so with the state separator `.`
 *   (`StateDiagram.java:62`) `[*] --> ma::Foo1` names one new root leaf `ma::Foo1` (vogimu-84), not `ma` with a label.
 */

const CACHE = 'test-results/dot-cache/state';
const measurer = new DeterministicMeasurer();

function render(puml: string): string {
  return renderSync(puml, { measurer, jarCompatibleStyleInput: true } as Parameters<typeof renderSync>[1]);
}

function cachedDiffs(slug: string): { ours: string; diffs: unknown[] } {
  const ours = render(readFileSync(`${CACHE}/${slug}/in.puml`, 'utf8'));
  const jar = readFileSync(`${CACHE}/${slug}/in.svg`, 'utf8');
  return { ours, diffs: compareSvg(ours, jar, 'deterministic').diffs };
}

describe('stdd T6b: history pseudostates and qualified endpoints', () => {
  it('orders a composite start before its history, as the jar’s leafs() does (butigu-57)', () => {
    const { ours, diffs } = cachedDiffs('butigu-57-tobi481');
    // Comp's start circle on the left, its history on the right.
    expect(ours).toMatch(/<ellipse cx="33" cy="97" rx="10" ry="10" fill="#222"/);
    expect(ours).toMatch(/<ellipse cx="89" cy="97" rx="11" ry="11" fill="#F1F1F1"/);
    expect(diffs).toEqual([]);
  });

  it('names one leaf `ma::Foo1` for a double-colon endpoint under the dot separator (vogimu-84)', () => {
    const { ours, diffs } = cachedDiffs('vogimu-84-bali512');
    expect(ours).toContain('>ma::Foo1</text>');
    expect(ours).toContain('id="*start*-to-ma::Foo1"');
    expect(ours).not.toContain('>:Foo1</text>');
    expect(diffs).toEqual([]);
  });

  it.each(['diteme-18-favi840'])('%s matches the jar', (slug) => {
    expect(cachedDiffs(slug).diffs).toEqual([]);
  });

  it('moves a composite’s self-link to the cluster edge plus the moveDelta again (polodo-05)', () => {
    const { ours, diffs } = cachedDiffs('polodo-05-rene471');
    // `SvekEdge.java:863-869`: State3's right edge is 393, the raw start 337.56, the moveDelta -17.
    expect(ours).toMatch(/<path d="M376,302.42 C387.96,290.5 410.8,290.7 410.8,303/);
    expect(diffs).toEqual([]);
  });
});
