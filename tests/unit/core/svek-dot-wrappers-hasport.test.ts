import { describe, it, expect } from 'vitest';
import { wrapperLevels } from '../../../src/core/svek-dot-wrappers.js';
import type { DotInputCluster } from '../../../src/core/graph-layout.types.js';

/** `ClusterDotString.java:98,109-112,151`: a hasPort cluster has protection off and
 *  `a`/`i` on `thereALinkFromOrToGroup1` (T4b opt-in via `borderPointAncestorWrap`). */
const hasPort = (extra: Partial<DotInputCluster>): DotInputCluster => ({
  id: 'cluster0',
  nodeIds: [],
  portRanks: [{ rank: 'source', nodeIds: ['p'] }],
  portAnchorId: 'zaent0',
  ...extra,
});

describe('wrapperLevels for a hasPort cluster', () => {
  it('yields a/i only, never p0/p1, when borderPointAncestorWrap is set', () => {
    expect(wrapperLevels(hasPort({ borderPointAncestorWrap: true }))).toEqual({
      a: true,
      p0: false,
      i: true,
      p1: false,
    });
  });

  it('is unchanged (no wrappers) without the opt-in and without innerMarginLevels', () => {
    expect(wrapperLevels(hasPort({}))).toEqual({ a: false, p0: false, i: false, p1: false });
  });
});

/** lpl T1b: a swimlane cluster (`ClusterDotString.java:107-115,299-315`) never has `p0`/`p1`; a link to its group
 *  (`thereALinkFromOrToGroup1`, carried as its special point `unwrappedNodeId`) opens `a` and `i` (`:98,151`). */
const lane = (extra: Partial<DotInputCluster>): DotInputCluster => ({
  id: 'cluster1',
  nodeIds: ['ent0002'],
  swimlane: true,
  ...extra,
});

describe('wrapperLevels for a swimlane cluster', () => {
  it('yields a/i only when the group is linked (its special point is unwrappedNodeId)', () => {
    expect(wrapperLevels(lane({ unwrappedNodeId: 'zaent0001' }))).toEqual({ a: true, p0: false, i: true, p1: false });
  });

  it('yields no wrapper when the group is not linked', () => {
    expect(wrapperLevels(lane({}))).toEqual({ a: false, p0: false, i: false, p1: false });
  });
});
