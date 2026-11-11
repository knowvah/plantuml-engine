// (Re)generate oracle/goldens/svg-wire/diff-baseline.json: the cached wire rows the jar draws as an error
// page (oracle/goldens/stock-error-pages.json), where we also draw ours (ruling 2026-10-10), so they can never be
// zero-diff and pin-wire.mts holds them (wrp D7: a diff-baseline is written only for rows that stay nonzero).
// Usage: npx jiti plans/wire-engine-port/measurements/build-diff-baseline.mts <commit> [--write]
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { compareSvg, weightedScore } from '../../../tests/oracle/svg-conformance/compare.js';
import { renderFixtureWire } from '../../../tests/oracle/svg-conformance/render-fixture-wire.js';

const OUT = 'oracle/goldens/svg-wire/diff-baseline.json';
const CACHE = 'test-results/dot-cache/wire';
const [commit, flag] = process.argv.slice(2);
if (commit === undefined) throw new Error('usage: build-diff-baseline.mts <commit> [--write]');

const stock = JSON.parse(readFileSync('oracle/goldens/stock-error-pages.json', 'utf8')) as {
  errors: Record<string, { line: number | null; message: string }>;
};
const rows = JSON.parse(readFileSync('plans/wire-engine-port/measurements/planning-rows.json', 'utf8')) as {
  slug: string;
}[];
const today = new Date().toISOString().slice(0, 10);
const fixtures = [];
for (const { slug } of rows) {
  const jarError = stock.errors[`wire/${slug}`];
  if (jarError === undefined) continue;
  const ours = renderFixtureWire(readFileSync(join(CACHE, slug, 'in.puml'), 'utf8'));
  const { diffs } = compareSvg(ours, readFileSync(join(CACHE, slug, 'in.svg'), 'utf8'), 'deterministic');
  fixtures.push({
    type: 'wire',
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
  console.log(`wire/${slug}\t${String(diffs.length)}\t${jarError.message}`);
}
console.log(`rows ${String(fixtures.length)}`);
if (flag === '--write') writeFileSync(OUT, `${JSON.stringify({ fixtures }, null, 2)}\n`);
