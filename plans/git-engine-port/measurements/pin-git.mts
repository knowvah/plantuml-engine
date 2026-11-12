// Pin git rows into the svg-git ratchet (gip T4, D8), laep pin-legacy.mts with git substituted and a structural tier.
// Rows are measurements/planning-rows.json. A row pins `conformant` when its committed survey verdict is conformant and
// the ratchet's own render is zero-diff; it pins `structural` when both the committed verdict and the ratchet's own
// `diffVerdict` are structural-match, with that `maxDelta` as its ceiling. A pinned structural row that is now
// conformant is listed for promotion. Without --write: prints each candidate and why it is held. With --write, per pin:
// copies the dot-cache in.puml and in.svg to svg-git/<bucket>/<slug>/, appends { slug, type, addedAt,
// source } to ratchet.json, and appends `goldens` twins of the dot-cache rows to routing- and refusal-baseline.json.
// Usage: npx jiti plans/git-engine-port/measurements/pin-git.mts [--write]
import { execFileSync } from 'node:child_process';
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { diffVerdict } from '../../../scripts/svg-parity-survey.js';
import { renderFixtureGit } from '../../../tests/oracle/svg-conformance/render-fixture-git.js';

const GOLDEN_TYPE = 'svg-git';
const GOLDENS = join('oracle/goldens', GOLDEN_TYPE);
const BASELINES = 'oracle/goldens/svg-conformance';
const CACHE = 'test-results/dot-cache';
const ROWS = 'plans/git-engine-port/measurements/planning-rows.json';
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

type Tiered = Row & { tier: 'conformant' | 'structural'; maxDelta?: number };
const pins: Tiered[] = [];
for (const row of rows) {
  const key = `${row.bucket}/${row.slug}`;
  const dir = join(CACHE, row.bucket, row.slug);
  const measure = () => {
    const ours = renderFixtureGit(readFileSync(join(dir, 'in.puml'), 'utf8'));
    return diffVerdict(ours, readFileSync(join(dir, 'in.svg'), 'utf8'));
  };
  if (pinned.has(key)) {
    const pin = manifest.fixtures.find((f: { type: string; slug: string }) => `${f.type}/${f.slug}` === key);
    if (pin.tier === 'structural' && measure().verdict === 'conformant') console.log(`PROMOTE ${key} to conformant`);
    continue;
  }
  const verdict = verdicts.get(key);
  if (verdict !== 'conformant' && verdict !== 'structural-match') {
    console.log(`hold ${key} verdict=${verdict}`);
    continue;
  }
  const v = measure();
  const tier = v.verdict === 'conformant' ? 'conformant' : v.verdict === 'structural-match' ? 'structural' : undefined;
  console.log(`${tier !== undefined ? 'PIN ' : 'hold'} ${key} ${tier ?? v.verdict} maxDelta=${v.maxDelta ?? 0}`);
  if (tier === 'conformant') pins.push({ ...row, tier });
  else if (tier === 'structural') pins.push({ ...row, tier, maxDelta: v.maxDelta ?? 0 });
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
  base.$comment += ` Re-pinned ${today} at ${commit} by git-engine-port T4, ADDITIVE ONLY (${pins.length} "${GOLDEN_TYPE}" golden rows appended, clones of their byte-identical dot-cache twins).`;
  writeFileSync(path, `${JSON.stringify(base, null, 2)}\n`);
}

if (write && pins.length > 0) {
  for (const row of pins) {
    const src = join(CACHE, row.bucket, row.slug);
    const dir = join(GOLDENS, row.bucket, row.slug);
    mkdirSync(dir, { recursive: true });
    copyFileSync(join(src, 'in.puml'), join(dir, 'in.puml'));
    copyFileSync(join(src, 'in.svg'), join(dir, 'golden.svg'));
    manifest.fixtures.push({
      slug: row.slug,
      type: row.bucket,
      addedAt: today,
      source: 'dot-cache',
      tier: row.tier,
      ...(row.maxDelta === undefined ? {} : { maxDelta: row.maxDelta }),
    });
  }
  writeFileSync(MANIFEST, `${JSON.stringify(manifest, null, 2)}\n`);
  appendTwins('routing-baseline.json');
  appendTwins('refusal-baseline.json');
}
const byTier = (t: string) => pins.filter((p) => p.tier === t).length;
console.log(`pins ${pins.length} (conformant ${byTier('conformant')}, structural ${byTier('structural')})${write ? ' written' : ''}`);
