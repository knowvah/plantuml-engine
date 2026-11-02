/** dbp T0b: measure document-background rows.
 *
 *  Usage (from the repo root):
 *    npx tsx plans/document-background-paint/tools/diff-row.mts <engine>-<case>
 *    npx tsx plans/document-background-paint/tools/diff-row.mts --all [--json <out>]
 *
 *  Single row: prints diff count, conformant, and the first 10 diffs.
 *  `--all`: one line per row; `--json <out>` also writes `{ rows: { <row>: { conformant, diffCount } } }`
 *  (the pin's shape). Reuses `tests/oracle/svg-conformance/document-background.ts`. */
import { writeFileSync } from 'node:fs';
import {
  firstDbgDiffs,
  listDbgRows,
  measureDbgRow,
  type DbgRow,
} from '../../../tests/oracle/svg-conformance/document-background.js';

const FIRST_DIFFS = 10;

const args = process.argv.slice(2);
const jsonIdx = args.indexOf('--json');
const jsonOut = jsonIdx >= 0 ? args[jsonIdx + 1] : undefined;

if (args.includes('--all')) {
  const rows: Record<string, DbgRow> = {};
  for (const row of listDbgRows()) {
    rows[row] = measureDbgRow(row);
    console.log(`${row}\tconformant=${String(rows[row].conformant)}\tdiffCount=${String(rows[row].diffCount)}`);
  }
  if (jsonOut !== undefined) writeFileSync(jsonOut, JSON.stringify({ rows }, null, 2) + '\n');
} else {
  const row = args.find((a) => !a.startsWith('--'));
  if (row === undefined || !listDbgRows().includes(row)) {
    console.error('usage: diff-row.mts <engine>-<case> | --all [--json <out>]');
    process.exit(2);
  }
  const m = measureDbgRow(row);
  console.log(`${row}: diffCount=${String(m.diffCount)} conformant=${String(m.conformant)}`);
  for (const line of firstDbgDiffs(row, FIRST_DIFFS)) console.log(`  ${line}`);
}
