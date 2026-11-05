// Pin CLASS-routed c4 rows into the svg-class ratchet, by oracle/goldens/svg-class/README.md's Add rule (D6).
// Without --write: prints each candidate and why it is held or skipped. With --write, per pin: copies the dot-cache
// in.puml and in.svg to svg-class/c4/<slug>/, appends { slug, addedAt, source, tree: 'c4' } to ratchet.json, and appends
// `goldens` twins of the dot-cache rows to routing- and refusal-baseline.json.
// Usage: npx jiti plans/c4-divergence-drive/measurements/pin-class-c4.mts [--write]
import { execFileSync } from 'node:child_process';
import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { DeterministicMeasurer } from '../../../src/core/measurer-deterministic.js';
import { censusClassFixtureOptions } from '../../../scripts/svg-conformance-census.js';
import { compareSvg } from '../../../tests/oracle/svg-conformance/compare.js';
import { renderClassFixture } from '../../../tests/oracle/svg-conformance/render-fixture-class.js';

const TREE = 'c4';
const CLASS_TYPE = 'CLASS';
const GOLDENS = 'oracle/goldens/svg-class';
const BASELINES = 'oracle/goldens/svg-conformance';
const CACHE = join('test-results/dot-cache', TREE);
const today = new Date().toISOString().slice(0, 10);
const commit = execFileSync('git', ['rev-parse', '--short', 'HEAD']).toString().trim();
const write = process.argv.includes('--write');

const readJson = (p: string) => JSON.parse(readFileSync(p, 'utf8'));
const manifest = readJson(join(GOLDENS, 'ratchet.json'));
const pinned = new Set(manifest.fixtures.filter((f: { tree?: string }) => f.tree === TREE).map((f: { slug: string }) => f.slug));
const routing = readJson(join(BASELINES, 'routing-baseline.json')).fixtures;
const pins: string[] = [];
for (const row of readJson('tests/oracle/svg-conformance/parity-c4.json').fixtures) {
  const twin = routing.find((r: { tree: string; type: string; slug: string }) => r.tree === 'dot-cache' && r.type === TREE && r.slug === row.slug);
  if (row.verdict !== 'conformant' || twin?.ourType !== CLASS_TYPE || pinned.has(row.slug)) continue;
  const dir = join(CACHE, row.slug);
  const ours = renderClassFixture(readFileSync(join(dir, 'in.puml'), 'utf8'), new DeterministicMeasurer(), censusClassFixtureOptions());
  const diffs = compareSvg(ours, readFileSync(join(dir, 'in.svg'), 'utf8'), 'deterministic').diffs.length;
  const ok = diffs === 0 && row.dotEqual === true;
  console.log(`${ok ? 'PIN ' : 'skip'} ${row.slug} diffs=${diffs} dotEqual=${row.dotEqual}`);
  if (ok) pins.push(row.slug);
}

function appendTwins(file: string): void {
  const path = join(BASELINES, file);
  const base = readJson(path);
  for (const slug of pins) {
    const twin = base.fixtures.find((r: { tree: string; type: string; slug: string }) => r.tree === 'dot-cache' && r.type === TREE && r.slug === slug);
    if (twin === undefined) throw new Error(`${file}: no dot-cache twin for ${slug}`);
    base.fixtures.push({ ...twin, tree: 'goldens', type: 'svg-class', slug: `${TREE}/${slug}`, measuredAt: today, measuredAgainstCommit: commit });
  }
  base.$comment += ` Re-pinned ${today} at ${commit} by c4-divergence-drive T4b, ADDITIVE ONLY (${pins.length} "svg-class" golden rows under c4/ appended, clones of their byte-identical dot-cache twins).`;
  writeFileSync(path, `${JSON.stringify(base, null, 2)}\n`);
}

if (write && pins.length > 0) {
  for (const slug of pins) {
    const dir = join(GOLDENS, TREE, slug);
    mkdirSync(dir, { recursive: true });
    copyFileSync(join(CACHE, slug, 'in.puml'), join(dir, 'in.puml'));
    copyFileSync(join(CACHE, slug, 'in.svg'), join(dir, 'golden.svg'));
    manifest.fixtures.push({ slug, addedAt: today, source: 'dot-cache', tree: TREE });
  }
  writeFileSync(join(GOLDENS, 'ratchet.json'), `${JSON.stringify(manifest, null, 2)}\n`);
  appendTwins('routing-baseline.json');
  appendTwins('refusal-baseline.json');
}
console.log(`pins ${pins.length}${write ? ' written' : ''}`);
