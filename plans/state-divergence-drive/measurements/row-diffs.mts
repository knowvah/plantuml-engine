// Every compareSvg diff of every non-conformant state row, through the survey's own render options.
// Usage: npx jiti plans/state-divergence-drive/measurements/row-diffs.mts <parity.json> <out.json> [slug ...]
// A diff that compareSvg short-circuits (`[childCount]`) hides what lies under it: re-read after each fix.
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { combineAssetStores, loadElk, renderSync } from '../../../src/index.js';
import { DeterministicMeasurer } from '../../../src/core/measurer-deterministic.js';
import { fixtureIncludeStore } from '../../../tests/helpers/fixture-include-store.js';
import { compareSvg } from '../../../tests/oracle/svg-conformance/compare.js';
import { buildEmojiAssetsStore } from '../../../scripts/emoji-assets-store.js';
import { buildSpriteAssetsStore } from '../../../scripts/sprite-assets-store.js';
import { buildUtilityAssetsStore } from '../../../scripts/utility-assets-store.js';

const CACHE = 'test-results/dot-cache/state';
const CONFORMANT = 'conformant';
const FIELD_LIMIT = 160;

const [parityPath, outPath, ...slugs] = process.argv.slice(2);
if (parityPath === undefined || outPath === undefined) {
  throw new Error('usage: row-diffs.mts <parity.json> <out.json> [slug ...]');
}

const elk = await loadElk();
const assetStore = combineAssetStores(buildSpriteAssetsStore(), buildEmojiAssetsStore(), buildUtilityAssetsStore());
const rows = JSON.parse(readFileSync(parityPath, 'utf8')).fixtures as { slug: string; verdict: string }[];
const out: Record<string, unknown> = {};
for (const r of rows) {
  if (slugs.length > 0 ? !slugs.includes(r.slug) : r.verdict === CONFORMANT) continue;
  const dir = join(CACHE, r.slug);
  const svg = renderSync(readFileSync(join(dir, 'in.puml'), 'utf8'), {
    jarCompatibleStyleInput: true,
    measurer: new DeterministicMeasurer(),
    assetStore,
    includeStore: fixtureIncludeStore(),
    filename: 'in.puml',
    elk,
  } as Parameters<typeof renderSync>[1]);
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
