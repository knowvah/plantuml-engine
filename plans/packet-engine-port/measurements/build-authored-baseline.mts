// (Re)generate oracle/goldens/svg-packet/authored-baseline.json from a fresh measurement of tests/fixtures/packet/*.puml.
// Prints each nonzero row. With --write, replaces the file. Usage: npx jiti <this> <commit> [--write]
import { writeFileSync } from 'node:fs';

import { DeterministicMeasurer } from '../../../src/core/measurer-deterministic.js';
import { compareSvg, weightedScore } from '../../../tests/oracle/svg-conformance/compare.js';
import {
  authoredPacketIncludeStore,
  listAuthoredPacketSlugs,
  readAuthoredPacketFixture,
  renderFixturePacket,
} from '../../../tests/oracle/svg-conformance/render-fixture-packet.js';

const OUT = 'oracle/goldens/svg-packet/authored-baseline.json';
const REASON = 'jar error page and we error: conformant by the 2026-10-10 ruling, the page itself is not a target';
const TASK_OF: readonly (readonly [RegExp, string])[] = [
  [/^vega-/, 'T3b upstream vega/packet'],
  [/^cov-(chrome|embed|scale)/, 'T3c chrome and embedding'],
  [/^cov-(style|skin|theme|mono|hand|back)/, 'T3c style and skin'],
  [/^cov-(label|creole|abbr|emoji|sprite)/, 'T3c labels'],
];

const [commit, ...flags] = process.argv.slice(2);
if (commit === undefined) throw new Error('usage: build-authored-baseline.mts <commit> [--write]');
const today = new Date().toISOString().slice(0, 10);

const topicOf = (slug: string): string => {
  const task = TASK_OF.find(([re]) => re.test(slug))?.[1] ?? 'T3c edges and errors';
  return `${task}: ${slug.replace(/^(cov|vega)-/, '')}`;
};

/** The oracle's error: the crash line, else the text after its `[From ... (line N) ]` echo. */
function jarErrorOf(golden: string): { line: number | null; message: string } {
  const texts = [...golden.matchAll(/<text[^>]*>([^<]*)<\/text>/g)].map((m) => m[1]!.replaceAll(' ', ' '));
  const crash = texts.find((t) => t.startsWith('An error has occurred : '));
  if (crash !== undefined) return { line: null, message: crash.slice('An error has occurred : '.length) };
  const from = /\(line (\d+)\)/.exec(golden);
  const red = [...golden.matchAll(/<text[^>]*fill="#F00"[^>]*>([^<]*)<\/text>/g)].map((m) => m[1]!);
  const message = (red[red.length - 1] ?? texts.find((t) => t.includes('Welcome')) ?? '').trim();
  return { line: from === null ? null : Number(from[1]), message: message.replaceAll('&lt;', '<') };
}

const fixtures = listAuthoredPacketSlugs().map((slug) => {
  const { markup, golden } = readAuthoredPacketFixture(slug);
  const ours = renderFixturePacket(markup, new DeterministicMeasurer(), { includeStore: authoredPacketIncludeStore() });
  const { diffs } = compareSvg(ours, golden!, 'deterministic');
  const jarErrored = !/^<svg[^>]*\sdata-diagram-type="/.test(golden!);
  if (jarErrored) console.log(`${slug} ${diffs.length} ${JSON.stringify(jarErrorOf(golden!))}`);
  else if (diffs.length > 0) throw new Error(`${slug}: jar draws with ${diffs.length} diffs: name its mechanism first`);
  return {
    type: 'packet',
    slug,
    topic: topicOf(slug),
    status: 'baseline',
    weightedScore: weightedScore(diffs),
    diffCount: diffs.length,
    ...(jarErrored ? { reason: REASON, jarError: jarErrorOf(golden!) } : {}),
    measuredAt: today,
    measuredAgainstCommit: commit,
  };
});
console.log(`rows ${fixtures.length} zero ${fixtures.filter((f) => f.diffCount === 0).length}`);
if (flags.includes('--write')) writeFileSync(OUT, `${JSON.stringify({ fixtures }, null, 2)}\n`);
