/**
 * Oracle coverage over the visual manifests (mission oracle-gap-capture, T1;
 * plans/oracle-gap-capture/decisions.md D3).
 *
 * Every row of `tests/visual/data/*.json` must have a jar oracle under
 * `test-results/dot-cache/<bucket>/<slug>/` (any bucket: rows land by the
 * jar's type, D2) or a recorded reason in `oracle/no-oracle-reasons.json`.
 * `oracleCoverage` is pure; the three loaders are the only filesystem
 * access, and `tests/oracle/svg-conformance/oracle-coverage.test.ts` runs
 * them on the real trees.
 */
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { basename, extname, join } from 'node:path';

import { assertJsonArrayShape, assertJsonObjectShape } from './assert-json-shape.js';

export interface ManifestRow {
  readonly bucket: string;
  readonly slug: string;
}

export interface OracleCoverage {
  /** Neither an oracle nor a reason, in manifest order. */
  readonly missing: readonly ManifestRow[];
  /** Reason keys with no manifest row, or whose row has an oracle. */
  readonly staleReasons: readonly string[];
  readonly oracled: number;
  readonly reasoned: number;
}

/** The key a reason is filed under: the MANIFEST bucket, not the jar's. */
export function reasonKey(row: ManifestRow): string {
  return `${row.bucket}/${row.slug}`;
}

/**
 * Pure. Reason keys are `<manifest bucket>/<slug>`; an oracle wins by slug
 * in any bucket (D3). A reason for an oracled row is stale: the oracle is
 * the record, so the excuse no longer describes anything.
 */
export function oracleCoverage(
  rows: readonly ManifestRow[],
  oracleSlugs: ReadonlySet<string>,
  reasons: Readonly<Record<string, string>>,
): OracleCoverage {
  const missing: ManifestRow[] = [];
  const liveReasonKeys = new Set<string>();
  let oracled = 0;
  for (const row of rows) {
    const key = reasonKey(row);
    if (oracleSlugs.has(row.slug)) {
      oracled++;
    } else if (key in reasons) {
      liveReasonKeys.add(key);
    } else {
      missing.push({ bucket: row.bucket, slug: row.slug });
    }
  }
  const staleReasons = Object.keys(reasons).filter((key) => !liveReasonKeys.has(key));
  return { missing, staleReasons, oracled, reasoned: liveReasonKeys.size };
}

interface ManifestFixture {
  readonly slug: string;
}

/** `tests/visual/data/*.json`, sorted by file name; the bucket is the file stem. */
export function loadManifestRows(dataDir: string): ManifestRow[] {
  const rows: ManifestRow[] = [];
  for (const file of readdirSync(dataDir).sort()) {
    if (extname(file) !== '.json') continue;
    const bucket = basename(file, '.json');
    const path = join(dataDir, file);
    const parsed: unknown = JSON.parse(readFileSync(path, 'utf8'));
    assertJsonArrayShape(parsed, path);
    for (const entry of parsed as ManifestFixture[]) rows.push({ bucket, slug: entry.slug });
  }
  return rows;
}

/** A directory holding `.done`, `in.puml` and `in.svg` -- the shape
 *  `scripts/svg-parity-survey.ts#listFixtureDirs` requires. */
function isOracleDir(dir: string): boolean {
  return existsSync(join(dir, '.done')) && existsSync(join(dir, 'in.puml')) && existsSync(join(dir, 'in.svg'));
}

/** Slugs with a complete oracle under any `<cacheDir>/<bucket>/<slug>/`. */
export function cachedOracleSlugs(cacheDir: string): Set<string> {
  const slugs = new Set<string>();
  if (!existsSync(cacheDir)) return slugs;
  for (const bucket of readdirSync(cacheDir)) {
    const bucketDir = join(cacheDir, bucket);
    if (!statSync(bucketDir).isDirectory()) continue;
    for (const slug of readdirSync(bucketDir)) {
      if (isOracleDir(join(bucketDir, slug))) slugs.add(slug);
    }
  }
  return slugs;
}

const REASONS_KEY = 'reasons';

/** The `reasons` object of `oracle/no-oracle-reasons.json`. */
export function loadNoOracleReasons(path: string): Record<string, string> {
  const parsed: unknown = JSON.parse(readFileSync(path, 'utf8'));
  assertJsonObjectShape(parsed, path, [REASONS_KEY]);
  const reasons: unknown = (parsed as Record<string, unknown>)[REASONS_KEY];
  assertJsonObjectShape(reasons, path, []);
  return reasons as Record<string, string>;
}
