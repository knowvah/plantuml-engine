// @vitest-environment node
/**
 * Unit tests for `scripts/lib/oracle-coverage.ts` (mission oracle-gap-capture,
 * T1; plans/oracle-gap-capture/decisions.md D3).
 *
 * The pure function is exercised with literal rows; the three loaders run
 * against temp directories so no real tree is read here. The real-tree
 * assertion lives in `tests/oracle/svg-conformance/oracle-coverage.test.ts`.
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

import {
  oracleCoverage,
  loadManifestRows,
  cachedOracleSlugs,
  loadNoOracleReasons,
  type ManifestRow,
} from '../../../scripts/lib/oracle-coverage.js';

let tmp: string;

beforeAll(() => {
  tmp = mkdtempSync(join(tmpdir(), 'ogc-t1-coverage-'));
});

afterAll(() => {
  rmSync(tmp, { recursive: true, force: true });
});

const ROW: ManifestRow = { bucket: 'sequence', slug: 'alpha-1' };

describe('oracleCoverage', () => {
  it('counts a slug cached under another bucket as oracled, not missing (D3: by slug, any bucket)', () => {
    const out = oracleCoverage([ROW], new Set(['alpha-1']), {});

    expect(out).toEqual({ missing: [], staleReasons: [], oracled: 1, reasoned: 0 });
  });

  it('reports a row with neither an oracle nor a reason as missing', () => {
    const out = oracleCoverage([ROW], new Set(['other']), {});

    expect(out).toEqual({
      missing: [{ bucket: 'sequence', slug: 'alpha-1' }],
      staleReasons: [],
      oracled: 0,
      reasoned: 0,
    });
  });

  it('accepts a reason keyed <bucket>/<slug> for a row with no oracle', () => {
    const out = oracleCoverage([ROW], new Set(), { 'sequence/alpha-1': 'jar wrote no SVG: NPE in X' });

    expect(out).toEqual({ missing: [], staleReasons: [], oracled: 0, reasoned: 1 });
  });

  it('flags a reason whose key names no manifest row as stale', () => {
    const out = oracleCoverage([ROW], new Set(['alpha-1']), { 'sequence/ghost': 'jar wrote nothing' });

    expect(out.staleReasons).toEqual(['sequence/ghost']);
    expect(out.reasoned).toBe(0);
  });

  it('flags a reason whose row has an oracle as stale, and still counts the row as oracled', () => {
    const out = oracleCoverage([ROW], new Set(['alpha-1']), { 'sequence/alpha-1': 'jar wrote nothing' });

    expect(out).toEqual({ missing: [], staleReasons: ['sequence/alpha-1'], oracled: 1, reasoned: 0 });
  });

  it('keys reasons by the MANIFEST bucket: a reason under another bucket does not cover the row', () => {
    const out = oracleCoverage([ROW], new Set(), { 'class/alpha-1': 'jar wrote nothing' });

    expect(out.missing).toEqual([ROW]);
    expect(out.staleReasons).toEqual(['class/alpha-1']);
  });

  it('keeps missing rows in manifest order', () => {
    const rows: ManifestRow[] = [
      { bucket: 'state', slug: 'zulu' },
      { bucket: 'activity', slug: 'alpha' },
      { bucket: 'class', slug: 'mike' },
    ];
    const out = oracleCoverage(rows, new Set(['alpha']), {});

    expect(out.missing.map((r) => r.slug)).toEqual(['zulu', 'mike']);
  });
});

describe('loadManifestRows', () => {
  it('reads every tests/visual/data/*.json in file order, bucket = file stem', () => {
    const dir = join(tmp, 'data');
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, 'state.json'), JSON.stringify([{ slug: 's1', markup: 'x' }]));
    writeFileSync(
      join(dir, 'activity.json'),
      JSON.stringify([
        { slug: 'a1', markup: 'x' },
        { slug: 'a2', markup: 'y' },
      ]),
    );
    writeFileSync(join(dir, 'notes.txt'), 'ignored');

    expect(loadManifestRows(dir)).toEqual([
      { bucket: 'activity', slug: 'a1' },
      { bucket: 'activity', slug: 'a2' },
      { bucket: 'state', slug: 's1' },
    ]);
  });
});

describe('cachedOracleSlugs', () => {
  it('requires .done, in.puml and in.svg (svg-parity-survey.ts#listFixtureDirs), across every bucket', () => {
    const cache = join(tmp, 'cache');
    const mk = (bucket: string, slug: string, files: string[]): void => {
      const d = join(cache, bucket, slug);
      mkdirSync(d, { recursive: true });
      for (const f of files) writeFileSync(join(d, f), '');
    };
    mk('activity', 'full', ['.done', 'in.puml', 'in.svg']);
    mk('class', 'no-done', ['in.puml', 'in.svg']);
    mk('class', 'no-svg', ['.done', 'in.puml']);
    mk('class', 'no-puml', ['.done', 'in.svg']);
    mk('unknown', 'also-full', ['.done', 'in.puml', 'in.svg']);
    writeFileSync(join(cache, 'stray.json'), '{}');

    expect([...cachedOracleSlugs(cache)].sort()).toEqual(['also-full', 'full']);
  });

  it('returns an empty set for a missing cache dir', () => {
    expect(cachedOracleSlugs(join(tmp, 'absent'))).toEqual(new Set());
  });
});

describe('loadNoOracleReasons', () => {
  it('returns the `reasons` object', () => {
    const p = join(tmp, 'reasons.json');
    writeFileSync(p, JSON.stringify({ $comment: 'c', reasons: { 'a/b': 'jar wrote nothing' } }));

    expect(loadNoOracleReasons(p)).toEqual({ 'a/b': 'jar wrote nothing' });
  });

  it('rejects a file without a `reasons` key, naming the file', () => {
    const p = join(tmp, 'bad-reasons.json');
    writeFileSync(p, JSON.stringify({ $comment: 'c' }));

    expect(() => loadNoOracleReasons(p)).toThrow(/bad-reasons\.json.*reasons/);
  });
});
