/**
 * laep T2b: every legacy row of the brief (`measurements/planning-rows.json`, the 124 sources the jar drew through
 * `ActivityDiagramFactory`) against its cached `svek-1.dot`. The DOT-parity gate over the pinned goldens is T4's;
 * this is the bar T2b met: structurally equal, node sizes exact. T3b-2: the two swimlane rows (cutuzu-67, xoxite-49) joined it. T2d: a row with an
 * autarkic group has one `layoutGraph` call per `svek-N.dot`, nested pass first (fozoxu-26-fibu076: two).
 */
import { describe, expect, it } from 'vitest';
import rows from '../../../plans/legacy-activity-engine-port/measurements/planning-rows.json' with { type: 'json' };
import { compareRowPasses, oracleDotsOf } from '../../helpers/legacy-activity-dot.js';

/** Float slack of a 6dp inches string, as the parity gates allow. */
const SIZE_SLACK = 1e-6 + Number.EPSILON;

const LEGACY_ROWS = rows as readonly { bucket: string; slug: string }[];

describe('the 124 legacy rows', () => {
  it('lists 124 rows', () => {
    expect(LEGACY_ROWS).toHaveLength(124);
  });

  for (const { bucket, slug } of LEGACY_ROWS) {
    it(`${bucket}/${slug}: each layoutGraph call structurally equal to its svek-N.dot, node sizes exact`, () => {
      const diffs = compareRowPasses(bucket, slug);

      expect(diffs).toHaveLength(oracleDotsOf(bucket, slug).length);
      for (const diff of diffs) {
        expect(diff.structurallyEqual, JSON.stringify(diff)).toBe(true);
        expect(diff.maxSizeDeltaIn).toBeLessThanOrEqual(SIZE_SLACK);
      }
    });
  }
});
