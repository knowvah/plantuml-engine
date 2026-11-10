// Every compareSvg diff of the ebnf rows, through the survey's own render options and
// production `renderSync` (`ebnfPlugin` registered at `PSystemBuilder.java:196`, T3a).
// Usage: npx jiti plans/ebnf-engine-port/measurements/row-diffs.mts <rows.json> <out.json> [slug ...]
//   <rows.json> is `ebnf-rows.mjs <survey-dir> --json <out>` output (or measurements/planning-rows.json).
// With slugs, those rows only; otherwise every row. Prints each row's diff count and first diff, then a histogram.
// A diff compareSvg short-circuits (`[childCount]`) hides what lies under it: re-read after each fix.
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { combineAssetStores, renderSync } from '../../../src/index.js';
import { DeterministicMeasurer } from '../../../src/core/measurer-deterministic.js';
import { fixtureIncludeStore } from '../../../tests/helpers/fixture-include-store.js';
import { compareSvg } from '../../../tests/oracle/svg-conformance/compare.js';
import { buildEmojiAssetsStore } from '../../../scripts/emoji-assets-store.js';
import { buildSpriteAssetsStore } from '../../../scripts/sprite-assets-store.js';
import { buildUtilityAssetsStore } from '../../../scripts/utility-assets-store.js';

const CACHE = 'test-results/dot-cache';
const FIELD_LIMIT = 200;
const ERROR_PREFIX = 'error: ';

const [rowsPath, outPath, ...slugs] = process.argv.slice(2);
if (rowsPath === undefined || outPath === undefined) {
  throw new Error('usage: row-diffs.mts <rows.json> <out.json> [slug ...]');
}

const assetStore = combineAssetStores(buildSpriteAssetsStore(), buildEmojiAssetsStore(), buildUtilityAssetsStore());
const options = {
  jarCompatibleStyleInput: true,
  measurer: new DeterministicMeasurer(),
  assetStore,
  includeStore: fixtureIncludeStore(),
  filename: 'in.puml',
} as Parameters<typeof renderSync>[1];

interface Row {
  bucket: string;
  slug: string;
}
interface Result {
  count: number;
  first: string;
  diffs: { p: string; a: string; e: string }[];
}

function measure(row: Row): Result {
  const dir = join(CACHE, row.bucket, row.slug);
  let svg: string;
  try {
    svg = renderSync(readFileSync(join(dir, 'in.puml'), 'utf8'), options);
  } catch (e) {
    const message = (e instanceof Error ? e.message : String(e)).split('\n')[0]!;
    return { count: -1, first: ERROR_PREFIX + message.slice(0, FIELD_LIMIT), diffs: [] };
  }
  writeFileSync(`${outPath}.${row.slug}.svg`, svg);
  const { diffs } = compareSvg(svg, readFileSync(join(dir, 'in.svg'), 'utf8'), 'deterministic');
  const mapped = diffs.map((d) => ({
    p: d.path,
    a: String(d.actual).slice(0, FIELD_LIMIT),
    e: String(d.expected).slice(0, FIELD_LIMIT),
  }));
  return { count: diffs.length, first: mapped[0]?.p ?? '-', diffs: mapped };
}

const rows = (JSON.parse(readFileSync(rowsPath, 'utf8')) as Row[]).filter((r) => slugs.length === 0 || slugs.includes(r.slug));
const out: Record<string, Result> = {};
const histogram = new Map<string, number>();
for (const row of rows) {
  const result = measure(row);
  out[`${row.bucket}/${row.slug}`] = result;
  console.log(`${row.bucket}/${row.slug} ${result.count} ${result.first}`);
  const key = result.count === 0 ? 'conformant' : result.first;
  histogram.set(key, (histogram.get(key) ?? 0) + 1);
}
writeFileSync(outPath, JSON.stringify(out));
console.log(`rows ${rows.length}`);
for (const [key, n] of [...histogram].sort((a, b) => b[1] - a[1])) console.log(`${String(n).padStart(4)}  ${key}`);
