// Every compareSvg diff of every open row in scope, through the survey's own render options.
// Usage: npx jiti plans/description-divergence-drive/measurements/row-diffs.mts <survey-dir> <out.json> [slug ...]
// <survey-dir> holds parity-component.json, parity-usecase.json, parity-unknown.json. With slugs, those rows only.
// A diff compareSvg short-circuits (`[childCount]`) hides what lies under it: re-read after each fix.
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { combineAssetStores, loadElk, renderSync } from '../../../src/index.js';
import { DeterministicMeasurer } from '../../../src/core/measurer-deterministic.js';
import { fixtureIncludeStore } from '../../../tests/helpers/fixture-include-store.js';
import { compareSvg } from '../../../tests/oracle/svg-conformance/compare.js';
import { buildEmojiAssetsStore } from '../../../scripts/emoji-assets-store.js';
import { buildSpriteAssetsStore } from '../../../scripts/sprite-assets-store.js';
import { buildUtilityAssetsStore } from '../../../scripts/utility-assets-store.js';
import { BUCKETS, inScope } from './scope.mjs';

const CACHE = 'test-results/dot-cache';
const CONFORMANT = 'conformant';
const FIELD_LIMIT = 160;

const [surveyDir, outPath, ...slugs] = process.argv.slice(2);
if (surveyDir === undefined || outPath === undefined) {
  throw new Error('usage: row-diffs.mts <survey-dir> <out.json> [slug ...]');
}

const elk = await loadElk();
const assetStore = combineAssetStores(buildSpriteAssetsStore(), buildEmojiAssetsStore(), buildUtilityAssetsStore());
const options = {
  jarCompatibleStyleInput: true,
  measurer: new DeterministicMeasurer(),
  assetStore,
  includeStore: fixtureIncludeStore(),
  filename: 'in.puml',
  elk,
} as Parameters<typeof renderSync>[1];

const out: Record<string, unknown> = {};
for (const bucket of BUCKETS) {
  const survey = JSON.parse(readFileSync(join(surveyDir, `parity-${bucket}.json`), 'utf8')).fixtures;
  for (const r of inScope(bucket, survey)) {
    if (slugs.length > 0 ? !slugs.includes(r.slug) : r.verdict === CONFORMANT) continue;
    const dir = join(CACHE, bucket, r.slug);
    const row = { verdict: r.verdict, dotEqual: r.dotEqual, layoutEqual: r.layoutEqual };
    try {
      const svg = renderSync(readFileSync(join(dir, 'in.puml'), 'utf8'), options);
      const { diffs } = compareSvg(svg, readFileSync(join(dir, 'in.svg'), 'utf8'), 'deterministic');
      out[r.key] = {
        ...row,
        diffs: diffs.map((d) => ({
          p: d.path,
          a: String(d.actual).slice(0, FIELD_LIMIT),
          e: String(d.expected).slice(0, FIELD_LIMIT),
        })),
      };
    } catch (err) {
      // `oracle-error`: the jar's cached SVG does not parse (`usecase/fepuvo-06-rugi981`), so there is no diff to read.
      out[r.key] = { ...row, compareError: String(err).slice(0, FIELD_LIMIT), diffs: [] };
    }
  }
}
writeFileSync(outPath, JSON.stringify(out));
console.log(`rows ${Object.keys(out).length}`);
