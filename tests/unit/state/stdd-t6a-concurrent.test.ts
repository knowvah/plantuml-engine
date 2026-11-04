import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { renderSync } from '../../../src/index.js';
import { DeterministicMeasurer } from '../../../src/core/measurer-deterministic.js';
import { compareSvg } from '../../oracle/svg-conformance/compare.js';

/**
 * stdd T6a, concurrent regions inside a cluster composite (`jijuze-43-ceva131`: `state XA6 { XA6 --> XA1 -- state
 * XA13 }`, a self-linked composite that graphviz lays out as a cluster).
 * - a `CONCURRENT_STATE` region is autarkic (`Entity.java:700-701`) and its image is the raw `SvekResult`
 *   (`GroupMakerState.java:116-117`), which `SvekResult#drawU` paints without a group or a box of its own
 *   (`SvekResult.java:69-95`): no dashed rect, no `<g class="entity">` for the region.
 * - the region re-enters the cluster's DOT as a leaf sized `minMax + (15, 15)` and its content moved to
 *   `(6 - minX, 6 - minY)` (`SvekResult.java:130-135`), the same recipe as a plain composite's child pass.
 * - `Entity#leafs()` walks the quark children in creation order (`Entity.java:649-657`): `--` runs on pass
 *   ONE (`CommandConcurrentState.java:57-59`), a link and its auto-created endpoint on pass TWO
 *   (`CommandLinkStateCommon.java:70-72`), so `CONC1` precedes `XA1` in the jar's `svek-2.dot`.
 * - a group inside a region that a link crosses (`state b { state c }` with `c -> d`, darime-88) is a
 *   `Cluster` of that region's own svek pass (`GroupMakerState.java:139-149`): the stacked result carries
 *   the region's clusters so the box is graphviz's, not the dashed fallback.
 * - `Entity#isAutarkic` reads the group's DIRECT leafs for a border point (`Entity.java:706-708`):
 *   fejuja-91's `Foo { Bar { xuq3 <<exitPoint>> } }` makes Bar a cluster and Foo an autonom leaf.
 * - `SvekEdge#drawRainbow` draws every extremity into the `LimitFinder` (`SvekEdge.java:1108-1142`), whose
 *   polygon rule pads x by `HACK_X_FOR_POLYGON = 10` (`LimitFinder.java:169-177`): jetuse-93's `[*] --> A1`
 *   arrowhead beside the cluster widens `Running` by 5.
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

describe('stdd T6a: a concurrent region inside a cluster composite', () => {
  it('draws the region as its raw svek result: no dashed box, no entity group', () => {
    const { ours } = cachedDiffs('jijuze-43-ceva131');
    expect(ours).not.toContain('stroke-dasharray="6,3"');
    expect(ours).not.toContain('XA6::CONC1');
  });

  it('orders the region leaf before a pass-two endpoint and sizes it minMax + 15', () => {
    const { ours, diffs } = cachedDiffs('jijuze-43-ceva131');
    // XA13 sits in the region on the left (jar `svek-2.dot`: sh0010 before sh0011); XA1 on the right.
    expect(ours).toMatch(/<rect x="37.85" y="99.72" width="54.3" height="50"/);
    expect(ours).toMatch(/<rect x="136" y="100.22" width="50" height="50"/);
    expect(diffs).toEqual([]);
  });

  it.each(['darime-88-moda428', 'lumamo-63-zupa263', 'jetuse-93-gopi146', 'fejuja-91-fizi694'])(
    '%s matches the jar',
    (slug) => {
      const { ours, diffs } = cachedDiffs(slug);
      expect(ours).not.toContain('stroke-dasharray="6,3"');
      expect(diffs).toEqual([]);
    },
  );
});
