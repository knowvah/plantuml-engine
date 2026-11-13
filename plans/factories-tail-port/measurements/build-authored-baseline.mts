/**
 * ftp T3 (a copy of lsp's tool: Welcome/ListFonts/Crash/Path categories and reasons added, and `jarErrorOf` reads
 * the jar's ReportLog crash page as `{ line: null, message }`, the bpm precedent; no banner regex in it).
 * lsp T3 (a copy of the cmf T4 tool; ListSprite category added, unchanged rows kept verbatim): (re)generate oracle/goldens/svg-factories/authored-baseline.json from a fresh
 * measurement of every tests/fixtures/factories/*.puml (measureAuthoredFactories, the
 * ratchet's own path). Mirrors
 * plans/utility-factories-port/measurements/T3-cov/build-authored-baseline.mts. Mechanisms
 * live in the tables below; a row whose measured score is nonzero and has no reason here
 * makes the tool fail.
 *
 *   npx jiti plans/factories-tail-port/measurements/build-authored-baseline.mts <commit> [--write]
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  AUTHORED_FACTORIES_ROOT,
  listAuthoredFactoriesSlugs,
  measureAuthoredFactories,
  readAuthoredFactoriesFixture,
} from '../../../tests/oracle/svg-conformance/render-fixture-factories.js';

const [commit, flag] = process.argv.slice(2);
if (commit === undefined) throw new Error('usage: build-authored-baseline.mts <commit> [--write]');
const OUT = join(AUTHORED_FACTORIES_ROOT, '../../../oracle/goldens/svg-factories/authored-baseline.json');
const MEASURED_AT = '2026-11-12';

const KATEX = 'KaTeX glyph group (DIVERGENCES.md cmf section)';
const LABEL =
  'our own version string, kept by ruling (src/core/error/PSystemError.ts fullDescription() vs ' +
  'PSystemError.java:151 Version.fullDescription()) + the source label "[From string" vs the ' +
  'jar\'s "[From <file>.puml" (PSystemError.java:239 lineLocation.getDescription(): oracle-render.sh ' +
  'hands the jar a file, renderSync reads a string); the page width follows the longer jar lines';
const ERROR_PAGE = `error-page: jar errors and we error, same message, same line (2026-10-10 rule: conformant). Residual = ${LABEL}.`;

/** ftp D4: ruling #169 -- a browser-safe library cannot enumerate the host's fonts. */
const LISTFONTS_169 =
  'host font list: DIVERGENCES.md "`help font` lists no fonts" (ruling #169 covers listfonts, ftp D4); the page is ' +
  "the two header lines, the jar lists the oracle host's families";
/** The jar's fatal page needs `PSystemBuilder`'s catch, reverted per D7 (decision-journal row 7). */
const FATAL_CRASH =
  "error-page: jar errors and we error (2026-10-10 rule: conformant). The jar's page is PSystemBuilder's catch " +
  '("Fatal crash error, ... with: java.lang.IllegalStateException: This is a normal crash when FINALIZING", ' +
  'PSystemBuilder.java:274-281, over the whole block); ours is errorSvg, because the port of that catch (ftp T1d) is ' +
  'reverted per D7 until the class and state engines run commands under ProtectedCommand (ftp follow-on).';
/** A throw while drawing: the jar's ReportLog page prints JVM facts no port can print. */
const CRASH_REPORT =
  'error-page: jar errors and we error (2026-10-10 rule: conformant). The jar draws its ReportLog crash page ' +
  '(CrashReportHandler: JVM facts, a random quote, a stack trace), which stays unported: the crash report is our ' +
  'error page (src/core/UgDiagram.ts:22-24).';

/** Mechanisms for the nonzero rows that are not a jar error page or KaTeX residual. */
const REASONS: Record<string, string> = {
  'cov-listfont-bare': LISTFONTS_169,
  'cov-listfont-creole': LISTFONTS_169,
  'cov-listfont-text': LISTFONTS_169,
  'cov-listfonts-bare': LISTFONTS_169,
  'cov-listfonts-text': LISTFONTS_169,
  'cov-listfonts-upper': LISTFONTS_169,
  'cov-crash-finalizing': FATAL_CRASH,
  'cov-crash-drawing-then-finalizing': FATAL_CRASH,
  'cov-latex-syntax': 'KaTeX parse error on \\frac{a (DIVERGENCES.md cmf section)',
  'cov-help-fonts': 'host font list, ruling #169',
  'cov-help-theme-cmd': 'shared !theme error-page source listing (.agent-notes/cmf-T3b.md)',
};

