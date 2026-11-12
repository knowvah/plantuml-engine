// (Re)generate oracle/goldens/svg-flow/authored-baseline.json from a fresh measurement of
// tests/fixtures/flow/*.puml (bpe T4), laep.s builder with named open rows. A nonzero row is a jar error page
// where we also error (ruling 2026-10-10), or one of OPEN_ROWS, each with the issue or divergence that ends it (D6);
// any other nonzero row throws. Prints each nonzero row. With --write, replaces the file.
// Usage: npx jiti plans/flow-engine-port/measurements/build-authored-baseline.mts <commit> [--write]
import { writeFileSync } from 'node:fs';

import { compareSvg, weightedScore } from '../../../tests/oracle/svg-conformance/compare.js';
import {
  countFlowBoxes,
  listAuthoredFlowSlugs,
  readAuthoredFlowFixture,
  readAuthoredFlowVariants,
  renderFixtureFlow,
} from '../../../tests/oracle/svg-conformance/render-fixture-flow.js';
import { isMultisetEqual } from '../../../tests/oracle/svg-conformance/svg-multiset.js';

const OUT = 'oracle/goldens/svg-flow/authored-baseline.json';
const ERROR_REASON = 'jar error page and we error: conformant by the 2026-10-10 ruling, the page itself is not a target';
/** D6 ends of the authored rows the jar draws and we do not match: one entry per row, each naming its issue or forcing
 *  library. Empty at planning; T3b/T4 add a row only with its journal citation. */
const OPEN_ROWS: Readonly<Record<string, string>> = {};
/** flp T4: a multi-box row (D6, box count from the source) whose render is multiset-equal to its oracle or a recorded
 *  layout differs only in the jar's identity-hash box order (D4); it ends on the #174 ruling (journal rows 13-14). */
const D4_REASON =
  'jar draws its boxes in identity-hash order (flp D4); multiset-equal to the oracle or a recorded layout, ruling #174';

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

const fixtures = listAuthoredFlowSlugs().map((slug) => {
  const { markup, golden } = readAuthoredFlowFixture(slug);
  const { diffs } = compareSvg(renderFixtureFlow(markup), golden!, 'deterministic');
  const jarErrored = !/^<svg[^>]*\sdata-diagram-type="/.test(golden!);
  const ours = renderFixtureFlow(markup);
  const orderOnly =
    diffs.length > 0 &&
    countFlowBoxes(markup) >= 2 &&
    readAuthoredFlowVariants(slug).some((variant) => isMultisetEqual(ours, variant));
  const open = OPEN_ROWS[slug] ?? (orderOnly ? D4_REASON : undefined);
  if (jarErrored) console.log(`${slug} ${diffs.length} ${JSON.stringify(jarErrorOf(golden!))}`);
  else if (open !== undefined) console.log(`${slug} ${diffs.length} open: ${open}`);
  else if (diffs.length > 0) throw new Error(`${slug}: jar draws with ${diffs.length} diffs: name its mechanism first`);
  return {
    type: 'flow',
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
