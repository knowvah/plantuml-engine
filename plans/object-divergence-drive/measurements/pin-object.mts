// Pin conformant object rows into the svg-object ratchet, by oracle/goldens/svg-object/README.md's Add rule (D9).
// Without --write: prints each candidate and why it is held. With --write, per pin: copies the dot-cache in.puml and
// in.svg to svg-object/<slug>/, appends { slug, addedAt, source } to ratchet.json, and appends `goldens` twins of the
// dot-cache rows to routing- and refusal-baseline.json. An ELK row (isElkRow) has no DOT stage, so needs no dotEqual.
// Usage: npx jiti plans/object-divergence-drive/measurements/pin-object.mts [--write]
import { execFileSync } from 'node:child_process';
import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { DeterministicMeasurer } from '../../../src/core/measurer-deterministic.js';
import { compareSvg } from '../../../tests/oracle/svg-conformance/compare.js';
import { isElkRow } from '../../../tests/oracle/svg-conformance/description-eligibility.js';
import { prepareElkOnce, renderClassFixture } from '../../../tests/oracle/svg-conformance/render-fixture-class.js';
import { censusClassFixtureOptions } from '../../../scripts/svg-conformance-census.js';

const TREE = 'object';
const GOLDEN_TYPE = 'svg-object';
const GOLDENS = 'oracle/goldens/svg-object';
const BASELINES = 'oracle/goldens/svg-conformance';
const CACHE = join('test-results/dot-cache', TREE);
const today = new Date().toISOString().slice(0, 10);
const commit = execFileSync('git', ['rev-parse', '--short', 'HEAD']).toString().trim();
const write = process.argv.includes('--write');

const readJson = (p: string) => JSON.parse(readFileSync(p, 'utf8'));
const manifest = readJson(join(GOLDENS, 'ratchet.json'));
const pinned = new Set(manifest.fixtures.map((f: { slug: string }) => f.slug));
const pins: string[] = [];
await prepareElkOnce();
for (const row of readJson('tests/oracle/svg-conformance/parity-object.json').fixtures) {
  if (row.verdict !== 'conformant' || pinned.has(row.slug)) continue;
  const source = readFileSync(join(CACHE, row.slug, 'in.puml'), 'utf8');
  const ours = renderClassFixture(source, new DeterministicMeasurer(), censusClassFixtureOptions());
  const diffs = compareSvg(ours, readFileSync(join(CACHE, row.slug, 'in.svg'), 'utf8'), 'deterministic').diffs.length;
  const eligible = row.dotEqual === true || isElkRow(row, source);
  const ok = diffs === 0 && eligible;
  console.log(`${ok ? 'PIN ' : 'hold'} ${row.slug} diffs=${diffs} dotEqual=${row.dotEqual}`);
  if (ok) pins.push(row.slug);
}

function appendTwins(file: string): void {
  const path = join(BASELINES, file);
  const base = readJson(path);
  for (const slug of pins) {
    const twin = base.fixtures.find((r: { tree: string; type: string; slug: string }) => r.tree === 'dot-cache' && r.type === TREE && r.slug === slug);
    if (twin === undefined) throw new Error(`${file}: no dot-cache twin for ${slug}`);
    base.fixtures.push({ ...twin, tree: 'goldens', type: GOLDEN_TYPE, slug, measuredAt: today, measuredAgainstCommit: commit });
  }
  base.$comment += ` Re-pinned ${today} at ${commit} by object-divergence-drive T4b, ADDITIVE ONLY (${pins.length} "${GOLDEN_TYPE}" golden rows appended, clones of their byte-identical dot-cache twins).`;
  writeFileSync(path, `${JSON.stringify(base, null, 2)}\n`);
}

if (write && pins.length > 0) {
  for (const slug of pins) {
    const dir = join(GOLDENS, slug);
    mkdirSync(dir, { recursive: true });
    copyFileSync(join(CACHE, slug, 'in.puml'), join(dir, 'in.puml'));
    copyFileSync(join(CACHE, slug, 'in.svg'), join(dir, 'golden.svg'));
    manifest.fixtures.push({ slug, addedAt: today, source: 'dot-cache' });
  }
  writeFileSync(join(GOLDENS, 'ratchet.json'), `${JSON.stringify(manifest, null, 2)}\n`);
  appendTwins('routing-baseline.json');
  appendTwins('refusal-baseline.json');
}
console.log(`pins ${pins.length}${write ? ' written' : ''}`);
