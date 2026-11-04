// @vitest-environment node
/**
 * Oracle coverage gate (issue #109; mission oracle-gap-capture, T1/T5;
 * plans/oracle-gap-capture/decisions.md D3).
 *
 * Every row of `tests/visual/data/*.json` must have a jar oracle under
 * `test-results/dot-cache/<bucket>/<slug>/` (`.done` + `in.puml` + `in.svg`,
 * in ANY bucket: rows land by the jar's `data-diagram-type`, D2) or an entry
 * in `oracle/no-oracle-reasons.json` naming what the jar did. Before this
 * gate, 1,016 of 5,855 manifest rows had neither: no capture pass had ever
 * selected them (D1). The cache is committed, so presence is asserted, never
 * skipped.
 */
import { describe, it, expect } from 'vitest';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  cachedOracleSlugs,
  loadManifestRows,
  loadNoOracleReasons,
  oracleCoverage,
} from '../../../scripts/lib/oracle-coverage.js';

const REPO = join(dirname(fileURLToPath(import.meta.url)), '../../..');
const DATA_DIR = join(REPO, 'tests', 'visual', 'data');
const CACHE_DIR = join(REPO, 'test-results', 'dot-cache');
const REASONS = join(REPO, 'oracle', 'no-oracle-reasons.json');

const CAPTURE_HINT =
  'Capture them with `npx jiti scripts/capture-missing-oracles.ts --stage <dir>` then `--install <dir>` ' +
  '(oracle/README.md "Capturing a fixture with no oracle"), or record what the jar did in ' +
  'oracle/no-oracle-reasons.json under `<manifest bucket>/<slug>`.';

describe('oracle coverage -- every manifest fixture has a jar oracle or a recorded reason (#109)', () => {
  const rows = loadManifestRows(DATA_DIR);
  const coverage = oracleCoverage(rows, cachedOracleSlugs(CACHE_DIR), loadNoOracleReasons(REASONS));

  it('reads a non-empty manifest set and a committed cache', () => {
    expect(rows.length).toBeGreaterThan(0);
    expect(coverage.oracled).toBeGreaterThan(0);
  });

  it('leaves no manifest row with neither an oracle nor a reason', () => {
    const missing = coverage.missing.map((r) => `${r.bucket}/${r.slug}`);
    expect(
      missing,
      `${missing.length} manifest fixture(s) have no oracle under test-results/dot-cache/*/<slug>/ and no ` +
        `entry in oracle/no-oracle-reasons.json. ${CAPTURE_HINT} First: ${missing.slice(0, 10).join(', ')}`,
    ).toEqual([]);
  });

  it('carries no stale reason (a key with no manifest row, or whose row now has an oracle)', () => {
    expect(
      coverage.staleReasons,
      'Remove these keys from oracle/no-oracle-reasons.json: the row is gone, or it has an oracle now and ' +
        'the oracle is the record.',
    ).toEqual([]);
  });

  it('accounts for every manifest row as oracled or reasoned', () => {
    expect(coverage.oracled + coverage.reasoned).toBe(rows.length);
  });
});
