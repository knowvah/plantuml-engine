/**
 * Unit tests for `scripts/parity-dashboard-goldens.ts` (mission
 * parity-dashboard-repair, T1): a bucket maps to a LIST of golden families
 * (D1), and the guard that fails when a new `oracle/goldens/svg-*` family is
 * left unmapped (D2). Loader tests build goldens in a temp directory; only
 * the guard reads the real `oracle/goldens`, and it asserts emptiness, never
 * a count.
 */
import { describe, it, expect, afterEach } from 'vitest';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  RATCHET_FAMILY,
  DIFF_BASELINE_FAMILY,
  NON_BUCKET_FAMILIES,
  loadRatchetByType,
  loadDiffBaselineByType,
  unmappedGoldenFamilies,
} from '../../../scripts/parity-dashboard-goldens.js';

const REPO = join(dirname(fileURLToPath(import.meta.url)), '../../..');
const REAL_GOLDENS = join(REPO, 'oracle', 'goldens');

const tempDirs: string[] = [];
afterEach(() => {
  for (const d of tempDirs.splice(0)) rmSync(d, { recursive: true, force: true });
});

function tempGoldens(): string {
  const d = mkdtempSync(join(tmpdir(), 'pdg-goldens-'));
  tempDirs.push(d);
  return d;
}

function writeFamilyFile(goldens: string, family: string, file: string, fixtures: unknown[]): void {
  mkdirSync(join(goldens, family), { recursive: true });
  writeFileSync(join(goldens, family, file), JSON.stringify({ fixtures }));
}

/** Every family a mapped bucket names, so a temp goldens dir can hold them all. */
function allMappedFamilies(map: Readonly<Record<string, readonly string[]>>): string[] {
  return [...new Set(Object.values(map).flat())];
}

describe('RATCHET_FAMILY / DIFF_BASELINE_FAMILY (D1)', () => {
  it('maps gantt and files to their own ratchet families', () => {
    expect(RATCHET_FAMILY.gantt).toEqual(['svg-gantt']);
    expect(RATCHET_FAMILY.files).toEqual(['svg-files']);
    expect(RATCHET_FAMILY.chart).toEqual(['svg-chart']);
  });

  it('maps unknown to the utility, factories, shared description, legacy activity and nwdiag families', () => {
    expect(RATCHET_FAMILY.unknown).toEqual([
      'svg-utility',
      'svg-factories',
      'svg-description',
      'svg-activity-legacy',
      'svg-nwdiag',
    ]);
    expect(RATCHET_FAMILY.network).toEqual(['svg-activity-legacy']);
    expect(DIFF_BASELINE_FAMILY.unknown).toEqual(['svg-utility', 'svg-factories', 'svg-description', 'svg-nwdiag']);
  });

  it('maps gantt to its diff-baseline family and leaves files without one', () => {
    expect(DIFF_BASELINE_FAMILY.gantt).toEqual(['svg-gantt']);
    expect(DIFF_BASELINE_FAMILY.files).toBeUndefined();
  });
});

describe('loadRatchetByType (D1)', () => {
  it('sums the pins of a two-family bucket and keeps the newest date', () => {
    const goldens = tempGoldens();
    for (const family of allMappedFamilies(RATCHET_FAMILY)) writeFamilyFile(goldens, family, 'ratchet.json', []);
    // svg-utility is untyped: every row counts for the bucket that maps it.
    writeFamilyFile(goldens, 'svg-utility', 'ratchet.json', [{ addedAt: '2026-10-13' }, { addedAt: '2026-10-12' }]);
    // svg-description is shared: only rows of the bucket's own type count.
    writeFamilyFile(goldens, 'svg-description', 'ratchet.json', [
      { type: 'unknown', addedAt: '2026-10-14' },
      { type: 'unknown', addedAt: '2026-09-21' },
      { type: 'unknown', addedAt: '2026-10-01' },
      { type: 'component', addedAt: '2026-10-30' },
    ]);
    const out = loadRatchetByType(goldens);
    expect(out.unknown).toEqual({ count: 5, addedAt: '2026-10-14' });
    expect(out.component).toEqual({ count: 1, addedAt: '2026-10-30' });
  });

  it('reads a single-family bucket exactly as before', () => {
    const goldens = tempGoldens();
    for (const family of allMappedFamilies(RATCHET_FAMILY)) writeFamilyFile(goldens, family, 'ratchet.json', []);
    writeFamilyFile(goldens, 'svg-gantt', 'ratchet.json', [{ addedAt: '2026-10-28' }, { addedAt: '2026-10-27' }]);
    writeFamilyFile(goldens, 'svg-files', 'ratchet.json', [{ addedAt: '2026-10-28' }]);
    const out = loadRatchetByType(goldens);
    expect(out.gantt).toEqual({ count: 2, addedAt: '2026-10-28' });
    expect(out.files).toEqual({ count: 1, addedAt: '2026-10-28' });
    expect(out.class).toEqual({ count: 0, addedAt: undefined });
  });
});

