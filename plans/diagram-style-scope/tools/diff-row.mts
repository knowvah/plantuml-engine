/** dss T0b: measure diagram-style-scope rows.
 *
 *  Usage (from the repo root):
 *    npx tsx plans/diagram-style-scope/tools/diff-row.mts <engine>__<group>-<case>
 *    npx tsx plans/diagram-style-scope/tools/diff-row.mts --all [--json <out>]
 *
 *  Single row: prints diff count, conformant, and the first 10 diffs.
 *  `--all`: one line per row; `--json <out>` also writes `{ rows: { <row>: { conformant, diffCount } } }`
 *  (the pin's shape). Reuses `tests/oracle/svg-conformance/diagram-style-scope.ts`. */
import { writeFileSync } from 'node:fs';
import {
  firstScopeDiffs,
  listScopeRows,
  measureScopeRow,
  type ScopeRow,
} from '../../../tests/oracle/svg-conformance/diagram-style-scope.js';

const FIRST_DIFFS = 10;

const args = process.argv.slice(2);
const jsonIdx = args.indexOf('--json');
const jsonOut = jsonIdx >= 0 ? args[jsonIdx + 1] : undefined;

if (args.includes('--all')) {
  const rows: Record<string, ScopeRow> = {};
  for (const row of listScopeRows()) {
    const m = measureScopeRow(row);
    rows[row] = m;
    console.log(`${row}\tconformant=${String(m.conformant)}\tdiffCount=${String(m.diffCount)}`);
  }
  if (jsonOut !== undefined) writeFileSync(jsonOut, JSON.stringify({ rows }, null, 2) + '\n');
} else {
  const row = args.find((a) => !a.startsWith('--'));
  if (row === undefined || !listScopeRows().includes(row)) {
    console.error('usage: diff-row.mts <engine>__<group>-<case> | --all [--json <out>]');
    process.exit(2);
  }
  const m = measureScopeRow(row);
  console.log(`${row}: diffCount=${String(m.diffCount)} conformant=${String(m.conformant)}`);
  for (const line of firstScopeDiffs(row, FIRST_DIFFS)) console.log(`  ${line}`);
}
