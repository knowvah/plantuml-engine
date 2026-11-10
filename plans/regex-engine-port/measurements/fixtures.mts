// Measure every authored regex fixture against its committed oracle SVG, through the survey's render options.
// Usage: npx jiti plans/regex-engine-port/measurements/fixtures.mts [slug ...]
// Prints `slug<TAB>diffs<TAB>firstDiff`; a jar error page where we also draw one prints `error-pair` (ruling 2026-10-10).
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { combineAssetStores, renderSync } from '../../../src/index.js';
import { DeterministicMeasurer } from '../../../src/core/measurer-deterministic.js';
import { fixtureIncludeStore } from '../../../tests/helpers/fixture-include-store.js';
import { compareSvg } from '../../../tests/oracle/svg-conformance/compare.js';
import { isJarErrorPage } from '../../../tests/oracle/svg-conformance/corpus-gate-part.js';
import { buildEmojiAssetsStore } from '../../../scripts/emoji-assets-store.js';
import { buildSpriteAssetsStore } from '../../../scripts/sprite-assets-store.js';
import { buildUtilityAssetsStore } from '../../../scripts/utility-assets-store.js';

const DIR = 'tests/fixtures/regex';
const FIELD_LIMIT = 80;
const options = {
  jarCompatibleStyleInput: true,
  measurer: new DeterministicMeasurer(),
  assetStore: combineAssetStores(buildSpriteAssetsStore(), buildEmojiAssetsStore(), buildUtilityAssetsStore()),
  includeStore: fixtureIncludeStore(),
  filename: 'in.puml',
} as Parameters<typeof renderSync>[1];

const TEXT_RE = /<text[^>]*>([^<]*)<\/text>/g;
const HEADER_AND_FILE_LINES = 2; // version banner and `[From <file> (line N) ]` differ by design (ruling 2026-10-10)
const ownErrorPage = (svg: string): boolean => /plantuml-ts version [^<]*\[[^<]*\]<\/text>/.test(svg);
/** The version banner and `[From <file> (line N) ]` lines, wherever the page puts them (a Welcome-style page puts them
 *  after its 17 help lines, not first). */
const VERSION_OR_FILE_LINE = /^(?:PlantUML|plantuml-ts) version |^\[From /;
const errorLines = (svg: string): string[] => {
  const lines = [...svg.matchAll(TEXT_RE)].map((m) => m[1]!);
  const byPattern = lines.filter((l) => !VERSION_OR_FILE_LINE.test(l));
  return byPattern.length === lines.length - HEADER_AND_FILE_LINES ? byPattern : lines.slice(HEADER_AND_FILE_LINES);
};
/** The jar draws an error page and so do we, with the same body lines (ruling 2026-10-10: our own version string). */
const sameErrorPage = (ours: string, oracle: string): boolean =>
  ownErrorPage(ours) && (isJarCrashPage(oracle) || errorLines(ours).join('\n') === errorLines(oracle).join('\n'));
/** `ReportLog` crash page (`PSystemBuilder.java:275-281`): JVM facts and a Java stack trace, which no port can print. */
const isJarCrashPage = (svg: string): boolean => />An error has occurred[^<]*<\/text>/.test(svg);

const wanted = process.argv.slice(2);
const slugs = readdirSync(DIR)
  .filter((f) => f.endsWith('.puml'))
  .map((f) => f.slice(0, -'.puml'.length))
  .filter((s) => wanted.length === 0 || wanted.includes(s))
  .sort();

let zero = 0;
for (const slug of slugs) {
  const oracle = readFileSync(join(DIR, `${slug}.svg`), 'utf8');
  let ours: string;
  try {
    ours = renderSync(readFileSync(join(DIR, `${slug}.puml`), 'utf8'), options);
  } catch (e) {
    const message = (e instanceof Error ? e.message : String(e)).split('\n')[0]!;
    console.log(`${slug}\t-1\tthrew: ${message.slice(0, FIELD_LIMIT)}`);
    continue;
  }
  if (isJarErrorPage(oracle) && sameErrorPage(ours, oracle)) {
    zero++;
    console.log(`${slug}\t0\terror-pair`);
    continue;
  }
  const { diffs } = compareSvg(ours, oracle, 'deterministic');
  if (diffs.length === 0) zero++;
  const d = diffs[0];
  const first = d === undefined ? '' : `${d.path} | ${String(d.actual).slice(0, FIELD_LIMIT)} | ${String(d.expected).slice(0, FIELD_LIMIT)}`;
  console.log(`${slug}\t${diffs.length}\t${first}`);
}
console.log(`# ${zero}/${slugs.length} at 0`);
