// Count the rows this mission added, per cohort, against the issue that owns the cohort.
// Usage: node new-rows.mjs <base-ref> [survey-dir] [out-json] [cache-dir]
// A "new row" is a survey row absent from the same bucket's survey at <base-ref>.
import { execFileSync } from 'node:child_process';
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const TRACKED_DIR = 'tests/oracle/svg-conformance';
const SURVEY_FILE = /^parity-([a-z0-9]+)\.json$/;
const LEGACY_ACTIVITY = /^\s*\(\*(top)?\)|\(\*\)\s*$/m;
const JAR_TYPE = /data-diagram-type="([A-Z]+)"/;
const HEAD_BYTES = 4096;
const CONFORMANT = 'conformant';
const ERROR_PAGE_DIFF = 'error-page';
const MAX_BUFFER = 1 << 28;
// The owner of each cohort; "new" means no open issue covers it and T9 files one.
const OWNER = {
  'activity-legacy': '#123',
  activity3: '#121',
  class: 'new',
  dot: 'new',
  hcl: 'new',
  yaml: 'new',
  object: '#115',
  sequence: 'new',
  state: '#112',
  timing: '#127',
  'unknown-DESCRIPTION': '#113',
  'unknown-draws-where-jar-errors': 'needs-ruling',
  unknown: '#119',
};

const [base, dir = TRACKED_DIR, out, cacheDir = 'test-results/dot-cache'] = process.argv.slice(2);
if (base === undefined) throw new Error('usage: new-rows.mjs <base-ref> [survey-dir] [out-json] [cache-dir]');

function baseSlugs(file) {
  try {
    const text = execFileSync('git', ['show', `${base}:${TRACKED_DIR}/${file}`], {
      encoding: 'utf8',
      maxBuffer: MAX_BUFFER,
      stdio: ['ignore', 'pipe', 'ignore'],
    });
    return new Set(JSON.parse(text).fixtures.map((r) => r.slug));
  } catch {
    return new Set();
  }
}

function cohortOf(row) {
  const fixture = join(cacheDir, row.type, row.slug);
  if (row.type === 'activity') {
    return LEGACY_ACTIVITY.test(readFileSync(join(fixture, 'in.puml'), 'utf8')) ? 'activity-legacy' : 'activity3';
  }
  if (row.type !== 'unknown') return row.type;
  if (row.firstDiff === ERROR_PAGE_DIFF) return 'unknown-draws-where-jar-errors';
  const head = readFileSync(join(fixture, 'in.svg'), 'utf8').slice(0, HEAD_BYTES);
  return JAR_TYPE.exec(head)?.[1] === 'DESCRIPTION' ? 'unknown-DESCRIPTION' : 'unknown';
}

const table = new Map();
const rows = [];
for (const file of readdirSync(dir).filter((f) => SURVEY_FILE.test(f)).sort()) {
  const before = baseSlugs(file);
  for (const row of JSON.parse(readFileSync(join(dir, file), 'utf8')).fixtures) {
    if (before.has(row.slug)) continue;
    const cohort = cohortOf(row);
    const key = row.verdict === CONFORMANT && row.errorPage === true ? 'conformant (error page)' : row.verdict;
    const cell = table.get(cohort) ?? {};
    cell[key] = (cell[key] ?? 0) + 1;
    table.set(cohort, cell);
    rows.push({ bucket: row.type, slug: row.slug, cohort, verdict: row.verdict, firstDiff: row.firstDiff });
  }
}

const columns = ['conformant', 'conformant (error page)', 'structural-match', 'diverged', 'oracle-error', 'errored', 'timeout'];
console.log(`| cohort | owner | ${columns.join(' | ')} | total |`);
console.log(`|---|---|${columns.map(() => '---:').join('|')}|---:|`);
for (const [cohort, cell] of [...table].sort()) {
  const counts = columns.map((c) => cell[c] ?? 0);
  const total = counts.reduce((a, b) => a + b, 0);
  console.log(`| ${cohort} | ${OWNER[cohort] ?? 'UNOWNED'} | ${counts.join(' | ')} | ${total} |`);
}
console.log(`new rows: ${rows.length}`);
if (out !== undefined) writeFileSync(out, `${JSON.stringify(rows, null, 1)}\n`);
