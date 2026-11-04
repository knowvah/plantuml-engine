#!/usr/bin/env node
/**
 * Captures a jar oracle for every manifest fixture that has none, in two
 * steps (mission oracle-gap-capture; plans/oracle-gap-capture/decisions.md
 * D2, D4), so `pin-corpus-tree.ts --tree` can measure a tree holding only
 * the new rows before they join the cache:
 *
 *   npx jiti scripts/capture-missing-oracles.ts --stage <dir> [--limit N]
 *   npx jiti scripts/capture-missing-oracles.ts --install <dir>
 *
 * `--stage` renders each row of `oracleCoverage(...).missing`, in manifest
 * order, through `oracle-render.sh` (one JVM per fixture, inside a plain
 * minute, cwd a scratch directory so `!pragma svek_trace on` cannot write
 * `svek.svg` into the repo root), reads the jar's `data-diagram-type`,
 * routes the row (`routeBucket`, D2) to `<dir>/<bucket>/<slug>/` and
 * appends it to `<dir>/capture-report.json` after each render, so a rerun
 * resumes. `--install` moves every captured row to
 * `test-results/dot-cache/<bucket>/<slug>/`, refusing to overwrite, and
 * records a capture clock for any clock-dependent source: a staged render
 * sits outside `dot-cache`, so `oracle-render.sh` recorded nothing for it.
 */
import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, renameSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { renderFixture, type ClassifyResult, type GuardDeps } from './capture-oracle-cache.js';
import { assertJsonArrayShape, assertJsonObjectShape } from './lib/assert-json-shape.js';
import {
  cachedOracleSlugs,
  loadManifestRows,
  loadNoOracleReasons,
  oracleCoverage,
  reasonKey,
  type ManifestRow,
} from './lib/oracle-coverage.js';
import { routeBucket } from './lib/oracle-route.js';
import { diagramTypeOf, isJarErrorPage, readHead } from './pin-corpus-tree-measure.js';
import { recordCaptureClock } from './record-capture-clock.js';

const REPO = join(dirname(fileURLToPath(import.meta.url)), '..');
const DATA_DIR = join(REPO, 'tests', 'visual', 'data');
const CACHE_DIR = join(REPO, 'test-results', 'dot-cache');
const REASONS_PATH = join(REPO, 'oracle', 'no-oracle-reasons.json');

const REPORT_FILE = 'capture-report.json';
const WORK_DIR = '.work';
const RENDER_DIR = 'out';
const PUML = 'in.puml';
const SVG = 'in.svg';
const DONE = '.done';
const LOG = '[capture-missing-oracles]';

/** What a staged fixture keeps: the pin tool's and the survey's inputs, the
 *  `newpage` pages, and the DOT dump. Everything else the jar wrote is
 *  scratch. */
const KEEP_RE = /^(?:\.done|in\.puml|in(?:_\d+)?\.svg|svek-\d+\.dot)$/;

export interface CaptureRow {
  readonly manifest: string;
  readonly slug: string;
  readonly bucket: string;
  readonly jarType: string;
  readonly jarErrored: boolean;
  readonly kind: ClassifyResult['kind'];
  /** Epoch millis just before the JVM started. */
  readonly startedAt: number;
}

export interface CaptureReport {
  rows: CaptureRow[];
}

export interface StageOptions {
  readonly dataDir: string;
  readonly cacheDir: string;
  readonly reasonsPath: string;
  readonly stageDir: string;
  readonly limit?: number;
}

/** `(pumlPath, epochMillis)`: `recordCaptureClock`'s shape, injectable so a
 *  test never touches `oracle/capture-clock.json`. */
export type ClockRecorder = (pumlPath: string, epochMillis: number) => string | undefined;

export function readCaptureReport(stageDir: string): CaptureReport {
  const path = join(stageDir, REPORT_FILE);
  if (!existsSync(path)) return { rows: [] };
  const parsed: unknown = JSON.parse(readFileSync(path, 'utf8'));
  assertJsonObjectShape(parsed, path, ['rows']);
  const rows: unknown = (parsed as { rows: unknown }).rows;
  assertJsonArrayShape(rows, path);
  return { rows: rows as CaptureRow[] };
}

function writeCaptureReport(stageDir: string, report: CaptureReport): void {
  writeFileSync(join(stageDir, REPORT_FILE), `${JSON.stringify(report, null, 2)}\n`);
}

function captured(kind: ClassifyResult['kind']): boolean {
  return kind === 'in-svg' || kind === 'renamed';
}

interface ManifestFixture {
  readonly slug: string;
  readonly markup: string;
}

/** `<bucket>/<slug>` -> markup, over every manifest file. */
function loadMarkup(dataDir: string): Map<string, string> {
  const out = new Map<string, string>();
  for (const file of readdirSync(dataDir)) {
    if (!file.endsWith('.json')) continue;
    const path = join(dataDir, file);
    const parsed: unknown = JSON.parse(readFileSync(path, 'utf8'));
    assertJsonArrayShape(parsed, path);
    const bucket = file.slice(0, -'.json'.length);
    for (const f of parsed as ManifestFixture[]) out.set(reasonKey({ bucket, slug: f.slug }), f.markup);
  }
  return out;
}

/** Moves the kept files of a rendered fixture into `dest`, which must not exist yet. */
function moveKeeping(src: string, dest: string): void {
  if (existsSync(dest)) throw new Error(`${LOG} ${dest} already exists: two manifest rows routed to one bucket/slug`);
  mkdirSync(dest, { recursive: true });
  for (const f of readdirSync(src)) {
    if (KEEP_RE.test(f)) renameSync(join(src, f), join(dest, f));
  }
}

