/**
 * sogr planning measurer. Renders the 94 sequence rows that #109 captured (and
 * that have no `diff-baseline.json` row) through the RATCHET path:
 * `renderFixtureSequence` + `DeterministicMeasurer` + `sequenceFixtureOptions()`,
 * the same seams `plans/sequence-divergence-drive-3/tools/diff-one.mts` uses.
 *
 *   npx tsx plans/sequence-oracle-gap-rows/measurements/measure-rows.mts [out.json] [slug...]
 *
 * With no slugs, measures every slug in `new-rows.json`. Prints one summary
 * line (`rows N zero Z open O error E`) and one line per non-zero row.
 * Run from the repo root.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { DeterministicMeasurer } from '../../../src/core/measurer-deterministic.js';
import { compareSvg, weightedScore } from '../../../tests/oracle/svg-conformance/compare.js';
import {
  renderFixtureSequence,
  sequenceFixtureOptions,
} from '../../../tests/oracle/svg-conformance/render-fixture-sequence.js';

const [outPath = '/tmp/sogr-plan/measure.json', ...given] = process.argv.slice(2);
const slugs: string[] =
  given.length > 0
    ? given
    : (JSON.parse(readFileSync('plans/sequence-oracle-gap-rows/measurements/new-rows.json', 'utf8')) as string[]);

interface Row {
  slug: string;
  n?: number;
  ws?: number;
  first?: string[];
  error?: string;
}
const out: Row[] = [];
for (const slug of slugs) {
  const dir = `test-results/dot-cache/sequence/${slug}`;
  try {
    const svg = renderFixtureSequence(
      readFileSync(`${dir}/in.puml`, 'utf8'),
      new DeterministicMeasurer(),
      sequenceFixtureOptions(),
    );
    const r = compareSvg(svg, readFileSync(`${dir}/in.svg`, 'utf8'), 'deterministic');
    out.push({
      slug,
      n: r.diffs.length,
      ws: weightedScore(r.diffs),
      first: r.diffs
        .slice(0, 3)
        .map((d) => `${d.path} ours=${String(d.actual).slice(0, 60)} jar=${String(d.expected).slice(0, 60)}`),
    });
  } catch (e) {
    out.push({ slug, error: String(e).slice(0, 200) });
  }
}
writeFileSync(outPath, JSON.stringify(out, null, 1));
const zero = out.filter((r) => r.n === 0).length;
const err = out.filter((r) => r.error !== undefined).length;
console.log(`rows ${out.length} zero ${zero} open ${out.length - zero - err} error ${err}`);
for (const r of out) if (r.n !== 0) console.log(`${r.slug} n=${r.n ?? '-'} ws=${r.ws ?? '-'} ${r.error ?? r.first?.[0] ?? ''}`);
