// (Re)generate oracle/goldens/svg-activity-legacy/authored-baseline.json from a fresh measurement of
// tests/fixtures/activity-legacy/*.puml (laep T4), board's builder with named open rows. A nonzero row is a jar error page
// where we also error (ruling 2026-10-10), or one of OPEN_ROWS, each with the issue or divergence that ends it (D8);
// any other nonzero row throws. Prints each nonzero row. With --write, replaces the file.
// Usage: npx jiti plans/legacy-activity-engine-port/measurements/build-authored-baseline.mts <commit> [--write]
import { writeFileSync } from 'node:fs';

import { compareSvg, weightedScore } from '../../../tests/oracle/svg-conformance/compare.js';
import {
  listAuthoredActivityLegacySlugs,
  readAuthoredActivityLegacyFixture,
  renderFixtureActivityLegacy,
} from '../../../tests/oracle/svg-conformance/render-fixture-activity-legacy.js';

const OUT = 'oracle/goldens/svg-activity-legacy/authored-baseline.json';
const ERROR_REASON = 'jar error page and we error: conformant by the 2026-10-10 ruling, the page itself is not a target';
const ELK_REASON =
  '#158: `!pragma layout elk` draws through CucaDiagramFileMakerElk over the legacy model, not ported yet';
/** D8 ends of the authored rows the jar draws and we do not match (decision-journal rows 19, 20). */
const OPEN_ROWS: Readonly<Record<string, string>> = {
  'partition-link':
    '#157: a link to a partition needs the zaent point and ltail/lhead (ClusterDotString.java:149, SvekEdge.java:252-258)',
  'pragma-elk': ELK_REASON,
  'pragma-elk-if': ELK_REASON,
  'pragma-smetana':
    'library-forced: dot-engine instead of Smetana (CLAUDE.md ruling 2026-08-09, DIVERGENCES.md "!pragma layout smetana")',
};

const [commit, ...flags] = process.argv.slice(2);
if (commit === undefined) throw new Error('usage: build-authored-baseline.mts <commit> [--write]');
const today = new Date().toISOString().slice(0, 10);

/** The oracle's error: the crash line, else the last red line after its `[From ... (line N) ]` echo. */
function jarErrorOf(golden: string): { line: number | null; message: string } {
  const texts = [...golden.matchAll(/<text[^>]*>([^<]*)<\/text>/g)].map((m) => m[1]!.replaceAll('\u00A0', ' '));
  const crash = texts.find((t) => t.startsWith('An error has occurred : '));
  if (crash !== undefined) return { line: null, message: crash.slice('An error has occurred : '.length) };
  const from = /\(line (\d+)\)/.exec(golden);
  const red = [...golden.matchAll(/<text[^>]*fill="#F00"[^>]*>([^<]*)<\/text>/g)].map((m) => m[1]!);
  const message = (red[red.length - 1] ?? texts.find((t) => t.includes('Welcome')) ?? '').trim();
  return { line: from === null ? null : Number(from[1]), message: message.replaceAll('&lt;', '<') };
}

const fixtures = listAuthoredActivityLegacySlugs().map((slug) => {
  const { markup, golden } = readAuthoredActivityLegacyFixture(slug);
  const { diffs } = compareSvg(renderFixtureActivityLegacy(markup), golden!, 'deterministic');
  const jarErrored = !/^<svg[^>]*\sdata-diagram-type="/.test(golden!);
  const open = OPEN_ROWS[slug];
  if (jarErrored) console.log(`${slug} ${diffs.length} ${JSON.stringify(jarErrorOf(golden!))}`);
  else if (open !== undefined) console.log(`${slug} ${diffs.length} open: ${open}`);
  else if (diffs.length > 0) throw new Error(`${slug}: jar draws with ${diffs.length} diffs: name its mechanism first`);
  return {
    type: 'activity',
    slug,
    status: 'baseline',
    weightedScore: weightedScore(diffs),
    diffCount: diffs.length,
    ...(jarErrored ? { reason: ERROR_REASON, jarError: jarErrorOf(golden!) } : {}),
    ...(open !== undefined && !jarErrored ? { reason: open } : {}),
    measuredAt: today,
    measuredAgainstCommit: commit,
  };
});
console.log(`rows ${fixtures.length} zero ${fixtures.filter((f) => f.diffCount === 0).length}`);
if (flags.includes('--write')) writeFileSync(OUT, `${JSON.stringify({ fixtures }, null, 2)}\n`);
