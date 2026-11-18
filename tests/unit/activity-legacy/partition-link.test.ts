/**
 * lpl (#157): a legacy activity link whose end is a partition. Upstream names the group's special point
 * (`Bibliotekon#getNodeUid` -> `Cluster.getSpecialPointId`, `Bibliotekon.java:126-137`, `Cluster.java:104,653-655`),
 * declares it in the base cluster and wraps the members in `a`/`p0`/`i`/`p1` (`ClusterDotString.java:91-155`). The
 * expected DOTs are the jar's `svek-1.dot`, pinned under `oracle/goldens/activity-legacy/<slug>/` (lpl T1a step 5).
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { setLayoutInputObserver, type DotInputGraph } from '../../../src/core/graph-layout.js';
import { toSvekDot } from '../../../src/core/svek-dot-emit.js';
import { renderFixtureActivityLegacy } from '../../oracle/svg-conformance/render-fixture-activity-legacy.js';
import { compareStructural, dotInputToStructural, parseSvekDot } from '../../oracle/svek-dot.js';
import { structuralFailures } from '../../oracle/dot-parity-backlogs.js';
import { compareSvg } from '../../oracle/svg-conformance/compare.js';

const GOLDENS = join(import.meta.dirname, '../../../oracle/goldens/activity-legacy');
const FIXTURES = join(import.meta.dirname, '../../fixtures/activity-legacy');

/** The slugs whose DOT is structurally equal to the jar's: T1a's, T1b's swimlane and T1c's kermor. */
const EQUAL_SLUGS = [
  'partition-link-swimlane',
  'partition-link-kermor',
  'partition-link',
  'partition-link-to-partition',
  'partition-link-from-outside',
  'partition-link-nested',
  'partition-link-label',
  'partition-link-colored',
  'partition-link-ltr',
  'partition-link-self',
];

let captured: DotInputGraph[] = [];
beforeEach(() => {
  captured = [];
  setLayoutInputObserver(({ graph }) => captured.push(graph));
});
afterEach(() => setLayoutInputObserver(undefined));

/** The one layout graph the render of fixture `slug` hands the engine. */
function graphOf(slug: string): DotInputGraph {
  renderFixtureActivityLegacy(readFileSync(join(FIXTURES, `${slug}.puml`), 'utf8'));
  expect(captured).toHaveLength(1);
  return captured[0]!;
}

describe('a legacy activity link to a partition: the DOT', () => {
  for (const slug of EQUAL_SLUGS) {
    it(`${slug}: structurally equal to the jar's svek-1.dot`, () => {
      const jar = parseSvekDot(readFileSync(join(GOLDENS, slug, 'svek-1.dot'), 'utf8'));
      const diff = compareStructural(jar, dotInputToStructural(graphOf(slug)));

      expect(structuralFailures(diff)).toEqual([]);
      expect(diff.maxSizeDeltaIn).toBeLessThanOrEqual(1e-6);
    });
  }

  it('partition-link: the special point is a direct child of the base cluster, inside a/p0 and before i/p1', () => {
    const text = toSvekDot(graphOf('partition-link'));

    expect(text).toMatch(
      /subgraph cluster1a \{label="";\s*subgraph cluster1p0 \{label="";\s*subgraph cluster1 \{[^{}]*zaent0001 \[shape=point,width=\.01,label=""\];\s*subgraph cluster1i \{label="";\s*subgraph cluster1p1 \{label="";/,
    );
    expect(text).toMatch(/sh0011->zaent0001\[/);
    expect(text).toMatch(/zaent0001->sh0012\[/);
  });

  it('partition-link-to-partition: both partitions carry a special point, and the edge names both', () => {
    const graph = graphOf('partition-link-to-partition');
    const points = (graph.clusters ?? []).map((c) => c.unwrappedNodeId);

    expect(points).toEqual(['zaent0001', 'zaent0005']);
    expect(graph.edges.filter((e) => e.from === 'zaent0001').map((e) => e.to)).toEqual(['zaent0005']);
  });

  it('partition-link-empty: an empty partition is an EMPTY_PACKAGE leaf; no special point, the edges name its node', () => {
    const graph = graphOf('partition-link-empty');

    expect(graph.clusters).toBeUndefined();
    expect(graph.nodes.some((n) => n.id.startsWith('za'))).toBe(false);
    expect(graph.edges.map((e) => `${e.from}->${e.to}`)).toEqual(['ent0002->ent0001', 'ent0001->ent0004']);
  });
});

/** lpl T2a: the jar trims a cluster-ended spline to the partition's box (`SvekEdge.java:671-672`, `DotPath#simulateCompound`). */
describe('a legacy activity link to a partition: the drawing', () => {
  // Every partition-link fixture: the clip (`simulateCompound`), the package's magnetic border (`from-outside`,
  // `to-partition`: `Cluster.java:726-758`) and a group's self-link shift (`self`: `SvekEdge.java:863-869`).
  for (const slug of [...EQUAL_SLUGS, 'partition-link-empty']) {
    it(`${slug}: 0 SVG diffs against the jar`, () => {
      const ours = renderFixtureActivityLegacy(readFileSync(join(FIXTURES, `${slug}.puml`), 'utf8'));
      const jar = readFileSync(join(FIXTURES, `${slug}.svg`), 'utf8');

      expect(compareSvg(ours, jar, 'deterministic').diffs).toEqual([]);
    });
  }

  it("partition-link: P --> (*) starts with the tail clip's halvings", () => {
    const ours = renderFixtureActivityLegacy(readFileSync(join(FIXTURES, 'partition-link.puml'), 'utf8'));

    expect(ours).toContain('d="M54,187.759 C54,187.807 54,187.855 54,187.904 ');
  });
});
