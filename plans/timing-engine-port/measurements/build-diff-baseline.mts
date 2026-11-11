// (Re)generate oracle/goldens/svg-timing/diff-baseline.json: the cached timing rows the jar draws as an error
// page (oracle/goldens/stock-error-pages.json), where we also draw ours (ruling 2026-10-10), so they can never be
// zero-diff and pin-timing.mts holds them (tep D12: a diff-baseline is written only for rows that stay nonzero).
// Usage: npx jiti plans/timing-engine-port/measurements/build-diff-baseline.mts <commit> [--write]
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { compareSvg, weightedScore } from '../../../tests/oracle/svg-conformance/compare.js';
import { renderFixtureTiming, timingClockFor } from '../../../tests/oracle/svg-conformance/render-fixture-timing.js';

const OUT = 'oracle/goldens/svg-timing/diff-baseline.json';
const CACHE = 'test-results/dot-cache';
const [commit, flag] = process.argv.slice(2);
if (commit === undefined) throw new Error('usage: build-diff-baseline.mts <commit> [--write]');

const stock = JSON.parse(readFileSync('oracle/goldens/stock-error-pages.json', 'utf8')) as {
  errors: Record<string, { line: number | null; message: string }>;
};
const rows = JSON.parse(readFileSync('plans/timing-engine-port/measurements/planning-rows.json', 'utf8')) as {
  bucket: string;
  slug: string;
}[];
const today = new Date().toISOString().slice(0, 10);
const fixtures = [];
for (const { bucket, slug } of rows) {
  const jarError = stock.errors[`${bucket}/${slug}`];
  if (jarError === undefined) continue;
  const ours = renderFixtureTiming(readFileSync(join(CACHE, bucket, slug, 'in.puml'), 'utf8'), undefined, timingClockFor(slug));
  const { diffs } = compareSvg(ours, readFileSync(join(CACHE, bucket, slug, 'in.svg'), 'utf8'), 'deterministic');
  fixtures.push({
    type: 'timing',
    slug,
    status: 'baseline',
    weightedScore: weightedScore(diffs),
    diffCount: diffs.length,
    jarError,
    reason:
      'jar-error: the stock jar draws its error page and the port draws its own from the same command ' +
      '(ruling 2026-10-10); the score measures our page against the jar page.',
    measuredAt: today,
    measuredAgainstCommit: commit,
  });
  console.log(`${bucket}/${slug}\t${String(diffs.length)}\t${jarError.message}`);
}
console.log(`rows ${String(fixtures.length)}`);
if (flag === '--write') writeFileSync(OUT, `${JSON.stringify({ fixtures }, null, 2)}\n`);
