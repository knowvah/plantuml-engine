/**
 * `npx jiti plans/sequence-oracle-gap-rows/tools/seed-baseline.mts
 *   <close-label> <slug...>`
 *
 * Seeds `oracle/goldens/svg-sequence/diff-baseline.json` rows for sequence
 * fixtures that have none (sogr D2: #109 captured 94 rows that no gate holds,
 * and `pin-goldens.mts` refuses a slug without a `"baseline"` row, while
 * `scripts/repin-sequence-baselines.ts` only updates existing rows).
 *
 * Each slug is measured through the seams `sequence.diff-baseline.ratchet
 * .test.ts`'s own `measure` uses — `renderFixtureSequence` +
 * `DeterministicMeasurer` + `sequenceFixtureOptions()` (which carries
 * `fixtureIncludeStore()`), `compareSvg(..., 'deterministic')` and
 * `weightedScore` — so a seeded score is exactly what the ratchet re-reads.
 *
 * A measurable slug is appended as `status: "baseline"` with its
 * `weightedScore` and `diffCount`. A refused render is appended as
 * `status: "error"`, both scores `null` and a `reason`, in the key order of
 * the historic error rows (`git show 2652df3ce:<file>`). Rows are inserted in
 * the file's existing code-unit slug order and written with the file's
 * two-space formatting.
 *
 * Everything is validated before anything is written: an already-seeded
 * slug, a slug with no cached `in.puml`/`in.svg`, a duplicate argument or an
 * empty list aborts the whole run with the file untouched.
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

import { DeterministicMeasurer } from '../../../src/core/measurer-deterministic.js';
import { compareSvg, weightedScore } from '../../../tests/oracle/svg-conformance/compare.js';
import {
  renderFixtureSequence,
  sequenceFixtureOptions,
} from '../../../tests/oracle/svg-conformance/render-fixture-sequence.js';

const CACHE_DIR = 'test-results/dot-cache/sequence';
const DIFF_BASELINE = 'oracle/goldens/svg-sequence/diff-baseline.json';

interface DiffBaselineRow extends Record<string, unknown> {
  slug: string;
}
interface DiffBaselineFile extends Record<string, unknown> {
  fixtures: DiffBaselineRow[];
}

export type Measurement =
  | { readonly errored: false; readonly weightedScore: number; readonly diffCount: number }
  | { readonly errored: true; readonly message: string };

export interface SeedOptions {
  readonly root: string;
  readonly slugs: readonly string[];
  readonly date: string;
  readonly commit: string;
}

/** Measures one cached slug the way the diff-baseline ratchet does; a thrown
 *  render is captured, never coerced into a score. */
export function measureSlug(root: string, slug: string): Measurement {
  const dir = join(root, CACHE_DIR, slug);
  const markup = readFileSync(join(dir, 'in.puml'), 'utf8');
  const golden = readFileSync(join(dir, 'in.svg'), 'utf8');
  try {
    const ours = renderFixtureSequence(markup, new DeterministicMeasurer(), sequenceFixtureOptions());
    const { diffs } = compareSvg(ours, golden, 'deterministic');
    return { errored: false, weightedScore: weightedScore(diffs), diffCount: diffs.length };
  } catch (err) {
    return { errored: true, message: err instanceof Error ? err.message : String(err) };
  }
}

function validate(root: string, data: DiffBaselineFile, slugs: readonly string[]): void {
  if (slugs.length === 0) throw new Error('no slugs given');
  if (new Set(slugs).size !== slugs.length) throw new Error('duplicate slug in arguments');
  const seeded = new Set(data.fixtures.map((f) => f.slug));
  for (const slug of slugs) {
    if (seeded.has(slug)) throw new Error(`${slug} already has a diff-baseline row`);
    for (const file of ['in.puml', 'in.svg']) {
      if (!existsSync(join(root, CACHE_DIR, slug, file))) throw new Error(`${slug}: missing ${file}`);
    }
  }
}

function buildRow(slug: string, m: Measurement, date: string, commit: string): DiffBaselineRow {
  const stamp = { measuredAt: date, measuredAgainstCommit: commit };
  if (m.errored) {
    return {
      type: 'sequence',
      slug,
      status: 'error',
      weightedScore: null,
      diffCount: null,
      ...stamp,
      reason: `refused at seeding (sogr T1): ${m.message}`,
    };
  }
  return { type: 'sequence', slug, status: 'baseline', weightedScore: m.weightedScore, diffCount: m.diffCount, ...stamp };
}

/** Seeds `o.slugs`; returns the number of rows appended. */
export function seedBaseline(o: SeedOptions): number {
  const data = JSON.parse(readFileSync(join(o.root, DIFF_BASELINE), 'utf8')) as DiffBaselineFile;
  validate(o.root, data, o.slugs);
  const rows = o.slugs.map((slug) => buildRow(slug, measureSlug(o.root, slug), o.date, o.commit));
  data.fixtures.push(...rows);
  data.fixtures.sort((a, b) => (a.slug < b.slug ? -1 : a.slug > b.slug ? 1 : 0));
  writeFileSync(join(o.root, DIFF_BASELINE), `${JSON.stringify(data, null, 2)}\n`);
  return rows.length;
}

/* v8 ignore start -- CLI entry point; exercised via the T1 run. */
if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  const [closeLabel, ...slugs] = process.argv.slice(2);
  if (!closeLabel || slugs.length === 0) {
    console.error('usage: seed-baseline.mts <close-label> <slug...>');
    process.exit(2);
  }
  const commit = execFileSync('git', ['rev-parse', '--short=8', 'HEAD'], { encoding: 'utf8' }).trim();
  const d = new Date();
  const date = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const n = seedBaseline({ root: process.cwd(), slugs, date, commit });
  console.log(`seeded ${n} diff-baseline row(s) at ${commit} (${closeLabel})`);
}
/* v8 ignore stop */
