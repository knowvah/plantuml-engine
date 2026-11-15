/**
 * dogr planning measurer. Renders the 57 `@startdot` rows that #109 captured
 * (none of them pinned in `oracle/goldens/svg-dot/ratchet.json`) through the
 * RATCHET path of `tests/oracle/svg-conformance/dot.golden.ratchet.test.ts`:
 * the shipped `renderSync`, then `compareSvg(ours, jar, 'deterministic')`.
 *
 *   npx tsx plans/dot-oracle-gap-rows/measurements/measure-rows.mts [out.json] [slug...]
 *
 * With no slugs, measures every slug in `new-rows.json`. Prints one summary
 * line (`rows N zero Z open O error E`) and one line per non-zero row with its
 * first three diff paths. `jarError` marks a row whose oracle is a jar error
 * page (no graphviz `id="graph0"`): conformant by the 2026-10-10 error-page
 * ruling, so its diff count is a score to hold, never a defect. Run from the
 * repo root.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { renderSync } from '../../../src/index.js';
import { compareSvg } from '../../../tests/oracle/svg-conformance/compare.js';

const [outPath = '/tmp/dogr-plan/measure.json', ...given] = process.argv.slice(2);
const slugs: string[] =
  given.length > 0
    ? given
    : (JSON.parse(readFileSync('plans/dot-oracle-gap-rows/measurements/new-rows.json', 'utf8')) as string[]);

interface Row {
  slug: string;
  n?: number;
  jarError?: boolean;
  first?: string[];
  error?: string;
}

const rows: Row[] = [];
for (const slug of slugs) {
  const dir = `test-results/dot-cache/dot/${slug}`;
  try {
    const jar = readFileSync(`${dir}/in.svg`, 'utf8');
    const ours = renderSync(readFileSync(`${dir}/in.puml`, 'utf8'));
    const { diffs } = compareSvg(ours, jar, 'deterministic');
    const jarError = !jar.includes('id="graph0"');
    rows.push({ slug, n: diffs.length, jarError, first: diffs.slice(0, 3).map((d) => d.path) });
  } catch (e) {
    rows.push({ slug, error: e instanceof Error ? e.message : String(e) });
  }
}
writeFileSync(outPath, JSON.stringify(rows, null, 2) + '\n');
const zero = rows.filter((r) => r.n === 0).length;
const err = rows.filter((r) => r.error !== undefined).length;
const jarErr = rows.filter((r) => r.jarError === true).length;
console.log(`rows ${rows.length} zero ${zero} open ${rows.length - zero - err} error ${err} jar-error-page ${jarErr}`);
for (const r of rows) {
  if (r.error !== undefined) console.log(`${r.slug} ERROR ${r.error}`);
  else if (r.n !== 0) console.log(`${r.slug} n=${r.n}${r.jarError ? ' jar-error-page' : ''} ${(r.first ?? []).join(' | ')}`);
}
