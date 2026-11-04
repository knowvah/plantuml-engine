/** ogc-T6: seed the four activity baselines with every dot-cache/activity fixture they do not list (D6).
 *  Usage: npx tsx plans/oracle-gap-capture/measurements/seed-activity.mts [--write]
 *  A jar error page seeds `jar-error`; everything else seeds `error` with the ledger's reason when one
 *  exists, so `scripts/repin-activity-baselines.ts --write` can promote what renders (add4 T0b's route).
 *  Rows are inserted in slug order; existing rows are never touched. */
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { isJarErrorPage, readHead } from '../../../scripts/pin-corpus-tree-measure.js';
import { hasSwimlaneLine } from '../../../tests/oracle/svg-conformance/swimlane-census.js';

const REPO = join(import.meta.dirname, '../../..');
const CACHE = join(REPO, 'test-results/dot-cache/activity');
const GOLDENS = join(REPO, 'oracle/goldens/svg-activity');
const LEDGER = join(REPO, 'tests/oracle/svg-conformance/unknown-ledger');
const write = process.argv.includes('--write');

interface Row {
  type: string;
  slug: string;
  status: string;
  [k: string]: unknown;
}
interface Baseline {
  fixtures: Row[];
  [k: string]: unknown;
}

const JAR_ERROR_REASON = 'golden is a jar error page (PSystemError.java:148-155 / ReportLog.java:103-108)';
const SEED_REASON = 'seeded by ogc-T6; promotion pass measures it';

function ledgerReasons(): Map<string, string> {
  const out = new Map<string, string>();
  for (const f of readdirSync(LEDGER).filter((n) => n.endsWith('.json')).sort()) {
    const frag = JSON.parse(readFileSync(join(LEDGER, f), 'utf8')) as { rows: { slug: string; reason: string }[] };
    for (const r of frag.rows) out.set(r.slug, r.reason);
  }
  return out;
}

const today = new Date().toISOString().slice(0, 10);
const commit = execFileSync('git', ['rev-parse', '--short=8', 'HEAD'], { encoding: 'utf8' }).trim();
const reasons = ledgerReasons();
const diff = JSON.parse(readFileSync(join(GOLDENS, 'diff-baseline.json'), 'utf8')) as Baseline;
const listed = new Set(diff.fixtures.map((f) => f.slug));
const slugs = readdirSync(CACHE)
  .filter((s) => existsSync(join(CACHE, s, 'in.svg')) && !listed.has(s))
  .sort();

function seedRow(slug: string, dated: boolean, withDiffCount: boolean): Row {
  const jarError = isJarErrorPage(readHead(join(CACHE, slug, 'in.svg')));
  const status = jarError ? 'jar-error' : 'error';
  const reason = jarError ? JAR_ERROR_REASON : (reasons.get(slug) ?? SEED_REASON);
  const row: Row = { type: 'activity', slug, status };
  if (withDiffCount) row['diffCount'] = null;
  row['reason'] = reason;
  if (dated) {
    row['measuredAt'] = today;
    row['measuredAgainstCommit'] = commit;
  }
  return row;
}

function insertSorted(fixtures: Row[], rows: Row[]): Row[] {
  return [...fixtures, ...rows].sort((a, b) => (a.slug < b.slug ? -1 : a.slug > b.slug ? 1 : 0));
}

const files: { file: string; dated: boolean; diffCount: boolean; filter: (slug: string) => boolean }[] = [
  { file: 'diff-baseline.json', dated: true, diffCount: true, filter: () => true },
  { file: 'style-baseline.json', dated: true, diffCount: false, filter: () => true },
  { file: 'text-baseline.json', dated: true, diffCount: false, filter: () => true },
  {
    file: 'swimlane-baseline.json',
    dated: false,
    diffCount: false,
    filter: (slug) => hasSwimlaneLine(readFileSync(join(CACHE, slug, 'in.puml'), 'utf8')),
  },
];

for (const f of files) {
  const path = join(GOLDENS, f.file);
  const data = JSON.parse(readFileSync(path, 'utf8')) as Baseline;
  const have = new Set(data.fixtures.map((r) => r.slug));
  const rows = slugs.filter((s) => f.filter(s) && !have.has(s)).map((s) => seedRow(s, f.dated, f.diffCount));
  const jarErrors = rows.filter((r) => r.status === 'jar-error').length;
  const ledgered = rows.filter((r) => r['reason'] !== SEED_REASON && r.status === 'error').length;
  console.log(`${f.file}: +${rows.length} (jar-error ${jarErrors}, error ${rows.length - jarErrors}, of which ledgered ${ledgered})`);
  if (write && rows.length > 0) {
    data.fixtures = insertSorted(data.fixtures, rows);
    writeFileSync(path, `${JSON.stringify(data, null, 2)}\n`);
  }
}
if (!write) console.log('dry run: pass --write to seed');
