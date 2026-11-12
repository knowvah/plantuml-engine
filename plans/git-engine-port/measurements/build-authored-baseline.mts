// (Re)generate oracle/goldens/svg-git/authored-baseline.json from a fresh measurement of
// tests/fixtures/git/*.puml (gip T4), laep's builder with named open rows. A nonzero row is a jar error page
// where we also error (ruling 2026-10-10), or a drawn row whose residue DIVERGENCES.md's git row table names
// (`| authored/<slug> |`, gip T3c); any other nonzero row throws. Every drawn row records the survey's own verdict
// (`diffVerdict`) and `maxDelta`, the ceiling git.diff-baseline.ratchet.test.ts holds. With --write, replaces the file.
// Usage: npx jiti plans/git-engine-port/measurements/build-authored-baseline.mts <commit> [--write]
import { readFileSync, writeFileSync } from 'node:fs';

import { diffVerdict } from '../../../scripts/svg-parity-survey.js';

import { compareSvg, weightedScore } from '../../../tests/oracle/svg-conformance/compare.js';
import {
  listAuthoredGitSlugs,
  readAuthoredGitFixture,
  renderFixtureGit,
} from '../../../tests/oracle/svg-conformance/render-fixture-git.js';

const OUT = 'oracle/goldens/svg-git/authored-baseline.json';
const ERROR_REASON = 'jar error page and we error: conformant by the 2026-10-10 ruling, the page itself is not a target';
const DIVERGENCES = readFileSync('DIVERGENCES.md', 'utf8');
/** The reason of a drawn row the jar draws and we do not match: its mechanisms, from the DIVERGENCES.md row. */
function openReasonOf(slug: string): string | undefined {
  const row = DIVERGENCES.split('\n').find((l) => l.startsWith(`| authored/${slug} |`));
  if (row === undefined) return undefined;
  const mechanisms = row.split('|')[3]!.trim();
  return `Smetana residue (${mechanisms}) named in DIVERGENCES.md, git row table; plans/git-engine-port/diagnosis/authored.md`;
}

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

const fixtures = listAuthoredGitSlugs().map((slug) => {
  const { markup, golden } = readAuthoredGitFixture(slug);
  const ours = renderFixtureGit(markup);
  const { diffs } = compareSvg(ours, golden!, 'deterministic');
  const jarErrored = !/^<svg[^>]*\sdata-diagram-type="/.test(golden!);
  const v = jarErrored ? undefined : diffVerdict(ours, golden!);
  const open = diffs.length > 0 ? openReasonOf(slug) : undefined;
  if (jarErrored) console.log(`${slug} ${diffs.length} ${JSON.stringify(jarErrorOf(golden!))}`);
  else if (open !== undefined) console.log(`${slug} ${diffs.length} open: ${open}`);
  else if (diffs.length > 0) throw new Error(`${slug}: jar draws with ${diffs.length} diffs: name its mechanism first`);
  return {
    type: 'git',
    slug,
    status: 'baseline',
    weightedScore: weightedScore(diffs),
    diffCount: diffs.length,
    ...(v === undefined ? {} : { verdict: v.verdict, maxDelta: v.maxDelta ?? 0 }),
    ...(jarErrored ? { reason: ERROR_REASON, jarError: jarErrorOf(golden!) } : {}),
    ...(open !== undefined && !jarErrored ? { reason: open } : {}),
    measuredAt: today,
    measuredAgainstCommit: commit,
  };
});
console.log(`rows ${fixtures.length} zero ${fixtures.filter((f) => f.diffCount === 0).length}`);
if (flags.includes('--write')) writeFileSync(OUT, `${JSON.stringify({ fixtures }, null, 2)}\n`);
