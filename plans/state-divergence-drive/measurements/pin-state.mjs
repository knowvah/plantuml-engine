// Pin every state row the census reads at zero and the ratchet lacks.
// Usage: node plans/state-divergence-drive/measurements/pin-state.mjs <yyyy-mm-dd> [--dry]
// Refuses a row whose survey dotEqual is false: the ratchet's AC3 fails on it.
// Also clones each new golden's `dot-cache`/`state` twin row into
// `routing-baseline.json` and `refusal-baseline.json` as `tree: goldens, type: svg-state`:
// both gates walk every `oracle/goldens/svg-*` dir and demand a row
// (`routing-conformance.test.ts:222`), as `pin-goldens.mts` step 5 did for sequence.
import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join } from 'node:path';

const GOLDENS = 'oracle/goldens/svg-state';
const CACHE = 'test-results/dot-cache/state';
const SURVEY_DIR = 'tests/oracle/svg-conformance';
const ZERO_BUCKET = '0';
const JSON_INDENT = 2;
const CONFORMANCE = 'oracle/goldens/svg-conformance';
const GATE_FILES = ['routing-baseline.json', 'refusal-baseline.json'];
const CACHE_TREE = 'dot-cache';
const CACHE_TYPE = 'state';
const GOLDEN_TREE = 'goldens';
const GOLDEN_TYPE = 'svg-state';

const [addedAt, flag] = process.argv.slice(2);
if (addedAt === undefined) throw new Error('usage: pin-state.mjs <yyyy-mm-dd> [--dry]');
const dry = flag === '--dry';

const readJson = (path) => JSON.parse(readFileSync(path, 'utf8'));
const manifestPath = join(GOLDENS, 'ratchet.json');
const manifest = readJson(manifestPath);
const pinned = new Set(manifest.fixtures.map((f) => f.slug));
const survey = new Map(readJson(join(SURVEY_DIR, 'parity-state.json')).fixtures.map((r) => [r.slug, r]));
const zero = readJson(join(SURVEY_DIR, 'census-state.json')).fixtures.filter((r) => r.bucket === ZERO_BUCKET);

let added = 0;
const refused = [];
for (const { slug } of zero) {
  if (pinned.has(slug)) continue;
  if (survey.get(slug)?.dotEqual !== true) {
    refused.push(slug);
    continue;
  }
  added++;
  if (dry) continue;
  const dir = join(GOLDENS, slug);
  mkdirSync(dir, { recursive: true });
  copyFileSync(join(CACHE, slug, 'in.puml'), join(dir, 'in.puml'));
  copyFileSync(join(CACHE, slug, 'in.svg'), join(dir, 'golden.svg'));
  manifest.fixtures.push({ slug, addedAt, source: 'dot-cache' });
}
if (!dry) writeFileSync(manifestPath, `${JSON.stringify(manifest, null, JSON_INDENT)}\n`);
// Every ratchet slug, not only this run's: a golden pinned without its gate rows is repaired here.
const cloned = dry ? 0 : cloneGateRows(manifest.fixtures.map((f) => f.slug), addedAt);
console.log(`pinned ${pinned.size}, added ${added}, refused ${refused.length} ${refused.join(' ')}; gate rows cloned ${cloned}`);

/** Appends a `goldens`/`svg-state` clone of each slug's `dot-cache`/`state` row to both gate files. */
function cloneGateRows(slugs, date) {
  if (slugs.length === 0) return 0;
  const commit = execFileSync('git', ['rev-parse', '--short=9', 'HEAD'], { encoding: 'utf8' }).trim();
  let count = 0;
  for (const file of GATE_FILES) {
    const path = join(CONFORMANCE, file);
    const gate = readJson(path);
    const twins = new Map(
      gate.fixtures.filter((r) => r.tree === CACHE_TREE && r.type === CACHE_TYPE).map((r) => [r.slug, r]),
    );
    const have = new Set(
      gate.fixtures.filter((r) => r.tree === GOLDEN_TREE && r.type === GOLDEN_TYPE).map((r) => r.slug),
    );
    let appended = 0;
    for (const slug of slugs) {
      if (have.has(slug)) continue;
      const twin = twins.get(slug);
      if (twin === undefined) throw new Error(`${file}: no dot-cache/state row for ${slug}`);
      gate.fixtures.push({ ...twin, tree: GOLDEN_TREE, type: GOLDEN_TYPE, measuredAt: date, measuredAgainstCommit: commit });
      appended++;
    }
    gate.$comment =
      `${gate.$comment} Re-pinned ${date} at ${commit} by state-divergence-drive / pin-state.mjs, ADDITIVE ONLY ` +
      `(${appended} "${GOLDEN_TYPE}" golden rows appended, clones of their byte-identical dot-cache twins).`;
    writeFileSync(path, `${JSON.stringify(gate, null, JSON_INDENT)}\n`);
    count += appended;
  }
  return count;
}
