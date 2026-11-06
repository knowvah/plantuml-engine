// Compare every <slug>.puml in a directory against the <slug>.svg beside it, through the survey's render options.
// Usage: npx jiti plans/packet-engine-port/measurements/probe-dir.mts <dir> [--all]
// One line per fixture: diff count, and "jar-error" where the oracle is no PACKET drawing. Without --all, only
// nonzero rows print. Ends with "rows N zero Z jar-error E drawn-nonzero D"; exit 1 when D > 0.
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { combineAssetStores, renderSync } from '../../../src/index.js';
import { DeterministicMeasurer } from '../../../src/core/measurer-deterministic.js';
import { fixtureIncludeStore } from '../../../tests/helpers/fixture-include-store.js';
import { compareSvg } from '../../../tests/oracle/svg-conformance/compare.js';
import { buildEmojiAssetsStore } from '../../../scripts/emoji-assets-store.js';
import { buildSpriteAssetsStore } from '../../../scripts/sprite-assets-store.js';
import { buildUtilityAssetsStore } from '../../../scripts/utility-assets-store.js';

const PUML = '.puml';
const [dir, flag] = process.argv.slice(2);
if (dir === undefined) throw new Error('usage: probe-dir.mts <dir> [--all]');
const options = {
  jarCompatibleStyleInput: true,
  measurer: new DeterministicMeasurer(),
  assetStore: combineAssetStores(buildSpriteAssetsStore(), buildEmojiAssetsStore(), buildUtilityAssetsStore()),
  includeStore: fixtureIncludeStore(),
  filename: 'in.puml',
} as Parameters<typeof renderSync>[1];

let rows = 0;
let zero = 0;
let jarErrors = 0;
let drawnNonzero = 0;
for (const name of readdirSync(dir).filter((n) => n.endsWith(PUML)).sort()) {
  const slug = name.slice(0, -PUML.length);
  const oraclePath = join(dir, `${slug}.svg`);
  if (!existsSync(oraclePath)) {
    console.log(`${slug} no-oracle`);
    continue;
  }
  const oracle = readFileSync(oraclePath, 'utf8');
  const jarError = !/^<svg[^>]*\sdata-diagram-type="/.test(oracle);
  let ours: string;
  try {
    ours = renderSync(readFileSync(join(dir, name), 'utf8'), options);
  } catch (e) {
    ours = `<svg><text>threw ${String(e)}</text></svg>`;
  }
  const n = compareSvg(ours, oracle, 'deterministic').diffs.length;
  rows++;
  if (n === 0) zero++;
  if (jarError) jarErrors++;
  else if (n > 0) drawnNonzero++;
  if (n > 0 || flag === '--all') console.log(`${slug} ${n}${jarError ? ' jar-error' : ''}`);
}
console.log(`rows ${rows} zero ${zero} jar-error ${jarErrors} drawn-nonzero ${drawnNonzero}`);
process.exitCode = drawnNonzero > 0 ? 1 : 0;
