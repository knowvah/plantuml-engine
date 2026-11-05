// Pin conformant board rows into the svg-board ratchet, by oracle/goldens/svg-board/README.md's Add rule (D5).
// Without --write: prints each candidate and why it is held. With --write, per pin: copies the dot-cache in.puml and
// in.svg to svg-board/<slug>/, appends { slug, addedAt, source } to ratchet.json, and appends `goldens` twins of the
// dot-cache rows to routing- and refusal-baseline.json. Board has no DOT stage, so no dotEqual check.
// Usage: npx jiti plans/board-engine-port/measurements/pin-board.mts [--write]
import { execFileSync } from 'node:child_process';
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { DeterministicMeasurer } from '../../../src/core/measurer-deterministic.js';
import { renderSync } from '../../../src/index.js';
import { fixtureIncludeStore } from '../../../tests/helpers/fixture-include-store.js';
import { compareSvg } from '../../../tests/oracle/svg-conformance/compare.js';

const TREE = 'board';
const GOLDEN_TYPE = 'svg-board';
const GOLDENS = 'oracle/goldens/svg-board';
const BASELINES = 'oracle/goldens/svg-conformance';
const CACHE = join('test-results/dot-cache', TREE);
const MANIFEST = join(GOLDENS, 'ratchet.json');
const today = new Date().toISOString().slice(0, 10);
const commit = execFileSync('git', ['rev-parse', '--short', 'HEAD']).toString().trim();
const write = process.argv.includes('--write');

const readJson = (p: string) => JSON.parse(readFileSync(p, 'utf8'));
const manifest = existsSync(MANIFEST) ? readJson(MANIFEST) : { fixtures: [] };
const pinned = new Set(manifest.fixtures.map((f: { slug: string }) => f.slug));
const pins: string[] = [];
for (const row of readJson('tests/oracle/svg-conformance/parity-board.json').fixtures) {
  if (row.verdict !== 'conformant' || pinned.has(row.slug)) continue;
  const source = readFileSync(join(CACHE, row.slug, 'in.puml'), 'utf8');
  const ours = renderSync(source, { measurer: new DeterministicMeasurer(), includeStore: fixtureIncludeStore() });
  const diffs = compareSvg(ours, readFileSync(join(CACHE, row.slug, 'in.svg'), 'utf8'), 'deterministic').diffs.length;
  const ok = diffs === 0;
  console.log(`${ok ? 'PIN ' : 'hold'} ${row.slug} diffs=${diffs}`);
  if (ok) pins.push(row.slug);
}

function appendTwins(file: string): void {
  const path = join(BASELINES, file);
  const base = readJson(path);
  for (const slug of pins) {
    const twin = base.fixtures.find(
      (r: { tree: string; type: string; slug: string }) => r.tree === 'dot-cache' && r.type === TREE && r.slug === slug,
    );
    if (twin === undefined) throw new Error(`${file}: no dot-cache twin for ${slug}`);
    base.fixtures.push({
      ...twin,
      tree: 'goldens',
      type: GOLDEN_TYPE,
      slug,
      measuredAt: today,
      measuredAgainstCommit: commit,
    });
  }
  base.$comment += ` Re-pinned ${today} at ${commit} by board-engine-port T4, ADDITIVE ONLY (${pins.length} "${GOLDEN_TYPE}" golden rows appended, clones of their byte-identical dot-cache twins).`;
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
  writeFileSync(MANIFEST, `${JSON.stringify(manifest, null, 2)}\n`);
  appendTwins('routing-baseline.json');
  appendTwins('refusal-baseline.json');
}
console.log(`pins ${pins.length}${write ? ' written' : ''}`);
