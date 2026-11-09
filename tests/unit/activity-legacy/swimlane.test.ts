/**
 * laep T3b-2: swimlane DOT and drawing (`skinparam swimlane true`). Jar values come from the cached rows
 * `activity/xoxite-49-maje588` and `activity/cutuzu-67-sona398` (`svek-1.dot`, `in.svg`).
 */
import { describe, expect, it } from 'vitest';
import { toSvekDot } from '../../../src/core/svek-dot-emit.js';
import type { DotInputGraph } from '../../../src/core/graph-layout.types.js';
import { layoutGraph } from '../../../src/core/graph-layout.js';
import { swimlaneClusterLines, swimlaneRankLines, withSwimlanePoints } from '../../../src/core/svek-dot-swimlane.js';
import { parseThroughPreprocessor, dotOf, oracleDotOf, rowSource } from '../../helpers/legacy-activity-dot.js';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { compareSvg } from '../../oracle/svg-conformance/compare.js';
import { renderLegacy, rowDiffs } from '../../helpers/legacy-activity-render.js';

const XOXITE = 'xoxite-49-maje588';

describe('swimlane DOT text', () => {
  it('writes the rank groups before anything else, one point per lane', () => {
    expect(swimlaneRankLines(['6', '14'])).toEqual([
      '{rank=min;minPoint6 [shape=point,width=.01,label=""];minPoint14 [shape=point,width=.01,label=""];}',
      '{rank=max;maxPoint6 [shape=point,width=.01,label=""];maxPoint14 [shape=point,width=.01,label=""];}',
    ]);
  });

  it('writes the source and sink groups of a lane as the jar does', () => {
    expect(swimlaneClusterLines('6')).toEqual([
      '{rank = source; sourceIn6 [shape=point,width=.01,label=""];minPoint6->sourceIn6  [weight=999];}',
      '{rank = sink; sinkIn6 [shape=point,width=.01,label=""];}sinkIn6->maxPoint6  [weight=999];',
    ]);
  });

  it('emits the lane scaffolding of a legacy source: 3 lanes carry 3 min, 3 max, 3 sourceIn and 3 sinkIn points', () => {
    const text = toSvekDot(dotOf(parseThroughPreprocessor(rowSource('activity', XOXITE))).graph);
    const points = text.match(/(minPoint|maxPoint|sourceIn|sinkIn)\d+ \[shape=point/g) ?? [];

    expect(points).toHaveLength(12);
    expect(text).toContain('{rank=min;minPoint');
    expect(oracleDotOf('activity', XOXITE).match(/(minPoint|maxPoint|sourceIn|sinkIn)\d+ \[shape=point/g)).toHaveLength(
      12,
    );
  });
});

describe('opt-in', () => {
  const plain: DotInputGraph = {
    nodes: [{ id: 'a', width: 40, height: 20 }],
    edges: [],
    clusters: [{ id: 'cluster1', nodeIds: ['a'], innerMarginLevels: 1 }],
  };

  it('leaves a graph with no swimlane cluster untouched', () => {
    expect(withSwimlanePoints(plain)).toBe(plain);
    expect(toSvekDot(plain)).not.toContain('minPoint');
  });

  it('drops the scaffolding from the layout result', () => {
    const lane: DotInputGraph = { ...plain, clusters: [{ id: 'cluster1', nodeIds: ['a'], swimlane: true }] };

    const result = layoutGraph(lane);

    expect(result.nodes.map((n) => n.id)).toEqual(['a']);
    expect(result.edges).toEqual([]);
  });
});

describe('swimlane rows draw as the jar does', () => {
  for (const slug of [XOXITE, 'cutuzu-67-sona398'])
    it(`activity/${slug}: no SVG diff`, () => {
      expect(rowDiffs('activity', slug)).toEqual([]);
    });
});

/**
 * Under `!pragma kermor on`, `ClusterDotStringKermor#printInternal` (`ClusterDotStringKermor.java:100-157`) writes no
 * `sourceIn`/`sinkIn` group and no lane edge: the jar's `svek-1.dot` of `tests/fixtures/activity-legacy/swimlane-kermor`
 * holds only the root `{rank=min;minPoint6;minPoint12}` and `{rank=max;...}` points, members of no cluster.
 */
describe('swimlane under kermor', () => {
  const kermorLane: DotInputGraph = {
    nodes: [{ id: 'a', width: 40, height: 20 }],
    edges: [],
    clusters: [{ id: 'cluster1', nodeIds: ['a'], swimlane: true }],
    kermor: true,
  };

  it('adds only the root min and max points: no sourceIn, sinkIn, lane edge or lane membership', () => {
    const g = withSwimlanePoints(kermorLane);

    expect(g.nodes.map((n) => [n.id, n.attributes?.rank])).toEqual([
      ['a', undefined],
      ['minPointcluster1', 'min'],
      ['maxPointcluster1', 'max'],
    ]);
    expect(g.edges).toEqual([]);
    expect(g.clusters).toEqual(kermorLane.clusters);
  });

  it('swimlane-kermor: no SVG diff', () => {
    const dir = join(import.meta.dirname, '../../fixtures/activity-legacy');
    const puml = readFileSync(join(dir, 'swimlane-kermor.puml'), 'utf8');
    const oracle = readFileSync(join(dir, 'swimlane-kermor.svg'), 'utf8');

    expect(compareSvg(renderLegacy(puml), oracle, 'deterministic').diffs).toEqual([]);
  });
});
