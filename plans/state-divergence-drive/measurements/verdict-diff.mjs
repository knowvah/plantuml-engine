// Compare survey files in a directory against a git ref.
// Usage: node verdict-diff.mjs <base-ref> [dir]   (default dir: the committed path)
// Exit 1 on a row that left conformant, or any timeout/errored verdict.
import { execFileSync } from 'node:child_process';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const TRACKED_DIR = 'tests/oracle/svg-conformance';
const SURVEY_FILE = /^parity(-[a-z0-9]+)?\.json$/;
const FAULT_VERDICTS = new Set(['timeout', 'errored']);

const [base, dir = TRACKED_DIR] = process.argv.slice(2);
if (base === undefined) throw new Error('usage: verdict-diff.mjs <base-ref> [dir]');

function baseRows(file) {
  try {
    const text = execFileSync('git', ['show', `${base}:${TRACKED_DIR}/${file}`], {
      encoding: 'utf8',
      maxBuffer: 1 << 28,
      stdio: ['ignore', 'pipe', 'ignore'],
    });
    return JSON.parse(text).fixtures;
  } catch {
    return [];
  }
}

let lost = 0;
let faults = 0;
for (const file of readdirSync(dir).filter((f) => SURVEY_FILE.test(f)).sort()) {
  const rows = JSON.parse(readFileSync(join(dir, file), 'utf8')).fixtures;
  const before = new Map(baseRows(file).map((r) => [`${r.type}/${r.slug}`, r.verdict]));
  const moved = [];
  for (const r of rows) {
    const old = before.get(`${r.type}/${r.slug}`);
    if (FAULT_VERDICTS.has(r.verdict)) faults++;
    if (old === undefined || old === r.verdict) continue;
    if (old === 'conformant') lost++;
    moved.push(`${r.slug}: ${old} -> ${r.verdict}`);
  }
  if (moved.length > 0) console.log(`${file}\n  ${moved.join('\n  ')}`);
}
console.log(`lost ${lost}, timeout or errored ${faults}`);
process.exit(lost + faults > 0 ? 1 : 0);
