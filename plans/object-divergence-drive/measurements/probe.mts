// Compare one authored .puml against its oracle SVG, through the survey's render options.
// Usage: npx jiti plans/object-divergence-drive/measurements/probe.mts <in.puml> <oracle.svg> [limit]
// Render the oracle first with scripts/oracle-render.sh. Prints the diff count and the first diffs.
import { readFileSync } from 'node:fs';

import { combineAssetStores, loadElk, renderSync } from '../../../src/index.js';
import { DeterministicMeasurer } from '../../../src/core/measurer-deterministic.js';
import { fixtureIncludeStore } from '../../../tests/helpers/fixture-include-store.js';
import { compareSvg } from '../../../tests/oracle/svg-conformance/compare.js';
import { buildEmojiAssetsStore } from '../../../scripts/emoji-assets-store.js';
import { buildSpriteAssetsStore } from '../../../scripts/sprite-assets-store.js';
import { buildUtilityAssetsStore } from '../../../scripts/utility-assets-store.js';

const FIELD_LIMIT = 70;
const DEFAULT_LIMIT = 12;

const [pumlPath, oraclePath, limitArg] = process.argv.slice(2);
if (pumlPath === undefined || oraclePath === undefined) {
  throw new Error('usage: probe.mts <in.puml> <oracle.svg> [limit]');
}
const options = {
  jarCompatibleStyleInput: true,
  measurer: new DeterministicMeasurer(),
  assetStore: combineAssetStores(buildSpriteAssetsStore(), buildEmojiAssetsStore(), buildUtilityAssetsStore()),
  includeStore: fixtureIncludeStore(),
  filename: 'in.puml',
  elk: await loadElk(),
} as Parameters<typeof renderSync>[1];
const { diffs } = compareSvg(renderSync(readFileSync(pumlPath, 'utf8'), options), readFileSync(oraclePath, 'utf8'), 'deterministic');
console.log(`diffs ${diffs.length}`);
for (const d of diffs.slice(0, limitArg === undefined ? DEFAULT_LIMIT : Number(limitArg))) {
  console.log(`  ${d.path} | ${String(d.actual).slice(0, FIELD_LIMIT)} | ${String(d.expected).slice(0, FIELD_LIMIT)}`);
}
