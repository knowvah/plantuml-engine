// Measure every authored cmf fixture against its committed oracle SVG, through the survey's render options.
// ftp copy of the cmf tool: the two banner regexes read `plantuml-engine`, not `plantuml-ts` (the #177 rename
// left every earlier copy unable to see our own error page, so error pairs printed as diffs).
// Usage: npx jiti plans/factories-tail-port/measurements/fixtures.mts [--dir <path>] [slug ...]
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

// `--dir <path>` first points the tool at another directory of <slug>.puml + <slug>.svg pairs (the planning oracles);
// an argument, not an env prefix, because the autonomous allowlist matches commands literally.
const DIR_FLAG = '--dir';
const argv = process.argv.slice(2);
const DIR = argv[0] === DIR_FLAG ? argv[1]! : 'tests/fixtures/factories';
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
const ownErrorPage = (svg: string): boolean => /plantuml-engine version [^<]*\[[^<]*\]<\/text>/.test(svg);
/** The version banner and `[From <file> (line N) ]` lines, wherever the page puts them (a Welcome-style page puts them
 *  after its 17 help lines, not first). */
const VERSION_OR_FILE_LINE = /^(?:PlantUML|plantuml-engine) version |^\[From /;
const errorLines = (svg: string): string[] => {
  // `ProtectedCommand` prints `(V<version>)` (ProtectedCommand.java:72); ours is the port's own version (ruling 2026-10-10).
  const lines = [...svg.matchAll(TEXT_RE)].map((m) => m[1]!.replace(/\(V[^)]*\)/, '(V)'));
  const byPattern = lines.filter((l) => !VERSION_OR_FILE_LINE.test(l));
  return byPattern.length === lines.length - HEADER_AND_FILE_LINES ? byPattern : lines.slice(HEADER_AND_FILE_LINES);
};
/** The jar draws an error page and so do we, with the same body lines (ruling 2026-10-10: our own version string). */
const sameErrorPage = (ours: string, oracle: string): boolean =>
  ownErrorPage(ours) &&
  (isJarCrashPage(oracle) ||
    isJarProtectedPage(oracle) ||
    isEmptyPage(oracle) ||
    errorLines(ours).join('\n') === errorLines(oracle).join('\n'));
/** A throw inside a command (`ProtectedCommand.java:72`): the JVM's own exception text, which no port can print (wrp D5). */
const isJarProtectedPage = (svg: string): boolean => /You should send a mail to plantuml@gmail\.com with this log/.test(svg);
/** The dispatcher's empty path: the same page, and the ruling does not hold the listing to the jar's (wrp D5). */
const isEmptyPage = (svg: string): boolean => />Empty description/.test(svg);
/** `ReportLog` crash page (`PSystemBuilder.java:275-281`): JVM facts and a Java stack trace, which no port can print. */
const isJarCrashPage = (svg: string): boolean => />An error has occurred[^<]*<\/text>/.test(svg);

const wanted = argv[0] === DIR_FLAG ? argv.slice(2) : argv;
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
