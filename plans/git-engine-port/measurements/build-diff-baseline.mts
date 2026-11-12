// (Re)generate oracle/goldens/svg-git/diff-baseline.json: the cached git rows that can never reach the ratchet's
// tiers (gip T4, D8) — a row the jar draws as an error page (oracle/goldens/stock-error-pages.json; we draw ours, ruling
// 2026-10-10), or a drawn row whose committed survey verdict is `diverged` because a curve's cubic-piece count differs
// (U-NS routing, DIVERGENCES.md git table). Each drawn row is held at its verdict, `maxDelta` and weighted score.
// With --write: writes the file, copies each row's in.puml / in.svg to svg-git/unknown/<slug>/{in.puml,golden.svg},
// and appends `goldens` twins of the dot-cache rows to routing- and refusal-baseline.json (the gates walk every golden
// dir). Run pin-git.mts first, then this, then repin-routing-refusal.mts (which re-measures the twins too).
// Usage: npx jiti plans/git-engine-port/measurements/build-diff-baseline.mts <commit> [--write]
import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { diffVerdict } from '../../../scripts/svg-parity-survey.js';
import { compareSvg, weightedScore } from '../../../tests/oracle/svg-conformance/compare.js';
import { renderFixtureGit } from '../../../tests/oracle/svg-conformance/render-fixture-git.js';

const GOLDEN_TYPE = 'svg-git';
const GOLDENS = join('oracle/goldens', GOLDEN_TYPE);
const OUT = join(GOLDENS, 'diff-baseline.json');
const BASELINES = 'oracle/goldens/svg-conformance';
const CACHE = 'test-results/dot-cache/unknown';
const DIVERGED_REASON =
  'diverged on curve cubic-piece counts only: U-NS routing under the Smetana ruling (DIVERGENCES.md, git row table; ' +
  'plans/git-engine-port/diagnosis/). Every other element differs numerically.';
const ERROR_REASON =
  'jar-error: the stock jar draws its error page and the port draws its own from the same command ' +
  '(ruling 2026-10-10); the score measures our page against the jar page.';
const [commit, flag] = process.argv.slice(2);
if (commit === undefined) throw new Error('usage: build-diff-baseline.mts <commit> [--write]');

const readJson = (p: string) => JSON.parse(readFileSync(p, 'utf8'));
const stock = readJson('oracle/goldens/stock-error-pages.json') as {
  errors: Record<string, { line: number | null; message: string }>;
};
const rows = readJson('plans/git-engine-port/measurements/planning-rows.json') as { slug: string }[];
const verdicts = new Map<string, string>(
  readJson('tests/oracle/svg-conformance/parity-unknown.json').fixtures.map((r: { slug: string; verdict: string }) => [
    r.slug,
    r.verdict,
  ]),
);
const today = new Date().toISOString().slice(0, 10);
const fixtures = [];
for (const { slug } of rows) {
  const jarError = stock.errors[`unknown/${slug}`];
  if (jarError === undefined && verdicts.get(slug) !== 'diverged') continue;
  const ours = renderFixtureGit(readFileSync(join(CACHE, slug, 'in.puml'), 'utf8'));
  const golden = readFileSync(join(CACHE, slug, 'in.svg'), 'utf8');
  const { diffs } = compareSvg(ours, golden, 'deterministic');
  const v = diffVerdict(ours, golden);
  fixtures.push({
    type: 'unknown',
    slug,
    status: 'baseline',
    weightedScore: weightedScore(diffs),
    diffCount: diffs.length,
    ...(jarError === undefined ? { verdict: v.verdict, maxDelta: v.maxDelta ?? 0 } : { jarError }),
    reason: jarError === undefined ? DIVERGED_REASON : ERROR_REASON,
    measuredAt: today,
    measuredAgainstCommit: commit,
  });
  console.log(`unknown/${slug}\t${String(diffs.length)}\t${v.verdict}\t${String(v.maxDelta)}`);
}
console.log(`rows ${String(fixtures.length)}`);

type Pin = Record<string, unknown> & { tree: string; type: string; slug: string };
function appendTwins(file: string): void {
  const path = join(BASELINES, file);
  const base = readJson(path) as { $comment: string; fixtures: Pin[] };
  for (const { slug } of fixtures) {
    const twin = base.fixtures.find((r) => r.tree === 'dot-cache' && r.type === 'unknown' && r.slug === slug);
    if (twin === undefined) throw new Error(`${file}: no dot-cache twin for unknown/${slug}`);
    base.fixtures.push({ ...twin, tree: 'goldens', type: GOLDEN_TYPE, slug: `unknown/${slug}`, measuredAt: today });
  }
  base.$comment += ` Re-pinned ${today} at ${commit} by git-engine-port T4, ADDITIVE ONLY (${fixtures.length} "${GOLDEN_TYPE}" diff-baseline golden rows appended, clones of their byte-identical dot-cache twins).`;
  writeFileSync(path, `${JSON.stringify(base, null, 2)}\n`);
}

if (flag === '--write') {
  writeFileSync(OUT, `${JSON.stringify({ fixtures }, null, 2)}\n`);
  for (const { slug } of fixtures) {
    const dir = join(GOLDENS, 'unknown', slug);
    mkdirSync(dir, { recursive: true });
    copyFileSync(join(CACHE, slug, 'in.puml'), join(dir, 'in.puml'));
    copyFileSync(join(CACHE, slug, 'in.svg'), join(dir, 'golden.svg'));
  }
  appendTwins('routing-baseline.json');
  appendTwins('refusal-baseline.json');
}
