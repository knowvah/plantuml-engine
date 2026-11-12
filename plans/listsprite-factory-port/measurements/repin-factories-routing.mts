/**
 * `npx jiti plans/listsprite-factory-port/measurements/repin-factories-routing.mts [--write] [--label <text>] [--repo <root>]`
 *
 * Routing/refusal re-pin for the 43 `FACTORIES_SLUGS` rows (creole-math-
 * factories-port T4; port of
 * `plans/utility-factories-port/measurements/repin-utility-routing.mts`).
 * Orchestrator-only. Two steps, both from the gates' OWN measurement
 * (`scripts/pin-corpus-tree-measure.ts#measureFixture`):
 *
 * 1. Replaces every `tree: dot-cache, type: unknown` row of
 *    `oracle/goldens/svg-conformance/{routing,refusal}-baseline.json` whose
 *    slug is in `FACTORIES_SLUGS` IN PLACE from a fresh measurement. No other
 *    `unknown` row is read or touched. A row pinned `jar-error` stays as
 *    pinned. A fixture that now routes `agree` / renders `ok` is re-pinned so
 *    and its `reason` is dropped (the factory that the old reason called
 *    unported is now ported); one that still misroutes or errors on our side
 *    is REFUSED (no ledger of excuses here).
 * 2. Clones, for every slug in `oracle/goldens/svg-factories/ratchet.json`, its
 *    fresh dot-cache twin as `tree: goldens, type: svg-factories` in both
 *    files, replacing any earlier `svg-factories` goldens rows.
 *
 * Without `--write` nothing is written. `--repo` (default: this checkout)
 * redirects every path, for a dry run against a temp repo.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { measureFixture, type MeasuredFixture } from '../../../scripts/pin-corpus-tree-measure.js';
import { fixtureIncludeStore } from '../../../tests/helpers/fixture-include-store.js';
import { FACTORIES_CACHE_TYPE, FACTORIES_SLUGS } from '../../../tests/oracle/svg-conformance/render-fixture-factories.js';

const MISSION = 'listsprite-factory-port';
const GOLDENS_TYPE = 'svg-factories';

export interface Row {
  tree?: string;
  type: string;
  slug: string;
  status: string;
  measuredAt: string;
  measuredAgainstCommit: string;
  reason?: string;
  [k: string]: unknown;
}
export interface Baseline {
  $comment: string;
  fixtures: Row[];
}
export type Stamp = Pick<Row, 'measuredAt' | 'measuredAgainstCommit'>;

const isFactoriesCache = (r: Row): boolean =>
  r.tree === 'dot-cache' && r.type === FACTORIES_CACHE_TYPE && FACTORIES_SLUGS.includes(r.slug);
const isFactoriesGoldens = (r: Row): boolean => r.tree === 'goldens' && r.type === GOLDENS_TYPE;

export function routingRow(m: MeasuredFixture, old: Row, stamp: Stamp): Row {
  if (old.status === 'jar-error') return old;
  if (m.jarType !== m.ourType) {
    throw new Error(`routing: ${m.slug} still misroutes (${m.jarType} -> ${m.ourType}); no ledger excuse here`);
  }
  return { tree: 'dot-cache', type: FACTORIES_CACHE_TYPE, slug: m.slug, jarType: m.jarType, ourType: m.ourType, status: 'agree', ...stamp };
}

export function refusalRow(m: MeasuredFixture, old: Row, stamp: Stamp): Row {
  if (old.status === 'jar-error') return old;
  if (m.weErrored && m.jarRendered) {
    throw new Error(`refusal: ${m.slug} errors on our side where the jar renders; no ledger excuse here`);
  }
  return { tree: 'dot-cache', type: FACTORIES_CACHE_TYPE, slug: m.slug, jarRendered: m.jarRendered, weErrored: m.weErrored, engine: m.engine, status: 'ok', ...stamp };
}

/** True when `a` and `b` differ at most in their stamp: an unchanged row keeps its original measurement date. */
const sameMeasurement = (a: Row, b: Row): boolean =>
  JSON.stringify({ ...a, measuredAt: '', measuredAgainstCommit: '' }) === JSON.stringify({ ...b, measuredAt: '', measuredAgainstCommit: '' });

export type Derive = typeof routingRow;

