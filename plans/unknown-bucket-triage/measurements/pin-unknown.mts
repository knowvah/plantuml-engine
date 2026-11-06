// T3c (D6): pin the conformant `unknown` rows the activity, sequence and state engines draw into each engine's
// golden ratchet, under `oracle/goldens/svg-<engine>/unknown/<slug>/`, with `tree: "unknown"` in its ratchet.json.
// Usage: npx jiti plans/unknown-bucket-triage/measurements/pin-unknown.mts <parity-unknown.json> [--write]
// Without --write it only reports. A row is pinned only when the ratchet's own render path gives 0 diffs. A slug
// already pinned in its own bucket with byte-identical in.puml and golden is reported as pinned already. Each pin
// clones its dot-cache/unknown routing and refusal rows as tree goldens, type svg-<engine>, slug unknown/<slug>,
// the way the class pins under svg-class/unknown/ carry them.
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';

import { DeterministicMeasurer } from '../../../src/core/measurer-deterministic.js';
import { compareSvg } from '../../../tests/oracle/svg-conformance/compare.js';
import { fixtureIncludeStore } from '../../../tests/helpers/fixture-include-store.js';
import { renderFixtureActivity } from '../../../tests/oracle/svg-conformance/render-fixture-activity.js';
import {
  renderFixtureSequence,
  sequenceFixtureOptions,
} from '../../../tests/oracle/svg-conformance/render-fixture-sequence.js';
import { renderFixtureState } from '../../../tests/oracle/svg-conformance/render-fixture-state.js';

const CACHE = 'test-results/dot-cache/unknown';
const ROUTING = 'oracle/goldens/svg-conformance/routing-baseline.json';
const REFUSAL = 'oracle/goldens/svg-conformance/refusal-baseline.json';
const SOURCE = 'ubt-T3c';
const ADDED_AT = '2026-11-06';
const TREE = 'unknown';

type Engine = 'activity' | 'sequence' | 'state';
const ENGINE_OF: Record<string, Engine> = { ACTIVITY: 'activity', SEQUENCE: 'sequence', STATE: 'state' };

/** Each ratchet's own render call, verbatim from its golden.ratchet test. */
const RENDER: Record<Engine, (markup: string) => string> = {
  activity: (m) => renderFixtureActivity(m, new DeterministicMeasurer(), { includeStore: fixtureIncludeStore() }),
  sequence: (m) => renderFixtureSequence(m, new DeterministicMeasurer(), sequenceFixtureOptions()),
  state: (m) => renderFixtureState(m, new DeterministicMeasurer()),
};

interface Row {
  tree: string;
  type: string;
  slug: string;
  measuredAt?: string;
  measuredAgainstCommit?: string;
  [k: string]: unknown;
}

const [surveyPath, flag] = process.argv.slice(2);
if (surveyPath === undefined) throw new Error('usage: pin-unknown.mts <parity-unknown.json> [--write]');
const write = flag === '--write';
const commit = execFileSync('git', ['rev-parse', '--short=8', 'HEAD']).toString().trim();

const survey = JSON.parse(readFileSync(surveyPath, 'utf8')) as { fixtures: { slug: string; verdict: string }[] };
const routing = JSON.parse(readFileSync(ROUTING, 'utf8')) as { fixtures: Row[] };
const refusal = JSON.parse(readFileSync(REFUSAL, 'utf8')) as { fixtures: Row[] };
const rowOf = (file: { fixtures: Row[] }, tree: string, type: string, slug: string): Row | undefined =>
  file.fixtures.find((r) => r.tree === tree && r.type === type && r.slug === slug);

const ratchets: Record<Engine, { fixtures: { slug: string; tree?: string }[] }> = {
  activity: JSON.parse(readFileSync('oracle/goldens/svg-activity/ratchet.json', 'utf8')),
  sequence: JSON.parse(readFileSync('oracle/goldens/svg-sequence/ratchet.json', 'utf8')),
  state: JSON.parse(readFileSync('oracle/goldens/svg-state/ratchet.json', 'utf8')),
};

const out: Record<string, string[]> = { pinned: [], already: [], diverges: [], other: [], twin: [] };
for (const { slug, verdict } of survey.fixtures) {
  if (verdict !== 'conformant') continue;
  const route = rowOf(routing, 'dot-cache', 'unknown', slug);
  const engine = route === undefined ? undefined : ENGINE_OF[String(route['ourType'])];
  if (engine === undefined) continue;
  const root = `oracle/goldens/svg-${engine}`;
  const puml = readFileSync(join(CACHE, slug, 'in.puml'), 'utf8');
  const jar = readFileSync(join(CACHE, slug, 'in.svg'), 'utf8');
  if (ratchets[engine].fixtures.some((f) => f.slug === slug && f.tree === TREE)) {
    out['already']!.push(`${engine} ${slug} (unknown tree)`);
    continue;
  }
  const own = join(root, slug);
  if (ratchets[engine].fixtures.some((f) => f.slug === slug && f.tree === undefined) && existsSync(own)) {
    const same =
      readFileSync(join(own, 'in.puml'), 'utf8') === puml && readFileSync(join(own, 'golden.svg'), 'utf8') === jar;
    if (same) {
      out['twin']!.push(`${engine} ${slug}`);
      continue;
    }
  }
  let diffs: { path: string }[];
  try {
    diffs = compareSvg(RENDER[engine](puml), jar, 'deterministic').diffs;
  } catch (err) {
    out['other']!.push(`${engine} ${slug}: ratchet path throws: ${(err as Error).message.slice(0, 80)}`);
    continue;
  }
  if (diffs.length > 0) {
    out['diverges']!.push(`${engine} ${slug}: ${diffs.length} diffs on the ratchet path, first ${diffs[0]!.path}`);
    continue;
  }
  out['pinned']!.push(`${engine} ${slug}`);
  if (!write) continue;
  const dst = join(root, TREE, slug);
  mkdirSync(dst, { recursive: true });
  copyFileSync(join(CACHE, slug, 'in.svg'), join(dst, 'golden.svg'));
  copyFileSync(join(CACHE, slug, 'in.puml'), join(dst, 'in.puml'));
  ratchets[engine].fixtures.push({ slug, addedAt: ADDED_AT, source: SOURCE, tree: TREE } as never);
  for (const file of [routing, refusal]) {
    const twin = rowOf(file, 'dot-cache', 'unknown', slug);
    if (twin === undefined) throw new Error(`${slug}: no dot-cache/unknown row to clone`);
    if (rowOf(file, 'goldens', `svg-${engine}`, `${TREE}/${slug}`) !== undefined) continue;
    file.fixtures.push({
      ...twin,
      tree: 'goldens',
      type: `svg-${engine}`,
      slug: `${TREE}/${slug}`,
      measuredAt: ADDED_AT,
      measuredAgainstCommit: commit,
    });
  }
}

if (write) {
  for (const engine of Object.keys(ratchets) as Engine[]) {
    writeFileSync(`oracle/goldens/svg-${engine}/ratchet.json`, `${JSON.stringify(ratchets[engine], null, 2)}\n`);
  }
  writeFileSync(ROUTING, `${JSON.stringify(routing, null, 2)}\n`);
  writeFileSync(REFUSAL, `${JSON.stringify(refusal, null, 2)}\n`);
}
for (const [k, v] of Object.entries(out)) {
  console.log(`${k} ${v.length}`);
  for (const line of v) console.log(`  ${line}`);
}
