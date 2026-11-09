// Re-pins the routing- and refusal-baseline twins of the legacy activity rows (laep T3a step 4).
// Usage: npx jiti plans/legacy-activity-engine-port/measurements/repin-twins.mts <commit> [--write]
// Each row of measurements/planning-rows.json is rendered exactly as the two gates render it
// (`renderSync` + fixture include store + DeterministicMeasurer + jar-compatible style input), and
// its pins are rewritten from that measurement: routing `agree` when our root type equals the jar's,
// refusal `ok` when we drew a diagram. A row still misrouted keeps its status and gets `reason`.
// Without --write it prints the moves only. The gates then verify the claim: a wrong pin fails them.
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { renderSync } from '../../../src/index.js';
import { DeterministicMeasurer } from '../../../src/core/measurer-deterministic.js';
import { withJarCompatibleStyleInput } from '../../../src/core/internal-render-options.js';
import { fixtureIncludeStore } from '../../../tests/helpers/fixture-include-store.js';
import { diagramTypeOf } from '../../../tests/oracle/svg-conformance/routing-conformance-gate.js';
import { engineOf, weErroredIn } from '../../../tests/oracle/svg-conformance/refusal-coverage-gate.js';

const ROUTING = 'oracle/goldens/svg-conformance/routing-baseline.json';
const REFUSAL = 'oracle/goldens/svg-conformance/refusal-baseline.json';
const CACHE = 'test-results/dot-cache';
const ROWS = 'plans/legacy-activity-engine-port/measurements/planning-rows.json';
const STILL_OPEN =
  'legacy activity (ActivityDiagramFactory, PSystemBuilder.java:137) is ported (laep), but this row ' +
  'still renders an error page: its mechanism is named in plans/legacy-activity-engine-port/decision-journal.md.';

interface Row {
  readonly bucket: string;
  readonly slug: string;
}
type Pin = Record<string, unknown> & { tree: string; type: string; slug: string; status: string };
interface Manifest {
  fixtures: Pin[];
}

const [commit, flag] = process.argv.slice(2);
if (commit === undefined) throw new Error('usage: repin-twins.mts <commit> [--write]');
const write = flag === '--write';
const today = new Date().toISOString().slice(0, 10);

const raw = JSON.parse(readFileSync(ROWS, 'utf8')) as { rows?: Row[] } | Row[];
const rows: Row[] = Array.isArray(raw) ? raw : (raw.rows ?? []);
const store = fixtureIncludeStore();
const measured = new Map<string, string>();
for (const row of rows) {
  const markup = readFileSync(join(CACHE, row.bucket, row.slug, 'in.puml'), 'utf8');
  const svg = renderSync(markup, withJarCompatibleStyleInput({ includeStore: store, measurer: new DeterministicMeasurer() }));
  measured.set(`${row.bucket}/${row.slug}`, svg);
}

function rewrite(file: string, repin: (pin: Pin, svg: string) => Pin): number {
  const data = JSON.parse(readFileSync(file, 'utf8')) as Manifest;
  let moved = 0;
  data.fixtures = data.fixtures.map((pin) => {
    const svg = pin.tree === 'dot-cache' ? measured.get(`${pin.type}/${pin.slug}`) : undefined;
    if (svg === undefined) return pin;
    const next = repin(pin, svg);
    if (next.status === pin.status && JSON.stringify(next) === JSON.stringify(pin)) return pin;
    moved++;
    console.log(`${file.split('/').pop()} ${pin.type}/${pin.slug}: ${pin.status} -> ${next.status}`);
    return { ...next, measuredAt: today, measuredAgainstCommit: commit };
  });
  if (write) writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`);
  return moved;
}

function withReason(pin: Pin, open: boolean): Pin {
  const rest: Pin = { ...pin };
  delete rest.reason;
  return open ? { ...rest, reason: STILL_OPEN } : rest;
}

const routed = rewrite(ROUTING, (pin, svg) => {
  const ourType = diagramTypeOf(svg.slice(0, 4096));
  const agree = ourType === pin.jarType;
  if (agree === (pin.status === 'agree') && ourType === pin.ourType) return pin;
  return withReason({ ...pin, ourType, status: agree ? 'agree' : 'known-misroute' }, !agree);
});
const refused = rewrite(REFUSAL, (pin, svg) => {
  const weErrored = weErroredIn(svg);
  const engine = engineOf(svg, weErrored);
  const status = pin.jarRendered === true && weErrored ? 'known-gap' : 'ok';
  if (weErrored === pin.weErrored && engine === pin.engine) return pin;
  return withReason({ ...pin, weErrored, engine, status }, status === 'known-gap');
});
console.log(`routing moved ${routed}, refusal moved ${refused}${write ? ' (written)' : ' (dry run)'}`);
