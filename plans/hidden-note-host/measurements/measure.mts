// A note on a hidden or removed host (#204): every probe through production `renderSync` with the survey's options
// (deterministic measurer, jar-compatible style input, the survey asset store, `in.puml`, an ELK backend from
// `loadElk()`), as `scripts/svg-parity-survey.ts` renders a row. Compared with the jar svg by `compareSvg`, plus the
// comment sequence (`svgComments`), which `compareSvg` drops.
// Usage: npx tsx plans/hidden-note-host/measurements/measure.mts [dir] [out.json]
//   dir: a flat tree of `<slug>.puml` with the jar's svg at `<slug>.svg` beside it or at `jar/<slug>.svg`.
//   Default: plans/hidden-note-host/measurements/probes.
// Prints one line per row (diff count, weighted score, comment mismatch, first diff), then
// `rows N zero Z open O throw T`. A row is zero when both its diff count and its comment mismatch are 0.
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
import { commentMismatch, svgComments } from '../../../tests/oracle/svg-conformance/svg-comments.js';

const DEFAULT_DIR = 'plans/hidden-note-host/measurements/probes';
const FIRST_DIFF_LIMIT = 160;

const [dir = DEFAULT_DIR, outPath] = process.argv.slice(2);
const elk = await loadElk();
const assetStore = combineAssetStores(buildSpriteAssetsStore(), buildEmojiAssetsStore(), buildUtilityAssetsStore());

function goldenOf(slug: string): string {
  const beside = join(dir, `${slug}.svg`);
  return readFileSync(existsSync(beside) ? beside : join(dir, 'jar', `${slug}.svg`), 'utf8');
}

interface Row {
  slug: string;
  diffs: number;
  score: number;
  comments: number;
  firstDiff: string | null;
  thrown?: string;
}

const rows: Row[] = [];
for (const file of readdirSync(dir).filter((f) => f.endsWith('.puml')).sort()) {
  const slug = file.slice(0, -'.puml'.length);
  try {
    const ours = renderSync(
      readFileSync(join(dir, file), 'utf8'),
      withJarCompatibleStyleInput({
        measurer: new DeterministicMeasurer(),
        assetStore,
        includeStore: fixtureIncludeStore(),
        filename: 'in.puml',
        elk,
      }),
    );
    const jar = goldenOf(slug);
    const { diffs } = compareSvg(ours, jar, 'svg');
    const firstDiff = diffs[0] === undefined ? null : JSON.stringify(diffs[0]).slice(0, FIRST_DIFF_LIMIT);
    const comments = commentMismatch(svgComments(ours), svgComments(jar));
    rows.push({ slug, diffs: diffs.length, score: weightedScore(diffs), comments, firstDiff });
  } catch (e) {
    rows.push({ slug, diffs: -1, score: -1, comments: -1, firstDiff: null, thrown: String(e) });
  }
}

for (const r of rows)
  console.log(
    r.slug.padEnd(36),
    r.thrown === undefined
      ? `diffs ${String(r.diffs).padStart(4)} score ${String(r.score).padStart(4)} cmt ${r.comments}`
      : 'THROW',
    '|',
    r.thrown ?? r.firstDiff ?? '',
  );
const zero = rows.filter((r) => r.diffs === 0 && r.comments === 0).length;
const thrown = rows.filter((r) => r.thrown !== undefined).length;
console.log(`rows ${rows.length} zero ${zero} open ${rows.length - zero - thrown} throw ${thrown}`);
if (outPath !== undefined) writeFileSync(outPath, JSON.stringify(rows, null, 2) + '\n');
