// Legacy activity under `!pragma layout elk` (#158): every probe through production `renderSync` with the survey's
// options (deterministic measurer, jar-compatible style input, the survey asset store, `in.puml`) and an ELK backend
// from `loadElk()`, as `scripts/svg-parity-survey.ts` renders an ELK row. Works before and after T1: it never relies
// on the fixture harness preparing ELK.
// Usage: npx tsx plans/legacy-activity-elk/measurements/measure.mts [dir] [out.json]
//   dir: a flat tree of `<slug>.puml` with the jar's svg at `<slug>.svg` beside it or at `jar/<slug>.svg`.
//   Default: plans/legacy-activity-elk/measurements/probes. Only `.puml` files carrying `!pragma layout elk` are read.
// Prints one line per row (diff count, weighted score, first diff), then `rows N zero Z open O throw T`.
import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { withJarCompatibleStyleInput } from '../../../src/core/internal-render-options.js';
import { DeterministicMeasurer } from '../../../src/core/measurer-deterministic.js';
import { combineAssetStores, loadElk, renderSync } from '../../../src/index.js';
import { buildEmojiAssetsStore } from '../../../tests/helpers/emoji-assets-store.js';
import { fixtureIncludeStore } from '../../../tests/helpers/fixture-include-store.js';
import { buildSpriteAssetsStore } from '../../../tests/helpers/sprite-assets-store.js';
import { buildUtilityAssetsStore } from '../../../tests/helpers/utility-assets-store.js';
import { compareSvg, weightedScore } from '../../../tests/oracle/svg-conformance/compare.js';

const DEFAULT_DIR = 'plans/legacy-activity-elk/measurements/probes';
const ELK_PRAGMA = /^\s*!pragma\s+layout\s+elk\s*$/m;
const FIRST_DIFF_LIMIT = 140;

const [dir = DEFAULT_DIR, outPath] = process.argv.slice(2);
const elk = await loadElk();
const assetStore = combineAssetStores(buildSpriteAssetsStore(), buildEmojiAssetsStore(), buildUtilityAssetsStore());

function goldenOf(slug: string): string {
  const beside = join(dir, `${slug}.svg`);
  return readFileSync(existsSync(beside) ? beside : join(dir, 'jar', `${slug}.svg`), 'utf8');
}

const rows: { slug: string; diffs: number; score: number; firstDiff: string | null; thrown?: string }[] = [];
for (const file of readdirSync(dir).filter((f) => f.endsWith('.puml')).sort()) {
  const slug = file.slice(0, -'.puml'.length);
  const source = readFileSync(join(dir, file), 'utf8');
  if (!ELK_PRAGMA.test(source)) continue;
  try {
    const ours = renderSync(
      source,
      withJarCompatibleStyleInput({
        measurer: new DeterministicMeasurer(),
        assetStore,
        includeStore: fixtureIncludeStore(),
        filename: 'in.puml',
        elk,
      }),
    );
    const { diffs } = compareSvg(ours, goldenOf(slug), 'svg');
    const firstDiff = diffs[0] === undefined ? null : JSON.stringify(diffs[0]).slice(0, FIRST_DIFF_LIMIT);
    rows.push({ slug, diffs: diffs.length, score: weightedScore(diffs), firstDiff });
  } catch (e) {
    rows.push({ slug, diffs: -1, score: -1, firstDiff: null, thrown: String(e) });
  }
}

for (const r of rows)
  console.log(
    r.slug.padEnd(30),
    r.thrown === undefined ? `diffs ${String(r.diffs).padStart(4)} score ${String(r.score).padStart(4)}` : 'THROW',
    '|',
    r.thrown ?? r.firstDiff ?? '',
  );
const zero = rows.filter((r) => r.diffs === 0).length;
const thrown = rows.filter((r) => r.thrown !== undefined).length;
console.log(`rows ${rows.length} zero ${zero} open ${rows.length - zero - thrown} throw ${thrown}`);
if (outPath !== undefined) writeFileSync(outPath, JSON.stringify(rows, null, 2) + '\n');