async function stageOne(row: ManifestRow, markup: string, opts: StageOptions, guard: GuardDeps): Promise<CaptureRow> {
  const work = join(opts.stageDir, WORK_DIR, row.bucket, row.slug);
  const out = join(work, RENDER_DIR);
  rmSync(work, { recursive: true, force: true }); // a rerun of an interrupted row
  mkdirSync(work, { recursive: true });
  const result = await renderFixture(out, markup, guard, work);
  const head = captured(result.kind) ? readHead(join(out, SVG)) : '';
  const jarType = diagramTypeOf(head);
  const jarErrored = isJarErrorPage(head);
  const bucket = routeBucket(row.bucket, jarType, jarErrored);
  if (captured(result.kind)) {
    writeFileSync(join(out, DONE), '');
    moveKeeping(out, join(opts.stageDir, bucket, row.slug));
  }
  rmSync(work, { recursive: true, force: true });
  return {
    manifest: row.bucket,
    slug: row.slug,
    bucket,
    jarType,
    jarErrored,
    kind: result.kind,
    startedAt: result.startedAt,
  };
}

/** Renders every coverage gap into the stage; returns the whole report. */
export async function stageMissingOracles(options: StageOptions, guard: GuardDeps = {}): Promise<CaptureRow[]> {
  // Absolute: the render runs with a scratch cwd, so a relative stage would make
  // `oracle-render.sh` resolve `<out-dir>` and `<file.puml>` against it (T3 finding).
  const opts: StageOptions = { ...options, stageDir: resolve(options.stageDir) };
  const rows = loadManifestRows(opts.dataDir);
  const coverage = oracleCoverage(rows, cachedOracleSlugs(opts.cacheDir), loadNoOracleReasons(opts.reasonsPath));
  const markup = loadMarkup(opts.dataDir);
  mkdirSync(opts.stageDir, { recursive: true });
  const report = readCaptureReport(opts.stageDir);
  const done = new Set(report.rows.map((r) => reasonKey({ bucket: r.manifest, slug: r.slug })));
  let rendered = 0;
  for (const row of coverage.missing) {
    const key = reasonKey(row);
    if (done.has(key)) continue;
    if (opts.limit !== undefined && rendered >= opts.limit) break;
    console.error(`${LOG} ${report.rows.length + 1}/${coverage.missing.length} ${key}`);
    report.rows.push(await stageOne(row, markup.get(key) ?? '', opts, guard));
    writeCaptureReport(opts.stageDir, report);
    rendered++;
  }
  return report.rows;
}

/** `renameSync` with a copy fallback for a stage on another volume (EXDEV). */
function moveDir(src: string, dest: string): void {
  mkdirSync(dirname(dest), { recursive: true });
  try {
    renameSync(src, dest);
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code !== 'EXDEV') throw err;
    cpSync(src, dest, { recursive: true });
    rmSync(src, { recursive: true, force: true });
  }
}

/** Moves every captured row of the stage into the cache. Refuses, before
 *  moving anything, when any target already exists: an oracle is never
 *  overwritten here. Returns the `<bucket>/<slug>` keys installed. */
export function installStage(
  stage: string,
  cacheRoot: string = CACHE_DIR,
  record: ClockRecorder = recordCaptureClock,
): string[] {
  const stageDir = resolve(stage);
  const rows = readCaptureReport(stageDir).rows.filter((r) => captured(r.kind));
  for (const r of rows) {
    const target = join(cacheRoot, r.bucket, r.slug);
    if (existsSync(target))
      throw new Error(`${LOG} ${r.bucket}/${r.slug}: target exists, refusing to overwrite ${target}`);
    if (!existsSync(join(stageDir, r.bucket, r.slug, SVG)))
      throw new Error(`${LOG} ${r.bucket}/${r.slug}: not in the stage ${stageDir}`);
  }
  const installed: string[] = [];
  for (const r of rows) {
    const target = join(cacheRoot, r.bucket, r.slug);
    moveDir(join(stageDir, r.bucket, r.slug), target);
    record(join(target, PUML), r.startedAt);
    installed.push(`${r.bucket}/${r.slug}`);
  }
  return installed;
}

/* v8 ignore start -- CLI entry point; exercised by real runs, not the unit
 * suite (matches scripts/capture-oracle-cache.ts's guard). */
const USAGE = 'usage: capture-missing-oracles.ts --stage <dir> [--limit N] | --install <dir>';

async function main(argv: string[]): Promise<void> {
  const [mode, dir, ...rest] = argv;
  if (dir === undefined) throw new Error(USAGE);
  if (mode === '--install') {
    const installed = installStage(dir);
    console.log(JSON.stringify({ installed: installed.length, rows: installed }));
    return;
  }
  if (mode !== '--stage') throw new Error(USAGE);
  const limitAt = rest.indexOf('--limit');
  const limit = limitAt === -1 ? undefined : Number(rest[limitAt + 1]);
  if (limit !== undefined && !Number.isInteger(limit)) throw new Error(USAGE);
  const rows = await stageMissingOracles({
    dataDir: DATA_DIR,
    cacheDir: CACHE_DIR,
    reasonsPath: REASONS_PATH,
    stageDir: dir,
    ...(limit === undefined ? {} : { limit }),
  });
  const kinds: Record<string, number> = {};
  for (const r of rows) kinds[r.kind] = (kinds[r.kind] ?? 0) + 1;
  console.log(JSON.stringify({ rows: rows.length, kinds }));
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  main(process.argv.slice(2)).catch((err: unknown) => {
    console.error(err);
    process.exitCode = 1;
  });
}
/* v8 ignore stop */