describe('loadDiffBaselineByType (D1)', () => {
  it('sums baseline count and score across a bucket’s families, newest date wins', () => {
    const goldens = tempGoldens();
    writeFamilyFile(goldens, 'svg-utility', 'diff-baseline.json', [
      { type: 'unknown', status: 'baseline', weightedScore: 7, measuredAt: '2026-10-14' },
      { type: 'unknown', status: 'error', weightedScore: null, measuredAt: '2026-10-14' },
    ]);
    writeFamilyFile(goldens, 'svg-description', 'diff-baseline.json', [
      { type: 'unknown', status: 'baseline', diffCount: 3, measuredAt: '2026-10-20' },
      { type: 'component', status: 'baseline', diffCount: 28, measuredAt: '2026-09-03' },
    ]);
    const out = loadDiffBaselineByType(goldens);
    expect(out.unknown).toEqual({ count: 2, sum: 10, measuredAt: '2026-10-20' });
    expect(out.component).toEqual({ count: 1, sum: 28, measuredAt: '2026-09-03' });
  });

  it('omits a bucket whose families have no diff-baseline.json, and skips a missing family of a mapped bucket', () => {
    const goldens = tempGoldens();
    // Only svg-utility present: unknown reads it alone; every other bucket is absent.
    writeFamilyFile(goldens, 'svg-utility', 'diff-baseline.json', [
      { type: 'unknown', status: 'baseline', weightedScore: 2, measuredAt: '2026-10-14' },
    ]);
    const out = loadDiffBaselineByType(goldens);
    expect(out.unknown).toEqual({ count: 1, sum: 2, measuredAt: '2026-10-14' });
    expect(out.gantt).toBeUndefined();
    expect(out.activity).toBeUndefined();
    expect(Object.keys(out)).toEqual(['unknown']);
  });
});

describe('unmappedGoldenFamilies (D2)', () => {
  function mappedGoldens(): string {
    const goldens = tempGoldens();
    for (const family of allMappedFamilies(RATCHET_FAMILY)) writeFamilyFile(goldens, family, 'ratchet.json', []);
    for (const family of allMappedFamilies(DIFF_BASELINE_FAMILY))
      writeFamilyFile(goldens, family, 'diff-baseline.json', []);
    return goldens;
  }

  it('returns [] for a directory holding exactly the mapped and allowlisted families', () => {
    const goldens = mappedGoldens();
    for (const family of Object.keys(NON_BUCKET_FAMILIES)) mkdirSync(join(goldens, family));
    writeFamilyFile(goldens, 'svg-skin', 'ratchet.json', []);
    expect(unmappedGoldenFamilies(goldens)).toEqual([]);
  });

  it('catches a planted family holding a ratchet.json', () => {
    const goldens = mappedGoldens();
    writeFamilyFile(goldens, 'svg-newtype', 'ratchet.json', []);
    expect(unmappedGoldenFamilies(goldens)).toEqual(['svg-newtype']);
  });

  it('catches a planted family holding only a diff-baseline.json', () => {
    const goldens = mappedGoldens();
    writeFamilyFile(goldens, 'svg-newtype', 'diff-baseline.json', []);
    expect(unmappedGoldenFamilies(goldens)).toEqual(['svg-newtype']);
  });

  it('catches a planted family holding only an authored-baseline.json', () => {
    const goldens = mappedGoldens();
    writeFamilyFile(goldens, 'svg-newtype', 'authored-baseline.json', []);
    expect(unmappedGoldenFamilies(goldens)).toEqual(['svg-newtype']);
  });

  it('catches a mapped ratchet family that gains a diff-baseline.json absent from the diff-baseline map', () => {
    const goldens = mappedGoldens();
    expect(DIFF_BASELINE_FAMILY.files).toBeUndefined(); // precondition: svg-files is ratchet-only
    writeFamilyFile(goldens, 'svg-files', 'diff-baseline.json', []);
    expect(unmappedGoldenFamilies(goldens)).toEqual(['svg-files']);
  });

  it('ignores non-family entries (files, directories without the svg- prefix)', () => {
    const goldens = mappedGoldens();
    writeFileSync(join(goldens, 'stock-error-pages.json'), '{}');
    mkdirSync(join(goldens, 'pending'));
    expect(unmappedGoldenFamilies(goldens)).toEqual([]);
  });

  it('gives every allowlisted family a stated reason', () => {
    for (const [family, reason] of Object.entries(NON_BUCKET_FAMILIES)) {
      expect(family.startsWith('svg-')).toBe(true);
      expect(reason.length).toBeGreaterThan(10);
    }
  });

  it('finds no unmapped family under the real oracle/goldens (the gate)', () => {
    expect(unmappedGoldenFamilies(REAL_GOLDENS)).toEqual([]);
  });
});
