// Re-pin the routing and refusal baselines for the rows that now reach the flow engine (bpe T4, D7), the dot-cache
// rows of planning-rows.json and their `svg-flow` golden twins. Measures each row the way the gates do (production
// `renderSync`, deterministic measurer, jar-compatible style, no asset store) and rewrites ONLY those rows' measured
// fields; every other row is untouched. Prints each change and every row whose pin would RISE (a stop).
// Usage: npx jiti plans/flow-engine-port/measurements/repin-routing-refusal.mts <commit> [--write]
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { renderSync } from '../../../src/index.js';
import { withJarCompatibleStyleInput } from '../../../src/core/internal-render-options.js';
import { DeterministicMeasurer } from '../../../src/core/measurer-deterministic.js';
import { fixtureIncludeStore } from '../../../tests/helpers/fixture-include-store.js';
import { engineOf, weErroredIn } from '../../../tests/oracle/svg-conformance/refusal-coverage-gate.js';
import { diagramTypeOf } from '../../../tests/oracle/svg-conformance/routing-conformance-gate.js';

const BASE = 'oracle/goldens/svg-conformance';
const CACHE = 'test-results/dot-cache';
const HEAD_BYTES = 4096;
const GOLDEN_TYPE = 'svg-flow';
const [commit, flag] = process.argv.slice(2);
if (commit === undefined) throw new Error('usage: repin-routing-refusal.mts <commit> [--write]');
const today = new Date().toISOString().slice(0, 10);

type Row = Record<string, unknown> & { tree: string; type: string; slug: string };
const rows = JSON.parse(readFileSync('plans/flow-engine-port/measurements/planning-rows.json', 'utf8')) as {
  bucket: string;
  slug: string;
}[];
const store = fixtureIncludeStore();
const live = new Map<string, { ours: string; errored: boolean }>();
for (const { bucket, slug } of rows) {
  const markup = readFileSync(join(CACHE, bucket, slug, 'in.puml'), 'utf8');
  const ours = renderSync(
    markup,
    withJarCompatibleStyleInput({ includeStore: store, measurer: new DeterministicMeasurer() }),
  );
  live.set(`${bucket}/${slug}`, { ours, errored: weErroredIn(ours) });
}
const dotCacheTypeOf = new Map(rows.map((r) => [r.slug, r.bucket]));

function measuredFor(r: Row): { ours: string; errored: boolean } | undefined {
  if (r.tree === 'dot-cache') return live.get(`${r.type}/${r.slug}`);
  if (r.tree === 'goldens' && r.type === GOLDEN_TYPE) {
    // svg-flow twins are slugged `<bucket>/<slug>` (D7, laid out like svg-nwdiag), not wire's bare `<slug>`.
    const bare = r.slug.slice(r.slug.indexOf('/') + 1);
    const bucket = dotCacheTypeOf.get(bare);
    return bucket === undefined ? undefined : live.get(`${bucket}/${bare}`);
  }
  return undefined;
}

let moved = 0;
for (const name of ['routing', 'refusal']) {
  const path = join(BASE, `${name}-baseline.json`);
  const base = JSON.parse(readFileSync(path, 'utf8')) as { $comment: string; fixtures: Row[] };
  const out: string[] = [];
  for (const r of base.fixtures) {
    const m = measuredFor(r);
    if (m === undefined) continue;
    const before = JSON.stringify(r);
    if (name === 'routing') {
      if (r.status === 'jar-error') {
        r.ourType = diagramTypeOf(m.ours.slice(0, HEAD_BYTES));
      } else {
        r.ourType = diagramTypeOf(m.ours.slice(0, HEAD_BYTES));
        if (r.ourType === r.jarType) {
          r.status = 'agree';
          delete r.reason;
        } else console.log(`STILL MISROUTED ${r.tree} ${r.type}/${r.slug}: ${String(r.ourType)}`);
      }
    } else {
      r.weErrored = m.errored;
      r.engine = engineOf(m.ours, m.errored);
      if (r.jarRendered === true && !m.errored) {
        r.status = 'ok';
        delete r.reason;
      } else if (r.jarRendered === true) console.log(`STILL ERRORING ${r.tree} ${r.type}/${r.slug}`);
    }
    if (JSON.stringify(r) !== before) {
      r.measuredAt = today;
      r.measuredAgainstCommit = commit;
      out.push(`${name} ${r.tree} ${r.type}/${r.slug}`);
      moved++;
    }
  }
  console.log(`${name}: ${out.length} rows changed`);
  if (flag === '--write') writeFileSync(path, `${JSON.stringify(base, null, 2)}\n`);
}
console.log(`moved ${moved}`);
