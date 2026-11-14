/**
 * cogr planning measurer. Renders the 151 class rows that #109 captured (none
 * of them pinned in `oracle/goldens/svg-class/ratchet.json`) through the
 * RATCHET path of `tests/oracle/svg-conformance/class.golden.ratchet.test.ts:209-210`:
 * `renderClassFixture` + `DeterministicMeasurer` + `censusClassFixtureOptions()`,
 * then `compareSvg(ours, jar, 'deterministic')`.
 *
 *   npx tsx plans/class-oracle-gap-rows/measurements/measure-rows.mts [out.json] [slug...]
 *
 * With no slugs, measures every slug in `new-rows.json`. Prints one summary
 * line (`rows N zero Z open O error E`) and one line per non-zero row with its
 * first three diff paths. Run from the repo root.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { censusClassFixtureOptions } from '../../../scripts/svg-conformance-census.js';
import { DeterministicMeasurer } from '../../../src/core/measurer-deterministic.js';
import { compareSvg } from '../../../tests/oracle/svg-conformance/compare.js';
import { prepareElkOnce, renderClassFixture } from '../../../tests/oracle/svg-conformance/render-fixture-class.js';

const [outPath = '/tmp/cogr-plan/measure.json', ...given] = process.argv.slice(2);
const slugs: string[] =
  given.length > 0
    ? given
    : (JSON.parse(readFileSync('plans/class-oracle-gap-rows/measurements/new-rows.json', 'utf8')) as string[]);

interface Row {
  slug: string;
  n?: number;
  first?: string[];
  error?: string;
}

await prepareElkOnce();
const rows: Row[] = [];
for (const slug of slugs) {
  const dir = `test-results/dot-cache/class/${slug}`;
  try {
    const markup = readFileSync(`${dir}/in.puml`, 'utf8');
    const jar = readFileSync(`${dir}/in.svg`, 'utf8');
    const ours = renderClassFixture(markup, new DeterministicMeasurer(), censusClassFixtureOptions());
    const { diffs } = compareSvg(ours, jar, 'deterministic');
    rows.push({ slug, n: diffs.length, first: diffs.slice(0, 3).map((d) => d.path) });
  } catch (e) {
    rows.push({ slug, error: e instanceof Error ? e.message : String(e) });
  }
}
writeFileSync(outPath, JSON.stringify(rows, null, 2) + '\n');
const zero = rows.filter((r) => r.n === 0).length;
const err = rows.filter((r) => r.error !== undefined).length;
console.log(`rows ${rows.length} zero ${zero} open ${rows.length - zero - err} error ${err}`);
for (const r of rows) {
  if (r.error !== undefined) console.log(`${r.slug} ERROR ${r.error}`);
  else if (r.n !== 0) console.log(`${r.slug} n=${r.n} ${(r.first ?? []).join(' | ')}`);
}
