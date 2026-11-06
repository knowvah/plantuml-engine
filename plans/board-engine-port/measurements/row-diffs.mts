// Every compareSvg diff of the open board rows, through the survey's own render options.
// Usage: npx jiti plans/board-engine-port/measurements/row-diffs.mts <parity-board.json> <out.json> [slug ...]
// With slugs, those rows only; otherwise every row the survey does not call conformant.
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

const CACHE = 'test-results/dot-cache/board';
const CONFORMANT = 'conformant';
const FIELD_LIMIT = 200;

const [surveyPath, outPath, ...slugs] = process.argv.slice(2);
if (surveyPath === undefined || outPath === undefined) {
  throw new Error('usage: row-diffs.mts <parity-board.json> <out.json> [slug ...]');
}

const assetStore = combineAssetStores(buildSpriteAssetsStore(), buildEmojiAssetsStore(), buildUtilityAssetsStore());
const options = {
  jarCompatibleStyleInput: true,
  measurer: new DeterministicMeasurer(),
  assetStore,
  includeStore: fixtureIncludeStore(),
  filename: 'in.puml',
} as Parameters<typeof renderSync>[1];

const out: Record<string, unknown> = {};
for (const r of JSON.parse(readFileSync(surveyPath, 'utf8')).fixtures) {
  if (slugs.length > 0 ? !slugs.includes(r.slug) : r.verdict === CONFORMANT) continue;
  const dir = join(CACHE, r.slug);
  const svg = renderSync(readFileSync(join(dir, 'in.puml'), 'utf8'), options);
  writeFileSync(`${outPath}.${r.slug}.svg`, svg);
  const { diffs } = compareSvg(svg, readFileSync(join(dir, 'in.svg'), 'utf8'), 'deterministic');
  out[r.slug] = {
    verdict: r.verdict,
    diffs: diffs.map((d) => ({
      p: d.path,
      a: String(d.actual).slice(0, FIELD_LIMIT),
      e: String(d.expected).slice(0, FIELD_LIMIT),
    })),
  };
}
writeFileSync(outPath, JSON.stringify(out));
console.log(`rows ${Object.keys(out).length}`);