export function rebuild(
  b: Baseline,
  measured: readonly MeasuredFixture[],
  pinned: readonly string[],
  derive: Derive,
  stamp: Stamp,
): { fixtures: Row[]; replaced: number; cloned: number } {
  const bySlug = new Map(measured.map((m) => [m.slug, m]));
  let replaced = 0;
  const fixtures = b.fixtures
    .filter((r) => !isFactoriesGoldens(r))
    .map((r) => {
      if (!isFactoriesCache(r)) return r;
      const m = bySlug.get(r.slug);
      if (m === undefined) throw new Error(`${r.slug}: factories dot-cache/unknown row has no measurement`);
      const next = derive(m, r, stamp);
      if (sameMeasurement(next, r)) return r;
      replaced++;
      return next;
    });
  const cacheRows = new Map(fixtures.filter(isFactoriesCache).map((r) => [r.slug, r]));
  const okStatus = derive === routingRow ? 'agree' : 'ok';
  for (const slug of pinned) {
    const twin = cacheRows.get(slug);
    if (twin === undefined) throw new Error(`${slug}: pinned in ratchet.json but has no dot-cache/unknown factories row`);
    if (twin.status !== okStatus) throw new Error(`${slug}: twin status ${twin.status}, cannot clone as a golden row`);
    fixtures.push({ ...twin, tree: 'goldens', type: GOLDENS_TYPE, slug, ...stamp });
  }
  return { fixtures, replaced, cloned: pinned.length };
}

function stampNow(repo: string): Stamp {
  return {
    measuredAt: new Date().toISOString().slice(0, 10),
    measuredAgainstCommit: execFileSync('git', ['rev-parse', '--short=8', 'HEAD'], { cwd: repo, encoding: 'utf8' }).trim(),
  };
}

function runRepin(repo: string, paths: readonly [string, string], write: boolean, label: string): void {
  const stamp = stampNow(repo);
  const ratchet = join(repo, 'oracle/goldens/svg-factories/ratchet.json');
  const pinned = (JSON.parse(readFileSync(ratchet, 'utf8')) as { fixtures: { slug: string }[] }).fixtures.map((f) => f.slug);
  const store = fixtureIncludeStore();
  const treeDir = join(repo, 'test-results/dot-cache', FACTORIES_CACHE_TYPE);
  const measured = FACTORIES_SLUGS.map((slug) => measureFixture(treeDir, slug, store));
  console.log(`measured ${measured.length} factories fixtures; ${pinned.length} pinned in ratchet.json`);
  const jobs: readonly [string, Derive, string][] = [
    [paths[0], routingRow, 'routing'],
    [paths[1], refusalRow, 'refusal'],
  ];
  for (const [path, derive, name] of jobs) {
    const b = JSON.parse(readFileSync(path, 'utf8')) as Baseline;
    const { fixtures, replaced, cloned } = rebuild(b, measured, pinned, derive, stamp);
    console.log(`${name}: rows ${b.fixtures.length} -> ${fixtures.length}; factories dot-cache/unknown re-pinned ${replaced}, goldens clones ${cloned}`);
    if (!write) continue;
    const note = ` Re-pinned ${stamp.measuredAt} at ${stamp.measuredAgainstCommit} by ${MISSION} / ${label}: ${replaced} factories "unknown" dot-cache rows re-measured in place, ${cloned} "${GOLDENS_TYPE}" golden rows appended (clones of their byte-identical dot-cache twins).`;
    writeFileSync(path, `${JSON.stringify({ $comment: b.$comment + note, fixtures }, null, 2)}\n`);
    console.log(`wrote ${path}`);
  }
  if (!write) console.log('dry run -- pass --write to update both baselines');
}

/* v8 ignore start -- CLI entry point; exercised via the acceptance run. */
function main(): void {
  const argv = process.argv.slice(2);
  const arg = (flag: string): string | undefined => {
    const i = argv.indexOf(flag);
    return i >= 0 ? argv[i + 1] : undefined;
  };
  const here = dirname(fileURLToPath(import.meta.url));
  const repo = arg('--repo') ?? join(here, '../../..');
  const paths = [
    join(repo, 'oracle/goldens/svg-conformance/routing-baseline.json'),
    join(repo, 'oracle/goldens/svg-conformance/refusal-baseline.json'),
  ] as const;
  runRepin(repo, paths, argv.includes('--write'), arg('--label') ?? 'T4');
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  try {
    main();
  } catch (err) {
    console.error(`repin-factories-routing: ${err instanceof Error ? err.message : String(err)}`);
    process.exit(1);
  }
}
/* v8 ignore stop */
