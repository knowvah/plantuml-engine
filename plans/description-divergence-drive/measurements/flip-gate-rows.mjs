// Turn a misroute or refusal pin into a clean row once a fix makes it measure clean.
// Usage: node plans/description-divergence-drive/measurements/flip-gate-rows.mjs <yyyy-mm-dd> <unknown-slug> [...]
// Writes both gate files and marks the row `fixed` in the ogc-T4c ledger. The routing and refusal gates re-measure
// every row, so a flip this tool makes on a row that still disagrees fails them: run them after it.
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';

const DIR = 'oracle/goldens/svg-conformance';
const ROUTING = `${DIR}/routing-baseline.json`;
const REFUSAL = `${DIR}/refusal-baseline.json`;
const LEDGER = 'tests/oracle/svg-conformance/unknown-ledger/ogc-T4c.json';
const TREE = 'dot-cache';
const TYPE = 'unknown';
const JAR_DESCRIPTION = 'DESCRIPTION';
const ENGINE = 'description';
const JSON_INDENT = 2;
const SHORT_SHA = 9;

const [date, ...slugs] = process.argv.slice(2);
if (date === undefined || slugs.length === 0) throw new Error('usage: flip-gate-rows.mjs <yyyy-mm-dd> <slug> [...]');
const commit = execFileSync('git', ['rev-parse', `--short=${SHORT_SHA}`, 'HEAD'], { encoding: 'utf8' }).trim();
const wanted = new Set(slugs);
const readJson = (path) => JSON.parse(readFileSync(path, 'utf8'));
const writeJson = (path, value) => writeFileSync(path, `${JSON.stringify(value, null, JSON_INDENT)}\n`);
const stamp = { measuredAt: date, measuredAgainstCommit: commit };
const isWanted = (r) => r.tree === TREE && r.type === TYPE && wanted.has(r.slug);

const routing = readJson(ROUTING);
let routed = 0;
for (const r of routing.fixtures.filter(isWanted)) {
  if (r.jarType !== JAR_DESCRIPTION) throw new Error(`${r.slug}: jar type ${r.jarType}, not ${JAR_DESCRIPTION}`);
  delete r.reason;
  Object.assign(r, { ourType: JAR_DESCRIPTION, status: 'agree', ...stamp });
  routed++;
}
writeJson(ROUTING, routing);

const refusal = readJson(REFUSAL);
let refused = 0;
for (const r of refusal.fixtures.filter(isWanted)) {
  delete r.reason;
  Object.assign(r, { weErrored: false, engine: ENGINE, status: 'ok', ...stamp });
  refused++;
}
writeJson(REFUSAL, refusal);

const ledger = readJson(LEDGER);
let marked = 0;
for (const row of ledger.rows.filter((x) => wanted.has(x.slug))) {
  row.disposition = 'fixed';
  marked++;
}
writeJson(LEDGER, ledger);
console.log(`routing ${routed}, refusal ${refused}, ledger ${marked}, of ${wanted.size} slugs`);