const CATEGORY: Record<string, string> = {
  crash: 'CrashDiagramFactory (PSystemBuilder.java:200)',
  creole: 'CreoleFactory (PSystemBuilder.java:174)',
  def: 'DefinitionFactory (PSystemBuilder.java:169)',
  embedded: 'embedded note in a diagram',
  help: 'HelpFactory (PSystemBuilder.java:188)',
  latex: 'LatexFactory (PSystemBuilder.java:173)',
  listfont: 'PSystemListFontsFactory (PSystemBuilder.java:148)',
  listfonts: 'PSystemListFontsFactory (PSystemBuilder.java:148)',
  math: 'MathFactory (PSystemBuilder.java:172)',
  note: 'note in a diagram',
  path: 'PSystemPathFactory (PSystemBuilder.java:179, INSECURE only; unregistered under LEGACY, #178)',
  sprites: 'ListSpriteDiagramFactory (PSystemBuilder.java:170)',
  welcome: 'PSystemWelcomeFactory (PSystemBuilder.java:133)',
};

/** The ReportLog crash page's first line (`CrashReportHandler`): `An error has occurred : <throwable>`. */
const CRASH_PAGE = />An error has occurred : ([^<]*)<\/text>/;

/** The jar's error page names its line `[From <desc> (line N) ]` and draws the message in #F00; its ReportLog crash
 *  page names no line (ftp T3: `{ line: null, message: <throwable> }`, the bpm family's shape). */
function jarErrorOf(golden: string): { line: number | null; message: string } | undefined {
  const crash = CRASH_PAGE.exec(golden);
  if (crash !== null) return { line: null, message: crash[1]!.replaceAll('&quot;', '"').trim() };
  const from = /\[From [^<]*? \(line (\d+)\) \]/.exec(golden);
  const msg = /<text[^>]*fill="#F00"[^>]*>([^<]*)<\/text>/.exec(golden);
  if (from === null || msg === null) return undefined;
  return { line: Number(from[1]), message: msg[1]!.replaceAll('&lt;', '<').replaceAll('&gt;', '>').trim() };
}

/** `<category>: \`<first body line>\``, from the fixture's own source. */
function topicOf(slug: string, markup: string): string {
  const body = markup.split('\n').find((l, i) => i > 0 && l.trim() !== '' && !l.startsWith('@end')) ?? '(empty body)';
  return `${CATEGORY[slug.split('-')[1]!] ?? slug}: \`${body.trim()}\``;
}

function reasonOf(slug: string, jarError: unknown): string {
  const named = REASONS[slug];
  if (named !== undefined) return named;
  if (jarError !== undefined) return (jarError as { line: number | null }).line === null ? CRASH_REPORT : ERROR_PAGE;
  if (/^cov-(math|latex)-/.test(slug)) return KATEX;
  throw new Error(`${slug}: nonzero score with no mechanism`);
}

/** lsp T3: a row whose score and diff count did not move keeps its committed entry, stamp included. */
interface Committed {
  slug: string;
  weightedScore: number;
  diffCount: number;
}
const committed = new Map(
  (JSON.parse(safeRead(OUT) ?? '{"fixtures":[]}') as { fixtures: Committed[] }).fixtures.map((f) => [f.slug, f]),
);

const fixtures = listAuthoredFactoriesSlugs().map((slug) => {
  const m = measureAuthoredFactories(slug);
  if (m.errored) throw new Error(`${slug}: ${m.reason}`);
  const kept = committed.get(slug);
  if (kept !== undefined && kept.weightedScore === m.weightedScore && kept.diffCount === m.diffCount) return kept;
  const { markup, golden } = readAuthoredFactoriesFixture(slug);
  const jarError = jarErrorOf(golden ?? '');
  return {
    type: 'factories',
    slug,
    topic: topicOf(slug, markup),
    status: 'baseline',
    weightedScore: m.weightedScore,
    diffCount: m.diffCount,
    ...(m.weightedScore === 0 ? {} : { reason: reasonOf(slug, jarError) }),
    ...(jarError === undefined ? {} : { jarError }),
    measuredAt: MEASURED_AT,
    measuredAgainstCommit: commit,
  };
});
const text = JSON.stringify({ fixtures }, null, 2) + '\n';
for (const f of fixtures as { slug: string; weightedScore: number; diffCount: number; jarError?: unknown }[])
  console.log(`${f.slug}\t${f.weightedScore}\t${f.diffCount}\t${f.jarError === undefined ? '' : 'jarError'}`);
if (flag === '--write') writeFileSync(OUT, text);
else console.log(text === safeRead(OUT) ? 'unchanged' : 'would change (pass --write)');

function safeRead(p: string): string | undefined {
  try {
    return readFileSync(p, 'utf8');
  } catch {
    return undefined;
  }
}
