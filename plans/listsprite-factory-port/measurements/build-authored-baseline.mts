/**
 * lsp T3 (a copy of the cmf T4 tool; ListSprite category added, unchanged rows kept verbatim): (re)generate oracle/goldens/svg-factories/authored-baseline.json from a fresh
 * measurement of every tests/fixtures/factories/*.puml (measureAuthoredFactories, the
 * ratchet's own path). Mirrors
 * plans/utility-factories-port/measurements/T3-cov/build-authored-baseline.mts. Mechanisms
 * live in the tables below; a row whose measured score is nonzero and has no reason here
 * makes the tool fail.
 *
 *   npx jiti plans/listsprite-factory-port/measurements/build-authored-baseline.mts <commit> [--write]
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

/** Mechanisms for the nonzero rows that are not a jar error page or KaTeX residual. */
const REASONS: Record<string, string> = {
  'cov-latex-syntax': 'KaTeX parse error on \\frac{a (DIVERGENCES.md cmf section)',
  'cov-help-fonts': 'host font list, ruling #169',
  'cov-help-theme-cmd': 'shared !theme error-page source listing (.agent-notes/cmf-T3b.md)',
};

const CATEGORY: Record<string, string> = {
  creole: 'CreoleFactory (PSystemBuilder.java:174)',
  def: 'DefinitionFactory (PSystemBuilder.java:169)',
  embedded: 'embedded note in a diagram',
  help: 'HelpFactory (PSystemBuilder.java:188)',
  latex: 'LatexFactory (PSystemBuilder.java:173)',
  math: 'MathFactory (PSystemBuilder.java:172)',
  note: 'note in a diagram',
  sprites: 'ListSpriteDiagramFactory (PSystemBuilder.java:170)',
};

/** The jar's error page names its line `[From <desc> (line N) ]` and draws the message in #F00. */
function jarErrorOf(golden: string): { line: number | null; message: string } | undefined {
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
  if (jarError !== undefined) return ERROR_PAGE;
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
