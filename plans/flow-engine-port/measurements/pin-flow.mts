// Pin conformant flow rows into the svg-flow ratchet (bpe T4, D6), laep pin-legacy.mts with flow
// substituted. Rows are measurements/planning-rows.json; a row pins when its committed survey verdict is conformant and the
// ratchet's own render is zero-diff. Without --write: prints each candidate and why it is held. With --write, per pin:
// copies the dot-cache in.puml and in.svg to svg-flow/<bucket>/<slug>/, appends { slug, type, addedAt,
// source } to ratchet.json, and appends `goldens` twins of the dot-cache rows to routing- and refusal-baseline.json.
// Usage: npx jiti plans/flow-engine-port/measurements/pin-flow.mts [--write]
import { execFileSync } from 'node:child_process';
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { compareSvg } from '../../../tests/oracle/svg-conformance/compare.js';
import { renderFixtureFlow } from '../../../tests/oracle/svg-conformance/render-fixture-flow.js';

const GOLDEN_TYPE = 'svg-flow';
const GOLDENS = join('oracle/goldens', GOLDEN_TYPE);
const BASELINES = 'oracle/goldens/svg-conformance';
const CACHE = 'test-results/dot-cache';
const ROWS = 'plans/flow-engine-port/measurements/planning-rows.json';
const MANIFEST = join(GOLDENS, 'ratchet.json');
const today = new Date().toISOString().slice(0, 10);
const commit = execFileSync('git', ['rev-parse', '--short', 'HEAD']).toString().trim();
const write = process.argv.includes('--write');

interface Row {
  readonly bucket: string;
  readonly slug: string;
}
type Pin = Record<string, unknown> & { tree: string; type: string; slug: string };

const readJson = (p: string) => JSON.parse(readFileSync(p, 'utf8'));
const manifest = existsSync(MANIFEST) ? readJson(MANIFEST) : { fixtures: [] };
const pinned = new Set(manifest.fixtures.map((f: { type: string; slug: string }) => `${f.type}/${f.slug}`));
const verdicts = new Map<string, string>();
const rows = readJson(ROWS) as Row[];
for (const bucket of new Set(rows.map((r) => r.bucket))) {
  for (const r of readJson(`tests/oracle/svg-conformance/parity-${bucket}.json`).fixtures) {
    verdicts.set(`${bucket}/${r.slug}`, r.verdict);
  }
}

const pins: Row[] = [];
for (const row of rows) {
  const key = `${row.bucket}/${row.slug}`;
  if (pinned.has(key)) continue;
  const verdict = verdicts.get(key);
  if (verdict !== 'conformant') {
    console.log(`hold ${key} verdict=${verdict}`);
    continue;
  }
  const dir = join(CACHE, row.bucket, row.slug);
  const ours = renderFixtureFlow(readFileSync(join(dir, 'in.puml'), 'utf8'));
  const diffs = compareSvg(ours, readFileSync(join(dir, 'in.svg'), 'utf8'), 'deterministic').diffs;
  const ok = diffs.length === 0;
  console.log(`${ok ? 'PIN ' : 'hold'} ${key} diffs=${diffs.length}${ok ? '' : ` first=${diffs[0]!.path}`}`);
  if (ok) pins.push(row);
}

function appendTwins(file: string): void {
  const path = join(BASELINES, file);
  const base = readJson(path);
  for (const row of pins) {
    const twin = base.fixtures.find(
      (r: Pin) => r.tree === 'dot-cache' && r.type === row.bucket && r.slug === row.slug,
    );
    if (twin === undefined) throw new Error(`${file}: no dot-cache twin for ${row.bucket}/${row.slug}`);
    base.fixtures.push({
      ...twin,
      tree: 'goldens',
      type: GOLDEN_TYPE,
      slug: `${row.bucket}/${row.slug}`,
      measuredAt: today,
      measuredAgainstCommit: commit,
    });
  }
  base.$comment += ` Re-pinned ${today} at ${commit} by flow-engine-port T4, ADDITIVE ONLY (${pins.length} "${GOLDEN_TYPE}" golden rows appended, clones of their byte-identical dot-cache twins).`;
  writeFileSync(path, `${JSON.stringify(base, null, 2)}\n`);
}

if (write && pins.length > 0) {
  for (const row of pins) {
    const src = join(CACHE, row.bucket, row.slug);
    const dir = join(GOLDENS, row.bucket, row.slug);
    mkdirSync(dir, { recursive: true });
    copyFileSync(join(src, 'in.puml'), join(dir, 'in.puml'));
    copyFileSync(join(src, 'in.svg'), join(dir, 'golden.svg'));
    manifest.fixtures.push({ slug: row.slug, type: row.bucket, addedAt: today, source: 'dot-cache' });
  }
  writeFileSync(MANIFEST, `${JSON.stringify(manifest, null, 2)}\n`);
  appendTwins('routing-baseline.json');
  appendTwins('refusal-baseline.json');
}
console.log(`pins ${pins.length}${write ? ' written' : ''}`);
